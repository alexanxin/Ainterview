'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getInterviewSessionsByUser,
  getQuestionsBySession,
  getAnswersBySession,
  InterviewSession,
  InterviewQuestion,
  InterviewAnswer
} from '@/lib/database';

interface FeedbackItem {
  id: string;
  question: string;
  answer: string;
  feedback: string;
  suggestions: string[];
  rating: number;
  date: string;
}

interface InterviewWithFeedback {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  feedbackItems: FeedbackItem[];
}

export default function FeedbackPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [interviews, setInterviews] = useState<InterviewWithFeedback[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<InterviewWithFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load interviews and feedback from database on component mount
  useEffect(() => {
    if (loading) return; // Wait for auth state to load
    if (!user) {
      router.push('/auth?redirect=/feedback');
      return;
    }

    const loadInterviews = async () => {
      setIsLoading(true);
      try {
        // Get all interview sessions for the user
        const sessions = await getInterviewSessionsByUser(user.id);

        if (sessions.length === 0) {
          setInterviews([]);
          setSelectedInterview(null);
          setIsLoading(false);
          return;
        }

        const interviewsWithFeedback: InterviewWithFeedback[] = [];

        // Process each session to get its questions and answers
        for (const session of sessions) {
          // Get questions for this session
          const questions = await getQuestionsBySession(session.id!);

          // Get answers for this session
          const answers = await getAnswersBySession(session.id!);

          // Match questions with answers to create feedback items
          const feedbackItems: FeedbackItem[] = [];

          for (const question of questions) {
            // Find the corresponding answer for this question
            const answer = answers.find(a => a.question_id === question.id);

            if (answer) {
              // Check if this is generic feedback indicating an issue
              const isGenericFeedback = answer.ai_feedback === 'Answer received. Consider adding more specific examples to strengthen your response.';

              feedbackItems.push({
                id: answer.id || `answer_${Date.now()}_${Math.random()}`,
                question: question.question_text,
                answer: answer.user_answer,
                feedback: answer.ai_feedback && !isGenericFeedback ? answer.ai_feedback : 'No feedback provided',
                suggestions: answer.improvement_suggestions || [],
                rating: answer.rating || 0,
                date: session.created_at || new Date().toISOString()
              });
            }
          }

          // Create interview object with feedback
          const interview: InterviewWithFeedback = {
            id: session.id!,
            jobTitle: session.title || 'Interview Practice',
            company: extractCompanyName(session.job_posting) || 'Practice Session',
            date: session.created_at || new Date().toISOString(),
            feedbackItems
          };

          interviewsWithFeedback.push(interview);
        }

        setInterviews(interviewsWithFeedback);

        // If we have interviews, select the most recent one
        if (interviewsWithFeedback.length > 0) {
          // Sort by date descending and select the first one
          const sortedInterviews = [...interviewsWithFeedback].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setInterviews(sortedInterviews);
          setSelectedInterview(sortedInterviews[0]);
        }
      } catch (error) {
        console.error('Error loading interviews:', error);
        setInterviews([]);
        setSelectedInterview(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadInterviews();
  }, [user, loading, router]);

  // Helper function to extract company name from job posting
  const extractCompanyName = (jobPosting: string): string => {
    // Look for patterns like "at CompanyName" or "Company Name"
    const companyMatch = jobPosting?.match(/at ([^,\n]+)|Company:\s*([^\n]+)|([A-Z][A-Za-z\s]+)\n/i);
    if (companyMatch && (companyMatch[1] || companyMatch[2] || companyMatch[3])) {
      return (companyMatch[1] || companyMatch[2] || companyMatch[3]).trim();
    }
    return 'Practice Session';
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
        <Navigation />
        <main className="flex-1 p-4">
          <div className="container mx-auto max-w-6xl py-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Loading your interview feedback...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
      <Navigation />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-6xl py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Interview Feedback & Insights
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Review feedback from your interview sessions
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left sidebar: List of interviews */}
            <div className="lg:w-1/3">
              <Card className="dark:bg-gray-800 h-full">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Your Interview Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {interviews.length > 0 ? (
                    <div className="space-y-3">
                      {interviews.map((interview) => (
                        <div
                          key={interview.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedInterview?.id === interview.id
                            ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                            : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          onClick={() => setSelectedInterview(interview)}
                        >
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {interview.jobTitle}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {interview.company} • {new Date(interview.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {interview.feedbackItems.length} feedback items
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No interview sessions yet. Complete an interview to see feedback.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right panel: Feedback details for selected interview */}
            <div className="lg:w-2/3">
              <Card className="dark:bg-gray-800 h-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-gray-900 dark:text-white">
                      {selectedInterview
                        ? `${selectedInterview.feedbackItems.length} Feedback Items`
                        : 'Select an Interview Session'}
                    </CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/interview')}
                      className="bg-gradient-to-r from-green-100 to-lime-100 text-gray-900"
                    >
                      New Interview
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedInterview ? (
                    <div className="space-y-6">
                      {selectedInterview.feedbackItems.length > 0 ? (
                        selectedInterview.feedbackItems.map((item) => (
                          <Card key={item.id} className="dark:bg-gray-700">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-gray-900 dark:text-white text-base">
                                  {item.question}
                                </CardTitle>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.rating >= 8
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : item.rating >= 6
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-30'
                                    }`}>
                                    Rating: {item.rating}/10
                                  </span>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Answer:</h4>
                                  <p className="text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-600/50 p-3 rounded-md">
                                    {item.answer}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">AI Feedback:</h4>
                                  <p className="text-gray-900 dark:text-gray-200 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                                    {item.feedback}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Improvement Suggestions:</h4>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {item.suggestions.map((suggestion, idx) => (
                                      <li key={idx} className="text-gray-900 dark:text-gray-200">
                                        {suggestion}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div className="mt-4 flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/interview/session`)}
                                >
                                  Practice Similar Question
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                              No Feedback Available
                            </h3>
                            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                              There was an issue generating AI feedback for this interview session.
                              The AI may not have processed your answers properly.
                            </p>
                            <Button
                              variant="outline"
                              onClick={() => router.push('/interview')}
                            >
                              Start New Interview
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <p>Select an interview session to view detailed feedback.</p>
                      <Button
                        className="mt-4 bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                        onClick={() => router.push('/interview')}
                      >
                        Start Interview
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}