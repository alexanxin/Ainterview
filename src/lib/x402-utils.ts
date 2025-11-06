// X402 Payment Utilities for Ainterview
import { addUserCredits } from "@/lib/database";
import { solanaPaymentService } from "@/lib/solana-payment-service";
import { Logger } from "@/lib/logger";

// Function to process a completed payment and add credits to user account
export async function processCompletedX402Payment(
  userId: string,
  transactionId: string,
  expectedAmount: number,
  usdAmount: number,
  token: "USDC" | "USDT" | "CASH" = "USDC"
): Promise<{ success: boolean; error?: string; creditsAdded?: number }> {
  try {
    // Verify the payment on the Solana blockchain
    const verificationResult = await solanaPaymentService.verifyPayment(
      transactionId,
      expectedAmount,
      token
    );

    if (!verificationResult.success) {
      return {
        success: false,
        error: verificationResult.error || "Payment verification failed",
      };
    }

    if (userId) {
      // Add credits based on the USD amount using the database function
      // This handles the conversion from USD to credits (e.g., $0.10 = 1 credit)
      const creditsAdded = await addUserCredits(
        userId,
        Math.round(usdAmount * 10)
      ); // Convert USD to credits (1 USD = 10 credits)

      if (!creditsAdded) {
        Logger.error(
          "Failed to update user credits after successful payment verification",
          {
            userId,
            transactionId,
            usdAmount,
          }
        );

        return {
          success: false,
          error:
            "Failed to update user credits after successful payment verification",
        };
      }

      Logger.info("Successfully processed x402 payment and added credits", {
        userId,
        transactionId,
        usdAmount,
        creditsAdded: Math.round(usdAmount * 10), // Approximate conversion for logging
      });

      return {
        success: true,
        creditsAdded: Math.round(usdAmount * 10), // Return approximate credits added
      };
    }

    // If no user ID but verification was successful
    return {
      success: true,
    };
  } catch (error) {
    Logger.error("Error processing completed x402 payment:", {
      error: error instanceof Error ? error.message : String(error),
      userId,
      transactionId,
      usdAmount,
    });
    return {
      success: false,
      error: "Internal error processing payment",
    };
  }
}

// Function to validate a payment signature from request headers
export async function validatePaymentSignature(
  userId: string,
  paymentSignature: string,
  expectedAmount: number,
  usdAmount: number,
  token: "USDC" | "USDT" | "CASH" = "USDC"
): Promise<{ valid: boolean; error?: string; transactionId?: string }> {
  if (!paymentSignature) {
    return { valid: false, error: "No payment signature provided" };
  }

  try {
    const verificationResult = await solanaPaymentService.verifyPayment(
      paymentSignature,
      expectedAmount,
      token
    );

    if (verificationResult.success) {
      // Process the payment by adding credits to the user account
      const processingResult = await processCompletedX402Payment(
        userId,
        paymentSignature,
        expectedAmount,
        usdAmount,
        token
      );

      if (processingResult.success) {
        return {
          valid: true,
          transactionId: paymentSignature,
        };
      } else {
        return {
          valid: false,
          error: processingResult.error,
        };
      }
    } else {
      return {
        valid: false,
        error: verificationResult.error || "Payment verification failed",
      };
    }
  } catch (error) {
    Logger.error("Error validating payment signature:", {
      error: error instanceof Error ? error.message : String(error),
      userId,
      paymentSignature,
      expectedAmount,
      usdAmount,
      token,
    });
    return {
      valid: false,
      error: "Payment validation failed due to internal error",
    };
  }
}

// Function to get x402 payment response body for HTTP 402 response
export function getX402PaymentResponse(paymentRequired: {
  amount: number;
  currency: string;
  chain: string;
  recipient: string;
  memo?: string;
  description?: string;
}): { status: number; body: object } {
  // Convert the amount to atomic units (assuming USDC with 6 decimals)
  // For example: 0.5 USD -> 50000 in atomic units (0.5 * 10^6)
  const atomicAmount = Math.round(paymentRequired.amount * 1000000).toString();

  // Get the appropriate mint address based on the currency
  const tokenMintAddresses: Record<string, string> = {
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Mainnet
    USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // Mainnet
    CASH: "CASHXWvxwjmrRdjMGJtD4K58z9mJYwg4x4Qq5NmN7cdL", // Placeholder
  };

  // Use devnet mint address for testing
  const devnetTokenMintAddresses: Record<string, string> = {
    USDC: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Devnet
    USDT: "9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJq8Lp1m1B51u9", // Devnet
    CASH: "CASHXWvxwjmrRdjMGJtD4K58z9mJYwg4x4Qq5NmN7cdL", // Placeholder
  };

  const isDevnet =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.includes("devnet") || false;
  const tokenMint = isDevnet
    ? devnetTokenMintAddresses[paymentRequired.currency] ||
      devnetTokenMintAddresses["USDC"]
    : tokenMintAddresses[paymentRequired.currency] ||
      tokenMintAddresses["USDC"];

  const paymentRequirements = {
    scheme: "exact",
    network: paymentRequired.chain, // e.g., "solana", "solana-devnet"
    maxAmountRequired: atomicAmount,
    payTo: paymentRequired.recipient,
    asset: tokenMint,
    description:
      paymentRequired.description ||
      paymentRequired.memo ||
      "Top up 5 credits for feedback",
    mimeType: "application/json",
    maxTimeoutSeconds: 300, // 5 minutes
    extra: {
      memo: paymentRequired.memo,
      usdAmount: paymentRequired.amount, // Include the original USD amount for reference
    },
  };

  return {
    status: 402,
    body: {
      x402Version: 1,
      accepts: [paymentRequirements],
    },
  };
}
