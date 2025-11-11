// X402 Payment Utilities for Ainterview
import { addUserCredits, updatePaymentRecordStatus } from "@/lib/database";
import { solanaPaymentService } from "@/lib/solana-payment-service";
import { Logger } from "@/lib/logger";
import { paymentVerificationService } from "@/lib/payment-verification-service";
import { x402VerificationService } from "@/lib/x402-verification-service";

// Function to process a completed payment and add credits to user account
export async function processCompletedX402Payment(
  userId: string,
  transactionId: string,
  expectedAmount: number,
  usdAmount: number,
  token: "USDC" | "USDT" | "CASH" = "USDC"
): Promise<{ success: boolean; error?: string; creditsAdded?: number }> {
  try {
    Logger.info("Starting processCompletedX402Payment", {
      userId,
      transactionId,
      expectedAmount,
      usdAmount,
      token,
    });
    // Verify the payment using the enhanced payment verification service
    // This performs both Solana RPC verification and Solscan API verification
    const verificationResult =
      await paymentVerificationService.verifyAndAddCredits(
        userId,
        transactionId,
        expectedAmount,
        usdAmount,
        token,
        process.env.NEXT_PUBLIC_PAYMENT_WALLET || "YOUR_WALLET_ADDRESS"
      );

    Logger.info("Payment verification service result:", {
      userId,
      transactionId,
      success: verificationResult.success,
      error: verificationResult.error,
      creditsAdded: verificationResult.creditsAdded,
    });

    if (!verificationResult.success) {
      return {
        success: false,
        error: verificationResult.error || "Payment verification failed",
      };
    }

    // Update the payment record status to confirmed
    try {
      const recordUpdated = await updatePaymentRecordStatus(
        transactionId,
        "confirmed"
      );
      if (!recordUpdated) {
        Logger.warn("Failed to update payment record status to confirmed", {
          userId,
          transactionId,
        });
      }
    } catch (error) {
      Logger.error("Error updating payment record status:", {
        error: error instanceof Error ? error.message : String(error),
        userId,
        transactionId,
      });
    }

    Logger.info("Successfully processed x402 payment and added credits", {
      userId,
      transactionId,
      usdAmount,
      creditsAdded: verificationResult.creditsAdded, // Actual credits added
    });

    return {
      success: true,
      creditsAdded: verificationResult.creditsAdded, // Return actual credits added
    };
  } catch (error) {
    // Update the payment record status to failed
    try {
      const recordUpdated = await updatePaymentRecordStatus(
        transactionId,
        "failed"
      );
      if (!recordUpdated) {
        Logger.warn("Failed to update payment record status to failed", {
          userId,
          transactionId,
        });
      }
    } catch (updateError) {
      Logger.error("Error updating payment record status to failed:", {
        error:
          updateError instanceof Error
            ? updateError.message
            : String(updateError),
        userId,
        transactionId,
      });
    }

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
  Logger.info("Starting payment signature validation", {
    userId,
    expectedAmount,
    usdAmount,
    token,
  });

  if (!paymentSignature) {
    Logger.warn("No payment signature provided", { userId });
    return { valid: false, error: "No payment signature provided" };
  }

  try {
    // First, check if the paymentSignature is actually an X-PAYMENT header containing the serialized transaction
    // If it looks like a base64 encoded header, it contains the actual transaction data
    if (paymentSignature.length > 100) {
      // Likely a base64 encoded X-PAYMENT header
      try {
        // Decode the X-PAYMENT header to get the payment requirements
        const decoded = atob(paymentSignature);
        const paymentPayload = JSON.parse(decoded);

        // Get the actual transaction from the payload
        const serializedTransaction =
          paymentPayload?.payload?.serializedTransaction;

        if (serializedTransaction) {
          // Use the new two-phase verification service for this case
          // First, we need to define the payment requirements that were expected
          const paymentRequirements = {
            scheme: "exact",
            network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || "solana",
            maxAmountRequired: (usdAmount * 1000000).toString(), // Convert to atomic units (assuming 6 decimals for USDC)
            payTo:
              process.env.NEXT_PUBLIC_PAYMENT_WALLET || "YOUR_WALLET_ADDRESS",
            asset:
              token === "USDC"
                ? "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // Mainnet USDC
                : token === "USDT"
                ? "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" // Mainnet USDT
                : "CASHXWvxwjmrRdjMGJtD4K58z9mJYwg4x4Qq5NmN7cdL", // Placeholder
            description: "Payment verification for user credits",
            mimeType: "application/json",
            maxTimeoutSeconds: 300, // 5 minutes
            extra: {
              memo: `Payment verification for user: ${userId}`,
              usdAmount: usdAmount,
            },
          };

          // Use the two-phase verification service
          const verificationResult =
            await x402VerificationService.verifyAndSettlePayment(
              paymentSignature,
              paymentRequirements,
              userId,
              usdAmount,
              token
            );

          if (verificationResult.success) {
            // Update the payment record status to confirmed
            try {
              const recordUpdated = await updatePaymentRecordStatus(
                paymentSignature, // Using the original signature as transaction ID
                "confirmed"
              );

              if (!recordUpdated) {
                Logger.info(
                  "No payment record found with transaction signature, attempting to find and update pending record by user",
                  {
                    userId,
                    transactionId: paymentSignature,
                  }
                );

                try {
                  const {
                    getPendingPaymentRecordsByUser,
                    updatePaymentRecordTransactionId,
                  } = await import("@/lib/database");

                  // Find pending payment records for this user
                  const pendingRecords = await getPendingPaymentRecordsByUser(
                    userId
                  );

                  if (pendingRecords.length > 0) {
                    // Update the most recent pending record with the actual transaction ID
                    const mostRecentRecord = pendingRecords[0];

                    const updateResult = await updatePaymentRecordTransactionId(
                      mostRecentRecord.transaction_id,
                      paymentSignature
                    );

                    if (updateResult) {
                      Logger.info(
                        "Successfully updated payment record with actual transaction ID",
                        {
                          userId,
                          oldTransactionId: mostRecentRecord.transaction_id,
                          newTransactionId: paymentSignature,
                        }
                      );

                      // Now update the status to confirmed
                      const statusUpdateResult =
                        await updatePaymentRecordStatus(
                          paymentSignature,
                          "confirmed"
                        );

                      if (!statusUpdateResult) {
                        Logger.warn(
                          "Failed to update status after transaction ID update",
                          {
                            userId,
                            transactionId: paymentSignature,
                          }
                        );
                      }
                    } else {
                      Logger.error(
                        "Failed to update payment record transaction ID",
                        {
                          userId,
                          oldTransactionId: mostRecentRecord.transaction_id,
                          newTransactionId: paymentSignature,
                        }
                      );
                    }
                  } else {
                    Logger.warn("No pending payment records found for user", {
                      userId,
                      transactionId: paymentSignature,
                    });

                    // If no pending records found, create a new record with the actual transaction ID
                    const { createPaymentRecord } = await import(
                      "@/lib/database"
                    );
                    await createPaymentRecord({
                      user_id: userId,
                      transaction_id: paymentSignature,
                      expected_amount: usdAmount, // Use actual USD amount
                      token: token,
                      recipient:
                        process.env.NEXT_PUBLIC_PAYMENT_WALLET ||
                        "YOUR_WALLET_ADDRESS",
                    });
                  }
                } catch (lookupError) {
                  Logger.error(
                    "Error looking up or updating pending payment record:",
                    {
                      error:
                        lookupError instanceof Error
                          ? lookupError.message
                          : String(lookupError),
                      userId,
                      transactionId: paymentSignature,
                    }
                  );

                  // Fallback: create a new record with the actual transaction ID
                  try {
                    const { createPaymentRecord } = await import(
                      "@/lib/database"
                    );
                    await createPaymentRecord({
                      user_id: userId,
                      transaction_id: paymentSignature,
                      expected_amount: usdAmount, // Use actual USD amount
                      token: token,
                      recipient:
                        process.env.NEXT_PUBLIC_PAYMENT_WALLET ||
                        "YOUR_WALLET_ADDRESS",
                    });
                  } catch (createError) {
                    Logger.error(
                      "Error creating payment record with actual transaction ID:",
                      {
                        error:
                          createError instanceof Error
                            ? createError.message
                            : String(createError),
                        userId,
                        transactionId: paymentSignature,
                      }
                    );
                  }
                }
              } else {
                Logger.info(
                  "Successfully updated payment record status to confirmed",
                  {
                    userId,
                    transactionId: paymentSignature,
                  }
                );
              }
            } catch (error) {
              Logger.error("Error updating payment record status:", {
                error: error instanceof Error ? error.message : String(error),
                userId,
                transactionId: paymentSignature,
              });
            }

            return {
              valid: true,
              transactionId: paymentSignature,
            };
          } else {
            // Verification failed
            Logger.error("Payment verification failed:", {
              userId,
              error: verificationResult.error,
            });

            // Update the payment record status to failed
            try {
              const recordUpdated = await updatePaymentRecordStatus(
                paymentSignature,
                "failed"
              );

              if (!recordUpdated) {
                Logger.info(
                  "No payment record found with transaction signature for failure, attempting to find and update pending record by user",
                  {
                    userId,
                    transactionId: paymentSignature,
                  }
                );

                try {
                  const {
                    getPendingPaymentRecordsByUser,
                    updatePaymentRecordTransactionId,
                  } = await import("@/lib/database");

                  // Find pending payment records for this user
                  const pendingRecords = await getPendingPaymentRecordsByUser(
                    userId
                  );

                  if (pendingRecords.length > 0) {
                    // Update the most recent pending record with the actual transaction ID
                    const mostRecentRecord = pendingRecords[0];

                    const updateResult = await updatePaymentRecordTransactionId(
                      mostRecentRecord.transaction_id,
                      paymentSignature
                    );

                    if (updateResult) {
                      Logger.info(
                        "Successfully updated failed payment record with actual transaction ID",
                        {
                          userId,
                          oldTransactionId: mostRecentRecord.transaction_id,
                          newTransactionId: paymentSignature,
                        }
                      );

                      // Now update the status to failed
                      const statusUpdateResult =
                        await updatePaymentRecordStatus(
                          paymentSignature,
                          "failed"
                        );

                      if (!statusUpdateResult) {
                        Logger.warn(
                          "Failed to update status after transaction ID update",
                          {
                            userId,
                            transactionId: paymentSignature,
                          }
                        );
                      }
                    } else {
                      Logger.error(
                        "Failed to update failed payment record transaction ID",
                        {
                          userId,
                          oldTransactionId: mostRecentRecord.transaction_id,
                          newTransactionId: paymentSignature,
                        }
                      );
                    }
                  } else {
                    Logger.warn(
                      "No pending payment records found for user during failure",
                      {
                        userId,
                        transactionId: paymentSignature,
                      }
                    );

                    // If no pending records found, create a new record with the actual transaction ID
                    const { createPaymentRecord } = await import(
                      "@/lib/database"
                    );
                    await createPaymentRecord({
                      user_id: userId,
                      transaction_id: paymentSignature,
                      expected_amount: usdAmount, // Use actual USD amount
                      token: token,
                      recipient:
                        process.env.NEXT_PUBLIC_PAYMENT_WALLET ||
                        "YOUR_WALLET_ADDRESS",
                    });
                  }
                } catch (lookupError) {
                  Logger.error(
                    "Error looking up or updating pending payment record during failure:",
                    {
                      error:
                        lookupError instanceof Error
                          ? lookupError.message
                          : String(lookupError),
                      userId,
                      transactionId: paymentSignature,
                    }
                  );

                  // Fallback: create a new record with the actual transaction ID
                  try {
                    const { createPaymentRecord } = await import(
                      "@/lib/database"
                    );
                    await createPaymentRecord({
                      user_id: userId,
                      transaction_id: paymentSignature,
                      expected_amount: usdAmount, // Use actual USD amount
                      token: token,
                      recipient:
                        process.env.NEXT_PUBLIC_PAYMENT_WALLET ||
                        "YOUR_WALLET_ADDRESS",
                    });
                  } catch (createError) {
                    Logger.error(
                      "Error creating failed payment record with actual transaction ID:",
                      {
                        error:
                          createError instanceof Error
                            ? createError.message
                            : String(createError),
                        userId,
                        transactionId: paymentSignature,
                      }
                    );
                  }
                }
              } else {
                Logger.info(
                  "Successfully updated payment record status to failed",
                  {
                    userId,
                    transactionId: paymentSignature,
                  }
                );
              }
            } catch (error) {
              Logger.error("Error updating payment record status to failed:", {
                error: error instanceof Error ? error.message : String(error),
                userId,
                transactionId: paymentSignature,
              });
            }

            return {
              valid: false,
              error: verificationResult.error || "Payment verification failed",
            };
          }
        }
      } catch (decodeError) {
        // If decoding fails, fall back to the original verification method
        Logger.warn(
          "Failed to decode X-PAYMENT header, falling back to original method",
          {
            error:
              decodeError instanceof Error
                ? decodeError.message
                : String(decodeError),
          }
        );
      }
    }

    // Fallback to the original payment verification service
    // Verify the payment using the enhanced payment verification service
    // This performs both Solana RPC verification and Solscan API verification
    const verificationResult =
      await paymentVerificationService.verifyAndAddCredits(
        userId,
        paymentSignature,
        expectedAmount,
        usdAmount,
        token,
        process.env.NEXT_PUBLIC_PAYMENT_WALLET || "YOUR_WALLET_ADDRESS"
      );

    if (verificationResult.success) {
      // Update the payment record status to confirmed
      try {
        // First try to update by transaction signature
        const recordUpdated = await updatePaymentRecordStatus(
          paymentSignature,
          "confirmed"
        );

        if (!recordUpdated) {
          // If no record was found with the transaction signature,
          // this might be from the API route flow where we initially created
          // a payment record with a temporary ID. We need to find the pending
          // record and update its transaction ID.
          Logger.info(
            "No payment record found with transaction signature, attempting to find and update pending record by user",
            {
              userId,
              transactionId: paymentSignature,
            }
          );

          try {
            const {
              getPendingPaymentRecordsByUser,
              updatePaymentRecordTransactionId,
            } = await import("@/lib/database");

            // Find pending payment records for this user
            const pendingRecords = await getPendingPaymentRecordsByUser(userId);

            if (pendingRecords.length > 0) {
              // Update the most recent pending record with the actual transaction ID
              const mostRecentRecord = pendingRecords[0];

              const updateResult = await updatePaymentRecordTransactionId(
                mostRecentRecord.transaction_id,
                paymentSignature
              );

              if (updateResult) {
                Logger.info(
                  "Successfully updated payment record with actual transaction ID",
                  {
                    userId,
                    oldTransactionId: mostRecentRecord.transaction_id,
                    newTransactionId: paymentSignature,
                  }
                );

                // Now update the status to confirmed
                const statusUpdateResult = await updatePaymentRecordStatus(
                  paymentSignature,
                  "confirmed"
                );

                if (!statusUpdateResult) {
                  Logger.warn(
                    "Failed to update status after transaction ID update",
                    {
                      userId,
                      transactionId: paymentSignature,
                    }
                  );
                }
              } else {
                Logger.error("Failed to update payment record transaction ID", {
                  userId,
                  oldTransactionId: mostRecentRecord.transaction_id,
                  newTransactionId: paymentSignature,
                });
              }
            } else {
              Logger.warn("No pending payment records found for user", {
                userId,
                transactionId: paymentSignature,
              });

              // If no pending records found, create a new record with the actual transaction ID
              const { createPaymentRecord } = await import("@/lib/database");
              await createPaymentRecord({
                user_id: userId,
                transaction_id: paymentSignature,
                expected_amount: expectedAmount / 10, // Convert credits back to USD (divide by 10)
                token: token,
                recipient:
                  process.env.NEXT_PUBLIC_PAYMENT_WALLET ||
                  "YOUR_WALLET_ADDRESS",
              });
            }
          } catch (lookupError) {
            Logger.error(
              "Error looking up or updating pending payment record:",
              {
                error:
                  lookupError instanceof Error
                    ? lookupError.message
                    : String(lookupError),
                userId,
                transactionId: paymentSignature,
              }
            );

            // Fallback: create a new record with the actual transaction ID
            try {
              const { createPaymentRecord } = await import("@/lib/database");
              await createPaymentRecord({
                user_id: userId,
                transaction_id: paymentSignature,
                expected_amount: expectedAmount / 10, // Convert credits back to USD (divide by 10)
                token: token,
                recipient:
                  process.env.NEXT_PUBLIC_PAYMENT_WALLET ||
                  "YOUR_WALLET_ADDRESS",
              });
            } catch (createError) {
              Logger.error(
                "Error creating payment record with actual transaction ID:",
                {
                  error:
                    createError instanceof Error
                      ? createError.message
                      : String(createError),
                  userId,
                  transactionId: paymentSignature,
                }
              );
            }
          }
        } else {
          Logger.info(
            "Successfully updated payment record status to confirmed",
            {
              userId,
              transactionId: paymentSignature,
            }
          );
        }
      } catch (error) {
        Logger.error("Error updating payment record status:", {
          error: error instanceof Error ? error.message : String(error),
          userId,
          transactionId: paymentSignature,
        });
      }

      return {
        valid: true,
        transactionId: paymentSignature,
      };
    } else {
      // Update the payment record status to failed
      try {
        const recordUpdated = await updatePaymentRecordStatus(
          paymentSignature,
          "failed"
        );

        if (!recordUpdated) {
          // If no record was found with the transaction signature,
          // this might be from the API route flow where we initially created
          // a payment record with a temporary ID. We need to find the pending
          // record and update its transaction ID.
          Logger.info(
            "No payment record found with transaction signature for failure, attempting to find and update pending record by user",
            {
              userId,
              transactionId: paymentSignature,
            }
          );

          try {
            const {
              getPendingPaymentRecordsByUser,
              updatePaymentRecordTransactionId,
            } = await import("@/lib/database");

            // Find pending payment records for this user
            const pendingRecords = await getPendingPaymentRecordsByUser(userId);

            if (pendingRecords.length > 0) {
              // Update the most recent pending record with the actual transaction ID
              const mostRecentRecord = pendingRecords[0];

              const updateResult = await updatePaymentRecordTransactionId(
                mostRecentRecord.transaction_id,
                paymentSignature
              );

              if (updateResult) {
                Logger.info(
                  "Successfully updated failed payment record with actual transaction ID",
                  {
                    userId,
                    oldTransactionId: mostRecentRecord.transaction_id,
                    newTransactionId: paymentSignature,
                  }
                );

                // Now update the status to failed
                const statusUpdateResult = await updatePaymentRecordStatus(
                  paymentSignature,
                  "failed"
                );

                if (!statusUpdateResult) {
                  Logger.warn(
                    "Failed to update status after transaction ID update",
                    {
                      userId,
                      transactionId: paymentSignature,
                    }
                  );
                }
              } else {
                Logger.error(
                  "Failed to update failed payment record transaction ID",
                  {
                    userId,
                    oldTransactionId: mostRecentRecord.transaction_id,
                    newTransactionId: paymentSignature,
                  }
                );
              }
            } else {
              Logger.warn(
                "No pending payment records found for user during failure",
                {
                  userId,
                  transactionId: paymentSignature,
                }
              );

              // If no pending records found, create a new record with the actual transaction ID
              const { createPaymentRecord } = await import("@/lib/database");
              await createPaymentRecord({
                user_id: userId,
                transaction_id: paymentSignature,
                expected_amount: expectedAmount / 10, // Convert credits back to USD (divide by 10)
                token: token,
                recipient:
                  process.env.NEXT_PUBLIC_PAYMENT_WALLET ||
                  "YOUR_WALLET_ADDRESS",
              });
            }
          } catch (lookupError) {
            Logger.error(
              "Error looking up or updating pending payment record during failure:",
              {
                error:
                  lookupError instanceof Error
                    ? lookupError.message
                    : String(lookupError),
                userId,
                transactionId: paymentSignature,
              }
            );

            // Fallback: create a new record with the actual transaction ID
            try {
              const { createPaymentRecord } = await import("@/lib/database");
              await createPaymentRecord({
                user_id: userId,
                transaction_id: paymentSignature,
                expected_amount: expectedAmount / 10, // Convert credits back to USD (divide by 10)
                token: token,
                recipient:
                  process.env.NEXT_PUBLIC_PAYMENT_WALLET ||
                  "YOUR_WALLET_ADDRESS",
              });
            } catch (createError) {
              Logger.error(
                "Error creating failed payment record with actual transaction ID:",
                {
                  error:
                    createError instanceof Error
                      ? createError.message
                      : String(createError),
                  userId,
                  transactionId: paymentSignature,
                }
              );
            }
          }
        } else {
          Logger.info("Successfully updated payment record status to failed", {
            userId,
            transactionId: paymentSignature,
          });
        }
      } catch (error) {
        Logger.error("Error updating payment record status to failed:", {
          error: error instanceof Error ? error.message : String(error),
          userId,
          transactionId: paymentSignature,
        });
      }

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
}): { status: number; body: object; nonce: string } {
  // Generate unique nonce for replay attack prevention (as per x402 protocol)
  const nonce = crypto.randomUUID();

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
    nonce: nonce, // CRITICAL: Include nonce for replay attack prevention
    extra: {
      memo: paymentRequired.memo,
      usdAmount: paymentRequired.amount, // Include the original USD amount for reference
      nonce: nonce, // Also include in extra for compatibility
    },
  };

  return {
    status: 402,
    body: {
      x402Version: 1,
      accepts: [paymentRequirements],
      // Add comprehensive x402 metadata for better protocol compliance
      paymentMetadata: {
        protocol: "x402",
        version: "1.0",
        operation: "micropayment",
        service: "AI Interview Preparation",
        costPerCredit: 0.1, // $0.10 per credit
        supportedTokens: ["USDC", "USDT", "CASH"],
        blockchain: paymentRequired.chain,
        paymentUrl: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/payment`,
        termsUrl: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/terms`,
        privacyUrl: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/privacy`,
        supportEmail: "support@ainterview.com",
        merchantName: "Ainterview",
        merchantId: "ainterview-ai-service",
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
      },
      // Include detailed payment instructions for agents
      paymentInstructions: {
        step1: "Navigate to the payment URL provided",
        step2: "Connect your Solana wallet (Phantom recommended)",
        step3: "Select the desired token (USDC, USDT, or CASH)",
        step4: "Approve the transaction in your wallet",
        step5: "Credits will be added to your account automatically",
        note: "Transactions are verified on the Solana blockchain for security",
      },
    },
    nonce: nonce, // Return nonce separately for tracking
  };
}
