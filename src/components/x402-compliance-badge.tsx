'use client';

import { Badge } from 'lucide-react';

interface X402ComplianceBadgeProps {
    className?: string;
}

export default function X402ComplianceBadge({ className = "" }: X402ComplianceBadgeProps) {
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-600 to-lime-500 text-white text-sm font-medium shadow-lg ${className}`}>
            <Badge className="w-4 h-4" />
            <span>x402 Compliant</span>
        </div>
    );
}