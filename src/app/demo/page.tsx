'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Play, CreditCard, Zap } from 'lucide-react';
import Navigation from '@/components/navigation';
import X402ComplianceBadge from '@/components/x402-compliance-badge';

interface DemoStep {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'active' | 'completed';
    icon: React.ReactNode;
}

interface ConsoleLog {
    timestamp: string;
    type: 'info' | 'success' | 'error' | 'warning';
    message: string;
    data?: Record<string, unknown>;
}

export default function DemoPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [credits, setCredits] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
    const [lastResponse, setLastResponse] = useState<Record<string, unknown> | null>(null);

    const steps: DemoStep[] = [
        {
            id: 'start',
            title: 'Start Interview',
            description: 'Begin the interview process with pre-filled data',
            status: currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : 'pending',
            icon: <Play className="w-5 h-5" />
        },
        {
            id: 'check-credits',
            title: 'Check Credits',
            description: 'Verify user has sufficient credits for the interview',
            status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending',
            icon: <CreditCard className="w-5 h-5" />
        },
        {
            id: 'payment-required',
            title: '402 Payment Required',
            description: 'API returns HTTP 402 with x402 protocol headers',
            status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending',
            icon: <AlertCircle className="w-5 h-5" />
        },
        {
            id: 'buy-credits',
            title: 'Buy Credits',
            description: 'Simulate credit purchase with transaction details',
            status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending',
            icon: <Zap className="w-5 h-5" />
        },
        {
            id: 'verify-payment',
            title: 'Verify Payment',
            description: 'API verifies transaction on Solana blockchain',
            status: currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : 'pending',
            icon: <CheckCircle className="w-5 h-5" />
        },
        {
            id: 'credits-added',
            title: 'Credits Added',
            description: 'Credits successfully added to user account',
            status: currentStep === 5 ? 'active' : currentStep > 5 ? 'completed' : 'pending',
            icon: <CheckCircle className="w-5 h-5" />
        },
        {
            id: 'interview-ready',
            title: 'Interview Ready',
            description: 'User can now proceed with the interview',
            status: currentStep === 6 ? 'active' : currentStep > 6 ? 'completed' : 'pending',
            icon: <CheckCircle className="w-5 h-5" />
        }
    ];

    const addLog = (type: ConsoleLog['type'], message: string, data?: Record<string, unknown>) => {
        const log: ConsoleLog = {
            timestamp: new Date().toLocaleTimeString(),
            type,
            message,
            data
        };
        setConsoleLogs(prev => [...prev, log]);
    };

    const handleStartInterview = async () => {
        setIsLoading(true);
        addLog('info', 'Starting interview process...');

        // Mock interview data
        const interviewData = {
            action: 'analyzeAnswer',
            context: {
                jobPosting: 'Senior React Developer position at TechCorp. Requirements: 5+ years React experience, TypeScript, Node.js, AWS.',
                companyInfo: 'TechCorp is a leading fintech company building next-generation payment solutions.',
                userCv: 'Full-stack developer with 6 years experience. Expert in React, TypeScript, Node.js, and cloud platforms.'
            },
            question: 'Can you describe your experience with React performance optimization?',
            answer: 'I have extensive experience optimizing React applications. I use React.memo, useMemo, and useCallback to prevent unnecessary re-renders. I also implement code splitting, lazy loading, and optimize bundle sizes.',
            userId: 'demo-user-123'
        };

        addLog('info', 'Interview data prepared', interviewData);

        // Make actual API call to trigger 402 response
        try {
            addLog('info', 'Making API call to /api/gemini...');
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Use demo auth header to bypass real authentication
                    'Authorization': 'Bearer demo-token-123'
                },
                body: JSON.stringify(interviewData)
            });

            if (response.status === 402) {
                const responseData = await response.json();
                setLastResponse(responseData);
                addLog('warning', 'Payment Required - HTTP 402 returned with x402 headers', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    response: responseData
                });
                setCurrentStep(2);
            } else {
                const responseData = await response.json();
                addLog('success', 'Interview processed successfully', responseData);
                setCurrentStep(1); // Only set to step 1 if successful
            }
        } catch (error) {
            addLog('error', 'API call failed', { error: String(error) });
            setCurrentStep(1); // Set to step 1 on error too
        }

        setIsLoading(false);
    };

    const handleBuyCredits = () => {
        addLog('info', 'Simulating credit purchase...');

        // Mock transaction data
        const transactionData = {
            transactionId: `demo-tx-${Date.now()}`,
            amount: 0.50, // $0.50 for 10 credits
            credits: 10,
            token: 'USDC',
            timestamp: new Date().toISOString()
        };

        addLog('success', 'Credits purchased successfully', transactionData);
        setCurrentStep(4); // Advance to verification step
    };

    const handleVerifyPayment = async () => {
        addLog('info', 'Verifying payment on Solana blockchain...');

        // Simulate blockchain verification
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

        const verificationData = {
            transactionId: `demo-tx-${Date.now()}`,
            blockchain: 'solana',
            network: 'mainnet-beta',
            confirmations: 1,
            verified: true,
            timestamp: new Date().toISOString()
        };

        addLog('success', 'Payment verified on blockchain', verificationData);
        setCredits(prev => prev + 10); // Add credits after verification
        setCurrentStep(5);
    };

    const handleCompleteDemo = () => {
        addLog('success', 'Demo completed! Interview is now ready to proceed.');
        setCurrentStep(6);
    };

    const getStatusIcon = (status: DemoStep['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'active':
                return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
            default:
                return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-purple-50 font-sans dark:from-gray-900 dark:to-black">
            <Navigation />

            <main className="flex-1 p-4 relative z-10">
                <div className="container mx-auto max-w-7xl py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <X402ComplianceBadge />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            x402 Payment Protocol Demo
                        </h1>
                        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                            Experience the complete x402 micropayment flow without real wallets or authentication
                        </p>
                        <div className="mt-6">
                            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-600 to-lime-500 text-white font-bold text-lg shadow-lg">
                                Current Credits: {credits}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Steps Panel */}
                        <div className="lg:col-span-1">
                            <Card className="dark:bg-gray-800/50">
                                <CardHeader>
                                    <CardTitle className="text-xl">Demo Steps</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {steps.map((step, index) => (
                                        <div key={step.id} className="flex items-start gap-3">
                                            <div className="mt-1">
                                                {getStatusIcon(step.status)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {step.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Action Buttons */}
                                    <div className="pt-4 space-y-2">
                                        {currentStep === 0 && (
                                            <Button
                                                onClick={handleStartInterview}
                                                disabled={isLoading}
                                                className="w-full"
                                            >
                                                {isLoading ? 'Starting...' : 'Start Interview'}
                                            </Button>
                                        )}

                                        {currentStep === 2 && (
                                            <Button
                                                onClick={() => setCurrentStep(3)}
                                                className="w-full bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90"
                                            >
                                                Initialize Payment
                                            </Button>
                                        )}

                                        {currentStep === 3 && (
                                            <Button
                                                onClick={handleBuyCredits}
                                                className="w-full bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90"
                                            >
                                                Wallet Approve 10 Credits ($0.50)
                                            </Button>
                                        )}

                                        {currentStep === 4 && (
                                            <Button
                                                onClick={handleVerifyPayment}
                                                className="w-full bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90"
                                            >
                                                Verify Payment on Blockchain
                                            </Button>
                                        )}

                                        {currentStep === 5 && (
                                            <Button
                                                onClick={handleCompleteDemo}
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                            >
                                                Complete Demo
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Console Panel */}
                        <div className="lg:col-span-2">
                            <Card className="dark:bg-gray-800/50">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        Live Console
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                                        {consoleLogs.length === 0 ? (
                                            <div className="text-gray-500">Console output will appear here...</div>
                                        ) : (
                                            consoleLogs.map((log, index) => (
                                                <div key={index} className="mb-2">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-500 text-xs whitespace-nowrap">
                                                            [{log.timestamp}]
                                                        </span>
                                                        <span className={`text-xs px-1 rounded ${log.type === 'error' ? 'bg-red-900 text-red-300' :
                                                            log.type === 'warning' ? 'bg-yellow-900 text-yellow-300' :
                                                                log.type === 'success' ? 'bg-green-900 text-green-300' :
                                                                    'bg-blue-900 text-blue-300'
                                                            }`}>
                                                            {log.type.toUpperCase()}
                                                        </span>
                                                        <span className="flex-1">{log.message}</span>
                                                    </div>
                                                    {log.data && (
                                                        <details className="ml-6 mt-1">
                                                            <summary className="text-gray-500 cursor-pointer hover:text-gray-400">
                                                                Show data
                                                            </summary>
                                                            <pre className="text-xs mt-1 overflow-x-auto">
                                                                {JSON.stringify(log.data, null, 2)}
                                                            </pre>
                                                        </details>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Last Response Display */}
                                    {lastResponse && (
                                        <div className="mt-4">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                Last API Response (HTTP 402)
                                            </h3>
                                            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
                                                <pre className="overflow-x-auto">
                                                    {JSON.stringify(lastResponse, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            This demo showcases the x402 payment protocol implementation for hackathon evaluation.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            No real transactions or authentication required.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}