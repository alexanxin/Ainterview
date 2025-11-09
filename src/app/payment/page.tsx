'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import { x402Service } from '@/lib/x402-payment-service';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/auth-context';
import { useCreditRefresh } from '@/lib/credit-context';

// Solana wallet adapter imports
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getMint,
  transferCheckedWithFee,
  createTransferCheckedInstruction
} from '@solana/spl-token';

// Define the associated token program ID
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

const CREDIT_TO_USD_RATE = 0.10; // 1 credit = $0.10 USD
const MIN_CREDITS = 5; // Minimum purchase of $0.50 USD
const MAX_CREDITS = 100; // Maximum purchase of $10.00 USD

export default function PaymentPage() {
  // Define TOKEN_2022_PROGRAM_ID inside the component to avoid module-level evaluation issues
  const TOKEN_2022_PROGRAM_ID = useMemo(() => new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'), []);

  const [creditsToBuy, setCreditsToBuy] = useState(MIN_CREDITS);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<'USDC' | 'PYUSD' | 'CASH'>('USDC'); // New state for token selection
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  const { user, session, loading } = useAuth(); // Get user and session from auth context
  const { refreshCredits } = useCreditRefresh();
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const router = useRouter();
  const { success, error, warning, info } = useToast(); // Initialize toast notifications

  const usdAmount = (creditsToBuy * CREDIT_TO_USD_RATE).toFixed(2);

  // Handle URL parameters for dynamic credit amounts and return URLs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const amountParam = params.get('amount');
      const operationParam = params.get('operation');
      const returnUrlParam = params.get('returnUrl');

      // Set credits to buy based on URL parameter, with a minimum of MIN_CREDITS
      if (amountParam) {
        const amount = parseInt(amountParam, 10);
        if (!isNaN(amount) && amount >= MIN_CREDITS) {
          setCreditsToBuy(amount);
        } else {
          setCreditsToBuy(MIN_CREDITS);
        }
      } else {
        setCreditsToBuy(MIN_CREDITS);
      }

      // Set return URL if provided
      if (returnUrlParam) {
        setReturnUrl(returnUrlParam);
      } else if (operationParam) {
        // Set default return URL based on operation
        switch (operationParam) {
          case 'start_interview':
            setReturnUrl('/interview');
            break;
          case 'reanswer_question':
            setReturnUrl('/feedback');
            break;
          default:
            setReturnUrl('/dashboard');
        }
      }
    }
  }, []);

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
        token: selectedToken, // Use selected token
        recipientPublicKey: process.env.NEXT_PUBLIC_PAYMENT_WALLET || 'DUMMY_WALLET_ADDRESS', // Payment wallet
      };

      // Process payment using x402 service
      const result = await x402Service.createSolanaPaymentRequest(paymentData);

      if (result.success && result.transactionId) {
        console.log(`Payment request created: ${result.transactionId}`);
        setTransactionStatus('Payment request created successfully');
        info('Payment request created successfully');

        // Create and send actual Solana transaction for user approval
        if (publicKey && connected) {
          try {
            // Get token mint address based on selected token and network
            const mainnetTokenMintAddresses: Record<string, string> = {
              USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Mainnet USDC
              PYUSD: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo", // Mainnet PYUSD
              CASH: "CASHXWvxwjmrRdjMGJtD4K58z9mJYwg4x4Qq5NmN7cdL", // Placeholder for CASH
            };

            const devnetTokenMintAddresses: Record<string, string> = {
              USDC: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Devnet USDC
              PYUSD: "CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM", // Devnet PYUSD
              CASH: "CASHXWvxwjmrRdjMGJtD4K58z9mJYwg4x4Qq5NmN7cdL", // Placeholder for CASH
            };

            // Detect if we're on devnet
            const isDevnet = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet" ||
              process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.includes("devnet") ||
              process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL?.includes("devnet") || false;
            const tokenMintAddresses = isDevnet ? devnetTokenMintAddresses : mainnetTokenMintAddresses;

            console.log('Network detection:', {
              NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
              NEXT_PUBLIC_SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
              NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL,
              isDevnet,
              selectedTokenMintAddresses: tokenMintAddresses
            });

            const tokenMintAddress = tokenMintAddresses[selectedToken];
            if (!tokenMintAddress) {
              error(`Unsupported token: ${selectedToken}`);
              return;
            }

            const tokenMintPublicKey = new PublicKey(tokenMintAddress);
            const recipientPublicKey = new PublicKey(paymentData.recipientPublicKey);

            // Use TOKEN_2022_PROGRAM_ID for PYUSD since it's a Token-2022 token
            const programId = selectedToken === 'PYUSD' ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;

            // Fetch mint info to check for extensions
            const mintInfo = await getMint(connection, tokenMintPublicKey, 'confirmed', programId);

            const senderTokenAccount = await getAssociatedTokenAddress(
              tokenMintPublicKey,
              publicKey,
              false,
              programId
            );

            const recipientTokenAccount = await getAssociatedTokenAddress(
              tokenMintPublicKey,
              recipientPublicKey,
              false,
              programId
            );

            // Check if recipient token account exists, if not create it
            const transaction = new Transaction();

            // Check sender token account first
            try {
              const senderAccountInfo = await connection.getAccountInfo(senderTokenAccount);
              if (!senderAccountInfo) {
                // Create sender's token account if it doesn't exist
                const createSenderAccountInstruction = createAssociatedTokenAccountInstruction(
                  publicKey, // payer
                  senderTokenAccount, // associated token account
                  publicKey, // owner
                  tokenMintPublicKey // mint
                );
                transaction.add(createSenderAccountInstruction);
                console.log('Added instruction to create sender token account for', selectedToken);
              }
            } catch (err) {
              console.error('Error checking sender token account:', err);
              error('Error accessing your token account. Please check your wallet connection.');
              return;
            }

            // Check recipient token account
            try {
              // Check if recipient token account exists
              const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
              if (!recipientAccountInfo) {
                // Create recipient token account if it doesn't exist
                const createRecipientAccountInstruction = createAssociatedTokenAccountInstruction(
                  publicKey, // payer
                  recipientTokenAccount, // associated token account
                  recipientPublicKey, // owner
                  tokenMintPublicKey // mint
                );

                transaction.add(createRecipientAccountInstruction);
                console.log('Added instruction to create recipient token account');
              }
            } catch (error) {
              console.error('Error checking recipient token account:', error);
              // Create recipient token account as fallback
              const createRecipientAccountInstruction = createAssociatedTokenAccountInstruction(
                publicKey, // payer
                recipientTokenAccount, // associated token account
                recipientPublicKey, // owner
                tokenMintPublicKey // mint
              );

              transaction.add(createRecipientAccountInstruction);
              console.log('Added instruction to create recipient token account (fallback)');
            }

            // Calculate amount in token units (USDC/USDT have 6 decimals)
            const decimals = 6;
            const rawAmount = BigInt(Math.round(parseFloat(usdAmount) * Math.pow(10, decimals))); // Convert USD to token units

            // Debug logging
            console.log('Payment details:', {
              tokenMint: tokenMintAddress,
              sender: publicKey.toString(),
              senderTokenAccount: senderTokenAccount.toString(),
              recipient: recipientPublicKey.toString(),
              recipientTokenAccount: recipientTokenAccount.toString(),
              rawAmount: rawAmount.toString(),
              usdAmount,
              selectedToken,
              hasTransferFeeExtension: !!mintInfo.transferFeeConfig
            });

            // Handle transfer instruction based on transfer fee extension
            if (mintInfo.transferFeeConfig) {
              // Calculate expected fee (even if 0)
              const feeBasisPoints = mintInfo.transferFeeConfig.transferFeeBasisPoints;
              const maxFee = mintInfo.transferFeeConfig.maximumFee;
              const calculatedFee = (rawAmount * BigInt(feeBasisPoints)) / BigInt(10000);
              const expectedFee = calculatedFee > maxFee ? maxFee : calculatedFee;

              console.log('Using transferCheckedWithFee:', {
                feeBasisPoints,
                maxFee: maxFee.toString(),
                calculatedFee: calculatedFee.toString(),
                expectedFee: expectedFee.toString()
              });

              // Use transferCheckedWithFee for tokens with fee extension
              const transferInstruction = transferCheckedWithFee(
                senderTokenAccount,
                tokenMintPublicKey,
                recipientTokenAccount,
                publicKey,
                rawAmount,
                decimals,
                expectedFee,
                [], // multiSigners
                programId
              );

              transaction.add(transferInstruction);
            } else {
              console.log('Using createTransferCheckedInstruction (no fee extension)');

              // Fallback to checked transfer for standard tokens
              const transferInstruction = createTransferCheckedInstruction(
                senderTokenAccount,
                tokenMintPublicKey,
                recipientTokenAccount,
                publicKey,
                rawAmount,
                decimals,
                [], // multiSigners
                programId
              );

              transaction.add(transferInstruction);
            }

            // Get the latest blockhash for the transaction
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            console.log('Sending transaction...', {
              blockhash: blockhash.substring(0, 10) + '...',
              feePayer: publicKey.toString()
            });

            setTransactionStatus('Sending transaction to wallet...');

            // Send transaction to user's wallet for approval using the wallet adapter
            let signature: string;
            try {
              signature = await sendTransaction(transaction, connection);
              console.log('Transaction sent successfully:', signature);
              setTransactionStatus('Transaction sent successfully');
              info('Transaction submitted to blockchain');
            } catch (txError) {
              console.error('Transaction error:', txError);

              // Provide specific error messages for different scenarios
              if (txError instanceof Error) {
                if (txError.message.includes('Insufficient funds') || txError.message.includes('insufficient lamports')) {
                  error(`Insufficient ${selectedToken} tokens or SOL for transaction fees. Please ensure you have enough ${selectedToken} tokens and some SOL for fees.`);
                } else if (txError.message.includes('User rejected') || txError.message.includes('cancelled')) {
                  error('Transaction was cancelled. No charges were made.');
                } else if (txError.message.includes('Token account not found') || txError.message.includes('Invalid account owner')) {
                  error(`Invalid ${selectedToken} token account. Please ensure you have ${selectedToken} tokens in your wallet.`);
                } else {
                  error(`Transaction failed: ${txError.message}`);
                }
              } else {
                error(`Transaction failed: ${txError instanceof Error ? txError.message : 'Unknown error'}`);
              }

              // Clean up and return
              setIsProcessing(false);
              return;
            }

            success('Transaction confirmed! Adding credits to your account...');
            setTransactionStatus('Transaction confirmed on blockchain');

            // Verify the transaction using x402 service (for hackathon compliance)
            setTransactionStatus('Verifying payment on blockchain...');
            const verificationResult = await x402Service.verifySolanaPayment(signature, user.id, creditsToBuy, selectedToken as "USDC" | "USDT" | "CASH");

            if (verificationResult.success) {
              setTransactionStatus('Payment verified on the blockchain');
              info('Payment verified on the blockchain');
            }

            if (verificationResult.success) {
              // Now call the API to update database records and add credits
              const apiResponse = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  transactionId: signature,
                  expectedAmount: parseFloat(usdAmount), // USD amount
                  expectedToken: selectedToken,
                  userId: user.id,
                }),
              });

              if (!apiResponse.ok) {
                throw new Error('Database update failed');
              }

              const apiResult = await apiResponse.json();
              if (apiResult.success) {
                const creditsToAdd = apiResult.creditsAdded || creditsToBuy;

                setTransactionStatus('Credits added to your account');
                success(`Payment confirmed! ${creditsToAdd} credits have been added to your account.`);
                refreshCredits(); // Trigger credit refresh after successful payment
                // Redirect to return URL if provided, otherwise to dashboard
                if (returnUrl) {
                  router.push(returnUrl);
                } else {
                  router.push('/dashboard');
                }
              } else {
                setTransactionStatus('Database update failed');
                error('Payment verified but database update failed. Please contact support.');
                // Don't redirect on database failure - let user retry or contact support
              }
            } else {
              setTransactionStatus('Payment verification failed');
              error('Payment verification failed. Please contact support if you were charged.');
              // Redirect to return URL if provided, otherwise to dashboard
              if (returnUrl) {
                router.push(returnUrl);
              } else {
                router.push('/dashboard');
              }
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
            // Redirect to return URL if provided, otherwise to dashboard
            if (returnUrl) {
              router.push(returnUrl);
            } else {
              router.push('/dashboard');
            }
          }
        } else {
          error('Wallet not connected. Please connect your Solana wallet first.');
          // Redirect to return URL if provided, otherwise to dashboard
          if (returnUrl) {
            router.push(returnUrl);
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        console.error('Payment request failed:', result.error);
        error(`Payment request failed: ${result.error || 'Unknown error occurred'}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      error('An error occurred during payment. Please try again.');
      // Redirect to return URL if provided, otherwise to dashboard
      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push('/dashboard');
      }
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

              {/* Token Selection Section */}
              <div className="mb-8 p-6 border rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Select Payment Token
                </h3>
                <div className="flex flex-wrap gap-4">
                  {['USDC', 'PYUSD', 'CASH'].map((token) => {
                    // Show all tokens on mainnet, only USDC and PYUSD on devnet
                    const isDevnet = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet";
                    const isCashOnDevnet = token === 'CASH' && isDevnet;

                    if (isCashOnDevnet) {
                      return (
                        <Button
                          key="CASH-disabled"
                          variant="outline"
                          disabled
                          className="dark:text-gray-500 cursor-not-allowed"
                          title="Phantom CASH - Not available on devnet"
                        >
                          CASH
                        </Button>
                      );
                    }

                    return (
                      <Button
                        key={token}
                        variant={selectedToken === token ? 'default' : 'outline'}
                        onClick={() => setSelectedToken(token as 'USDC' | 'PYUSD' | 'CASH')}
                        className={selectedToken === token ? 'bg-green-600 text-white' : 'dark:text-white'}
                      >
                        {token}
                      </Button>
                    );
                  })}
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

              {/* Transaction Status Display */}
              {transactionStatus && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {transactionStatus}
                    </span>
                  </div>
                </div>
              )}

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
                      ? `Pay with ${selectedToken} (${usdAmount} USD)`
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
                  using Solana blockchain technology with support for USDC, PYUSD, and Phantom CASH.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 rounded text-xs">
                    USDC
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 rounded text-xs">
                    PYUSD
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 rounded text-xs">
                    Phantom CASH
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 rounded text-xs">
                    Solana Blockchain
                  </span>
                </div>
                {process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet" && (
                  <div className="mt-4 p-3 rounded-lg">
                    <h5 className="font-medium mb-2 dark:text-green-200">
                      Devnet Token Faucets
                    </h5>
                    <div className="space-y-1 text-sm dark:text-green-300">
                      <div>
                        <strong>USDC:</strong>{" "}
                        <a
                          href="https://faucet.circle.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline "
                        >
                          https://faucet.circle.com/
                        </a>
                      </div>
                      <div>
                        <strong>PYUSD:</strong>{" "}
                        <a
                          href="https://cloud.google.com/application/web3/faucet/solana/devnet/pyusd"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline "
                        >
                          https://cloud.google.com/application/web3/faucet/solana/devnet/pyusd
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}