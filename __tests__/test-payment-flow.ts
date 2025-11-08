import { x402Service } from "./app/src/lib/x402-payment-service";
import { solanaPaymentService } from "./app/src/lib/solana-payment-service";
import { paymentVerificationService } from "./app/src/lib/payment-verification-service";
import {
  processCompletedX402Payment,
  validatePaymentSignature,
} from "./app/src/lib/x402-utils";
import {
  checkUsage,
  verifyPaymentSignature,
} from "./app/src/lib/usage-and-payment";

// Test function to simulate the payment verification flow
async function testPaymentFlow() {
  console.log("Starting payment verification flow test...");

  try {
    // Initialize services
    console.log("Initializing payment services...");
    const x402Init = await x402Service.initialize();
    const solanaInit = await solanaPaymentService.initialize();

    console.log(`X402 Service initialized: ${x402Init}`);
    console.log(`Solana Service initialized: ${solanaInit}`);

    // Simulate a payment request
    console.log("\nCreating Solana payment request...");
    const paymentData = {
      userId: "test_user_123",
      amount: 0.5, // $0.50 USD
      token: "USDC" as const,
      recipientPublicKey:
        process.env.NEXT_PUBLIC_PAYMENT_WALLET || "YOUR_WALLET_ADDRESS",
    };

    const paymentRequest = await x402Service.createSolanaPaymentRequest(
      paymentData
    );
    console.log("Payment request result:", paymentRequest);

    if (paymentRequest.success && paymentRequest.transactionId) {
      console.log("\nSimulating payment verification...");

      // Simulate payment verification
      const verificationResult = await x402Service.verifySolanaPayment(
        paymentRequest.transactionId,
        paymentData.userId,
        paymentData.amount,
        paymentData.token
      );

      console.log("Payment verification result:", verificationResult);

      // Test processCompletedX402Payment function
      console.log("\nTesting processCompletedX402Payment...");
      const processResult = await processCompletedX402Payment(
        paymentData.userId,
        paymentRequest.transactionId,
        paymentData.amount * 10, // expectedAmount in credits
        paymentData.amount, // usdAmount
        paymentData.token
      );

      console.log("Process completed payment result:", processResult);

      // Test validatePaymentSignature function
      console.log("\nTesting validatePaymentSignature...");
      const validateResult = await validatePaymentSignature(
        paymentData.userId,
        paymentRequest.transactionId,
        paymentData.amount * 10, // expectedAmount
        paymentData.amount, // usdAmount
        paymentData.token
      );

      console.log("Validate payment signature result:", validateResult);

      // Test checkUsage function
      console.log("\nTesting checkUsage function...");
      const usageCheck = await checkUsage(
        paymentData.userId,
        "test_action",
        undefined // No request object for this test
      );

      console.log("Usage check result:", usageCheck);
    }

    console.log("\nPayment verification flow test completed successfully!");
  } catch (error) {
    console.error("Error during payment verification flow test:", error);
  }
}

// Run the test
testPaymentFlow();
