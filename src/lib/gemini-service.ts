import { Logger } from "./logger";
import { validateInterviewContext, sanitizeInput } from "./validations";
import { deductUserCredits } from "./database"; // Import deductUserCredits

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

export class GeminiService {
  private static instance: GeminiService;
  private isPaymentProcessing: boolean = false; // Lock to prevent multiple concurrent payment flows

  private async callGeminiAPI<T>(
    action: string,
    body: Record<string, any>,
    userId?: string,
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
      if (this.isPaymentProcessing) {
        Logger.warn(`Concurrent payment request blocked in ${action}`, {
          userId,
        });
        throw new Error("Payment flow already in progress. Please wait.");
      }

      this.isPaymentProcessing = true;
      try {
        // Import the X402 client functions dynamically
        const { executeWithX402Handling } = await import(
          "@/lib/x402-client-simple"
        );

        // Create a function that can re-execute the request
        const requestExecutor = async (paymentHeader?: string) => {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };

          if (paymentHeader) {
            headers["X-PAYMENT"] = paymentHeader;
          }

          return fetch("/api/gemini", {
            method: "POST",
            headers,
            body: JSON.stringify({
              action,
              ...body,
              userId: userId || "anonymous",
            }),
          });
        };

        // Use the X402 handling flow to process the payment
        const response = await executeWithX402Handling(
          requestExecutor,
          null, // connection - would be a Solana connection in real implementation
          null, // wallet - would be a wallet adapter instance in real implementation
          (paymentReq) => {
            // onPaymentRequired callback
            Logger.info("X402 Payment required", { paymentReq });
            // Optionally call onPaymentInitiated to show payment required notification
            if (onPaymentInitiated) {
              onPaymentInitiated(
                "Payment required: Please complete the transaction in your wallet."
              );
            }
          },
          (result) => {
            // onPaymentSuccess callback
            Logger.info("X402 Payment successful", { result });
            if (onPaymentSuccess) {
              onPaymentSuccess(
                "Payment successful! Credits have been added to your account."
              );
            }
          },
          (message) => {
            // onPaymentInitiated callback - this would show the payment initiation notification
            if (onPaymentInitiated) {
              onPaymentInitiated(message);
            } else {
              console.log(message);
            }
          },
          (message) => {
            // onPaymentFailure callback - this would show the payment failure notification
            if (onPaymentFailure) {
              onPaymentFailure(message);
            } else {
              console.log(message);
            }
          }
        );
        // Return the JSON data from the response, not the Response object itself
        const data = await response.json();

        // Reverting explicit client-side deduction as per user request to handle net credit change on server.
        // The server is expected to add 4 credits (5 - 1 consumed) instead of 5.
        // The original bug was fixed by ensuring the RPC calls work.
        // The deduction logic is now assumed to be handled by the server.

        return data;
      } finally {
        this.isPaymentProcessing = false;
      }
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(`API request failed with status ${res.status}`);
      (error as any).status = res.status;
      (error as any).errorData = errorData;
      throw error;
    }
    return await res.json();
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
        // Use the unified API client for the payment flow
        const allQuestions = await this.callGeminiAPI<string[]>(
          "generateFlow",
          {
            context: {
              jobPosting: context.jobPosting,
              companyInfo: context.companyInfo,
              userCv: context.userCv,
            },
            numQuestions: 1,
          },
          userId,
          onPaymentInitiated,
          onPaymentSuccess,
          onPaymentFailure
        );
        return (
          allQuestions[0] ||
          "Can you tell me about your experience with this type of role?"
        );
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
    onPaymentInitiated?: (message: string) => void,
    onPaymentSuccess?: (message: string) => void,
    onPaymentFailure?: (message: string) => void
  ): Promise<QuestionResponse & { remainingQuota?: number; quotaInfo?: any }> {
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
        QuestionResponse & { remainingQuota?: number; quotaInfo?: any }
      >(
        "analyzeAnswer",
        {
          context: sanitizedContext,
          question: sanitizedQuestion,
          answer: sanitizedAnswer,
        },
        userId,
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
      return await this.callGeminiAPI(
        "generateFlow",
        {
          context: sanitizedContext,
          numQuestions,
        },
        userId,
        onPaymentInitiated,
        onPaymentSuccess,
        onPaymentFailure
      );
    } catch (error) {
      Logger.error("Error generating interview flow:", {
        error: error instanceof Error ? error.message : String(error),
        numQuestions,
        userId,
      });

      if ((error as { status?: number }).status === 402) {
        // Use the unified API client for the payment flow
        const data = await this.callGeminiAPI<{ questions: string[] }>(
          "generateFlow",
          {
            context: {
              jobPosting: context.jobPosting,
              companyInfo: context.companyInfo,
              userCv: context.userCv,
            },
            numQuestions: numQuestions,
          },
          userId,
          onPaymentInitiated,
          onPaymentSuccess,
          onPaymentFailure
        );
        return data.questions || [];
      } else if ((error as { status?: number }).status === 429) {
        throw error;
      }
      // Return fallback questions if API call fails
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
    onPaymentInitiated?: (message: string) => void,
    onPaymentSuccess?: (message: string) => void,
    onPaymentFailure?: (message: string) => void
  ): Promise<
    BatchEvaluationResponse & { remainingQuota?: number; quotaInfo?: any }
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
        BatchEvaluationResponse & { remainingQuota?: number; quotaInfo?: any }
      >(
        "batchEvaluate",
        {
          context: sanitizedContext,
          questions: sanitizedQuestions,
          answers: sanitizedAnswers,
        },
        userId,
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

      if ((error as { status?: number }).status === 402) {
        // Use the unified API client for the payment flow
        const data = await this.callGeminiAPI<{
          evaluations: QuestionResponse[];
          remainingQuota?: number;
          quotaInfo?: any;
        }>(
          "batchEvaluate",
          {
            context: {
              jobPosting: context.jobPosting,
              companyInfo: context.companyInfo,
              userCv: context.userCv,
            },
            questions: questions,
            answers: answers,
          },
          userId,
          onPaymentInitiated,
          onPaymentSuccess,
          onPaymentFailure
        );
        return {
          evaluations: data.evaluations,
          remainingQuota: data.remainingQuota,
          quotaInfo: data.quotaInfo,
        };
      } else if ((error as { status?: number }).status === 429) {
        throw error;
      }
      // Return fallback analysis if API call fails
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
        // Use the unified API client for the payment flow
        const data = await this.callGeminiAPI<{ question: string }>(
          "generateSimilarQuestion",
          {
            context: {
              jobPosting: context.jobPosting,
              companyInfo: context.companyInfo,
              userCv: context.userCv,
            },
            question: originalQuestion,
          },
          userId,
          onPaymentInitiated,
          onPaymentSuccess,
          onPaymentFailure
        );
        return data.question || `Similar question to: ${originalQuestion}`;
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
