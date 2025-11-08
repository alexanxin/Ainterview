// Test file to verify x402 implementation
import {
  getUserCredits,
  addUserCredits,
  deductUserCredits,
} from "@/lib/database";
import { x402Service } from "@/lib/x402-payment-service";
import { solanaPaymentService } from "@/lib/solana-payment-service";

async function testX402Flow() {
  console.log("Starting x402 implementation test...");

  // Test 1: Initialize payment services
  console.log("\n1. Testing payment service initialization...");
  try {
    const x402Init = await x402Service.initialize();
    const solanaInit = await solanaPaymentService.initialize();
    console.log(`   x402 service initialized: ${x402Init}`);
    console.log(`   Solana service initialized: ${solanaInit}`);
  } catch (error) {
    console.error("   Error initializing payment services:", error);
  }

  // Test 2: Test credit functions (using a mock user ID)
  console.log("\n2. Testing credit functions...");
  const mockUserId = "test-user-id";
  try {
    // Check initial credits (should be 0)
    const initialCredits = await getUserCredits(mockUserId);
    console.log(`   Initial credits for user: ${initialCredits}`);

    // Add credits
    const addCreditsSuccess = await addUserCredits(mockUserId, 50);
    console.log(`   Add credits success: ${addCreditsSuccess}`);

    // Check credits after adding
    const creditsAfterAdding = await getUserCredits(mockUserId);
    console.log(`   Credits after adding: ${creditsAfterAdding}`);

    // Deduct credits
    const deductCreditsSuccess = await deductUserCredits(mockUserId, 10);
    console.log(`   Deduct credits success: ${deductCreditsSuccess}`);

    // Check credits after deduction
    const creditsAfterDeduction = await getUserCredits(mockUserId);
    console.log(`   Credits after deduction: ${creditsAfterDeduction}`);
  } catch (error) {
    console.error("   Error testing credit functions:", error);
  }

  // Test 3: Test Solana payment request creation
  console.log("\n3. Testing Solana payment request creation...");
  try {
    const paymentRequest = await x402Service.createSolanaPaymentRequest({
      userId: mockUserId,
      amount: 25, // $25
      token: "USDC",
      recipientPublicKey: "DUMMY_RECIPIENT_KEY",
    });
    console.log(`   Payment request created:`, paymentRequest);
  } catch (error) {
    console.error("   Error creating payment request:", error);
  }

  // Test 4: Test payment verification
  console.log("\n4. Testing payment verification...");
  try {
    const verificationResult = await x402Service.verifySolanaPayment(
      "test-tx-id",
      mockUserId
    );
    console.log(`   Payment verification result:`, verificationResult);
  } catch (error) {
    console.error("   Error verifying payment:", error);
  }

  // Test 5: Test token mint address retrieval
  console.log("\n5. Testing token mint address retrieval...");
  try {
    const usdcAddress = x402Service.getTokenMintAddress("USDC");
    const usdtAddress = x402Service.getTokenMintAddress("USDT");
    const cashAddress = x402Service.getTokenMintAddress("CASH");
    console.log(`   USDC mint address: ${usdcAddress}`);
    console.log(`   USDT mint address: ${usdtAddress}`);
    console.log(`   CASH mint address: ${cashAddress}`);
  } catch (error) {
    console.error("   Error retrieving token addresses:", error);
  }

  console.log("\nX402 implementation test completed!");
}

// Run the test
testX402Flow().catch(console.error);
