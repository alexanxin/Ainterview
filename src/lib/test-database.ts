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

// Mock user ID for testing - in real usage, this would come from authentication
const TEST_USER_ID = "12345678-1234-1234-1234-123456789012";

async function testDatabaseOperations() {
  console.log("Starting database test operations...\n");

  try {
    // Test 1: Create/Update User Profile
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
      TEST_USER_ID,
      profileData
    );
    console.log("Profile update result:", profileUpdateResult);

    // Verify the profile was saved
    const retrievedProfile = await getUserProfile(TEST_USER_ID);
    console.log("Retrieved profile:", retrievedProfile);
    console.log("Profile test completed successfully!\n");

    // Test 2: Create Interview Session
    console.log("Test 2: Creating interview session...");
    const sessionData = {
      user_id: TEST_USER_ID,
      job_posting: "Software Engineer Position",
      company_info: "Test Company Inc.",
      title: "Software Engineer Interview",
    };

    const createdSession = await createInterviewSession(sessionData);
    console.log("Created session:", createdSession);

    if (createdSession) {
      // Test 3: Create Interview Question
      console.log("Test 3: Creating interview question...");
      const questionData = {
        session_id: createdSession.id!,
        question_text: "Tell me about yourself",
        question_number: 1,
      };

      const createdQuestion = await createInterviewQuestion(questionData);
      console.log("Created question:", createdQuestion);

      if (createdQuestion) {
        // Test 4: Create Interview Answer
        console.log("Test 4: Creating interview answer...");
        const answerData = {
          question_id: createdQuestion.id!,
          session_id: createdSession.id!,
          user_answer: "This is a sample answer for testing purposes",
          ai_feedback: "This is sample feedback",
          rating: 8,
        };

        const createdAnswer = await createInterviewAnswer(answerData);
        console.log("Created answer:", createdAnswer);
      }

      // Test 5: Get sessions by user
      console.log("Test 5: Fetching interview sessions by user...");
      const userSessions = await getInterviewSessionsByUser(TEST_USER_ID);
      console.log("User sessions count:", userSessions.length);
      console.log("First session:", userSessions[0]);
    }

    // Test 6: Record Usage
    console.log("Test 6: Recording usage...");
    const usageResult = await recordUsage({
      user_id: TEST_USER_ID,
      action: "test_database_insert",
      cost: 1,
      free_interview_used: false,
    });
    console.log("Usage record result:", usageResult);

    // Test 7: Get user usage
    console.log("Test 7: Fetching user usage...");
    const userUsage = await getUserUsage(TEST_USER_ID);
    console.log("User usage count:", userUsage.length);
    console.log("Last usage record:", userUsage[0]);

    console.log("\nAll database tests completed successfully!");
  } catch (error) {
    console.error("Database test error:", error);
  }
}

// Run the test
testDatabaseOperations();

export default testDatabaseOperations;
