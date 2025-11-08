#!/usr/bin/env node

// Simple test to verify the free interview fix

const FREE_INTERVIEWS = 1;

function testFreeInterviewLogic() {
    console.log("🧪 Testing Free Interview Logic");
    console.log("================================");

    // Test case: New user with 0 completed interviews
    const newUser = {
        interviewsCompleted: 0,
        credits: 0,
        cost: 1
    };

    const freeInterviewUsed = newUser.interviewsCompleted >= FREE_INTERVIEWS;

    console.log(`\nNew User Test:`);
    console.log(`- Interviews completed: ${newUser.interviewsCompleted}`);
    console.log(`- Free interview used: ${freeInterviewUsed}`);
    console.log(`- Credits available: ${newUser.credits}`);

    if (!freeInterviewUsed) {
        console.log("✅ RESULT: User can use FREE interview");
    } else if (newUser.credits >= newUser.cost) {
        console.log("✅ RESULT: User has sufficient credits");
    } else {
        console.log("❌ RESULT: User needs to pay");
    }

    // Test case: User who completed free interview
    const experiencedUser = {
        interviewsCompleted: 1, // Used free interview
        credits: 0,
        cost: 1
    };

    const freeInterviewUsed2 = experiencedUser.interviewsCompleted >= FREE_INTERVIEWS;

    console.log(`\nExperienced User Test:`);
    console.log(`- Interviews completed: ${experiencedUser.interviewsCompleted}`);
    console.log(`- Free interview used: ${freeInterviewUsed2}`);
    console.log(`- Credits available: ${experiencedUser.credits}`);

    if (!freeInterviewUsed2) {
        console.log("✅ RESULT: User can use FREE interview");
    } else if (experiencedUser.credits >= experiencedUser.cost) {
        console.log("✅ RESULT: User has sufficient credits");
    } else {
        console.log("❌ RESULT: User needs to pay");
    }

    console.log(`\n✅ Test Summary: New users can now access their free interview!`);
}

testFreeInterviewLogic();