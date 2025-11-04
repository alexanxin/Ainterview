'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import { geminiService, InterviewContext } from '@/lib/gemini-service';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast';
import { InterviewSession, InterviewQuestion, InterviewAnswer } from '@/lib/database';
import { cacheRefreshService } from '@/lib/cache-refresh-service';

// API functions using the server-side endpoint to ensure proper permissions
const createInterviewSession = async (sessionData: Omit<InterviewSession, "id" | "created_at" | "updated_at">) => {
  try {
    const response = await fetch('/api/interview/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createSession',
        ...sessionData
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create interview session');
    }

    const result = await response.json();
    return result.session;
  } catch (error) {
    return null;
  }
};

const createInterviewQuestion = async (questionData: Omit<InterviewQuestion, "id" | "created_at">) => {
  try {
    const response = await fetch('/api/interview/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createQuestion',
        ...questionData
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create interview question');
    }

    const result = await response.json();
    return result.question;
  } catch (error) {
    return null;
  }
};

const createInterviewAnswer = async (answerData: Omit<InterviewAnswer, "id" | "created_at">) => {
  try {
    const response = await fetch('/api/interview/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createAnswer',
        ...answerData
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create interview answer');
    }

    const result = await response.json();
    return result.answer;
  } catch (error) {
    return null;
  }
};

const updateInterviewSession = async (sessionId: string, sessionData: Partial<InterviewSession>) => {
  try {
    const response = await fetch('/api/interview/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateSession',
        session_id: sessionId,
        ...sessionData
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update interview session');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    return false;
  }
};

// The InterviewQuestion interface is now imported from database.ts

// Function to get questions using the server-side API endpoint
const getQuestionBySessionAndNumber = async (sessionId: string, questionNumber: number): Promise<InterviewQuestion | null> => {
  try {
    const response = await fetch(`/api/interview/session?action=getQuestionBySessionAndNumber&sessionId=${sessionId}&questionNumber=${questionNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get interview question');
    }

    const result = await response.json();
    return result.question as InterviewQuestion | null;
  } catch (error) {
    return null;
  }
};

export default function InterviewSessionPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewContext, setInterviewContext] = useState<InterviewContext | null>(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [interviewSessionId, setInterviewSessionId] = useState<string | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false); // Track if this is practice mode
  const [practiceQuestion, setPracticeQuestion] = useState<string | null>(null); // Store the practice question
  const [isContextLoading, setIsContextLoading] = useState(true); // Track if context is being loaded
  const router = useRouter();
  const { user, loading } = useAuth(); // Get user and loading state from auth context
  const { success, error, info, warning } = useToast(); // Initialize toast notifications

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?redirect=/interview/session');
    }
  }, [user, loading, router]);

  // Load initial data and manage interview flow
  useEffect(() => {
    // Check if this is practice mode
    const practiceMode = localStorage.getItem('practiceMode');
    const practiceQuestion = localStorage.getItem('practiceQuestion');

    if (practiceMode === 'true' && practiceQuestion) {
      setIsPracticeMode(true);
      setPracticeQuestion(practiceQuestion);
    } else {
      // Ensure practice mode is false if not set
      setIsPracticeMode(false);
    }

    // Load interview context from localStorage (for both normal and practice modes)
    const jobPosting = localStorage.getItem('interviewJobPosting');
    const cv = localStorage.getItem('interviewCv');
    const companyInfo = localStorage.getItem('interviewCompanyInfo');

    if (jobPosting && cv) {
      const context = {
        jobPosting,
        userCv: cv,
        companyInfo: companyInfo || 'Company information'
      };
      setInterviewContext(context);
    } else {
      // Set to null if not available to ensure consistent state
      setInterviewContext(null);
    }
    setIsContextLoading(false); // Set loading to false after context is loaded
  }, []);

  // Show loading state while checking auth or loading context
  if (loading || isContextLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
        <Navigation />
        <main className="flex-1 p-4">
          <div className="container mx-auto max-w-2xl py-8">
            <Card className="shadow-xl dark:bg-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Interview Session
                </CardTitle>
                <Progress value={0} className="h-2 mt-4" />
              </CardHeader>
              <CardContent className="flex flex-col items-center py-12">
                <div className="mb-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {isContextLoading ? 'Loading interview context...' : 'Loading interview session...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }





  const startInterview = async () => {
    // Check if context is available first
    if (!interviewContext) {
      error('Interview context not available. Please return to the interview setup page.');
      return;
    }

    // Don't start if already started or questions are being generated
    if (interviewStarted || isGeneratingQuestions) {
      return;
    }

    setIsLoading(true);
    setInterviewStarted(true);

    try {
      if (isPracticeMode && practiceQuestion) {
        // In practice mode, we still need to create a session record for proper data tracking
        if (user?.id) {
          const sessionData = {
            user_id: user.id,
            job_posting: interviewContext.jobPosting,
            company_info: interviewContext.companyInfo,
            user_cv: interviewContext.userCv,
            title: 'Practice Question Session',
            total_questions: 1 // Just one practice question
          };

          const session = await createInterviewSession(sessionData);

          if (session && session.id) {
            setInterviewSessionId(session.id);
          } else {
            error('Failed to create practice session. Please try again.');
            setInterviewStarted(false);
            setIsLoading(false); // Reset loading state
            return;
          }
        }

        // Set the single practice question
        setQuestions([practiceQuestion]);
        setQuestion(practiceQuestion);

        // Create the question record in the database
        if (interviewSessionId) {
          const questionData = {
            session_id: interviewSessionId,
            question_text: practiceQuestion,
            question_number: 1
          };

          try {
            const result = await createInterviewQuestion(questionData);
            if (!result) {
              console.error('Failed to create practice question in database');
            }
          } catch (err) {
            console.error('Error creating practice question:', err);
          }
        }
      } else {
        // Create an interview session in the database for normal mode
        if (user?.id) {
          const sessionData = {
            user_id: user.id,
            job_posting: interviewContext.jobPosting,
            company_info: interviewContext.companyInfo,
            user_cv: interviewContext.userCv,
            title: extractJobTitle(interviewContext.jobPosting),
            total_questions: 5 // We're generating 5 questions
          };

          const session = await createInterviewSession(sessionData);

          if (session && session.id) {
            setInterviewSessionId(session.id);
          } else {
            error('Failed to create interview session. Please try again.');
            setInterviewStarted(false);
            setIsLoading(false); // Reset loading state
            return;
          }
        }

        // Generate the interview flow using Gemini API for normal mode
        setIsGeneratingQuestions(true); // Set the flag to show skeleton loader immediately
        await generateInterviewFlow();
      }
    } catch (err) {
      error('Failed to start interview. Please try again.');
      setInterviewStarted(false);
      setIsGeneratingQuestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInterviewFlow = async () => {
    if (!interviewContext) return;

    try {
      setIsLoading(true);
      const generatedQuestions = await geminiService.generateInterviewFlow(
        interviewContext,
        5, // Generate 5 questions for the interview
        user?.id // Pass user ID for usage tracking
      );
      setQuestions(generatedQuestions);

      // Store questions in the database if we have a session ID
      if (interviewSessionId && generatedQuestions.length > 0) {
        // Use Promise.all for better performance, but with individual error handling
        const questionPromises = generatedQuestions.map(async (questionText, i) => {
          const questionData = {
            session_id: interviewSessionId,
            question_text: questionText,
            question_number: i + 1
          };

          try {
            const result = await createInterviewQuestion(questionData);
            return result;
          } catch (err) {
            return null;
          }
        });

        const results = await Promise.all(questionPromises);

        // Check if all questions were created successfully
        const successfulCreations = results.filter(result => result !== null);
      }
    } catch (err) {
      if (err instanceof Error && (err.message?.includes('Free quota exceeded') || (err as { status?: number }).status === 402)) {
        // Handle payment required case
        error('You\'ve reached your free usage limit. Please purchase credits to continue.');
        // In a real app, redirect to payment page
        router.push('/dashboard');
      } else if (err instanceof Error && (err.message?.includes('Rate limit exceeded') || (err as { status?: number }).status === 429)) {
        // Handle rate limit exceeded case
        error('Too many requests. Please wait before trying again.');
        // Optionally show a retry button or wait before retrying
        setTimeout(() => {
          generateInterviewFlow(); // Attempt to retry after a delay
        }, 300); // Retry after 30 seconds
      } else {
        // Fallback to mock questions if API fails
        setQuestions([
          'Tell me about yourself and why you\'re interested in this position.',
          'Can you describe a challenging project you worked on and how you handled it?',
          'How do you stay updated with industry trends and technologies?',
          'Describe a time when you had to work with a difficult team member.',
          'Do you have any questions for me about the role or company?'
        ]);
      }
    } finally {
      setIsLoading(false);
      setIsGeneratingQuestions(false); // Reset the flag when done
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      error('Please provide an answer before continuing');
      return;
    }

    // Store the answer locally but don't send to API yet
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);

    // In practice mode, there's only one question, so complete immediately
    if (isPracticeMode) {
      // Show notification about processing wait time
      info('Your answer is being analyzed by our AI. Please be patient as this may take a moment...');
      await completePracticeQuestion(newAnswers);
    } else {
      // Move to next question or complete interview in normal mode
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswer('');
        // Update the question to the next one
        setQuestion(questions[currentQuestionIndex + 1]);
      } else {
        // All answers collected, now send for batch evaluation
        // Show notification about processing wait time
        info('Your answers are being analyzed by our AI. Please be patient as this may take a moment...');
        await completeInterviewWithBatchEvaluation(newAnswers);
      }
    }
  };

  const completeInterviewWithBatchEvaluation = async (allAnswers: string[]) => {
    if (!interviewContext) return;

    setIsLoading(true);

    try {
      // Perform batch evaluation using Gemini
      const batchAnalysis = await geminiService.batchEvaluateAnswers(
        interviewContext,
        questions,
        allAnswers,
        user?.id // Pass user ID for usage tracking
      );

      // Store all answers and their evaluations in the database
      if (interviewSessionId) {
        // Process each answer and its evaluation
        for (let i = 0; i < questions.length; i++) {
          try {
            // Get the actual question ID from the database
            let question = await getQuestionBySessionAndNumber(interviewSessionId, i + 1);

            if (!question) {
              // Question might not be created yet, try to create it now
              const questionData = {
                session_id: interviewSessionId,
                question_text: questions[i],
                question_number: i + 1
              };

              const newQuestion = await createInterviewQuestion(questionData);
              if (newQuestion && newQuestion.id) {
                question = newQuestion;
              } else {
                // Log error to console but don't show to user as it's a background operation
              }
            }

            if (question && question.id) {
              // Get the evaluation for this specific question
              const evaluation = batchAnalysis.evaluations[i];

              const answerData = {
                question_id: question.id,
                session_id: interviewSessionId,
                user_answer: allAnswers[i],
                ai_feedback: evaluation?.aiFeedback || '',
                improvement_suggestions: evaluation?.improvementSuggestions || [],
                rating: evaluation?.rating || 0
              };

              await createInterviewAnswer(answerData);
            } else {
              // Log error to console but don't show to user as it's a background operation
            }
          } catch (dbError) {
            // Fallback to localStorage if database storage fails
            const feedbackItem = {
              id: `feedback_${Date.now()}_${i}`,
              question: questions[i],
              answer: allAnswers[i],
              feedback: batchAnalysis.evaluations[i]?.aiFeedback || 'No feedback provided',
              suggestions: batchAnalysis.evaluations[i]?.improvementSuggestions || [],
              rating: batchAnalysis.evaluations[i]?.rating || 0,
              date: new Date().toISOString()
            };

            // Get existing feedback from localStorage
            const existingFeedback = JSON.parse(localStorage.getItem('interviewFeedback') || '[]');
            // Add new feedback and save back to localStorage
            const updatedFeedback = [feedbackItem, ...existingFeedback];
            localStorage.setItem('interviewFeedback', JSON.stringify(updatedFeedback));
          }
        }
      }

      // Save completed interview to localStorage for dashboard
      const completedInterview = {
        id: `interview_${Date.now()}`,
        jobTitle: extractJobTitle(interviewContext.jobPosting || 'Interview'),
        company: extractCompanyName(interviewContext.jobPosting || 'Unknown Company'),
        date: new Date().toISOString(),
        questions: questions,
        answers: allAnswers,
        totalQuestions: questions.length,
        completed: true
      };

      // Get existing interviews from localStorage
      const existingInterviews = JSON.parse(localStorage.getItem('interviews') || '[]');
      // Add new interview and save back to localStorage
      const updatedInterviews = [completedInterview, ...existingInterviews];
      localStorage.setItem('interviews', JSON.stringify(updatedInterviews));

      setInterviewCompleted(true);

      // Update the interview session as completed in the database
      if (interviewSessionId && user?.id) {
        try {
          const success = await updateInterviewSession(interviewSessionId, { completed: true });

          // Refresh cache for the session and user after AI feedback is submitted
          await cacheRefreshService.refreshCacheForSession(interviewSessionId);
          await cacheRefreshService.refreshCacheForUser(user.id);
        } catch (dbError) {
          // Log error to console but don't show to user as it's a background operation
        }
      }

      // Update quota information in UI if needed
      if (batchAnalysis.remainingQuota !== undefined) {
      }
    } catch (err) {
      if (err instanceof Error && (err.message?.includes('Free quota exceeded') || (err as { status?: number }).status === 402)) {
        // Handle payment required case
        error('You\'ve reached your free usage limit. Please purchase credits to continue.');
        // In a real app, redirect to payment page
        router.push('/dashboard');
      } else {
        error('Error processing your answers. Please try again.');

        // Fallback: process answers individually if batch evaluation fails
        await processAnswersIndividually(allAnswers);
      }
    } finally {
      setIsLoading(false);

      // Redirect to feedback page after processing is complete
      setTimeout(() => {
        router.push('/feedback');
      }, 1000); // Small delay to ensure user sees the processing completion
    }
  };

  const processAnswersIndividually = async (allAnswers: string[]) => {
    // Fallback to individual processing if batch evaluation fails
    for (let i = 0; i < questions.length; i++) {
      if (interviewContext) {
        try {
          const analysis = await geminiService.analyzeAnswer(
            interviewContext,
            questions[i],
            allAnswers[i],
            user?.id // Pass user ID for usage tracking
          );

          // Store the answer in the database
          if (interviewSessionId) {
            try {
              // Get the actual question ID from the database
              let question = await getQuestionBySessionAndNumber(interviewSessionId, i + 1);

              if (!question) {
                // Question might not be created yet, try to create it now
                const questionData = {
                  session_id: interviewSessionId,
                  question_text: questions[i],
                  question_number: i + 1
                };

                const newQuestion = await createInterviewQuestion(questionData);
                if (newQuestion && newQuestion.id) {
                  question = newQuestion;
                } else {
                  // Log error to console but don't show to user as it's a background operation
                }
              }

              if (question && question.id) {
                const answerData = {
                  question_id: question.id,
                  session_id: interviewSessionId,
                  user_answer: allAnswers[i],
                  ai_feedback: analysis.aiFeedback,
                  improvement_suggestions: analysis.improvementSuggestions || [],
                  rating: analysis.rating || 0
                };

                await createInterviewAnswer(answerData);
              } else {
                // Log error to console but don't show to user as it's a background operation
              }
            } catch (dbError) {
              // Fallback to localStorage if database storage fails
              const feedbackItem = {
                id: `feedback_${Date.now()}_${i}`,
                question: questions[i],
                answer: allAnswers[i],
                feedback: analysis.aiFeedback,
                suggestions: analysis.improvementSuggestions,
                rating: analysis.rating || 0,
                date: new Date().toISOString()
              };

              // Get existing feedback from localStorage
              const existingFeedback = JSON.parse(localStorage.getItem('interviewFeedback') || '[]');
              // Add new feedback and save back to localStorage
              const updatedFeedback = [feedbackItem, ...existingFeedback];
              localStorage.setItem('interviewFeedback', JSON.stringify(updatedFeedback));
            }
          }
        } catch (individualError) {
          // Log error to console but don't show to user as it's a background operation
        }
      }
    }

    // Mark interview as completed
    const completedInterview = {
      id: `interview_${Date.now()}`,
      jobTitle: extractJobTitle(interviewContext?.jobPosting || 'Interview'),
      company: extractCompanyName(interviewContext?.jobPosting || 'Unknown Company'),
      date: new Date().toISOString(),
      questions: questions,
      answers: allAnswers,
      totalQuestions: questions.length,
      completed: true
    };

    // Get existing interviews from localStorage
    const existingInterviews = JSON.parse(localStorage.getItem('interviews') || '[]');
    // Add new interview and save back to localStorage
    const updatedInterviews = [completedInterview, ...existingInterviews];
    localStorage.setItem('interviews', JSON.stringify(updatedInterviews));

    setInterviewCompleted(true);

    // Update the interview session as completed in the database
    if (interviewSessionId && user?.id) {
      try {
        const success = await updateInterviewSession(interviewSessionId, { completed: true });

        // Refresh cache for the session and user after AI feedback is submitted
        await cacheRefreshService.refreshCacheForSession(interviewSessionId);
        await cacheRefreshService.refreshCacheForUser(user.id);
      } catch (dbError) {
        // Log error to console but don't show to user as it's a background operation
      }
    }

    // Redirect to feedback page after processing is complete
    setTimeout(() => {
      router.push('/feedback');
    }, 1000); // Small delay to ensure user sees the processing completion
  };

  const completePracticeQuestion = async (allAnswers: string[]) => {
    if (!interviewContext) return;

    setIsLoading(true);

    try {
      // Analyze the single answer using Gemini
      const analysis = await geminiService.analyzeAnswer(
        interviewContext,
        questions[0], // The practice question
        allAnswers[0], // The user's answer
        user?.id // Pass user ID for usage tracking
      );

      // Store the answer and its evaluation in the database
      if (interviewSessionId) {
        try {
          // Get the actual question ID from the database
          let question = await getQuestionBySessionAndNumber(interviewSessionId, 1);

          if (!question) {
            // Question might not be created yet, try to create it now
            const questionData = {
              session_id: interviewSessionId,
              question_text: questions[0],
              question_number: 1
            };

            const newQuestion = await createInterviewQuestion(questionData);
            if (newQuestion && newQuestion.id) {
              question = newQuestion;
            } else {
              // Log error to console but don't show to user as it's a background operation
            }
          }

          if (question && question.id) {
            const answerData = {
              question_id: question.id,
              session_id: interviewSessionId,
              user_answer: allAnswers[0],
              ai_feedback: analysis.aiFeedback,
              improvement_suggestions: analysis.improvementSuggestions || [],
              rating: analysis.rating || 0
            };

            await createInterviewAnswer(answerData);
          } else {
            // Log error to console but don't show to user as it's a background operation
          }
        } catch (dbError) {
          // Fallback to localStorage if database storage fails
          const feedbackItem = {
            id: `feedback_${Date.now()}_0`,
            question: questions[0],
            answer: allAnswers[0],
            feedback: analysis.aiFeedback,
            suggestions: analysis.improvementSuggestions,
            rating: analysis.rating || 0,
            date: new Date().toISOString()
          };

          // Get existing feedback from localStorage
          const existingFeedback = JSON.parse(localStorage.getItem('interviewFeedback') || '[]');
          // Add new feedback and save back to localStorage
          const updatedFeedback = [feedbackItem, ...existingFeedback];
          localStorage.setItem('interviewFeedback', JSON.stringify(updatedFeedback));
        }
      }

      // Since this is practice mode, redirect back to feedback instead of storing as a full interview
      // Clean up practice mode flags
      localStorage.removeItem('practiceMode');
      localStorage.removeItem('practiceQuestion');

      // Refresh cache for the session and user after AI feedback is submitted
      if (interviewSessionId && user?.id) {
        await cacheRefreshService.refreshCacheForSession(interviewSessionId);
        await cacheRefreshService.refreshCacheForUser(user.id);
      }

      // Redirect to feedback page after processing is complete
      setTimeout(() => {
        router.push('/feedback');
      }, 1000); // Small delay to ensure user sees the processing completion
    } catch (err) {
      if (err instanceof Error && (err.message?.includes('Free quota exceeded') || (err as { status?: number }).status === 402)) {
        // Handle payment required case
        error('You\'ve reached your free usage limit. Please purchase credits to continue.');
        // In a real app, redirect to payment page
        router.push('/dashboard');
      } else {
        error('Error processing your answer. Please try again.');

        // Clean up practice mode flags
        localStorage.removeItem('practiceMode');
        localStorage.removeItem('practiceQuestion');

        // Redirect to feedback page
        setTimeout(() => {
          router.push('/feedback');
        }, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setInterviewStarted(false);
    setInterviewCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswer('');
    setAnswers([]);
    setQuestions([]);
    setQuestion('');
  };

  // Helper function to extract job title from job posting
  const extractJobTitle = (jobPosting: string): string => {
    // Look for common job title patterns
    const titleMatch = jobPosting.match(/^(.+?) at |^(.+?) - |^(.+?)\n/i);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
    return 'Interview Practice';
  };

  // Helper function to extract company name from job posting
  const extractCompanyName = (jobPosting: string): string => {
    // Look for patterns like "at CompanyName" or "Company Name"
    const companyMatch = jobPosting.match(/at ([^,\n]+)|Company:\s*([^\n]+)|([A-Z][A-Za-z\s]+)\n/i);
    if (companyMatch && (companyMatch[1] || companyMatch[2] || companyMatch[3])) {
      return (companyMatch[1] || companyMatch[2] || companyMatch[3]).trim();
    }
    return 'Unknown Company';
  };

  if (!interviewStarted) {
    if (!interviewContext) {
      return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
          <Navigation />
          <main className="flex-1 p-4">
            <div className="container mx-auto max-w-2xl py-8">
              <Card className="shadow-xl dark:bg-gray-800">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                    AI Interview Session
                  </CardTitle>
                  <Progress value={0} className="h-2 mt-4" />
                </CardHeader>
                <CardContent className="flex flex-col items-center py-12">
                  <div className="mb-8 text-center">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      Interview Data Missing
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Please return to the interview setup page to enter job posting and CV information.
                    </p>
                  </div>
                  <Button onClick={() => router.push('/interview')} className="text-lg py-6 px-8">
                    Go to Interview Setup
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      );
    }

    // If we have interview context but interview hasn't started yet,
    // automatically start the interview (this happens when navigating from interview setup page)
    if (interviewContext && !interviewStarted && !isLoading) {
      startInterview();
      return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
          <Navigation />
          <main className="flex-1 p-4">
            <div className="container mx-auto max-w-2xl py-8">
              <Card className="shadow-xl dark:bg-gray-800">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                    AI Interview Session
                  </CardTitle>
                  <Progress value={0} className="h-2 mt-4" />
                </CardHeader>
                <CardContent className="flex flex-col items-center py-12">
                  <div className="mb-8 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      {isPracticeMode ? 'Preparing practice question...' : 'Starting your interview...'}
                    </p>
                  </div>
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
          <div className="container mx-auto max-w-2xl py-8">
            <Card className="shadow-xl dark:bg-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                  AI Interview Session
                </CardTitle>
                <Progress value={0} className="h-2 mt-4" />
              </CardHeader>
              <CardContent className="flex flex-col items-center py-12">
                <div className="mb-8 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Prepare for your interview
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    The AI interviewer is ready to simulate a realistic interview experience based on the job posting and your CV.
                  </p>
                </div>
                <Button onClick={startInterview} disabled={isLoading} className="text-lg py-6 px-8">
                  {isLoading ? 'Preparing Interview...' : 'Start Interview'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Don't show completion UI - redirect happens automatically after processing
  // if (interviewCompleted) {
  //   return (
  //     <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
  //       <Navigation />
  //       <main className="flex-1 p-4">
  //         <div className="container mx-auto max-w-2xl py-8">
  //           <Card className="shadow-xl dark:bg-gray-800">
  //             <CardHeader className="text-center">
  //               <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
  //                 Interview Complete!
  //               </CardTitle>
  //               <Progress value={100} className="h-2 mt-4" />
  //             </CardHeader>
  //             <CardContent className="flex flex-col items-center py-12">
  //               <div className="mb-8 text-center">
  //                 <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-20">
  //                   Great job completing the interview!
  //                 </h3>
  //                 <p className="mt-2 text-gray-600 dark:text-gray-400">
  //                   You've completed the AI-powered interview simulation.
  //                   Your responses have been analyzed and feedback is being prepared.
  //                 </p>
  //               </div>
  //               <div className="flex gap-4">
  //                 <Button onClick={() => router.push('/dashboard')} variant="outline">
  //                   View Results
  //                 </Button>
  //                 <Button onClick={resetInterview}>
  //                   Practice Again
  //               </div>
  //             </CardContent>
  //           </Card>
  //         </div>
  //       </main>
  //     </div>
  //   );
  // }

  // Show skeleton loader when questions are being generated
  if (interviewStarted && questions.length === 0 && isGeneratingQuestions) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
        <Navigation />
        <main className="flex-1 p-4">
          <div className="container mx-auto max-w-3xl py-8">
            <Card className="shadow-xl dark:bg-gray-800">
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      AI Interview Session
                    </CardTitle>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Generating questions...
                    </div>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-green-500 p-4 rounded-lg dark:bg-green-900/20">
                    <Skeleton className="h-6 w-full bg-green-200 dark:bg-green-800/30" />
                    <Skeleton className="h-6 w-4/5 mt-2 bg-green-200 dark:bg-green-800/30" />
                    <Skeleton className="h-6 w-3/5 mt-2 bg-green-200 dark:bg-green-800/30" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-32 w-full bg-gray-200 dark:bg-gray-700" />
                  </div>

                  <div className="flex justify-end">
                    <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>

                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Generating personalized interview questions based on your job posting and CV...
                  </p>
                </div>
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
        <div className="container mx-auto max-w-3xl py-8">
          <Card className="shadow-xl dark:bg-gray-800">
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    AI Interview Session
                  </CardTitle>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {isPracticeMode ? 'Practice Question' : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
                  </div>
                </div>
                <Progress value={isPracticeMode ? 50 : ((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-500 p-4 rounded-lg dark:bg-green-900/20">
                <p className="text-lg font-medium text-green-700 dark:text-green-300">
                  {question}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Answer
                </label>
                <Textarea
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={submitAnswer}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : isPracticeMode ? 'Submit Answer' : 'Next Question'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}