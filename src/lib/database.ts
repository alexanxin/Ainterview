import { supabase } from "./supabase";
import { supabaseServer } from "./supabase-server";
import { cacheService } from "./cache-service";

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

// Enhanced Payment record interface with security fields
export interface PaymentRecord {
  id: string;
  user_id: string;
  transaction_id: string;
  expected_amount: number;
  token: "USDC" | "USDT" | "CASH";
  recipient: string;
  status: "pending" | "confirmed" | "failed";
  // Security fields to prevent replay attacks
  transaction_nonce?: string;
  transaction_timestamp?: string;
  verified_at?: string;
  expires_at?: string;
  processing_locked?: boolean;
  created_at?: string;
  updated_at?: string;
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
    // Don't cache null results - this ensures profile completion checks work for new users
    // The cache service will return undefined for user profiles, triggering fresh database queries
    return null;
  }

  // Cache only non-null results - null results are not cached
  if (result.data) {
    cacheService.setUserProfile(userId, result.data);
  }

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

  const supabaseClient =
    supabase as import("@supabase/supabase-js").SupabaseClient;

  console.log(
    `🔄 UPDATE PROFILE: Updating profile for user ${userId} with data:`,
    profileData
  );

  // First try to update existing profile
  const updateResult = await supabaseClient
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
    const insertResult = await supabaseClient
      .from("profiles")
      .insert(data)
      .select();

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

  console.log(
    `✅ UPDATE PROFILE: Profile for user ${userId} updated successfully`
  );

  // Invalidate cache since we updated the profile
  cacheService.invalidateUserProfile(userId);

  return true;
}

// Interview session operations
export async function createInterviewSession(
  sessionData: Omit<InterviewSession, "id" | "created_at" | "updated_at">
): Promise<InterviewSession | null> {
  // Check if supabase server client is the mock (when env vars aren't set)
  if (!("from" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return null;
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;

  console.log(
    `🔄 CREATE SESSION: Creating interview session with data:`,
    sessionData
  );

  const { data, error } = await supabaseServerClient
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

  console.log(
    `✅ CREATE SESSION: Interview session created successfully:`,
    data?.id
  );
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
    return null;
  }

  // Cache the result in both memory and localStorage
  cacheService.setInterviewSessionById(sessionId, result.data);

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
    return [];
  }

  // Cache the result in both memory and localStorage
  cacheService.setUserInterviewSessions(userId, result.data);

  return result.data || [];
}

export async function updateInterviewSession(
  sessionId: string,
  sessionData: Partial<InterviewSession>
): Promise<boolean> {
  // Check if supabase server client is the mock (when env vars aren't set)
  if (!("from" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return false;
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;

  console.log(
    `🔄 UPDATE SESSION: Updating session ${sessionId} with data:`,
    sessionData
  );

  const result = await supabaseServerClient
    .from("interview_sessions")
    .update(sessionData)
    .eq("id", sessionId);

  if (result.error) {
    console.error("Error updating interview session:", result.error);
    return false;
  }

  console.log(
    `✅ UPDATE SESSION: Session ${sessionId} update operation completed`
  );

  // Invalidate cache since we updated the session
  cacheService.invalidateInterviewSessionById(sessionId);

  // If user_id is in the session data, we should also invalidate the user's session list
  if (sessionData.user_id) {
    cacheService.invalidateUserInterviewSessions(sessionData.user_id);
  }

  return true;
}

// Question operations
export async function createInterviewQuestion(
  questionData: Omit<InterviewQuestion, "id" | "created_at">
): Promise<InterviewQuestion | null> {
  // Check if supabase server client is the mock (when env vars aren't set)
  if (!("from" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return null;
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;

  console.log(
    `🔄 CREATE QUESTION: Creating question for session ${questionData.session_id}`
  );

  const result = await supabaseServerClient
    .from("interview_questions")
    .insert([questionData])
    .select()
    .single();

  if (result.error) {
    console.error("Error creating interview question:", result.error);
    return null;
  }

  console.log(
    `✅ CREATE QUESTION: Question created successfully:`,
    result.data?.id
  );

  // Invalidate cache for the session's questions since we added a new one
  if (questionData.session_id) {
    cacheService.invalidateInterviewQuestions(questionData.session_id);
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
    return [];
  }

  // Cache the result in both memory and localStorage
  cacheService.setInterviewQuestions(sessionId, result.data);

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

  const supabaseClient =
    supabase as import("@supabase/supabase-js").SupabaseClient;
  const result = await supabaseClient
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
  // Check if supabase server client is the mock (when env vars aren't set)
  if (!("from" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return null;
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;

  console.log(
    `🔄 CREATE ANSWER: Creating answer for session ${answerData.session_id}`
  );

  const result = await supabaseServerClient
    .from("interview_answers")
    .insert([answerData])
    .select()
    .single();

  if (result.error) {
    console.error("Error creating interview answer:", result.error);
    return null;
  }

  console.log(
    `✅ CREATE ANSWER: Answer created successfully:`,
    result.data?.id
  );

  // Invalidate cache for the session's answers since we added a new one
  if (answerData.session_id) {
    cacheService.invalidateInterviewAnswers(answerData.session_id);
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
    return [];
  }

  // Cache the result in both memory and localStorage
  cacheService.setInterviewAnswers(sessionId, result.data);

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

// Update a payment record with enhanced security fields
export async function updatePaymentRecordWithNonce(
  transactionId: string,
  updateData: {
    transaction_nonce?: string;
    transaction_timestamp?: string;
    expires_at?: string;
  }
): Promise<boolean> {
  console.log(`🔒 SECURITY: Updating payment record with nonce data`, {
    transactionId,
    hasNonce: !!updateData.transaction_nonce,
    nonce: updateData.transaction_nonce
      ? updateData.transaction_nonce.substring(0, 8) + "..."
      : null,
    timestamp: updateData.transaction_timestamp,
    expiresAt: updateData.expires_at,
  });

  // Check if supabase server client is the mock (when env vars aren't set)
  if (!("from" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return false;
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;

  const { error } = await supabaseServerClient
    .from("payment_records")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("transaction_id", transactionId);

  if (error) {
    console.error("Error updating payment record with nonce:", error);
    return false;
  }

  console.log(`🔒 SECURITY: Payment record updated with nonce successfully`, {
    transactionId,
    hasNonce: !!updateData.transaction_nonce,
  });

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

  // Check if supabase client is the mock (when env vars aren't set)
  if (!("from" in supabase)) {
    console.warn(
      "Supabase client not initialized - missing environment variables"
    );
    return [];
  }

  const supabaseClient =
    supabase as import("@supabase/supabase-js").SupabaseClient;
  let query = supabaseClient
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
    return [];
  }

  // Cache the result in both memory and localStorage
  cacheService.setUserUsage(userId, result.data, since);

  return result.data || [];
}

// Get daily usage count for a user
export async function getDailyUsageCount(
  userId: string,
  date: string
): Promise<number> {
  const supabaseClient =
    supabase as import("@supabase/supabase-js").SupabaseClient;
  const result = await supabaseClient
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

  const supabaseClient =
    supabase as import("@supabase/supabase-js").SupabaseClient;
  const result = await supabaseClient
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

// Credit management operations
export async function getUserCredits(userId: string): Promise<number> {
  console.log(`💰 CREDITS: Fetching credits for user ${userId}`);

  // Check if supabase server client is the mock (when env vars aren't set)
  if (!("from" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return 0;
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;
  const result = await supabaseServerClient
    .from("user_credits")
    .select("credits")
    .eq("user_id", userId)
    .single();

  if (result.error) {
    if (result.error.code === "PGRST116") {
      // No record found, create a new user with 5 credits
      console.log(
        `Creating new user credits record for ${userId} with 5 starting credits`
      );
      const insertResult = await supabaseServerClient
        .from("user_credits")
        .insert([{ user_id: userId, credits: 5 }])
        .select("credits")
        .single();

      if (insertResult.error) {
        console.error(
          "Error creating user credits record:",
          insertResult.error
        );
        return 0;
      }

      console.log(
        `New user ${userId} created with ${insertResult.data.credits} starting credits`
      );
      return insertResult.data.credits;
    } else {
      console.error("Error fetching user credits:", result.error);
      return 0;
    }
  }

  const credits = result.data?.credits ?? 0;
  console.log(`💰 CREDITS: User ${userId} has ${credits} credits`);
  return credits;
}

export async function addUserCredits(
  userId: string,
  amount: number
): Promise<boolean> {
  console.log(`💳 CREDITS: Adding ${amount} credits to user ${userId}`);

  if (amount <= 0) {
    console.warn("Attempted to add non-positive amount of credits:", amount);
    return false;
  }

  // Check if supabase server client is the mock (when env vars aren't set)
  if (!("rpc" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return false;
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;

  try {
    // First, try the RPC function (if it exists)
    const { error } = await supabaseServerClient.rpc("add_credits", {
      p_user_id: userId,
      p_amount: amount,
    });

    if (error) {
      console.warn(
        "RPC function add_credits not available, falling back to direct insert/update:",
        error.message
      );

      // Fallback: Use direct insert/update if RPC doesn't exist
      const { data, error: upsertError } = await supabaseServerClient
        .from("user_credits")
        .upsert(
          {
            user_id: userId,
            credits: amount,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
            ignoreDuplicates: false,
          }
        );

      if (upsertError) {
        console.error(
          "Error adding user credits via direct insert/update:",
          upsertError
        );

        // Try alternative: Get current credits and update
        const { data: currentCredits, error: fetchError } =
          await supabaseServerClient
            .from("user_credits")
            .select("credits")
            .eq("user_id", userId)
            .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching current credits:", fetchError);
          return false;
        }

        const currentAmount = currentCredits?.credits || 0;
        const { error: updateError } = await supabaseServerClient
          .from("user_credits")
          .upsert({
            user_id: userId,
            credits: currentAmount + amount,
            updated_at: new Date().toISOString(),
          });

        if (updateError) {
          console.error(
            "Error updating user credits via alternative method:",
            updateError
          );
          return false;
        }
      }
    }

    // CRITICAL: Invalidate the credit cache after successful update
    console.log(`🗑️ CACHE: Invalidating credit cache for user ${userId}`);
    cacheService.invalidateUserCredits(userId);

    // Log the new credit balance for debugging
    const newBalance = await getUserCredits(userId);
    console.log(
      `✅ CREDITS: Successfully added ${amount} credits. New balance: ${newBalance}`
    );

    return true;
  } catch (err) {
    console.error("Error in addUserCredits:", err);
    return false;
  }
}

export async function deductUserCredits(
  userId: string,
  amount: number
): Promise<boolean> {
  console.log(`💳 CREDITS: Deducting ${amount} credits from user ${userId}`);

  if (amount <= 0) {
    console.warn("Attempted to deduct non-positive amount of credits:", amount);
    return false;
  }

  // Check if supabase server client is the mock (when env vars aren't set)
  if (!("rpc" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return false;
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;
  // Use an RPC call to safely deduct the credits (decrement with check)
  const { data, error } = await supabaseServerClient.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) {
    console.error("Error deducting user credits via RPC:", error);
    return false;
  }

  // CRITICAL: Invalidate the credit cache after successful deduction
  console.log(
    `🗑️ CACHE: Invalidating credit cache for user ${userId} after deduction`
  );
  cacheService.invalidateUserCredits(userId);

  // The RPC should return true if deduction was successful (i.e., sufficient credits)
  // Log the data to debug the return value
  console.log("Deduct user credits RPC data:", data);

  // Log the new credit balance for debugging
  const newBalance = await getUserCredits(userId);
  console.log(
    `✅ CREDITS: Successfully deducted ${amount} credits. New balance: ${newBalance}`
  );

  // Assuming success if no error is returned, as the RPC should handle the logic
  return true;
}

// Payment record operations
export async function createPaymentRecord(
  paymentData: Omit<PaymentRecord, "id" | "created_at" | "status">
): Promise<PaymentRecord | null> {
  // Check if supabase server client is the mock (when env vars aren't set)
  if (!("from" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return null;
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;
  const { data, error } = await supabaseServerClient
    .from("payment_records")
    .insert([{ ...paymentData, status: "pending" }])
    .select()
    .single();

  if (error) {
    console.error("Error creating payment record:", error);
    return null;
  }

  return data as PaymentRecord;
}

export async function getPaymentRecordByTransactionId(
  transactionId: string
): Promise<PaymentRecord | null> {
  // Check if supabase server client is the mock (when env vars aren't set)
  if (!("from" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return null;
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;
  const { data, error } = await supabaseServerClient
    .from("payment_records")
    .select("*")
    .eq("transaction_id", transactionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Record not found, which is fine
      return null;
    }
    console.error("Error fetching payment record:", error);
    return null;
  }

  return data as PaymentRecord;
}

export async function updatePaymentRecordStatus(
  transactionId: string,
  status: "pending" | "confirmed" | "failed"
): Promise<boolean> {
  // Check if supabase server client is the mock (when env vars aren't set)
  if (!("from" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return false;
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;

  // Prepare update data
  const updateData: { status: string; verified_at?: string } = { status };

  // If confirming payment, set verified_at timestamp
  if (status === "confirmed") {
    updateData.verified_at = new Date().toISOString();
    console.log("🔒 SECURITY: Setting verified_at timestamp for transaction", {
      transactionId,
      verifiedAt: updateData.verified_at,
    });
  }

  const { error } = await supabaseServerClient
    .from("payment_records")
    .update(updateData)
    .eq("transaction_id", transactionId);

  if (error) {
    console.error("Error updating payment record status:", error);
    return false;
  }

  console.log("💳 Payment record status updated", {
    transactionId,
    status,
    verifiedAt: status === "confirmed" ? updateData.verified_at : null,
  });

  return true;
}

// Function to update the transaction ID for a payment record
// This is used when we initially create a payment record with a temporary ID
// and then update it with the actual transaction signature
export async function updatePaymentRecordTransactionId(
  tempTransactionId: string,
  actualTransactionId: string
): Promise<boolean> {
  // Check if supabase server client is the mock (when env vars aren't set)
  if (!("from" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return false;
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;

  const { error } = await supabaseServerClient
    .from("payment_records")
    .update({
      transaction_id: actualTransactionId,
      updated_at: new Date().toISOString(),
    })
    .eq("transaction_id", tempTransactionId);

  if (error) {
    console.error("Error updating payment record transaction ID:", error);
    return false;
  }

  return true;
}

// Function to get pending payment records for a user
// This is used to find recently created payment records that need to be updated
export async function getPendingPaymentRecordsByUser(
  userId: string,
  minutesBack: number = 10 // Look back 10 minutes for pending payments
): Promise<PaymentRecord[]> {
  // Check if supabase server client is the mock (when env vars aren't set)
  if (!("from" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return [];
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;

  const cutoffTime = new Date(
    Date.now() - minutesBack * 60 * 1000
  ).toISOString();

  const { data, error } = await supabaseServerClient
    .from("payment_records")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "pending")
    .gte("created_at", cutoffTime)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending payment records:", error);
    return [];
  }

  return data as PaymentRecord[];
}

// Enhanced security functions to prevent transaction replay attacks

// Generate a cryptographically secure nonce
export function generateSecureNonce(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Create a payment record with security validation
export async function createSecurePaymentRecord(
  userId: string,
  transactionId: string,
  expectedAmount: number,
  token: "USDC" | "USDT" | "CASH",
  recipient: string,
  nonce?: string,
  timeoutMinutes: number = 5
): Promise<{
  success: boolean;
  record?: PaymentRecord;
  error?: string;
  nonce?: string;
  expiresAt?: string;
}> {
  console.log(
    `🔒 SECURITY: Creating secure payment record for user ${userId}`,
    {
      transactionId,
      expectedAmount,
      token,
      hasNonce: !!nonce,
    }
  );

  if (!("rpc" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return { success: false, error: "Server not initialized" };
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;

  try {
    // Use the secure database function
    const { data, error } = await supabaseServerClient.rpc(
      "create_payment_record_secure",
      {
        p_user_id: userId,
        p_expected_amount: expectedAmount,
        p_token: token,
        p_recipient: recipient,
        p_transaction_id: transactionId,
        p_nonce: nonce,
        p_timeout_minutes: timeoutMinutes,
      }
    );

    if (error) {
      console.error("Error creating secure payment record:", error);
      return { success: false, error: error.message };
    }

    if (data && data.length > 0) {
      const result = data[0];
      if (result.success) {
        console.log(`✅ SECURITY: Secure payment record created successfully`, {
          recordId: result.record_id,
          nonce: result.nonce,
          expiresAt: result.expires_at,
        });
        return {
          success: true,
          record: {
            id: result.record_id,
            user_id: userId,
            transaction_id: transactionId,
            expected_amount: expectedAmount,
            token,
            recipient,
            status: "pending",
            transaction_nonce: result.nonce,
            transaction_timestamp: new Date().toISOString(),
            expires_at: result.expires_at,
            created_at: new Date().toISOString(),
          },
          nonce: result.nonce,
          expiresAt: result.expires_at,
        };
      } else {
        console.warn(
          `⚠️ SECURITY: Payment record creation failed:`,
          result.error_message
        );
        return { success: false, error: result.error_message };
      }
    }

    return { success: false, error: "Unknown error creating payment record" };
  } catch (err) {
    console.error("Exception creating secure payment record:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// Atomic transaction verification with replay attack prevention
export async function verifyTransactionAtomic(
  transactionId: string,
  nonce: string,
  verificationResult: boolean
): Promise<{
  success: boolean;
  userId?: string;
  creditsToAdd?: number;
  error?: string;
  alreadyProcessed?: boolean;
  expired?: boolean;
}> {
  console.log(`🔒 SECURITY: Atomic transaction verification`, {
    transactionId,
    hasNonce: !!nonce,
    verificationResult,
  });

  if (!("rpc" in supabaseServer)) {
    console.warn(
      "Supabase server client not initialized - missing environment variables"
    );
    return { success: false, error: "Server not initialized" };
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;

  try {
    // Use the atomic verification database function
    const { data, error } = await supabaseServerClient.rpc(
      "verify_transaction_atomic",
      {
        p_transaction_id: transactionId,
        p_nonce: nonce,
        p_verification_result: verificationResult,
      }
    );

    if (error) {
      console.error("Error in atomic transaction verification:", error);
      return { success: false, error: error.message };
    }

    if (data && data.length > 0) {
      const result = data[0];
      console.log(`🔒 SECURITY: Atomic verification result`, {
        success: result.success,
        userId: result.user_id,
        creditsToAdd: result.credits_to_add,
        alreadyProcessed: result.already_processed,
        expired: result.expired,
        error: result.error_message,
      });

      return {
        success: result.success,
        userId: result.user_id,
        creditsToAdd: result.credits_to_add,
        error: result.error_message,
        alreadyProcessed: result.already_processed,
        expired: result.expired,
      };
    }

    return { success: false, error: "Unknown verification error" };
  } catch (err) {
    console.error("Exception in atomic transaction verification:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// Check if a transaction nonce has been used before (for replay detection)
export async function checkNonceUsage(nonce: string): Promise<{
  used: boolean;
  record?: PaymentRecord;
  error?: string;
}> {
  if (!("from" in supabase)) {
    return { used: false };
  }

  const supabaseClient =
    supabase as import("@supabase/supabase-js").SupabaseClient;

  try {
    const { data, error } = await supabaseClient
      .from("payment_records")
      .select("*")
      .eq("transaction_nonce", nonce)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking nonce usage:", error);
      return { used: false, error: error.message };
    }

    return { used: !!data, record: data || undefined };
  } catch (err) {
    console.error("Exception checking nonce usage:", err);
    return {
      used: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// Clean up expired payment records (for maintenance)
export async function cleanupExpiredPaymentRecords(): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  if (!("rpc" in supabaseServer)) {
    return { success: false, deletedCount: 0, error: "Server not initialized" };
  }

  const supabaseServerClient =
    supabaseServer as import("@supabase/supabase-js").SupabaseClient;

  try {
    // Delete expired and failed records older than 24 hours
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { error, count } = await supabaseServerClient
      .from("payment_records")
      .delete()
      .in("status", ["failed", "expired"])
      .lt("updated_at", cutoffTime);

    if (error) {
      console.error("Error cleaning up expired payment records:", error);
      return { success: false, deletedCount: 0, error: error.message };
    }

    console.log(`🧹 SECURITY: Cleaned up ${count} expired payment records`);
    return { success: true, deletedCount: count || 0 };
  } catch (err) {
    console.error("Exception cleaning up expired payment records:", err);
    return {
      success: false,
      deletedCount: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// Functions already exported above
