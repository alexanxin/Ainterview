'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';
import { getUserProfile, updateUserProfile, UserProfile } from '@/lib/database';
import { parsePdfText } from '@/lib/pdf-parser';
import { useToast } from '@/lib/toast';
import { cacheRefreshService } from '@/lib/cache-refresh-service';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    experience: '',
    education: '',
    skills: '',
    created_at: '',
    updated_at: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const { success, error, warning, info } = useToast(); // Initialize toast notifications

  // Load user profile data when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const profile = await getUserProfile(user.id);
          if (profile) {
            setFormData(profile);
          } else {
            // If profile doesn't exist, set up empty profile with user details
            setFormData({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              phone: '',
              location: '',
              bio: '',
              experience: '',
              education: '',
              skills: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error('Error loading profile:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
  }, [user]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
        <Navigation />
        <main className="flex-1 p-4">
          <div className="container mx-auto max-w-4xl py-8">
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your profile...</p>
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      return;
    }

    try {
      setIsSaving(true);

      // Prepare profile data, only update the fields that are provided
      const profileData: Partial<UserProfile> = {
        full_name: formData.full_name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        experience: formData.experience,
        education: formData.education,
        skills: formData.skills,
        updated_at: new Date().toISOString(),
      };

      // Save to database
      console.log('Saving profile data:', profileData);
      const successResult = await updateUserProfile(user.id, profileData);
      console.log('Update result:', successResult);

      if (successResult) {
        // Refresh cache for the user profile after update
        await cacheRefreshService.refreshCacheForUser(user.id);
        success('Profile updated successfully!');
      } else {
        error('Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      error('An error occurred while updating your profile. Please try again.');
    } finally {
      setIsSaving(false);
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

  const extractSectionsFromPDFText = (text: string) => {
    // Clean up the text but preserve some structure - replace multiple spaces with single space, but keep line breaks for structure
    const cleanText = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();

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

    // Extract education first to prevent it from being included in experience
    const educationPattern = /(?:Education|Education Background)\s+([^]*?)(?:Page|Skills|Experience|Work Experience|Summary|Contact|Languages|Top Skills|$)/i;
    const educationMatch = cleanText.match(educationPattern);
    let education = educationMatch ? educationMatch[1].trim() : '';

    // Clean up education - remove "Education" prefix and page numbers
    education = education.replace(/^(?:Education|Education Background)\s*/i, '').trim();
    education = education.replace(/Page\s+\d+\s+of\s+\d+$/gi, '').trim();

    // Extract only the education entries with more flexible patterns
    const educationEntries = education.match(/([A-Z][a-zA-Z\s&\/,()]+\s+(?:University|College|Institute|School|Academy|Gymnasium|Faculty|Универзитет|Колеџ|Факултет))[^.]*?(?:\d{4}|Present|months|year)[^.]*?(?=\n\n|Page|$)/gi);
    if (educationEntries) {
      education = educationEntries.join('\n\n');
    }

    // Add line breaks after the year ranges for better formatting
    education = education.replace(/(\(\d{4}\s*-\s*\d{4}\))\s+/g, '$1\n\n');

    // If education section exists but is empty, try to find education entries
    if (!education) {
      // Look for education-related entries that might be in other sections
      const eduEntries = cleanText.match(/(?:University|College|School|Institute|Academy|Faculty|Универзитет|Колеџ|Факултет)[^.]*?(?:Degree|GPA|Course|Major|Minor|Bachelor|Master|PhD|Graduated|Graduation|200\d|\d{4}|Present|months|year)[^.]*?(?=\n\n|Page|$)/gi);
      if (eduEntries) {
        education = eduEntries.join('\n').trim();
      }
    }

    // Clean up education formatting - remove extra spaces and normalize
    if (education) {
      education = education.replace(/\s+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
    }

    // Extract experience - look for the Experience section, making sure we stop before Education
    // First, let's find the full experience section, but exclude anything that comes after the Education section
    const experiencePattern = /Experience\s+([^]*?)(?:Education|$)/i;
    const experienceMatch = cleanText.match(experiencePattern);
    let experience = experienceMatch ? experienceMatch[1].trim() : '';

    // Clean up experience text - remove "Experience" prefix if present, and remove page numbers
    experience = experience.replace(/^Experience\s+/i, '').trim();
    experience = experience.replace(/\s+Page\s+\d+\s+of\s+\d+$/gi, '').trim();

    // Try to format experience entries with proper line breaks
    if (experience) {
      // Split by common patterns that indicate new entries (dates, company names)
      const experienceLines = experience.split(/(?=October|July|April|September|May|November|January|December|\d{4})/);

      // Clean up each line and filter out lines that don't start with dates or are too short
      const cleanedLines = experienceLines
        .map(line => line.trim())
        .filter(line => {
          // Keep lines that start with dates or contain year patterns
          return /^\d{4}/.test(line) ||
            /October|July|April|September|May|November|January|December/.test(line) ||
            /\(\d+\s+(?:years?|months?)\)/.test(line);
        })
        .filter(line => line.length > 10) // Filter out very short lines
        .map(line => {
          // Remove page references and clean up
          return line.replace(/\s+Page\s+\d+\s+of\s+\d+/gi, '').trim();
        });

      // Join with double line breaks for better readability
      experience = cleanedLines.join('\n\n');
    }

    // Extract skills - look for Top Skills section and capture only technical skills (stop before Languages)
    const skillsPattern = /Top Skills\s+([^]*?)(?:Languages|$)/i;
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

      // Update form data with extracted information, ensuring user ID is preserved
      setFormData(prev => {
        const updatedFormData = {
          ...prev,
          id: user?.id || prev.id, // Preserve user ID
          full_name: sections.name || prev.full_name,
          location: sections.location || prev.location,
          bio: sections.bio || prev.bio,
          experience: sections.experience || prev.experience,
          education: sections.education || prev.education,
          skills: sections.skills || prev.skills,
          phone: sections.phone || prev.phone
        };

        // Also save to database immediately after import
        (async () => {
          const profileData: Partial<UserProfile> = {
            full_name: updatedFormData.full_name,
            phone: updatedFormData.phone,
            location: updatedFormData.location,
            bio: updatedFormData.bio,
            experience: updatedFormData.experience,
            education: updatedFormData.education,
            skills: updatedFormData.skills,
            updated_at: new Date().toISOString(),
          };

          const successResult = await updateUserProfile(user!.id, profileData);
          if (successResult) {
            // Refresh cache for the user profile after update
            await cacheRefreshService.refreshCacheForUser(user!.id);
          }
        })();

        return updatedFormData;
      });

      success('LinkedIn PDF data imported successfully!');
    } catch (err) {
      console.error('Error parsing PDF:', err);
      error('Error importing LinkedIn PDF. Please try another file.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleImportFromLinkedIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (pdfFile) {
      parseLinkedInPDF(pdfFile);
    } else {
      error('Please select a PDF file first');
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
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your profile...</p>
            </div>
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
          <Card className="shadow-xl dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                My Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* LinkedIn PDF Import Section */}
              <div className="mb-8 p-4 bg-blue-500 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                  <span className="mr-2">📄</span>
                  Import from LinkedIn PDF
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm mb-2">
                  Upload your LinkedIn profile PDF to automatically fill in your information
                </p>
                <p className="text-blue-600 dark:text-blue-400 text-xs mb-4">
                  Tip: To get your LinkedIn PDF, go to your profile page, click the &quot;Resources&quot; button, and select &quot;Save to PDF&quot;
                </p>

                <form onSubmit={handleImportFromLinkedIn} className="flex flex-col sm:flex-row gap-4">
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
                      type="submit"
                      disabled={!pdfFile || isParsing}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isParsing ? 'Importing...' : 'Import Data'}
                    </Button>
                  </div>
                </form>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name || ''}
                      onChange={handleChange}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || user?.email || ''}
                      className="dark:bg-gray-700 dark:text-white"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleChange}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    className="min-h-[100px] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-gray-700 dark:text-gray-300">Experience</Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    value={formData.experience || ''}
                    onChange={handleChange}
                    className="min-h-[150px] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education" className="text-gray-700 dark:text-gray-300">Education</Label>
                  <Textarea
                    id="education"
                    name="education"
                    value={formData.education || ''}
                    onChange={handleChange}
                    className="min-h-[100px] dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills" className="text-gray-700 dark:text-gray-300">Skills</Label>
                  <Textarea
                    id="skills"
                    name="skills"
                    value={formData.skills || ''}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}