// x402 payment integration
import { SolanaPaymentService } from './solana-payment-service';

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
  token: 'USDC' | 'USDT' | 'CASH';
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
  async createPaymentIntent(paymentData: PaymentIntent): Promise<PaymentResult> {
    if (!this.isInitialized) {
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        return {
          success: false,
          error: 'Payment service failed to initialize',
        };
      }
    }

    // In a real implementation, this would convert the payment data to Solana transaction parameters
    // For now, we'll simulate the process
    console.log(`Creating payment intent for ${paymentData.amount} ${paymentData.currency}`);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would interact with the x402 protocol
    // For now, we'll simulate a successful transaction
    const success = Math.random() > 0.2; // 80% success rate for simulation
    
    if (success) {
      return {
        success: true,
        transactionId: `tx_${Math.random().toString(36).substr(2, 9)}`,
      };
    } else {
      return {
        success: false,
        error: 'Payment failed. Please try again.',
      };
    }
  }

  // New x402-specific method for creating Solana payment requests
  async createSolanaPaymentRequest(paymentData: X402TransactionParams): Promise<X402PaymentResult> {
    if (!this.isInitialized) {
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        return {
          success: false,
          error: 'Payment service failed to initialize',
        };
      }
    }

    // Use the Solana service to create the payment request
    return this.solanaService.createPaymentRequest(paymentData);
  }

  // New x402-specific method for verifying payments
  async verifySolanaPayment(transactionId: string, expectedAmount?: number, expectedToken?: 'USDC' | 'USDT' | 'CASH'): Promise<X402PaymentResult> {
    if (!this.isInitialized) {
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        return {
          success: false,
          error: 'Payment service failed to initialize',
        };
      }
    }

    // Use the Solana service to verify the payment
    return this.solanaService.verifyPayment(transactionId, expectedAmount, expectedToken);
  }

  // Subscribe to plan (compatibility with existing code)
  async subscribeToPlan(planId: string, userId: string): Promise<PaymentResult> {
    if (!this.isInitialized) {
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        return {
          success: false,
          error: 'Payment service failed to initialize',
        };
      }
    }

    console.log(`Creating subscription for plan ${planId} for user ${userId}`);
    
    // Simulate subscription processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For simulation purposes, always succeed
    return {
      success: true,
      transactionId: `sub_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  // Get balance (compatibility with existing code)
  async getBalance(userId: string): Promise<number> {
    if (!this.isInitialized) {
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        throw new Error('Payment service failed to initialize');
      }
    }

    console.log(`Fetching balance for user ${userId}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return a mock balance in cents
    return 5000; // $50.00
  }

  // Get token balance from Solana
  async getTokenBalance(walletPublicKey: string, token: 'USDC' | 'USDT' | 'CASH'): Promise<number> {
    if (!this.isInitialized) {
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        throw new Error('Payment service failed to initialize');
      }
    }

    return this.solanaService.getTokenBalance(walletPublicKey, token);
  }

  // Get token mint address
  getTokenMintAddress(token: 'USDC' | 'USDT' | 'CASH'): string {
    if (!this.isInitialized) {
      const initSuccess = this.initialize();
      if (!initSuccess) {
        throw new Error('Payment service failed to initialize');
      }
    }

    return this.solanaService.getTokenMintAddress(token);
  }
}

// Export a singleton instance
export const x402Service = X402PaymentService.getInstance();