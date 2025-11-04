import {
  InterviewSession,
  InterviewQuestion,
  InterviewAnswer,
  UserProfile,
  UsageRecord,
} from "./database";

// Define cache keys for different data types
const CACHE_KEYS = {
  USER_PROFILE: "cache_user_profile_",
  INTERVIEW_SESSIONS: "cache_interview_sessions_",
  INTERVIEW_SESSION: "cache_interview_session_",
  INTERVIEW_QUESTIONS: "cache_interview_questions_",
  INTERVIEW_ANSWERS: "cache_interview_answers_",
  USAGE_RECORDS: "cache_usage_records_",
  CACHE_METADATA: "cache_metadata",
};

// Cache metadata interface to track expiration
interface CacheMetadata {
  [key: string]: {
    expiry: number; // timestamp when cache expires
  };
}

// Cache service using localStorage for persistence
export class LocalStorageCacheService {
  private static instance: LocalStorageCacheService;
  private metadata: CacheMetadata = {};

  private constructor() {
    this.loadMetadata();
  }

  public static getInstance(): LocalStorageCacheService {
    if (!LocalStorageCacheService.instance) {
      LocalStorageCacheService.instance = new LocalStorageCacheService();
    }
    return LocalStorageCacheService.instance;
  }

  // Load cache metadata from localStorage
  private loadMetadata(): void {
    try {
      const metadataStr = localStorage.getItem(CACHE_KEYS.CACHE_METADATA);
      if (metadataStr) {
        this.metadata = JSON.parse(metadataStr);
      }
    } catch (error) {
      console.warn("Failed to load cache metadata:", error);
      this.metadata = {};
    }
  }

  // Save cache metadata to localStorage
  private saveMetadata(): void {
    try {
      localStorage.setItem(
        CACHE_KEYS.CACHE_METADATA,
        JSON.stringify(this.metadata)
      );
    } catch (error) {
      console.warn("Failed to save cache metadata:", error);
    }
  }

  // Check if a cache entry is expired
  private isExpired(key: string): boolean {
    const meta = this.metadata[key];
    if (!meta) return true; // If no metadata, consider it expired
    return Date.now() > meta.expiry;
  }

  // Clean expired entries
  private cleanExpired(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (const [key, meta] of Object.entries(this.metadata)) {
      if (now > meta.expiry) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      try {
        localStorage.removeItem(key);
        delete this.metadata[key];
      } catch (error) {
        console.warn(`Failed to remove expired cache entry ${key}:`, error);
      }
    }

    if (keysToRemove.length > 0) {
      this.saveMetadata();
    }
  }

  // Get user profile from cache
  getUserProfile(userId: string): UserProfile | null | undefined {
    this.cleanExpired();
    const key = CACHE_KEYS.USER_PROFILE + userId;

    if (this.isExpired(key)) {
      this.remove(key);
      return undefined;
    }

    try {
      const cached = localStorage.getItem(key);
      if (cached === null) return undefined;
      return JSON.parse(cached);
    } catch (error) {
      console.warn(`Failed to parse cached user profile for ${userId}:`, error);
      this.remove(key);
      return undefined;
    }
  }

  // Set user profile in cache
  setUserProfile(
    userId: string,
    profile: UserProfile | null,
    ttl: number = 5 * 60 * 1000
  ): void {
    const key = CACHE_KEYS.USER_PROFILE + userId;
    try {
      localStorage.setItem(key, JSON.stringify(profile));
      this.metadata[key] = { expiry: Date.now() + ttl };
      this.saveMetadata();
    } catch (error) {
      console.warn(`Failed to cache user profile for ${userId}:`, error);
    }
  }

  // Get interview sessions from cache
  getUserInterviewSessions(userId: string): InterviewSession[] | undefined {
    this.cleanExpired();
    const key = CACHE_KEYS.INTERVIEW_SESSIONS + userId;

    if (this.isExpired(key)) {
      this.remove(key);
      return undefined;
    }

    try {
      const cached = localStorage.getItem(key);
      if (cached === null) return undefined;
      return JSON.parse(cached);
    } catch (error) {
      console.warn(
        `Failed to parse cached interview sessions for ${userId}:`,
        error
      );
      this.remove(key);
      return undefined;
    }
  }

  // Set interview sessions in cache
  setUserInterviewSessions(
    userId: string,
    sessions: InterviewSession[],
    ttl: number = 2 * 60 * 1000
  ): void {
    const key = CACHE_KEYS.INTERVIEW_SESSIONS + userId;
    try {
      localStorage.setItem(key, JSON.stringify(sessions));
      this.metadata[key] = { expiry: Date.now() + ttl };
      this.saveMetadata();
    } catch (error) {
      console.warn(`Failed to cache interview sessions for ${userId}:`, error);
    }
  }

  // Get single interview session from cache
  getInterviewSessionById(
    sessionId: string
  ): InterviewSession | null | undefined {
    this.cleanExpired();
    const key = CACHE_KEYS.INTERVIEW_SESSION + sessionId;

    if (this.isExpired(key)) {
      this.remove(key);
      return undefined;
    }

    try {
      const cached = localStorage.getItem(key);
      if (cached === null) return undefined;
      return JSON.parse(cached);
    } catch (error) {
      console.warn(
        `Failed to parse cached interview session ${sessionId}:`,
        error
      );
      this.remove(key);
      return undefined;
    }
  }

  // Set single interview session in cache
  setInterviewSessionById(
    sessionId: string,
    session: InterviewSession | null,
    ttl: number = 10 * 60 * 1000
  ): void {
    const key = CACHE_KEYS.INTERVIEW_SESSION + sessionId;
    try {
      localStorage.setItem(key, JSON.stringify(session));
      this.metadata[key] = { expiry: Date.now() + ttl };
      this.saveMetadata();
    } catch (error) {
      console.warn(`Failed to cache interview session ${sessionId}:`, error);
    }
  }

  // Get interview questions from cache
  getInterviewQuestions(sessionId: string): InterviewQuestion[] | undefined {
    this.cleanExpired();
    const key = CACHE_KEYS.INTERVIEW_QUESTIONS + sessionId;

    if (this.isExpired(key)) {
      this.remove(key);
      return undefined;
    }

    try {
      const cached = localStorage.getItem(key);
      if (cached === null) return undefined;
      return JSON.parse(cached);
    } catch (error) {
      console.warn(
        `Failed to parse cached interview questions for session ${sessionId}:`,
        error
      );
      this.remove(key);
      return undefined;
    }
  }

  // Set interview questions in cache
  setInterviewQuestions(
    sessionId: string,
    questions: InterviewQuestion[],
    ttl: number = 5 * 60 * 1000
  ): void {
    const key = CACHE_KEYS.INTERVIEW_QUESTIONS + sessionId;
    try {
      localStorage.setItem(key, JSON.stringify(questions));
      this.metadata[key] = { expiry: Date.now() + ttl };
      this.saveMetadata();
    } catch (error) {
      console.warn(
        `Failed to cache interview questions for session ${sessionId}:`,
        error
      );
    }
  }

  // Get interview answers from cache
  getInterviewAnswers(sessionId: string): InterviewAnswer[] | undefined {
    this.cleanExpired();
    const key = CACHE_KEYS.INTERVIEW_ANSWERS + sessionId;

    if (this.isExpired(key)) {
      this.remove(key);
      return undefined;
    }

    try {
      const cached = localStorage.getItem(key);
      if (cached === null) return undefined;
      return JSON.parse(cached);
    } catch (error) {
      console.warn(
        `Failed to parse cached interview answers for session ${sessionId}:`,
        error
      );
      this.remove(key);
      return undefined;
    }
  }

  // Set interview answers in cache
  setInterviewAnswers(
    sessionId: string,
    answers: InterviewAnswer[],
    ttl: number = 5 * 60 * 1000
  ): void {
    const key = CACHE_KEYS.INTERVIEW_ANSWERS + sessionId;
    try {
      localStorage.setItem(key, JSON.stringify(answers));
      this.metadata[key] = { expiry: Date.now() + ttl };
      this.saveMetadata();
    } catch (error) {
      console.warn(
        `Failed to cache interview answers for session ${sessionId}:`,
        error
      );
    }
  }

  // Get usage records from cache
  getUserUsage(userId: string, since?: string): UsageRecord[] | undefined {
    this.cleanExpired();
    const key =
      CACHE_KEYS.USAGE_RECORDS + (since ? `${userId}_${since}` : userId);

    if (this.isExpired(key)) {
      this.remove(key);
      return undefined;
    }

    try {
      const cached = localStorage.getItem(key);
      if (cached === null) return undefined;
      return JSON.parse(cached);
    } catch (error) {
      console.warn(
        `Failed to parse cached usage records for ${userId}:`,
        error
      );
      this.remove(key);
      return undefined;
    }
  }

  // Set usage records in cache
  setUserUsage(
    userId: string,
    usage: UsageRecord[],
    since?: string,
    ttl: number = 1 * 60 * 1000
  ): void {
    const key =
      CACHE_KEYS.USAGE_RECORDS + (since ? `${userId}_${since}` : userId);
    try {
      localStorage.setItem(key, JSON.stringify(usage));
      this.metadata[key] = { expiry: Date.now() + ttl };
      this.saveMetadata();
    } catch (error) {
      console.warn(`Failed to cache usage records for ${userId}:`, error);
    }
  }

  // Remove specific cache entry
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
      delete this.metadata[key];
      this.saveMetadata();
    } catch (error) {
      console.warn(`Failed to remove cache entry ${key}:`, error);
    }
  }

  // Clear all cache entries
  clearAll(): void {
    try {
      // Remove all cache entries based on keys
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("cache_")
      );

      for (const key of keys) {
        localStorage.removeItem(key);
      }

      this.metadata = {};
      this.saveMetadata();
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  }

  // Get cache statistics
  getStats(): { [key: string]: number } {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("cache_")
      );

      const stats: { [key: string]: number } = {};
      for (const key of keys) {
        if (key === CACHE_KEYS.CACHE_METADATA) continue;

        if (key.startsWith(CACHE_KEYS.USER_PROFILE)) {
          stats.userProfiles = (stats.userProfiles || 0) + 1;
        } else if (key.startsWith(CACHE_KEYS.INTERVIEW_SESSIONS)) {
          stats.interviewSessions = (stats.interviewSessions || 0) + 1;
        } else if (key.startsWith(CACHE_KEYS.INTERVIEW_SESSION)) {
          stats.interviewSessionById = (stats.interviewSessionById || 0) + 1;
        } else if (key.startsWith(CACHE_KEYS.INTERVIEW_QUESTIONS)) {
          stats.interviewQuestions = (stats.interviewQuestions || 0) + 1;
        } else if (key.startsWith(CACHE_KEYS.INTERVIEW_ANSWERS)) {
          stats.interviewAnswers = (stats.interviewAnswers || 0) + 1;
        } else if (key.startsWith(CACHE_KEYS.USAGE_RECORDS)) {
          stats.usageRecords = (stats.usageRecords || 0) + 1;
        }
      }

      return stats;
    } catch (error) {
      console.warn("Failed to get cache stats:", error);
      return {};
    }
  }
}

// Create singleton instance
export const localStorageCacheService = LocalStorageCacheService.getInstance();
