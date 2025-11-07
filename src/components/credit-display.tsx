'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context'; // Assuming this is the correct path
import { useCreditRefresh } from '@/lib/credit-context';
import { CreditCard, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CreditDisplayProps {
    className?: string;
    showTopUpButton?: boolean; // New prop to control whether to show the top-up button
}

export default function CreditDisplay({ className, showTopUpButton = true }: CreditDisplayProps) {
    const { user, session, loading } = useAuth();
    const { creditsRefreshTrigger } = useCreditRefresh();
    const [credits, setCredits] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            const fetchCredits = async () => {
                try {
                    const response = await fetch('/api/user/credits', {
                        headers: {
                            Authorization: `Bearer ${session?.access_token || ''}`,
                        },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setCredits(data.credits);
                    } else {
                        console.error('Failed to fetch credits:', response.statusText);
                        setCredits(0); // Default to 0 on error
                    }
                } catch (error) {
                    console.error('Error fetching credits:', error);
                    setCredits(0); // Default to 0 on network error
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCredits();
        } else if (!loading && !user) {
            // Not logged in, no credits to display
            console.log('No user logged in, setting credits to null');
            setCredits(null);
            setIsLoading(false);
        }
    }, [loading, creditsRefreshTrigger]); // Only depend on loading and refresh trigger, not user/session

    if (loading || isLoading) {
        return (
            <div className={cn("flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400", className)}>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
            </div>
        );
    }

    if (!user || credits === null) {
        return null; // Don't display for unauthenticated users or if fetch failed
    }

    return (
        <div className={cn("flex items-center space-x-2 text-sm font-medium", className)}>
            <div className="flex items-center space-x-1 text-green-600 dark:text-green-40">
                <CreditCard className="h-4 w-4" />
                <span>{credits} Credits</span>
            </div>
            {showTopUpButton && (
                <button
                    className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-70 text-white cursor-pointer transition-all dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling to parent
                        router.push('/payment');
                    }}
                    aria-label="Top up credits"
                >
                    <Plus className="h-4 w-4 font-black" />
                </button>
            )}
        </div>
    );
}