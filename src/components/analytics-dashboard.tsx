'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UsageAnalytics, DailyUsage, ActionBreakdown } from '@/lib/analytics-service';
import { useAuth } from '@/lib/auth-context';
import { RefreshCw } from 'lucide-react';

const CACHE_KEY = 'analytics-dashboard-cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

interface CachedAnalytics {
    data: UsageAnalytics;
    timestamp: number;
    userId?: string;
}

const getCacheKey = (userId?: string) => `${CACHE_KEY}-${userId || 'general'}`;

const saveToCache = (data: UsageAnalytics, userId?: string) => {
    const cacheData: CachedAnalytics = {
        data,
        timestamp: Date.now(),
        userId,
    };
    localStorage.setItem(getCacheKey(userId), JSON.stringify(cacheData));
};

const loadFromCache = (userId?: string): UsageAnalytics | null => {
    try {
        const cached = localStorage.getItem(getCacheKey(userId));
        if (!cached) return null;

        const cacheData: CachedAnalytics = JSON.parse(cached);
        const now = Date.now();

        if (now - cacheData.timestamp > CACHE_DURATION) {
            localStorage.removeItem(getCacheKey(userId));
            return null;
        }

        return cacheData.data;
    } catch (error) {
        console.error('Error loading analytics from cache:', error);
        return null;
    }
};

export default function AnalyticsDashboard() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = async (forceRefresh = false) => {
        try {
            if (!forceRefresh) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }
            setError(null);

            // Check cache first (unless forcing refresh)
            if (!forceRefresh) {
                const cachedData = loadFromCache(user?.id);
                if (cachedData) {
                    setAnalytics(cachedData);
                    setLoading(false);
                    return;
                }
            }

            // Call the API route
            const url = user ? `/api/analytics?userId=${user.id}` : '/api/analytics';
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data: UsageAnalytics = await response.json();

            if (data) {
                setAnalytics(data);
                saveToCache(data, user?.id);
            } else {
                setError('Failed to load analytics data');
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('An error occurred while loading analytics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-8">
                <p>No analytics data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Refresh Button */}
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchAnalytics(true)}
                    disabled={refreshing}
                    className="text-gray-600 dark:text-gray-400"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Usage</p>
                        <p className="text-2xl font-bold text-green-600">{analytics.totalUsage}</p>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                        <p className="text-2xl font-bold text-green-600">${Math.abs(analytics.paymentAnalytics.totalRevenue).toFixed(2)}</p>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Successful Payments</p>
                        <p className="text-2xl font-bold text-green-600">{analytics.paymentAnalytics.successfulPayments}</p>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Payment</p>
                        <p className="text-2xl font-bold text-green-600">${analytics.paymentAnalytics.averagePaymentAmount.toFixed(2)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section - Using simple visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Usage Chart - Simple bar chart visualization */}
                <Card className="dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Daily Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics.dailyUsage.length > 0 ? (
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {analytics.dailyUsage.slice(0, 15).map((day: DailyUsage, index: number) => {
                                    const maxCount = Math.max(...analytics.dailyUsage.map(d => d.count), 1);
                                    const widthPercent = (day.count / maxCount) * 100;

                                    return (
                                        <div key={index} className="flex items-center py-1">
                                            <div className="w-20 text-sm text-gray-600 dark:text-gray-400">{day.date.split('-').slice(1).join('-')}</div>
                                            <div className="flex-1 ml-2">
                                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium"
                                                        style={{ width: `${widthPercent}%` }}
                                                    >
                                                        {day.count > 0 ? day.count : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-12 text-right text-sm font-medium">{day.count}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No daily usage data available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Action Breakdown - SVG Pie Chart */}
                <Card className="dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Action Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics.actionBreakdown.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                                            {(() => {
                                                const total = analytics.actionBreakdown.reduce((sum, item) => sum + item.percentage, 0);
                                                let cumulativePercentage = 0;

                                                return analytics.actionBreakdown.map((action: ActionBreakdown, index: number) => {
                                                    const percentage = total > 0 ? action.percentage / total : 0;
                                                    const startAngle = cumulativePercentage * 360;
                                                    const endAngle = (cumulativePercentage + percentage) * 360;
                                                    cumulativePercentage += percentage;

                                                    // Convert angles to radians for SVG arc calculations
                                                    const startAngleRad = (startAngle * Math.PI) / 180;
                                                    const endAngleRad = (endAngle * Math.PI) / 180;

                                                    // Calculate SVG path for pie segment
                                                    const centerX = 100;
                                                    const centerY = 100;
                                                    const radius = 80;

                                                    const x1 = centerX + radius * Math.cos(startAngleRad);
                                                    const y1 = centerY + radius * Math.sin(startAngleRad);
                                                    const x2 = centerX + radius * Math.cos(endAngleRad);
                                                    const y2 = centerY + radius * Math.sin(endAngleRad);

                                                    // Determine if the arc should be drawn as a large arc
                                                    const largeArcFlag = percentage > 0.5 ? 1 : 0;

                                                    // SVG path for pie segment
                                                    const pathData = [
                                                        `M ${centerX} ${centerY}`,
                                                        `L ${x1} ${y1}`,
                                                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                                        'Z'
                                                    ].join(' ');

                                                    const color = action.action === "Analyze Answer" ? "#84cc16" : action.action === "Batch Evaluate" ? "#16a34a" : `hsl(${(index * 137.5) % 360}, 70%, 50%)`;

                                                    return (
                                                        <path
                                                            key={index}
                                                            d={pathData}
                                                            fill={color}
                                                            stroke="#fff"
                                                            strokeWidth="2"
                                                        />
                                                    );
                                                });
                                            })()}
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">Actions</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4 max-h-40 overflow-y-auto">
                                    {analytics.actionBreakdown.map((action: ActionBreakdown, index: number) => (
                                        <div key={index} className="flex items-center">
                                            <div
                                                className="w-4 h-4 rounded mr-2 flex-shrink-0"
                                                style={{ backgroundColor: action.action === "Analyze Answer" ? "#84cc16" : action.action === "Batch Evaluate" ? "#16a34a" : `hsl(${(index * 137.5) % 360}, 70%, 50%)` }}
                                            ></div>
                                            <div className="flex-1 text-sm truncate">{action.action}</div>
                                            <div className="text-sm font-medium ml-2">{action.count} ({action.percentage}%)</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No action breakdown data available</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Analytics */}
                <Card className="dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Payment Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Total Payments:</span>
                                <span className="font-medium">{analytics.paymentAnalytics.totalPayments}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Spent:</span>
                                <span className="font-medium">${Math.abs(analytics.paymentAnalytics.totalRevenue).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Successful Payments:</span>
                                <span className="font-medium">{analytics.paymentAnalytics.successfulPayments}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Failed Payments:</span>
                                <span className="font-medium">{analytics.paymentAnalytics.failedPayments}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Avg. Payment Amount:</span>
                                <span className="font-medium">${analytics.paymentAnalytics.averagePaymentAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Breakdown Table */}
                <Card className="dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Detailed Action Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics.actionBreakdown.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Count</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">% Share</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {analytics.actionBreakdown.map((item: ActionBreakdown, index: number) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.action}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.count}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.percentage}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No action breakdown data available</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}