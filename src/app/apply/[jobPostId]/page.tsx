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
import { getJobPostById, getApplicantResponseById } from '@/lib/database';
import { geminiService } from '@/lib/gemini-service';

export default function JobInterviewPage() {
  const { jobPostId } = useParams();
  const [jobPost, setJobPost] = useState<any>(null);
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

  const router = useRouter();
  const { user, loading } = useAuth();
  const { success, error, warning, info } = useToast();

  useEffect(() => {
    const loadJobPostAndQuestions = async () => {
      try {
        if (!jobPostId) return;

        const jobPostData = await getJobPostById(jobPostId as string);
        if (!jobPostData) {
          error('Job post not found');
          router.push('/');
          return;
        }

        setJobPost(jobPostData);

        // If user is logged in, prefill some information
        if (user) {
          setApplicantName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
          setApplicantEmail(user.email || '');
        }

        // Generate AI questions based on job post
        // We'll use the existing geminiService to generate questions
        const jobInfo = {
          title: jobPostData.title,
          description: jobPostData.description,
          requirements: jobPostData.requirements || '',
          responsibilities: jobPostData.responsibilities || ''
        };

        // Generate interview questions using the gemini service
        // This is similar to how the existing interview flow works
        const generatedQuestions = await geminiService.generateInterviewFlow(
          {
            jobPosting: jobInfo.description,
            companyInfo: jobInfo.title,
            userCv: '' // No CV context for job application questions
          },
          5 // Default to 5 questions for job applications
        );

        setQuestions(generatedQuestions);
        setAnswers(new Array(generatedQuestions.length).fill(''));
      } catch (err) {
        console.error('Error loading job post and questions:', err);
        error('Failed to load job interview. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobPostAndQuestions();
  }, [jobPostId, router, success, error, user]);

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
    if (!applicantName.trim()) {
      error('Please provide your name');
      return;
    }

    if (!applicantEmail.trim()) {
      error('Please provide your email');
      return;
    }

    const hasEmptyAnswers = answers.some(answer => !answer.trim());
    if (hasEmptyAnswers) {
      error('Please answer all questions before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
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

      // Call the API endpoint to submit the application and handle company credit deduction
      const response = await fetch(`/api/jobs/${jobPostId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''  // Pass user ID if logged in
        },
        body: JSON.stringify(applicantResponseData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setApplicationId(result.applicationId);
        setIsComplete(true);
        success('Application submitted successfully!');
      } else {
        console.error('Application submission error:', result.error);
        error(result.message || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      error('An error occurred while submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
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
                  Your AI interview responses have been submitted to {jobPost?.company_name}.
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
              AI Interview for {jobPost.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {jobPost.company_name} • Question {currentQuestionIndex + 1} of {questions.length}
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
                <Label htmlFor="applicantCV">CV/Resume (Optional)</Label>
                <Textarea
                  id="applicantCV"
                  value={applicantCV}
                  onChange={(e) => setApplicantCV(e.target.value)}
                  className="min-h-[100px]"
                  placeholder="Paste your CV/resume here (or enter details in your profile)"
                  disabled={isSubmitting}
                />
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
