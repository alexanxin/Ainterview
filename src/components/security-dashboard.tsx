// components/security-dashboard.tsx - Security monitoring and threat detection dashboard
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPerformanceComparison } from '@/lib/dompurify-enhanced';

interface SecurityMetrics {
    totalOperations: number;
    avgProcessingTime: number;
    threatsBlocked: number;
    threatDetectionRate: number;
    lastUpdate: string;
}

export const SecurityDashboard: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Get current security metrics
    const performanceStats = getPerformanceComparison();
    const metrics: SecurityMetrics | null = performanceStats ? {
        totalOperations: performanceStats.totalOperations,
        avgProcessingTime: performanceStats.dompurify.avgTime,
        threatsBlocked: performanceStats.dompurify.totalThreatsBlocked,
        threatDetectionRate: performanceStats.dompurify.count > 0
            ? (performanceStats.dompurify.totalThreatsBlocked / performanceStats.dompurify.count) * 100
            : 0,
        lastUpdate: new Date().toISOString(),
    } : null;

    if (!isVisible) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button
                    onClick={() => setIsVisible(true)}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg"
                    title="Security Dashboard"
                >
                    🛡️
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
            <Card className="bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            🛡️ Security Dashboard
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsVisible(false)}
                        >
                            ✕
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Security Metrics */}
                    {metrics ? (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Operations</div>
                                <div className="text-xl font-bold text-gray-900 dark:text-white">
                                    {metrics.totalOperations}
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Time (ms)</div>
                                <div className="text-xl font-bold text-gray-900 dark:text-white">
                                    {metrics.avgProcessingTime.toFixed(2)}
                                </div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                <div className="text-sm text-red-600 dark:text-red-400">Threats Blocked</div>
                                <div className="text-xl font-bold text-red-700 dark:text-red-300">
                                    {metrics.threatsBlocked}
                                </div>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                                <div className="text-sm text-yellow-600 dark:text-yellow-400">Detection Rate</div>
                                <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                                    {metrics.threatDetectionRate.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                            Security metrics unavailable
                        </div>
                    )}

                    {/* Performance Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Performance Status
                        </span>
                        <Badge
                            variant={metrics && metrics.avgProcessingTime < 100 ? "default" : "destructive"}
                            className="text-xs"
                        >
                            {metrics && metrics.avgProcessingTime < 100 ? "Optimal" : "Needs Attention"}
                        </Badge>
                    </div>

                    {/* Security Status */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Security Status
                            </span>
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                ✅ Protected
                            </Badge>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            XSS protection active with DOMPurify sanitization
                        </div>
                    </div>

                    {/* Last Updated */}
                    {metrics && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t">
                            Last updated: {new Date(metrics.lastUpdate).toLocaleTimeString()}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SecurityDashboard;