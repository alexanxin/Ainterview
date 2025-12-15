'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Clock, Building2, Users, Zap, CheckCircle, Target, Copy, Share2, Briefcase } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast';
import { supabase } from '@/lib/supabase';
import { getCompanyByUserId } from '@/lib/database';
import { StructuredData, pageSEO } from '@/lib/seo';
import type { Company } from '@/types/b2b-types';

export default function JobListingsPage() {
  const [jobPosts, setJobPosts] = useState<any[]>([]);
  const [filteredJobPosts, setFilteredJobPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);

  const router = useRouter();
  const { success, error } = useToast();

  useEffect(() => {
    const fetchCompany = async () => {
      if (user) {
        try {
          const companyData = await getCompanyByUserId(user.id);
          setCompany(companyData);
        } catch (err) {
          console.error('Error fetching company:', err);
        }
      }
    };
    fetchCompany();
  }, [user]);

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        // Get all active job posts
        const { data, error: fetchError } = await supabase
          .from('job_posts')
          .select(`
            id,
            title,
            description,
            location,
            job_type,
            company_id,
            posted_by,
            status,
            created_at,
            credit_cost_per_applicant,
            shareable_url,
            companies!inner (
              company_name
            )
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Error fetching job posts:', fetchError);
          error('Failed to load job listings. Please try again.');
        } else {
          setJobPosts(data || []);
          setFilteredJobPosts(data || []);
        }
      } catch (err) {
        console.error('Error fetching job posts:', err);
        error('An error occurred while loading job listings.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobPosts();
  }, [success, error]);

  useEffect(() => {
    // Filter job posts based on search term
    if (!searchTerm) {
      setFilteredJobPosts(jobPosts);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = jobPosts.filter(job =>
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.companies.company_name.toLowerCase().includes(term) ||
        (job.location && job.location.toLowerCase().includes(term))
      );
      setFilteredJobPosts(filtered);
    }
  }, [searchTerm, jobPosts]);

  const handleJobClick = (shareableUrl: string) => {
    // Check if shareableUrl already contains /jobs/ prefix to avoid duplication
    const url = shareableUrl.startsWith('/jobs/') ? shareableUrl : `/jobs/${shareableUrl}`;
    router.push(url);
  };

  const handleCopyUrl = async (shareableUrl: string) => {
    // Check if shareableUrl already contains /jobs/ prefix to avoid duplication
    const url = shareableUrl.startsWith('/jobs/') ? shareableUrl : `/jobs/${shareableUrl}`;
    const jobUrl = `${window.location.origin}${url}`;
    try {
      await navigator.clipboard.writeText(jobUrl);
      success('Job URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
      error('Failed to copy URL. Please try again.');
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-6xl py-8">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading job listings...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData config={{
        title: "Available Job Opportunities - Ainterview",
        description: "Browse and apply to job posts created by companies using AI-powered interviews. Find your next career opportunity with personalized interview preparation.",
        keywords: "job listings, AI interviews, company job posts, career opportunities, interview preparation, job applications",
        image: "/logo.png",
        url: "/jobs"
      }} />

      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-6xl py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Available Job Opportunities
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Browse and apply to job posts created by companies using AI-powered interviews
            </p>
          </div>

          {/* Company "Post Job" Card */}
          {company && (
            <Card className="mb-8 border-dashed border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Hiring? Post a Job
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Create a new AI-powered job posting to find the best candidates.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/b2b/jobs/new')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Search bar */}
          <div className="mb-8 flex justify-center">
            <div className="relative max-w-lg w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search jobs by title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Job listings */}
          {filteredJobPosts.length === 0 ? (
            <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30">
              <CardContent className="text-center py-12">
                <div className="mb-4">
                  <Target className="h-12 w-12 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm ? 'No jobs found' : 'No active job posts'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm
                    ? `No job posts found matching "${searchTerm}". Try a different search term.`
                    : 'No active job posts available at the moment. Check back soon!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredJobPosts.map((jobPost) => (
                <Card key={jobPost.id} className="dark:bg-gray-800 border-green-200 dark:border-green-900/30 flex flex-col h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-gray-900 dark:text-white text-lg line-clamp-2">
                      {jobPost.title}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <Building2 className="h-4 w-4 mr-1" />
                      {jobPost.companies?.company_name}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-6">
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                      {jobPost.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {jobPost.location && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800 text-xs flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {jobPost.location}
                        </Badge>
                      )}
                      {jobPost.job_type && (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800 text-xs">
                          {jobPost.job_type}
                        </Badge>
                      )}
                      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800 text-xs flex items-center">
                        <Zap className="h-3 w-3 mr-1" />
                        {jobPost.credit_cost_per_applicant} credits per user
                      </Badge>
                    </div>

                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <Clock className="h-3 w-3 mr-1" />
                      Posted {new Date(jobPost.created_at).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                        onClick={() => handleJobClick(jobPost.shareable_url)}
                      >
                        View Job
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCopyUrl(jobPost.shareable_url)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* How it works section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">How AI Interviews Work</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI-powered platform revolutionizes the hiring process
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30 p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-lime-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Job Matching</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse job opportunities that match your skills and career goals
                </p>
              </Card>
              <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30 p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-lime-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Interviews</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete personalized interviews tailored to each specific role
                </p>
              </Card>
              <Card className="dark:bg-gray-800 border-green-200 dark:border-green-900/30 p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Direct Company Review</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Companies review your AI-evaluated responses and contact top candidates
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
