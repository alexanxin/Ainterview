'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { checkCreditsBeforeOperation } from '@/lib/credit-service';
import PaymentModal from '@/components/payment-modal';
import MobileFeedbackTabs from '@/components/feedback-tabs-mobile';
import MobileFeedbackCarousel from '@/components/feedback-carousel-mobile';
import { FileText, TrendingUp, BarChart3, Copy, Check, Info, Printer } from 'lucide-react';

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

function FeedbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { success, error, info, warning } = useToast(); // Initialize toast notifications
  const [interviews, setInterviews] = useState<InterviewWithFeedback[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<InterviewWithFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentContext, setPaymentContext] = useState({
    description: '',
    requiredCredits: 0,
  });
  const [pendingPracticeOperation, setPendingPracticeOperation] = useState<{
    originalQuestion: string;
    selectedInterview: InterviewWithFeedback;
  } | null>(null);

  // Mobile tab state
  const [activeMobileTab, setActiveMobileTab] = useState<'sessions' | 'feedback' | 'insights'>('sessions');

  // Load interviews and feedback from database on component mount
  const loadInterviews = async (forceRefresh: boolean = false) => {
    console.time('loadInterviews-total');
    if (loading) return; // Wait for auth state to load
    if (!user) {
      router.push('/auth?redirect=/feedback');
      return;
    }

    // Check if we came from an interview completion - if so, force refresh
    const fromInterview = searchParams?.get('from') === 'interview';
    const now = Date.now();

    // Reduced cache timeout from 5 minutes to 30 seconds for better UX
    const CACHE_TIMEOUT = 30 * 1000; // 30 seconds

    // Force refresh if coming from interview completion or cache is stale
    if (!forceRefresh && !fromInterview && lastUpdated && (now - lastUpdated) < CACHE_TIMEOUT) {
      console.log('Using cached data, skipping reload (cache fresh)');
      return; // Data is still fresh, no need to reload
    }

    console.log(`Loading interviews - Force: ${forceRefresh}, FromInterview: ${fromInterview}, CacheAge: ${lastUpdated ? now - lastUpdated : 'never'}ms`);

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

        // Filter out sessions that have no questions and answers (empty/incomplete sessions)
        if (questions.length === 0 && answers.length === 0) {
          console.log(`Skipping empty session: ${session.id}`);
          return null; // This session will be filtered out
        }

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

      // Filter out null sessions (empty/incomplete ones)
      const validInterviews = interviewsWithFeedback.filter(interview => interview !== null);
      console.log(`Filtered to ${validInterviews.length} valid interviews from ${interviewsWithFeedback.length} total`);

      console.time('set-state-and-sort');
      setInterviews(validInterviews);

      // If we have interviews, select the most recent one
      if (validInterviews.length > 0) {
        // Sort by date descending and select the first one
        const sortedInterviews = [...validInterviews].sort((a, b) =>
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
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await loadInterviews();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, loading, router]);

  // Log component renders for performance monitoring
  useEffect(() => {
    console.timeStamp('FeedbackPage-render');
    console.log('FeedbackPage rendered');
  });

  const handlePracticeSimilarQuestionAfterPayment = async (originalQuestion: string, interview: InterviewWithFeedback) => {
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
        jobPosting: interview.jobTitle + ' ' + interview.company,
        companyInfo: interview.company,
        userCv: userCv,
      };

      // Generate a similar question based on the original question
      const similarQuestion = await geminiService.generateSimilarQuestion(
        context,
        originalQuestion
      );

      // Store the context in localStorage for the interview session
      localStorage.setItem('interviewJobPosting', interview.jobTitle + ' ' + interview.company);
      localStorage.setItem('interviewCv', userCv);
      localStorage.setItem('interviewCompanyInfo', interview.company);

      // Also store the generated similar question for the interview session
      localStorage.setItem('practiceQuestion', similarQuestion);
      localStorage.setItem('practiceMode', 'true'); // Indicate this is practice mode

      // Navigate to the interview session page
      router.push('/interview/session');
    } catch (err) {
      console.error('Error generating similar question after payment:', err);
      error('Failed to generate similar question. Please try again.');
    }
  };

  const handlePracticeSimilarQuestion = async (originalQuestion: string) => {
    if (!selectedInterview) {
      error('No interview selected');
      return;
    }

    // Start global loading state for smooth transition
    setIsLoading(true);
    localStorage.setItem('practiceLoading', 'true');

    // Store the current state for restoration after payment
    const practiceContext = {
      originalQuestion,
      selectedInterview,
      timestamp: Date.now()
    };
    localStorage.setItem('practiceContext', JSON.stringify(practiceContext));

    try {
      // Check if user has sufficient credits for re-answering a question (1 credit)
      const result = await checkCreditsBeforeOperation('reanswer_question', {
        operation: 'reanswer_question',
        numberOfQuestions: 1, // Practice similar question only costs 1 credit
      });

      if (result.sufficientCredits) {
        // User has enough credits, proceed with generating similar question
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
          localStorage.setItem('practiceLoading', 'false'); // Clear loading flag

          // Navigate to the interview session page
          router.push('/interview/session');
        } catch (err) {
          console.error('Error generating similar question:', err);
          error('Failed to generate similar question. Please try again.');
          setIsLoading(false);
          localStorage.setItem('practiceLoading', 'false');
          localStorage.removeItem('practiceContext');
        }
      } else {
        // User doesn't have enough credits, show payment modal
        setPaymentContext({
          description: `You need 1 credit to practice a similar question, but you only have ${result.currentCredits} credits.`,
          requiredCredits: result.requiredCredits,
        });
        // Store the pending operation for retry after payment
        setPendingPracticeOperation({
          originalQuestion,
          selectedInterview
        });
        setShowPaymentModal(true);
        // Keep loading state until payment is handled
      }
    } catch (err) {
      console.error('Error checking credits:', err);
      error('An error occurred while checking your credits. Please try again.');
      setIsLoading(false);
      localStorage.setItem('practiceLoading', 'false');
      localStorage.removeItem('practiceContext');
    } finally {
      // Only clear loading if we're not in payment flow
      if (!showPaymentModal) {
        setIsLoading(false);
      }
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

  // Function to copy feedback to clipboard
  const copyFeedbackToClipboard = async (item: FeedbackItem) => {
    try {
      const feedbackText = `
Question: ${item.question}

Your Answer:
${item.answer}

AI Feedback:
${item.feedback}

${item.suggestions && item.suggestions.length > 0 ? `Improvement Suggestions:
${item.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

` : ''}Rating: ${item.rating}/10

Generated on: ${new Date(item.date).toLocaleDateString()}
      `.trim();

      await navigator.clipboard.writeText(feedbackText);
      success('Feedback copied to clipboard! ✅');
    } catch (err) {
      console.error('Failed to copy feedback:', err);
      error('Failed to copy feedback. Please try again.');
    }
  };

  // Function to copy entire interview to clipboard
  const copyInterviewToClipboard = async () => {
    if (!selectedInterview) {
      error('No interview selected');
      return;
    }

    try {
      let interviewText = `INTERVIEW SESSION: ${selectedInterview.jobTitle}
Company: ${selectedInterview.company}
Date: ${new Date(selectedInterview.date).toLocaleDateString()}
Total Feedback Items: ${selectedInterview.feedbackItems.length}

${'='.repeat(80)}

`;

      selectedInterview.feedbackItems.forEach((item, index) => {
        interviewText += `QUESTION ${index + 1}:
${item.question}

YOUR ANSWER:
${item.answer}

AI FEEDBACK:
${item.feedback}

${item.suggestions && item.suggestions.length > 0 ? `IMPROVEMENT SUGGESTIONS:
${item.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

` : ''}RATING: ${item.rating}/10

${'-'.repeat(60)}

`;
      });

      interviewText += `Generated by Ainterview - Practice makes perfect!`;

      await navigator.clipboard.writeText(interviewText);
      success('Complete interview copied to clipboard! ✅');
    } catch (err) {
      console.error('Failed to copy interview:', err);
      error('Failed to copy interview. Please try again.');
    }
  };

  // Function to print interview
  const printInterview = () => {
    if (!selectedInterview) {
      error('No interview selected');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      error('Unable to open print window. Please check your popup blocker.');
      return;
    }

    const printContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${selectedInterview.jobTitle} - Interview Feedback</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #22c55e;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #16a34a;
            margin: 0 0 10px 0;
        }
        .header .meta {
            color: #666;
            font-size: 14px;
        }
        .question {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .question h3 {
            color: #1f2937;
            margin: 0 0 15px 0;
            border-left: 4px solid #22c55e;
            padding-left: 15px;
        }
        .answer, .feedback, .suggestions {
            margin-bottom: 15px;
        }
        .answer h4, .feedback h4, .suggestions h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: bold;
        }
        .answer {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #64748b;
        }
        .feedback {
            background: #f0fdf4;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #22c55e;
        }
        .suggestions {
            background: #eff6ff;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .suggestions ul {
            margin: 0;
            padding-left: 20px;
        }
        .rating {
            background: #fef3c7;
            color: #92400e;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            display: inline-block;
            margin-top: 10px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        @media print {
            body { margin: 0; }
            .question { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${selectedInterview.jobTitle.replace(/'/g, '&#39;')}</h1>
        <div class="meta">
            <strong>Company:</strong> ${selectedInterview.company.replace(/'/g, '&#39;')}<br>
            <strong>Date:</strong> ${new Date(selectedInterview.date).toLocaleDateString()}<br>
            <strong>Feedback Items:</strong> ${selectedInterview.feedbackItems.length}
        </div>
    </div>

    ${selectedInterview.feedbackItems.map((item, index) => `
    <div class="question">
        <h3>Question ${index + 1}: ${item.question}</h3>

        <div class="answer">
            <h4>Your Answer:</h4>
            <p>${item.answer.replace(/\n/g, '<br>')}</p>
        </div>

        <div class="feedback">
            <h4>AI Feedback:</h4>
            <p>${item.feedback.replace(/\n/g, '<br>')}</p>
        </div>

        ${item.suggestions && item.suggestions.length > 0 ? `
        <div class="suggestions">
            <h4>Improvement Suggestions:</h4>
            <ul>
                ${item.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        <div class="rating">Rating: ${item.rating}/10</div>
    </div>
    `).join('')}

    <div class="footer">
        Generated by Ainterview - Practice makes perfect!<br>
        Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
    </div>
</body>
</html>`;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
    };
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
      <main className="flex-1 p-4 relative z-10 lg:pb-0 pb-16">
        <div className="container mx-auto max-w-6xl py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Interview <span className="text-green-600">Feedback</span> & Insights
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Review and analyze feedback from your interview sessions to improve performance
            </p>
          </div>

          {/* Desktop Layout (lg and up) */}
          <div className="hidden lg:flex lg:flex-row gap-6">
            {/* Left sidebar: List of interviews */}
            <div className="w-1/3">
              <Card className="dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 h-full shadow-lg flex flex-col">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-gray-900 dark:text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2">📋</span>
                      Your Interview Sessions
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshData}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      🔄
                    </Button>
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
            <div className="w-2/3">
              <Card className="dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 h-full shadow-lg flex flex-col">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-gray-900 dark:text-white flex items-center">
                        <span className="mr-2">📊</span>
                        {selectedInterview
                          ? `${selectedInterview.feedbackItems.length} Feedback Items`
                          : 'Select an Interview Session'}
                      </CardTitle>
                      {selectedInterview && (
                        <div className="flex items-center gap-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyInterviewToClipboard}
                            title="Copy entire interview"
                            className="px-1"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={printInterview}
                            title="Print interview"
                            className="px-1"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
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
                                <div className="flex-shrink-0 flex items-center gap-1">
                                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.rating >= 8
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : item.rating >= 6
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }`}>
                                    {item.rating}/10
                                  </span>
                                  <span
                                    title="Our AI compares your keywords against the job description using semantic analysis."
                                  >
                                    <Info
                                      className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help"
                                    />
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

                              <div className="mt-6 flex justify-end items-center">
                                <Button
                                  className="bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90"
                                  onClick={() => handlePracticeSimilarQuestion(item.question)}
                                  disabled={isLoading}
                                >
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
          </div >

          {/* Mobile Layout */}
          < div className="lg:hidden" >
            {/* Sessions Tab */}
            {
              activeMobileTab === 'sessions' && (
                <div className="space-y-6">
                  <Card className="dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                      <CardTitle className="text-gray-900 dark:text-white flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-5 w-5" />
                          Your Interview Sessions
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refreshData}
                          disabled={isLoading}
                          className="text-xs"
                        >
                          🔄
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 max-h-[500px] overflow-y-auto">
                      {interviews.length > 0 ? (
                        <div className="space-y-4">
                          {interviews.map((interview) => (
                            <div
                              key={interview.id}
                              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${selectedInterview?.id === interview.id
                                ? 'bg-gradient-to-r from-green-100 to-lime-100 dark:from-green-900/30 dark:to-lime-900/30 border border-green-300 dark:border-green-700 shadow-sm'
                                : 'bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                                }`}
                              onClick={() => {
                                setSelectedInterview(interview);
                                setActiveMobileTab('feedback');
                              }}
                            >
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {interview.jobTitle}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                                <span className="mr-2">🏢</span>
                                {interview.company} • {new Date(interview.date).toLocaleDateString()}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
                                  {interview.feedbackItems.length} items
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
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
              )
            }

            {/* Feedback Tab */}
            {
              activeMobileTab === 'feedback' && (
                <div className="space-y-6">
                  {selectedInterview ? (
                    <MobileFeedbackCarousel
                      feedbackItems={selectedInterview.feedbackItems}
                      onPracticeClick={handlePracticeSimilarQuestion}
                    />
                  ) : (
                    <Card className="dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Select a session from the Sessions tab to view feedback.</p>
                        <Button onClick={() => setActiveMobileTab('sessions')}>
                          Go to Sessions
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )
            }

            {/* Insights Tab */}
            {
              activeMobileTab === 'insights' && (
                <div className="space-y-6">
                  <Card className="dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                      <CardTitle className="text-gray-900 dark:text-white flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Performance Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">🎯 Overall Progress</h3>
                            <p className="text-green-700 dark:text-green-300 text-sm">
                              You've completed {interviews.length} interview{interviews.length !== 1 ? 's' : ''} with an average rating of {
                                interviews.length > 0 ? (interviews.reduce((sum, interview) =>
                                  sum + interview.feedbackItems.reduce((itemSum, item) => itemSum + item.rating, 0) / interview.feedbackItems.length || 0, 0
                                ) / interviews.length).toFixed(1) : '0'
                              }/10 across {interviews.reduce((sum, interview) => sum + interview.feedbackItems.length, 0)} questions.
                            </p>
                          </div>

                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📈 Improvement Areas</h3>
                            <p className="text-blue-700 dark:text-blue-300 text-sm">
                              Focus on behavioral questions and providing specific examples in your answers. Practice consistently to improve your overall confidence score.
                            </p>
                          </div>

                          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                            <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🏆 Achievement</h3>
                            <p className="text-purple-700 dark:text-purple-300 text-sm">
                              Great job on completing your practice sessions! Regular practice with AI feedback is the most effective way to improve your interview performance.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            }
          </div >
        </div >
      </main >

      {/* Mobile Tabs */}
      < MobileFeedbackTabs
        activeTab={activeMobileTab}
        onTabChange={setActiveMobileTab}
      />

      {/* Payment Modal */}
      < PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPendingPracticeOperation(null); // Clear pending operation on cancel
          setIsLoading(false); // Reset loading state
          localStorage.setItem('practiceLoading', 'false'); // Clear loading flag
          localStorage.removeItem('practiceContext'); // Clean up practice context
        }
        }
        paymentContext={paymentContext}
        onSuccess={() => {
          // After successful payment, retry the pending operation
          setShowPaymentModal(false);

          if (pendingPracticeOperation) {
            // Retry the practice question generation
            const { originalQuestion, selectedInterview } = pendingPracticeOperation;
            setPendingPracticeOperation(null); // Clear the pending operation
            localStorage.setItem('practiceLoading', 'true'); // Restore loading state

            // Use setTimeout to ensure the modal closes first
            setTimeout(async () => {
              try {
                await handlePracticeSimilarQuestionAfterPayment(originalQuestion, selectedInterview);
              } finally {
                setIsLoading(false);
              }
            }, 100);
          } else {
            // Check if we have a stored practice context from navigation
            const practiceContext = localStorage.getItem('practiceContext');
            if (practiceContext) {
              const { originalQuestion, selectedInterview } = JSON.parse(practiceContext);
              setIsLoading(true);
              localStorage.setItem('practiceLoading', 'true');

              setTimeout(async () => {
                try {
                  await handlePracticeSimilarQuestionAfterPayment(originalQuestion, selectedInterview);
                } finally {
                  setIsLoading(false);
                }
              }, 100);
            } else {
              // Fallback - just show success message
              success('Payment successful! You can now continue using the service.');
            }
          }
        }}
      />
    </div >
  );
}

// Wrapper component that handles the Suspense boundary
export default function FeedbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
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
    }>
      <FeedbackPageContent />
    </Suspense>
  );
}
