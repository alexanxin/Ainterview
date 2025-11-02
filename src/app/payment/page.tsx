'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import { x402Service } from '@/lib/x402-payment-service';

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

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

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // In a real app, you would create a payment intent
      // For now, we'll simulate the x402 payment
      const paymentData = {
        id: `payment_${Date.now()}`,
        amount: plans[selectedPlan].price * 100, // Convert to cents
        currency: 'USD',
        description: `${plans[selectedPlan].name} - ${plans[selectedPlan].credits} credits`
      };

      // Process payment using x402 service
      const result = await x402Service.createPaymentIntent(paymentData);

      if (result.success) {
        // In a real app, you would update the user's credit balance
        console.log(`Payment successful: ${result.transactionId}`);
        alert('Payment successful! Your credits have been added.');
        router.push('/dashboard'); // Redirect to dashboard after successful payment
      } else {
        console.error('Payment failed:', result.error);
        alert(`Payment failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred during payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
      <Navigation />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <Card className="shadow-xl dark:bg-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Purchase Interview Credits
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Get credits to continue using AI-powered interview preparation
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Object.entries(plans).map(([key, plan]) => (
                  <Card 
                    key={key}
                    className={`cursor-pointer transition-all ${
                      selectedPlan === key 
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
                        className={`w-full mt-4 ${
                          selectedPlan === key 
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
                  disabled={isProcessing}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                >
                  {isProcessing ? 'Processing...' : `Pay with x402 Protocol`}
                </Button>
              </div>

              <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Transparent Pricing
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your first complete interview is completely free! After that, you get 2 additional AI interactions per day. 
                  Purchase credits to unlock unlimited AI interactions and continue improving your interview skills.
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  x402 is an autonomous payment protocol that allows for secure, 
                  blockchain-based transactions. Your payment will be processed 
                  using Solana blockchain technology for fast and low-cost transactions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}