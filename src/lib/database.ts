import { supabase } from "./supabase";

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
  const { error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", userId);

  if (error) {
    console.error("Error updating user profile:", error);
    return false;
  }

  return true;
}

// Interview session operations
export async function createInterviewSession(
  sessionData: Omit<InterviewSession, "id" | "created_at" | "updated_at">
): Promise<InterviewSession | null> {
  const { data, error } = await supabase
    .from("interview_sessions")
    .insert([sessionData])
    .select()
    .single();

  if (error) {
    console.error("Error creating interview session:", error);
    return null;
  }

  return data;
}

export async function getInteviewSessionById(
  sessionId: string
): Promise<InterviewSession | null> {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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

// Answer operations
export async function createInterviewAnswer(
  answerData: Omit<InterviewAnswer, "id" | "created_at">
): Promise<InterviewAnswer | null> {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { error } = await supabase.from("usage_tracking").insert([usageData]);

  if (error) {
    console.error("Error recording usage:", error);
    return false;
  }

  return true;
}

export async function getUserUsage(
  userId: string,
  since?: string
): Promise<UsageRecord[]> {
  let query = supabase
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
  const { data, error } = await supabase
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
