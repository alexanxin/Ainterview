import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/lib/logger";
import { validateInterviewContext, sanitizeInput } from "@/lib/validations";
import {
  validateAndSanitizeJobPosting,
  validateAndSanitizeUserCV,
  validateAndSanitizeUserCVForAnalysis,
  validateAndSanitizeUserAnswer,
} from "@/lib/validations-enhanced";
import { getX402PaymentResponse } from "@/lib/x402-utils";
import {
  checkUsage,
  checkUsageAfterProcessing,
  recordUsageWithDatabase,
  UsageCheckResult,
} from "@/lib/usage-and-payment";

interface InterviewContext {
  jobPosting: string;
  companyInfo: string;
  userCv: string;
}

interface QuestionResponse {
  question: string;
  userAnswer: string;
  aiFeedback: string;
  improvementSuggestions: string[];
  rating?: number;
}

interface ApiResult {
  remainingQuota?: number;
  quotaInfo?: {
    used: number;
    total: number;
    resetTime: string;
  };
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  try {
    Logger.info("Received Gemini API request", {
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
    });

    const {
      action,
      context,
      question,
      answer,
      numQuestions = 5,
      userId,
      questions,
      answers,
    } = await req.json();

    // Validate required fields
    if (!action) {
      Logger.error("Action is required");
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // Validate and sanitize context if provided
    // Skip validation for analyzeCV and analyzeJobFit which have different context structures
    if (context && action !== "analyzeCV" && action !== "analyzeJobFit") {
      try {
        validateInterviewContext(context);
      } catch (validationError) {
        Logger.error("Invalid context provided", { validationError, userId });
        return NextResponse.json(
          { error: "Invalid context provided" },
          { status: 400 }
        );
      }
    }

    // Determine the cost based on the action and parameters
    let cost = 1; // Default cost

    // Charge for different actions appropriately
    // For interview flows, only charge for feedback/analysis, not for question generation
    if (action === "generateFlow") {
      // Don't charge for generating the flow of questions
      cost = 0; // No cost for question generation
    } else if (action === "analyzeAnswer") {
      // Charge for individual answer analysis
      cost = 1; // Charge 1 credit per answer analysis
    } else if (action === "batchEvaluate") {
      // Charge for batch evaluation based on number of answers
      cost = answers ? answers.length : 1; // Charge per answer in batch
    } else if (action === "generateQuestion") {
      // Don't charge for generating a single question
      cost = 0; // No cost for question generation
    } else if (action === "generateSimilarQuestion") {
      // Don't charge for generating similar questions
      cost = 0; // No cost for question generation
    } else if (action === "analyzeCV") {
      // Charge for CV quality analysis
      cost = 1; // 1 credit for CV analysis
    } else if (action === "analyzeJobFit") {
      // Charge for job fit analysis
      cost = 1; // 1 credit for job fit analysis
    } else {
      // Default cost for other actions
      cost = 1;
    }

    Logger.info("Performing usage check", {
      userId,
      action,
      cost,
      hasRequest: !!req,
    });

    // Check if user has sufficient credits or if payment is provided
    const usageCheck = await checkUsage(
      userId || "anonymous",
      action,
      req,
      cost
    );

    Logger.info("Usage check completed", {
      userId,
      action,
      allowed: usageCheck.allowed,
      creditsAvailable: usageCheck.creditsAvailable,
      cost: usageCheck.cost,
      needsPayment: !!usageCheck.paymentRequired,
    });

    if (!usageCheck.allowed) {
      Logger.warn("User has insufficient credits", {
        userId,
        action,
        creditsAvailable: usageCheck.creditsAvailable,
        cost: usageCheck.cost,
      });

      Logger.warn("User has insufficient credits, preparing payment response", {
        userId,
        action,
        creditsAvailable: usageCheck.creditsAvailable,
        cost: usageCheck.cost,
        paymentRequired: usageCheck.paymentRequired,
      });

      // Get x402 payment response with standardized format
      const x402Response = getX402PaymentResponse(usageCheck.paymentRequired!);

      // Return HTTP 402 with detailed x402 protocol information
      const response = NextResponse.json(
        {
          error: "Payment Required",
          needsPayment: true,
          creditsAvailable: usageCheck.creditsAvailable,
          cost: usageCheck.cost,
          message:
            "Insufficient credits. Please purchase more to continue using AI services.",
          action: action, // Include the action that was requested
          question: question, // Include the question if available for context
          answer: answer, // Include the answer if available for context
          paymentRequired: usageCheck.paymentRequired, // Include payment details
          paymentOptions: {
            url: `${
              process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
            }/payment`,
            supportedTokens: ["USDC", "USDT", "CASH"],
            blockchain: "solana",
          },
          ...x402Response.body, // Include the x402 standard response body
        },
        {
          status: x402Response.status, // Use the standard 402 status
          headers: {
            // Add x402-compliant headers
            "X-Payment-Required": "true",
            "X-Payment-Operation": action,
            "X402-Version": "1.0",
            "X-Payment-Amount":
              usageCheck.paymentRequired?.amount?.toString() || "0.05",
            "X-Payment-Currency": usageCheck.paymentRequired?.currency || "USD",
            "X-Payment-Description": `AI ${action} service - ${usageCheck.cost} credits`,
            "X-Payment-Timeout": "300", // 5 minutes
            "X-Payment-Recipient":
              process.env.NEXT_PUBLIC_PAYMENT_WALLET || "YOUR_WALLET_ADDRESS",
            "X-Payment-Network": "solana",
            "X-Payment-Tokens": "USDC,USDT,CASH",
            "X-Payment-URL": `${
              process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
            }/payment?operation=${action}&amount=${usageCheck.cost}`,
            "X-Payment-Metadata": JSON.stringify({
              action,
              cost: usageCheck.cost,
              creditsAvailable: usageCheck.creditsAvailable,
              userId: userId || "anonymous",
              timestamp: new Date().toISOString(),
            }),
          },
        }
      );

      return response;
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      Logger.warn(
        "GEMINI_API_KEY environment variable is not set. Using mock responses.",
        { userId, action }
      );

      // For testing purposes, use mock responses when API key is not available
      switch (action) {
        case "generateQuestion":
          return NextResponse.json({
            question:
              "Can you tell me about your experience with React and TypeScript?",
            remainingQuota: -1, // Unlimited for free interview
            quotaInfo: {
              used: 0,
              total: 1, // One free interview
              resetTime: new Date(
                new Date().setHours(24, 0, 0, 0)
              ).toISOString(),
            },
          });

        case "generateFlow":
          // Generate mock questions based on the requested number
          const mockQuestions = Array.from(
            { length: numQuestions },
            (_, i) =>
              `Mock question ${
                i + 1
              } for the interview based on the job posting.`
          );
          return NextResponse.json({
            questions: mockQuestions,
            remainingQuota: -1, // Unlimited for free interview
            quotaInfo: {
              used: 0,
              total: 1, // One free interview
              resetTime: new Date(
                new Date().setHours(24, 0, 0, 0)
              ).toISOString(),
            },
          });

        case "analyzeAnswer":
          return NextResponse.json({
            question,
            userAnswer: answer,
            aiFeedback:
              "Your answer shows good understanding of React fundamentals. Consider adding more specific examples of performance optimization techniques you have implemented.",
            improvementSuggestions: [
              "Provide specific examples of performance optimizations you have implemented",
              "Mention specific tools or libraries you have used for optimization",
              "Explain the impact of your optimizations on application performance",
            ],
            rating: 7,
            remainingQuota: -1, // Unlimited for free interview
            quotaInfo: {
              used: 0,
              total: 1, // One free interview
              resetTime: new Date(
                new Date().setHours(24, 0, 0, 0)
              ).toISOString(),
            },
          });

        case "batchEvaluate":
          // Mock response for batch evaluation
          if (questions && answers && questions.length === answers.length) {
            const evaluations = questions.map((q: string, i: number) => ({
              question: sanitizeInput(q),
              userAnswer: sanitizeInput(answers[i]),
              aiFeedback: `Feedback for answer to question: ${sanitizeInput(
                q
              )}`,
              improvementSuggestions: [
                "Consider adding more specific examples",
                "Relate your experience to the job requirements",
              ],
              rating: 7,
            }));
            return NextResponse.json({
              evaluations,
              remainingQuota: -1,
              quotaInfo: {
                used: 0,
                total: 1, // One free interview
                resetTime: new Date(
                  new Date().setHours(24, 0, 0, 0)
                ).toISOString(),
              },
            });
          } else {
            return NextResponse.json(
              {
                error:
                  "Questions and answers arrays must be provided and of equal length",
              },
              { status: 400 }
            );
          }

        case "generateSimilarQuestion":
          return NextResponse.json({
            question:
              "How would you approach a similar challenge in a different context?",
            remainingQuota: -1, // Unlimited for free interview
            quotaInfo: {
              used: 0,
              total: 1, // One free interview
              resetTime: new Date(
                new Date().setHours(24, 0, 0, 0)
              ).toISOString(),
            },
          });

        case "analyzeCV":
          return NextResponse.json({
            aiFeedback:
              "Your CV presents solid experience and relevant skills. The structure is clear and professional. Consider quantifying achievements with specific metrics and outcomes to make your experience more impactful. Adding more technical details and specific project contributions would strengthen your profile.",
            improvementSuggestions: [
              "Add specific metrics and quantifiable achievements to your experience section",
              "Include more technical details about projects and tools used",
              "Consider adding a summary section highlighting your key strengths",
              "Ensure your skills section uses industry-standard terms and certifications",
            ],
            rating: 7,
            remainingQuota: -1, // Unlimited for free interview
            quotaInfo: {
              used: 0,
              total: 1, // One free interview
              resetTime: new Date(
                new Date().setHours(24, 0, 0, 0)
              ).toISOString(),
            },
          });

        case "analyzeJobFit":
          return NextResponse.json({
            aiFeedback:
              "Based on your CV and experience, you appear to be a good fit for this position. Your technical background aligns well with the role requirements. However, there may be some gaps in specific skills or experience that could benefit from highlighting transferable skills or additional training.",
            improvementSuggestions: [
              "Highlight relevant transferable skills from your background",
              "Consider gaining experience with specific tools mentioned in the job posting",
              "Emphasize leadership and problem-solving abilities",
              "Focus on achievements that demonstrate similar challenges overcome",
            ],
            rating: 8,
            remainingQuota: -1, // Unlimited for free interview
            quotaInfo: {
              used: 0,
              total: 1, // One free interview
              resetTime: new Date(
                new Date().setHours(24, 0, 0, 0)
              ).toISOString(),
            },
          });

        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          );
      }
    }

    let ai, model;
    try {
      ai = new GoogleGenAI({ apiKey: API_KEY });
      model = ai.models;
    } catch (error) {
      Logger.error("Error initializing Gemini AI:", { error, userId, action });
      return NextResponse.json(
        { error: "Failed to initialize AI service" },
        { status: 500 }
      );
    }

    let result: ApiResult;

    switch (action) {
      case "generateQuestion":
        if (!context) {
          Logger.error("Context is required for generating a question", {
            userId,
            action,
          });
          return NextResponse.json(
            { error: "Context is required for generating a question" },
            { status: 400 }
          );
        }

        // Validate and sanitize all context inputs
        let sanitizedContext: InterviewContext;
        try {
          const typedContext = context as InterviewContext;
          const jobPostingResult = validateAndSanitizeJobPosting(
            typedContext.jobPosting
          );
          const companyInfoResult = validateAndSanitizeJobPosting(
            typedContext.companyInfo
          );
          const userCvResult = validateAndSanitizeUserCV(
            typedContext.userCv || ""
          );

          if (jobPostingResult.threatsDetected.length > 0) {
            Logger.warn("Threats detected in job posting:", {
              threats: jobPostingResult.threatsDetected,
              userId,
            });
          }

          if (companyInfoResult.threatsDetected.length > 0) {
            Logger.warn("Threats detected in company info:", {
              threats: companyInfoResult.threatsDetected,
              userId,
            });
          }

          sanitizedContext = {
            jobPosting: jobPostingResult.sanitized,
            companyInfo: companyInfoResult.sanitized,
            userCv: userCvResult.sanitized,
          };
        } catch (validationError) {
          Logger.error("Context validation failed:", {
            validationError,
            userId,
          });
          return NextResponse.json(
            { error: "Invalid or unsafe context data provided" },
            { status: 400 }
          );
        }

        const questionPrompt = `
          Based on the following job posting and company information, generate a relevant interview question:
          
          Job Posting: ${sanitizedContext.jobPosting}
          
          Company Info: ${sanitizedContext.companyInfo}
          
          Please generate a single, specific interview question that would be relevant for this position.
          Make sure the question is specific to the role and company.
        `;

        try {
          const questionResult = await model.generateContent({
            model: "gemini-2.0-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text:
                      "You are an experienced HR professional and interviewer. Your role is to generate relevant, job-specific interview questions based on job postings and company information. Focus on technical skills, cultural fit, experience, problem-solving, and career motivation. Ask specific, targeted questions that would genuinely be asked in a real interview for the position.\n\n" +
                      questionPrompt,
                  },
                ],
              },
            ],
          });
          const questionText = questionResult.text || "";

          // Clean up the response to extract just the question
          const cleanedQuestion = questionText
            .trim()
            .replace(/^["']|["']$/g, "");

          result = { question: cleanedQuestion };
        } catch (geminiError) {
          Logger.error("Error generating question with Gemini:", {
            error:
              geminiError instanceof Error
                ? geminiError.message
                : String(geminiError),
            userId,
            action,
          });

          // Check if this is a rate limit error
          if (
            geminiError instanceof Error &&
            geminiError.message.includes("Rate limit")
          ) {
            return NextResponse.json(
              {
                error: "Rate limit exceeded",
                message: "Too many requests. Please try again later.",
                retryAfter: 60, // Suggest retry after 60 seconds
              },
              { status: 429 }
            );
          }

          return NextResponse.json(
            { error: "Failed to generate interview question" },
            { status: 500 }
          );
        }
        break;

      case "generateFlow":
        if (!context) {
          Logger.error("Context is required for generating interview flow", {
            userId,
            action,
          });
          return NextResponse.json(
            { error: "Context is required for generating interview flow" },
            { status: 400 }
          );
        }

        const typedContextFlow = context as InterviewContext;
        if (!typedContextFlow.jobPosting || !typedContextFlow.companyInfo) {
          Logger.error(
            "Job posting and company info required for generating interview flow",
            { userId, action }
          );
          return NextResponse.json(
            {
              error:
                "Job posting and company info are required for generating interview flow",
            },
            { status: 400 }
          );
        }

        const flowPrompt = `
          Based on the following job posting and company information, generate ${numQuestions} interview questions for the position.
          
          Job Posting: ${sanitizeInput(typedContextFlow.jobPosting)}
          
          Company Info: ${sanitizeInput(typedContextFlow.companyInfo)}
          
          Please provide the questions as a numbered list, one per line, focusing on:
          1. Technical skills relevant to the role
          2. Cultural fit with the company
          3. Experience related to the requirements
          4. Problem-solving scenarios
          5. Career goals and motivation
        `;

        try {
          const flowResult = await model.generateContent({
            model: "gemini-2.0-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text:
                      "You are an experienced HR professional and interviewer. Your role is to generate relevant, job-specific interview questions based on job postings and company information. Focus on technical skills, cultural fit, experience, problem-solving, and career motivation. Ask specific, targeted questions that would genuinely be asked in a real interview for the position. Provide questions as a numbered list, one per line.\n\n" +
                      flowPrompt,
                  },
                ],
              },
            ],
          });
          const flowText = flowResult.text || "";

          // Extract questions from the response more safely
          let flowQuestions: string[] = [];
          try {
            // Split by newlines and clean up the format
            const lines = flowText
              .split("\n")
              .map((line) => line.replace(/^\d+\.\s*/, "").trim()) // Remove numbered prefixes like "1. ", "2. ", etc.
              .filter((line) => line.length > 0); // Keep only non-empty lines

            // Identify potential questions using more general criteria
            flowQuestions = lines
              .filter(
                (line) =>
                  // Lines ending with question mark are most likely questions
                  line.includes("?") ||
                  // Common interview question starters
                  line.toLowerCase().startsWith("tell me") ||
                  line.toLowerCase().startsWith("explain") ||
                  line.toLowerCase().startsWith("describe") ||
                  line.toLowerCase().startsWith("how") ||
                  line.toLowerCase().startsWith("why") ||
                  line.toLowerCase().startsWith("what") ||
                  line.toLowerCase().startsWith("when") ||
                  line.toLowerCase().startsWith("where") ||
                  // Behavioral question patterns
                  line.toLowerCase().includes("describe a time") ||
                  line.toLowerCase().includes("give me an example") ||
                  line.toLowerCase().includes("tell me about a time") ||
                  // Experience/qualification patterns
                  line.toLowerCase().includes("experience with") ||
                  line.toLowerCase().includes("familiar with") ||
                  line.toLowerCase().includes("worked with") ||
                  line.toLowerCase().includes("used") ||
                  line.toLowerCase().includes("your experience") ||
                  line.toLowerCase().includes("your background") ||
                  // Other question patterns that are typically questions
                  line.toLowerCase().includes("do you") ||
                  line.toLowerCase().includes("did you") ||
                  line.toLowerCase().includes("can you") ||
                  line.toLowerCase().includes("have you")
              )
              .slice(0, numQuestions); // Limit to the requested number of questions

            // If we still don't have enough questions, use all non-empty lines as fallback
            if (flowQuestions.length < numQuestions) {
              flowQuestions = lines.slice(0, numQuestions);
            }
          } catch (extractionError) {
            Logger.error("Error extracting questions:", { extractionError });
            // Fallback to basic extraction - just split and take first numQuestions non-empty lines
            flowQuestions = flowText
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line.length > 0)
              .slice(0, numQuestions);
          }

          result = { questions: flowQuestions };
        } catch (geminiError) {
          Logger.error("Error generating flow with Gemini:", {
            error:
              geminiError instanceof Error
                ? geminiError.message
                : String(geminiError),
            userId,
            action,
          });

          // Check if this is a rate limit error
          if (
            geminiError instanceof Error &&
            geminiError.message.includes("Rate limit")
          ) {
            return NextResponse.json(
              {
                error: "Rate limit exceeded",
                message: "Too many requests. Please try again later.",
                retryAfter: 60, // Suggest retry after 60 seconds
              },
              { status: 429 }
            );
          }

          return NextResponse.json(
            { error: "Failed to generate interview flow" },
            { status: 500 }
          );
        }
        break;

      case "analyzeAnswer":
        if (!context || !question || !answer) {
          Logger.error(
            "Context, question, and answer are required for analysis",
            { userId, action }
          );
          return NextResponse.json(
            {
              error: "Context, question, and answer are required for analysis",
            },
            { status: 400 }
          );
        }

        const typedContextAnalysis = context as InterviewContext;
        if (
          !typedContextAnalysis.jobPosting ||
          !typedContextAnalysis.companyInfo ||
          !typedContextAnalysis.userCv
        ) {
          Logger.error(
            "Job posting, company info, and user CV are required for analyzing an answer",
            { userId, action }
          );
          return NextResponse.json(
            {
              error:
                "Job posting, company info, and user CV are required for analyzing an answer",
            },
            { status: 400 }
          );
        }

        const analysisPrompt = `
          Act as an experienced interviewer. Analyze the following answer to the interview question based on the job posting and company information.
          
          Job Posting: ${sanitizeInput(typedContextAnalysis.jobPosting)}
          
          Company Info: ${sanitizeInput(typedContextAnalysis.companyInfo)}
          
          User CV: ${sanitizeInput(typedContextAnalysis.userCv)}
          
          Question: ${sanitizeInput(question)}
          
          Answer: ${sanitizeInput(answer)}
          
          Provide:
          1. Constructive feedback on the answer
          2. 2-3 specific suggestions for improvement
          3. Rate how well the answer aligns with the job requirements (1-10)
          
          Format your response as:
          FEEDBACK: [Your feedback here]
          SUGGESTIONS: [Suggestion 1]; [Suggestion 2]; [Suggestion 3]
          RATING: [Number 1-10]
        `;

        try {
          const analysisResult = await model.generateContent({
            model: "gemini-2.0-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text:
                      "You are an experienced interviewer and HR professional. Your role is to provide constructive, specific feedback on interview answers. Evaluate responses based on how well they align with job requirements and company expectations. Be supportive but honest in your feedback, focusing on actionable improvements. Rate answers from 1-10 based on relevance, specificity, and alignment with the role.\n\n" +
                      analysisPrompt,
                  },
                ],
              },
            ],
          });
          const analysisText = analysisResult.text || "";

          // Parse the response more safely
          let feedback = "No feedback provided";
          let suggestions = ["No suggestions provided"];
          let rating = 5;

          try {
            const feedbackMatch = analysisText.match(
              /FEEDBACK:\s*(.*?)(?=SUGGESTIONS:|$|RATING:)/s
            );
            const suggestionsMatch = analysisText.match(
              /SUGGESTIONS:\s*(.*?)(?=RATING:|$)/s
            );
            const ratingMatch = analysisText.match(/RATING:\s*(\d+)/);

            feedback = feedbackMatch
              ? feedbackMatch[1].trim()
              : "No feedback provided";
            suggestions = suggestionsMatch
              ? suggestionsMatch[1]
                  .split(";")
                  .map((s) => s.trim())
                  .filter((s) => s)
              : ["No suggestions provided"];
            rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 5;

            // Ensure rating is within valid range (1-10)
            rating = Math.min(10, Math.max(1, rating || 5));
          } catch (parseError) {
            Logger.error("Error parsing AI response:", { parseError });
            feedback = "Feedback available but could not be parsed properly";
            suggestions = [
              "Please review your answer with the job requirements",
            ];
          }

          result = {
            question,
            userAnswer: answer,
            aiFeedback: feedback,
            improvementSuggestions: suggestions,
            rating,
          };
        } catch (geminiError) {
          Logger.error("Error analyzing answer with Gemini:", {
            error:
              geminiError instanceof Error
                ? geminiError.message
                : String(geminiError),
            userId,
            action,
          });

          // Check if this is a rate limit error
          if (
            geminiError instanceof Error &&
            geminiError.message.includes("Rate limit")
          ) {
            return NextResponse.json(
              {
                error: "Rate limit exceeded",
                message: "Too many requests. Please try again later.",
              },
              { status: 429 }
            );
          }

          return NextResponse.json(
            { error: "Failed to analyze answer" },
            { status: 500 }
          );
        }
        break;

      case "batchEvaluate":
        if (!context || !questions || !answers) {
          Logger.error(
            "Context, questions, and answers are required for batch evaluation",
            { userId, action }
          );
          return NextResponse.json(
            {
              error:
                "Context, questions, and answers are required for batch evaluation",
            },
            { status: 400 }
          );
        }

        if (questions.length !== answers.length) {
          Logger.error("Questions and answers arrays must be of equal length", {
            userId,
            action,
          });
          return NextResponse.json(
            {
              error: "Questions and answers arrays must be of equal length",
            },
            { status: 400 }
          );
        }

        const typedContextBatch = context as InterviewContext;
        if (
          !typedContextBatch.jobPosting ||
          !typedContextBatch.companyInfo ||
          !typedContextBatch.userCv
        ) {
          Logger.error(
            "Job posting, company info, and user CV are required for batch evaluation",
            { userId, action }
          );
          return NextResponse.json(
            {
              error:
                "Job posting, company info, and user CV are required for batch evaluation",
            },
            { status: 400 }
          );
        }

        // Create a comprehensive prompt for batch evaluation
        const batchPrompt = `
          Act as an experienced interviewer. Analyze the following answers to the interview questions based on the job posting and company information.
          
          Job Posting: ${sanitizeInput(typedContextBatch.jobPosting)}
          
          Company Info: ${sanitizeInput(typedContextBatch.companyInfo)}
          
          User CV: ${sanitizeInput(typedContextBatch.userCv)}
          
          Evaluate each question-answer pair and provide feedback:
          
          ${questions
            .map(
              (q: string, i: number) =>
                `Question ${i + 1}: ${sanitizeInput(q)}\nAnswer ${
                  i + 1
                }: ${sanitizeInput(answers[i])}\n`
            )
            .join("\n")}
          
          For each question-answer pair, provide:
          1. Constructive feedback on the answer
          2. 2-3 specific suggestions for improvement
          3. Rate how well the answer aligns with the job requirements (1-10)
          
          Format your response as:
          Q1_FEEDBACK: [Your feedback for question 1 here]
          Q1_SUGGESTIONS: [Suggestion 1]; [Suggestion 2]; [Suggestion 3]
          Q1_RATING: [Number 1-10]
          
          Q2_FEEDBACK: [Your feedback for question 2 here]
          Q2_SUGGESTIONS: [Suggestion 1]; [Suggestion 2]; [Suggestion 3]
          Q2_RATING: [Number 1-10]
          
          ${questions
            .map(
              (_: string, i: number) =>
                `Q${i + 1}_FEEDBACK: [Your feedback for question ${i + 1} here]
            Q${
              i + 1
            }_SUGGESTIONS: [Suggestion 1]; [Suggestion 2]; [Suggestion 3]
            Q${i + 1}_RATING: [Number 1-10]`
            )
            .join("\n\n")}
        `;

        try {
          const batchResult = await model.generateContent({
            model: "gemini-2.0-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text:
                      "You are an experienced interviewer and HR professional. Your role is to provide constructive, specific feedback on multiple interview answers. Evaluate each response based on how well they align with job requirements and company expectations. Be supportive but honest in your feedback, focusing on actionable improvements. Rate answers from 1-10 based on relevance, specificity, and alignment with the role. Format your response according to the specified format with Q1_FEEDBACK, Q1_SUGGESTIONS, Q1_RATING, etc.\n\n" +
                      batchPrompt,
                  },
                ],
              },
            ],
          });
          const batchText = batchResult.text || "";

          // Parse the batch response
          const evaluations: QuestionResponse[] = [];

          for (let i = 0; i < questions.length; i++) {
            const questionIndex = i + 1;

            // Extract feedback
            const feedbackMatch = batchText.match(
              new RegExp(
                `Q${questionIndex}_FEEDBACK:\\s*(.*?)(?=Q${
                  questionIndex + 1
                }_FEEDBACK:|$|Q${questionIndex}_SUGGESTIONS:)`,
                "s"
              )
            );

            // Extract suggestions
            const suggestionsMatch = batchText.match(
              new RegExp(
                `Q${questionIndex}_SUGGESTIONS:\\s*(.*?)(?=Q${
                  questionIndex + 1
                }_SUGGESTIONS:|$|Q${questionIndex}_RATING:)`,
                "s"
              )
            );

            // Extract rating
            const ratingMatch = batchText.match(
              new RegExp(`Q${questionIndex}_RATING:\\s*(\\d+)`)
            );

            const feedback = feedbackMatch
              ? feedbackMatch[1].trim()
              : "No feedback provided";

            const suggestions = suggestionsMatch
              ? suggestionsMatch[1]
                  .split(";")
                  .map((s) => s.trim())
                  .filter((s) => s)
              : ["No suggestions provided"];

            const rating = Math.min(
              10,
              Math.max(1, ratingMatch ? parseInt(ratingMatch[1], 10) : 5)
            );

            evaluations.push({
              question: questions[i],
              userAnswer: answers[i],
              aiFeedback: feedback,
              improvementSuggestions: suggestions,
              rating,
            });
          }

          result = { evaluations };
        } catch (geminiError) {
          Logger.error("Error with batch evaluation using Gemini:", {
            error:
              geminiError instanceof Error
                ? geminiError.message
                : String(geminiError),
            userId,
            action,
          });

          // Check if this is a rate limit error
          if (
            geminiError instanceof Error &&
            geminiError.message.includes("Rate limit")
          ) {
            return NextResponse.json(
              {
                error: "Rate limit exceeded",
                message: "Too many requests. Please try again later.",
                retryAfter: 60, // Suggest retry after 60 seconds
              },
              { status: 429 }
            );
          }

          return NextResponse.json(
            { error: "Failed to perform batch evaluation" },
            { status: 500 }
          );
        }
        break;

      case "generateSimilarQuestion":
        if (!context || !question) {
          Logger.error(
            "Context and original question are required for generating a similar question",
            { userId, action }
          );
          return NextResponse.json(
            {
              error:
                "Context and original question are required for generating a similar question",
            },
            { status: 400 }
          );
        }

        const typedContextSimilar = context as InterviewContext;
        if (
          !typedContextSimilar.jobPosting ||
          !typedContextSimilar.companyInfo
        ) {
          Logger.error(
            "Job posting and company info are required for generating a similar question",
            { userId, action }
          );
          return NextResponse.json(
            {
              error:
                "Job posting and company info are required for generating a similar question",
            },
            { status: 400 }
          );
        }

        const similarQuestionPrompt = `
          Based on the following job posting, company information, and the original interview question provided,
          generate a similar but different interview question that focuses on the same topic/skill area.
          
          Job Posting: ${sanitizeInput(typedContextSimilar.jobPosting)}
          
          Company Info: ${sanitizeInput(typedContextSimilar.companyInfo)}
          
          Original Question: ${sanitizeInput(question)}
          
          Please generate a single, specific interview question that is similar in nature to the original question
          but phrased differently or focuses on a related aspect of the same topic.
          Make sure the question is specific to the role and company.
        `;

        try {
          const similarQuestionResult = await model.generateContent({
            model: "gemini-2.0-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text:
                      "You are an experienced HR professional and interviewer. Your role is to generate relevant, job-specific interview questions similar to a given question but with different phrasing or focus. Focus on maintaining the same skill area or topic while changing the specific wording or angle. Ask specific, targeted questions that would genuinely be asked in a real interview for the position.\n\n" +
                      similarQuestionPrompt,
                  },
                ],
              },
            ],
          });
          const similarQuestionText = similarQuestionResult.text || "";

          // Clean up the response to extract just the question
          const cleanedSimilarQuestion = similarQuestionText
            .trim()
            .replace(/^["']|["']$/g, "");

          result = { question: cleanedSimilarQuestion };
        } catch (geminiError) {
          Logger.error("Error generating similar question with Gemini:", {
            error:
              geminiError instanceof Error
                ? geminiError.message
                : String(geminiError),
            userId,
            action,
          });

          // Check if this is a rate limit error
          if (
            geminiError instanceof Error &&
            geminiError.message.includes("Rate limit")
          ) {
            return NextResponse.json(
              {
                error: "Rate limit exceeded",
                message: "Too many requests. Please try again later.",
                retryAfter: 60, // Suggest retry after 60 seconds
              },
              { status: 429 }
            );
          }

          return NextResponse.json(
            { error: "Failed to generate similar interview question" },
            { status: 500 }
          );
        }
        break;

      case "analyzeCV":
        if (!context) {
          Logger.error("User profile data is required for CV analysis", {
            userId,
            action,
          });
          return NextResponse.json(
            { error: "User profile data is required for CV analysis" },
            { status: 400 }
          );
        }

        const typedContextCV = context as {
          bio?: string;
          experience?: string;
          education?: string;
          skills?: string;
        };

        // Combine all profile sections
        const fullCVText = [
          typedContextCV.bio || "",
          typedContextCV.experience || "",
          typedContextCV.education || "",
          typedContextCV.skills || "",
        ]
          .filter((section) => section.trim().length > 0)
          .join("\n\n");

        if (!fullCVText.trim()) {
          Logger.error("Empty CV provided for analysis", { userId, action });
          return NextResponse.json(
            {
              error:
                "Please complete your profile before requesting CV analysis",
            },
            { status: 400 }
          );
        }

        // Validate and sanitize the CV content
        let sanitizedCV: string;
        try {
          const cvValidationResult =
            validateAndSanitizeUserCVForAnalysis(fullCVText);
          if (cvValidationResult.threatsDetected.length > 0) {
            Logger.warn("Threats detected in CV:", {
              threats: cvValidationResult.threatsDetected,
              userId,
            });
          }
          sanitizedCV = cvValidationResult.sanitized;
        } catch (validationError) {
          Logger.error("CV validation failed:", {
            validationError,
            validationErrorMessage:
              validationError instanceof Error
                ? validationError.message
                : String(validationError),
            validationErrorStack:
              validationError instanceof Error
                ? validationError.stack
                : undefined,
            fullCVTextLength: fullCVText.length,
            contextKeys: Object.keys(typedContextCV),
            hasBio: !!typedContextCV.bio?.trim(),
            hasExperience: !!typedContextCV.experience?.trim(),
            hasEducation: !!typedContextCV.education?.trim(),
            hasSkills: !!typedContextCV.skills?.trim(),
            userId,
          });
          return NextResponse.json(
            { error: "Invalid CV content provided" },
            { status: 400 }
          );
        }

        const cvAnalysisPrompt = `
          Act as an experienced HR professional and career coach. Analyze the following CV/resume content and provide constructive feedback on its quality and effectiveness.

          CV Content:
          ${sanitizedCV}

          Provide:
          1. Overall assessment of CV quality and effectiveness (2-3 paragraphs)
          2. 4-6 specific, actionable suggestions for improvement
          3. A rating from 1-10 based on:

          RATING CRITERIA:
          10 - Exceptional CV: Comprehensive, error-free, ATS-friendly, perfectly tailored, quantifiable achievements, strong keywords
          9 - Excellent CV: Very strong with minor improvements needed, well-structured, relevant experience highlighted
          8 - Very Good CV: Solid foundation with several evident improvements needed, good structure but could be more impactful
          7 - Good CV: Adequate but missing key elements like quantifiable achievements or skills section refinement
          6 - Above Average: Basic structure present but significant improvements needed in content, clarity, or organization
          5 - Average: Meets basic requirements but needs substantial work on formatting, content relevance, and impact
          4 - Below Average: Serious issues with structure, content organization, or professional presentation
          3 - Poor: Major gaps in content, unclear presentation, or outdated format
          2 - Very Poor: Incomplete information, significant formatting issues, or inappropriate content
          1 - Unacceptable: Fundamentally flawed, no clear value proposition, or highly unprofessional

          Format your response exactly as:
          FEEDBACK: [Your 2-3 paragraph comprehensive assessment here]

          IMPROVEMENT SUGGESTIONS:
          1. [Specific actionable suggestion 1]
          2. [Specific actionable suggestion 2]
          3. [Specific actionable suggestion 3]
          4. [Specific actionable suggestion 4]
          5. [Specific actionable suggestion 5]
          6. [Specific actionable suggestion 6 - optional]

          CV QUALITY RATING: [X]/10

          Explain the rating briefly in 1-2 sentences.
        `;

        try {
          const cvAnalysisResult = await model.generateContent({
            model: "gemini-2.0-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text:
                      "You are an experienced HR professional and career coach. Your role is to provide constructive, specific feedback on CVs and resumes. Evaluate the content based on completeness, clarity, professional presentation, and effectiveness for job applications. Be supportive but honest in your feedback, focusing on actionable improvements. Rate CVs from 1-10 based on overall quality and job-readiness.\n\n" +
                      cvAnalysisPrompt,
                  },
                ],
              },
            ],
          });
          const cvAnalysisText = cvAnalysisResult.text || "";

          // Parse the response more safely
          let feedback = "No feedback provided";
          let suggestions = ["No suggestions provided"];
          let rating = 5;

          try {
            // Extract feedback (looks for text between FEEDBACK: and IMPROVEMENT SUGGESTIONS:)
            const feedbackMatch = cvAnalysisText.match(
              /FEEDBACK:\s*(.*?)(?=IMPROVEMENT SUGGESTIONS:|$)/s
            );

            // Extract suggestions (looks for numbered list after IMPROVEMENT SUGGESTIONS:)
            const suggestionsSectionMatch = cvAnalysisText.match(
              /IMPROVEMENT SUGGESTIONS:\s*(.*?)(?=CV QUALITY RATING:|$)/s
            );

            // Extract rating (looks for CV QUALITY RATING: X/10 pattern)
            const ratingMatch = cvAnalysisText.match(
              /CV QUALITY RATING:\s*(\d+)/
            );

            feedback = feedbackMatch
              ? feedbackMatch[1].trim()
              : "No feedback provided";

            // Parse numbered suggestions if found
            if (suggestionsSectionMatch) {
              const suggestionsText = suggestionsSectionMatch[1];
              // Split by numbered lines and extract the text after the numbers
              const suggestionMatches = suggestionsText.matchAll(
                /(\d+)\.\s*(.*?)(?=\n\d+\.|$)/gs
              );
              const extractedSuggestions: string[] = [];
              for (const match of suggestionMatches) {
                const suggestion = match[2]?.trim();
                if (suggestion) {
                  extractedSuggestions.push(suggestion);
                }
              }
              suggestions =
                extractedSuggestions.length > 0
                  ? extractedSuggestions
                  : ["No suggestions provided"];
            } else {
              suggestions = ["No suggestions provided"];
            }

            rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 5;

            // Ensure rating is within valid range (1-10)
            rating = Math.min(10, Math.max(1, rating || 5));
          } catch (parseError) {
            Logger.error("Error parsing CV AI response:", {
              parseError,
              cvAnalysisText: cvAnalysisText.substring(0, 500),
            });
            feedback = "CV feedback available but could not be parsed properly";
            suggestions = [
              "Please review your CV for completeness and clarity",
            ];
          }

          result = {
            aiFeedback: feedback,
            improvementSuggestions: suggestions,
            rating,
          };
        } catch (geminiError) {
          Logger.error("Error analyzing CV with Gemini:", {
            error:
              geminiError instanceof Error
                ? geminiError.message
                : String(geminiError),
            userId,
            action,
          });

          // Check if this is a rate limit error
          if (
            geminiError instanceof Error &&
            geminiError.message.includes("Rate limit")
          ) {
            return NextResponse.json(
              {
                error: "Rate limit exceeded",
                message: "Too many requests. Please try again later.",
                retryAfter: 60, // Suggest retry after 60 seconds
              },
              { status: 429 }
            );
          }

          return NextResponse.json(
            { error: "Failed to analyze CV" },
            { status: 500 }
          );
        }
        break;

      case "analyzeJobFit":
        if (!context) {
          Logger.error("Context is required for job fit analysis", {
            userId,
            action,
          });
          return NextResponse.json(
            { error: "Context is required for job fit analysis" },
            { status: 400 }
          );
        }

        const typedContextJobFit = context as InterviewContext;
        if (!typedContextJobFit.jobPosting) {
          Logger.error("Job posting is required for job fit analysis", {
            userId,
            action,
          });
          return NextResponse.json(
            {
              error: "Job posting is required for job fit analysis",
            },
            { status: 400 }
          );
        }

        if (!typedContextJobFit.userCv) {
          Logger.error("User CV is required for job fit analysis", {
            userId,
            action,
          });
          return NextResponse.json(
            {
              error: "User CV is required for job fit analysis",
            },
            { status: 400 }
          );
        }

        // Validate and sanitize all inputs
        let sanitizedJobPosting: string;
        let sanitizedUserCV: string;

        try {
          const jobPostingResult = validateAndSanitizeJobPosting(
            typedContextJobFit.jobPosting
          );
          const userCVResult = validateAndSanitizeUserCV(
            typedContextJobFit.userCv
          );

          if (jobPostingResult.threatsDetected.length > 0) {
            Logger.warn("Threats detected in job posting:", {
              threats: jobPostingResult.threatsDetected,
              userId,
            });
          }

          if (userCVResult.threatsDetected.length > 0) {
            Logger.warn("Threats detected in user CV:", {
              threats: userCVResult.threatsDetected,
              userId,
            });
          }

          sanitizedJobPosting = jobPostingResult.sanitized;
          sanitizedUserCV = userCVResult.sanitized;
        } catch (validationError) {
          Logger.error("Job fit validation failed:", {
            validationError,
            userId,
          });
          return NextResponse.json(
            { error: "Invalid job posting or CV content provided" },
            { status: 400 }
          );
        }

        const jobFitAnalysisPrompt = `
          Act as an experienced HR professional. Analyze how well this candidate matches the job requirements by comparing their CV to the job posting.
          
          Job Posting:
          ${sanitizedJobPosting}
          
          Candidate CV:
          ${sanitizedUserCV}
          
          Provide:
          1. Overall assessment of the candidate's fit for this role
          2. 3-4 specific recommendations (strengths to highlight, gaps to address, areas for development)
          3. A fit score from 1-10 based on skills, experience, and qualifications match
          
          Format your response as:
          FEEDBACK: [Your comprehensive fit analysis here]
          RECOMMENDATIONS: [Recommendation 1]; [Recommendation 2]; [Recommendation 3]; [Recommendation 4]
          SCORE: [Number 1-10]
        `;

        try {
          const jobFitAnalysisResult = await model.generateContent({
            model: "gemini-2.0-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text:
                      "You are an experienced HR professional specializing in talent assessment. Your role is to provide accurate, objective evaluations of candidate-job fit based on resumes/CVs and job descriptions. Consider skills, experience, qualifications, and cultural fit. Provide specific, actionable recommendations for candidates. Rate fit on a scale of 1-10 where 10 is a perfect match and 1 is no match at all.\n\n" +
                      jobFitAnalysisPrompt,
                  },
                ],
              },
            ],
          });
          const jobFitAnalysisText = jobFitAnalysisResult.text || "";

          // Parse the response more safely
          let feedback = "No analysis provided";
          let recommendations = ["No recommendations provided"];
          let score = 5;

          try {
            const feedbackMatch = jobFitAnalysisText.match(
              /FEEDBACK:\s*(.*?)(?=RECOMMENDATIONS:|$|SCORE:)/s
            );
            const recommendationsMatch = jobFitAnalysisText.match(
              /RECOMMENDATIONS:\s*(.*?)(?=SCORE:|$)/s
            );
            const scoreMatch = jobFitAnalysisText.match(/SCORE:\s*(\d+)/);

            feedback = feedbackMatch
              ? feedbackMatch[1].trim()
              : "No analysis provided";
            recommendations = recommendationsMatch
              ? recommendationsMatch[1]
                  .split(";")
                  .map((s) => s.trim())
                  .filter((s) => s)
              : ["No recommendations provided"];
            score = scoreMatch ? parseInt(scoreMatch[1], 10) : 5;

            // Ensure score is within valid range (1-10)
            score = Math.min(10, Math.max(1, score || 5));
          } catch (parseError) {
            Logger.error("Error parsing job fit AI response:", { parseError });
            feedback =
              "Job fit analysis available but could not be parsed properly";
            recommendations = [
              "Please review how your experience aligns with the job requirements",
            ];
          }

          result = {
            aiFeedback: feedback,
            improvementSuggestions: recommendations,
            rating: score,
          };
        } catch (geminiError) {
          Logger.error("Error analyzing job fit with Gemini:", {
            error:
              geminiError instanceof Error
                ? geminiError.message
                : String(geminiError),
            userId,
            action,
          });

          // Check if this is a rate limit error
          if (
            geminiError instanceof Error &&
            geminiError.message.includes("Rate limit")
          ) {
            return NextResponse.json(
              {
                error: "Rate limit exceeded",
                message: "Too many requests. Please try again later.",
                retryAfter: 60, // Suggest retry after 60 seconds
              },
              { status: 429 }
            );
          }

          return NextResponse.json(
            { error: "Failed to analyze job fit" },
            { status: 500 }
          );
        }
        break;

      default:
        Logger.error("Invalid action provided", { action, userId });
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    Logger.info("About to record usage after successful processing", {
      userId,
      action,
      cost,
      wasPaymentJustVerified: !!req && !!req.headers.get("X-PAYMENT"),
    });

    // Record usage after successful processing
    // Using the dedicated function that handles server-side authentication
    // If payment was just verified in this request, we should not deduct credits again
    const wasPaymentJustVerified = !!req && !!req.headers.get("X-PAYMENT");
    const usageRecorded = await recordUsageWithDatabase(
      userId || "anonymous",
      action,
      cost,
      false, // unused parameter - no longer used in credit-based system
      wasPaymentJustVerified
    );

    if (!usageRecorded) {
      Logger.warn("Usage recording failed, but continuing with request");
      // Don't fail the entire request just because usage recording failed
      // The core functionality (generating response) worked correctly
    }

    // Get the updated remaining quota (without payment verification)
    // Since this is after processing, we just need to get current status
    const updatedUsageCheck = await checkUsageAfterProcessing(
      userId || "anonymous",
      action
    );

    // Add remaining quota information to the response
    result.remainingQuota = updatedUsageCheck.remaining;
    result.quotaInfo = {
      used: Math.max(
        0,
        (usageCheck.creditsAvailable || 0) - updatedUsageCheck.remaining
      ),
      total: usageCheck.creditsAvailable || 0,
      resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(), // Reset at next midnight
    };

    // Create a response object to potentially add X-PAYMENT-RESPONSE header
    const response = NextResponse.json(result);

    // If this was a payment verification request that succeeded, add the X-PAYMENT-RESPONSE header
    if (req) {
      const paymentHeader = req.headers.get("X-PAYMENT");
      if (paymentHeader) {
        // In a real implementation, we would include transaction details in the response header
        // For now, we'll simulate this with a base64 encoded JSON response
        const paymentResponse = {
          success: true,
          txHash: "simulated_tx_hash_" + Date.now(), // In a real implementation, this would be the actual transaction signature
          networkId: "solana",
          explorerUrl: `https://explorer.solana.com/tx/simulated_tx_hash_${Date.now()}`,
          creditsAdded: cost, // Include credits added for transparency
          operation: action, // Include the operation that was performed
          timestamp: new Date().toISOString(),
          userId: userId || "anonymous",
        };

        const encodedPaymentResponse = btoa(JSON.stringify(paymentResponse));
        response.headers.set("X-PAYMENT-RESPONSE", encodedPaymentResponse);

        // Add additional x402 metadata headers for successful transactions
        response.headers.set("X402-Version", "1.0");
        response.headers.set("X-Payment-Status", "completed");
        response.headers.set("X-Payment-TxHash", paymentResponse.txHash);
        response.headers.set("X-Payment-Network", "solana");
        response.headers.set("X-Payment-Credits-Added", cost.toString());
        response.headers.set("X-Payment-Operation", action);
        response.headers.set("X-Payment-Timestamp", paymentResponse.timestamp);
      }
    }

    Logger.info("Successfully processed Gemini API request", {
      userId,
      action,
    });
    return response;
  } catch (error) {
    Logger.error("Error in Gemini API route:", {
      error: error instanceof Error ? error.message : String(error),
      url: req.url,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
