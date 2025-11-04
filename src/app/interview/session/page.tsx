'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import { geminiService, InterviewContext } from '@/lib/gemini-service';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast';

// API functions using the server-side endpoint to ensure proper permissions
const createInterviewSession = async (sessionData: any) => {
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

const createInterviewQuestion = async (questionData: any) => {
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

const createInterviewAnswer = async (answerData: any) => {
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

const updateInterviewSession = async (sessionId: string, sessionData: any) => {
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

// Define the InterviewQuestion interface locally since we removed the import
interface InterviewQuestion {
  id?: string;
  session_id: string;
  question_text: string;
  question_number: number;
  created_at?: string;
}

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
  const router = useRouter();
  const { user, loading } = useAuth(); // Get user and loading state from auth context
  const { success, error, info, warning } = useToast(); // Initialize toast notifications

  // Show loading state while checking auth
  if (loading) {
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
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading interview session...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?redirect=/interview/session');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Load interview context from localStorage
    const jobPosting = localStorage.getItem('interviewJobPosting');
    const cv = localStorage.getItem('interviewCv');
    const companyInfo = localStorage.getItem('interviewCompanyInfo');

    if (jobPosting && cv) {
      setInterviewContext({
        jobPosting,
        userCv: cv,
        companyInfo: companyInfo || 'Company information'
      });
    }
  }, []);

  // Check if we need to generate questions when interview starts
  // Only generate if we don't have questions and interview has started
  useEffect(() => {
    if (interviewStarted && questions.length === 0 && interviewContext && !isGeneratingQuestions) {
      generateInterviewFlow();
    }
  }, [interviewStarted, questions.length, interviewContext, isGeneratingQuestions]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setQuestion(questions[currentQuestionIndex]);
    } else if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      setInterviewCompleted(true);
    }
  }, [currentQuestionIndex, questions]);

  const startInterview = async () => {
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
      // Create an interview session in the database
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
          return;
        }
      }

      // Generate the interview flow using Gemini API
      await generateInterviewFlow();
    } catch (err) {
      error('Failed to start interview. Please try again.');
      setInterviewStarted(false);
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
    } catch (error: any) {
      if (error.message?.includes('Free quota exceeded') || error.status === 402) {
        // Handle payment required case
        error('You\'ve reached your free usage limit. Please purchase credits to continue.');
        // In a real app, redirect to payment page
        router.push('/dashboard');
      } else if (error.message?.includes('Rate limit exceeded') || error.status === 429) {
        // Handle rate limit exceeded case
        error('Too many requests. Please wait before trying again.');
        // Optionally show a retry button or wait before retrying
        setTimeout(() => {
          generateInterviewFlow(); // Attempt to retry after a delay
        }, 3000); // Retry after 30 seconds
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
      setIsGeneratingQuestions(false); // Reset the flag
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

    // Move to next question or complete interview
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer('');
      // Generate next question if needed (for dynamic interviews)
      if (currentQuestionIndex + 1 < questions.length) {
        setQuestion(questions[currentQuestionIndex + 1]);
      }
    } else {
      // All answers collected, now send for batch evaluation
      await completeInterviewWithBatchEvaluation(newAnswers);
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
        } catch (dbError) {
          // Log error to console but don't show to user as it's a background operation
        }
      }

      // Update quota information in UI if needed
      if (batchAnalysis.remainingQuota !== undefined) {
      }
    } catch (error: any) {
      if (error.message?.includes('Free quota exceeded') || error.status === 402) {
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
      } catch (dbError) {
        // Log error to console but don't show to user as it's a background operation
      }
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
    if (interviewContext && !interviewStarted) {
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
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Starting your interview...</p>
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

  if (interviewCompleted) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
        <Navigation />
        <main className="flex-1 p-4">
          <div className="container mx-auto max-w-2xl py-8">
            <Card className="shadow-xl dark:bg-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                  Interview Complete!
                </CardTitle>
                <Progress value={100} className="h-2 mt-4" />
              </CardHeader>
              <CardContent className="flex flex-col items-center py-12">
                <div className="mb-8 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Great job completing the interview!
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    You've completed the AI-powered interview simulation.
                    Your responses have been analyzed and feedback is being prepared.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => router.push('/dashboard')} variant="outline">
                    View Results
                  </Button>
                  <Button onClick={resetInterview}>
                    Practice Again
                  </Button>
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
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                </div>
                <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg dark:bg-green-900/20">
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
                  {isLoading ? 'Processing...' : 'Next Question'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}