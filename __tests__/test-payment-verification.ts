import { SolanaPaymentService } from "./app/src/lib/solana-payment-service.js";

// Simple test to verify the payment verification functionality
async function testPaymentVerification() {
  console.log("Testing Solana Payment Verification...");

  try {
    const paymentService = SolanaPaymentService.getInstance();
    const initialized = await paymentService.initialize();

    if (!initialized) {
      console.error("Failed to initialize payment service");
      return;
    }

    console.log("Payment service initialized successfully");

    // Test with a valid transaction ID format (should attempt real verification)
    const validResult = await paymentService.verifyPayment(
      "4fwv5VbRZf5849UaBq5Yh54fX8b23fG6Vc9Yk8p3t7R4E5Wq9M7N2H8J6F1C5V7B3A9Z",
      10,
      "USDC"
    );
    console.log("Valid transaction result:", validResult);

    // Test with an invalid transaction ID format
    const invalidResult = await paymentService.verifyPayment(
      "invalid",
      10,
      "USDC"
    );
    console.log("Invalid transaction result:", invalidResult);

    // Test with an empty transaction ID
    const emptyResult = await paymentService.verifyPayment("", 10, "USDC");
    console.log("Empty transaction result:", emptyResult);

    console.log("Payment verification tests completed");
  } catch (error) {
    console.error("Error during payment verification test:", error);
  }
}

// Run the test
testPaymentVerification();
