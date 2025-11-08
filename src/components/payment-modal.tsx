'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import X402ComplianceBadge from '@/components/x402-compliance-badge';
import { x402Service } from '@/lib/x402-payment-service';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/auth-context';
import { useCreditRefresh } from '@/lib/credit-context';

// Solana wallet adapter imports
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, PublicKey } from '@solana/web3.js';
import {
    createTransferInstruction,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getMint,
    transferCheckedWithFee,
    createTransferCheckedInstruction
} from '@solana/spl-token';

// Define TOKEN_2022_PROGRAM_ID manually since it's not exported from @solana/spl-token
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

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

        // Prevent self-payment - check if user is trying to send to their own wallet
        const recipientWallet = process.env.NEXT_PUBLIC_PAYMENT_WALLET || 'DUMMY_WALLET_ADDRESS';
        if (publicKey && recipientWallet === publicKey.toString()) {
            error('Cannot send payment to your own wallet address. Please check your payment configuration.');
            return;
        }

        setIsProcessing(true);

        try {
            // Create a Solana payment request
            const paymentData = {
                userId: user?.id || 'current_user_id',
                amount: parseFloat(usdAmount),
                token: selectedToken,
                recipientPublicKey: recipientWallet,
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

                        // Use TOKEN_2022_PROGRAM_ID for PYUSD since it's a Token-2022 token
                        const programId = selectedToken === 'PYUSD' ? TOKEN_2022_PROGRAM_ID : undefined;

                        // Fetch mint info to check for extensions
                        const mintInfo = await getMint(connection, tokenMintPublicKey, 'confirmed', programId);

                        // Get associated token accounts with programId
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
                            } else {
                                // Check if the sender has enough tokens
                                console.log(`Checking ${selectedToken} balance for account:`, senderTokenAccount.toString());

                                try {
                                    // Use RPC call to get token account balance
                                    const rpcRequest = {
                                        jsonrpc: "2.0",
                                        id: "get-token-account-balance",
                                        method: "getTokenAccountBalance",
                                        params: [senderTokenAccount.toString()],
                                    };

                                    // Get the RPC endpoint from environment or connection
                                    // Use devnet RPC for devnet network, mainnet RPC for mainnet
                                    const isDevnet = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet";
                                    const rpcEndpoint = isDevnet
                                        ? (process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL || "https://api.devnet.solana.com")
                                        : (process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com");

                                    console.log(`Checking balance via RPC:`, rpcEndpoint);

                                    const response = await fetch(rpcEndpoint, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(rpcRequest),
                                    });

                                    console.log(`Balance check response status:`, response.status);

                                    if (response.ok) {
                                        const result = await response.json();
                                        console.log(`Balance check result:`, result);

                                        if (result.result?.value) {
                                            const balance = parseFloat(result.result.value.uiAmountString || '0');
                                            const requiredAmount = parseFloat(usdAmount);

                                            console.log(`Sender ${selectedToken} balance:`, balance, 'Required:', requiredAmount);

                                            if (balance < requiredAmount) {
                                                error(`Insufficient ${selectedToken} balance. You have ${balance} ${selectedToken} but need ${requiredAmount} ${selectedToken}.`);
                                                return;
                                            }
                                        } else {
                                            console.log(`No balance data found for ${selectedToken} account`);
                                            // If account exists but has no balance data, it might be empty
                                            error(`${selectedToken} token account exists but appears to be empty. Please ensure you have ${selectedToken} tokens.`);
                                            return;
                                        }
                                    } else {
                                        console.error(`Balance check failed with status:`, response.status);
                                        const errorText = await response.text();
                                        console.error(`Balance check error:`, errorText);
                                    }
                                } catch (balanceErr) {
                                    console.error('Error checking token balance:', balanceErr);
                                    // For PYUSD on devnet, balance checks might fail even if tokens are available
                                    // Since we can see PYUSD transactions succeeding in explorer, let's be more permissive
                                    if (selectedToken === 'PYUSD' && process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet') {
                                        console.warn('PYUSD balance check failed on devnet, but proceeding since PYUSD transfers work on-chain');
                                        // Don't block the transaction - PYUSD works on devnet despite balance check issues
                                    } else {
                                        // For other tokens/networks, if we can't check balance, assume they have tokens
                                        console.log('Could not check token balance, proceeding with transaction');
                                    }
                                }
                            }
                        } catch (err) {
                            console.error('Error checking sender token account:', err);
                            error('Error accessing your token account. Please check your wallet connection.');
                            return;
                        }

                        // Check recipient token account
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
                                console.log('Added instruction to create recipient token account');
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

                        // Send transaction to user's wallet for approval
                        let signature: string;
                        try {
                            signature = await sendTransaction(transaction, connection);
                            console.log('Transaction sent successfully:', signature);
                        } catch (txError) {
                            console.error('Transaction error:', txError);

                            // Provide specific error messages for different scenarios
                            if (txError instanceof Error) {
                                console.error('Transaction error details:', {
                                    message: txError.message,
                                    name: txError.name,
                                    stack: txError.stack,
                                    selectedToken,
                                    usdAmount,
                                    tokenMintAddress
                                });

                                if (txError.message.includes('Insufficient funds') || txError.message.includes('insufficient lamports')) {
                                    error(`Insufficient ${selectedToken} tokens or SOL for transaction fees. Please ensure you have enough ${selectedToken} tokens and some SOL for fees.`);
                                } else if (txError.message.includes('User rejected') || txError.message.includes('cancelled')) {
                                    error('Transaction was cancelled. No charges were made.');
                                } else if (txError.message.includes('Token account not found') || txError.message.includes('Invalid account owner')) {
                                    error(`Invalid ${selectedToken} token account. Please ensure you have ${selectedToken} tokens in your wallet.`);
                                } else if (txError.message.includes('Program failed to complete') || txError.message.includes('custom program error')) {
                                    error(`Transaction failed due to ${selectedToken} token program error. This token may not be available on this network.`);
                                } else if (txError.message.includes('Account not found') && txError.message.includes(selectedToken)) {
                                    error(`${selectedToken} token account not found. Please ensure you have ${selectedToken} tokens in your wallet.`);
                                } else {
                                    error(`Transaction failed: ${txError.message}`);
                                }
                            } else {
                                console.error('Unknown transaction error:', txError);
                                error(`Transaction failed: ${txError instanceof Error ? txError.message : 'Unknown error'}`);
                            }

                            // Clean up and return
                            setIsProcessing(false);
                            return;
                        }

                        success('Transaction confirmed! Adding credits to your account...');

                        // Verify the transaction using x402 service (for hackathon compliance)
                        const verificationResult = await x402Service.verifySolanaPayment(signature, user.id, creditsToBuy, selectedToken as "USDC" | "USDT" | "CASH");

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

                                success(`Payment confirmed! ${creditsToAdd} credits have been added to your account.`);
                                refreshCredits(); // Trigger credit refresh after successful payment

                                // Call success callback and close modal
                                if (onSuccess) {
                                    onSuccess();
                                }
                                onClose();
                            } else {
                                error('Payment verified but database update failed. Please contact support.');
                                // Don't close modal on database failure - let user retry or contact support
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

                    {/* x402 Compliance Badge */}
                    <div className="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <X402ComplianceBadge />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}