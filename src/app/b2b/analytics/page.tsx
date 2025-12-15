'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast';
import { getCompanyByUserId } from '@/lib/database';
import { fetchCompanyDashboardStats } from '../actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Briefcase, Eye, TrendingUp, Clock, Award } from 'lucide-react';
import type { Company } from '@/types/b2b-types';

export default function CompanyAnalytics() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { error } = useToast();
    const [stats, setStats] = useState<any>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                const companyData = await getCompanyByUserId(user.id);
                if (!companyData) {
                    error('Company not found. Please contact support.');
                    return;
                }
                setCompany(companyData);

                const statsData = await fetchCompanyDashboardStats(companyData.id);
                setStats(statsData);
            } catch (err) {
                console.error('Error fetching analytics data:', err);
                error('Failed to load analytics. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            if (user) {
                fetchData();
            } else {
                router.push('/auth');
            }
        }
    }, [user, authLoading, router, error]);

    if (loading || authLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
                <main className="flex-1 p-4 flex items-center justify-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                </main>
            </div>
        );
    }

    if (!company) return null;

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
            <main className="flex-1 p-4">
                <div className="container mx-auto max-w-6xl py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="h-8 w-8 text-green-600" />
                                Analytics & Insights
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Detailed performance metrics for {company.company_name}
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => router.back()}>
                            Back to Dashboard
                        </Button>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="dark:bg-gray-800 border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                        <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-sm font-medium text-green-600">+12% vs last month</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats?.totalViews || 0}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Job Views</p>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-gray-800 border-l-4 border-l-purple-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                        <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="text-sm font-medium text-green-600">+5 new this week</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats?.totalApplications || 0}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-gray-800 border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                                        <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">Active</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats?.activeJobs || 0}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Job Posts</p>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-gray-800 border-l-4 border-l-yellow-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                                        <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">Conversion</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                    {stats?.totalViews > 0 ? Math.round((stats.totalApplications / stats.totalViews) * 100) : 0}%
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">View to Apply Rate</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-gray-500" />
                                    Time to Hire
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{stats?.averageResponseTime || 'N/A'}</div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Average time to review applications</p>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Award className="h-5 w-5 text-gray-500" />
                                    Top Job Post
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{stats?.topPerformingJob || 'N/A'}</div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Most active position</p>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="h-5 w-5 text-gray-500" />
                                    This Month
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{stats?.thisMonthApplications || 0}</div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">New applications this month</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
