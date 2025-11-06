import { 
  getUserProfile,
  updateUserProfile,
  UserProfile,
  getInterviewSessionsByUser,
  createInterviewSession,
  getQuestionsBySession,
  getAnswersBySession,
  createInterviewQuestion,
  createInterviewAnswer,
  getUserInterviewsCompleted,
  getDailyUsageCount,
  recordUsage,
  getUserUsage
} from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { cacheService } from '@/lib/cache-service';
import { localStorageCacheService } from '@/lib/local-storage-cache';
import { validateUserProfile, sanitizeInput } from '@/lib/validations';
import { Logger } from '@/lib/logger';
import { retryWithBackoff } from '@/lib/utils/retry-with-backoff';

// Mock the supabase client
jest.mock('@/lib/supabase');
// Mock the cache service
jest.mock('@/lib/cache-service');
// Mock the localStorage cache service
jest.mock('@/lib/local-storage-cache');
// Mock validation functions
jest.mock('@/lib/validations');
// Mock the logger
jest.mock('@/lib/logger');
// Mock the retry utility
jest.mock('@/lib/utils/retry-with-backoff');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockCacheService = cacheService as jest.Mocked<typeof cacheService>;
const mockLocalStorageCacheService = localStorageCacheService as jest.Mocked<typeof localStorageCacheService>;
const mockValidateUserProfile = validateUserProfile as jest.MockedFunction<typeof validateUserProfile>;
const mockSanitizeInput = sanitizeInput as jest.MockedFunction<typeof sanitizeInput>;
const mockLogger = Logger as jest.Mocked<typeof Logger>;
const mockRetryWithBackoff = retryWithBackoff as jest.MockedFunction<typeof retryWithBackoff>;

describe('Database Service with Enhanced Features', () => {
  const userId = 'test-user-id';
  const mockProfile: UserProfile = {
    id: userId,
    full_name: 'John Doe',
    email: 'john@example.com',
    bio: 'Software engineer',
    experience: '5 years of experience',
    education: 'BSc Computer Science',
    skills: 'React, TypeScript, Node.js',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default return values for mocked services
    mockCacheService.getUserProfile.mockReturnValue(undefined); // Not in cache initially
    mockLocalStorageCacheService.getUserProfile.mockReturnValue(undefined); // Not in localStorage cache initially
    mockValidateUserProfile.mockReturnValue(mockProfile);
    mockSanitizeInput.mockImplementation((input: string) => input); // Return input unchanged for testing
    mockRetryWithBackoff.mockImplementation(async (fn) => await fn()); // Execute function immediately without retrying

    // Default logger mock
    mockLogger.info = jest.fn();
    mockLogger.warn = jest.fn();
    mockLogger.error = jest.fn();
  });

  describe('getUserProfile with enhanced error handling', () => {
    it('should retrieve from cache if available in-memory', async () => {
      const cachedProfile = { ...mockProfile, bio: 'Cached bio' };
      mockCacheService.getUserProfile.mockReturnValue(cachedProfile);

      const result = await getUserProfile(userId);

      expect(result).toEqual(cachedProfile);
      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Retrieved profile from in-memory cache'),
        expect.any(Object)
      );
    });

    it('should retrieve from localStorage cache if available', async () => {
      const cachedProfile = { ...mockProfile, bio: 'localStorage bio' };
      mockCacheService.getUserProfile.mockReturnValue(undefined); // Not in memory cache
      mockLocalStorageCacheService.getUserProfile.mockReturnValue(cachedProfile);

      const result = await getUserProfile(userId);

      expect(result).toEqual(cachedProfile);
      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(mockCacheService.setUserProfile).toHaveBeenCalledWith(userId, cachedProfile);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Retrieved profile from localStorage cache'),
        expect.any(Object)
      );
    });

    it('should fetch from database and store in caches', async () => {
      const mockDbResult = { data: mockProfile, error: null };
      const mockFromResult = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockDbResult),
        single: jest.fn().mockResolvedValue(mockDbResult),
      };
      mockSupabase.from.mockReturnValue(mockFromResult);

      const result = await getUserProfile(userId);

      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockFromResult.select).toHaveBeenCalledWith('*');
      expect(mockFromResult.eq).toHaveBeenCalledWith('id', userId);
      expect(mockFromResult.single).toHaveBeenCalled();
      expect(mockCacheService.setUserProfile).toHaveBeenCalledWith(userId, mockProfile);
      expect(mockLocalStorageCacheService.setUserProfile).toHaveBeenCalledWith(userId, mockProfile);
    });

    it('should handle database errors and cache null result', async () => {
      const mockDbResult = { data: null, error: { message: 'Not found' } };
      const mockFromResult = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockDbResult),
        single: jest.fn().mockResolvedValue(mockDbResult),
      };
      mockSupabase.from.mockReturnValue(mockFromResult);

      const result = await getUserProfile(userId);

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching user profile'),
        expect.any(Object)
      );
      expect(mockCacheService.setUserProfile).toHaveBeenCalledWith(userId, null);
      expect(mockLocalStorageCacheService.setUserProfile).toHaveBeenCalledWith(userId, null);
    });

    it('should use retryWithBackoff for database operations', async () => {
      const mockDbResult = { data: mockProfile, error: null };
      const mockFromResult = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockDbResult),
        single: jest.fn().mockResolvedValue(mockDbResult),
      };
      mockSupabase.from.mockReturnValue(mockFromResult);

      await getUserProfile(userId);

      expect(mockRetryWithBackoff).toHaveBeenCalled();
    });
  });

  describe('updateUserProfile with enhanced validation and sanitization', () => {
    it('should validate and sanitize profile data before updating', async () => {
      const updatedProfile = {
        id: userId,
        full_name: 'Updated Name',
        bio: 'Updated bio with <script>alert("xss")</script>',
        email: 'updated@example.com',
      };

      const mockFromResult = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [updatedProfile], error: null }),
      };
      mockSupabase.from.mockReturnValue(mockFromResult);

      const success = await updateUserProfile(userId, updatedProfile);

      expect(success).toBe(true);
      expect(mockValidateUserProfile).toHaveBeenCalledWith(updatedProfile);
      expect(mockSanitizeInput).toHaveBeenCalledWith(updatedProfile.full_name);
      expect(mockSanitizeInput).toHaveBeenCalledWith(updatedProfile.bio);
      // Verify that sanitized data is what gets passed to Supabase
      expect(mockFromResult.update).toHaveBeenCalledWith(expect.objectContaining({
        full_name: 'Updated Name', // This is what would be passed after sanitization
        bio: 'Updated bio with ' // The script part would be removed
      }));
    });

    it('should handle insert when no profile exists', async () => {
      // Simulate update returning empty data (no profile exists)
      const mockUpdateResult = { data: [], error: null };
      // Simulate insert succeeding
      const mockInsertResult = { data: [mockProfile], error: null };

      const mockFromResult = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn()
          .mockResolvedValueOnce(mockUpdateResult) // First call (update) returns empty
          .mockResolvedValueOnce(mockInsertResult), // Second call (insert) succeeds
      };
      mockSupabase.from.mockReturnValue(mockFromResult);

      const success = await updateUserProfile(userId, mockProfile);

      expect(success).toBe(true);
      expect(mockFromResult.update).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenNthCalledWith(2, 'profiles'); // Called twice for insert
    });

    it('should invalidate cache after successful update', async () => {
      const updatedProfile = { ...mockProfile, bio: 'Updated bio' };
      const mockDbResult = { data: [updatedProfile], error: null };
      const mockFromResult = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockDbResult),
      };
      mockSupabase.from.mockReturnValue(mockFromResult);

      await updateUserProfile(userId, updatedProfile);

      expect(mockCacheService.invalidateUserProfile).toHaveBeenCalledWith(userId);
      expect(mockLocalStorageCacheService.remove).toHaveBeenCalledWith(`cache_user_profile_${userId}`);
    });

    it('should handle errors and return false', async () => {
      const mockDbResult = { data: null, error: { message: 'Update failed' } };
      const mockFromResult = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockDbResult),
      };
      mockSupabase.from.mockReturnValue(mockFromResult);

      const success = await updateUserProfile(userId, mockProfile);

      expect(success).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error updating user profile'),
        expect.any(Object)
      );
    });

    it('should use retryWithBackoff for database operations', async () => {
      const updatedProfile = { ...mockProfile, bio: 'Updated bio' };
      const mockDbResult = { data: [updatedProfile], error: null };
      const mockFromResult = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockDbResult),
      };
      mockSupabase.from.mockReturnValue(mockFromResult);

      await updateUserProfile(userId, updatedProfile);

      expect(mockRetryWithBackoff).toHaveBeenCalled();
    });
  });

  describe('Other database functions', () => {
    it('should have proper logging for all database operations', async () => {
      const mockSessions = [{ id: 'session1', user_id: userId, title: 'Test Session' }];
      const mockDbResult = { data: mockSessions, error: null };
      const mockFromResult = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockDbResult),
        order: jest.fn().mockResolvedValue(mockDbResult),
      };
      mockSupabase.from.mockReturnValue(mockFromResult);

      const result = await getInterviewSessionsByUser(userId);

      expect(result).toEqual(mockSessions);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetching'),
        expect.any(Object)
      );
    });
  });
});