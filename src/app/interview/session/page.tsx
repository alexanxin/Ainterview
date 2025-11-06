'use client';

import { useState, useEffect, useRef } from 'react';
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
  const answerTextareaRef = useRef<HTMLTextAreaElement>(null);
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
  const [interviewQuestionsCount, setInterviewQuestionsCount] = useState<number>(5); // Default to 5 questions
  const [showRecordingTips, setShowRecordingTips] = useState(false); // Show/hide recording tips
  const [isRecording, setIsRecording] = useState(false); // Track recording state
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null); // Store media recorder instance
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null); // Timer for recording duration
  const [recordingTime, setRecordingTime] = useState(0); // Track recording time in seconds
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
    // Load the number of questions selected by the user (default to 5)
    const numberOfQuestions = localStorage.getItem('interviewNumberOfQuestions') || '5';

    if (jobPosting && cv) {
      const context = {
        jobPosting,
        userCv: cv,
        companyInfo: companyInfo || 'Company information'
      };
      setInterviewContext(context);
      // Set the number of questions to use for this interview
      setInterviewQuestionsCount(parseInt(numberOfQuestions, 10));
    } else {
      // Set to null if not available to ensure consistent state
      setInterviewContext(null);
      setInterviewQuestionsCount(5); // Default to 5 if no context available
    }
    setIsContextLoading(false); // Set loading to false after context is loaded
  }, []);

  // Effect to set the current question when questions array changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setQuestion(questions[currentQuestionIndex]);
    }
  }, [questions, currentQuestionIndex]);

  // Effect to focus the answer textarea when the question changes
  useEffect(() => {
    if (answerTextareaRef.current) {
      // Give the DOM a moment to update before focusing
      setTimeout(() => {
        answerTextareaRef.current?.focus();
      }, 100);
    }
  }, [question]); // Only run when the question changes

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
        // In practice mode, we don't create a session record yet - we'll create it when the user submits their answer
        // This prevents empty sessions from being created when users just view the practice question without answering
        setQuestions([practiceQuestion]);
        setQuestion(practiceQuestion);

        // We still want to set the session ID to a temporary value so the question can be created later
        // Actually, we should create the session only when the user submits an answer with feedback
        // For now, we'll just set up the question without creating a session
      } else {
        // Create an interview session in the database for normal mode
        if (user?.id) {
          const sessionData = {
            user_id: user.id,
            job_posting: interviewContext.jobPosting,
            company_info: interviewContext.companyInfo,
            user_cv: interviewContext.userCv,
            title: extractJobTitle(interviewContext.jobPosting),
            total_questions: interviewQuestionsCount // Use the user-selected number of questions
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
        interviewQuestionsCount, // Use the user-selected number of questions
        user?.id, // Pass user ID for usage tracking
        (message) => info(message), // onPaymentInitiated
        (message) => success(message), // onPaymentSuccess
        (message) => error(message) // onPaymentFailure
      );
      setQuestions(generatedQuestions);

      // Set the first question immediately after generation
      if (generatedQuestions.length > 0) {
        setQuestion(generatedQuestions[0]);
      }

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
            console.error(`Error creating question ${i + 1}:`, err);
            return null;
          }
        });

        const results = await Promise.all(questionPromises);

        // Check if all questions were created successfully
        const successfulCreations = results.filter(result => result !== null);
        console.log(`${successfulCreations.length} out of ${generatedQuestions.length} questions created successfully`);
      }
    } catch (err) {
      if (err instanceof Error && (err.message?.includes('Free quota exceeded') || (err as { status?: number }).status === 402)) {
        // Handle payment required case
        info('Payment initiation: Processing payment for additional credits. Please complete the transaction in your wallet.');
        // Redirect to payment page
        router.push('/payment');
        return; // Exit immediately after redirect
      } else if (err instanceof Error && (err.message?.includes('Rate limit exceeded') || (err as { status?: number }).status === 429)) {
        // Handle rate limit exceeded case
        error('Too many requests. Please wait before trying again.');
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

    setIsLoading(true); // Set loading state immediately to prevent double submission

    // Store the answer locally but don't send to API yet
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);

    try {
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
    } catch (err) {
      // Handle any unexpected errors during the submission flow
      console.error('Error during answer submission:', err);
      error('An unexpected error occurred during submission. Please try again.');
    } finally {
      // Only reset loading if we are not moving to the next question in normal mode
      // The complete functions will handle the final reset/redirect
      if (!isPracticeMode && currentQuestionIndex < questions.length - 1) {
        setIsLoading(false);
      }
    }
  };

  const completeInterviewWithBatchEvaluation = async (allAnswers: string[]) => {
    if (!interviewContext) return;

    try {
      // Perform batch evaluation using Gemini
      const batchAnalysis = await geminiService.batchEvaluateAnswers(
        interviewContext,
        questions,
        allAnswers,
        user?.id, // Pass user ID for usage tracking
        (message) => info(message), // onPaymentInitiated
        (message) => success(message), // onPaymentSuccess
        (message) => error(message) // onPaymentFailure
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
        info('Payment initiation: Processing payment for additional credits. Please complete the transaction in your wallet.');
        // Redirect to payment page
        router.push('/payment');
        return; // Exit immediately after redirect
      } else {
        error('Error processing your answers. Please try again.');

        // Fallback: process answers individually if batch evaluation fails
        await processAnswersIndividually(allAnswers);
      }
    } finally {
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
            user?.id, // Pass user ID for usage tracking
            (message) => info(message), // onPaymentInitiated
            (message) => success(message), // onPaymentSuccess
            (message) => error(message) // onPaymentFailure
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

    try {
      // Analyze the single answer using Gemini
      const analysis = await geminiService.analyzeAnswer(
        interviewContext,
        questions[0], // The practice question
        allAnswers[0], // The user's answer
        user?.id, // Pass user ID for usage tracking
        (message) => info(message), // onPaymentInitiated
        (message) => success(message), // onPaymentSuccess
        (message) => error(message) // onPaymentFailure
      );

      // For practice mode, create the session and question only when the user submits an answer with feedback
      if (isPracticeMode && !interviewSessionId && user?.id) {
        // Create a new session for the practice question
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
          // Now create the question record in the database
          const questionData = {
            session_id: session.id,
            question_text: questions[0],
            question_number: 1
          };

          const newQuestion = await createInterviewQuestion(questionData);
          if (newQuestion && newQuestion.id) {
            // Now create the answer record
            const answerData = {
              question_id: newQuestion.id,
              session_id: session.id,
              user_answer: allAnswers[0],
              ai_feedback: analysis.aiFeedback,
              improvement_suggestions: analysis.improvementSuggestions || [],
              rating: analysis.rating || 0
            };

            await createInterviewAnswer(answerData);

            // Update the session as completed since it's just one question
            try {
              const success = await updateInterviewSession(session.id, { completed: true });

              // Refresh cache for the session and user after AI feedback is submitted
              await cacheRefreshService.refreshCacheForSession(session.id);
              await cacheRefreshService.refreshCacheForUser(user.id);
            } catch (dbError) {
              // Log error to console but don't show to user as it's a background operation
            }
          } else {
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
        } else {
          // If session creation fails, fallback to localStorage
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
      } else if (interviewSessionId) {
        // For non-practice mode, follow the existing flow
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
        info('Payment initiation: Processing payment for additional credits. Please complete the transaction in your wallet.');
        // Redirect to payment page
        router.push('/payment');
        return; // Exit immediately after redirect
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

  // Function to start voice recording and transcription using Web Speech API
  const startVoiceRecording = async () => {
    try {
      // Check for browser support
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        error('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Opera for best experience.');
        return;
      }

      // Check for online status before attempting to connect to speech recognition service
      if (!navigator.onLine) {
        error('You appear to be offline. Speech recognition requires an internet connection. Please type your answer instead.');
        return;
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up speech recognition
      const SpeechRecognition: any = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let finalTranscript = '';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        // Update the answer field with both final and interim results
        setAnswer(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingTimer) {
          clearInterval(recordingTimer);
          setRecordingTimer(null);
        }
        if (stream) {
          stream.getTracks().forEach(track => track.stop()); // Stop microphone
        }

        // Handle specific error types with more helpful guidance
        if (event.error === 'network') {
          error('Speech recognition requires an internet connection to Google\'s servers. This feature may not work behind certain firewalls or corporate networks. Please try typing your answer instead.');
        } else if (event.error === 'no-speech') {
          error('No speech detected. Please speak louder, ensure your microphone is working, and try again. If problems persist, type your answer instead.');
        } else if (event.error === 'audio-capture') {
          error('Could not access microphone. Please check microphone permissions in your browser settings, ensure no other applications are using the microphone, and try again. If issues continue, type your answer instead.');
        } else if (event.error === 'not-allowed') {
          error('Microphone access denied. Please go to your browser settings, allow microphone access for this site, and try again. As an alternative, you can type your answer.');
        } else if (event.error === 'service-not-allowed') {
          error('Speech recognition service not allowed. Your browser or network may restrict access to speech services. Please type your answer instead.');
        } else if (event.error === 'bad-grammar') {
          error('Speech recognition grammar error occurred. This is typically a system error. Please type your answer instead.');
        } else {
          error(`Recording error (${event.error}). Web Speech API requires internet connectivity. You can type your answer instead, which is just as effective for our AI analysis.`);
        }
      };

      recognition.onend = () => {
        // When recognition stops, update UI
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingTimer) {
          clearInterval(recordingTimer);
          setRecordingTimer(null);
        }
        stream.getTracks().forEach(track => track.stop()); // Stop microphone
      };

      // Start recognition
      recognition.start();
      setIsRecording(true);

      // Start recording timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);

      // Stop recording after 30 seconds max to prevent excessive recording
      const autoStopTimer = setTimeout(() => {
        if (isRecording) {
          stopVoiceRecording(recognition, stream, timer);
        }
      }, 30000); // 30 seconds max

      // Store reference to stop function
      (window as any)._stopVoiceRecording = () => {
        stopVoiceRecording(recognition, stream, timer);
        clearTimeout(autoStopTimer);
      };
    } catch (err) {
      console.error('Error accessing microphone:', err);
      error('Could not access microphone. Please check permissions and try again.');
    }
  };

  // Function to stop voice recording
  const stopVoiceRecording = (recognition: any, stream: MediaStream, timer: NodeJS.Timeout) => {
    recognition.stop();
    setIsRecording(false);
    setRecordingTime(0);
    if (timer) {
      clearInterval(timer);
      setRecordingTimer(null);
    }
    stream.getTracks().forEach(track => track.stop()); // Stop microphone
  };

  // Function to handle the speak answer button click
  const handleSpeakAnswerClick = () => {
    if (isRecording) {
      // If already recording, stop it
      if ((window as any)._stopVoiceRecording) {
        (window as any)._stopVoiceRecording();
      }
      setIsRecording(false);
      setRecordingTime(0);
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
    } else {
      // Start recording
      startVoiceRecording();
    }
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
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Answer
                  </label>
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleSpeakAnswerClick}
                    className="flex items-center"
                  >
                    <span className="mr-1">{isRecording ? '⏹️' : '🎤'}</span>
                    {isRecording ? `Recording (${recordingTime}s)` : 'Speak Answer'}
                  </Button>
                </div>
                <Textarea
                  ref={answerTextareaRef}
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              {/* Recording Tips Card */}
              {showRecordingTips && (
                <Card className="dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <CardHeader className="border-b border-blue-200 dark:border-blue-700">
                    <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center">
                      <span className="mr-2">💡</span>
                      Recording Tips for Best Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Find a quiet space with minimal background noise</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Speak clearly and at a moderate pace</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Use a good quality microphone (headphones work best)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Position yourself close to, but not too close to, the mic</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Enunciate clearly, especially technical terms</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Keep answers concise but specific (1-3 minutes typically)</span>
                      </li>
                      <li className="flex items-start text-xs bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                        <span className="mr-2">🌐</span>
                        <span><strong>Note:</strong> Speech recognition requires an internet connection and may not work behind corporate firewalls. If you encounter network errors, simply type your answer instead.</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRecordingTips(!showRecordingTips)}
                  className="flex items-center"
                >
                  <span className="mr-2">💡</span>
                  {showRecordingTips ? 'Hide Tips' : 'Recording Tips'}
                </Button>
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