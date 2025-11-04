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
    userId?: string
  ): Promise<string> {
    try {
      // For backward compatibility, generate a batch of questions and return the first one
      const allQuestions = await this.generateInterviewFlow(context, 1, userId);
      return (
        allQuestions[0] ||
        "Can you tell me about your experience with this type of role?"
      );
    } catch (error) {
      console.error("Error generating interview question (via batch):", error);
      if ((error as any).status === 402) {
        throw error;
      }
      // Return a fallback question if API call fails
      return "Can you tell me about your experience with this type of role?";
    }
  }

  async analyzeAnswer(
    context: InterviewContext,
    question: string,
    answer: string,
    userId?: string
  ): Promise<QuestionResponse & { remainingQuota?: number; quotaInfo?: any }> {
    // Log what is being sent to Gemini
    console.log("Sending to Gemini API (analyzeAnswer):", {
      action: "analyzeAnswer",
      context: {
        jobPosting: context.jobPosting?.substring(0, 100) + "...", // Truncate for privacy
        companyInfo: context.companyInfo?.substring(0, 100) + "...", // Truncate for privacy
        userCv: context.userCv?.substring(0, 100) + "...", // Truncate for privacy
      },
      question,
      answer,
      userId: userId || "anonymous",
    });

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "analyzeAnswer",
          context,
          question,
          answer,
          userId: userId || "anonymous",
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          const errorData = await response.json();
          const error = new Error(errorData.message || "Free quota exceeded");
          (error as any).status = 402;
          throw error;
        }
        if (response.status === 429) {
          const errorData = await response.json();
          const error = new Error(errorData.message || "Rate limit exceeded");
          (error as any).status = 429;
          throw error;
        }
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Log what is received from Gemini
      console.log("Received from Gemini API (analyzeAnswer):", {
        question: data.question,
        userAnswer: data.userAnswer,
        aiFeedback: data.aiFeedback?.substring(0, 100) + "...",
        improvementSuggestions: data.improvementSuggestions,
        rating: data.rating,
        remainingQuota: data.remainingQuota,
        quotaInfo: data.quotaInfo,
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
      console.error("Error analyzing answer:", error);
      if ((error as any).status === 402 || (error as any).status === 429) {
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
    userId?: string
  ): Promise<string[]> {
    // Log what is being sent to Gemini
    console.log("Sending to Gemini API (generateFlow):", {
      action: "generateFlow",
      context: {
        jobPosting: context.jobPosting?.substring(0, 100) + "...", // Truncate for privacy
        companyInfo: context.companyInfo?.substring(0, 100) + "...", // Truncate for privacy
        userCv: context.userCv?.substring(0, 100) + "...", // Truncate for privacy
      },
      numQuestions,
      userId: userId || "anonymous",
    });

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generateFlow",
          context,
          numQuestions,
          userId: userId || "anonymous",
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          const errorData = await response.json();
          const error = new Error(errorData.message || "Free quota exceeded");
          (error as any).status = 402;
          throw error;
        }
        if (response.status === 429) {
          const errorData = await response.json();
          const error = new Error(errorData.message || "Rate limit exceeded");
          (error as any).status = 429;
          throw error;
        }
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Log what is received from Gemini
      console.log("Received from Gemini API (generateFlow):", {
        questions: data.questions,
        remainingQuota: data.remainingQuota,
        quotaInfo: data.quotaInfo,
      });

      return data.questions || [];
    } catch (error) {
      console.error("Error generating interview flow:", error);
      if ((error as any).status === 402 || (error as any).status === 429) {
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
    userId?: string
  ): Promise<
    BatchEvaluationResponse & { remainingQuota?: number; quotaInfo?: any }
  > {
    // Log what is being sent to Gemini
    console.log("Sending to Gemini API (batchEvaluate):", {
      action: "batchEvaluate",
      context: {
        jobPosting: context.jobPosting?.substring(0, 100) + "...", // Truncate for privacy
        companyInfo: context.companyInfo?.substring(0, 100) + "...", // Truncate for privacy
        userCv: context.userCv?.substring(0, 100) + "...", // Truncate for privacy
      },
      questions,
      answers,
      userId: userId || "anonymous",
    });

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "batchEvaluate",
          context,
          questions,
          answers,
          userId: userId || "anonymous",
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          const errorData = await response.json();
          const error = new Error(errorData.message || "Free quota exceeded");
          (error as any).status = 402;
          throw error;
        }
        if (response.status === 429) {
          const errorData = await response.json();
          const error = new Error(errorData.message || "Rate limit exceeded");
          (error as any).status = 429;
          throw error;
        }
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Log what is received from Gemini
      console.log("Received from Gemini API (batchEvaluate):", {
        evaluations: data.evaluations?.map(
          (evaluation: QuestionResponse, index: number) => ({
            question: questions[index],
            aiFeedback: evaluation.aiFeedback?.substring(0, 100) + "...",
            improvementSuggestions: evaluation.improvementSuggestions,
            rating: evaluation.rating,
          })
        ),
        remainingQuota: data.remainingQuota,
        quotaInfo: data.quotaInfo,
      });

      return {
        evaluations: data.evaluations,
        remainingQuota: data.remainingQuota,
        quotaInfo: data.quotaInfo,
      };
    } catch (error) {
      console.error("Error in batch evaluation:", error);
      if ((error as any).status === 402 || (error as any).status === 429) {
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
}

// Export a singleton instance
export const geminiService = GeminiService.getInstance();
