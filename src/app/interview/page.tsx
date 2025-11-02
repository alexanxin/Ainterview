'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';

export default function InterviewPage() {
  const [jobPosting, setJobPosting] = useState('');
  const [cv, setCv] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartInterview = () => {
    if (!jobPosting.trim() || !cv.trim()) {
      alert('Please fill in both job posting and CV fields');
      return;
    }

    setIsLoading(true);
    
    // Clear any previous interview session data
    localStorage.removeItem('interviewJobPosting');
    localStorage.removeItem('interviewCv');
    localStorage.removeItem('interviewCompanyInfo');
    
    // Save new job posting and CV to localStorage
    localStorage.setItem('interviewJobPosting', jobPosting);
    localStorage.setItem('interviewCv', cv);
    // Also save company info if available (could be extracted from job posting)
    localStorage.setItem('interviewCompanyInfo', extractCompanyInfo(jobPosting));
    
    // Simulate API call to prepare interview
    setTimeout(() => {
      setIsLoading(false);
      router.push('/interview/session');
    }, 1500);
  };

  // Helper function to extract company info from job posting
  const extractCompanyInfo = (jobPosting: string): string => {
    // In a real app, this would use more sophisticated text analysis
    const lines = jobPosting.split('\n');
    let companyInfo = '';
    for (const line of lines) {
      if (line.toLowerCase().includes('company') || 
          line.toLowerCase().includes('about') || 
          line.toLowerCase().includes('culture') ||
          line.toLowerCase().includes('mission')) {
        companyInfo += line + ' ';
      }
    }
    return companyInfo || 'Information about the company will be analyzed from the job posting.';
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
      <Navigation />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <Card className="shadow-xl dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Interview Preparation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 dark:text-green-200 flex items-center">
                  <span className="mr-2">🎁</span>
                  Free Usage Policy
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                  Your first complete interview is completely free! After that, you'll get 2 additional AI interactions per day to continue practicing. No credit card required to get started.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Job Posting URL or Description
                </label>
                <Textarea
                  placeholder="Paste the job posting URL or description here..."
                  value={jobPosting}
                  onChange={(e) => setJobPosting(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your CV or Resume
                </label>
                <Textarea
                  placeholder="Paste your CV/resume content here..."
                  value={cv}
                  onChange={(e) => setCv(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleStartInterview} 
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? 'Preparing Interview...' : 'Start AI Interview'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}