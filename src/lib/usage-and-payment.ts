import { NextRequest } from "next/server";
import {
  getUserUsage,
  getDailyUsageCount,
  getUserInterviewsCompleted,
  recordUsage,
  getUserCredits,
  addUserCredits,
  deductUserCredits,
  getInterviewSessionsByUser,
  getQuestionsBySession,
  createPaymentRecord,
} from "@/lib/database";
import { Logger } from "@/lib/logger";
import { validatePaymentSignature } from "@/lib/x402-utils";

// No free interviews - all users get 5 credits to start

export interface UsageCheckResult {
  allowed: boolean;
  remaining: number;
  cost: number;
  creditsAvailable: number;
  paymentRequired?: {
    amount: number;
    currency: string;
    chain: string;
    recipient: string;
    memo?: string;
    description?: string;
  };
}

/**
 * Function to verify payment signature from request headers
 */
export async function verifyPaymentSignature(
  userId: string,
  req: NextRequest | undefined
): Promise<{ valid: boolean; error?: string; transactionId?: string }> {
  Logger.info("Starting payment signature verification", {
    userId,
    hasRequest: !!req,
    hasHeaders: !!(req && req.headers),
  });

  // Check if req is undefined or if it doesn't have headers
  if (!req || !req.headers) {
    Logger.warn("Request or headers not available", { userId });
    return { valid: false, error: "Request or headers not available" };
  }

  // Check for payment signature in request headers (X-PAYMENT header as per x402 spec)
  const paymentHeader = req.headers.get("X-PAYMENT");
  if (!paymentHeader) {
    return { valid: false }; // No payment signature is not an error, just means no payment to verify
  }

  Logger.info("X-PAYMENT header present, starting payment verification", {
    userId,
  });

  // Decode the base64 payment header to get the JSON payload
  let paymentPayload;
  try {
    const decoded = atob(paymentHeader);
    paymentPayload = JSON.parse(decoded);
  } catch (error) {
    return { valid: false, error: "Invalid payment header format" };
  }

  // Extract transaction details from the payment payload
  const { scheme, network, payload } = paymentPayload;
  if (!scheme || !network || !payload) {
    return { valid: false, error: "Invalid payment payload structure" };
  }

  // Extract the serialized transaction from the payload
  const { serializedTransaction } = payload;
  if (!serializedTransaction) {
    return {
      valid: false,
      error: "No serialized transaction in payment payload",
    };
  }

  // For now we'll use the payment amount from the extra field if available, otherwise default
  // In a real implementation, this would come from a stored payment intent
  const usdAmount = paymentPayload?.extra?.usdAmount || 0.5; // Default to $0.50 USD if not specified
  const expectedAmount = Math.round(usdAmount * 10); // Convert USD to credits (0.1 USD = 1 credit, so $0.50 = 5 credits)

  // Log for debugging the credit calculation
  Logger.info("Payment verification details", {
    usdAmount,
    expectedAmount,
    paymentPayloadExtra: paymentPayload?.extra,
  });

  // Use the transaction ID (signature) for validation
  // In a real implementation, this would be extracted from the serialized transaction
  Logger.info("Starting payment signature validation with transaction ID", {
    userId,
    transactionId: serializedTransaction,
  });
  return await validatePaymentSignature(
    userId,
    serializedTransaction, // This would actually be the transaction signature in a real implementation
    expectedAmount,
    usdAmount,
    "USDC"
  );
}

/**
 * Checks user usage and credit status, handling payment verification if a payment header is present.
 */
export async function checkUsage(
  userId: string,
  action: string,
  req?: NextRequest,
  customCost?: number
): Promise<UsageCheckResult> {
  Logger.info("Checking user usage", {
    userId,
    action,
    customCost,
    hasRequest: !!req,
  });

  const cost = customCost || 1; // Use custom cost if provided, otherwise default to 1 credit

  if (!userId || userId === "anonymous") {
    // For anonymous users, only allow basic usage with no personalization
    return {
      allowed: true,
      remaining: -1, // Indicate unlimited for anonymous
      cost,
      creditsAvailable: -1, // Unlimited for anonymous users
    };
  }

  // First, check if there's a payment signature that needs verification (only if req is provided)
  if (req) {
    const paymentVerification = await verifyPaymentSignature(userId, req);

    if (paymentVerification.valid && paymentVerification.transactionId) {
      // Payment was just verified, allow the action
      Logger.info(
        "Payment successfully verified, allowing request and fetching updated credits",
        {
          userId,
          transactionId: paymentVerification.transactionId,
        }
      );

      // Extract the USD amount from the payment header to calculate credits
      const paymentHeader = req.headers.get("X-PAYMENT");
      let creditsAdded = 5; // Default to 5 credits if we can't extract the amount

      if (paymentHeader) {
        try {
          const decoded = atob(paymentHeader);
          const paymentPayload = JSON.parse(decoded);
          const usdAmount = paymentPayload?.extra?.usdAmount || 0.5; // Default to $0.50 USD if not specified
          creditsAdded = Math.round(usdAmount * 10); // Convert USD to credits (0.1 USD = 1 credit, so $0.50 = 5 credits)

          // Log for debugging the credit calculation
          Logger.info("Credit calculation details (for logging only)", {
            usdAmount,
            creditsAdded,
            paymentPayloadExtra: paymentPayload?.extra,
          });
        } catch (error) {
          Logger.warn(
            "Could not extract payment amount from header, using default",
            { error }
          );
        }
      }

      const updatedCredits = await getUserCredits(userId);
      return {
        allowed: true,
        remaining: updatedCredits,
        cost,
        creditsAvailable: updatedCredits,
      };
    }
  }

  // Simple credit-based system - no free interview logic
  const creditsAvailable = await getUserCredits(userId);

  if (creditsAvailable >= cost) {
    // User has sufficient credits
    return {
      allowed: true,
      remaining: creditsAvailable - cost,
      cost,
      creditsAvailable,
    };
  } else {
    // User needs to pay - return payment required information
    // Using micropayment amounts as suggested in the insight ($0.01 - $0.10 range)
    // For the new flow, we'll use 0.5 USDC for 5 credits as described in the proposal
    const micropaymentAmount = 0.5; // $0.50 USD for 5 credits

    // Create a payment record for this payment request
    try {
      const paymentRecord = await createPaymentRecord({
        user_id: userId,
        transaction_id: `pending_${userId}_${Date.now()}`, // Temporary ID until actual transaction - uses user ID for easy lookup
        expected_amount: micropaymentAmount,
        token: "USDC",
        recipient:
          process.env.NEXT_PUBLIC_PAYMENT_WALLET || "YOUR_WALLET_ADDRESS",
      });

      if (!paymentRecord) {
        Logger.error("Failed to create payment record for user", { userId });
      }
    } catch (error) {
      Logger.error("Error creating payment record:", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      });
    }

    return {
      allowed: false,
      remaining: 0,
      cost,
      creditsAvailable,
      paymentRequired: {
        amount: micropaymentAmount, // $0.50 USD for 5 credits
        currency: "USDC",
        chain: process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.includes("devnet")
          ? "solana-devnet"
          : "solana",
        recipient:
          process.env.NEXT_PUBLIC_PAYMENT_WALLET || "YOUR_WALLET_ADDRESS",
        memo: `credit-topup-session-${Date.now()}`, // Include session ID in memo
        description: "Top up 5 credits for feedback",
      },
    };
  }
}

/**
 * Function to check usage status after processing (without payment verification)
 */
export async function checkUsageAfterProcessing(
  userId: string,
  action: string
): Promise<UsageCheckResult> {
  const cost = 1; // Each action costs 1 credit

  if (!userId || userId === "anonymous") {
    // For anonymous users, only allow basic usage with no personalization
    return {
      allowed: true,
      remaining: -1, // Indicate unlimited for anonymous
      cost,
      creditsAvailable: -1, // Unlimited for anonymous users
    };
  }

  // Simple credit-based system
  const creditsAvailable = await getUserCredits(userId);

  return {
    allowed: creditsAvailable >= cost,
    remaining: creditsAvailable - cost,
    cost,
    creditsAvailable,
  };
}

/**
 * Records usage in the database and deducts credits if necessary.
 */
export async function recordUsageWithDatabase(
  userId: string,
  action: string,
  cost: number,
  unused: boolean = false, // Kept for compatibility, but no longer used
  wasPaymentJustVerified: boolean = false
): Promise<boolean> {
  Logger.info("Recording usage in database", {
    userId,
    action,
    cost,
    wasPaymentJustVerified,
  });

  if (!userId || userId === "anonymous") {
    // Don't record usage for anonymous users
    Logger.info("Not recording usage for anonymous user", { action });
    return true;
  }

  // Simple credit-based system - deduct credits unless payment was just verified
  if (!wasPaymentJustVerified) {
    try {
      // Check user has sufficient credits before processing (defensive check)
      const currentCredits = await getUserCredits(userId);

      // Only deduct credits if user has sufficient balance
      // This is a defensive check - ideally checkUsage would prevent reaching this point
      if (currentCredits >= cost) {
        const creditsDeducted = await deductUserCredits(userId, cost);
        if (!creditsDeducted) {
          Logger.error(`Failed to deduct credits for user`, {
            userId,
            action,
            cost,
          });
          // We'll still record the usage but note the credit deduction failure
        } else {
          Logger.info(`Successfully deducted credits`, {
            userId,
            action,
            cost,
          });
        }
      } else {
        Logger.warn(`User had insufficient credits but processing continued`, {
          userId,
          action,
          cost,
          currentCredits,
        });
        // We'll still record the usage as the checkUsage function should have already
        // verified payment or thrown a 402 error before this point
      }
    } catch (error) {
      Logger.error(`Error in credit management for user`, {
        userId,
        action,
        cost,
        error: error instanceof Error ? error.message : String(error),
      });
      // Continue with usage recording even if credit management fails
    }
  } else {
    Logger.info(`Payment just verified - not deducting credits`, {
      userId,
      action,
      cost,
    });
  }

  // Record the usage in the database (simplified)
  const usageRecord = {
    user_id: userId,
    action,
    cost,
    free_interview_used: false, // No longer tracking this
    interviews_completed: 0, // No longer tracking this
  };

  try {
    const success = await recordUsage(usageRecord);

    if (success) {
      Logger.info(`Recorded usage in database`, {
        userId,
        action,
        cost,
      });
      return true;
    } else {
      Logger.error(`Failed to record usage in database`, {
        userId,
        action,
        cost,
      });
      return false;
    }
  } catch (error) {
    Logger.error(`Error recording usage in database`, {
      userId,
      action,
      cost,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

// No exports needed - all logic is now simplified
