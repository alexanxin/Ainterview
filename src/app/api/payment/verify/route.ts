import { NextRequest, NextResponse } from "next/server";
import { X402PaymentService } from "@/lib/x402-payment-service";
import { Logger } from "@/lib/logger";
import { addUserCredits, recordUsage } from "@/lib/database";

// Helper functions to call the payment records API
async function getPaymentRecordByTransactionId(transactionId: string) {
  const response = await fetch(
    `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/api/payment/records?transaction_id=${encodeURIComponent(transactionId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch payment record: ${response.status}`);
  }

  return await response.json();
}

async function updatePaymentRecordStatus(
  transactionId: string,
  status: "confirmed" | "failed"
) {
  const response = await fetch(
    `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/api/payment/records?transaction_id=${encodeURIComponent(transactionId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update payment record: ${response.status}`);
  }

  return true;
}

async function getPendingPaymentRecordsByUser(
  userId: string,
  minutesBack: number = 10
): Promise<Array<{ transaction_id: string }>> {
  // This is a bit tricky to implement via API, so we'll use a different approach
  // For now, we'll return an empty array since the main flow should work with existing records
  Logger.warn(
    "getPendingPaymentRecordsByUser called in API route - this should be handled differently"
  );
  return [];
}

async function updatePaymentRecordTransactionId(
  tempTransactionId: string,
  actualTransactionId: string
) {
  // This is complex to implement via API, so we'll skip for now
  Logger.warn(
    "updatePaymentRecordTransactionId called in API route - this should be handled differently"
  );
  return false;
}

async function createPaymentRecord(paymentData: {
  user_id: string;
  transaction_id: string;
  expected_amount: number;
  token: string;
  recipient: string;
}) {
  const response = await fetch(
    `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/api/payment/records`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: paymentData.user_id,
        transaction_id: paymentData.transaction_id,
        expected_amount: paymentData.expected_amount,
        token: paymentData.token,
        recipient: paymentData.recipient,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create payment record: ${response.status}`);
  }

  return await response.json();
}

export async function POST(req: NextRequest) {
  try {
    const { transactionId, expectedAmount, expectedToken, userId } =
      await req.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    Logger.info("Payment verification request received", {
      transactionId,
      expectedAmount,
      expectedToken,
      userId,
    });

    const x402Service = X402PaymentService.getInstance();

    // Verify the payment using the server-side service
    const result = await x402Service.verifySolanaPayment(
      transactionId,
      userId,
      expectedAmount,
      expectedToken
    );

    Logger.info("Payment verification completed", {
      transactionId,
      success: result.success,
      creditsAdded: result.creditsAdded,
      error: result.error,
    });

    // If verification was successful, update the payment record and add credits
    if (result.success && result.creditsAdded && result.creditsAdded > 0) {
      Logger.info("Starting database update process", {
        transactionId,
        creditsToAdd: result.creditsAdded,
        userId,
      });

      try {
        // First, try to find an existing payment record with this transaction ID
        const existingRecord = await getPaymentRecordByTransactionId(
          transactionId
        );

        Logger.info("Payment record lookup result", {
          transactionId,
          existingRecordFound: !!existingRecord,
          existingRecordUserId: existingRecord?.user_id,
          existingRecordStatus: existingRecord?.status,
        });

        if (existingRecord) {
          // Update the existing record status to confirmed FIRST
          Logger.info("Updating existing payment record status to confirmed", {
            transactionId,
            currentStatus: existingRecord.status,
          });

          const statusUpdated = await updatePaymentRecordStatus(
            transactionId,
            "confirmed"
          );
          if (statusUpdated) {
            Logger.info("Updated existing payment record status to confirmed", {
              transactionId,
              userId: existingRecord.user_id,
            });
          } else {
            Logger.warn("Failed to update existing payment record status", {
              transactionId,
            });
          }

          // Add credits to the user AFTER payment record is confirmed
          if (result.creditsAdded && result.creditsAdded > 0) {
            Logger.info("Attempting to add credits to user", {
              userId: existingRecord.user_id,
              creditsToAdd: result.creditsAdded,
            });

            const creditsAdded = await addUserCredits(
              existingRecord.user_id,
              result.creditsAdded
            );

            Logger.info("addUserCredits result", {
              userId: existingRecord.user_id,
              creditsToAdd: result.creditsAdded,
              creditsAdded: creditsAdded,
            });

            if (creditsAdded) {
              Logger.info("Successfully added credits to user", {
                userId: existingRecord.user_id,
                creditsAdded: result.creditsAdded,
              });

              // Record usage for credit addition
              await recordUsage({
                user_id: existingRecord.user_id,
                action: "credit_purchase",
                cost: -result.creditsAdded, // Negative cost for credits added
                free_interview_used: false,
              });
            } else {
              Logger.error("Failed to add credits to user", {
                userId: existingRecord.user_id,
                creditsAdded: result.creditsAdded,
              });
            }
          }
        } else {
          Logger.info(
            "No existing payment record found, checking for pending records",
            {
              transactionId,
              userId,
            }
          );

          // No existing record found, check for pending records if userId is provided
          if (userId) {
            const pendingRecords = await getPendingPaymentRecordsByUser(userId);

            Logger.info("Pending records lookup result", {
              userId,
              pendingRecordsCount: pendingRecords.length,
              pendingRecords: pendingRecords.map((r) => ({
                id: r.transaction_id,
              })),
            });

            if (pendingRecords.length > 0) {
              // Update the most recent pending record with the actual transaction ID
              const mostRecentRecord = pendingRecords[0];

              Logger.info(
                "Attempting to update pending record transaction ID",
                {
                  userId,
                  oldTransactionId: mostRecentRecord.transaction_id,
                  newTransactionId: transactionId,
                }
              );

              const updateResult = await updatePaymentRecordTransactionId(
                mostRecentRecord.transaction_id,
                transactionId
              );

              Logger.info("Transaction ID update result", {
                userId,
                oldTransactionId: mostRecentRecord.transaction_id,
                newTransactionId: transactionId,
                updateResult,
              });

              if (updateResult) {
                Logger.info(
                  "Successfully updated pending payment record with actual transaction ID",
                  {
                    userId,
                    oldTransactionId: mostRecentRecord.transaction_id,
                    newTransactionId: transactionId,
                  }
                );

                // Now update the status to confirmed
                Logger.info(
                  "Updating status to confirmed after transaction ID update",
                  {
                    userId,
                    transactionId,
                  }
                );

                const statusUpdateResult = await updatePaymentRecordStatus(
                  transactionId,
                  "confirmed"
                );

                Logger.info(
                  "Status update result after transaction ID update",
                  {
                    userId,
                    transactionId,
                    statusUpdateResult,
                  }
                );

                if (statusUpdateResult) {
                  Logger.info(
                    "Successfully updated payment record status to confirmed",
                    {
                      userId,
                      transactionId,
                    }
                  );
                } else {
                  Logger.warn(
                    "Failed to update status after transaction ID update",
                    {
                      userId,
                      transactionId,
                    }
                  );
                }

                // Add credits to the user AFTER payment record is confirmed
                if (result.creditsAdded && result.creditsAdded > 0) {
                  Logger.info("Adding credits to user from pending record", {
                    userId,
                    creditsToAdd: result.creditsAdded,
                  });

                  const creditsAdded = await addUserCredits(
                    userId,
                    result.creditsAdded
                  );

                  Logger.info("Credits addition result from pending record", {
                    userId,
                    creditsToAdd: result.creditsAdded,
                    creditsAdded,
                  });

                  if (creditsAdded) {
                    Logger.info(
                      "Successfully added credits to user from pending record",
                      {
                        userId,
                        creditsAdded: result.creditsAdded,
                      }
                    );

                    // Record usage for credit addition
                    await recordUsage({
                      user_id: userId,
                      action: "credit_purchase",
                      cost: -result.creditsAdded, // Negative cost for credits added
                      free_interview_used: false,
                    });
                  } else {
                    Logger.error(
                      "Failed to add credits to user from pending record",
                      {
                        userId,
                        creditsAdded: result.creditsAdded,
                      }
                    );
                  }
                }
              } else {
                Logger.error(
                  "Failed to update pending payment record transaction ID",
                  {
                    userId,
                    oldTransactionId: mostRecentRecord.transaction_id,
                    newTransactionId: transactionId,
                  }
                );
              }
            } else {
              Logger.info(
                "No pending records found, creating new confirmed record",
                {
                  userId,
                  transactionId,
                  expectedAmount,
                  expectedToken,
                }
              );

              // No pending records found, create a new confirmed record
              Logger.info(
                "No pending payment records found, creating new confirmed record",
                {
                  userId,
                  transactionId,
                }
              );

              const usdAmount = expectedAmount || 0.5; // Default to $0.5 if not provided
              const creditsToAdd = Math.round(usdAmount * 10); // Convert USD to credits (1 USD = 10 credits)

              Logger.info("Creating new payment record", {
                userId,
                transactionId,
                usdAmount,
                creditsToAdd,
                expectedToken,
              });

              const newRecord = await createPaymentRecord({
                user_id: userId,
                transaction_id: transactionId,
                expected_amount: usdAmount,
                token: expectedToken || "USDC",
                recipient:
                  process.env.NEXT_PUBLIC_PAYMENT_WALLET ||
                  "YOUR_WALLET_ADDRESS",
              });

              Logger.info("New payment record creation result", {
                userId,
                transactionId,
                newRecordCreated: !!newRecord,
                newRecordId: newRecord?.id,
              });

              if (newRecord) {
                // Update status to confirmed
                Logger.info("Updating new record status to confirmed", {
                  userId,
                  transactionId,
                });

                const statusUpdated = await updatePaymentRecordStatus(
                  transactionId,
                  "confirmed"
                );

                Logger.info("New record status update result", {
                  userId,
                  transactionId,
                  statusUpdated,
                });

                if (statusUpdated) {
                  Logger.info("Created and confirmed new payment record", {
                    userId,
                    transactionId,
                  });
                }

                // Add credits to the user AFTER payment record is confirmed
                Logger.info("Adding credits for new record", {
                  userId,
                  creditsToAdd,
                });

                const creditsAdded = await addUserCredits(userId, creditsToAdd);

                Logger.info("Credits addition result for new record", {
                  userId,
                  creditsToAdd,
                  creditsAdded,
                });

                if (creditsAdded) {
                  Logger.info(
                    "Successfully added credits to user for new record",
                    {
                      userId,
                      creditsAdded,
                    }
                  );

                  // Record usage for credit addition
                  await recordUsage({
                    user_id: userId,
                    action: "credit_purchase",
                    cost: -creditsToAdd, // Negative cost for credits added
                    free_interview_used: false,
                  });
                } else {
                  Logger.error("Failed to add credits to user for new record", {
                    userId,
                    creditsAdded,
                  });
                }
              } else {
                Logger.error("Failed to create new payment record", {
                  userId,
                  transactionId,
                });
              }
            }
          } else {
            Logger.warn(
              "Payment verification successful but no userId provided and no existing record found",
              {
                transactionId,
              }
            );
          }
        }
      } catch (dbError) {
        Logger.error("Error updating payment record or adding credits:", {
          error: dbError instanceof Error ? dbError.message : String(dbError),
          transactionId,
          userId,
        });
        // Set success to false if database operations fail
        result.success = false;
        result.error = "Database update failed";
      }
    } else {
      Logger.info(
        "Payment verification failed, attempting to update record status to failed",
        {
          transactionId,
          verificationError: result.error,
        }
      );

      // Payment verification failed, update record status to failed if it exists
      try {
        const statusUpdated = await updatePaymentRecordStatus(
          transactionId,
          "failed"
        );
        if (statusUpdated) {
          Logger.info("Updated payment record status to failed", {
            transactionId,
          });
        } else {
          Logger.warn("Failed to update payment record status to failed", {
            transactionId,
          });
        }
      } catch (dbError) {
        Logger.error("Error updating payment record status to failed:", {
          error: dbError instanceof Error ? dbError.message : String(dbError),
          transactionId,
        });
      }
      // Ensure result reflects failure
      result.success = false;
      result.error = result.error || "Payment verification failed";

      Logger.info("Final result for failed payment verification", {
        transactionId,
        success: result.success,
        error: result.error,
      });
    }

    Logger.info("Returning final result from payment verification API", {
      transactionId,
      success: result.success,
      creditsAdded: result.creditsAdded,
      error: result.error,
    });

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error("Error in payment verification:", { error: errorMessage });

    return NextResponse.json(
      { success: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
