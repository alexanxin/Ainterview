'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast';
import { getCompanyByUserId, getApplicantResponsesByCompanyId } from '@/lib/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, StarHalf, Briefcase, FileText, CheckCircle, XCircle } from 'lucide-react';
import type { Company } from '@/types/b2b-types';

export default function CompanyEvaluations() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { error } = useToast();
    const [evaluations, setEvaluations] = useState<any[]>([]);
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

                // Fetch all responses and filter for those with AI evaluations
                const responsesData = await getApplicantResponsesByCompanyId(companyData.id);
                const evaluatedResponses = responsesData.filter(
                    r => r.ai_feedback && r.ai_feedback.overall_score
                ).sort((a, b) => (b.ai_feedback?.overall_score || 0) - (a.ai_feedback?.overall_score || 0));

                setEvaluations(evaluatedResponses);
            } catch (err) {
                console.error('Error fetching evaluations:', err);
                error('Failed to load evaluations. Please try again.');
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
                                <Star className="h-8 w-8 text-yellow-500" />
                                AI Evaluations
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Comprehensive AI-driven insights for {evaluations.length} candidates
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => router.back()}>
                            Back to Dashboard
                        </Button>
                    </div>

                    {evaluations.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Evaluations Yet</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Once candidates complete the AI interview, their detailed evaluations will appear here.
                            </p>
                            <Button onClick={() => router.push('/b2b/jobs/new')}>
                                Post a Job
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {evaluations.map((evaluation) => (
                                <Card key={evaluation.id} className="dark:bg-gray-800 hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {evaluation.applicant_name}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                    <Briefcase className="h-3 w-3" />
                                                    {evaluation.job_posts?.[0]?.title || 'Unknown Role'}
                                                </p>
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full flex items-center gap-1">
                                                <Star className="h-4 w-4 text-blue-600 dark:text-blue-400 fill-current" />
                                                <span className="font-bold text-blue-700 dark:text-blue-300">
                                                    {evaluation.ai_feedback?.overall_score}/10
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 italic border-l-4 border-blue-500">
                                                "{evaluation.ai_feedback?.feedback || 'No feedback provided.'}"
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-1 mb-2">
                                                    <CheckCircle className="h-4 w-4" /> Strengths
                                                </h4>
                                                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                    {(evaluation.ai_feedback?.strengths || []).slice(0, 3).map((s: string, i: number) => (
                                                        <li key={i} className="flex items-start gap-1">
                                                            <span className="mt-1.5 h-1 w-1 rounded-full bg-green-500 flex-shrink-0" />
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-1 mb-2">
                                                    <XCircle className="h-4 w-4" /> Weaknesses
                                                </h4>
                                                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                    {(evaluation.ai_feedback?.weaknesses || []).slice(0, 3).map((w: string, i: number) => (
                                                        <li key={i} className="flex items-start gap-1">
                                                            <span className="mt-1.5 h-1 w-1 rounded-full bg-red-500 flex-shrink-0" />
                                                            {w}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <Badge variant="outline" className="text-xs">
                                                {new Date(evaluation.created_at).toLocaleDateString()}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                                onClick={() => router.push('/b2b/responses')}
                                            >
                                                View Detailed Response <FileText className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
