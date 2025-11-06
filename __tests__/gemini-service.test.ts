import { geminiService, GeminiService } from '@/lib/gemini-service';
import { retryWithBackoff } from '@/lib/utils/retry-with-backoff';
import { Logger } from '@/lib/logger';
import { validateInterviewContext, sanitizeInput } from '@/lib/validations';

// Mock globals for testing
global.fetch = jest.fn();

// Mock the utility modules
jest.mock('@/lib/utils/retry-with-backoff');
jest.mock('@/lib/logger');
jest.mock('@/lib/validations');

describe('GeminiService', () => {
  const mockRetryWithBackoff = retryWithBackoff as jest.MockedFunction<typeof retryWithBackoff>;
  const mockLogger = Logger as jest.Mocked<typeof Logger>;
  const mockValidateInterviewContext = validateInterviewContext as jest.MockedFunction<typeof validateInterviewContext>;
  const mockSanitizeInput = sanitizeInput as jest.MockedFunction<typeof sanitizeInput>;

  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
    
    // Mock the utility functions
    mockRetryWithBackoff.mockImplementation(async (fn) => {
      return await fn();
    });
    
    // Mock logger methods
    mockLogger.info = jest.fn();
    mockLogger.warn = jest.fn();
    mockLogger.error = jest.fn();
    mockLogger.debug = jest.fn();
    
    // Mock validation functions
    mockValidateInterviewContext.mockReturnValue(undefined);
    mockSanitizeInput.mockImplementation((input: string) => input); // Return input unchanged for testing
    
    // Reset any global mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when getInstance is called multiple times', () => {
      const instance1 = GeminiService.getInstance();
      const instance2 = GeminiService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('generateInterviewQuestion', () => {
    it('should validate and sanitize context before processing', async () => {
      const context = {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };
      
      const mockQuestions = ['Sample question'];
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        json: () => Promise.resolve({ questions: mockQuestions }),
        ok: true,
      } as Response);

      await geminiService.generateInterviewQuestion(context);

      // Verify validation and sanitization were called
      expect(mockValidateInterviewContext).toHaveBeenCalledWith(context);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.jobPosting);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.companyInfo);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.userCv);
    });

    it('should use retryWithBackoff for API calls', async () => {
      const context = {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };
      
      const mockQuestions = ['Sample question'];
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        json: () => Promise.resolve({ questions: mockQuestions }),
        ok: true,
      } as Response);

      await geminiService.generateInterviewQuestion(context);

      expect(mockRetryWithBackoff).toHaveBeenCalled();
    });

    it('should handle errors gracefully and return a fallback question', async () => {
      const context = {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('API Error'));

      const result = await geminiService.generateInterviewQuestion(context);

      expect(result).toBe('Can you tell me about your experience with this type of role?');
    });
  });

  describe('analyzeAnswer', () => {
    it('should validate and sanitize inputs before processing', async () => {
      const context = {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };
      const question = 'Tell me about yourself';
      const answer = 'I am a software engineer';
      const userId = 'user123';

      const mockResult = {
        question,
        userAnswer: answer,
        aiFeedback: 'Good answer',
        improvementSuggestions: ['Add more specifics'],
        rating: 7,
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        json: () => Promise.resolve(mockResult),
        ok: true,
      } as Response);

      await geminiService.analyzeAnswer(context, question, answer, userId);

      // Verify validation and sanitization were called
      expect(mockValidateInterviewContext).toHaveBeenCalledWith(context);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.jobPosting);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.companyInfo);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.userCv);
      expect(mockSanitizeInput).toHaveBeenCalledWith(question);
      expect(mockSanitizeInput).toHaveBeenCalledWith(answer);
    });

    it('should log API requests and responses', async () => {
      const context = {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };
      const question = 'Tell me about yourself';
      const answer = 'I am a software engineer';
      const userId = 'user123';

      const mockResult = {
        question,
        userAnswer: answer,
        aiFeedback: 'Good answer',
        improvementSuggestions: ['Add more specifics'],
        rating: 7,
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        json: () => Promise.resolve(mockResult),
        ok: true,
      } as Response);

      await geminiService.analyzeAnswer(context, question, answer, userId);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Sending request to Gemini API'),
        expect.any(Object)
      );
    });

    it('should handle API errors gracefully', async () => {
      const context = {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };
      const question = 'Tell me about yourself';
      const answer = 'I am a software engineer';

      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('API Error'));

      const result = await geminiService.analyzeAnswer(context, question, answer);

      expect(result.question).toBe(question);
      expect(result.userAnswer).toBe(answer);
      expect(result.aiFeedback).toContain('Answer received');
      expect(result.improvementSuggestions).toHaveLength(3);
    });
  });

  describe('generateInterviewFlow', () => {
    it('should validate and sanitize context before processing', async () => {
      const context = {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };
      const numQuestions = 5;

      const mockQuestions = ['Question 1', 'Question 2'];
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        json: () => Promise.resolve({ questions: mockQuestions }),
        ok: true,
      } as Response);

      await geminiService.generateInterviewFlow(context, numQuestions);

      expect(mockValidateInterviewContext).toHaveBeenCalledWith(context);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.jobPosting);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.companyInfo);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.userCv);
    });

    it('should use retryWithBackoff for API calls', async () => {
      const context = {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };

      const mockQuestions = ['Question 1', 'Question 2'];
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        json: () => Promise.resolve({ questions: mockQuestions }),
        ok: true,
      } as Response);

      await geminiService.generateInterviewFlow(context, 5);

      expect(mockRetryWithBackoff).toHaveBeenCalled();
    });
  });

  describe('batchEvaluateAnswers', () => {
    it('should validate and sanitize all inputs before processing', async () => {
      const context = {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };
      const questions = ['Q1', 'Q2'];
      const answers = ['A1', 'A2'];

      const mockEvaluations = [{
        question: 'Q1',
        userAnswer: 'A1',
        aiFeedback: 'Feedback',
        improvementSuggestions: ['Suggestion'],
        rating: 7
      }];
      
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        json: () => Promise.resolve({ evaluations: mockEvaluations }),
        ok: true,
      } as Response);

      await geminiService.batchEvaluateAnswers(context, questions, answers);

      // Verify validation and sanitization were called
      expect(mockValidateInterviewContext).toHaveBeenCalledWith(context);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.jobPosting);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.companyInfo);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.userCv);
      expect(mockSanitizeInput).toHaveBeenCalledWith(questions[0]);
      expect(mockSanitizeInput).toHaveBeenCalledWith(answers[0]);
    });

    it('should handle batch evaluation errors gracefully', async () => {
      const context = {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };
      const questions = ['Q1', 'Q2'];
      const answers = ['A1', 'A2'];

      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('API Error'));

      const result = await geminiService.batchEvaluateAnswers(context, questions, answers);

      expect(result.evaluations).toHaveLength(2);
      expect(result.evaluations[0].question).toBe('Q1');
      expect(result.evaluations[0].userAnswer).toBe('A1');
      expect(result.evaluations[0].aiFeedback).toContain('Answer received');
    });
  });

  describe('generateSimilarQuestion', () => {
    it('should validate and sanitize inputs before processing', async () => {
      const context = {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };
      const originalQuestion = 'Original question';

      const mockSimilarQuestion = 'Similar question';
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        json: () => Promise.resolve({ question: mockSimilarQuestion }),
        ok: true,
      } as Response);

      await geminiService.generateSimilarQuestion(context, originalQuestion);

      expect(mockValidateInterviewContext).toHaveBeenCalledWith(context);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.jobPosting);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.companyInfo);
      expect(mockSanitizeInput).toHaveBeenCalledWith(context.userCv);
      expect(mockSanitizeInput).toHaveBeenCalledWith(originalQuestion);
    });

    it('should handle errors and return a fallback', async () => {
      const context = {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };
      const originalQuestion = 'Original question';

      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('API Error'));

      const result = await geminiService.generateSimilarQuestion(context, originalQuestion);

      expect(result).toContain('Similar question based on:');
    });
  });
});