import { Logger } from "./logger";
import { validateInterviewContext, sanitizeInput } from "./validations";
import { deductUserCredits } from "./database"; // Import deductUserCredits
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

export interface InterviewContext {
  jobPosting: string;
  companyInfo: string;
  userCv: string;
}

export interface QuestionResponse {
  question: string;
  userAnswer: string;
  aiFeedback: string;
  improvementSuggestions: string[];
  rating?: number;
}

export interface BatchEvaluationResponse {
  evaluations: QuestionResponse[];
}

// Define a more specific type for the wallet adapter
export interface WalletAdapter {
  publicKey: PublicKey | null;
  connected: boolean;
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: Record<string, unknown> // Use Record for more type safety
  ) => Promise<string>;
}

export interface QuotaInfo {
  total: number;
  used: number;
  remaining: number;
}

// Define a custom error type for API errors
interface APIError extends Error {
  status: number;
  errorData?: Record<string, unknown>; // Use Record for more type safety
}

export class GeminiService {
  private static instance: GeminiService;
  private isPaymentProcessing: boolean = false; // Lock to prevent multiple concurrent payment flows
  private onCreditsChanged?: () => void; // Callback to trigger credit refresh

  // Method to set the credit refresh callback
  public setCreditRefreshCallback(callback: () => void) {
    this.onCreditsChanged = callback;
  }

  private async callGeminiAPI<T>(
    action: string,
    body: Record<string, unknown>, // Use unknown for more type safety
    userId?: string,
    connection?: Connection, // Use Solana Connection type
    wallet?: WalletAdapter, // Use custom WalletAdapter type
    onPaymentInitiated?: (message: string) => void,
    onPaymentSuccess?: (message: string) => void,
    onPaymentFailure?: (message: string) => void
  ): Promise<T> {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        ...body,
        userId: userId || "anonymous",
      }),
    });

    // Check if this is a 402 Payment Required response
    if (res.status === 402) {
      // CRITICAL: Don't handle payment internally, throw error to let page component handle it
      const errorData = await res.json().catch(() => ({}));
      const error = new Error("Payment required for this action");
      (error as APIError).status = 402;
      (error as APIError).errorData = errorData;
      throw error;
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(`API request failed with status ${res.status}`);
      (error as APIError).status = res.status; // Cast to APIError
      (error as APIError).errorData = errorData; // Cast to APIError
      throw error;
    }

    const result = await res.json();

    // Trigger credit refresh after successful API calls that may have spent credits
    // Only trigger for actions that cost credits (not generateFlow which is free)
    // Trigger credit refresh after successful API calls that may have spent credits
    // or after a successful payment flow (which implies credits were added)
    if (this.onCreditsChanged) {
      Logger.info("Triggering credit refresh after API call", {
        action,
        userId,
      });
      this.onCreditsChanged();
    }

    return result;
  }

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  // NOTE: generateInterviewQuestion is now deprecated in favor of batch generation via generateInterviewFlow
  // This method is kept for backward compatibility but will generate all questions at once and return the first
  async generateInterviewQuestion(
    context: InterviewContext,
    userId?: string,
    onPaymentInitiated?: (message: string) => void,
    onPaymentSuccess?: (message: string) => void,
    onPaymentFailure?: (message: string) => void
  ): Promise<string> {
    try {
      // Validate context before processing
      validateInterviewContext(context);
      // Sanitize inputs
      const sanitizedContext = {
        ...context,
        jobPosting: sanitizeInput(context.jobPosting),
        companyInfo: sanitizeInput(context.companyInfo),
        userCv: sanitizeInput(context.userCv),
      };

      // For backward compatibility, generate a batch of questions and return the first one
      const allQuestions = await this.generateInterviewFlow(
        sanitizedContext,
        1,
        userId,
        undefined, // connection
        undefined, // wallet
        onPaymentInitiated,
        onPaymentSuccess,
        onPaymentFailure
      );
      return (
        allQuestions[0] ||
        "Can you tell me about your experience with this type of role?"
      );
    } catch (error) {
      Logger.error("Error generating interview question (via batch):", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      });

      if ((error as { status?: number }).status === 402) {
        throw error; // Let 402 errors bubble up to page component
      }
      // Return a fallback question if API call fails
      return "Can you tell me about your experience with this type of role?";
    }
  }

  async analyzeAnswer(
    context: InterviewContext,
    question: string,
    answer: string,
    userId?: string,
    connection?: Connection, // Use Solana Connection type
    wallet?: WalletAdapter, // Use custom WalletAdapter type
    onPaymentInitiated?: (message: string) => void,
    onPaymentSuccess?: (message: string) => void,
    onPaymentFailure?: (message: string) => void
  ): Promise<
    QuestionResponse & { remainingQuota?: number; quotaInfo?: QuotaInfo }
  > {
    try {
      // Validate context before processing
      validateInterviewContext(context);
      // Sanitize inputs
      const sanitizedContext = {
        ...context,
        jobPosting: sanitizeInput(context.jobPosting),
        companyInfo: sanitizeInput(context.companyInfo),
        userCv: sanitizeInput(context.userCv),
      };
      const sanitizedQuestion = sanitizeInput(question);
      const sanitizedAnswer = sanitizeInput(answer);

      // Log what is being sent to Gemini
      Logger.info("Sending request to Gemini API (analyzeAnswer)", {
        action: "analyzeAnswer",
        userId: userId || "anonymous",
      });

      // Use the unified API client
      const data = await this.callGeminiAPI<
        QuestionResponse & { remainingQuota?: number; quotaInfo?: QuotaInfo }
      >(
        "analyzeAnswer",
        {
          context: sanitizedContext,
          question: sanitizedQuestion,
          answer: sanitizedAnswer,
        },
        userId,
        connection,
        wallet,
        onPaymentInitiated,
        onPaymentSuccess,
        onPaymentFailure
      );

      Logger.info("Successfully received analysis from Gemini API", {
        questionLength: sanitizedQuestion.length,
        userId: userId || "anonymous",
      });

      return {
        question: data.question,
        userAnswer: data.userAnswer,
        aiFeedback: data.aiFeedback,
        improvementSuggestions: data.improvementSuggestions,
        rating: data.rating,
        remainingQuota: data.remainingQuota,
        quotaInfo: data.quotaInfo,
      };
    } catch (error) {
      Logger.error("Error analyzing answer:", {
        error: error instanceof Error ? error.message : String(error),
        userId,
        questionLength: question.length,
      });

      if ((error as { status?: number }).status === 429) {
        throw error;
      }
      // Return fallback analysis if API call fails
      return {
        question,
        userAnswer: answer,
        aiFeedback:
          "Answer received. Consider adding more specific examples to strengthen your response.",
        improvementSuggestions: [
          "Provide more concrete examples",
          "Relate your experience to specific job requirements",
          "Consider addressing potential follow-up questions",
        ],
      };
    }
  }

  async generateInterviewFlow(
    context: InterviewContext,
    numQuestions: number = 5,
    userId?: string,
    connection?: Connection, // Use Solana Connection type
    wallet?: WalletAdapter, // Use custom WalletAdapter type
    onPaymentInitiated?: (message: string) => void,
    onPaymentSuccess?: (message: string) => void,
    onPaymentFailure?: (message: string) => void
  ): Promise<string[]> {
    try {
      // Validate context before processing
      validateInterviewContext(context);
      // Sanitize inputs
      const sanitizedContext = {
        ...context,
        jobPosting: sanitizeInput(context.jobPosting),
        companyInfo: sanitizeInput(context.companyInfo),
        userCv: sanitizeInput(context.userCv),
      };

      // Log what is being sent to Gemini
      Logger.info("Sending request to Gemini API (generateFlow)", {
        action: "generateFlow",
        numQuestions,
        userId: userId || "anonymous",
      });

      // Use the unified API client
      const data = await this.callGeminiAPI<{ questions: string[] }>(
        "generateFlow",
        {
          context: sanitizedContext,
          numQuestions,
        },
        userId,
        connection,
        wallet,
        onPaymentInitiated,
        onPaymentSuccess,
        onPaymentFailure
      );
      return data.questions || [];
    } catch (error) {
      Logger.error("Error generating interview flow:", {
        error: error instanceof Error ? error.message : String(error),
        numQuestions,
        userId,
      });

      // Let 402 errors bubble up to page component for proper handling
      if ((error as { status?: number }).status === 402) {
        throw error;
      } else if ((error as { status?: number }).status === 429) {
        throw error;
      }
      // Return fallback questions for non-payment related errors
      return [
        "Tell me about yourself.",
        "Why are you interested in this position?",
        "What are your strengths?",
        "What are your weaknesses?",
        "Do you have any questions for us?",
      ].slice(0, numQuestions);
    }
  }

  async batchEvaluateAnswers(
    context: InterviewContext,
    questions: string[],
    answers: string[],
    userId?: string,
    connection?: Connection, // Use Solana Connection type
    wallet?: WalletAdapter, // Use custom WalletAdapter type
    onPaymentInitiated?: (message: string) => void,
    onPaymentSuccess?: (message: string) => void,
    onPaymentFailure?: (message: string) => void
  ): Promise<
    BatchEvaluationResponse & { remainingQuota?: number; quotaInfo?: QuotaInfo }
  > {
    try {
      // Validate context before processing
      validateInterviewContext(context);
      // Sanitize inputs
      const sanitizedContext = {
        ...context,
        jobPosting: sanitizeInput(context.jobPosting),
        companyInfo: sanitizeInput(context.companyInfo),
        userCv: sanitizeInput(context.userCv),
      };
      const sanitizedQuestions = questions.map((q) => sanitizeInput(q));
      const sanitizedAnswers = answers.map((a) => sanitizeInput(a));

      // Log what is being sent to Gemini
      Logger.info("Sending request to Gemini API (batchEvaluate)", {
        action: "batchEvaluate",
        questionsCount: questions.length,
        userId: userId || "anonymous",
      });

      // Use the unified API client
      return await this.callGeminiAPI<
        BatchEvaluationResponse & {
          remainingQuota?: number;
          quotaInfo?: QuotaInfo;
        }
      >(
        "batchEvaluate",
        {
          context: sanitizedContext,
          questions: sanitizedQuestions,
          answers: sanitizedAnswers,
        },
        userId,
        connection,
        wallet,
        onPaymentInitiated,
        onPaymentSuccess,
        onPaymentFailure
      );
    } catch (error) {
      Logger.error("Error in batch evaluation:", {
        error: error instanceof Error ? error.message : String(error),
        questionsCount: questions.length,
        userId,
      });

      // Let 402 errors bubble up to page component for proper handling
      if ((error as { status?: number }).status === 402) {
        throw error;
      } else if ((error as { status?: number }).status === 429) {
        throw error;
      }
      // Return fallback analysis for non-payment related errors
      const evaluations = questions.map((question, i) => ({
        question,
        userAnswer: answers[i] || "",
        aiFeedback:
          "Answer received. Consider adding more specific examples to strengthen your response.",
        improvementSuggestions: [
          "Provide more concrete examples",
          "Relate your experience to specific job requirements",
          "Consider addressing potential follow-up questions",
        ],
        rating: 5,
      }));
      return {
        evaluations,
      };
    }
  }

  async generateSimilarQuestion(
    context: InterviewContext,
    originalQuestion: string,
    userId?: string,
    onPaymentInitiated?: (message: string) => void,
    onPaymentSuccess?: (message: string) => void,
    onPaymentFailure?: (message: string) => void
  ): Promise<string> {
    try {
      // Validate context before processing
      validateInterviewContext(context);
      // Sanitize inputs
      const sanitizedContext = {
        ...context,
        jobPosting: sanitizeInput(context.jobPosting),
        companyInfo: sanitizeInput(context.companyInfo),
        userCv: sanitizeInput(context.userCv),
      };
      const sanitizedOriginalQuestion = sanitizeInput(originalQuestion);

      // Use the unified API client
      const data = await this.callGeminiAPI<{ question: string }>(
        "generateSimilarQuestion",
        {
          context: sanitizedContext,
          question: sanitizedOriginalQuestion,
        },
        userId,
        undefined, // connection
        undefined, // wallet
        onPaymentInitiated,
        onPaymentSuccess,
        onPaymentFailure
      );
      return data.question || `Similar question to: ${originalQuestion}`;
    } catch (error) {
      Logger.error("Error generating similar question:", {
        error: error instanceof Error ? error.message : String(error),
        originalQuestion: originalQuestion.substring(0, 50) + "...",
        userId,
      });

      if ((error as { status?: number }).status === 402) {
        throw error; // Let 402 errors bubble up to page component
      } else if ((error as { status?: number }).status === 429) {
        throw error;
      }
      // Return a fallback question if API call fails
      return `Similar question based on: ${originalQuestion}`;
    }
  }
}

// Export a singleton instance
export const geminiService = GeminiService.getInstance();
