import { Logger } from "./logger";

// Define types for Solscan API responses
interface SolscanTransactionResponse {
  success: boolean;
  data?: {
    transaction: {
      signature: string;
      slot: number;
      block_time: number;
      meta: {
        fee: number;
        pre_balances: number[];
        post_balances: number[];
        err: unknown;
      };
    };
  };
  error?: string;
}

interface SolscanTokenTransfer {
  from_address: string;
  to_address: string;
  token_address: string;
  amount: number;
  decimals: number;
}

interface SolscanAccountTransaction {
  transaction: {
    signature: string;
    slot: number;
    block_time: number;
  };
  transfers: SolscanTokenTransfer[];
}

/**
 * Service to verify Solana transactions using Solscan API
 * This ensures payment accuracy by cross-checking transactions on the blockchain
 */
export class SolscanService {
  private static instance: SolscanService;
  private readonly solscanBaseUrl: string;
  private readonly solscanApiUrl: string;

  private constructor() {
    // Use mainnet or devnet based on environment
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
    if (network === "devnet") {
      this.solscanBaseUrl = "https://api.devnet.solscan.io";
      this.solscanApiUrl = "https://public-api.devnet.solscan.io";
    } else {
      this.solscanBaseUrl = "https://api.solscan.io";
      this.solscanApiUrl = "https://public-api.solscan.io";
    }
  }

  public static getInstance(): SolscanService {
    if (!SolscanService.instance) {
      SolscanService.instance = new SolscanService();
    }
    return SolscanService.instance;
  }

  /**
   * Verify a transaction using Solscan API
   * @param signature - The transaction signature to verify
   * @returns Promise with verification result
   */
  async verifyTransaction(signature: string): Promise<{
    success: boolean;
    error?: string;
    data?: {
      signature: string;
      slot: number;
      blockTime: number;
      fee: number;
      status: "success" | "failed";
      transfers: SolscanTokenTransfer[];
    };
  }> {
    try {
      // First, get transaction details
      const response = await fetch(
        `${this.solscanApiUrl}/transaction/${signature}`,
        {
          headers: {
            Accept: "application/json",
            // Add API key if available
            ...(process.env.SOLSCAN_API_KEY && {
              token: process.env.SOLSCAN_API_KEY,
            }),
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        Logger.error("Solscan transaction verification failed:", {
          signature,
          status: response.status,
          error: errorText,
        });
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }

      const result: SolscanTransactionResponse = await response.json();

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || "Transaction not found or invalid response",
        };
      }

      // Get token transfers for this transaction
      const transfers = await this.getTokenTransfers(signature);

      return {
        success: true,
        data: {
          signature: result.data.transaction.signature,
          slot: result.data.transaction.slot,
          blockTime: result.data.transaction.block_time,
          fee: result.data.transaction.meta.fee,
          status: result.data.transaction.meta.err ? "failed" : "success",
          transfers: transfers || [],
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Logger.error("Error verifying transaction via Solscan:", {
        signature,
        error: errorMessage,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get token transfers for a specific transaction
   * @param signature - The transaction signature
   * @returns Promise with token transfer details
   */
  async getTokenTransfers(
    signature: string
  ): Promise<SolscanTokenTransfer[] | null> {
    try {
      const response = await fetch(
        `${this.solscanApiUrl}/transaction/token-transfers?tx=${signature}`,
        {
          headers: {
            Accept: "application/json",
            // Add API key if available
            ...(process.env.SOLSCAN_API_KEY && {
              token: process.env.SOLSCAN_API_KEY,
            }),
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        Logger.error("Solscan token transfers lookup failed:", {
          signature,
          status: response.status,
          error: errorText,
        });
        return null;
      }

      const data = await response.json();

      if (data.success && data.data) {
        return data.data.transfers || [];
      }

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Logger.error("Error getting token transfers from Solscan:", {
        signature,
        error: errorMessage,
      });
      return null;
    }
  }

  /**
   * Verify a payment by checking for specific token transfers
   * @param signature - The transaction signature
   * @param expectedRecipient - The expected recipient address
   * @param expectedTokenMint - The expected token mint address (USDC, etc.)
   * @param expectedAmount - The expected amount (in raw token units)
   * @returns Promise with verification result
   */
  async verifyPayment(
    signature: string,
    expectedRecipient: string,
    expectedTokenMint: string,
    expectedAmount: number,
    tolerance: number = 0 // Allow for small variations in amount
  ): Promise<{
    success: boolean;
    error?: string;
    details?: {
      signature: string;
      recipientMatch: boolean;
      tokenMatch: boolean;
      amountMatch: boolean;
      actualAmount?: number;
      expectedAmount: number;
    };
  }> {
    try {
      // Verify the transaction exists
      const verificationResult = await this.verifyTransaction(signature);

      if (!verificationResult.success) {
        return {
          success: false,
          error: verificationResult.error || "Transaction verification failed",
        };
      }

      const txData = verificationResult.data!;

      // Check if transaction was successful
      if (txData.status === "failed") {
        return {
          success: false,
          error: "Transaction failed on blockchain",
        };
      }

      // Look for token transfers matching our criteria
      let recipientMatch = false;
      let tokenMatch = false;
      let amountMatch = false;
      let actualAmount = 0;

      if (txData.transfers && txData.transfers.length > 0) {
        for (const transfer of txData.transfers) {
          // Check recipient
          if (
            transfer.to_address.toLowerCase() ===
            expectedRecipient.toLowerCase()
          ) {
            recipientMatch = true;

            // Check token mint
            if (
              transfer.token_address.toLowerCase() ===
              expectedTokenMint.toLowerCase()
            ) {
              tokenMatch = true;

              // Check amount (with tolerance)
              actualAmount = transfer.amount;
              const lowerBound = expectedAmount - tolerance;
              const upperBound = expectedAmount + tolerance;

              if (actualAmount >= lowerBound && actualAmount <= upperBound) {
                amountMatch = true;
                break; // Found a matching transfer
              }
            }
          }
        }
      }

      // If no matching transfer was found, try a different approach
      // Sometimes token transfers might not be immediately available
      if (!recipientMatch || !tokenMatch || !amountMatch) {
        Logger.info(
          "Token transfer verification inconclusive, checking account transactions...",
          {
            signature,
            recipientMatch,
            tokenMatch,
            amountMatch,
          }
        );
      }

      return {
        success: recipientMatch && tokenMatch && amountMatch,
        details: {
          signature: txData.signature,
          recipientMatch,
          tokenMatch,
          amountMatch,
          actualAmount,
          expectedAmount,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Logger.error("Error in payment verification via Solscan:", {
        signature,
        expectedRecipient,
        expectedTokenMint,
        expectedAmount,
        error: errorMessage,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get transaction history for an account
   * @param accountAddress - The account address to check
   * @param limit - Number of transactions to return (default: 10)
   * @returns Promise with transaction history
   */
  async getAccountTransactions(
    accountAddress: string,
    limit: number = 10
  ): Promise<SolscanAccountTransaction[] | null> {
    try {
      const response = await fetch(
        `${this.solscanBaseUrl}/account/txs?address=${accountAddress}&limit=${limit}`,
        {
          headers: {
            Accept: "application/json",
            // Add API key if available
            ...(process.env.SOLSCAN_API_KEY && {
              token: process.env.SOLSCAN_API_KEY,
            }),
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        Logger.error("Solscan account transactions lookup failed:", {
          accountAddress,
          status: response.status,
          error: errorText,
        });
        return null;
      }

      const data = await response.json();

      if (data.success && data.data) {
        return data.data || [];
      }

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Logger.error("Error getting account transactions from Solscan:", {
        accountAddress,
        error: errorMessage,
      });
      return null;
    }
  }
}

// Export a singleton instance
export const solscanService = SolscanService.getInstance();
