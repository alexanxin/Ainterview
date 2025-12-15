'use client';

import { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, FileText, Zap, TrendingUp, Eye, MessageSquare, Brain, Star, Target, CheckCircle } from 'lucide-react';
import { StructuredData, pageSEO } from '@/lib/seo';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast';
import { getCompanyByUserId, getTopCandidatesByCompanyId, getRecentApplicationsByCompanyId } from '@/lib/database';
import { fetchCompanyDashboardStats } from '../actions';
import type { Company } from '@/types/b2b-types';

function CompanyDashboardSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Company Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your job postings and track applicant engagement</p>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function CompanyDashboardContent() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { error } = useToast();
    const [stats, setStats] = useState<any>(null);
    const [topCandidates, setTopCandidates] = useState<any[]>([]);
    const [recentApplications, setRecentApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;

            try {
                // Get company for the user
                const company = await getCompanyByUserId(user.id);
                if (!company) {
                    router.push('/b2b/create');
                    return;
                }

                // Get dashboard stats
                const statsData = await fetchCompanyDashboardStats(company.id);
                setStats(statsData);

                // Get top candidates
                const candidatesData = await getTopCandidatesByCompanyId(company.id);
                setTopCandidates(candidatesData);

                // Get recent applications
                const applicationsData = await getRecentApplicationsByCompanyId(company.id);
                setRecentApplications(applicationsData);
            } catch (err) {
                console.error('Error fetching company dashboard stats:', err);
                error('Failed to load dashboard stats. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, error]);

    if (authLoading || loading) {
        return (
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
                <main className="flex-1 p-4">
                    <div className="container mx-auto max-w-6xl py-8">
                        <CompanyDashboardSkeleton />
                    </div>
                </main>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
                <main className="flex-1 p-4">
                    <div className="container mx-auto max-w-4xl py-8">
                        <Card className="dark:bg-gray-800 border-green-200 dark:border-green-90/30">
                            <CardHeader>
                                <CardTitle className="text-gray-900 dark:text-white">Access Denied</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    You must be logged in to view company dashboard.
                                </p>
                                <Button
                                    onClick={() => window.location.href = '/auth'}
                                    className="bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                                >
                                    Sign In
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
                <main className="flex-1 p-4">
                    <div className="container mx-auto max-w-4xl py-8">
                        <Card className="dark:bg-gray-800 border-green-200 dark:border-green-90/30">
                            <CardHeader>
                                <CardTitle className="text-gray-900 dark:text-white">Error Loading Dashboard</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    There was an issue loading your dashboard data. Please try again later.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <>
            {/* Structured Data for SEO */}
            <StructuredData config={pageSEO.dashboard} />

            <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
                <main className="flex-1 p-4">
                    <div className="container mx-auto max-w-6xl py-8">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Company Dashboard
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage your job postings and track applicant engagement
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
                            <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                                    <CardTitle className="text-gray-900 dark:text-white flex items-center">
                                        <FileText className="mr-2 h-5 w-5" />
                                        Job Postings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-3xl font-bold text-green-600">{stats.totalJobs}</p>
                                    <p className="text-gray-600 dark:text-gray-400">{stats.activeJobs} active</p>
                                    <Button
                                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => router.push('/b2b/jobs/new')}
                                    >
                                        Post New Job
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="mt-2 w-full"
                                        onClick={() => router.push('/b2b/job-posts')}
                                    >
                                        Manage Jobs
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                                    <CardTitle className="text-gray-900 dark:text-white flex items-center">
                                        <Users className="mr-2 h-5 w-5" />
                                        Applications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-3xl font-bold text-green-600">{stats.totalApplications}</p>
                                    <p className="text-gray-600 dark:text-gray-400">{stats.pendingReviews} pending review</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4 w-full"
                                        onClick={() => window.location.href = '/b2b/responses'}
                                    >
                                        Review Applications
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                                    <CardTitle className="text-gray-900 dark:text-white flex items-center">
                                        <Eye className="mr-2 h-5 w-5" />
                                        Job Views
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-3xl font-bold text-green-600">{stats.totalViews}</p>
                                    <p className="text-gray-600 dark:text-gray-400">Total views across all jobs</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4 w-full"
                                        onClick={() => window.location.href = '/b2b/analytics'}
                                    >
                                        View Analytics
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* AI Evaluation Section */}
                        <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30 mb-8">
                            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                                <CardTitle className="text-gray-900 dark:text-white flex items-center">
                                    <Brain className="mr-2 h-5 w-5" />
                                    AI Candidate Evaluation
                                </CardTitle>
                                <CardDescription>AI-powered insights on your top candidates</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {topCandidates.length > 0 ? (
                                        topCandidates.map((candidate) => (
                                            <div
                                                key={candidate.id}
                                                className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer transition-transform hover:scale-[1.02]"
                                                onClick={() => router.push(`/b2b/responses?id=${candidate.id}`)}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 truncate pr-2">{candidate.applicant_name}</h3>
                                                    <div className="flex items-center flex-shrink-0">
                                                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                                        <span className="text-sm font-bold text-blue-800 dark:text-blue-200">{candidate.ai_feedback?.overall_score || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2 truncate">
                                                    {candidate.ai_feedback?.recommended_role || candidate.job_posts?.[0]?.title || 'Applicant'}
                                                </p>
                                                <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                                                    {(candidate.ai_feedback?.strengths || []).slice(0, 2).map((strength: string, idx: number) => (
                                                        <div key={idx} className="flex items-center">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            <span className="truncate">{strength}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                                            No evaluations available yet.
                                        </div>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="w-full mt-4 col-span-full"
                                        onClick={() => window.location.href = '/b2b/evaluations'}
                                    >
                                        View All AI Evaluations
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity & Quick Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Applications */}
                            <Card className="dark:bg-gray-800">
                                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                                    <CardTitle className="text-gray-900 dark:text-white flex items-center">
                                        <MessageSquare className="mr-2 h-5 w-5" />
                                        Recent Applications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="max-h-80 overflow-y-auto pr-2">
                                        <div className="space-y-3">
                                            {recentApplications.length > 0 ? (
                                                recentApplications.map((app) => (
                                                    <div
                                                        key={app.id}
                                                        className="p-3 rounded-lg cursor-pointer transition-colors bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
                                                        onClick={() => router.push('/b2b/responses')}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="font-medium text-gray-900 dark:text-white">{app.applicant_name}</h3>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {app.job_posts?.[0]?.title || 'Job Application'} • {new Date(app.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <Badge variant={app.status === 'pending' ? 'secondary' : 'outline'}>
                                                                {app.status === 'pending' ? 'New' : 'Reviewed'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {app.ai_feedback?.overall_score ? `AI Score: ${app.ai_feedback.overall_score}/10` : 'Pending Evaluation'}
                                                            {app.ai_feedback?.strengths && app.ai_feedback.strengths.length > 0 && ` • ${app.ai_feedback.strengths[0]}`}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                    No applications received yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="dark:bg-gray-800">
                                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                                    <CardTitle className="text-gray-900 dark:text-white flex items-center">
                                        <TrendingUp className="mr-2 h-5 w-5" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <Button
                                            className="w-full justify-start bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                                            onClick={() => window.location.href = '/b2b/job-posts'}
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            Post New Job
                                        </Button>
                                        <Button
                                            className="w-full justify-start"
                                            variant="outline"
                                            onClick={() => window.location.href = '/b2b/responses'}
                                        >
                                            <Users className="mr-2 h-4 w-4" />
                                            Review Applications
                                        </Button>
                                        <Button
                                            className="w-full justify-start"
                                            variant="outline"
                                            onClick={() => window.location.href = '/b2b/credits/purchase'}
                                        >
                                            <Zap className="mr-2 h-4 w-4" />
                                            Buy Credits
                                        </Button>
                                        <Button
                                            className="w-full justify-start"
                                            variant="outline"
                                            onClick={() => window.location.href = '/b2b/analytics'}
                                        >
                                            <BarChart3 className="mr-2 h-4 w-4" />
                                            View Analytics
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Performance Insights */}
                        <div className="mt-8">
                            <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                                    <CardTitle className="text-gray-900 dark:text-white flex items-center">
                                        <TrendingUp className="mr-2 h-5 w-5" />
                                        Hiring Insights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center">
                                                <Target className="mr-2 h-4 w-4" />
                                                This Month
                                            </h3>
                                            <p className="text-2xl font-bold text-green-600 mb-1">{stats.thisMonthApplications}</p>
                                            <p className="text-sm text-green-700 dark:text-green-300">New applications</p>
                                            <Badge variant="secondary" className="mt-2">+12% from last month</Badge>
                                        </div>
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                                                <MessageSquare className="mr-2 h-4 w-4" />
                                                Response Time
                                            </h3>
                                            <p className="text-2xl font-bold text-blue-600 mb-1">{stats.averageResponseTime}</p>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">Average response</p>
                                            <Badge variant="secondary" className="mt-2">Within target</Badge>
                                        </div>
                                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                            <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center">
                                                <TrendingUp className="mr-2 h-4 w-4" />
                                                Top Performer
                                            </h3>
                                            <p className="text-lg font-bold text-purple-600 mb-1">{stats.topPerformingJob}</p>
                                            <p className="text-sm text-purple-700 dark:text-purple-300">Most applications</p>
                                            <Badge variant="secondary" className="mt-2">High demand</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

export default function CompanyDashboard() {
    return (
        <Suspense fallback={<CompanyDashboardSkeleton />}>
            <CompanyDashboardContent />
        </Suspense>
    );
}
