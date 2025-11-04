import { cacheService } from "./cache-service";
import { localStorageCacheService } from "./local-storage-cache";

// Service to handle cache refresh logic when new AI feedback is submitted
export class CacheRefreshService {
  // Method to refresh cache when new AI feedback is submitted for a session
  static async refreshCacheForSession(sessionId: string): Promise<void> {
    try {
      // Invalidate the specific session in cache
      cacheService.invalidateInterviewSessionById(sessionId);
      localStorageCacheService.remove(`cache_interview_session_${sessionId}`);

      // Invalidate questions and answers for this session
      cacheService.invalidateInterviewQuestions(sessionId);
      localStorageCacheService.remove(`cache_interview_questions_${sessionId}`);

      cacheService.invalidateInterviewAnswers(sessionId);
      localStorageCacheService.remove(`cache_interview_answers_${sessionId}`);

      console.log(`Cache refreshed for session: ${sessionId}`);
    } catch (error) {
      console.error("Error refreshing cache for session:", error);
    }
  }

  // Method to refresh cache for a user's sessions
  static async refreshCacheForUser(userId: string): Promise<void> {
    try {
      // Invalidate user profile cache
      cacheService.invalidateUserProfile(userId);
      localStorageCacheService.remove(`cache_user_profile_${userId}`);

      // Invalidate user's interview sessions list
      cacheService.invalidateUserInterviewSessions(userId);
      localStorageCacheService.remove(`cache_interview_sessions_${userId}`);

      console.log(`Cache refreshed for user: ${userId}`);
    } catch (error) {
      console.error("Error refreshing cache for user:", error);
    }
  }

  // Method to refresh cache when new usage is recorded
  static async refreshUsageCache(
    userId: string,
    since?: string
  ): Promise<void> {
    try {
      // Invalidate user usage cache
      cacheService.invalidateUserUsage(userId, since);
      const cacheKey = since ? `${userId}_${since}` : userId;
      localStorageCacheService.remove(`cache_usage_records_${cacheKey}`);

      console.log(`Usage cache refreshed for user: ${userId}`);
    } catch (error) {
      console.error("Error refreshing usage cache:", error);
    }
  }

  // Method to refresh all caches (for major updates)
  static async refreshAllCaches(): Promise<void> {
    try {
      cacheService.clearAll();
      localStorageCacheService.clearAll();

      console.log("All caches refreshed");
    } catch (error) {
      console.error("Error refreshing all caches:", error);
    }
  }
}

// Export the class itself
export const cacheRefreshService = CacheRefreshService;
