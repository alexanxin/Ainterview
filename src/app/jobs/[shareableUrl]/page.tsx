'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast';
import { getJobPostByShareableUrl, getJobPostById, trackJobView } from '@/lib/database';

export default function PublicJobPostPage() {
  const { shareableUrl } = useParams(); // Get the shareable URL from the route
  const [jobPost, setJobPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  const router = useRouter();
  const { user, loading } = useAuth();
  const { success, error, warning, info } = useToast();

  useEffect(() => {
    const fetchJobPost = async () => {
      if (!shareableUrl) return;

      let jobPostData = null;

      try {
        // First, try to fetch by shareable URL (full path format)
        const fullUrl = `/jobs/${shareableUrl}`;
        jobPostData = await getJobPostByShareableUrl(fullUrl);

        // If not found by shareable URL, try fetching by job ID
        if (!jobPostData) {
          jobPostData = await getJobPostById(shareableUrl as string);
        }

        if (jobPostData) {
          setJobPost(jobPostData);
          // Track job view
          trackJobView(jobPostData.id).catch(err => console.error('Error tracking view:', err));
        } else {
          error('Job post not found or is no longer active.');
          // Redirect to jobs page after a delay
          setTimeout(() => {
            router.push('/jobs');
          }, 3000);
        }
      } catch (err) {
        console.error('Error fetching job post:', err);
        error('Failed to load job post. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (shareableUrl) {
      fetchJobPost();
    }
  }, [shareableUrl, router, success, error]);

  const handleApplyClick = async () => {
    if (!jobPost) {
      error('Job post not loaded');
      return;
    }

    setIsApplying(true);

    try {
      // If user is logged in, go directly to interview flow
      if (user) {
        // Redirect to the AI interview session for this job post
        router.push(`/apply/${jobPost.id}/interview`);
      } else {
        // If user is not logged in, redirect to signup first
        // Then they should be redirected back to the interview flow
        router.push(`/auth?redirect=/apply/${jobPost.id}/interview`);
      }
    } catch (err) {
      console.error('Error during application:', err);
      error('An error occurred. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
        <Navigation />
        <main className="flex-1 p-4">
          <div className="container mx-auto max-w-4xl py-8">
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading job post...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!jobPost) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
        <Navigation />
        <main className="flex-1 p-4">
          <div className="container mx-auto max-w-4xl py-8">
            <Card className="shadow-xl dark:bg-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Job Post Not Found
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The job post you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => router.push('/')}>
                  Go to Homepage
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
        <div className="container mx-auto max-w-4xl py-8">
          <div className="mb-6">
            <Badge variant="outline" className="mb-2">
              {jobPost.job_type || 'N/A'} • {jobPost.location || 'Remote'}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {jobPost.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {jobPost.company_name} • Posted {new Date(jobPost.created_at).toLocaleDateString()}
            </p>
          </div>

          <Card className="dark:bg-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-green dark:prose-invert max-w-none">
                {jobPost.description.split('\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {jobPost.responsibilities && (
            <Card className="dark:bg-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-green dark:prose-invert max-w-none">
                  {jobPost.responsibilities.split('\n').map((paragraph: string, index: number) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {jobPost.requirements && (
            <Card className="dark:bg-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-green dark:prose-invert max-w-none">
                  {jobPost.requirements.split('\n').map((paragraph: string, index: number) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Apply for This Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  AI Interview Process
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Complete an AI-powered interview to apply for this position. The interview will be tailored specifically to this job post and company.
                  Your responses will be analyzed and sent directly to the hiring team.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleApplyClick}
                  disabled={isApplying}
                  className="bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90 flex-1"
                >
                  {isApplying ? 'Processing...' : 'Start AI Interview Application'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>By applying, you agree to our terms and consent to the AI processing your responses.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
