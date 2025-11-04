import {
  updateUserProfile,
  getUserProfile,
  createInterviewSession,
  getInterviewSessionsByUser,
  createInterviewQuestion,
  createInterviewAnswer,
  recordUsage,
  getUserUsage,
} from "./database";
import { createClient } from "@supabase/supabase-js";

// Type definitions for test results
export interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  data?: unknown;
  error?: unknown;
}

// Get Supabase client directly for authentication testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Test Supabase authentication status
 */
export async function testAuthentication(): Promise<TestResult> {
  if (!supabase) {
    return {
      testName: "Supabase Client Initialization",
      success: false,
      message:
        "Supabase client not initialized - missing environment variables",
      error:
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    };
  }

  try {
    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return {
        testName: "Get Session",
        success: false,
        message: "Failed to get session",
        error: sessionError,
      };
    }

    if (!session) {
      return {
        testName: "Authentication Status",
        success: false,
        message: "No active session - user not authenticated",
        data: { hasSession: !!session },
      };
    }

    return {
      testName: "Authentication Status",
      success: true,
      message: "User is authenticated",
      data: {
        hasSession: !!session,
        userId: session.user?.id,
        email: session.user?.email,
      },
    };
  } catch (error) {
    return {
      testName: "Authentication Test",
      success: false,
      message: "Error during authentication test",
      error,
    };
  }
}

/**
 * Test RLS (Row Level Security) bypass with service role key if available
 */
export async function testRLSBypass(
  userId: string = "12345678-1234-1234-1234-123456789012"
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Check if we have service role key for bypassing RLS during testing
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseServiceKey || !supabaseUrl) {
    results.push({
      testName: "RLS Bypass Setup",
      success: false,
      message: "Service role key not available - cannot bypass RLS for testing",
      data: { hasServiceKey: !!supabaseServiceKey, hasUrl: !!supabaseUrl },
    });
    return results;
  }

  // Create client with service role key (has full access)
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Test direct insert without authentication
    console.log("Testing direct database access with service role...");

    // Test 1: Insert profile with service role
    const { data: profileData, error: profileError } = await serviceClient
      .from("profiles")
      .insert([
        {
          id: userId,
          email: "test@example.com",
          full_name: "Test User",
          bio: "This is a test user for database testing",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (profileError) {
      results.push({
        testName: "Direct Profile Insert (Service Role)",
        success: false,
        message: "Failed to insert profile with service role",
        error: profileError,
      });
    } else {
      results.push({
        testName: "Direct Profile Insert (Service Role)",
        success: true,
        message: "Profile inserted successfully with service role",
        data: profileData,
      });
    }

    // Test 2: Insert session with service role
    if (profileData) {
      const { data: sessionData, error: sessionError } = await serviceClient
        .from("interview_sessions")
        .insert([
          {
            user_id: userId,
            job_posting: "Software Engineer Position",
            title: "Software Engineer Interview",
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (sessionError) {
        results.push({
          testName: "Direct Session Insert (Service Role)",
          success: false,
          message: "Failed to insert session with service role",
          error: sessionError,
        });
      } else {
        results.push({
          testName: "Direct Session Insert (Service Role)",
          success: true,
          message: "Session inserted successfully with service role",
          data: sessionData,
        });
      }
    }

    return results;
  } catch (error) {
    results.push({
      testName: "RLS Bypass Test",
      success: false,
      message: "Error during RLS bypass test",
      error,
    });
    return results;
  }
}

/**
 * Comprehensive test suite for database operations with authentication awareness
 */
export async function runDatabaseTestsWithAuthCheck(
  userId?: string
): Promise<TestResult[]> {
  console.log(
    "🚀 Starting database test operations with authentication check...\n"
  );

  // First, test authentication
  const authResult = await testAuthentication();
  console.log(
    `Authentication test: ${authResult.success ? "✅" : "❌"} ${
      authResult.message
    }`
  );

  const results: TestResult[] = [authResult];

  // If not authenticated, we can't proceed with regular tests that require auth
  if (!authResult.success) {
    results.push({
      testName: "Database Operations (Auth Required)",
      success: false,
      message: "Cannot perform database operations - authentication required",
      error: "User not authenticated",
    });

    // Try RLS bypass tests if service key is available
    const rlsResults = await testRLSBypass(
      userId || "12345678-1234-1234-1234-123456789012"
    );
    results.push(...rlsResults);

    return results;
  }

  // Use the authenticated user's ID if no specific ID was provided
  let actualUserId = userId;
  if (!actualUserId && authResult.data && typeof authResult.data === "object") {
    actualUserId = (authResult.data as { userId?: string }).userId;
  }

  if (!actualUserId) {
    results.push({
      testName: "User ID Resolution",
      success: false,
      message: "Could not determine authenticated user ID",
      error: "No user ID available for database operations",
    });
    return results;
  }

  // If authenticated, run the regular tests
  try {
    console.log("\nRunning authenticated database tests...");

    // Test 1: Create/Update User Profile
    try {
      console.log("Test 1: Creating/Updating user profile...");
      const profileData = {
        full_name: "Test User",
        email: "test@example.com",
        bio: "This is a test user for database testing",
        experience: "Testing experience",
        education: "Test education",
        skills: "Testing, Debugging, Development",
      };

      const profileUpdateResult = await updateUserProfile(
        actualUserId,
        profileData
      );

      if (profileUpdateResult) {
        results.push({
          testName: "Update User Profile",
          success: true,
          message: "Profile updated successfully",
          data: profileUpdateResult,
        });

        // Verify the profile was saved
        const retrievedProfile = await getUserProfile(actualUserId);
        if (retrievedProfile) {
          results.push({
            testName: "Get User Profile",
            success: true,
            message: "Profile retrieved successfully",
            data: retrievedProfile,
          });
        } else {
          results.push({
            testName: "Get User Profile",
            success: false,
            message: "Profile was not retrieved after update",
            error: "No profile returned",
          });
        }
      } else {
        results.push({
          testName: "Update User Profile",
          success: false,
          message: "Failed to update profile",
          error: "Update operation returned false",
        });
      }
    } catch (error) {
      console.error("❌ Error in profile test:", error);
      results.push({
        testName: "Update User Profile",
        success: false,
        message: "Error occurred while updating profile",
        error,
      });
    }

    // Test 2: Create Interview Session
    try {
      console.log("\nTest 2: Creating interview session...");
      const sessionData = {
        user_id: actualUserId,
        job_posting: "Software Engineer Position",
        company_info: "Test Company Inc.",
        title: "Software Engineer Interview",
      };

      const createdSession = await createInterviewSession(sessionData);

      if (createdSession) {
        results.push({
          testName: "Create Interview Session",
          success: true,
          message: "Session created successfully",
          data: createdSession,
        });

        // Test 3: Create Interview Question using the created session
        try {
          console.log("Test 3: Creating interview question...");
          const questionData = {
            session_id: createdSession.id!,
            question_text: "Tell me about yourself",
            question_number: 1,
          };

          const createdQuestion = await createInterviewQuestion(questionData);

          if (createdQuestion) {
            results.push({
              testName: "Create Interview Question",
              success: true,
              message: "Question created successfully",
              data: createdQuestion,
            });

            // Test 4: Create Interview Answer
            try {
              console.log("Test 4: Creating interview answer...");
              const answerData = {
                question_id: createdQuestion.id!,
                session_id: createdSession.id!,
                user_answer: "This is a sample answer for testing purposes",
                ai_feedback: "This is sample feedback",
                rating: 8,
              };

              const createdAnswer = await createInterviewAnswer(answerData);

              if (createdAnswer) {
                results.push({
                  testName: "Create Interview Answer",
                  success: true,
                  message: "Answer created successfully",
                  data: createdAnswer,
                });
              } else {
                results.push({
                  testName: "Create Interview Answer",
                  success: false,
                  message: "Failed to create answer",
                  error: "No answer returned",
                });
              }
            } catch (error) {
              console.error("❌ Error in answer test:", error);
              results.push({
                testName: "Create Interview Answer",
                success: false,
                message: "Error occurred while creating answer",
                error,
              });
            }
          } else {
            results.push({
              testName: "Create Interview Question",
              success: false,
              message: "Failed to create question",
              error: "No question returned",
            });
          }
        } catch (error) {
          console.error("❌ Error in question test:", error);
          results.push({
            testName: "Create Interview Question",
            success: false,
            message: "Error occurred while creating question",
            error,
          });
        }

        // Test 5: Get sessions by user
        try {
          console.log("Test 5: Fetching interview sessions by user...");
          const userSessions = await getInterviewSessionsByUser(actualUserId);
          results.push({
            testName: "Get Interview Sessions",
            success: true,
            message: `Retrieved ${userSessions.length} session(s)`,
            data: userSessions,
          });
        } catch (error) {
          console.error("❌ Error in get sessions test:", error);
          results.push({
            testName: "Get Interview Sessions",
            success: false,
            message: "Error occurred while fetching sessions",
            error,
          });
        }
      } else {
        results.push({
          testName: "Create Interview Session",
          success: false,
          message: "Failed to create session",
          error: "No session returned",
        });
      }
    } catch (error) {
      console.error("❌ Error in session test:", error);
      results.push({
        testName: "Create Interview Session",
        success: false,
        message: "Error occurred while creating session",
        error,
      });
    }

    // Test 6: Record Usage
    try {
      console.log("\nTest 6: Recording usage...");
      const usageResult = await recordUsage({
        user_id: actualUserId,
        action: "test_database_insert",
        cost: 1,
        free_interview_used: false,
      });

      if (usageResult) {
        results.push({
          testName: "Record Usage",
          success: true,
          message: "Usage recorded successfully",
        });

        // Test 7: Get user usage
        try {
          console.log("Test 7: Fetching user usage...");
          const userUsage = await getUserUsage(actualUserId);
          results.push({
            testName: "Get User Usage",
            success: true,
            message: `Retrieved ${userUsage.length} usage record(s)`,
            data: userUsage,
          });
        } catch (error) {
          console.error("❌ Error in get usage test:", error);
          results.push({
            testName: "Get User Usage",
            success: false,
            message: "Error occurred while fetching usage",
            error,
          });
        }
      } else {
        results.push({
          testName: "Record Usage",
          success: false,
          message: "Failed to record usage",
          error: "Record operation returned false",
        });
      }
    } catch (error) {
      console.error("❌ Error in usage test:", error);
      results.push({
        testName: "Record Usage",
        success: false,
        message: "Error occurred while recording usage",
        error,
      });
    }
  } catch (error) {
    console.error("❌ Unexpected error during database tests:", error);
    results.push({
      testName: "Overall Database Test",
      success: false,
      message: "Unexpected error during database tests",
      error,
    });
  }

  // Summary
  console.log("\n📊 Test Results Summary:");
  results.forEach((result, index) => {
    console.log(
      `${index + 1}. ${result.testName}: ${
        result.success ? "✅ PASS" : "❌ FAIL"
      } - ${result.message}`
    );
  });

  const passedTests = results.filter((r) => r.success).length;
  const totalTests = results.length;
  console.log(`\n✅ ${passedTests}/${totalTests} tests passed`);

  return results;
}
