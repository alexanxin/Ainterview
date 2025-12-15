'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast';
import { getApplicantResponsesByCompanyId, getCompanyByUserId } from '@/lib/database';
import type { Company } from '@/types/b2b-types';
import { Star, FileText, CheckCircle, XCircle, MessageCircle, Calendar, ChevronDown, ChevronRight, Target, Briefcase } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Define a custom type for the response with nested job posts and profiles
type CompanyApplicantResponse = {
    id: string;
    applicant_user_id: string;
    job_post_id: string;
    answers: Array<{ answer: string, question: string }> | null; // Responses as array of question-answer pairs
    created_at: string;
    applicant_name: string;
    applicant_email: string;
    applicant_cv: string | null; // Added CV field
    ai_feedback: {
        overall_score?: number,
        recommended_role?: string,
        feedback?: string,
        strengths?: string[],
        weaknesses?: string[],
        grade?: string,
        technical_skills?: string,
        experience_match?: string
    } | null; // Added AI feedback field
    job_posts: {
        id: string;
        title: string;
        company_id: string;
    }[];
}

// Inner component that uses the search params
function CompanyResponsesContent() {
    const searchParams = useSearchParams();
    const [responses, setResponses] = useState<CompanyApplicantResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState<Company | null>(null);
    const [expandedCVs, setExpandedCVs] = useState<Record<string, boolean>>({});
    const [expandedApplications, setExpandedApplications] = useState<Record<string, boolean>>({}); // Track expanded applications
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'best-eval'>('newest'); // Added sorting

    // Toggle CV expansion
    const toggleCV = (responseId: string) => {
        setExpandedCVs(prev => ({
            ...prev,
            [responseId]: !prev[responseId]
        }));
    };

    // Toggle application expansion
    const toggleApplication = (responseId: string) => {
        setExpandedApplications(prev => ({
            ...prev,
            [responseId]: !prev[responseId]
        }));
    };

    // Sort responses based on selected sort order
    const sortedResponses = [...responses].sort((a, b) => {
        if (sortOrder === 'newest') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortOrder === 'oldest') {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else if (sortOrder === 'best-eval') {
            // Sort by AI feedback score if available, otherwise treat as lowest score
            const scoreA = a.ai_feedback?.overall_score || 0;
            const scoreB = b.ai_feedback?.overall_score || 0;
            return scoreB - scoreA; // Higher scores first
        }
        return 0;
    });

    const { user, loading: authLoading } = useAuth();
    const { error } = useToast();

    // Effect to handle deep linking via query param
    useEffect(() => {
        const idParam = searchParams.get('id');
        if (idParam && responses.length > 0) {
            // Only expand if we have responses loaded and the ID exists
            const targetResponse = responses.find(r => r.id === idParam);
            if (targetResponse) {
                setExpandedApplications(prev => ({
                    ...prev,
                    [idParam]: true
                }));

                // Optional: scroll to element after a slight delay to ensure render
                setTimeout(() => {
                    const element = document.getElementById(`response-${idParam}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 500);
            }
        }
    }, [searchParams, responses]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                // Get company for the user
                const userCompany = await getCompanyByUserId(user.id);
                if (!userCompany) {
                    error('Company not found. Please contact support.');
                    return;
                }

                setCompany(userCompany);

                // Get applicant responses for the company
                const responsesData = await getApplicantResponsesByCompanyId(userCompany.id);
                setResponses(responsesData);
            } catch (err) {
                console.error('Error fetching company responses:', err);
                error('Failed to load applicant responses. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, error]);

    if (authLoading || loading) {
        return (
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
                <main className="flex-1 p-4">
                    <div className="container mx-auto max-w-6xl py-8">
                        <div className="mb-8">
                            <Skeleton className="h-8 w-1/3 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>

                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="mb-6 dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Skeleton className="h-6 w-1/2 mb-2" />
                                            <Skeleton className="h-4 w-1/3" />
                                        </div>
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-5/6" />
                                </CardContent>
                            </Card>
                        ))}
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
                                    You must be logged in to view company responses.
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

    if (!company) {
        return (
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
                <main className="flex-1 p-4">
                    <div className="container mx-auto max-w-4xl py-8">
                        <Card className="dark:bg-gray-800 border-green-200 dark:border-green-90/30">
                            <CardHeader>
                                <CardTitle className="text-gray-900 dark:text-white">Company Not Found</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Your account is not associated with a company.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
            <main className="flex-1 p-4">
                <div className="container mx-auto max-w-6xl py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Applicant Responses
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            View and manage responses from candidates who applied to your job posts
                        </p>

                        {/* Sorting controls */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            <Button
                                variant={sortOrder === 'newest' ? 'default' : 'outline'}
                                onClick={() => setSortOrder('newest')}
                                className="text-xs px-3 py-1 h-8"
                            >
                                Newest First
                            </Button>
                            <Button
                                variant={sortOrder === 'oldest' ? 'default' : 'outline'}
                                onClick={() => setSortOrder('oldest')}
                                className="text-xs px-3 py-1 h-8"
                            >
                                Oldest First
                            </Button>
                            <Button
                                variant={sortOrder === 'best-eval' ? 'default' : 'outline'}
                                onClick={() => setSortOrder('best-eval')}
                                className="text-xs px-3 py-1 h-8"
                            >
                                Best Eval First
                            </Button>
                        </div>
                    </div>

                    {responses.length === 0 ? (
                        <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                            <CardContent className="text-center py-12">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    No Applicant Responses
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    You don't have any applicant responses yet. Responses will appear here when candidates apply to your job posts.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {sortedResponses.map((response) => (
                                <Card key={response.id} id={`response-${response.id}`} className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                                    <CardHeader
                                        className="border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                                        onClick={() => toggleApplication(response.id)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                {/* Applicant Name and AI Score */}
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                        {response.applicant_name || 'Anonymous Applicant'}
                                                    </h3>
                                                    {response.ai_feedback?.overall_score !== undefined && (
                                                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-20 hover:bg-yellow-200 dark:bg-yellow-90 dark:text-yellow-100 dark:border-yellow-800 text-lg px-3 py-1">
                                                            <Star className="h-4 w-4 mr-1" />
                                                            {response.ai_feedback.overall_score}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Recommended Role */}
                                                {response.ai_feedback?.recommended_role && (
                                                    <div className="mb-2">
                                                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800">
                                                            {response.ai_feedback.recommended_role}
                                                        </Badge>
                                                    </div>
                                                )}

                                                {/* Key Strengths */}
                                                {response.ai_feedback?.strengths && response.ai_feedback.strengths.length > 0 && (
                                                    <div className="mb-2">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            {response.ai_feedback.strengths.slice(0, 2).join(', ')}
                                                            {response.ai_feedback.strengths.length > 2 && '...'}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Job Title and Application Details */}
                                                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-1">
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    <span>{response.job_posts?.[0]?.title || 'Untitled Job'}</span>
                                                </div>
                                                {response.applicant_email && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {response.applicant_email}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right ml-4">
                                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-10 dark:border-blue-800">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {new Date(response.created_at).toLocaleDateString()}
                                                </Badge>
                                                <div className="text-xs text-gray-50 dark:text-gray-400 mt-1">
                                                    ID: {response.id.slice(0, 8)}...
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {expandedApplications[response.id] && (
                                        <CardContent className="p-6">
                                            {/* AI Feedback Section */}
                                            {response.ai_feedback && (
                                                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-80">
                                                    <h4 className="font-medium text-blue-900 dark:text-blue-20 mb-2 flex items-center">
                                                        <Star className="h-4 w-4 mr-2" />
                                                        AI Evaluation
                                                    </h4>
                                                    {response.ai_feedback.feedback && (
                                                        <p className="text-gray-700 dark:text-gray-300 mb-4">{response.ai_feedback.feedback}</p>
                                                    )}

                                                    {/* Technical Skills & Experience */}
                                                    {(response.ai_feedback.technical_skills || response.ai_feedback.experience_match) && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                            {response.ai_feedback.technical_skills && (
                                                                <div className="bg-white dark:bg-gray-800 p-3 rounded border border-blue-100 dark:border-blue-900">
                                                                    <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center">
                                                                        <Target className="h-3 w-3 mr-1" /> Technical Skills
                                                                    </h5>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{response.ai_feedback.technical_skills}</p>
                                                                </div>
                                                            )}
                                                            {response.ai_feedback.experience_match && (
                                                                <div className="bg-white dark:bg-gray-800 p-3 rounded border border-blue-100 dark:border-blue-900">
                                                                    <h5 className="text-sm font-semibold text-blue-80 dark:text-blue-300 mb-1 flex items-center">
                                                                        <Briefcase className="h-3 w-3 mr-1" /> Experience Match
                                                                    </h5>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{response.ai_feedback.experience_match}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {response.ai_feedback.strengths && response.ai_feedback.strengths.length > 0 && (
                                                            <div>
                                                                <span className="font-medium text-green-700 dark:text-green-300">Strengths:</span>
                                                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                                                                    {response.ai_feedback.strengths.map((strength: string, idx: number) => (
                                                                        <li key={idx}>{strength}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {response.ai_feedback.weaknesses && response.ai_feedback.weaknesses.length > 0 && (
                                                            <div>
                                                                <span className="font-medium text-red-700 dark:text-red-300">Areas for Improvement:</span>
                                                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                                                                    {response.ai_feedback.weaknesses.map((weakness: string, idx: number) => (
                                                                        <li key={idx}>{weakness}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Applicant CV Section - Collapsible */}
                                            {response.applicant_cv && (
                                                <div className="mb-4 border border-gray-20 dark:border-gray-700 rounded-lg">
                                                    <button
                                                        className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg text-left"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent toggling the application when clicking the CV button
                                                            toggleCV(response.id);
                                                        }}
                                                    >
                                                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            Applicant CV
                                                        </h4>
                                                        {expandedCVs[response.id] ? (
                                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4 text-gray-500" />
                                                        )}
                                                    </button>
                                                    {expandedCVs[response.id] && (
                                                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
                                                            <pre className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400 max-h-60 overflow-y-auto">
                                                                {response.applicant_cv}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="mb-4">
                                                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    Applicant Information
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium">Email:</span> {response.applicant_email || 'Not provided'}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                    Responses
                                                </h4>
                                                <div className="space-y-3">
                                                    {response.answers && Array.isArray(response.answers) && response.answers.length > 0 ? (
                                                        response.answers.map((answerObj, index) => (
                                                            <div key={index} className="border-l-2 border-green-500 pl-4 py-1 bg-gray-50 dark:bg-gray-700/30 rounded-r p-2">
                                                                <p className="font-medium text-gray-800 dark:text-gray-200">{answerObj.question}</p>
                                                                <p className="text-gray-600 dark:text-gray-400 mt-1">{answerObj.answer}</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-600 dark:text-gray-400 italic">
                                                            No responses available
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Main page component with Suspense boundary
export default function CompanyResponsesPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
                <main className="flex-1 p-4">
                    <div className="container mx-auto max-w-6xl py-8">
                        <div className="mb-8">
                            <div className="h-8 w-1/3 mb-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse">
                                <div className="h-6 w-1/2 mb-4 bg-gray-200 dark:bg-gray-70 rounded"></div>
                                <div className="h-4 w-full mb-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        }>
            <CompanyResponsesContent />
        </Suspense>
    );
}
