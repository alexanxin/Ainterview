import { config } from "dotenv";
config({ path: ".env.local" });

import { solanaPaymentService } from "./src/lib/solana-payment-service";
import { Logger } from "./src/lib/logger";

async function testSolanaVerification(transactionId: string) {
  Logger.info(`Attempting to verify transaction: ${transactionId}`);
  const result = await solanaPaymentService.verifyPayment(
    transactionId,
    18,
    "USDC"
  ); // Use a dummy amount and token
  if (result.success) {
    Logger.info(
      `Transaction ${transactionId} successfully verified! Credits added: ${result.creditsAdded}`
    );
  } else {
    Logger.error(
      `Transaction ${transactionId} verification failed: ${result.error}`
    );
  }
}

// Replace with a real transaction ID from Solscan (e.g., from a failed payment attempt)
const TEST_TRANSACTION_ID =
  "33ntihk8cRFF4mBUQ9tArr17Bqx69fVYV4NSnDUqtubhSuspuWPbg5svmGHhtTD8zyoXqgZ2aNKissFGJzvrtWJp";

testSolanaVerification(TEST_TRANSACTION_ID).catch((error) => {
  console.error("Test failed with error:", error);
  process.exit(1);
});
