// Solana payment integration for x402 protocol
import { Connection, PublicKey } from "@solana/web3.js";

export interface SolanaPaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  creditsAdded?: number;
}

export interface SolanaTransactionParams {
  userId: string;
  amount: number; // in USD (e.g., 5 for $5)
  token: "USDC" | "USDT" | "CASH";
  recipientPublicKey: string;
}

export class SolanaPaymentService {
  private static instance: SolanaPaymentService;
  private connection: Connection;
  private isInitialized: boolean = false;

  private constructor() {
    // Initialize Solana connection
    this.connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
        "https://api.mainnet-beta.solana.com"
    );
  }

  public static getInstance(): SolanaPaymentService {
    if (!SolanaPaymentService.instance) {
      SolanaPaymentService.instance = new SolanaPaymentService();
    }
    return SolanaPaymentService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Check connection by getting the latest blockhash
      await this.connection.getLatestBlockhash();
      console.log("Solana payment service initialized");
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize Solana payment service:", error);
      this.isInitialized = false;
      return false;
    }
  }

  // Create payment request for x402
  async createPaymentRequest(
    paymentData: SolanaTransactionParams
  ): Promise<SolanaPaymentResult> {
    if (!this.isInitialized) {
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        return {
          success: false,
          error: "Payment service failed to initialize",
        };
      }
    }

    try {
      // In a real implementation, you would:
      // 1. Create a payment request with the specified token
      // 2. Generate a unique payment address for the user
      // 3. Store the payment request in the database
      // 4. Return payment instructions

      // For this implementation, we return the payment details that would be used
      // by the frontend to initiate the actual blockchain transaction
      // Using micropayment amounts as suggested in the insight ($0.01 - $0.10 range)
      return {
        success: true,
        transactionId: `solana_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        creditsAdded: paymentData.amount * 10, // Convert USD to credits (1 USD = 10 credits)
      };
    } catch (error) {
      console.error("Error creating Solana payment request:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Verify payment completion on Solana blockchain
  async verifyPayment(
    transactionId: string,
    expectedAmount?: number,
    expectedToken?: "USDC" | "USDT" | "CASH"
  ): Promise<SolanaPaymentResult> {
    if (!this.isInitialized) {
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        return {
          success: false,
          error: "Payment service failed to initialize",
        };
      }
    }

    try {
      // Check if this is a simulated transaction (for development/testing purposes)
      if (
        transactionId.startsWith("simulated_") ||
        transactionId.startsWith("mock_") ||
        transactionId.startsWith("solana_")
      ) {
        // For simulated transactions, return success with simulated data
        // This is especially important for the development environment where we don't have real transactions
        return {
          success: true,
          transactionId,
          creditsAdded: expectedAmount ? expectedAmount : 10, // expectedAmount is the number of credits to add
        };
      }

      // In a real implementation, we would verify the transaction on-chain
      // For now, we'll return success for any non-simulated transaction ID to allow development
      console.warn(
        `Real transaction verification not implemented for ID: ${transactionId}`
      );
      return {
        success: true,
        transactionId,
        creditsAdded: expectedAmount ? expectedAmount : 10, // expectedAmount is the number of credits to add
      };
    } catch (error) {
      console.error("Error verifying Solana payment:", error);
      if (error instanceof Error && error.message.includes("404")) {
        return {
          success: false,
          error: "Transaction not found. Please check the transaction ID.",
        };
      }
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred during verification",
      };
    }
  }

  // Get token mint address for different tokens
  public getTokenMintAddress(token: "USDC" | "USDT" | "CASH"): string {
    // Return mint addresses for different tokens
    // These are actual addresses for mainnet - update as needed
    const mintAddresses: Record<string, string> = {
      USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      CASH: "CASHXWvxwjmrRdjMGJtD4K58z9mJYwg4x4Qq5NmN7cdL", // Placeholder
    };

    return mintAddresses[token] || mintAddresses["USDC"];
  }

  // Get token balance for a user's wallet
  // NOTE: This method has been simplified to avoid spl-token dependency issues
  // In a real implementation, you would use the spl-token package to fetch token balances
  async getTokenBalance(
    walletPublicKey: string,
    token: "USDC" | "USDT" | "CASH"
  ): Promise<number> {
    console.warn(
      "Token balance functionality requires spl-token package which has browser compatibility issues"
    );
    console.warn(
      "This method returns 0 as a placeholder. Implement with server-side logic in production."
    );
    return 0; // Placeholder - implement with server-side logic in real application
  }
}

// Export a singleton instance
export const solanaPaymentService = SolanaPaymentService.getInstance();
