import { supabase } from "./supabase";
import { supabaseServer } from "./supabase-server";

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
  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId);

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
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
  const { error: updateError, data: updateData } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", userId)
    .select();

  console.log("Update attempt result:", { updateError, updateData });

  // If update succeeded but no rows were affected (profile doesn't exist), try insert
  if (!updateError && (!updateData || updateData.length === 0)) {
    console.log("No existing profile found, trying insert...");
    // If update fails, try to insert new profile
    const data = { id: userId, ...profileData };
    console.log("Inserting data:", data);
    const { error: insertError, data: insertData } = await supabase
      .from("profiles")
      .insert(data)
      .select();

    console.log("Insert attempt result:", { insertError, insertData });

    if (insertError) {
      console.error("Error inserting user profile:", insertError);
      return false;
    }
  } else if (updateError) {
    console.error("Error updating user profile:", updateError);
    return false;
  }

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
    console.error("Error details:", { message: error.message, code: error.code, details: error.details });
    return null;
  }

  return data;
}

export async function getInteviewSessionById(
  sessionId: string
): Promise<InterviewSession | null> {
  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return null;
  }

  const { data, error } = await (supabase as any)
    .from("interview_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) {
    console.error("Error fetching interview session:", error);
    return null;
  }

  return data;
}

export async function getInterviewSessionsByUser(
  userId: string
): Promise<InterviewSession[]> {
  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return [];
  }

  const { data, error } = await (supabase as any)
    .from("interview_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching interview sessions:", error);
    return [];
  }

  return data || [];
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

  const { error } = await (supabase as any)
    .from("interview_sessions")
    .update(sessionData)
    .eq("id", sessionId);

  if (error) {
    console.error("Error updating interview session:", error);
    return false;
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

  const { data, error } = await (supabase as any)
    .from("interview_questions")
    .insert([questionData])
    .select()
    .single();

  if (error) {
    console.error("Error creating interview question:", error);
    return null;
  }

  return data;
}

export async function getQuestionsBySession(
  sessionId: string
): Promise<InterviewQuestion[]> {
  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return [];
  }

  const { data, error } = await (supabase as any)
    .from("interview_questions")
    .select("*")
    .eq("session_id", sessionId)
    .order("question_number", { ascending: true });

  if (error) {
    console.error("Error fetching questions:", error);
    return [];
  }

  return data || [];
}

export async function getQuestionBySessionAndNumber(
  sessionId: string,
  questionNumber: number
): Promise<InterviewQuestion | null> {
  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return null;
  }

  const result = await (supabase as any)
    .from("interview_questions")
    .select("*")
    .eq("session_id", sessionId)
    .eq("question_number", questionNumber)
    .single();

  if (result && "error" in result && result.error) {
    // If the error is because no rows were returned (PGRST116), that's not necessarily an error
    if (result.error.code === 'PGRST116') {
      console.warn(`No question found for session ${sessionId} and question number ${questionNumber}`);
    } else {
      console.error(
        "Error fetching question by session and number:",
        result.error
      );
    }
    return null;
  }

  return result?.data || null;
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

  const { data, error } = await (supabase as any)
    .from("interview_answers")
    .insert([answerData])
    .select()
    .single();

  if (error) {
    console.error("Error creating interview answer:", error);
    return null;
  }

  return data;
}

export async function getAnswersBySession(
  sessionId: string
): Promise<InterviewAnswer[]> {
  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return [];
  }

  const { data, error } = await (supabase as any)
    .from("interview_answers")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching answers:", error);
    return [];
  }

  return data || [];
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
  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return [];
  }

  let query = (supabase as any)
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (since) {
    query = query.gte("created_at", since);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching user usage:", error);
    return [];
  }

  return data || [];
}

// Get daily usage count for a user
export async function getDailyUsageCount(
  userId: string,
  date: string
): Promise<number> {
  const { data, error } = await supabase
    .from("usage_tracking")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .gte("created_at", date)
    .lt(
      "created_at",
      new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString()
    );

  if (error) {
    console.error("Error getting daily usage count:", error);
    return 0;
  }

  return data ? data.length : 0;
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

  const { data, error } = await (supabase as any)
    .from("interview_sessions")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("completed", true);

  if (error) {
    console.error("Error getting completed interviews count:", error);
    return 0;
  }

  return data ? data.length : 0;
}
