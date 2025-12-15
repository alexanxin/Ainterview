'use client';

import CollapsibleFAQ from '@/components/collapsible-faq';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RangeInput } from '@/components/ui/range-input';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast';
import { getUserProfile, updateUserProfile, UserProfile } from '@/lib/database';
import { parsePdfText } from '@/lib/pdf-parser';

import { StructuredData, pageSEO } from '@/lib/seo';
import { geminiService } from '@/lib/gemini-service';
import {
  sanitizeJobPostingSafe,
  sanitizeUserCVSafe,
  comprehensiveSanitize
} from '@/lib/validations-enhanced';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import modal components to prevent hydration issues
const Sheet = dynamic(() => import('@/components/ui/sheet').then(mod => mod.Sheet), { ssr: false });
const SheetContent = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetContent), { ssr: false });
const SheetHeader = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetHeader), { ssr: false });
const SheetTitle = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetTitle), { ssr: false });
const SheetFooter = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetFooter), { ssr: false });

export default function InterviewPage() {
  const [jobPosting, setJobPosting] = useState('');
  const [jobPostingUrl, setJobPostingUrl] = useState('');
  const [cv, setCv] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingJob, setIsFetchingJob] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCvData, setModalCvData] = useState({
    bio: '',
    experience: '',
    education: '',
    skills: '',
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(5); // Default to 5 questions
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);



  const router = useRouter();
  const { user, loading } = useAuth();
  const { error, success, warning, info } = useToast(); // Initialize toast notifications

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?redirect=/interview');
    }
  }, [user, loading, router]);

  // Load user profile when user is available
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const profile = await getUserProfile(user.id);
        setUserProfile(profile);
        // Automatically set CV from profile for the interview in the same order as profile page
        if (profile) {
          const sections = [];
          if (profile.bio) sections.push(`Bio:\n${profile.bio}`);
          if (profile.experience) sections.push(`Experience:\n${profile.experience}`);
          if (profile.education) sections.push(`Education:\n${profile.education}`);
          if (profile.skills) sections.push(`Skills:\n${profile.skills}`);

          const combinedCv = sections.join('\n\n');
          setCv(combinedCv);
        }
      }
    };
    loadProfile();
  }, [user]);

  // Helper function to check if user profile is complete
  const isProfileComplete = (): boolean => {
    if (!userProfile) return false;
    // Check if essential fields have content
    return !!(userProfile.bio || userProfile.experience || userProfile.education || userProfile.skills);
  };

  const extractSectionsFromPDFText = (text: string) => {
    // Clean up the text by removing multiple spaces and line breaks
    const cleanText = text.replace(/\s+/g, ' ').trim();

    // Extract name - look for the name pattern in LinkedIn PDFs
    const nameMatch = cleanText.match(/([A-Z][a-z]+ [A-Z][a-z]+)\s+(?:Freelance|Full Stack|Product Designer|Tech Creator)/);
    const name = nameMatch ? nameMatch[1] : '';

    // Extract location - look for country or city patterns
    const locationMatch = cleanText.match(/(?:North Macedonia|Skopje|Skopski)/);
    let location = locationMatch ? locationMatch[0] : '';

    // Extract phone number - look for the phone pattern
    const phoneMatch = cleanText.match(/389\s+\d{2}\s+\d{6}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // Extract summary/bio - look for the Summary section
    const summaryPattern = /Summary\s+([^.]*?)(?:Experience|Education|Skills|Contact|Languages|Top Skills|$)/i;
    const bioMatch = cleanText.match(summaryPattern);
    let bio = bioMatch ? bioMatch[1].trim() : '';

    // Extract experience - look for the Experience section and capture all experience entries
    const experiencePattern = /Experience\s+([^.]*?)(?:Education|Skills|Summary|Contact|Languages|Top Skills|$)/i;
    const experienceMatch = cleanText.match(experiencePattern);
    let experience = experienceMatch ? experienceMatch[1].trim() : '';

    // Extract individual experience entries with proper formatting
    const experienceEntries = [];
    // Pattern to capture complete experience entries including location and duration, but stop before page markers
    const entryPattern = /([A-Z][a-zA-Z\s&\/]+?)(?:\n|\s+)([A-Z][a-zA-Z\s&\/]+?)?(?:\n|\s+)(?:October|July|April|September|May|November|January|December|200\d|\d{4})[^}]*?(?:Present|months|year)[^}]*?(?:Skopje|North Macedonia)[^}]*?(?=\n\n|Page|$)/gi;
    let match;
    while ((match = entryPattern.exec(cleanText)) !== null) {
      let entry = match[0].trim();
      // Clean up the entry by removing extra spaces and normalizing
      entry = entry.replace(/\s+/g, ' ').replace(/\s*\n\s*/g, ' ');
      // Remove any trailing "Page" text
      entry = entry.replace(/\s+Page\s*$/, '');
      experienceEntries.push(entry);
    }

    // If we found individual entries, format them with line breaks
    if (experienceEntries.length > 0) {
      experience = experienceEntries.join('\n\n');
    } else if (experience && experience.length < 100) {
      // Fallback: try to extract from the Experience section more broadly
      const expSectionPattern = /Experience\s+([^.]*?)(?:Education|Skills|Summary|Contact|Languages|Top Skills|$)/i;
      const expSectionMatch = cleanText.match(expSectionPattern);
      if (expSectionMatch) {
        experience = expSectionMatch[1].trim();
      }
    }

    // Extract education - look for the Education section (if present)
    const educationPattern = /Education\s+([^.]*?)(?:Skills|Experience|Summary|Contact|Languages|Top Skills|$)/i;
    const educationMatch = cleanText.match(educationPattern);
    const education = educationMatch ? educationMatch[1].trim() : '';

    // Extract skills - look for Top Skills section and capture only technical skills (stop before Languages)
    const skillsPattern = /Top Skills\s+([^.]*?)(?:Languages|$)/i;
    const skillsMatch = cleanText.match(skillsPattern);
    let skills = skillsMatch ? skillsMatch[1].trim() : '';

    // Clean up skills - remove extra spaces and format properly
    if (skills) {
      skills = skills.replace(/\s+/g, ' ').trim();
      // Extract only technical skills, exclude languages
      const skillItems = skills.match(/(?:Cascading Style Sheets|User Experience|Web Design)(?:\s*\([^)]*\))?/gi);
      if (skillItems) {
        skills = skillItems.join(', ');
      }
    }

    // If still no bio, try to extract from the description after name
    if (!bio) {
      const bioAltPattern = /(?:Freelance Tech Creator|Full Stack Developer).*?\|([^|]*?)(?:Experience|Education|Skills|$)/i;
      const bioAltMatch = cleanText.match(bioAltPattern);
      if (bioAltMatch) {
        bio = bioAltMatch[1].trim();
      }
    }

    // If still no location, try to find it in experience section
    if (!location) {
      const locationAltMatch = cleanText.match(/(?:Skopje|North Macedonia)/);
      if (locationAltMatch) {
        location = locationAltMatch[0];
      }
    }

    return {
      name: name,
      location: location,
      phone: phone,
      bio: bio,
      experience: experience,
      education: education,
      skills: skills
    };
  };

  const parseLinkedInPDF = async (file: File) => {
    try {
      setIsParsing(true);

      // Parse the PDF text content
      const pdfText = await parsePdfText(file);

      // Log the raw PDF text for debugging
      console.log('Raw PDF Text:', pdfText);

      // Extract sections based on common LinkedIn PDF patterns
      const sections = extractSectionsFromPDFText(pdfText);

      // Log extracted sections for debugging
      console.log('Extracted Sections:', sections);

      // Update form data with extracted information
      setModalCvData(prev => ({
        ...prev,
        bio: sections.bio || prev.bio,
        experience: sections.experience || prev.experience,
        education: sections.education || prev.education,
        skills: sections.skills || prev.skills,
      }));

      success('LinkedIn PDF data imported successfully!');
    } catch (err) {
      console.error('Error parsing PDF:', err);
      error('Error importing LinkedIn PDF. Please try another file.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
      } else {
        error('Please select a PDF file');
      }
    }
  };

  const handleImportFromLinkedIn = async () => {
    if (!pdfFile) {
      error('Please select a PDF file first');
      return;
    }

    await parseLinkedInPDF(pdfFile);
  };

  const handleStartInterview = async () => {
    if (!jobPosting.trim()) {
      error('Please fill in the job posting field');
      return;
    }
    if (!cv.trim()) {
      error('Please edit your CV before starting the interview');
      return;
    }

    setIsLoading(true);

    try {
      // Clear any previous interview session data
      localStorage.removeItem('interviewJobPosting');
      localStorage.removeItem('interviewCv');
      localStorage.removeItem('interviewCompanyInfo');
      localStorage.removeItem('interviewNumberOfQuestions'); // Also clear the number of questions

      // Sanitize user inputs before saving
      const sanitizedJobPosting = sanitizeJobPostingSafe(jobPosting);
      const sanitizedCv = sanitizeUserCVSafe(cv);
      const sanitizedCompanyInfo = extractCompanyInfo(jobPosting);

      // Save sanitized data to localStorage
      localStorage.setItem('interviewJobPosting', sanitizedJobPosting);
      localStorage.setItem('interviewCv', sanitizedCv);
      localStorage.setItem('interviewCompanyInfo', sanitizedCompanyInfo);
      // Save the selected number of questions
      localStorage.setItem('interviewNumberOfQuestions', numberOfQuestions.toString());

      // Simulate API call to prepare interview
      setTimeout(() => {
        setIsLoading(false);
        router.push('/interview/session');
      }, 1500);
    } catch (err) {
      console.error('Error starting interview:', err);
      error('An error occurred while starting your interview. Please try again.');
      setIsLoading(false);
    }
  };

  const handleEditCv = () => {
    // Load CV from profile or use current session CV
    setModalCvData({
      bio: userProfile?.bio || '',
      experience: userProfile?.experience || '',
      education: userProfile?.education || '',
      skills: userProfile?.skills || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveToDatabase = async () => {
    if (!user) return;

    try {
      const profileData = {
        bio: modalCvData.bio,
        experience: modalCvData.experience,
        education: modalCvData.education,
        skills: modalCvData.skills,
        updated_at: new Date().toISOString(),
      };
      const successResult = await updateUserProfile(user.id, profileData);
      if (successResult) {
        success('CV saved to database successfully!');
        // Combine the CV data for the session in the same order as on profile page
        const sections = [];
        if (modalCvData.bio) sections.push(`Bio:\n${modalCvData.bio}`);
        if (modalCvData.experience) sections.push(`Experience:\n${modalCvData.experience}`);
        if (modalCvData.education) sections.push(`Education:\n${modalCvData.education}`);
        if (modalCvData.skills) sections.push(`Skills:\n${modalCvData.skills}`);

        const combinedCv = sections.join('\n\n');
        setCv(combinedCv);
        setUserProfile(prev => prev ? { ...prev, ...profileData } : null);
        setIsModalOpen(false);
      } else {
        error('Failed to save CV to database');
      }
    } catch (err) {
      error('An error occurred while saving CV');
    }
  };

  const handleSaveForSession = () => {
    // Combine the CV data for the session in the same order as on profile page
    const sections = [];
    if (modalCvData.bio) sections.push(`Bio:\n${modalCvData.bio}`);
    if (modalCvData.experience) sections.push(`Experience:\n${modalCvData.experience}`);
    if (modalCvData.education) sections.push(`Education:\n${modalCvData.education}`);
    if (modalCvData.skills) sections.push(`Skills:\n${modalCvData.skills}`);

    const combinedCv = sections.join('\n\n');
    setCv(combinedCv);
    success('CV saved for this session!');
    setIsModalOpen(false);
  };

  const fetchJobFromUrl = async () => {
    if (!jobPostingUrl) {
      error('Please enter a URL first');
      return;
    }

    try {
      setIsFetchingJob(true);
      // Call our API route to fetch and extract text from the URL
      const response = await fetch('/api/extract-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: jobPostingUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();

      if (data.text) {
        // Extract company info from the text if possible
        const extractedCompanyInfo = extractCompanyInfo(data.text);
        setJobPosting(data.text);
        success('Job posting content fetched successfully!');
      } else {
        error('Could not extract content from the provided URL. Please paste the content directly.');
      }
    } catch (err) {
      error('Failed to fetch job posting. Please try pasting the content directly.');
    } finally {
      setIsFetchingJob(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      // Reset file input
      e.target.value = '';

      // For now, just simulate reading the file content
      // In a real implementation, you would parse the file content
      const fileText = `[CV content from ${file.name} would be processed here...]`;
      setCv(fileText);
      success('CV file processed successfully!');

      // Update the modal data with the file content
      setModalCvData({
        bio: fileText,
        experience: '',
        education: '',
        skills: ''
      });
    } catch (err) {
      error('Failed to process CV file. Please try pasting the content directly.');
    } finally {
      setIsLoading(false);
    }
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

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
        <Navigation />
        <main className="flex-1 p-4">
          <div className="container mx-auto max-w-4xl py-8">
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-60 dark:text-gray-400">Loading interview setup...</p>
            </div>
          </div>
        </main>

        {/* CV Edit Modal */}
        <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
          <SheetContent className="w-full sm:max-w-2xl">
            <SheetHeader>
              <SheetTitle>Edit Your CV</SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bio/Summary
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Enter your professional summary or bio..."
                  value={modalCvData.bio}
                  onChange={(e) => setModalCvData(prev => ({ ...prev, bio: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Experience
                </Label>
                <Textarea
                  id="experience"
                  placeholder="Enter your work experience..."
                  value={modalCvData.experience}
                  onChange={(e) => setModalCvData(prev => ({ ...prev, experience: e.target.value }))}
                  className="min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Education
                </Label>
                <Textarea
                  id="education"
                  placeholder="Enter your education background..."
                  value={modalCvData.education}
                  onChange={(e) => setModalCvData(prev => ({ ...prev, education: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Skills
                </Label>
                <Textarea
                  id="skills"
                  placeholder="Enter your key skills..."
                  value={modalCvData.skills}
                  onChange={(e) => setModalCvData(prev => ({ ...prev, skills: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              <SheetFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={handleSaveForSession}>
                  Save for this session
                </Button>
                <Button onClick={handleSaveToDatabase}>
                  Save to database
                </Button>
              </SheetFooter>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  // Check if user profile is incomplete
  const profileIncomplete = userProfile && !isProfileComplete();

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData config={pageSEO.interview} />

      <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 right-[-100px] w-3/4 h-full bg-gradient-to-l from-green-500/30 via-lime-400/25 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s]"></div>
          <div className="absolute -top-1/3 right-[-60px] w-1/2 h-3/4 bg-gradient-to-l from-lime-500/20 via-green-400/20 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s] delay-1000"></div>
        </div>

        <Navigation />
        <main className="flex-1 p-4 relative z-10">
          <div className="container mx-auto max-w-4xl py-8">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-lime-600 text-white mx-auto">
                <span className="text-2xl font-bold">AI</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Start Your <span className="text-green-600">Personalized</span> Interview
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Tailor your practice session with a job posting and your CV for the most realistic AI interview experience.
              </p>
            </div>

            <Card className="dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-gray-900 dark:text-white flex items-center">
                  <span className="mr-2">🎯</span>
                  Setup Your Interview Session
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <Card className="dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <p className="text-green-700 dark:text-green-300 font-bold text-sm"><span className="mr-2">🎁</span>
                      Free Usage Policy</p>
                    <p className="text-green-70 dark:text-green-300 text-sm">
                      Your first complete interview is completely free! After that, you'll get 2 additional AI interactions per day to continue practicing. No credit card required to get started.
                    </p>
                  </CardContent>
                </Card>

                {/* Profile Incomplete Notice */}
                {profileIncomplete ? (
                  <Card className="dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-80">
                    <CardHeader className="border-b border-yellow-200 dark:border-yellow-800">
                      <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center text-lg">
                        <span className="mr-2">⚠️</span>
                        Profile Incomplete
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-yellow-700 dark:text-yellow-300 mb-3">
                        Your profile is not fully completed. For best interview results, please fill out all profile information.
                      </p>
                      <div className="flex flex-row gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          onClick={() => router.push('/profile')}
                          className="whitespace-nowrap"
                        >
                          Go to Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                <Card className="dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-600">
                    <CardTitle className="text-gray-900 dark:text-white flex items-center text-lg">
                      <span className="mr-2">💼</span>
                      Job Posting URL or Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="job_posting_url"
                        type="text"
                        value={jobPostingUrl}
                        onChange={(e) => setJobPostingUrl(e.target.value)}
                        placeholder="Paste job posting URL here..."
                        className="flex-1 dark:bg-gray-700 dark:text-white"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={fetchJobFromUrl}
                        disabled={!jobPostingUrl || isLoading || isFetchingJob}
                        className="whitespace-nowrap"
                      >
                        {isFetchingJob ? (
                          <>
                            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] mr-2"></div>
                            Fetching...
                          </>
                        ) : (
                          'Fetch'
                        )}
                      </Button>
                    </div>

                    <Textarea
                      value={jobPosting}
                      onChange={(e) => {
                        const sanitizedInput = sanitizeJobPostingSafe(e.target.value);
                        setJobPosting(sanitizedInput);
                      }}
                      className="min-h-[120px] dark:bg-gray-700 dark:text-white"
                      placeholder="Or paste job description here. Include company overview, responsibilities, requirements, and any special instructions..."
                      rows={4}
                    />

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-start">
                        <span className="mr-1">💡</span>
                        <span>For best results, include company overview, responsibilities, requirements, and any special instructions.</span>
                      </span>
                      {isFetchingJob && (
                        <div className="mt-2 text-blue-600 dark:text-blue-400 flex items-center">
                          <div className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] mr-2"></div>
                          Processing job posting content... This may take a few seconds for larger pages.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-600">
                    <CardTitle className="text-gray-900 dark:text-white flex items-center text-lg">
                      <span className="mr-2">📄</span>
                      Your CV or Resume
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <Textarea
                      value={cv}
                      onChange={(e) => {
                        const sanitizedInput = sanitizeUserCVSafe(e.target.value);
                        setCv(sanitizedInput);
                      }}
                      className="min-h-[120px] dark:bg-gray-700 dark:text-white"
                      placeholder="Or paste your resume text here..."
                      rows={4}
                    />

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-start">
                          <span className="mr-1">💡</span>
                          <span>Make sure to include your work experience, education, skills, and a brief professional summary.</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleEditCv}
                          className="whitespace-nowrap"
                        >
                          Edit CV
                        </Button>

                        {/* LinkedIn PDF Import Button - Only show if profile is incomplete */}
                        {profileIncomplete && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                // Scroll to the LinkedIn PDF import section
                                const element = document.getElementById('linkedin-import-section');
                                element?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="whitespace-nowrap"
                            >
                              Import from LinkedIn PDF
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* LinkedIn PDF Import Section - Only show if profile is incomplete */}
                    {profileIncomplete && (
                      <Card className="dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <CardHeader className="border-b border-blue-200 dark:border-blue-80">
                          <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center">
                            <span className="mr-2">📄</span>
                            Import from LinkedIn PDF
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <p className="text-blue-700 dark:text-blue-300 mb-2">
                            Upload your LinkedIn profile PDF to automatically fill in your information
                          </p>
                          <p className="text-blue-600 dark:text-blue-400 text-xs mb-4">
                            Tip: To get your LinkedIn PDF, go to your profile page, click the "More" button, and select "Save to PDF"
                          </p>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <Label htmlFor="linkedin-pdf" className="text-gray-700 dark:text-gray-300">Select LinkedIn PDF</Label>
                              <Input
                                id="linkedin-pdf"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="mt-1 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                onClick={handleImportFromLinkedIn}
                                disabled={!pdfFile || isParsing}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {isParsing ? 'Importing...' : 'Import Data'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>

                {/* Number of Questions Selector */}
                <Card className="dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <CardHeader className="border-b border-purple-200 dark:border-purple-800">
                    <CardTitle className="text-purple-800 dark:text-purple-200 flex items-center">
                      <span className="mr-2">🔢</span>
                      Number of Interview Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>5 questions</span>
                        <span>10 questions</span>
                      </div>
                      <RangeInput
                        defaultValue="5"
                        min="5"
                        max="10"
                        step="1"
                        onChange={(e) => setNumberOfQuestions(parseInt(e.target.value, 10))}
                        className="w-full"
                      />
                      <div className="text-center mt-2">
                        <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                          {numberOfQuestions} questions
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>Less</span>
                        <span>More</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <p className="text-blue-700 dark:text-blue-300 font-bold text-sm"><span className="mr-2">📄</span>
                      CV Information</p>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      Your CV data from your profile will be automatically used for this interview.
                    </p>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row justify-end gap-4">
                  <Button
                    onClick={handleStartInterview}
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90"
                  >
                    {isLoading ? 'Preparing Interview...' : 'Start AI Interview'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* CV Edit Modal */}
        <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
          <SheetContent className="w-full sm:max-w-2xl">
            <SheetHeader>
              <SheetTitle>Edit Your CV</SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bio/Summary
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Enter your professional summary or bio..."
                  value={modalCvData.bio}
                  onChange={(e) => setModalCvData(prev => ({ ...prev, bio: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Experience
                </Label>
                <Textarea
                  id="experience"
                  placeholder="Enter your work experience..."
                  value={modalCvData.experience}
                  onChange={(e) => setModalCvData(prev => ({ ...prev, experience: e.target.value }))}
                  className="min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Education
                </Label>
                <Textarea
                  id="education"
                  placeholder="Enter your education background..."
                  value={modalCvData.education}
                  onChange={(e) => setModalCvData(prev => ({ ...prev, education: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Skills
                </Label>
                <Textarea
                  id="skills"
                  placeholder="Enter your key skills..."
                  value={modalCvData.skills}
                  onChange={(e) => setModalCvData(prev => ({ ...prev, skills: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <SheetFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={handleSaveForSession}>
                Save for this session
              </Button>
              <Button onClick={handleSaveToDatabase}>
                Save to database
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>


      </div>
    </>
  );
}
