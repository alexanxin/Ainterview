// x402 payment integration
import { SolanaPaymentService } from "./solana-payment-service";
import { Logger } from "./logger";

// Re-export the interface for compatibility
export interface PaymentIntent {
  id: string;
  amount: number; // in cents or smallest currency unit
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface X402TransactionParams {
  userId: string;
  amount: number; // in USD (e.g., 5 for $5)
  token: "USDC" | "PYUSD" | "CASH";
  recipientPublicKey: string;
}

export interface X402PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  creditsAdded?: number;
}

export class X402PaymentService {
  private static instance: X402PaymentService;
  private solanaService: SolanaPaymentService;
  private isInitialized: boolean = false;

  private constructor() {
    // Private constructor for singleton
    this.solanaService = SolanaPaymentService.getInstance();
  }

  public static getInstance(): X402PaymentService {
    if (!X402PaymentService.instance) {
      X402PaymentService.instance = new X402PaymentService();
    }
    return X402PaymentService.instance;
  }

  async initialize(): Promise<boolean> {
    // Initialize the Solana service
    this.isInitialized = await this.solanaService.initialize();
    return this.isInitialized;
  }

  // Create payment intent (compatibility with existing code)
  async createPaymentIntent(
    paymentData: PaymentIntent
  ): Promise<PaymentResult> {
    if (!this.isInitialized) {
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        return {
          success: false,
          error: "Payment service failed to initialize",
        };
      }
    }

    // Convert the payment data to Solana transaction parameters
    Logger.info("Creating payment intent for x402 service", {
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
      metadata: paymentData.metadata,
    });

    // In a real implementation, this would interact with the x402 protocol
    // For now, we'll return a successful transaction ID based on the payment data
    // In production, this would create an actual payment request

    // Generate a unique transaction ID
    const transactionId = `x402_${Date.now()}_${
      paymentData.id || Math.random().toString(36).substr(2, 9)
    }`;

    Logger.info("Payment intent created successfully", {
      transactionId,
      amount: paymentData.amount,
      currency: paymentData.currency,
    });

    return {
      success: true,
      transactionId,
    };
  }

  // New x402-specific method for creating Solana payment requests
  async createSolanaPaymentRequest(
    paymentData: X402TransactionParams
  ): Promise<X402PaymentResult> {
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

    // Use the Solana service to create the payment request
    const result = await this.solanaService.createPaymentRequest(paymentData);

    Logger.info("Solana payment request result", {
      userId: paymentData.userId,
      success: result.success,
      transactionId: result.transactionId,
      error: result.error,
      creditsAdded: result.creditsAdded,
    });

    return result;
  }

  // New x402-specific method for verifying payments
  async verifySolanaPayment(
    transactionId: string,
    expectedAmount?: number,
    expectedToken?: "USDC" | "USDT" | "CASH"
  ): Promise<X402PaymentResult> {
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

    // Use the Solana service to verify the payment
    const result = await this.solanaService.verifyPayment(
      transactionId,
      expectedAmount,
      expectedToken
    );

    Logger.info("Solana payment verification completed", {
      transactionId,
      success: result.success,
      error: result.error,
      creditsAdded: result.creditsAdded,
    });

    return result;
  }

  // Subscribe to plan (compatibility with existing code)
  async subscribeToPlan(
    planId: string,
    userId: string
  ): Promise<PaymentResult> {
    if (!this.isInitialized) {
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        return {
          success: false,
          error: "Payment service failed to initialize",
        };
      }
    }

    Logger.info("Creating subscription for plan", {
      planId,
      userId,
    });

    // In a real implementation, this would create an actual subscription
    // For now, we'll return a successful transaction ID

    // Generate a unique transaction ID
    const transactionId = `sub_${Date.now()}_${planId}_${userId}`;

    return {
      success: true,
      transactionId,
    };
  }

  // Get balance (compatibility with existing code)
  async getBalance(userId: string): Promise<number> {
    if (!this.isInitialized) {
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        throw new Error("Payment service failed to initialize");
      }
    }

    Logger.info("Fetching balance for user", {
      userId,
    });

    // In a real implementation, this would fetch the actual balance from the blockchain
    // For now, we'll return a realistic default value that can be used in testing

    // Return a realistic balance in cents
    return 0; // $0.00 - in a real implementation, this would fetch actual balance
  }

  // Get token balance from Solana
  async getTokenBalance(
    walletPublicKey: string,
    token: "USDC" | "USDT" | "CASH"
  ): Promise<number> {
    if (!this.isInitialized) {
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        throw new Error("Payment service failed to initialize");
      }
    }

    Logger.info("Getting token balance for wallet", {
      walletPublicKey,
      token,
    });

    const balance = await this.solanaService.getTokenBalance(
      walletPublicKey,
      token
    );

    Logger.info("Token balance retrieved", {
      walletPublicKey,
      token,
      balance,
    });

    return balance;
  }

  // Get token mint address
  getTokenMintAddress(token: "USDC" | "PYUSD" | "CASH"): string {
    if (!this.isInitialized) {
      const initSuccess = this.initialize();
      if (!initSuccess) {
        throw new Error("Payment service failed to initialize");
      }
    }

    Logger.info("Getting token mint address", {
      token,
    });

    const mintAddress = this.solanaService.getTokenMintAddress(token);

    Logger.info("Token mint address retrieved", {
      token,
      mintAddress,
    });

    return mintAddress;
  }
}

// Export a singleton instance
export const x402Service = X402PaymentService.getInstance();
