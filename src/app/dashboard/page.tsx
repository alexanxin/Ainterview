'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import { getInterviewSessionsByUser, InterviewSession, getAnswersBySession, InterviewAnswer } from '@/lib/database';
import AnalyticsDashboard from '@/components/analytics-dashboard';
import { ChevronDown, ChevronUp, BarChart3, Gift, CheckCircle, Clock } from 'lucide-react';
import { useCreditRefresh } from '@/lib/credit-context';
import { StructuredData, pageSEO } from '@/lib/seo';

export default function DashboardPage() {
  const router = useRouter();
  const { user, session, loading } = useAuth();
  const { refreshCredits } = useCreditRefresh();
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [completedInterviewsCount, setCompletedInterviewsCount] = useState(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);
  const [avgConfidenceScore, setAvgConfidenceScore] = useState(0);
  const [feedbackInsights, setFeedbackInsights] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);
  const [dailyCreditsStatus, setDailyCreditsStatus] = useState<{
    hasClaimedToday: boolean;
    todayUsageCount: number;
    todayPurchased: number;
    todayClaimed: number;
    claimableCredits: number;
    nextClaimDate: string;
    currentCredits: number;
  } | null>(null);
  const [isClaimingCredits, setIsClaimingCredits] = useState(false);

  // Load interviews and daily credits status from database on component mount
  useEffect(() => {
    const loadInterviews = async () => {
      if (user) {
        try {
          console.time('Dashboard: Total load time');
          setIsLoading(true);

          console.time('Dashboard: Fetch interview sessions');
          const userInterviews = await getInterviewSessionsByUser(user.id);
          console.timeEnd('Dashboard: Fetch interview sessions');
          console.log(`Dashboard: Found ${userInterviews.length} interview sessions`);

          setInterviews(userInterviews);

          // Calculate stats
          const completedCount = userInterviews.filter(i => i.completed).length;
          setCompletedInterviewsCount(completedCount);

          // Calculate actual confidence score and feedback insights from answers
          let totalRating = 0;
          let ratingCount = 0;
          let feedbackCount = 0;

          console.time('Dashboard: Fetch and process answers');
          console.log(`Dashboard: Starting to fetch answers for ${userInterviews.length} sessions`);

          // Fetch all answers in parallel instead of sequentially
          const answerPromises = userInterviews.map(session =>
            getAnswersBySession(session.id!)
          );
          const allAnswers = await Promise.all(answerPromises);

          // Process all answers
          userInterviews.forEach((session, index) => {
            const answers = allAnswers[index];
            console.log(`Dashboard: Session ${session.id} has ${answers.length} answers`);

            for (const answer of answers) {
              if (answer.rating !== undefined && answer.rating > 0) {
                totalRating += answer.rating;
                ratingCount++;
              }
              if (answer.ai_feedback && answer.ai_feedback.trim() !== '') {
                feedbackCount++;
              }
            }
          });

          console.timeEnd('Dashboard: Fetch and process answers');
          console.log(`Dashboard: Processed ${ratingCount} ratings and ${feedbackCount} feedback items`);

          const avgRating = ratingCount > 0 ? Math.round(totalRating / ratingCount) : 0;
          // Ensure the confidence score is within 0-100 range
          const calculatedConfidenceScore = Math.min(100, Math.max(0, avgRating));

          // Update the state values for confidence and feedback
          setAvgConfidenceScore(calculatedConfidenceScore);
          setFeedbackInsights(feedbackCount);

          console.timeEnd('Dashboard: Total load time');
        } catch (error) {
          console.error('Error loading interviews:', error);
          setInterviews([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    const loadDailyCreditsStatus = async () => {
      if (user && session) {
        try {
          const response = await fetch('/api/credits/claim-daily', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setDailyCreditsStatus(data);
          } else {
            console.error('Failed to fetch daily credits status:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching daily credits status:', error);
        }
      }
    };

    loadInterviews();
    loadDailyCreditsStatus();
  }, [user, session]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
        <Navigation />
        <main className="flex-1 p-4">
          <div className="container mx-auto max-w-6xl py-8">
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }


  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
        <Navigation />
        <main className="flex-1 p-4">
          <div className="container mx-auto max-w-6xl py-8">
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData config={pageSEO.dashboard} />

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
              <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-gray-900 dark:text-white">Interviews</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-green-600">{completedInterviewsCount}</p>
                  <p className="text-gray-600 dark:text-gray-400">Completed</p>
                  <Button
                    className="mt-4 w-full bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                    onClick={() => router.push('/interview')}
                  >
                    Practice Again
                  </Button>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-gray-900 dark:text-white">Confidence</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-green-600">{avgConfidenceScore}%</p>
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

              <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-gray-900 dark:text-white">Feedback</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-green-600">{feedbackInsights}</p>
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
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-gray-900 dark:text-white">Recent Interview Sessions</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="max-h-80 overflow-y-auto pr-2">
                    {interviews.length > 0 ? (
                      interviews.map((interview) => (
                        <div
                          key={interview.id}
                          className="p-3 rounded-lg cursor-pointer transition-colors bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-10 dark:hover:bg-gray-700 mb-2 last:mb-0"
                          onClick={() => router.push(`/feedback#${interview.id}`)}
                        >
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate flex-grow">
                              {interview.title || 'Interview Session'}
                            </h3>
                            {(interview.total_questions === 1) ? (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-500 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full">
                                Question
                              </span>
                            ) : (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-500 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full">
                                Interview
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {interview.company_info || 'Company'} • {new Date(interview.created_at || '').toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {interview.total_questions || 0} questions
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-50 dark:text-gray-400">
                        No interview sessions yet. Complete an interview to see it here.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-gray-900 dark:text-white">Daily Credits</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="bg-blue-500 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center">
                        <span className="mr-2">ℹ️</span>
                        Free Daily Credits
                      </h3>
                      <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                        Claim 2 free credits every day to practice interviews and get AI feedback.
                      </p>
                    </div>

                    {dailyCreditsStatus ? (
                      <>
                        {dailyCreditsStatus.hasClaimedToday ? (
                          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                              <span className="text-green-800 dark:text-green-200 font-medium">Credits Claimed Today</span>
                            </div>
                            <span className="text-green-600 font-semibold">+2 Credits</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-center">
                              <Gift className="h-5 w-5 text-yellow-600 mr-2" />
                              <span className="text-yellow-800 dark:text-yellow-200 font-medium">Claim Available</span>
                            </div>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                              onClick={async () => {
                                setIsClaimingCredits(true);
                                try {
                                  const response = await fetch('/api/credits/claim-daily', {
                                    method: 'POST',
                                    headers: {
                                      Authorization: `Bearer ${session?.access_token}`,
                                    },
                                  });

                                  if (response.ok) {
                                    const data = await response.json();
                                    // Refresh the daily credits status
                                    const statusResponse = await fetch('/api/credits/claim-daily', {
                                      method: 'GET',
                                      headers: {
                                        Authorization: `Bearer ${session?.access_token}`,
                                      },
                                    });
                                    if (statusResponse.ok) {
                                      const statusData = await statusResponse.json();
                                      setDailyCreditsStatus(statusData);
                                    }
                                    // Trigger credit refresh for the header component
                                    refreshCredits();
                                  } else {
                                    console.error('Failed to claim credits:', response.statusText);
                                  }
                                } catch (error) {
                                  console.error('Error claiming credits:', error);
                                } finally {
                                  setIsClaimingCredits(false);
                                }
                              }}
                              disabled={isClaimingCredits}
                            >
                              {isClaimingCredits ? (
                                <>
                                  <Clock className="h-4 w-4 mr-1 animate-spin" />
                                  Claiming...
                                </>
                              ) : (
                                'Claim 2 Credits'
                              )}
                            </Button>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Today's Usage</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {dailyCreditsStatus.todayUsageCount} used
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div className="flex h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-lime-500 transition-all duration-300"
                              style={{ width: `${Math.min((Math.abs(dailyCreditsStatus.todayPurchased || 0) / (dailyCreditsStatus.todayUsageCount + Math.abs(dailyCreditsStatus.todayPurchased || 0) + (dailyCreditsStatus.todayClaimed || 0))) * 100, 100)}%` }}
                            ></div>
                            <div
                              className="bg-blue-500 transition-all duration-300"
                              style={{ width: `${Math.min(((dailyCreditsStatus.todayClaimed || 0) / (dailyCreditsStatus.todayUsageCount + Math.abs(dailyCreditsStatus.todayPurchased || 0) + (dailyCreditsStatus.todayClaimed || 0))) * 100, 100)}%` }}
                            ></div>
                            <div
                              className="bg-green-600 transition-all duration-300"
                              style={{ width: `${Math.min((dailyCreditsStatus.todayUsageCount / (dailyCreditsStatus.todayUsageCount + Math.abs(dailyCreditsStatus.todayPurchased || 0) + (dailyCreditsStatus.todayClaimed || 0))) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>Purchased: {Math.abs(dailyCreditsStatus.todayPurchased || 0)}</span>
                          <span>Claimed: {dailyCreditsStatus.todayClaimed || 0}</span>
                          <span>Used: {dailyCreditsStatus.todayUsageCount}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {dailyCreditsStatus.hasClaimedToday
                            ? `You've used ${dailyCreditsStatus.todayUsageCount} credits today.`
                            : `Claim your 2 free credits to start practicing!`
                          }
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading credit status...</p>
                      </div>
                    )}

                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                      onClick={() => router.push('/interview')}
                    >
                      Practice Interview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Tips */}
            <div className="mt-8">
              <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-gray-900 dark:text-white">Your Progress Tips</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">🎯 Focus Area</h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Based on your recent interviews, focus on providing more specific examples in your answers.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-500 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📚 Recommended</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Practice behavioral questions to improve your storytelling skills for the next interview.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🏆 Achievement</h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Great job! You've completed {completedInterviewsCount} interview{completedInterviewsCount !== 1 ? 's' : ''}. Keep practicing!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Dashboard Section - Load on Demand */}
            <div className="mt-8">
              <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 dark:text-white flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Usage Analytics
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAnalyticsExpanded(!analyticsExpanded)}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      {analyticsExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide Analytics
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Show Analytics
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {analyticsExpanded && (
                  <CardContent className="p-6">
                    <AnalyticsDashboard />
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}