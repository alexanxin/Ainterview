'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Navigation from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast';
import { getJobPostById, createApplicantResponse, getApplicantResponseById, getUserProfile } from '@/lib/database';
import { geminiService } from '@/lib/gemini-service';

export default function JobInterviewPage() {
    const { jobPostId } = useParams();
    const [jobPost, setJobPost] = useState<Record<string, unknown> | null>(null);
    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [applicantName, setApplicantName] = useState('');
    const [applicantEmail, setApplicantEmail] = useState('');
    const [applicantCV, setApplicantCV] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [applicationId, setApplicationId] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    const router = useRouter();
    const { user, loading } = useAuth();
    const { success, error, warning, info } = useToast();

    useEffect(() => {
        // Prevent multiple API calls
        if (hasLoaded) {
            return;
        }

        const loadJobPostAndQuestions = async () => {
            try {
                if (!jobPostId) {
                    return;
                }

                const jobPostData = await getJobPostById(jobPostId as string);

                if (!jobPostData) {
                    error('Job post not found');
                    router.push('/');
                    return;
                }

                setJobPost(jobPostData as unknown as Record<string, unknown>);

                // If user is logged in, prefill some information
                if (user) {
                    setApplicantName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
                    setApplicantEmail(user.email || '');

                    // Try to get user's profile for CV
                    try {
                        const userProfile = await getUserProfile(user.id);
                        if (userProfile?.bio || userProfile?.experience || userProfile?.education || userProfile?.skills) {
                            // Build CV from profile data
                            const cvParts = [];
                            if (userProfile.bio) cvParts.push(`About: ${userProfile.bio}`);
                            if (userProfile.experience) cvParts.push(`Experience: ${userProfile.experience}`);
                            if (userProfile.education) cvParts.push(`Education: ${userProfile.education}`);
                            if (userProfile.skills) cvParts.push(`Skills: ${userProfile.skills}`);

                            setApplicantCV(cvParts.join('\n\n'));
                        }
                    } catch (profileError) {
                        console.warn('Could not load user profile for CV:', profileError);
                    }
                }

                // Generate AI questions based on job post
                const jobInfo = {
                    title: jobPostData.title,
                    description: jobPostData.description,
                    requirements: jobPostData.requirements || '',
                    responsibilities: jobPostData.responsibilities || ''
                };

                try {
                    // Generate interview questions using the gemini service
                    const generatedQuestions = await geminiService.generateInterviewFlow(
                        {
                            jobPosting: JSON.stringify(jobInfo),
                            userCv: '',
                            companyInfo: ''
                        },
                        5 // Default to 5 questions for job applications
                    );
                    setQuestions(generatedQuestions);
                    setAnswers(new Array(generatedQuestions.length).fill(''));
                } catch (geminiError) {
                    console.warn('Gemini API failed, using fallback questions:', geminiError);
                    // Set fallback questions if AI generation fails
                    setQuestions([
                        "Tell me about yourself and your background.",
                        "Why are you interested in this position?",
                        "What are your key strengths and skills?",
                        "Describe a challenging project you've worked on.",
                        "What are your career goals?"
                    ]);
                    setAnswers(new Array(5).fill(''));
                }
            } catch (err) {
                console.error('Error loading job post and questions:', err);
                error('Failed to load job interview. Please try again.');
                // Set fallback questions so the UI can continue
                setQuestions([
                    "Tell me about yourself and your background.",
                    "Why are you interested in this position?",
                    "What are your key strengths and skills?",
                    "Describe a challenging project you've worked on.",
                    "What are your career goals?"
                ]);
                setAnswers(new Array(5).fill(''));
            } finally {
                setIsLoading(false);
                setHasLoaded(true);
            }
        };

        loadJobPostAndQuestions();
    }, [jobPostId, router, hasLoaded]); // Only depend on hasLoaded to prevent re-runs

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmitApplication = async () => {
        console.log('🔄 STEP 1: Starting handleSubmitApplication');
        console.log('📊 Form data validation:', {
            applicantName: applicantName.trim(),
            applicantEmail: applicantEmail.trim(),
            hasAnswers: answers.length,
            emptyAnswers: answers.filter(a => !a.trim()).length,
            jobPostId
        });

        if (!applicantName.trim()) {
            console.log('❌ STEP 1.1: Validation failed - missing name');
            error('Please provide your name');
            return;
        }

        if (!applicantEmail.trim()) {
            console.log('❌ STEP 1.2: Validation failed - missing email');
            error('Please provide your email');
            return;
        }

        const hasEmptyAnswers = answers.some(answer => !answer.trim());
        if (hasEmptyAnswers) {
            console.log('❌ STEP 1.3: Validation failed - empty answers found');
            error('Please answer all questions before submitting');
            return;
        }

        console.log('✅ STEP 1.4: All validations passed');
        setIsSubmitting(true);

        try {
            console.log('🔄 STEP 2: Preparing applicant response data');

            // Prepare applicant response data
            const applicantResponseData = {
                applicant_email: applicantEmail.trim(),
                applicant_name: applicantName.trim(),
                applicant_cv: applicantCV.trim(),
                answers: answers.map((answer, index) => ({
                    question: questions[index],
                    answer: answer
                })),
                status: 'pending'
            };

            console.log('📋 STEP 2.1: Prepared response data:', {
                email: applicantResponseData.applicant_email,
                name: applicantResponseData.applicant_name,
                cvLength: applicantResponseData.applicant_cv.length,
                answersCount: applicantResponseData.answers.length
            });

            console.log('🔄 STEP 3: Making API call to submit application');

            // Call the API endpoint to submit the application and handle company credit deduction
            const response = await fetch(`/api/jobs/${jobPostId}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || ''  // Pass user ID if logged in
                },
                body: JSON.stringify(applicantResponseData)
            });

            console.log('🔄 STEP 3.1: API response received:', {
                status: response.status,
                ok: response.ok,
                statusText: response.statusText
            });

            const result = await response.json();
            console.log('📊 STEP 3.2: API response body:', result);

            if (response.ok && result.success) {
                console.log('✅ STEP 3.3: Application submitted successfully');
                console.log('🆔 STEP 3.4: Application ID:', result.applicationId);
                setApplicationId(result.applicationId);
                setIsComplete(true);
                success('Application submitted successfully!');
            } else {
                console.log('❌ STEP 3.5: Application submission failed:', {
                    error: result.error,
                    message: result.message
                });
                console.error('Application submission error:', result.error);
                error(result.message || 'Failed to submit application. Please try again.');
            }
        } catch (err) {
            console.log('❌ STEP 3.6: Exception during submission:', err);
            console.error('Error submitting application:', err);
            error('An error occurred while submitting your application. Please try again.');
        } finally {
            setIsSubmitting(false);
            console.log('🔄 STEP 4: Submission process complete');
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
                <Navigation />
                <main className="flex-1 p-4">
                    <div className="container mx-auto max-w-4xl py-8">
                        <div className="text-center py-12">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Preparing your AI interview...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (isComplete && applicationId) {
        return (
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
                <Navigation />
                <main className="flex-1 p-4">
                    <div className="container mx-auto max-w-3xl py-8">
                        <Card className="shadow-xl dark:bg-gray-800">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Application Submitted!
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center py-12">
                                <div className="mb-6 text-green-500 mx-auto w-16 h-16 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Thank You for Your Application
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Your AI interview responses have been submitted to {jobPost?.company_name as string}.
                                    They will review your application and contact you if selected.
                                </p>
                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left">
                                    <p className="font-medium text-blue-800 dark:text-blue-200">Application ID:</p>
                                    <p className="text-blue-700 dark:text-blue-300 font-mono break-all">{applicationId}</p>
                                </div>
                                <Button onClick={() => router.push('/')}>
                                    Continue Browsing
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    if (!jobPost || questions.length === 0) {
        return (
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
                <Navigation />
                <main className="flex-1 p-4">
                    <div className="container mx-auto max-w-4xl py-8">
                        <Card className="shadow-xl dark:bg-gray-800">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Interview Not Available
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center py-8">
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    The interview for this position is not available at the moment.
                                </p>
                                <Button onClick={() => router.push('/')}>
                                    Go to Homepage
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
            <Navigation />
            <main className="flex-1 p-4">
                <div className="container mx-auto max-w-4xl py-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            AI Interview for {jobPost.title as string}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {jobPost.company_name as string} • Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                    </div>

                    {/* Applicant Information Section */}
                    <Card className="dark:bg-gray-800 mb-6">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white">Your Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="applicantName">Full Name *</Label>
                                    <input
                                        id="applicantName"
                                        type="text"
                                        value={applicantName}
                                        onChange={(e) => setApplicantName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter your full name"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="applicantEmail">Email Address *</Label>
                                    <input
                                        id="applicantEmail"
                                        type="email"
                                        value={applicantEmail}
                                        onChange={(e) => setApplicantEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter your email"
                                        disabled={isSubmitting || !!user} // Disable if user is logged in
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="applicantCV">
                                    CV/Resume {user ? '(Auto-filled from profile)' : '(Optional)'}
                                </Label>
                                <Textarea
                                    id="applicantCV"
                                    value={applicantCV}
                                    onChange={(e) => setApplicantCV(e.target.value)}
                                    className="min-h-[100px]"
                                    placeholder={
                                        user
                                            ? "Your CV has been auto-filled from your profile. You can edit it here."
                                            : "Paste your CV/resume here (or create an account to auto-fill from your profile)"
                                    }
                                    disabled={isSubmitting}
                                />
                                {!user && (
                                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                        💡 <button
                                            onClick={() => router.push('/auth')}
                                            className="underline hover:no-underline"
                                            disabled={isSubmitting}
                                        >
                                            Create an account
                                        </button> to automatically fill your CV from your profile and get better interview results!
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Question Card */}
                    <Card className="dark:bg-gray-800 mb-6">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white">
                                Question {currentQuestionIndex + 1}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 dark:text-gray-300 mb-6">
                                {questions[currentQuestionIndex]}
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor={`answer-${currentQuestionIndex}`}>
                                    Your Answer
                                </Label>
                                <Textarea
                                    id={`answer-${currentQuestionIndex}`}
                                    value={answers[currentQuestionIndex]}
                                    onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                                    className="min-h-[120px]"
                                    placeholder="Type your answer here..."
                                    disabled={isSubmitting}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Navigation and Submit */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                            {currentQuestionIndex > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handlePreviousQuestion}
                                    disabled={isSubmitting}
                                >
                                    Previous Question
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {currentQuestionIndex < questions.length - 1 ? (
                                <Button
                                    onClick={handleNextQuestion}
                                    disabled={isSubmitting || !answers[currentQuestionIndex]?.trim()}
                                >
                                    Next Question
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmitApplication}
                                    disabled={isSubmitting}
                                    className="bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{currentQuestionIndex + 1} of {questions.length}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-600 transition-all duration-300"
                                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
