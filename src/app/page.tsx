'use client';

import CollapsibleFAQ from '@/components/collapsible-faq';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/navigation';
import X402ComplianceBadge from '@/components/x402-compliance-badge';
// import InvitationCodeForm from '@/components/invitation-code-form';
// import { InvitationCodeService } from '@/lib/invitation-code-service';
// import { useAuth } from '@/lib/auth-context';
// COMMENTED OUT FOR HACKATHON - RESTORE AFTER
import { useAuth } from '@/lib/auth-context';
import { StructuredData, pageSEO } from '@/lib/seo';
import SEO from '@/components/seo';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  // COMMENTED OUT FOR HACKATHON - INVITATION SYSTEM REMOVED
  // const [showInvitationForm, setShowInvitationForm] = useState(false);
  // const [validatingCode, setValidatingCode] = useState(true);
  // TEMP VARS FOR DIRECT ACCESS
  const [showInvitationForm, setShowInvitationForm] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);

  // COMMENTED OUT FOR HACKATHON - INVITATION SYSTEM REMOVED
  // All invitation checking logic commented out
  /*
  useEffect(() => {
    // Check for invitation code or authentication
    const checkAccess = async () => {
      if (authLoading) return;

      // If user is authenticated, they have access
      if (user) {
        setValidatingCode(false);
        return;
      }

      // Check URL for invitation code parameter using window.location.search
      // This approach doesn't require useSearchParams() which needs Suspense
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlCode = urlParams.get('code');

        if (urlCode) {
          setValidatingCode(true);
          try {
            const result = await InvitationCodeService.validateCode(urlCode);
            if (result.valid) {
              // Store the validation in localStorage for session
              localStorage.setItem('invitationCodeUsed', urlCode.trim().toUpperCase());
              // Clean URL by removing the code parameter
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('code');
              window.history.replaceState({}, '', newUrl.toString());
              setShowInvitationForm(false);
              setValidatingCode(false);
              return;
            }
          } catch (error) {
            console.error('Error validating URL code:', error);
          }
        }
      }

      // Check if user has used an invitation code in this session
      const invitationCodeUsed = localStorage.getItem('invitationCodeUsed');
      if (invitationCodeUsed) {
        // For session persistence, we trust the localStorage flag
        // The code was already validated when it was first entered
        setShowInvitationForm(false);
      } else {
        setShowInvitationForm(true);
      }

      setValidatingCode(false);
    };

    checkAccess();
  }, [user, authLoading]);
  */

  // Simple version for direct access - no invitation checking needed
  useEffect(() => {
    // COMMENTED OUT FOR HACKATHON - INVITATION SYSTEM REMOVED
    // setValidatingCode(false); // This was causing linting issues
  }, []);

  // COMMENTED OUT FOR HACKATHON - REMOVED INVITATION FORM
  /*
  // Show loading while checking access
  if (validatingCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show invitation form if no access
  if (showInvitationForm) {
    return <InvitationCodeForm />;
  }
  */

  // Features data - ENHANCED with Unlock Teaser Messaging (Phase 2A Week 4)
  const features = [
    {
      title: "🔓 Unlock Hyper-Personalized AI Interviews",
      description: "Sign up to get AI interviewers trained on YOUR specific job application and company info - no more generic practice questions.",
      icon: "🎯",
      teasable: true,
      unlockText: "Get personalized AI interviews now"
    },
    {
      title: "🔓 Unlock Realistic Interview Simulations",
      description: "Join thousands who practice with dynamic AI that understands your target role requirements and company culture.",
      icon: "🎭",
      teasable: true,
      unlockText: "Experience real interview simulation"
    },
    {
      title: "🔓 Unlock Instant Expert Feedback",
      description: "Get detailed AI analysis of your responses against FAANG interview standards - see why 87% report higher confidence.",
      icon: "💬",
      teasable: true,
      unlockText: "Start getting expert feedback today"
    },
    {
      title: "🔓 Unlock 24/7 Practice Availability",
      description: "Practice with completely personalized AI interviewers anytime - built specifically for your career goals and job applications.",
      icon: "⏱️",
      teasable: true,
      unlockText: "Practice interviews 24/7 for free"
    },
    {
      title: "Gamification & Rewards",
      description: "Earn points, unlock badges, and track your progress with our engaging gamification system.",
      icon: "🏆",
      status: "coming-soon"
    },
    {
      title: "Social Features",
      description: "Share achievements, compete with friends, and get motivation from our supportive community.",
      icon: "👥",
      status: "coming-soon"
    }
  ];

  // Stats data
  const stats = [
    { value: "87%", label: "Reported Confidence Increase" },
    { value: "42%", label: "Higher Interview Success Rate" },
    { value: "10K+", label: "Practice Interviews Completed" },
    { value: "24/7", label: "Availability" }
  ];

  return (
    <>
      <SEO
        title="Ainterview: AI Technical Interview Coach - Prepare for FAANG Coding Interviews"
        description="Practice systems design interviews with AI feedback. Master FAANG technical interviews with real-time analysis of algorithms, data structures, and problem-solving skills. Get hired faster with personalized AI coaching."
        keywords="FAANG interview practice, systems design interview, AI coding practice, technical interview preparation, data structures algorithms training, software engineer interview AI"
      />
      {/* Structured Data for SEO */}
      <StructuredData config={pageSEO.homepage} />

      <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-black font-sans">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 right-[-100px] w-3/4 h-full bg-gradient-to-l from-green-500/30 via-lime-400/25 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s]"></div>
          <div className="absolute -top-1/3 right-[-60px] w-1/2 h-3/4 bg-gradient-to-l from-lime-500/20 via-green-400/20 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s] delay-1000"></div>
        </div>

        <Navigation />
        <main className="flex w-full flex-1 items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-6xl py-12 px-4">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-white mx-auto">
                <Image src="/logo.png" alt="Ainterview Logo - AI Technical Interview Practice Platform" width={80} height={80} className="h-full w-full p-2" priority />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                AI Mock Interview Coaching <br />for <span className="text-green-600">High-Stakes</span> Roles
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
                AI-powered, personalized practice that transforms your interview preparation and helps you land your dream job.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button
                  className="w-full sm:w-auto py-6 text-lg px-8 bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90"
                  onClick={() => router.push('/interview')}
                >
                  Start Practice for Free
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto py-6 text-lg px-8"
                  onClick={() => router.push('/about')}
                >
                  See How It Works
                </Button>
              </div>

              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                5 free credits when you sign in and another 2 each day • No credit card required
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-white/80 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                  <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Conversion Teaser Section - Phase 2A Week 4 Implementation */}
            <div className="mb-16">
              <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-50 to-lime-50 dark:from-green-900/20 dark:to-lime-900/20 p-8 rounded-2xl border border-green-200 dark:border-green-800">
                <div className="text-center mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    🎯 Ready to Elevate Your Interview Game?
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    Stop practicing generic questions. Get AI feedback tailored to FAANG standards and your specific job applications.
                    Join 10K+ professionals who improved their interview skills and landed better positions.
                  </p>

                  {/* Social Proof Pillars */}
                  <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                    <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full">
                      <span className="text-green-600">📈</span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">42% Higher Success Rate</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full">
                      <span className="text-green-600">⭐</span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">FAANG-Level AI Feedback</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full">
                      <span className="text-green-600">🎓</span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Company-Specific Training</span>
                    </div>
                  </div>

                  {/* CTA Buttons with Enhanced Messaging */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto py-4 px-8 text-lg bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90 transition-all duration-200 transform hover:scale-105"
                      onClick={() => router.push('/auth')}
                    >
                      🔥 Get 5 Free Interview Credits Now
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto py-4 px-8 text-lg border-green-500 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                      onClick={() => router.push('/help')}
                    >
                      📖 Learn How AI Practice Helps
                    </Button>
                  </div>

                  {/* Urgency & Benefits Pill */}
                  <div className="mt-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/10 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium">
                      <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                      ⚡ Terms: Get unlimited access • Cancel anytime • x402 secure payments
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                Why Ainterview Stands Apart
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-2xl mt-1" aria-hidden="true">{feature.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                            {feature.status === 'new' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-16">
              <CollapsibleFAQ
                title="Common Questions About Ainterview"
                variant="compact"
                className="max-w-4xl mx-auto"
              />
            </div>

            {/* x402 Compliance Badge */}
            <div className="mt-8 text-center">
              <X402ComplianceBadge />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
