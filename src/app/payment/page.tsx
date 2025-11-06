'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import { x402Service } from '@/lib/x402-payment-service';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/auth-context';

// Phantom Wallet imports
declare global {
  interface Window {
    solana: any;
  }
}

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { user, loading } = useAuth(); // Get user from auth context
  const router = useRouter();
  const { success, error, warning, info } = useToast(); // Initialize toast notifications

  const plans = {
    basic: {
      name: 'Basic Plan',
      price: 5, // $5
      credits: 20,
      description: 'Perfect for occasional use'
    },
    premium: {
      name: 'Premium Plan',
      price: 15, // $15
      credits: 100,
      description: 'Best value for regular users'
    }
  };

  // Check for Phantom wallet on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.solana) {
      setWalletConnected(window.solana.isPhantom);
    }
  }, []);

  // Redirect to auth if user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?redirect=/payment');
    }
  }, [user, loading, router]);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.solana) {
      try {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        setWalletConnected(true);
        success('Wallet connected successfully!');
      } catch (err) {
        console.error('Error connecting wallet:', err);
        error('Failed to connect wallet. Please try again.');
      }
    } else {
      error('Phantom wallet not detected. Please install Phantom browser extension.');
    }
  };

  const handlePayment = async () => {
    if (!user) {
      error('You must be logged in to make a payment. Please sign in first.');
      router.push('/auth');
      return;
    }

    if (!walletConnected) {
      error('Please connect your Solana wallet first.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create a Solana payment request
      const paymentData = {
        userId: user?.id || 'current_user_id', // Use actual user ID from auth context
        amount: plans[selectedPlan].price, // Amount in USD
        token: 'USDC' as const, // Could be USDC, USDT, or CASH
        recipientPublicKey: process.env.NEXT_PUBLIC_PAYMENT_WALLET || 'DUMMY_WALLET_ADDRESS', // Payment wallet
      };

      // Process payment using x402 service
      const result = await x402Service.createSolanaPaymentRequest(paymentData);

      if (result.success && result.transactionId) {
        console.log(`Payment request created: ${result.transactionId}`);

        // In a real implementation, this would trigger the wallet interaction
        // to initiate the actual blockchain transaction

        // For now, simulate the process and add credits after "payment"
        // In real implementation, we'd wait for blockchain confirmation
        success('Payment request created! Please complete the transaction in your wallet.');

        // In a real implementation, we would:
        // 1. Return transaction details to the frontend
        // 2. Have the frontend initiate the actual Solana transaction
        // 3. Verify the transaction on the blockchain
        // 4. Add credits to the user account

        // For demo purposes, simulate adding credits after payment
        setTimeout(async () => {
          const verificationResult = await x402Service.verifySolanaPayment(result.transactionId!);
          if (verificationResult.success) {
            // Calculate credits based on the selected plan
            const creditsToAdd = plans[selectedPlan].credits;

            // Add credits to user account via API call
            try {
              const response = await fetch('/api/user/credits', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: user?.id,
                  amount: creditsToAdd,
                  transactionId: result.transactionId
                }),
              });

              if (response.ok) {
                success(`Payment confirmed! ${creditsToAdd} credits have been added to your account.`);
                router.push('/dashboard');
              } else {
                const errorData = await response.json();
                error(`Payment verified but failed to add credits: ${errorData.error}`);
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
        }, 200); // Simulate 2 seconds for wallet transaction

      } else {
        console.error('Payment request failed:', result.error);
        error(`Payment request failed: ${result.error}`);
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
                  <Button
                    onClick={walletConnected ? undefined : connectWallet}
                    disabled={walletConnected}
                    className={`${walletConnected
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                  >
                    {walletConnected ? (
                      <span className="truncate max-w-[120px]">
                        {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
                      </span>
                    ) : (
                      'Connect Phantom Wallet'
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Object.entries(plans).map(([key, plan]) => (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all ${selectedPlan === key
                      ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'hover:shadow-md'
                      }`}
                    onClick={() => setSelectedPlan(key as 'basic' | 'premium')}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {plan.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {plan.description}
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          ${plan.price}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between py-2">
                          <span className="text-gray-600 dark:text-gray-400">Credits:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {plan.credits}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-gray-600 dark:text-gray-400">AI Interactions:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {plan.credits} questions/analyses
                          </span>
                        </div>
                      </div>

                      <Button
                        className={`w-full mt-4 ${selectedPlan === key
                          ? 'bg-gradient-to-r from-green-600 to-lime-500 text-gray-900'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                      >
                        {selectedPlan === key ? 'Selected' : 'Select Plan'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total: ${plans[selectedPlan].price}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plans[selectedPlan].credits} credits
                  </p>
                </div>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !walletConnected}
                  className={`w-full sm:w-auto ${walletConnected
                    ? 'bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                >
                  {isProcessing
                    ? 'Processing...'
                    : walletConnected
                      ? `Pay with Solana (${plans[selectedPlan].price} USD)`
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