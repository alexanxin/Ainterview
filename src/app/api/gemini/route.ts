import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import {
  getUserUsage,
  getDailyUsageCount,
  getUserInterviewsCompleted,
  recordUsage,
} from "@/lib/database";
import {
  rateLimiter,
  withExponentialBackoff,
  withRateLimitHandling,
} from "@/lib/rate-limiter";

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

interface BatchEvaluationRequest {
  questions: string[];
  answers: string[];
  context: InterviewContext;
}

interface BatchEvaluationResponse {
  evaluations: QuestionResponse[];
}

// Define free quota for users
const FREE_INTERVIEWS = 1; // 1 complete interview free (all questions in an interview session)
const FREE_INTERACTIONS_PER_DAY = 2; // Additional individual interactions per day after free interview is used

async function checkUsage(
  userId: string,
  action: string
): Promise<{
  allowed: boolean;
  remaining: number;
  cost: number;
  freeInterviewUsed: boolean;
}> {
  const cost = 1; // Each action costs 1

  if (!userId || userId === "anonymous") {
    // For anonymous users, only allow basic usage with no personalization
    return {
      allowed: true,
      remaining: -1, // Indicate unlimited for anonymous
      cost,
      freeInterviewUsed: false,
    };
  }

  // Check if user has completed their free interview
  const interviewsCompleted = await getUserInterviewsCompleted(userId);
  const freeInterviewUsed = interviewsCompleted >= 1;

  // If user hasn't used their free interview yet, allow it
  if (!freeInterviewUsed) {
    return {
      allowed: true,
      remaining: -1, // Indicate unlimited for free interview
      cost,
      freeInterviewUsed: false,
    };
  }

  // If free interview is used, check daily limit
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const dailyUsageCount = await getDailyUsageCount(
    userId,
    `${today}T00:00:00Z`
  );
  const remainingDaily = Math.max(
    0,
    FREE_INTERACTIONS_PER_DAY - dailyUsageCount
  );

  return {
    allowed: remainingDaily >= cost,
    remaining: remainingDaily,
    cost,
    freeInterviewUsed: true,
  };
}

async function recordUsageWithDatabase(
  userId: string,
  action: string,
  cost: number,
  freeInterviewAlreadyUsed: boolean
) {
  if (!userId || userId === "anonymous") {
    // Don't record usage for anonymous users
    return;
  }

  // Calculate interviews completed based on action type
  let interviewsCompleted = 0;
  if (action === "generateFlow") {
    // This indicates a complete interview session
    interviewsCompleted = await getUserInterviewsCompleted(userId);
    interviewsCompleted += 1;
  }

  // Record the usage in the database
  const usageRecord = {
    user_id: userId,
    action,
    cost,
    free_interview_used: freeInterviewAlreadyUsed,
    interviews_completed: interviewsCompleted,
  };

  const success = await recordUsage(usageRecord);

  if (success) {
    console.log(
      `Recorded usage in database: user=${userId}, action=${action}, cost=${cost}, freeInterviewUsed=${freeInterviewAlreadyUsed}`
    );
  } else {
    console.error(
      `Failed to record usage in database: user=${userId}, action=${action}, cost=${cost}`
    );
  }
}

export async function POST(req: NextRequest) {
  try {
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

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // Check if user has exceeded their free quota
    // Temporarily disabled for testing
    const usageCheck = await checkUsage(userId || "anonymous", action);

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: "Free quota exceeded",
          needsPayment: true,
          message: usageCheck.freeInterviewUsed
            ? `You've used all ${FREE_INTERACTIONS_PER_DAY} free AI interactions for today. Please purchase credits to continue.`
            : `You've used your free interview. Please purchase credits to continue practicing.`,
        },
        { status: 402 } // Payment Required
      );
    }
    // const usageCheck = { allowed: true, remaining: FREE_QUOTA, cost: 1 };

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      console.warn(
        "GEMINI_API_KEY environment variable is not set. Using mock responses."
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
          return NextResponse.json({
            questions: [
              "Can you tell me about your experience with React and TypeScript?",
              "How do you optimize React application performance?",
              "What is your experience with state management in React applications?",
            ],
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
              question: q,
              userAnswer: answers[i],
              aiFeedback: `Feedback for answer to question: ${q}`,
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
      console.error("Error initializing Gemini AI:", error);
      return NextResponse.json(
        { error: "Failed to initialize AI service" },
        { status: 500 }
      );
    }

    // Create a rate limiting key based on the user ID and action
    const rateLimitKey = userId
      ? `gemini_${userId}_${action}`
      : `gemini_anonymous_${action}`;

    let result: ApiResult;

    switch (action) {
      case "generateQuestion":
        if (!context) {
          return NextResponse.json(
            { error: "Context is required for generating a question" },
            { status: 400 }
          );
        }

        const typedContext = context as InterviewContext;
        if (!typedContext.jobPosting || !typedContext.companyInfo) {
          return NextResponse.json(
            {
              error:
                "Job posting and company info are required for generating a question",
            },
            { status: 400 }
          );
        }

        const questionPrompt = `
          Based on the following job posting and company information, generate a relevant interview question:
          
          Job Posting: ${typedContext.jobPosting}
          
          Company Info: ${typedContext.companyInfo}
          
          Please generate a single, specific interview question that would be relevant for this position.
          Make sure the question is specific to the role and company.
        `;

        try {
          const questionResult = await withRateLimitHandling(async () => {
            return await model.generateContent({
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
          }, rateLimitKey);
          const questionText = questionResult.text || "";

          // Clean up the response to extract just the question
          const cleanedQuestion = questionText
            .trim()
            .replace(/^["']|["']$/g, "");

          result = { question: cleanedQuestion };
        } catch (geminiError) {
          console.error("Error generating question with Gemini:", geminiError);

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
          return NextResponse.json(
            { error: "Context is required for generating interview flow" },
            { status: 400 }
          );
        }

        const typedContextFlow = context as InterviewContext;
        if (!typedContextFlow.jobPosting || !typedContextFlow.companyInfo) {
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
          
          Job Posting: ${typedContextFlow.jobPosting}
          
          Company Info: ${typedContextFlow.companyInfo}
          
          Please provide the questions as a numbered list, one per line, focusing on:
          1. Technical skills relevant to the role
          2. Cultural fit with the company
          3. Experience related to the requirements
          4. Problem-solving scenarios
          5. Career goals and motivation
        `;

        try {
          const flowResult = await withRateLimitHandling(async () => {
            return await model.generateContent({
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
          }, rateLimitKey);
          const flowText = flowResult.text || "";

          // Extract questions from the response more safely
          let flowQuestions: string[] = [];
          try {
            flowQuestions = flowText
              .split("\n")
              .map((line) => line.replace(/^\d+\.\s*/, "").trim())
              .filter((line) => line.length > 0 && line.includes("?"));
          } catch (extractionError) {
            console.error("Error extracting questions:", extractionError);
            // Fallback to basic extraction
            flowQuestions = [];
          }

          result = { questions: flowQuestions.slice(0, numQuestions) };
        } catch (geminiError) {
          console.error("Error generating flow with Gemini:", geminiError);

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
          
          Job Posting: ${typedContextAnalysis.jobPosting}
          
          Company Info: ${typedContextAnalysis.companyInfo}
          
          User CV: ${typedContextAnalysis.userCv}
          
          Question: ${question}
          
          Answer: ${answer}
          
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
          const analysisResult = await withRateLimitHandling(async () => {
            return await model.generateContent({
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
          }, rateLimitKey);
          const analysisText = analysisResult.text || "";

          // Parse the response more safely
          let feedback = "No feedback provided";
          let suggestions = ["No suggestions provided"];
          let rating = 5;

          try {
            const feedbackMatch = analysisText.match(
              /FEEDBACK:\s*(.*?)(?=SUGGESTIONS:|$|RATIONING:)/s
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

            // Ensure rating is within valid range
            rating = Math.min(10, Math.max(1, rating || 5));
          } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
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
          console.error("Error analyzing answer with Gemini:", geminiError);

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
            { error: "Failed to analyze answer" },
            { status: 500 }
          );
        }
        break;

      case "batchEvaluate":
        if (!context || !questions || !answers) {
          return NextResponse.json(
            {
              error:
                "Context, questions, and answers are required for batch evaluation",
            },
            { status: 400 }
          );
        }

        if (questions.length !== answers.length) {
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
          
          Job Posting: ${typedContextBatch.jobPosting}
          
          Company Info: ${typedContextBatch.companyInfo}
          
          User CV: ${typedContextBatch.userCv}
          
          Evaluate each question-answer pair and provide feedback:
          
          ${questions
            .map(
              (q: string, i: number) =>
                `Question ${i + 1}: ${q}\nAnswer ${i + 1}: ${answers[i]}\n`
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
          const batchResult = await withRateLimitHandling(async () => {
            return await model.generateContent({
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
          }, rateLimitKey);
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

            const rating = ratingMatch
              ? Math.min(10, Math.max(1, parseInt(ratingMatch[1], 10)))
              : 5;

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
          console.error(
            "Error with batch evaluation using Gemini:",
            geminiError
          );

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
          
          Job Posting: ${typedContextSimilar.jobPosting}
          
          Company Info: ${typedContextSimilar.companyInfo}
          
          Original Question: ${question}
          
          Please generate a single, specific interview question that is similar in nature to the original question
          but phrased differently or focuses on a related aspect of the same topic.
          Make sure the question is specific to the role and company.
        `;

        try {
          const similarQuestionResult = await withRateLimitHandling(
            async () => {
              return await model.generateContent({
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
            },
            rateLimitKey
          );
          const similarQuestionText = similarQuestionResult.text || "";

          // Clean up the response to extract just the question
          const cleanedSimilarQuestion = similarQuestionText
            .trim()
            .replace(/^["']|["']$/g, "");

          result = { question: cleanedSimilarQuestion };
        } catch (geminiError) {
          console.error(
            "Error generating similar question with Gemini:",
            geminiError
          );

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

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Record usage after successful processing
    // Using the dedicated function that handles server-side authentication
    await recordUsageWithDatabase(
      userId || "anonymous",
      action,
      usageCheck.cost,
      usageCheck.freeInterviewUsed
    );

    // Get the updated remaining quota
    const updatedUsageCheck = await checkUsage(userId || "anonymous", action);

    // Add remaining quota information to the response
    result.remainingQuota = updatedUsageCheck.remaining;
    result.quotaInfo = {
      used: updatedUsageCheck.freeInterviewUsed
        ? FREE_INTERACTIONS_PER_DAY - updatedUsageCheck.remaining
        : updatedUsageCheck.freeInterviewUsed
        ? 0
        : 1,
      total: updatedUsageCheck.freeInterviewUsed
        ? FREE_INTERACTIONS_PER_DAY
        : updatedUsageCheck.freeInterviewUsed
        ? 0
        : 1,
      resetTime: new Date(new Date().setHours(24, 0, 0)).toISOString(), // Reset at next midnight
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in Gemini API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
