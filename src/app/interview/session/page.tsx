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

export default function InterviewSessionPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const router = useRouter();
  const { user } = useAuth(); // Get user from auth context

  // Interview context from localStorage
  const [interviewContext, setInterviewContext] = useState<InterviewContext | null>(null);

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

  useEffect(() => {
    if (interviewStarted && questions.length === 0 && interviewContext) {
      // Generate questions using Gemini API
      generateInterviewFlow();
    }
  }, [interviewStarted, questions.length, interviewContext]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setQuestion(questions[currentQuestionIndex]);
    } else if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      setInterviewCompleted(true);
    }
  }, [currentQuestionIndex, questions]);

  const startInterview = async () => {
    if (!interviewContext) {
      alert('Interview context not available. Please return to the interview setup page.');
      return;
    }
    
    setIsLoading(true);
    setInterviewStarted(true);
    
    try {
      // Generate the interview flow using Gemini API
      await generateInterviewFlow();
    } catch (error) {
      console.error('Error generating interview flow:', error);
      alert('Failed to start interview. Please try again.');
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
    } catch (error: any) {
      if (error.message?.includes('Free quota exceeded') || error.status === 402) {
        // Handle payment required case
        alert('You\'ve reached your free usage limit. Please purchase credits to continue.');
        // In a real app, redirect to payment page
        router.push('/dashboard');
      } else {
        console.error('Error generating interview flow:', error);
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
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer before continuing');
      return;
    }

    setIsLoading(true);

    try {
      // Store the answer
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = answer;
      setAnswers(newAnswers);

      // Optionally analyze the answer using Gemini
      if (interviewContext) {
        const analysis = await geminiService.analyzeAnswer(
          interviewContext,
          questions[currentQuestionIndex],
          answer,
          user?.id // Pass user ID for usage tracking
        );
        console.log('Answer analysis:', analysis);
        
        // Save the feedback to localStorage
        const feedbackItem = {
          id: `feedback_${Date.now()}_${currentQuestionIndex}`,
          question: questions[currentQuestionIndex],
          answer: answer,
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
        
        // Update quota information in UI if needed
        if (analysis.remainingQuota !== undefined) {
          console.log(`Remaining quota after analysis: ${analysis.remainingQuota}`);
        }
      }

      // Move to next question or complete interview
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswer('');
        // Generate next question if needed (for dynamic interviews)
        if (currentQuestionIndex + 1 < questions.length) {
          setQuestion(questions[currentQuestionIndex + 1]);
        }
      } else {
        // Save completed interview to localStorage for dashboard
        const completedInterview = {
          id: `interview_${Date.now()}`,
          jobTitle: extractJobTitle(interviewContext?.jobPosting || 'Interview'),
          company: extractCompanyName(interviewContext?.jobPosting || 'Unknown Company'),
          date: new Date().toISOString(),
          questions: questions,
          answers: [...newAnswers, answer], // Include the current answer
          totalQuestions: questions.length,
          completed: true
        };
        
        // Get existing interviews from localStorage
        const existingInterviews = JSON.parse(localStorage.getItem('interviews') || '[]');
        // Add new interview and save back to localStorage
        const updatedInterviews = [completedInterview, ...existingInterviews];
        localStorage.setItem('interviews', JSON.stringify(updatedInterviews));
        
        setInterviewCompleted(true);
      }
    } catch (error: any) {
      if (error.message?.includes('Free quota exceeded') || error.status === 402) {
        // Handle payment required case
        alert('You\'ve reached your free usage limit. Please purchase credits to continue.');
        // In a real app, redirect to payment page
        router.push('/dashboard');
      } else {
        console.error('Error processing answer:', error);
        alert('Error processing your answer. Please try again.');
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