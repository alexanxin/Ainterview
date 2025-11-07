// X402 Middleware for API Routes
// Provides integration between the x402 verification service and API endpoints
import { NextApiRequest, NextApiResponse } from "next";
import { x402VerificationService } from "@/lib/x402-verification-service";
import { Logger } from "@/lib/logger";

// Interface for x402 middleware options
interface X402MiddlewareOptions {
  requiredAmount: number; // Required payment amount in USD
  token?: "USDC" | "USDT" | "CASH"; // Token type, defaults to USDC
  description?: string; // Description of the payment
  memo?: string; // Memo for the transaction
}

/**
 * X402 Payment Verification Middleware
 * Use this middleware in API routes that require payment verification
 */
export function withX402Verification(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<void | NextApiResponse>,
  options: X402MiddlewareOptions
) {
  return async (
    req: NextApiRequest & {
      x402Verified?: boolean;
      x402TransactionSignature?: string;
    },
    res: NextApiResponse
  ) => {
    try {
      // Check if this is a payment verification request
      const paymentHeader = req.headers["x-payment"] as string;
      const userId = req.body?.userId || req.query?.userId;

      if (!paymentHeader) {
        // No payment header provided, return 402 Payment Required
        return res.status(402).json({
          error: "Payment Required",
          message: "X-PAYMENT header is required for this endpoint",
          paymentRequired: {
            amount: options.requiredAmount,
            currency: options.token || "USDC",
            chain: process.env.NEXT_PUBLIC_SOLANA_NETWORK || "solana",
            recipient:
              process.env.NEXT_PUBLIC_PAYMENT_WALLET || "YOUR_WALLET_ADDRESS",
            memo: options.memo,
            description: options.description || "Payment for service access",
          },
          x402Version: 1,
          accepts: [
            {
              scheme: "exact",
              network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || "solana",
              maxAmountRequired: (options.requiredAmount * 1000000).toString(), // Convert to atomic units
              payTo:
                process.env.NEXT_PUBLIC_PAYMENT_WALLET || "YOUR_WALLET_ADDRESS",
              asset:
                options.token === "USDC"
                  ? "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // Mainnet USDC
                  : options.token === "USDT"
                  ? "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" // Mainnet USDT
                  : "CASHXWvxwjmrRdjMGJtD4K58z9mJYwg4x4Qq5NmN7cdL", // Placeholder
              description: options.description || "Payment for service access",
              mimeType: "application/json",
              maxTimeoutSeconds: 300, // 5 minutes
              extra: {
                memo: options.memo,
                usdAmount: options.requiredAmount,
              },
            },
          ],
        });
      }

      if (!userId) {
        return res.status(400).json({
          error: "User ID is required for payment verification",
        });
      }

      // Get payment requirements from environment or options
      const paymentRequirements = {
        scheme: "exact",
        network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || "solana",
        maxAmountRequired: (options.requiredAmount * 10000).toString(), // Convert to atomic units
        payTo: process.env.NEXT_PUBLIC_PAYMENT_WALLET || "YOUR_WALLET_ADDRESS",
        asset:
          options.token === "USDC"
            ? "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // Mainnet USDC
            : options.token === "USDT"
            ? "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" // Mainnet USDT
            : "CASHXWvxwjmrRdjMGJtD4K58z9mJYwg4x4Qq5NmN7cdL", // Placeholder
        description: options.description || "Payment for service access",
        mimeType: "application/json",
        maxTimeoutSeconds: 300, // 5 minutes
        extra: {
          memo: options.memo,
          usdAmount: options.requiredAmount,
        },
      };

      // Verify the payment using the two-phase verification approach
      const verificationResult =
        await x402VerificationService.verifyAndSettlePayment(
          paymentHeader,
          paymentRequirements,
          userId,
          options.requiredAmount,
          options.token || "USDC"
        );

      if (!verificationResult.success) {
        Logger.error("X402 payment verification failed:", {
          userId,
          error: verificationResult.error,
        });

        return res.status(402).json({
          error: "Payment verification failed",
          details: verificationResult.error,
        });
      }

      // Add payment verification info to request object for downstream handlers
      req.x402Verified = true;
      req.x402TransactionSignature =
        verificationResult.details?.transactionSignature;

      Logger.info("X402 payment verification successful", {
        userId,
        transactionSignature: verificationResult.details?.transactionSignature,
      });

      // Call the original handler
      return await handler(req, res);
    } catch (error) {
      Logger.error("Error in X402 middleware:", {
        error: error instanceof Error ? error.message : String(error),
      });

      return res.status(500).json({
        error: "Internal server error during payment verification",
      });
    }
  };
}

/**
 * X402 Verification for Next.js API Routes (App Router)
 * Use this with Next.js 13+ App Router API routes
 */
export async function verifyX402PaymentForAppRoute(
  headers: Headers,
  userId: string,
  requiredAmount: number,
  token: "USDC" | "USDT" | "CASH" = "USDC",
  description?: string
): Promise<{
  success: boolean;
  error?: string;
  transactionSignature?: string;
}> {
  try {
    const paymentHeader = headers.get("X-PAYMENT");

    if (!paymentHeader) {
      return {
        success: false,
        error: "X-PAYMENT header is required for this endpoint",
      };
    }

    if (!userId) {
      return {
        success: false,
        error: "User ID is required for payment verification",
      };
    }

    // Get payment requirements
    const paymentRequirements = {
      scheme: "exact",
      network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || "solana",
      maxAmountRequired: (requiredAmount * 10000).toString(), // Convert to atomic units
      payTo: process.env.NEXT_PUBLIC_PAYMENT_WALLET || "YOUR_WALLET_ADDRESS",
      asset:
        token === "USDC"
          ? "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // Mainnet USDC
          : token === "USDT"
          ? "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" // Mainnet USDT
          : "CASHXWvxwjmrRdjMGJtD4K58z9mJYwg4x4Qq5NmN7cdL", // Placeholder
      description: description || "Payment for service access",
      mimeType: "application/json",
      maxTimeoutSeconds: 300, // 5 minutes
      extra: {
        memo: `Payment for user: ${userId}`,
        usdAmount: requiredAmount,
      },
    };

    // Verify the payment using the two-phase verification approach
    const verificationResult =
      await x402VerificationService.verifyAndSettlePayment(
        paymentHeader,
        paymentRequirements,
        userId,
        requiredAmount,
        token
      );

    if (!verificationResult.success) {
      Logger.error("X402 payment verification failed:", {
        userId,
        error: verificationResult.error,
      });

      return {
        success: false,
        error: verificationResult.error,
      };
    }

    Logger.info("X402 payment verification successful", {
      userId,
      transactionSignature: verificationResult.details?.transactionSignature,
    });

    return {
      success: true,
      transactionSignature: verificationResult.details?.transactionSignature,
    };
  } catch (error) {
    Logger.error("Error in X402 verification for App Route:", {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error: "Internal server error during payment verification",
    };
  }
}
