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

// Type definitions for test results
export interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  data?: unknown;
  error?: unknown;
}

/**
 * Comprehensive test suite for database operations
 */
export async function runDatabaseTests(userId?: string): Promise<TestResult[]> {
  console.log("🚀 Starting database test operations...\n");

  if (!userId) {
    const results: TestResult[] = [
      {
        testName: "User ID Check",
        success: false,
        message: "User ID is required for database operations",
        error: "No user ID provided",
      },
    ];
    return results;
  }

  const results: TestResult[] = [];

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

    const profileUpdateResult = await updateUserProfile(userId, profileData);

    if (profileUpdateResult) {
      results.push({
        testName: "Update User Profile",
        success: true,
        message: "Profile updated successfully",
        data: profileUpdateResult,
      });

      // Verify the profile was saved
      const retrievedProfile = await getUserProfile(userId);
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
      error: error,
    });
  }

  // Test 2: Create Interview Session
  try {
    console.log("\nTest 2: Creating interview session...");
    const sessionData = {
      user_id: userId,
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
              error: error,
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
          error: error,
        });
      }

      // Test 5: Get sessions by user
      try {
        console.log("Test 5: Fetching interview sessions by user...");
        const userSessions = await getInterviewSessionsByUser(userId);
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
          error: error,
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
      error: error,
    });
  }

  // Test 6: Record Usage
  try {
    console.log("\nTest 6: Recording usage...");
    const usageResult = await recordUsage({
      user_id: userId,
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
        const userUsage = await getUserUsage(userId);
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
          error: error,
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
      error: error,
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

/**
 * Run a quick connectivity test to see if the database is accessible
 */
export async function testDatabaseConnectivity(): Promise<boolean> {
  try {
    // Try to get a non-existent user profile to test connectivity
    const result = await getUserProfile("non-existent-user-test");
    // If we get here without an error, the database is accessible
    return true;
  } catch (error) {
    console.error("Database connectivity test failed:", error);
    return false;
  }
}
