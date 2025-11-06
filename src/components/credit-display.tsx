'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context'; // Assuming this is the correct path
import { CreditCard, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CreditDisplayProps {
    className?: string;
}

export default function CreditDisplay({ className }: CreditDisplayProps) {
    const { user, session, loading } = useAuth();
    const [credits, setCredits] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            const fetchCredits = async () => {
                try {
                    console.log('Fetching credits for user:', user.id);
                    console.log('Session access token exists:', !!session?.access_token);

                    const response = await fetch('/api/user/credits', {
                        headers: {
                            Authorization: `Bearer ${session?.access_token || ''}`,
                        },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Received credits:', data.credits);
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
    }, [user, session, loading]);

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
        <div
            className={cn("flex items-center space-x-1 text-sm font-medium text-green-600 dark:text-green-40 cursor-pointer hover:opacity-80 transition-opacity", className)}
            onClick={() => router.push('/payment')}
        >
            <CreditCard className="h-4 w-4" />
            <span>{credits} Credits</span>
        </div>
    );
}