'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';

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
  const [interviews, setInterviews] = useState<InterviewWithFeedback[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<InterviewWithFeedback | null>(null);
  
  // Load interviews and feedback from localStorage on component mount
  useEffect(() => {
    // Get all interviews
    const savedInterviews = localStorage.getItem('interviews');
    // Get all feedback
    const savedFeedback = localStorage.getItem('interviewFeedback');
    
    if (savedFeedback) {
      try {
        const allFeedback: FeedbackItem[] = JSON.parse(savedFeedback);
        
        // Group feedback by interview date (or create unique groups based on date proximity)
        // For now, we'll group by the date of the feedback
        const groupedInterviews: InterviewWithFeedback[] = [];
        
        // Group feedback items by date (same day)
        const groupedByDate: { [date: string]: FeedbackItem[] } = {};
        allFeedback.forEach(item => {
          const dateStr = new Date(item.date).toDateString();
          if (!groupedByDate[dateStr]) {
            groupedByDate[dateStr] = [];
          }
          groupedByDate[dateStr].push(item);
        });
        
        // Convert to interview objects
        Object.entries(groupedByDate).forEach(([dateStr, feedbackItems]) => {
          // Extract job info from the first feedback item's question to label the group
          // In a full implementation, we'd have better interview identification
          const firstFeedback = feedbackItems[0];
          const date = new Date(firstFeedback.date);
          const jobTitle = date.toLocaleDateString() === new Date().toDateString() 
            ? 'Today\'s Interview' 
            : `Interview on ${date.toLocaleDateString()}`;
            
          groupedInterviews.push({
            id: `interview_${date.getTime()}`,
            jobTitle: jobTitle,
            company: 'Practice Session',
            date: firstFeedback.date,
            feedbackItems: feedbackItems
          });
        });
        
        // If we also have saved interviews with context, we can merge them
        if (savedInterviews) {
          const parsedSavedInterviews = JSON.parse(savedInterviews);
          // This would allow for more sophisticated grouping if needed
        }
        
        setInterviews(groupedInterviews);
        
        // If we have interviews, select the most recent one
        if (groupedInterviews.length > 0) {
          setSelectedInterview(groupedInterviews[0]);
        }
      } catch (error) {
        console.error('Error parsing saved data:', error);
        setInterviews([]);
      }
    } else {
      setInterviews([]);
    }
  }, []);

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
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedInterview?.id === interview.id
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
                      {selectedInterview.feedbackItems.map((item) => (
                        <Card key={item.id} className="dark:bg-gray-700">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-gray-900 dark:text-white text-base">
                                {item.question}
                              </CardTitle>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  item.rating >= 8 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                    : item.rating >= 6 
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                  Rating: {item.rating}/10
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Your Answer:</h4>
                                <p className="text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-600/50 p-3 rounded-md">
                                  {item.answer}
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">AI Feedback:</h4>
                                <p className="text-gray-900 dark:text-gray-200 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                                  {item.feedback}
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Improvement Suggestions:</h4>
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
                      ))}
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