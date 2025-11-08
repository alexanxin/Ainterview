#!/usr/bin/env node

import {
  getUserCredits,
  addUserCredits,
  deductUserCredits,
} from "./app/src/lib/database";

async function testSimplifiedCreditSystem() {
  console.log("🧪 Testing Simplified Credit System");
  console.log("====================================\n");

  const testUserId = "test-user-" + Date.now();

  // Test 1: New user should get 5 credits automatically
  console.log("Test 1: New user gets 5 starting credits");
  const initialCredits = await getUserCredits(testUserId);
  console.log(`✅ New user credits: ${initialCredits} (expected: 5)`);
  if (initialCredits === 5) {
    console.log("✅ PASS: New users automatically get 5 credits\n");
  } else {
    console.log("❌ FAIL: New users should get 5 credits\n");
    return;
  }

  // Test 2: Deducting credits works
  console.log("Test 2: Credit deduction");
  const afterDeduction = await getUserCredits(testUserId);
  console.log(`Credits before deduction: ${afterDeduction}`);

  const deductSuccess = await deductUserCredits(testUserId, 2);
  const creditsAfterDeduction = await getUserCredits(testUserId);
  console.log(
    `Credits after deduction: ${creditsAfterDeduction} (expected: 3)`
  );

  if (deductSuccess && creditsAfterDeduction === 3) {
    console.log("✅ PASS: Credit deduction works correctly\n");
  } else {
    console.log("❌ FAIL: Credit deduction failed\n");
    return;
  }

  // Test 3: Adding credits works
  console.log("Test 3: Credit addition");
  const addSuccess = await addUserCredits(testUserId, 4);
  const creditsAfterAddition = await getUserCredits(testUserId);
  console.log(`Credits after addition: ${creditsAfterAddition} (expected: 7)`);

  if (addSuccess && creditsAfterAddition === 7) {
    console.log("✅ PASS: Credit addition works correctly\n");
  } else {
    console.log("❌ FAIL: Credit addition failed\n");
    return;
  }

  console.log(
    "🎉 All tests passed! The simplified credit system works correctly."
  );
  console.log("\n📋 Summary:");
  console.log("• New users automatically get 5 credits");
  console.log("• Credits can be deducted successfully");
  console.log("• Credits can be added successfully");
  console.log("• No complex free interview logic needed");
}

// Run the test
testSimplifiedCreditSystem().catch(console.error);
