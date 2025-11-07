import { NextRequest } from "next/server";
import { Logger } from "@/lib/logger";
import { paymentVerificationService } from "@/lib/payment-verification-service";

// Define the expected webhook payload structure
interface SolanaPaymentWebhookPayload {
  id: string;
  transaction: {
    signature: string;
    slot: number;
    blockTime: number;
    meta: {
      fee: number;
      preBalances: number[];
      postBalances: number[];
      err: unknown;
    };
  };
  result: string; // 'processed', 'confirmed', or 'finalized'
  userId: string;
  expectedAmount: number;
  token: "USDC" | "USDT" | "CASH";
  recipient: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: SolanaPaymentWebhookPayload = await request.json();

    Logger.info("Solana payment webhook received:", {
      signature: payload.transaction.signature,
      result: payload.result,
      slot: payload.transaction.slot,
      userId: payload.userId,
    });

    // Verify this is a valid transaction
    if (!payload.transaction.signature) {
      return Response.json(
        { error: "Invalid transaction signature" },
        { status: 400 }
      );
    }

    // Verify the payment using the enhanced payment verification service
    const verificationResult =
      await paymentVerificationService.verifyAndAddCredits(
        payload.userId,
        payload.transaction.signature,
        payload.expectedAmount,
        payload.expectedAmount, // Using expectedAmount as USD amount for now
        payload.token,
        payload.recipient
      );

    if (!verificationResult.success) {
      Logger.error("Payment verification failed in webhook:", {
        signature: payload.transaction.signature,
        userId: payload.userId,
        error: verificationResult.error,
      });
      return Response.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // If the transaction is confirmed and successful, process the payment
    if (payload.result === "confirmed" || payload.result === "finalized") {
      Logger.info("Payment successfully verified and credits added:", {
        userId: payload.userId,
        transactionSignature: payload.transaction.signature,
        creditsAdded: verificationResult.creditsAdded,
      });

      // Send notification to user about successful payment
      await sendPaymentConfirmationNotification(
        payload.userId,
        payload.transaction.signature,
        verificationResult.creditsAdded || 0
      );
    }

    return Response.json({
      success: true,
      creditsAdded: verificationResult.creditsAdded,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    Logger.error("Error processing Solana payment webhook:", {
      error: errorMessage,
    });
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Helper function to send payment confirmation notification
async function sendPaymentConfirmationNotification(
  userId: string,
  transactionId: string,
  creditsAdded: number
) {
  // In a real implementation, this would send a notification to the user
  // via email, push notification, or WebSocket
  try {
    Logger.info("Payment confirmation notification sent:", {
      userId,
      transactionId,
      creditsAdded,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    Logger.error("Error sending payment confirmation notification:", {
      error: errorMessage,
      userId,
      transactionId,
    });
  }
}
