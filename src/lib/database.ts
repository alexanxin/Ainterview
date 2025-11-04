import { supabase } from "./supabase";
import { supabaseServer } from "./supabase-server";
import { cacheService } from "./cache-service";
import { localStorageCacheService } from "./local-storage-cache";

// Type definitions
export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  experience?: string;
  education?: string;
  skills?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InterviewSession {
  id?: string;
  user_id: string;
  job_posting: string;
  company_info?: string;
  user_cv?: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  completed?: boolean;
  total_questions?: number;
}

export interface InterviewQuestion {
  id?: string;
  session_id: string;
  question_text: string;
  question_number: number;
  created_at?: string;
}

export interface InterviewAnswer {
  id?: string;
  question_id: string;
  session_id: string;
  user_answer: string;
  ai_feedback?: string;
  improvement_suggestions?: string[];
  rating?: number;
  created_at?: string;
}

export interface UsageRecord {
  id?: string;
  user_id: string;
  action: string;
  cost?: number;
  free_interview_used?: boolean;
  interviews_completed?: number;
  created_at?: string;
}

// Profile operations
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  // First check in-memory cache
  const cachedProfile = cacheService.getUserProfile(userId);
  if (cachedProfile !== undefined) {
    return cachedProfile;
  }

  // Then check localStorage cache
  const cachedProfileLS = localStorageCacheService.getUserProfile(userId);
  if (cachedProfileLS !== undefined) {
    if (cachedProfileLS !== null) {
      // Update in-memory cache with localStorage data
      cacheService.setUserProfile(userId, cachedProfileLS);
    }
    return cachedProfileLS;
  }

  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return null;
  }

  const result = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (result.error) {
    console.error("Error fetching user profile:", result.error);
    // Cache the null result to avoid repeated failed requests
    cacheService.setUserProfile(userId, null);
    localStorageCacheService.setUserProfile(userId, null);
    return null;
  }

  // Cache the result in both memory and localStorage
  cacheService.setUserProfile(userId, result.data);
  localStorageCacheService.setUserProfile(userId, result.data);

  return result.data;
}

export async function updateUserProfile(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<boolean> {
  console.log("updateUserProfile called with:", { userId, profileData });

  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return false;
  }

  // First try to update existing profile
  const updateResult = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", userId)
    .select();

  console.log("Update attempt result:", {
    updateError: updateResult.error,
    updateData: updateResult.data,
  });

  // If update succeeded but no rows were affected (profile doesn't exist), try insert
  if (
    updateResult.error === null &&
    (!updateResult.data || updateResult.data.length === 0)
  ) {
    console.log("No existing profile found, trying insert...");
    // If update fails, try to insert new profile
    const data = { id: userId, ...profileData };
    console.log("Inserting data:", data);
    const insertResult = await supabase.from("profiles").insert(data).select();

    console.log("Insert attempt result:", {
      insertError: insertResult.error,
      insertData: insertResult.data,
    });

    if (insertResult.error) {
      console.error("Error inserting user profile:", insertResult.error);
      return false;
    }
  } else if (updateResult.error) {
    console.error("Error updating user profile:", updateResult.error);
    return false;
  }

  // Invalidate cache since we updated the profile
  cacheService.invalidateUserProfile(userId);
  localStorageCacheService.remove(`cache_user_profile_${userId}`);

  return true;
}

// Interview session operations
export async function createInterviewSession(
  sessionData: Omit<InterviewSession, "id" | "created_at" | "updated_at">
): Promise<InterviewSession | null> {
  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return null;
  }

  const supabaseClient =
    supabase as import("@supabase/supabase-js").SupabaseClient;
  const { data, error } = await supabaseClient
    .from("interview_sessions")
    .insert([sessionData])
    .select()
    .single();

  if (error) {
    console.error("Error creating interview session:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return null;
  }

  return data;
}

export async function getInteviewSessionById(
  sessionId: string
): Promise<InterviewSession | null> {
  // First check in-memory cache
  const cachedSession = cacheService.getInterviewSessionById(sessionId);
  if (cachedSession !== undefined) {
    return cachedSession;
  }

  // Then check localStorage cache
  const cachedSessionLS =
    localStorageCacheService.getInterviewSessionById(sessionId);
  if (cachedSessionLS !== undefined) {
    if (cachedSessionLS !== null) {
      // Update in-memory cache with localStorage data
      cacheService.setInterviewSessionById(sessionId, cachedSessionLS);
    }
    return cachedSessionLS;
  }

  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return null;
  }

  const result = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (result.error) {
    console.error("Error fetching interview session:", result.error);
    // Cache the null result to avoid repeated failed requests
    cacheService.setInterviewSessionById(sessionId, null);
    localStorageCacheService.setInterviewSessionById(sessionId, null);
    return null;
  }

  // Cache the result in both memory and localStorage
  cacheService.setInterviewSessionById(sessionId, result.data);
  localStorageCacheService.setInterviewSessionById(sessionId, result.data);

  return result.data;
}

export async function getInterviewSessionsByUser(
  userId: string
): Promise<InterviewSession[]> {
  // First check in-memory cache
  const cachedSessions = cacheService.getUserInterviewSessions(userId);
  if (cachedSessions !== undefined) {
    return cachedSessions;
  }

  // Then check localStorage cache
  const cachedSessionsLS =
    localStorageCacheService.getUserInterviewSessions(userId);
  if (cachedSessionsLS !== undefined) {
    if (cachedSessionsLS.length > 0) {
      // Update in-memory cache with localStorage data
      cacheService.setUserInterviewSessions(userId, cachedSessionsLS);
    }
    return cachedSessionsLS;
  }

  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return [];
  }

  const result = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (result.error) {
    console.error("Error fetching interview sessions:", result.error);
    // Cache the empty result to avoid repeated failed requests
    cacheService.setUserInterviewSessions(userId, []);
    localStorageCacheService.setUserInterviewSessions(userId, []);
    return [];
  }

  // Cache the result in both memory and localStorage
  cacheService.setUserInterviewSessions(userId, result.data);
  localStorageCacheService.setUserInterviewSessions(userId, result.data);

  return result.data || [];
}

export async function updateInterviewSession(
  sessionId: string,
  sessionData: Partial<InterviewSession>
): Promise<boolean> {
  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return false;
  }

  const result = await supabase
    .from("interview_sessions")
    .update(sessionData)
    .eq("id", sessionId);

  if (result.error) {
    console.error("Error updating interview session:", result.error);
    return false;
  }

  // Invalidate cache since we updated the session
  cacheService.invalidateInterviewSessionById(sessionId);
  localStorageCacheService.remove(`cache_interview_session_${sessionId}`);

  // If user_id is in the session data, we should also invalidate the user's session list
  if (sessionData.user_id) {
    cacheService.invalidateUserInterviewSessions(sessionData.user_id);
    localStorageCacheService.remove(
      `cache_interview_sessions_${sessionData.user_id}`
    );
  }

  return true;
}

// Question operations
export async function createInterviewQuestion(
  questionData: Omit<InterviewQuestion, "id" | "created_at">
): Promise<InterviewQuestion | null> {
  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return null;
  }

  const result = await supabase
    .from("interview_questions")
    .insert([questionData])
    .select()
    .single();

  if (result.error) {
    console.error("Error creating interview question:", result.error);
    return null;
  }

  // Invalidate cache for the session's questions since we added a new one
  if (questionData.session_id) {
    cacheService.invalidateInterviewQuestions(questionData.session_id);
    localStorageCacheService.remove(
      `cache_interview_questions_${questionData.session_id}`
    );
  }

  return result.data;
}

export async function getQuestionsBySession(
  sessionId: string
): Promise<InterviewQuestion[]> {
  // First check in-memory cache
  const cachedQuestions = cacheService.getInterviewQuestions(sessionId);
  if (cachedQuestions !== undefined) {
    return cachedQuestions;
  }

  // Then check localStorage cache
  const cachedQuestionsLS =
    localStorageCacheService.getInterviewQuestions(sessionId);
  if (cachedQuestionsLS !== undefined) {
    if (cachedQuestionsLS.length > 0) {
      // Update in-memory cache with localStorage data
      cacheService.setInterviewQuestions(sessionId, cachedQuestionsLS);
    }
    return cachedQuestionsLS;
  }

  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return [];
  }

  const result = await supabase
    .from("interview_questions")
    .select("*")
    .eq("session_id", sessionId)
    .order("question_number", { ascending: true });

  if (result.error) {
    console.error("Error fetching questions:", result.error);
    // Cache the empty result to avoid repeated failed requests
    cacheService.setInterviewQuestions(sessionId, []);
    localStorageCacheService.setInterviewQuestions(sessionId, []);
    return [];
  }

  // Cache the result in both memory and localStorage
  cacheService.setInterviewQuestions(sessionId, result.data);
  localStorageCacheService.setInterviewQuestions(sessionId, result.data);

  return result.data || [];
}

export async function getQuestionBySessionAndNumber(
  sessionId: string,
  questionNumber: number
): Promise<InterviewQuestion | null> {
  // Create a composite key for caching
  const cacheKey = `${sessionId}_${questionNumber}`;

  // First check in-memory cache
  // Note: We don't have a specific cache method for this, so we'll skip for now
  // The main benefit will come from the questions list being cached

  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return null;
  }

  const result = await supabase
    .from("interview_questions")
    .select("*")
    .eq("session_id", sessionId)
    .eq("question_number", questionNumber)
    .single();

  if (result.error) {
    // If the error is because no rows were returned (PGRST116), that's not necessarily an error
    if (result.error.code === "PGRST116") {
      console.warn(
        `No question found for session ${sessionId} and question number ${questionNumber}`
      );
    } else {
      console.error(
        "Error fetching question by session and number:",
        result.error
      );
    }
    return null;
  }

  return result.data || null;
}

// Answer operations
export async function createInterviewAnswer(
  answerData: Omit<InterviewAnswer, "id" | "created_at">
): Promise<InterviewAnswer | null> {
  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return null;
  }

  const result = await supabase
    .from("interview_answers")
    .insert([answerData])
    .select()
    .single();

  if (result.error) {
    console.error("Error creating interview answer:", result.error);
    return null;
  }

  // Invalidate cache for the session's answers since we added a new one
  if (answerData.session_id) {
    cacheService.invalidateInterviewAnswers(answerData.session_id);
    localStorageCacheService.remove(
      `cache_interview_answers_${answerData.session_id}`
    );
  }

  return result.data;
}

export async function getAnswersBySession(
  sessionId: string
): Promise<InterviewAnswer[]> {
  // First check in-memory cache
  const cachedAnswers = cacheService.getInterviewAnswers(sessionId);
  if (cachedAnswers !== undefined) {
    return cachedAnswers;
  }

  // Then check localStorage cache
  const cachedAnswersLS =
    localStorageCacheService.getInterviewAnswers(sessionId);
  if (cachedAnswersLS !== undefined) {
    if (cachedAnswersLS.length > 0) {
      // Update in-memory cache with localStorage data
      cacheService.setInterviewAnswers(sessionId, cachedAnswersLS);
    }
    return cachedAnswersLS;
  }

  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return [];
  }

  const result = await supabase
    .from("interview_answers")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (result.error) {
    console.error("Error fetching answers:", result.error);
    // Cache the empty result to avoid repeated failed requests
    cacheService.setInterviewAnswers(sessionId, []);
    localStorageCacheService.setInterviewAnswers(sessionId, []);
    return [];
  }

  // Cache the result in both memory and localStorage
  cacheService.setInterviewAnswers(sessionId, result.data);
  localStorageCacheService.setInterviewAnswers(sessionId, result.data);

  return result.data || [];
}

// Usage tracking operations
export async function recordUsage(
  usageData: Omit<UsageRecord, "id" | "created_at">
): Promise<boolean> {
  // Check if supabase server client is the mock (when env vars aren't set)
  if (!("from" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return false;
  }

  const result = await supabaseServer
    .from("usage_tracking")
    .insert([usageData]);

  if (result && "error" in result && result.error) {
    console.error("Error recording usage:", result.error);
    return false;
  }

  return true;
}

export async function getUserUsage(
  userId: string,
  since?: string
): Promise<UsageRecord[]> {
  // First check in-memory cache
  const cachedUsage = cacheService.getUserUsage(userId, since);
  if (cachedUsage !== undefined) {
    return cachedUsage;
  }

  // Then check localStorage cache
  const cachedUsageLS = localStorageCacheService.getUserUsage(userId, since);
  if (cachedUsageLS !== undefined) {
    if (cachedUsageLS.length > 0) {
      // Update in-memory cache with localStorage data
      cacheService.setUserUsage(userId, cachedUsageLS, since);
    }
    return cachedUsageLS;
  }

  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return [];
  }

  let query = supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (since) {
    query = query.gte("created_at", since);
  }

  const result = await query;

  if (result.error) {
    console.error("Error fetching user usage:", result.error);
    // Cache the empty result to avoid repeated failed requests
    cacheService.setUserUsage(userId, [], since);
    localStorageCacheService.setUserUsage(userId, [], since);
    return [];
  }

  // Cache the result in both memory and localStorage
  cacheService.setUserUsage(userId, result.data, since);
  localStorageCacheService.setUserUsage(userId, result.data, since);

  return result.data || [];
}

// Get daily usage count for a user
export async function getDailyUsageCount(
  userId: string,
  date: string
): Promise<number> {
  const result = await supabase
    .from("usage_tracking")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .gte("created_at", date)
    .lt(
      "created_at",
      new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString()
    );

  if (result.error) {
    console.error("Error getting daily usage count:", result.error);
    return 0;
  }

  return result.count ? result.count : 0;
}

// Get interview completion count for a user
export async function getUserInterviewsCompleted(
  userId: string
): Promise<number> {
  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return 0;
  }

  const result = await supabase
    .from("interview_sessions")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("completed", true);

  if (result.error) {
    console.error("Error getting completed interviews count:", result.error);
    return 0;
  }

  return result.count ? result.count : 0;
}
