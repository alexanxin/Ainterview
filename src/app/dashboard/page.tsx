'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';

interface Interview {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  questions: string[];
  answers: string[];
  totalQuestions: number;
  completed: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  
  // Load interviews from localStorage on component mount
  useEffect(() => {
    const savedInterviews = localStorage.getItem('interviews');
    if (savedInterviews) {
      try {
        const parsedInterviews: Interview[] = JSON.parse(savedInterviews);
        setInterviews(parsedInterviews);
      } catch (error) {
        console.error('Error parsing saved interviews:', error);
        setInterviews([]);
      }
    }
  }, []);

  // Calculate dynamic stats based on actual data
  const completedInterviewsCount = interviews.filter(i => i.completed).length;
  const totalQuestionsAnswered = interviews.reduce((sum, interview) => sum + (interview.answers?.length || 0), 0);
  
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
      <Navigation />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-6xl py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Interview Preparation Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track your progress and upcoming interviews
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{completedInterviewsCount}</p>
                <p className="text-gray-600 dark:text-gray-400">Completed</p>
                <Button 
                  className="mt-4 w-full" 
                  onClick={() => router.push('/interview')}
                >
                  Practice Again
                </Button>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">78%</p>
                <p className="text-gray-600 dark:text-gray-400">Average Score</p>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full" 
                  onClick={() => router.push('/profile')}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{totalQuestionsAnswered}</p>
                <p className="text-gray-600 dark:text-gray-400">Insights Received</p>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full" 
                  onClick={() => router.push('/feedback')}
                >
                  View Feedback
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Recent Interview Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interviews.length > 0 ? (
                    interviews.map((interview, index) => (
                      <div key={interview.id || index} className={`flex items-center justify-between ${index < interviews.length - 1 ? 'border-b pb-3' : ''} dark:border-gray-700`}>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{interview.jobTitle} at {interview.company}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Completed on {new Date(interview.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push('/feedback')}
                        >
                          Review
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No interview sessions yet. Complete an interview to see it here.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">AI Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center">
                      <span className="mr-2">ℹ️</span>
                      Usage Information
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                      Your first complete interview is free! After that, you get 2 additional AI interactions per day.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Daily Quota</span>
                    <span className="font-medium text-gray-900 dark:text-white">0/2 used</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    You have 2 free AI interactions remaining for today.
                  </p>
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                    onClick={() => router.push('/interview')}
                  >
                    Practice More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}