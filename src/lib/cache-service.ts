import {
  InterviewSession,
  InterviewQuestion,
  InterviewAnswer,
  UserProfile,
  UsageRecord,
} from "./database";
import type {
  Company,
  JobPost,
  ApplicantResponse,
} from "../types/b2b-types";

// Cache entry interface with timestamp for expiration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number; // milliseconds until expiry
}

// Cache storage for different data types
interface CacheStorage {
  userProfiles: Map<string, CacheEntry<UserProfile>>;
  interviewSessions: Map<string, CacheEntry<InterviewSession[]>>;
  interviewSessionById: Map<string, CacheEntry<InterviewSession | null>>;
  interviewQuestions: Map<string, CacheEntry<InterviewQuestion[]>>;
  interviewAnswers: Map<string, CacheEntry<InterviewAnswer[]>>;
  usageRecords: Map<string, CacheEntry<UsageRecord[]>>;
  userCredits: Map<string, CacheEntry<number>>;
  companies: Map<string, CacheEntry<Company | null>>;
  jobPosts: Map<string, CacheEntry<JobPost | null>>;
  jobPostsByUrl: Map<string, CacheEntry<JobPost | null>>;
  jobPostsByCompany: Map<string, CacheEntry<JobPost[]>>;
  applicantResponses: Map<string, CacheEntry<ApplicantResponse[]>>;
  applicantResponseById: Map<string, CacheEntry<ApplicantResponse | null>>;
}

// Initialize cache storage
const cacheStorage: CacheStorage = {
  userProfiles: new Map(),
  interviewSessions: new Map(),
  interviewSessionById: new Map(),
  interviewQuestions: new Map(),
  interviewAnswers: new Map(),
  usageRecords: new Map(),
  userCredits: new Map(),
  companies: new Map(),
  jobPosts: new Map(),
  jobPostsByUrl: new Map(),
  jobPostsByCompany: new Map(),
  applicantResponses: new Map(),
  applicantResponseById: new Map(),
};

// Cache configuration
const CACHE_CONFIG = {
  userProfile: 5 * 60 * 1000, // 5 minutes
  interviewSessions: 2 * 60 * 1000, // 2 minutes
  interviewSessionById: 10 * 60 * 1000, // 10 minutes
  interviewQuestions: 5 * 60 * 1000, // 5 minutes
  interviewAnswers: 5 * 60 * 1000, // 5 minutes
  usageRecords: 1 * 60 * 1000, // 1 minute (more volatile)
};

// Check if a cache entry is expired
function isExpired<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp > entry.expiry;
}

// Clean expired entries from a cache map
function cleanExpired<T>(cacheMap: Map<string, CacheEntry<T>>): void {
  for (const [key, entry] of cacheMap.entries()) {
    if (isExpired(entry)) {
      cacheMap.delete(key);
    }
  }
}

// Cache service implementation
export const cacheService = {
  // User Profile caching
  getUserProfile: (userId: string): UserProfile | undefined => {
    const entry = cacheStorage.userProfiles.get(userId);
    if (entry && !isExpired(entry)) {
      return entry.data;
    } else if (entry) {
      // Clean expired entry
      cacheStorage.userProfiles.delete(userId);
    }
    // Don't return cached null results - force fresh database queries for new users
    // This ensures profile completion checks work properly for users without profiles yet
    return undefined; // undefined means not in cache, always fetch fresh from database
  },

  setUserProfile: (userId: string, profile: UserProfile): void => {
    // Only cache non-null profiles - this ensures profile completion checks work properly
    const entry: CacheEntry<UserProfile> = {
      data: profile,
      timestamp: Date.now(),
      expiry: CACHE_CONFIG.userProfile,
    };
    cacheStorage.userProfiles.set(userId, entry);
  },

  invalidateUserProfile: (userId: string): void => {
    cacheStorage.userProfiles.delete(userId);
  },

  // Interview Sessions caching
  getUserInterviewSessions: (
    userId: string
  ): InterviewSession[] | undefined => {
    const entry = cacheStorage.interviewSessions.get(userId);
    if (entry && !isExpired(entry)) {
      return entry.data;
    } else if (entry) {
      // Clean expired entry
      cacheStorage.interviewSessions.delete(userId);
    }
    return undefined;
  },

  setUserInterviewSessions: (
    userId: string,
    sessions: InterviewSession[]
  ): void => {
    const entry: CacheEntry<InterviewSession[]> = {
      data: sessions,
      timestamp: Date.now(),
      expiry: CACHE_CONFIG.interviewSessions,
    };
    cacheStorage.interviewSessions.set(userId, entry);
  },

  invalidateUserInterviewSessions: (userId: string): void => {
    cacheStorage.interviewSessions.delete(userId);
  },

  // Single Interview Session caching
  getInterviewSessionById: (
    sessionId: string
  ): InterviewSession | null | undefined => {
    const entry = cacheStorage.interviewSessionById.get(sessionId);
    if (entry && !isExpired(entry)) {
      return entry.data;
    } else if (entry) {
      // Clean expired entry
      cacheStorage.interviewSessionById.delete(sessionId);
    }
    return undefined;
  },

  setInterviewSessionById: (
    sessionId: string,
    session: InterviewSession | null
  ): void => {
    const entry: CacheEntry<InterviewSession | null> = {
      data: session,
      timestamp: Date.now(),
      expiry: CACHE_CONFIG.interviewSessionById,
    };
    cacheStorage.interviewSessionById.set(sessionId, entry);
  },

  invalidateInterviewSessionById: (sessionId: string): void => {
    cacheStorage.interviewSessionById.delete(sessionId);
  },

  // Interview Questions caching
  getInterviewQuestions: (
    sessionId: string
  ): InterviewQuestion[] | undefined => {
    const entry = cacheStorage.interviewQuestions.get(sessionId);
    if (entry && !isExpired(entry)) {
      return entry.data;
    } else if (entry) {
      // Clean expired entry
      cacheStorage.interviewQuestions.delete(sessionId);
    }
    return undefined;
  },

  setInterviewQuestions: (
    sessionId: string,
    questions: InterviewQuestion[]
  ): void => {
    const entry: CacheEntry<InterviewQuestion[]> = {
      data: questions,
      timestamp: Date.now(),
      expiry: CACHE_CONFIG.interviewQuestions,
    };
    cacheStorage.interviewQuestions.set(sessionId, entry);
  },

  invalidateInterviewQuestions: (sessionId: string): void => {
    cacheStorage.interviewQuestions.delete(sessionId);
  },

  // Interview Answers caching
  getInterviewAnswers: (sessionId: string): InterviewAnswer[] | undefined => {
    const entry = cacheStorage.interviewAnswers.get(sessionId);
    if (entry && !isExpired(entry)) {
      return entry.data;
    } else if (entry) {
      // Clean expired entry
      cacheStorage.interviewAnswers.delete(sessionId);
    }
    return undefined;
  },

  setInterviewAnswers: (
    sessionId: string,
    answers: InterviewAnswer[]
  ): void => {
    const entry: CacheEntry<InterviewAnswer[]> = {
      data: answers,
      timestamp: Date.now(),
      expiry: CACHE_CONFIG.interviewAnswers,
    };
    cacheStorage.interviewAnswers.set(sessionId, entry);
  },

  invalidateInterviewAnswers: (sessionId: string): void => {
    cacheStorage.interviewAnswers.delete(sessionId);
  },

  // Usage Records caching
  getUserUsage: (userId: string, since?: string): UsageRecord[] | undefined => {
    const key = since ? `${userId}_${since}` : userId;
    const entry = cacheStorage.usageRecords.get(key);
    if (entry && !isExpired(entry)) {
      return entry.data;
    } else if (entry) {
      // Clean expired entry
      cacheStorage.usageRecords.delete(key);
    }
    return undefined;
  },

  setUserUsage: (
    userId: string,
    usage: UsageRecord[],
    since?: string
  ): void => {
    const key = since ? `${userId}_${since}` : userId;
    const entry: CacheEntry<UsageRecord[]> = {
      data: usage,
      timestamp: Date.now(),
      expiry: CACHE_CONFIG.usageRecords,
    };
    cacheStorage.usageRecords.set(key, entry);
  },

  invalidateUserUsage: (userId: string, since?: string): void => {
    const key = since ? `${userId}_${since}` : userId;
    cacheStorage.usageRecords.delete(key);
  },

  // Clear all caches
  clearAll: (): void => {
    cacheStorage.userProfiles.clear();
    cacheStorage.interviewSessions.clear();
    cacheStorage.interviewSessionById.clear();
    cacheStorage.interviewQuestions.clear();
    cacheStorage.interviewAnswers.clear();
    cacheStorage.usageRecords.clear();
  },

  // Clean expired entries from all caches
  cleanExpired: (): void => {
    cleanExpired(cacheStorage.userProfiles);
    cleanExpired(cacheStorage.interviewSessions);
    cleanExpired(cacheStorage.interviewSessionById);
    cleanExpired(cacheStorage.interviewQuestions);
    cleanExpired(cacheStorage.interviewAnswers);
    cleanExpired(cacheStorage.usageRecords);
  },

  // User Credits caching
  getUserCredits: (userId: string): number | undefined => {
    const entry = cacheStorage.userCredits.get(userId);
    if (entry && !isExpired(entry)) {
      return entry.data;
    } else if (entry) {
      // Clean expired entry
      cacheStorage.userCredits.delete(userId);
    }
    return undefined; // undefined means not in cache
  },

  setUserCredits: (userId: string, credits: number): void => {
    const entry: CacheEntry<number> = {
      data: credits,
      timestamp: Date.now(),
      expiry: CACHE_CONFIG.userProfile, // Use same expiry as profiles (5 min)
    };
    cacheStorage.userCredits.set(userId, entry);
  },

  invalidateUserCredits: (userId: string): void => {
    cacheStorage.userCredits.delete(userId);
  },

  // Company caching
  getCompanyByUserId: (userId: string): Company | undefined | null => {
    const entry = cacheStorage.companies.get(userId);
    if (entry && !isExpired(entry)) {
      return entry.data;
    } else if (entry) {
      // Clean expired entry
      cacheStorage.companies.delete(userId);
    }
    return undefined; // undefined means not in cache
  },

  setCompanyByUserId: (userId: string, company: Company | null): void => {
    const entry: CacheEntry<Company | null> = {
      data: company,
      timestamp: Date.now(),
      expiry: CACHE_CONFIG.userProfile, // Use same expiry as profiles (5 min)
    };
    cacheStorage.companies.set(userId, entry);
  },

  invalidateCompanyByUserId: (userId: string): void => {
    cacheStorage.companies.delete(userId);
  },

  // Job Post caching
  getJobPostById: (jobPostId: string): JobPost | undefined | null => {
    const entry = cacheStorage.jobPosts.get(jobPostId);
    if (entry && !isExpired(entry)) {
      return entry.data;
    } else if (entry) {
      // Clean expired entry
      cacheStorage.jobPosts.delete(jobPostId);
    }
    return undefined; // undefined means not in cache
  },

  setJobPostById: (jobPostId: string, jobPost: JobPost | null): void => {
    const entry: CacheEntry<JobPost | null> = {
      data: jobPost,
      timestamp: Date.now(),
      expiry: CACHE_CONFIG.interviewSessionById, // Use similar expiry as sessions (10 min)
    };
    cacheStorage.jobPosts.set(jobPostId, entry);
  },

  invalidateJobPostById: (jobPostId: string): void => {
    cacheStorage.jobPosts.delete(jobPostId);
  },

  getJobPostByShareableUrl: (shareableUrl: string): JobPost | undefined | null => {
    const entry = cacheStorage.jobPostsByUrl.get(shareableUrl);
    if (entry && !isExpired(entry)) {
      return entry.data;
    } else if (entry) {
      // Clean expired entry
      cacheStorage.jobPostsByUrl.delete(shareableUrl);
    }
    return undefined; // undefined means not in cache
  },

  setJobPostByShareableUrl: (shareableUrl: string, jobPost: JobPost | null): void => {
    const entry: CacheEntry<JobPost | null> = {
      data: jobPost,
      timestamp: Date.now(),
      expiry: CACHE_CONFIG.interviewSessionById, // Use similar expiry as sessions (10 min)
    };
    cacheStorage.jobPostsByUrl.set(shareableUrl, entry);
  },

  // Job Posts by Company caching
  getJobPostsByCompany: (companyId: string): JobPost[] | undefined => {
    const entry = cacheStorage.jobPostsByCompany.get(companyId);
    if (entry && !isExpired(entry)) {
      return entry.data;
    } else if (entry) {
      // Clean expired entry
      cacheStorage.jobPostsByCompany.delete(companyId);
    }
    return undefined; // undefined means not in cache
  },

  setJobPostsByCompany: (companyId: string, jobPosts: JobPost[]): void => {
    const entry: CacheEntry<JobPost[]> = {
      data: jobPosts,
      timestamp: Date.now(),
      expiry: CACHE_CONFIG.interviewSessions, // Use same expiry as sessions (2 min)
    };
    cacheStorage.jobPostsByCompany.set(companyId, entry);
  },

  invalidateJobPostsByCompany: (companyId: string): void => {
    cacheStorage.jobPostsByCompany.delete(companyId);
  },

  // Applicant Response caching
  getApplicantResponsesByJobPost: (jobPostId: string): ApplicantResponse[] | undefined => {
    const entry = cacheStorage.applicantResponses.get(jobPostId);
    if (entry && !isExpired(entry)) {
      return entry.data;
    } else if (entry) {
      // Clean expired entry
      cacheStorage.applicantResponses.delete(jobPostId);
    }
    return undefined; // undefined means not in cache
  },

  setApplicantResponsesByJobPost: (jobPostId: string, responses: ApplicantResponse[]): void => {
    const entry: CacheEntry<ApplicantResponse[]> = {
      data: responses,
      timestamp: Date.now(),
      expiry: CACHE_CONFIG.interviewAnswers, // Use same expiry as answers (5 min)
    };
    cacheStorage.applicantResponses.set(jobPostId, entry);
  },

  invalidateApplicantResponsesByJobPost: (jobPostId: string): void => {
    cacheStorage.applicantResponses.delete(jobPostId);
  },

  getApplicantResponseById: (responseId: string): ApplicantResponse | undefined | null => {
    const entry = cacheStorage.applicantResponseById.get(responseId);
    if (entry && !isExpired(entry)) {
      return entry.data;
    } else if (entry) {
      // Clean expired entry
      cacheStorage.applicantResponseById.delete(responseId);
    }
    return undefined; // undefined means not in cache
  },

  setApplicantResponseById: (responseId: string, response: ApplicantResponse | null): void => {
    const entry: CacheEntry<ApplicantResponse | null> = {
      data: response,
      timestamp: Date.now(),
      expiry: CACHE_CONFIG.interviewSessionById, // Use similar expiry as sessions (10 min)
    };
    cacheStorage.applicantResponseById.set(responseId, entry);
  },

  invalidateApplicantResponseById: (responseId: string): void => {
    cacheStorage.applicantResponseById.delete(responseId);
  },

  // Get cache statistics
  getStats: (): { [key: string]: number } => {
    return {
      userProfiles: cacheStorage.userProfiles.size,
      interviewSessions: cacheStorage.interviewSessions.size,
      interviewSessionById: cacheStorage.interviewSessionById.size,
      interviewQuestions: cacheStorage.interviewQuestions.size,
      interviewAnswers: cacheStorage.interviewAnswers.size,
      usageRecords: cacheStorage.usageRecords.size,
      userCredits: cacheStorage.userCredits.size,
      companies: cacheStorage.companies.size,
      jobPosts: cacheStorage.jobPosts.size,
      jobPostsByUrl: cacheStorage.jobPostsByUrl.size,
      jobPostsByCompany: cacheStorage.jobPostsByCompany.size,
      applicantResponses: cacheStorage.applicantResponses.size,
      applicantResponseById: cacheStorage.applicantResponseById.size,
    };
  },
};

// Cache decorator utility for async functions
export function cachedAsync<T>(
  cacheKey: (args: unknown[]) => string,
  cacheGetter: (key: string) => T | undefined,
  cacheSetter: (key: string, value: T) => void,
  expiryTime: number = 5 * 60 * 1000 // 5 minutes default
) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const key = cacheKey(args);
      const cachedResult = cacheGetter(key);

      if (cachedResult !== undefined) {
        return cachedResult;
      }

      const result = await originalMethod.apply(this, args);
      cacheSetter(key, result);

      return result;
    };

    return descriptor;
  };
}
