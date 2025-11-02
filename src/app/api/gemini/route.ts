import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

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

// Define free quota for users
const FREE_INTERVIEWS = 1; // 1 complete interview free (all questions in an interview session)
const FREE_INTERACTIONS_PER_DAY = 2; // Additional individual interactions per day after free interview is used

// For demo purposes only - in production this should be stored in a database
// Store both interview completion status and daily usage
const usageTracker = new Map<string, { 
  freeInterviewUsed: boolean, 
  dailyCount: number, 
  resetTime: number,
  interviewsCompleted: number
}>();

async function checkUsage(
  userId: string,
  action: string
): Promise<{ allowed: boolean; remaining: number; cost: number; freeInterviewUsed: boolean }> {
  const cost = 1; // Each action costs 1
  const now = Date.now();
  const dayReset = new Date().setHours(0, 0, 0, 0); // Reset at start of each day

  // Check if user exists in tracker or if their daily quota should reset
  if (!usageTracker.has(userId) || usageTracker.get(userId)!.resetTime < dayReset) {
    const existingData = usageTracker.get(userId);
    usageTracker.set(userId, { 
      freeInterviewUsed: existingData?.freeInterviewUsed || false,
      dailyCount: 0, 
      resetTime: dayReset,
      interviewsCompleted: existingData?.interviewsCompleted || 0
    });
  }

  const userUsage = usageTracker.get(userId)!;

  // If user hasn't used their free interview yet, allow it
  if (!userUsage.freeInterviewUsed) {
    return {
      allowed: true,
      remaining: -1, // Indicate unlimited for free interview
      cost,
      freeInterviewUsed: false
    };
  }

  // If free interview is used, apply daily limit
  const remainingDaily = Math.max(0, FREE_INTERACTIONS_PER_DAY - userUsage.dailyCount);

  return {
    allowed: remainingDaily >= cost,
    remaining: remainingDaily,
    cost,
    freeInterviewUsed: true
  };
}

async function recordUsage(userId: string, action: string, cost: number, freeInterviewAlreadyUsed: boolean) {
  // Update the usage tracker
  const userUsage = usageTracker.get(userId) || {
    freeInterviewUsed: false,
    dailyCount: 0,
    resetTime: Date.now(),
    interviewsCompleted: 0
  };

  // Only increment daily count if free interview has already been used
  if (freeInterviewAlreadyUsed) {
    userUsage.dailyCount += cost;
  } else {
    // Mark that the free interview has been used now
    userUsage.freeInterviewUsed = true;
    userUsage.interviewsCompleted += 1;
  }

  usageTracker.set(userId, userUsage);

  console.log(
    `Recorded usage: user=${userId}, action=${action}, cost=${cost}, dailyCount=${userUsage.dailyCount}, freeInterviewUsed=${userUsage.freeInterviewUsed}`
  );

  // In a real application, you'd record the usage in the database
  // Example Supabase usage:
  // const { error } = await supabase
  //   .from('usage_tracking')
  //   .insert([{
  //     user_id: userId,
  //     action,
  //     cost,
  //     free_interview_used: userUsage.freeInterviewUsed,
  //     interviews_completed: userUsage.interviewsCompleted,
  //     timestamp: new Date().toISOString()
  //   }]);
  //
  // if (error) {
  //   console.error('Error recording usage:', error);
  // }
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
          const questionResult = await model.generateContent({
            model: "gemini-2.0-flash-001",
            contents: questionPrompt,
          });
          const questionText = questionResult.text || "";

          // Clean up the response to extract just the question
          const cleanedQuestion = questionText
            .trim()
            .replace(/^["']|["']$/g, "");

          result = { question: cleanedQuestion };
        } catch (geminiError) {
          console.error("Error generating question with Gemini:", geminiError);
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
          const flowResult = await model.generateContent({
            model: "gemini-2.0-flash-001",
            contents: flowPrompt,
          });
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
          const analysisResult = await model.generateContent({
            model: "gemini-2.0-flash-001",
            contents: analysisPrompt,
          });
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
          return NextResponse.json(
            { error: "Failed to analyze answer" },
            { status: 500 }
          );
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Record usage after successful processing
    // Temporarily disabled for testing
    await recordUsage(userId || "anonymous", action, usageCheck.cost, usageCheck.freeInterviewUsed);

    // Get the updated remaining quota
    const updatedUsageCheck = await checkUsage(userId || "anonymous", action);

    // Add remaining quota information to the response
    result.remainingQuota = updatedUsageCheck.remaining;
    result.quotaInfo = {
      used: updatedUsageCheck.freeInterviewUsed 
        ? FREE_INTERACTIONS_PER_DAY - updatedUsageCheck.remaining 
        : (updatedUsageCheck.freeInterviewUsed ? 0 : 1),
      total: updatedUsageCheck.freeInterviewUsed 
        ? FREE_INTERACTIONS_PER_DAY 
        : (updatedUsageCheck.freeInterviewUsed ? 0 : 1),
      resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(), // Reset at next midnight
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
