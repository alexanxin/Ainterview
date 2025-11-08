'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { geminiService } from './gemini-service';
import { cacheService } from './cache-service';
import { useAuth } from './auth-context';

interface CreditContextType {
    refreshCredits: () => void;
    creditsRefreshTrigger: number;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export function CreditProvider({ children }: { children: ReactNode }) {
    const [creditsRefreshTrigger, setCreditsRefreshTrigger] = useState(0);
    const { user } = useAuth();

    const refreshCredits = useCallback(() => {
        console.log('🔄 CREDITS: refreshCredits called');
        console.log('🔄 CREDITS: User ID available:', user?.id);

        if (user?.id) {
            console.log('🗑️ CACHE: Invalidating credit cache for user:', user.id);
            // Invalidate the credit cache to force fresh data
            cacheService.invalidateUserCredits(user.id);
            console.log('✅ CACHE: Credit cache invalidated for user:', user.id);
        } else {
            console.log('⚠️ CACHE: No user ID available, cannot invalidate specific cache');
        }

        setCreditsRefreshTrigger(prev => prev + 1);
        console.log('🔄 CREDITS: refreshCredits completed');
    }, [user]);

    // Set up the credit refresh callback for the Gemini service
    useEffect(() => {
        geminiService.setCreditRefreshCallback(refreshCredits);
    }, [refreshCredits]);

    const value = {
        refreshCredits,
        creditsRefreshTrigger,
    };

    return <CreditContext.Provider value={value}>{children}</CreditContext.Provider>;
}

export function useCreditRefresh() {
    const context = useContext(CreditContext);
    if (context === undefined) {
        throw new Error('useCreditRefresh must be used within a CreditProvider');
    }
    return context;
}