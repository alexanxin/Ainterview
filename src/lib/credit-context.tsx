'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { geminiService } from './gemini-service';

interface CreditContextType {
    refreshCredits: () => void;
    creditsRefreshTrigger: number;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export function CreditProvider({ children }: { children: ReactNode }) {
    const [creditsRefreshTrigger, setCreditsRefreshTrigger] = useState(0);

    const refreshCredits = useCallback(() => {
        setCreditsRefreshTrigger(prev => prev + 1);
    }, []);

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