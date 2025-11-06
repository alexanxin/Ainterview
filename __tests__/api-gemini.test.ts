import { POST } from '@/app/api/gemini/route';
import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { 
  getUserUsage,
  getDailyUsageCount,
  getUserInterviewsCompleted,
  recordUsage
} from '@/lib/database';
import { Logger } from '@/lib/logger';
import { validateInterviewContext, sanitizeInput } from '@/lib/validations';

// Mock next js specific modules
jest.mock('next/server');

// Mock the Google GenAI module
jest.mock('@google/genai');
const MockGoogleGenAI = GoogleGenAI as jest.MockedClass<typeof GoogleGenAI>;

// Mock the database functions
jest.mock('@/lib/database');
const mockGetUserUsage = getUserUsage as jest.MockedFunction<typeof getUserUsage>;
const mockGetDailyUsageCount = getDailyUsageCount as jest.MockedFunction<typeof getDailyUsageCount>;
const mockGetUserInterviewsCompleted = getUserInterviewsCompleted as jest.MockedFunction<typeof getUserInterviewsCompleted>;
const mockRecordUsage = recordUsage as jest.MockedFunction<typeof recordUsage>;

// Mock the logger
jest.mock('@/lib/logger');
const mockLogger = Logger as jest.Mocked<typeof Logger>;

// Mock the validations
jest.mock('@/lib/validations');
const mockValidateInterviewContext = validateInterviewContext as jest.MockedFunction<typeof validateInterviewContext>;
const mockSanitizeInput = sanitizeInput as jest.MockedFunction<typeof sanitizeInput>;

describe('Gemini API Route', () => {
  let mockReq: NextRequest;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.GEMINI_API_KEY = 'test-api-key';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Mock the NextRequest
    mockReq = {
      json: jest.fn(),
    } as unknown as NextRequest;

    // Set up mock implementations
    (mockReq.json as jest.Mock).mockResolvedValue({
      action: 'generateFlow',
      context: {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      },
      numQuestions: 5,
      userId: 'test-user-id',
    });

    // Mock database functions
    mockGetUserUsage.mockResolvedValue([]);
    mockGetDailyUsageCount.mockResolvedValue(0);
    mockGetUserInterviewsCompleted.mockResolvedValue(0);
    mockRecordUsage.mockResolvedValue(true);

    // Mock Logger
    mockLogger.info = jest.fn();
    mockLogger.warn = jest.fn();
    mockLogger.error = jest.fn();

    // Mock validation functions
    mockValidateInterviewContext.mockReturnValue(undefined);
    mockSanitizeInput.mockImplementation((input) => input);

    // Mock GoogleGenAI
    MockGoogleGenAI.mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockResolvedValue({
          text: () => 'Generated question from Gemini',
        }),
      },
    } as unknown as GoogleGenAI));
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('POST method', () => {
    it('should return an error when action is required', async () => {
      (mockReq.json as jest.Mock).mockResolvedValue({});

      const response = await POST(mockReq);
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody.error).toBe('Action is required');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Action is required')
      );
    });

    it('should validate context when provided', async () => {
      const mockContext = {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };
      
      (mockReq.json as jest.Mock).mockResolvedValue({
        action: 'generateFlow',
        context: mockContext,
        userId: 'test-user-id',
      });

      await POST(mockReq);

      expect(mockValidateInterviewContext).toHaveBeenCalledWith(mockContext);
    });

    it('should sanitize inputs when context is provided', async () => {
      const mockContext = {
        jobPosting: 'Software Engineer Position',
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };
      
      (mockReq.json as jest.Mock).mockResolvedValue({
        action: 'generateFlow',
        context: mockContext,
        userId: 'test-user-id',
      });

      await POST(mockReq);

      expect(mockSanitizeInput).toHaveBeenCalledWith(mockContext.jobPosting);
      expect(mockSanitizeInput).toHaveBeenCalledWith(mockContext.companyInfo);
      expect(mockSanitizeInput).toHaveBeenCalledWith(mockContext.userCv);
    });

    it('should handle usage quota checks', async () => {
      (mockReq.json as jest.Mock).mockResolvedValue({
        action: 'generateFlow',
        context: {
          jobPosting: 'Software Engineer Position',
          companyInfo: 'Tech Company',
          userCv: 'Relevant experience',
        },
        userId: 'test-user-id',
      });

      mockGetUserInterviewsCompleted.mockResolvedValue(1); // User has completed interview
      mockGetDailyUsageCount.mockResolvedValue(2); // At daily limit

      const response = await POST(mockReq);
      const responseBody = await response.json();

      expect(response.status).toBe(402);
      expect(responseBody.error).toBe('Free quota exceeded');
      expect(responseBody.needsPayment).toBe(true);
    });

    it('should use mock responses when API key is not set', async () => {
      delete process.env.GEMINI_API_KEY;

      (mockReq.json as jest.Mock).mockResolvedValue({
        action: 'generateQuestion',
        context: {
          jobPosting: 'Software Engineer Position',
          companyInfo: 'Tech Company',
          userCv: 'Relevant experience',
        },
        question: 'Test question',
        answer: 'Test answer',
        userId: 'test-user-id',
      });

      const response = await POST(mockReq);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody.question).toBeDefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('GEMINI_API_KEY environment variable is not set'),
        expect.any(Object)
      );
    });

    it('should record usage after successful processing', async () => {
      (mockReq.json as jest.Mock).mockResolvedValue({
        action: 'generateFlow',
        context: {
          jobPosting: 'Software Engineer Position',
          companyInfo: 'Tech Company',
          userCv: 'Relevant experience',
        },
        numQuestions: 3,
        userId: 'test-user-id',
      });

      const response = await POST(mockReq);

      expect(response.status).toBe(200);
      expect(mockRecordUsage).toHaveBeenCalled();
    });

    it('should handle analyzeAnswer action with input sanitization', async () => {
      (mockReq.json as jest.Mock).mockResolvedValue({
        action: 'analyzeAnswer',
        context: {
          jobPosting: 'Software Engineer Position',
          companyInfo: 'Tech Company',
          userCv: 'Relevant experience',
        },
        question: 'Tell me about yourself?',
        answer: 'I am a software engineer',
        userId: 'test-user-id',
      });

      await POST(mockReq);

      expect(mockSanitizeInput).toHaveBeenCalledWith('Tell me about yourself?');
      expect(mockSanitizeInput).toHaveBeenCalledWith('I am a software engineer');
    });

    it('should handle generateQuestion action with proper error handling', async () => {
      (mockReq.json as jest.Mock).mockResolvedValue({
        action: 'generateQuestion',
        context: {
          jobPosting: 'Software Engineer Position',
          companyInfo: 'Tech Company',
          userCv: 'Relevant experience',
        },
        userId: 'test-user-id',
      });

      // Mock the Google AI to throw an error
      MockGoogleGenAI.mockImplementation(() => {
        throw new Error('AI initialization failed');
      });

      const response = await POST(mockReq);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody.error).toBe('Internal server error');
    });

    it('should handle batch evaluation with proper input sanitization', async () => {
      const questions = ['Q1', 'Q2'];
      const answers = ['A1', 'A2'];

      (mockReq.json as jest.Mock).mockResolvedValue({
        action: 'batchEvaluate',
        context: {
          jobPosting: 'Software Engineer Position',
          companyInfo: 'Tech Company',
          userCv: 'Relevant experience',
        },
        questions,
        answers,
        userId: 'test-user-id',
      });

      await POST(mockReq);

      expect(mockSanitizeInput).toHaveBeenCalledWith('Q1');
      expect(mockSanitizeInput).toHaveBeenCalledWith('A1');
      expect(mockSanitizeInput).toHaveBeenCalledWith('Q2');
      expect(mockSanitizeInput).toHaveBeenCalledWith('A2');
    });

    it('should handle invalid context gracefully', async () => {
      const invalidContext = {
        jobPosting: 'Too short', // Will fail validation
        companyInfo: 'Tech Company',
        userCv: 'Relevant experience',
      };

      (mockReq.json as jest.Mock).mockResolvedValue({
        action: 'generateFlow',
        context: invalidContext,
        userId: 'test-user-id',
      });

      mockValidateInterviewContext.mockImplementation(() => {
        throw new Error('Invalid context');
      });

      const response = await POST(mockReq);
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody.error).toBe('Invalid context provided');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid context provided'),
        expect.any(Object)
      );
    });

    it('should handle rate limiting errors properly', async () => {
      (mockReq.json as jest.Mock).mockResolvedValue({
        action: 'generateFlow',
        context: {
          jobPosting: 'Software Engineer Position',
          companyInfo: 'Tech Company',
          userCv: 'Relevant experience',
        },
        userId: 'test-user-id',
      });

      // Mock GoogleGenAI to throw a rate limit error
      MockGoogleGenAI.mockImplementation(() => {
        throw new Error('Rate limit exceeded');
      });

      const response = await POST(mockReq);
      const responseBody = await response.json();

      expect(response.status).toBe(500); // Or 429 if rate limiting is handled differently
      expect(responseBody.error).toBe('Internal server error');
    });
  });
});