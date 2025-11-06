'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import { x402Service } from '@/lib/x402-payment-service';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/auth-context';

// Solana wallet adapter imports
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

const CREDIT_TO_USD_RATE = 0.10; // 1 credit = $0.10 USD
const MIN_CREDITS = 5; // Minimum purchase of $0.50 USD
const MAX_CREDITS = 100; // Maximum purchase of $10.00 USD

export default function PaymentPage() {
  const [creditsToBuy, setCreditsToBuy] = useState(MIN_CREDITS);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, session, loading } = useAuth(); // Get user and session from auth context
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const router = useRouter();
  const { success, error, warning, info } = useToast(); // Initialize toast notifications

  const usdAmount = (creditsToBuy * CREDIT_TO_USD_RATE).toFixed(2);

  // Redirect to auth if user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?redirect=/payment');
    }
  }, [user, loading, router]);

  const handlePayment = async () => {
    if (!user) {
      error('You must be logged in to make a payment. Please sign in first.');
      router.push('/auth');
      return;
    }

    if (!connected) {
      error('Please connect your Solana wallet first.');
      return;
    }

    if (creditsToBuy < MIN_CREDITS) {
      error(`Minimum purchase is ${MIN_CREDITS} credits.`);
      return;
    }

    setIsProcessing(true);

    try {
      // Create a Solana payment request
      const paymentData = {
        userId: user?.id || 'current_user_id', // Use actual user ID from auth context
        amount: parseFloat(usdAmount), // Variable amount in USD
        token: 'USDC' as const, // Could be USDC, USDT, or CASH
        recipientPublicKey: process.env.NEXT_PUBLIC_PAYMENT_WALLET || 'DUMMY_WALLET_ADDRESS', // Payment wallet
      };

      // Process payment using x402 service
      const result = await x402Service.createSolanaPaymentRequest(paymentData);

      if (result.success && result.transactionId) {
        console.log(`Payment request created: ${result.transactionId}`);

        // Create and send actual Solana transaction for user approval
        if (publicKey && connected) {
          try {
            // Calculate lamports (for demonstration - in a real app, we'd handle USDC/USDT tokens)
            // For now, we'll create a simple transfer transaction to demonstrate the process
            const lamports = Math.round(parseFloat(usdAmount) * 1_000_000); // Convert to lamports (simplified)

            const transaction = new Transaction().add(
              SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(paymentData.recipientPublicKey),
                lamports: lamports > 0 ? lamports : 10000, // Ensure at least 0.00001 SOL
              })
            );

            // Get the latest blockhash for the transaction
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            // Send transaction to user's wallet for approval using the wallet adapter
            const signature = await sendTransaction(transaction, connection);

            success('Transaction confirmed! Adding credits to your account...');

            // Verify the transaction and add credits
            const verificationResult = await x402Service.verifySolanaPayment(signature, creditsToBuy);
            if (verificationResult.success) {
              // Calculate credits based on the purchased amount
              const creditsToAdd = verificationResult.creditsAdded || creditsToBuy;

              // Add credits to user account via API call
              try {
                const response = await fetch('/api/user/credits', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token || ''}`, // Use session access token
                  },
                  body: JSON.stringify({
                    amount: creditsToAdd,
                    transactionId: signature
                  }),
                });

                if (response.ok) {
                  const data = await response.json();
                  success(`Payment confirmed! ${data.message || `${creditsToAdd} credits have been added to your account.`}`);
                  router.push('/dashboard');
                } else {
                  const errorData = await response.json();
                  error(`Payment verified but failed to add credits: ${errorData.error || 'Unknown error'}`);
                  router.push('/dashboard');
                }
              } catch (apiError) {
                console.error('Error adding credits:', apiError);
                error('Payment verified but failed to add credits. Please contact support.');
                router.push('/dashboard');
              }
            } else {
              error('Payment verification failed. Please contact support if you were charged.');
            }
          } catch (walletError: unknown) {
            if (walletError instanceof Error) {
              if (walletError.message.includes('User rejected') || walletError.message.includes('cancelled')) {
                error('Transaction was cancelled. No charges were made.');
              } else {
                console.error('Wallet transaction error:', walletError);
                error('Failed to process wallet transaction. Please make sure your wallet is connected and try again.');
              }
            } else {
              console.error('Wallet transaction error:', walletError);
              error('Failed to process wallet transaction. Please make sure your wallet is connected and try again.');
            }
          }
        } else {
          error('Wallet not connected. Please connect your Solana wallet first.');
        }
      } else {
        console.error('Payment request failed:', result.error);
        error(`Payment request failed: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      error('An error occurred during payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
        <Navigation />
        <main className="flex-1 p-4">
          <div className="container mx-auto max-w-2xl py-8">
            <Card className="shadow-xl dark:bg-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Loading Payment Page...
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Please wait while we prepare your payment options
                </p>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-12">
                <div className="mb-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Don't render if user is not authenticated (they will be redirected by useEffect)
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
      <Navigation />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <Card className="shadow-xl dark:bg-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-90 dark:text-white">
                Purchase Interview Credits
              </CardTitle>
              <p className="text-gray-60 dark:text-gray-400 mt-2">
                Get credits to continue using AI-powered interview preparation
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Wallet Connection Section */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                      Connect Your Solana Wallet
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Required for x402 payments via Solana blockchain
                    </p>
                  </div>
                  <div className="w-full sm:w-auto">
                    <WalletMultiButton className="w-full" />
                  </div>
                </div>
              </div>

              <div className="mb-8 p-6 border rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Granular Credit Purchase
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="credit-slider" className="text-lg font-medium">
                      Credits to Buy: <span className="text-green-600 dark:text-green-400">{creditsToBuy}</span>
                    </Label>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${usdAmount} USD
                    </span>
                  </div>
                  <Slider
                    id="credit-slider"
                    min={MIN_CREDITS}
                    max={MAX_CREDITS}
                    step={1}
                    value={[creditsToBuy]}
                    onValueChange={(value) => setCreditsToBuy(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{MIN_CREDITS} Credits (${(MIN_CREDITS * CREDIT_TO_USD_RATE).toFixed(2)})</span>
                    <span>{MAX_CREDITS} Credits (${(MAX_CREDITS * CREDIT_TO_USD_RATE).toFixed(2)})</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total: ${usdAmount} USD
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {creditsToBuy} credits
                  </p>
                </div>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !connected || creditsToBuy < MIN_CREDITS}
                  className={`w-full sm:w-auto ${connected
                    ? 'bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                >
                  {isProcessing
                    ? 'Processing...'
                    : connected
                      ? `Pay with Solana (${usdAmount} USD)`
                      : 'Connect Wallet First'}
                </Button>
              </div>

              <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  x402 Payment Protocol
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your first complete interview is completely free! After that, you get 2 additional AI interactions per day.
                  Purchase credits to unlock unlimited AI interactions and continue improving your interview skills.
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  x402 is an autonomous payment protocol that allows for secure,
                  blockchain-based transactions. Your payment will be processed
                  using Solana blockchain technology with support for USDC, USDT, and Phantom CASH.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 rounded text-xs">
                    USDC
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 rounded text-xs">
                    USDT
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 rounded text-xs">
                    Phantom CASH
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 rounded text-xs">
                    Solana Blockchain
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}