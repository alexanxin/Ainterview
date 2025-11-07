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
import { geminiService } from '@/lib/gemini-service';
import { useToast } from '@/lib/toast';
import { getUserProfile } from '@/lib/database';

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
  const { success, error, info, warning } = useToast(); // Initialize toast notifications
  const [interviews, setInterviews] = useState<InterviewWithFeedback[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<InterviewWithFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Load interviews and feedback from database on component mount
  const loadInterviews = async (forceRefresh: boolean = false) => {
    console.time('loadInterviews-total');
    if (loading) return; // Wait for auth state to load
    if (!user) {
      router.push('/auth?redirect=/feedback');
      return;
    }

    // Check if we have recent data (less than 5 minutes old) and not forcing refresh
    const now = Date.now();
    if (!forceRefresh && lastUpdated && (now - lastUpdated) < 5 * 60 * 1000) { // 5 minutes in milliseconds
      console.log('Using cached data, skipping reload');
      return; // Data is still fresh, no need to reload
    }

    setIsLoading(true);
    try {
      console.time('getInterviewSessionsByUser');
      // Get all interview sessions for the user
      const sessions = await getInterviewSessionsByUser(user.id);
      console.timeEnd('getInterviewSessionsByUser');
      console.log(`Found ${sessions.length} sessions`);

      if (sessions.length === 0) {
        setInterviews([]);
        setSelectedInterview(null);
        setIsLoading(false);
        setLastUpdated(now); // Update the last updated time
        return;
      }

      console.time('process-sessions-loop');

      // Parallelize API calls for all sessions
      const sessionPromises = sessions.map(async (session) => {
        console.time(`session-${session.id}-apis`);
        // Get questions and answers for this session in parallel
        const [questions, answers] = await Promise.all([
          getQuestionsBySession(session.id!),
          getAnswersBySession(session.id!)
        ]);
        console.timeEnd(`session-${session.id}-apis`);
        console.log(`Session ${session.id}: ${questions.length} questions, ${answers.length} answers`);

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

        return interview;
      });

      // Wait for all sessions to be processed in parallel
      const interviewsWithFeedback = await Promise.all(sessionPromises);
      console.timeEnd('process-sessions-loop');

      console.time('set-state-and-sort');
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
      console.timeEnd('set-state-and-sort');

      setLastUpdated(now); // Update the last updated time
      console.timeEnd('loadInterviews-total');
    } catch (error) {
      console.error('Error loading interviews:', error);
      setInterviews([]);
      setSelectedInterview(null);
      console.timeEnd('loadInterviews-total');
    } finally {
      setIsLoading(false);
    }
  };

  // Load interviews on component mount
  useEffect(() => {
    loadInterviews();
  }, [user, loading, router]);

  // Log component renders for performance monitoring
  useEffect(() => {
    console.timeStamp('FeedbackPage-render');
    console.log('FeedbackPage rendered');
  });

  const handlePracticeSimilarQuestion = async (originalQuestion: string) => {
    if (!selectedInterview) {
      error('No interview selected');
      return;
    }

    setIsLoading(true);

    try {
      // Get the user's profile to get CV information
      let userCv = '';
      if (user) {
        const profile = await getUserProfile(user.id);
        if (profile) {
          const sections = [];
          if (profile.bio) sections.push(`Bio:\n${profile.bio}`);
          if (profile.experience) sections.push(`Experience:\n${profile.experience}`);
          if (profile.education) sections.push(`Education:\n${profile.education}`);
          if (profile.skills) sections.push(`Skills:\n${profile.skills}`);
          userCv = sections.join('\n\n');
        }
      }

      // Get the context from the selected interview
      const context = {
        jobPosting: selectedInterview.jobTitle + ' ' + selectedInterview.company,
        companyInfo: selectedInterview.company,
        userCv: userCv,
      };

      // Generate a similar question based on the original question
      const similarQuestion = await geminiService.generateSimilarQuestion(
        context,
        originalQuestion
      );

      // Store the context in localStorage for the interview session
      localStorage.setItem('interviewJobPosting', selectedInterview.jobTitle + ' ' + selectedInterview.company);
      localStorage.setItem('interviewCv', userCv);
      localStorage.setItem('interviewCompanyInfo', selectedInterview.company);

      // Also store the generated similar question for the interview session
      localStorage.setItem('practiceQuestion', similarQuestion);
      localStorage.setItem('practiceMode', 'true'); // Indicate this is practice mode

      // Navigate to the interview session page
      router.push('/interview/session');
    } catch (err) {
      console.error('Error generating similar question:', err);
      error('Failed to generate similar question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to manually refresh the data (e.g., after completing an interview)
  const refreshData = async () => {
    await loadInterviews(true); // Force refresh
  };

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
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 right-[-100px] w-3/4 h-full bg-gradient-to-l from-green-500/30 via-lime-400/25 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s]"></div>
          <div className="absolute -top-1/3 right-[-60px] w-1/2 h-3/4 bg-gradient-to-l from-lime-500/20 via-green-400/20 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s] delay-1000"></div>
        </div>

        <Navigation />
        <main className="flex-1 p-4 relative z-10">
          <div className="container mx-auto max-w-6xl py-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
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
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 right-[-100px] w-3/4 h-full bg-gradient-to-l from-green-500/30 via-lime-400/25 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s]"></div>
        <div className="absolute -top-1/3 right-[-60px] w-1/2 h-3/4 bg-gradient-to-l from-lime-500/20 via-green-400/20 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s] delay-1000"></div>
      </div>

      <Navigation />
      <main className="flex-1 p-4 relative z-10">
        <div className="container mx-auto max-w-6xl py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Interview <span className="text-green-600">Feedback</span> & Insights
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Review and analyze feedback from your interview sessions to improve performance
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left sidebar: List of interviews */}
            <div className="lg:w-1/3">
              <Card className="dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 h-full shadow-lg flex flex-col">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-gray-900 dark:text-white flex items-center">
                    <span className="mr-2">📋</span>
                    Your Interview Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex-1 overflow-y-auto max-h-[600px]">
                  {interviews.length > 0 ? (
                    <div className="space-y-3 overflow-y-auto pr-2">
                      {interviews.map((interview) => (
                        <div
                          key={interview.id}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${selectedInterview?.id === interview.id
                            ? 'bg-gradient-to-r from-green-100 to-lime-100 dark:from-green-900/30 dark:to-lime-900/30 border border-green-300 dark:border-green-700 shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                            }`}
                          onClick={() => setSelectedInterview(interview)}
                        >
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {interview.jobTitle}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                            <span className="mr-2">🏢</span>
                            {interview.company} • {new Date(interview.date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
                              {interview.feedbackItems.length} items
                            </span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              {interview.feedbackItems.length > 0 ? 'Completed' : 'No feedback'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">No interview sessions yet.</p>
                        <Button
                          onClick={() => router.push('/interview')}
                        >
                          Start Interview Practice
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right panel: Feedback details for selected interview */}
            <div className="lg:w-2/3">
              <Card className="dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 h-full shadow-lg flex flex-col">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-gray-900 dark:text-white flex items-center">
                      <span className="mr-2">📊</span>
                      {selectedInterview
                        ? `${selectedInterview.feedbackItems.length} Feedback Items`
                        : 'Select an Interview Session'}
                    </CardTitle>
                    <Button
                      className="bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90"
                      onClick={() => router.push('/interview')}
                    >
                      <span className="mr-2">➕</span>
                      New Interview
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex-1 overflow-y-auto max-h-[600px]">
                  {selectedInterview ? (
                    <div className="space-y-6">
                      {selectedInterview.feedbackItems.length > 0 ? (
                        selectedInterview.feedbackItems.map((item) => (
                          <Card key={item.id} className="dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 mr-4">
                                  <CardTitle className="text-gray-900 dark:text-white text-lg flex items-center">
                                    <span className="mr-2">❓</span>
                                    {item.question}
                                  </CardTitle>
                                </div>
                                <div className="flex-shrink-0 flex items-center">
                                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.rating >= 8
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : item.rating >= 6
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }`}>
                                    {item.rating}/10
                                  </span>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-6">
                              <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                                  <div className="flex items-center mb-2">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-lg mr-2">
                                      Your Answer
                                    </span>
                                    <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-600 dark:to-transparent"></div>
                                  </div>
                                  <p className="text-gray-900 dark:text-gray-200">
                                    {item.answer}
                                  </p>
                                </div>

                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                                  <div className="flex items-center mb-2">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 bg-green-200 dark:bg-green-800 px-3 py-1 rounded-lg mr-2">
                                      AI Feedback
                                    </span>
                                    <div className="h-px flex-1 bg-gradient-to-r from-green-200 to-transparent dark:from-green-800 dark:to-transparent"></div>
                                  </div>
                                  <p className="text-gray-900 dark:text-gray-200">
                                    {item.feedback}
                                  </p>
                                </div>

                                {item.suggestions && item.suggestions.length > 0 && (
                                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                                    <div className="flex items-center mb-2">
                                      <span className="font-semibold text-gray-700 dark:text-gray-300 bg-blue-200 dark:bg-blue-800 px-3 py-1 rounded-lg mr-2">
                                        Improvement Suggestions
                                      </span>
                                      <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800 dark:to-transparent"></div>
                                    </div>
                                    <ul className="space-y-2">
                                      {item.suggestions.map((suggestion, idx) => (
                                        <li key={idx} className="flex items-start">
                                          <span className="mr-2 text-blue-500 dark:text-blue-400">•</span>
                                          <span className="text-gray-900 dark:text-gray-200">{suggestion}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              <div className="mt-6 flex justify-end">
                                <Button
                                  className="bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90"
                                  onClick={() => handlePracticeSimilarQuestion(item.question)}
                                  disabled={isLoading}
                                >
                                  <span className="mr-2">🔄</span>
                                  {isLoading ? 'Generating...' : 'Practice Similar Question'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 max-w-md mx-auto">
                            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                              No Feedback Available
                            </h3>
                            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                              There was an issue generating AI feedback for this interview session.
                              The AI may not have processed your answers properly.
                            </p>
                            <Button
                              onClick={() => router.push('/interview')}
                              className="bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90"
                            >
                              Start New Interview
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-600 max-w-md mx-auto">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Select an interview session to view detailed feedback.</p>
                        <Button
                          onClick={() => router.push('/interview')}
                          className="bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90"
                        >
                          Start Interview
                        </Button>
                      </div>
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