'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PaymentModal from './payment-modal';

export default function PaymentModalTest() {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Payment Modal Test</h1>
            <p className="mb-4">Click the button below to test the payment modal functionality.</p>
            <Button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-green-600 to-lime-500 text-white hover:opacity-90"
            >
                Test Payment Modal
            </Button>

            <PaymentModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => {
                    console.log('Payment successful!');
                    setShowModal(false);
                }}
                paymentContext={{
                    description: 'Top up 5 credits for feedback',
                    usdAmount: 0.5,
                    requiredCredits: 5
                }}
            />
        </div>
    );
}