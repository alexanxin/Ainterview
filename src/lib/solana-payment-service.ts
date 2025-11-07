// Solana payment integration for x402 protocol
import { Connection, PublicKey } from "@solana/web3.js";
import { Logger } from "./logger";

// Define a local interface for SignatureStatus based on Solana's expected structure
interface SignatureStatus {
  slot: number;
  confirmations: number | null;
  err: object | null;
  confirmationStatus?: "processed" | "confirmed" | "finalized";
}

export interface SolanaPaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  creditsAdded?: number;
  solanaEndpoint?: string; // Add solanaEndpoint to the interface
}

export interface SolanaTransactionParams {
  userId: string;
  amount: number; // in USD (e.g., 5 for $5)
  token: "USDC" | "PYUSD" | "CASH";
  recipientPublicKey: string;
}

export class SolanaPaymentService {
  private static instance: SolanaPaymentService;
  private connection: Connection;
  private isInitialized: boolean = false;

  private constructor() {
    // Initialize Solana connection
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
    const endpoint =
      network === "devnet"
        ? process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ||
          "https://devnet.helius-rpc.com/?api-key=d44985e5-048b-42ed-885f-e3f4ba38d5fc"
        : process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
          "https://api.mainnet-beta.solana.com";

    this.connection = new Connection(endpoint, "confirmed");
  }

  public static getInstance(): SolanaPaymentService {
    if (!SolanaPaymentService.instance) {
      SolanaPaymentService.instance = new SolanaPaymentService();
    }
    return SolanaPaymentService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      Logger.info("Initializing Solana payment service");
      // Check connection by getting the latest blockhash
      await this.connection.getLatestBlockhash();
      Logger.info("Solana payment service initialized successfully");
      this.isInitialized = true;
      return true;
    } catch (error) {
      Logger.error("Failed to initialize Solana payment service:", {
        error: error instanceof Error ? error.message : String(error),
      });
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

    Logger.info("Creating Solana payment request", {
      userId: paymentData.userId,
      amount: paymentData.amount,
      token: paymentData.token,
      recipientPublicKey: paymentData.recipientPublicKey,
    });

    try {
      // In a real implementation, you would:
      // 1. Create a payment request with the specified token
      // 2. Generate a unique payment address for the user
      // 3. Store the payment request in the database
      // 4. Return payment instructions

      // For this implementation, we return the payment details that would be used
      // by the frontend to initiate the actual blockchain transaction
      // Using micropayment amounts as suggested in the insight ($0.01 - $0.10 range)

      const transactionId = `solana_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const result = {
        success: true,
        transactionId,
        creditsAdded: paymentData.amount * 10, // Convert USD to credits (1 USD = 10 credits)
      };

      Logger.info("Solana payment request created successfully", {
        transactionId,
        creditsAdded: result.creditsAdded,
      });

      return result;
    } catch (error) {
      Logger.error("Error creating Solana payment request:", {
        error: error instanceof Error ? error.message : String(error),
        userId: paymentData.userId,
        amount: paymentData.amount,
      });
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

    Logger.info("Starting Solana payment verification", {
      transactionId,
      expectedAmount,
      expectedToken,
    });

    let endpoint: string = ""; // Initialize endpoint
    let statusEndpoint: string = ""; // Initialize statusEndpoint

    try {
      // Validate the transaction ID format (Solana transaction signatures are base58 encoded)
      // Base58 encoded signatures are typically 88-89 characters but can vary
      if (
        !transactionId ||
        typeof transactionId !== "string" ||
        transactionId.length < 40 || // Minimum reasonable length
        transactionId.length > 100 // Maximum reasonable length
      ) {
        Logger.warn("Invalid transaction ID format", {
          transactionId,
          length: transactionId ? transactionId.length : 0,
        });
        return {
          success: false,
          error: "Invalid transaction ID format",
        };
      }

      // Determine the correct endpoint based on network
      if (process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet") {
        endpoint =
          process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ||
          "https://api.devnet.solana.com";
        statusEndpoint = endpoint;
      } else {
        endpoint =
          process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
          "https://api.mainnet-beta.solana.com";
        statusEndpoint = endpoint;
      }

      // Implement polling for transaction confirmation
      const MAX_POLLING_ATTEMPTS = 10;
      const POLLING_INTERVAL_MS = 3000; // Poll every 3 seconds
      let attempts = 0;
      let transactionConfirmed = false;
      let signatureStatus: SignatureStatus | null = null; // Use the locally defined interface

      while (attempts < MAX_POLLING_ATTEMPTS && !transactionConfirmed) {
        Logger.info(
          `Polling for transaction confirmation (attempt ${
            attempts + 1
          }/${MAX_POLLING_ATTEMPTS})`,
          {
            transactionId,
            solanaEndpoint: statusEndpoint,
          }
        );

        const statusRpcRequest = {
          jsonrpc: "2.0",
          id: "get-signature-statuses",
          method: "getSignatureStatuses",
          params: [[transactionId]],
        };

        const statusResponse = await fetch(statusEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(statusRpcRequest),
        });

        if (!statusResponse.ok) {
          throw new Error(
            `Status RPC call failed: ${statusResponse.status} ${statusResponse.statusText}`
          );
        }

        const statusResult = await statusResponse.json();

        if (statusResult.error) {
          throw new Error(
            `Status RPC error: ${JSON.stringify(statusResult.error)}`
          );
        }

        if (statusResult.result?.value && statusResult.result.value) {
          // Access the first element of the array
          signatureStatus = statusResult.result.value[0]; // Access the first element of the array
          if (signatureStatus) {
            // Add null check for signatureStatus
            if (
              signatureStatus.confirmationStatus === "confirmed" ||
              signatureStatus.confirmationStatus === "finalized"
            ) {
              transactionConfirmed = true;
              Logger.info("Transaction confirmed via polling", {
                transactionId,
                confirmationStatus: signatureStatus.confirmationStatus,
                slot: signatureStatus.slot,
                solanaEndpoint: statusEndpoint,
              });
            } else if (signatureStatus.err) {
              Logger.error("Transaction failed on blockchain during polling", {
                transactionId,
                error: JSON.stringify(signatureStatus.err),
                solanaEndpoint: statusEndpoint,
              });
              return {
                success: false,
                error: `Transaction failed on blockchain: ${JSON.stringify(
                  signatureStatus.err
                )}`,
                solanaEndpoint: statusEndpoint,
              };
            }
          }
        }

        if (!transactionConfirmed) {
          await new Promise((resolve) =>
            setTimeout(resolve, POLLING_INTERVAL_MS)
          );
          attempts++;
        }
      }

      if (!transactionConfirmed) {
        Logger.error("Transaction not confirmed within timeout", {
          transactionId,
          solanaEndpoint: statusEndpoint,
        });
        return {
          success: false,
          error: "Transaction not confirmed within timeout",
          solanaEndpoint: statusEndpoint,
        };
      }

      // Once confirmed, fetch the full transaction details
      const rpcRequest = {
        jsonrpc: "2.0",
        id: "get-transaction",
        method: "getTransaction",
        params: [
          transactionId,
          {
            encoding: "jsonParsed",
            commitment: "confirmed", // Match the polling commitment
            maxSupportedTransactionVersion: 0,
          },
        ],
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rpcRequest),
      });

      if (!response.ok) {
        throw new Error(
          `RPC call failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(`RPC error: ${JSON.stringify(result.error)}`);
      }

      if (!result.result) {
        Logger.error(
          "Transaction not found on Solana blockchain after confirmation",
          {
            transactionId,
            solanaEndpoint: endpoint,
          }
        );
        return {
          success: false,
          error:
            "Transaction not found on Solana blockchain after confirmation",
          solanaEndpoint: endpoint,
        };
      }

      const transactionDetails = result.result;

      // Check if the transaction was successful
      if (transactionDetails.meta?.err) {
        Logger.error("Transaction failed on blockchain after confirmation", {
          transactionId,
          error: JSON.stringify(transactionDetails.meta.err),
          solanaEndpoint: endpoint,
        });
        return {
          success: false,
          error: `Transaction failed on blockchain: ${JSON.stringify(
            transactionDetails.meta.err
          )}`,
          solanaEndpoint: endpoint,
        };
      }

      // If we reach this point, the transaction exists and was successful
      Logger.info("Solana transaction verification successful", {
        transactionId,
        expectedAmount,
        solanaEndpoint: endpoint,
      });
      return {
        success: true,
        transactionId,
        creditsAdded: expectedAmount || 10, // Use expected amount if provided
        solanaEndpoint: endpoint,
      };
    } catch (error) {
      Logger.error("Error verifying Solana payment:", {
        transactionId,
        error: error instanceof Error ? error.message : String(error),
        solanaEndpoint: endpoint, // Ensure endpoint is logged even on error
      });
      if (error instanceof Error && error.message.includes("404")) {
        return {
          success: false,
          error: "Transaction not found. Please check the transaction ID.",
          solanaEndpoint: endpoint,
        };
      }
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred during verification",
        solanaEndpoint: endpoint,
      };
    }
  }

  // Get token mint address for different tokens
  public getTokenMintAddress(token: "USDC" | "PYUSD" | "CASH"): string {
    Logger.info("Getting token mint address", {
      token,
    });
    // Return mint addresses for different tokens
    // These are actual addresses for mainnet - update as needed
    const mintAddresses: Record<string, string> = {
      USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY1McCe8BenwNYB",
      CASH: "CASHXWvxwjmrRdjMGJtD4K58z9mJYwg4x4Qq5NmN7cdL", // Placeholder
    };

    const mintAddress = mintAddresses[token] || mintAddresses["USDC"];

    Logger.info("Token mint address retrieved", {
      token,
      mintAddress,
    });

    return mintAddress;
  }

  // Get token balance for a user's wallet
  // NOTE: This method has been simplified to avoid spl-token dependency issues
  // In a real implementation, you would use the spl-token package to fetch token balances
  async getTokenBalance(
    walletPublicKey: string,
    token: "USDC" | "USDT" | "CASH"
  ): Promise<number> {
    Logger.warn(
      "Token balance functionality requires spl-token package which has browser compatibility issues",
      {
        walletPublicKey,
        token,
      }
    );
    Logger.warn(
      "This method returns 0 as a placeholder. Implement with server-side logic in production.",
      { walletPublicKey, token }
    );
    return 0; // Placeholder - implement with server-side logic in real application
  }
}

// Export a singleton instance
export const solanaPaymentService = SolanaPaymentService.getInstance();
