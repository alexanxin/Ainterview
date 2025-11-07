'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { x402Service } from '@/lib/x402-payment-service';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/auth-context';
import { useCreditRefresh } from '@/lib/credit-context';

// Solana wallet adapter imports
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, PublicKey } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

const CREDIT_TO_USD_RATE = 0.10; // 1 credit = $0.10 USD
const MIN_CREDITS = 5; // Minimum purchase of $0.50 USD
const MAX_CREDITS = 100; // Maximum purchase of $10.00 USD

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    paymentContext?: {
        description?: string;
        usdAmount?: number;
        requiredCredits?: number;
    };
}

export default function PaymentModal({ isOpen, onClose, onSuccess, paymentContext }: PaymentModalProps) {
    const [creditsToBuy, setCreditsToBuy] = useState(MIN_CREDITS);
    const [selectedToken, setSelectedToken] = useState<'USDC' | 'PYUSD' | 'CASH'>('USDC');
    const [isProcessing, setIsProcessing] = useState(false);
    const { user, session } = useAuth();
    const { refreshCredits } = useCreditRefresh();
    const { connection } = useConnection();
    const { publicKey, connected, sendTransaction } = useWallet();
    const { success, error, warning, info } = useToast();

    const usdAmount = (creditsToBuy * CREDIT_TO_USD_RATE).toFixed(2);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCreditsToBuy(paymentContext?.requiredCredits || MIN_CREDITS);
            setIsProcessing(false);
        }
    }, [isOpen, paymentContext]);

    const handlePayment = async () => {
        if (!user) {
            error('You must be logged in to make a payment. Please sign in first.');
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
                userId: user?.id || 'current_user_id',
                amount: parseFloat(usdAmount),
                token: selectedToken,
                recipientPublicKey: process.env.NEXT_PUBLIC_PAYMENT_WALLET || 'DUMMY_WALLET_ADDRESS',
            };

            // Process payment using x402 service
            const result = await x402Service.createSolanaPaymentRequest(paymentData);

            if (result.success && result.transactionId) {
                console.log(`Payment request created: ${result.transactionId}`);

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

                        const isDevnet = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet" ||
                            process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.includes("devnet") ||
                            process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL?.includes("devnet") || false;
                        const tokenMintAddresses = isDevnet ? devnetTokenMintAddresses : mainnetTokenMintAddresses;

                        const tokenMintAddress = tokenMintAddresses[selectedToken];
                        if (!tokenMintAddress) {
                            error(`Unsupported token: ${selectedToken}`);
                            return;
                        }

                        const tokenMintPublicKey = new PublicKey(tokenMintAddress);
                        const recipientPublicKey = new PublicKey(paymentData.recipientPublicKey);

                        // Get associated token accounts
                        const senderTokenAccount = await getAssociatedTokenAddress(
                            tokenMintPublicKey,
                            publicKey
                        );

                        const recipientTokenAccount = await getAssociatedTokenAddress(
                            tokenMintPublicKey,
                            recipientPublicKey
                        );

                        // Check if recipient token account exists, if not create it
                        const transaction = new Transaction();

                        try {
                            const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
                            if (!recipientAccountInfo) {
                                const createRecipientAccountInstruction = createAssociatedTokenAccountInstruction(
                                    publicKey, // payer
                                    recipientTokenAccount, // associated token account
                                    recipientPublicKey, // owner
                                    tokenMintPublicKey // mint
                                );
                                transaction.add(createRecipientAccountInstruction);
                            }
                        } catch (error) {
                            console.error('Error checking recipient token account:', error);
                            const createRecipientAccountInstruction = createAssociatedTokenAccountInstruction(
                                publicKey, // payer
                                recipientTokenAccount, // associated token account
                                recipientPublicKey, // owner
                                tokenMintPublicKey // mint
                            );
                            transaction.add(createRecipientAccountInstruction);
                        }

                        // Calculate amount in token units
                        const tokenAmount = BigInt(Math.round(parseFloat(usdAmount) * 1_000_000));

                        // Create token transfer instruction
                        const transferInstruction = createTransferInstruction(
                            senderTokenAccount,
                            recipientTokenAccount,
                            publicKey,
                            tokenAmount
                        );

                        transaction.add(transferInstruction);

                        // Get the latest blockhash for the transaction
                        const { blockhash } = await connection.getLatestBlockhash();
                        transaction.recentBlockhash = blockhash;
                        transaction.feePayer = publicKey;

                        // Send transaction to user's wallet for approval
                        const signature = await sendTransaction(transaction, connection);

                        success('Transaction confirmed! Adding credits to your account...');

                        // Verify the transaction and add credits
                        const verificationResult = await x402Service.verifySolanaPayment(signature, creditsToBuy);
                        if (verificationResult.success) {
                            const creditsToAdd = verificationResult.creditsAdded || creditsToBuy;

                            // Add credits to user account via API call
                            try {
                                const response = await fetch('/api/user/credits', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${session?.access_token || ''}`,
                                    },
                                    body: JSON.stringify({
                                        usdAmount: parseFloat(usdAmount),
                                        transactionId: signature
                                    }),
                                });

                                if (response.ok) {
                                    const data = await response.json();
                                    success(`Payment confirmed! ${data.message || `${creditsToAdd} credits have been added to your account.`}`);
                                    refreshCredits(); // Trigger credit refresh after successful payment

                                    // Call success callback and close modal
                                    if (onSuccess) {
                                        onSuccess();
                                    }
                                    onClose();
                                } else {
                                    const errorData = await response.json();
                                    error(`Payment verified but failed to add credits: ${errorData.error || 'Unknown error'}`);
                                }
                            } catch (apiError) {
                                console.error('Error adding credits:', apiError);
                                error('Payment verified but failed to add credits. Please contact support.');
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Purchase Interview Credits
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Payment Context */}
                    {paymentContext && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                Payment Required
                            </h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                {paymentContext.description || 'Additional credits required to continue.'}
                            </p>
                        </div>
                    )}

                    {/* Wallet Connection Section */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
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
                    <div className="p-4 border rounded-lg dark:border-gray-700 dark:bg-gray-900/50">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Select Payment Token
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {['USDC', 'PYUSD'].map((token) => (
                                <Button
                                    key={token}
                                    variant={selectedToken === token ? 'default' : 'outline'}
                                    onClick={() => setSelectedToken(token as 'USDC' | 'PYUSD' | 'CASH')}
                                    className={selectedToken === token ? 'bg-green-600 text-white' : 'dark:text-white'}
                                >
                                    {token}
                                </Button>
                            ))}
                            {process.env.NEXT_PUBLIC_SOLANA_NETWORK !== "devnet" && (
                                <Button
                                    key="CASH"
                                    variant={selectedToken === 'CASH' ? 'default' : 'outline'}
                                    onClick={() => setSelectedToken('CASH')}
                                    className={selectedToken === 'CASH' ? 'bg-green-600 text-white' : 'dark:text-white'}
                                    title="Phantom CASH - Available on mainnet only"
                                >
                                    CASH
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Credit Amount Selection */}
                    <div className="p-4 border rounded-lg dark:border-gray-700 dark:bg-gray-900/50">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Select Credit Amount
                        </h3>
                        <div className="space-y-4">
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

                    {/* Payment Action */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                Total: ${usdAmount} USD
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {creditsToBuy} credits
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePayment}
                                disabled={isProcessing || !connected || creditsToBuy < MIN_CREDITS}
                                className={`${connected
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
                    </div>

                    {/* Payment Protocol Info */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                            x402 Payment Protocol
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                            Secure, blockchain-based transactions using Solana technology.
                            Your payment will be processed with support for USDC, PYUSD, and Phantom CASH.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 rounded text-xs">
                                USDC
                            </span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 rounded text-xs">
                                PYUSD
                            </span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 rounded text-xs">
                                Solana
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}