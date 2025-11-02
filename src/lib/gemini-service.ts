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

  async generateInterviewQuestion(context: InterviewContext, userId?: string): Promise<string> {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateQuestion',
          context,
          userId: userId || 'anonymous'
        })
      });

      if (!response.ok) {
        if (response.status === 402) {
          const errorData = await response.json();
          const error = new Error(errorData.message || 'Free quota exceeded');
          (error as any).status = 402;
          throw error;
        }
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.question;
    } catch (error) {
      console.error('Error generating interview question:', error);
      if ((error as any).status === 402) {
        throw error;
      }
      // Return a fallback question if API call fails
      return 'Can you tell me about your experience with this type of role?';
    }
  }

  async analyzeAnswer(context: InterviewContext, question: string, answer: string, userId?: string): Promise<QuestionResponse & { remainingQuota?: number, quotaInfo?: any }> {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyzeAnswer',
          context,
          question,
          answer,
          userId: userId || 'anonymous'
        })
      });

      if (!response.ok) {
        if (response.status === 402) {
          const errorData = await response.json();
          const error = new Error(errorData.message || 'Free quota exceeded');
          (error as any).status = 402;
          throw error;
        }
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return {
        question: data.question,
        userAnswer: data.userAnswer,
        aiFeedback: data.aiFeedback,
        improvementSuggestions: data.improvementSuggestions,
        rating: data.rating,
        remainingQuota: data.remainingQuota,
        quotaInfo: data.quotaInfo
      };
    } catch (error) {
      console.error('Error analyzing answer:', error);
      if ((error as any).status === 402) {
        throw error;
      }
      // Return fallback analysis if API call fails
      return {
        question,
        userAnswer: answer,
        aiFeedback: 'Answer received. Consider adding more specific examples to strengthen your response.',
        improvementSuggestions: [
          'Provide more concrete examples',
          'Relate your experience to specific job requirements',
          'Consider addressing potential follow-up questions'
        ],
      };
    }
  }

  async generateInterviewFlow(context: InterviewContext, numQuestions: number = 5, userId?: string): Promise<string[]> {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateFlow',
          context,
          numQuestions,
          userId: userId || 'anonymous'
        })
      });

      if (!response.ok) {
        if (response.status === 402) {
          const errorData = await response.json();
          const error = new Error(errorData.message || 'Free quota exceeded');
          (error as any).status = 402;
          throw error;
        }
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.questions || [];
    } catch (error) {
      console.error('Error generating interview flow:', error);
      if ((error as any).status === 402) {
        throw error;
      }
      // Return fallback questions if API call fails
      return [
        'Tell me about yourself.',
        'Why are you interested in this position?',
        'What are your strengths?',
        'What are your weaknesses?',
        'Do you have any questions for us?'
      ].slice(0, numQuestions);
    }
  }
}

// Export a singleton instance
export const geminiService = GeminiService.getInstance();