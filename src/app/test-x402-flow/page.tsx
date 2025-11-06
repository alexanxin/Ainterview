"use client";

import { useState } from "react";
import { executeWithX402Handling } from "@/lib/x402-client-simple";

export default function TestX402Flow() {
    const [response, setResponse] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [paymentRequired, setPaymentRequired] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const testX402Flow = async () => {
        setLoading(true);
        setResponse("");
        setPaymentRequired(false);
        setPaymentSuccess(false);

        try {
            // Mock connection and wallet objects for testing
            const mockConnection = {};
            const mockWallet = {};

            // Make a request that will trigger the X402 flow
            const result = await executeWithX402Handling(
                async (paymentHeader: string | undefined) => {
                    // This simulates calling your API endpoint
                    // In a real implementation, this would be your actual API call
                    const headers: Record<string, string> = {
                        "Content-Type": "application/json",
                    };

                    if (paymentHeader) {
                        headers["X-PAYMENT"] = paymentHeader;
                    }

                    // Simulate an API call that returns 402 for testing
                    // In a real scenario, this would be your actual API endpoint
                    return fetch("/api/gemini", {
                        method: "POST",
                        headers,
                        body: JSON.stringify({
                            action: "analyzeAnswer",
                            context: {
                                jobPosting: "Software Engineer position",
                                companyInfo: "Tech company",
                                userCv: "My CV details"
                            },
                            question: "Tell me about yourself",
                            answer: "I'm a software engineer",
                            userId: "test-user"
                        })
                    });
                },
                mockConnection,
                mockWallet,
                // onPaymentRequired callback
                (paymentReq: { description: string }) => {
                    console.log("Payment required:", paymentReq);
                    setPaymentRequired(true);
                },
                // onPaymentSuccess callback
                (result: { txHash?: string; explorerUrl?: string }) => {
                    console.log("Payment successful:", result);
                    setPaymentSuccess(true);
                },
                // onPaymentInitiated callback
                (message: string) => {
                    console.log("Payment initiated:", message);
                    setPaymentRequired(true);
                },
                // onPaymentFailure callback
                (message: string) => {
                    console.log("Payment failed:", message);
                }
            );

            const resultText = await result.text();
            setResponse(resultText);
        } catch (error) {
            setResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">X402 Payment Flow Test</h1>

            <div className="mb-6">
                <button
                    onClick={testX402Flow}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                    {loading ? "Processing..." : "Test X402 Flow"}
                </button>
            </div>

            {paymentRequired && (
                <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                    <p>Payment required! The system detected insufficient credits and prompted for payment.</p>
                </div>
            )}

            {paymentSuccess && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    <p>Payment successful! The transaction was processed and credits should be added.</p>
                </div>
            )}

            {response && (
                <div className="mt-6 p-4 bg-gray-100 rounded">
                    <h2 className="text-lg font-semibold mb-2">Response:</h2>
                    <pre className="whitespace-pre-wrap break-words">{response}</pre>
                </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 rounded">
                <h2 className="text-lg font-semibold mb-2">How the X402 Flow Works:</h2>
                <ol className="list-decimal pl-5 space-y-2">
                    <li>User makes a request to the API (e.g., for AI feedback)</li>
                    <li>Server checks if user has sufficient credits</li>
                    <li>If credits are insufficient, server returns HTTP 402 with payment requirements</li>
                    <li>Client parses the 402 response and displays payment prompt to user</li>
                    <li>User confirms payment and signs Solana transaction via wallet</li>
                    <li>Client retries original request with X-PAYMENT header containing signed transaction</li>
                    <li>Server verifies the transaction and processes the original request</li>
                    <li>Server responds with X-PAYMENT-RESPONSE header confirming successful payment</li>
                </ol>
            </div>
        </div>
    );
}