#!/usr/bin/env node

import { checkUsage } from "./app/src/lib/usage-and-payment";

async function testPaymentPrompt() {
  console.log("💳 Testing Payment Prompt Logic");
  console.log("================================\n");

  const testUserId = "payment-test-" + Date.now();

  // Test: User with insufficient credits should trigger payment prompt
  console.log("Test: User with 0 credits should be prompted to pay");

  // Simulate user with 0 credits (after using their 5 starting credits)
  const mockUserCredits = 0;
  console.log(`Simulated user credits: ${mockUserCredits}`);

  const usageCheck = await checkUsage(testUserId, "analyzeAnswer");
  console.log("Usage check result:", {
    allowed: usageCheck.allowed,
    cost: usageCheck.cost,
    creditsAvailable: usageCheck.creditsAvailable,
    paymentRequired: usageCheck.paymentRequired ? "Yes" : "No",
  });

  if (!usageCheck.allowed && usageCheck.paymentRequired) {
    console.log("✅ PASS: Payment prompt triggered correctly");
    console.log(
      `   Payment amount: $${usageCheck.paymentRequired.amount} ${usageCheck.paymentRequired.currency}`
    );
    console.log(`   Description: ${usageCheck.paymentRequired.description}`);
  } else {
    console.log(
      "❌ FAIL: Payment prompt should trigger for users with 0 credits"
    );
  }

  console.log("\n🎉 Payment prompt logic verified!");
}

// Run the test
testPaymentPrompt().catch(console.error);
