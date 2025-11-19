'use client';

// Interactive Interview Demo for Login-Gated SEO Strategy (Phase 2A Week 5)
// Showcases mock interview interface and sample AI feedback without requiring sign-up

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, MessageCircle, User, Award, Star, Mic, TrendingUp, Target } from 'lucide-react';
import Navigation from '@/components/navigation';
import X402ComplianceBadge from '@/components/x402-compliance-badge';
import SEO from '@/components/seo';
import { useRouter } from 'next/navigation';

// Demo Data: Sample interview questions, answers, and AI feedback (Phase 2A Week 5)
const demoQuestions = [
    {
        id: 'q1',
        question: "Tell me about your experience with React performance optimization.",
        category: "Frontend Development",
        difficulty: 'medium' as const,
        sampleAnswer: "I've optimized React applications by implementing React.memo, useMemo, and useCallback to prevent unnecessary re-renders. I also use code splitting, lazy loading, and bundle size optimization."
    },
    {
        id: 'q2',
        question: "Describe your system design process for a large-scale application.",
        category: "System Design",
        difficulty: 'hard' as const,
        sampleAnswer: "For large-scale applications, I start by analyzing functional requirements and identify data flow patterns. I consider scalability, partitioning strategies, load balancing, and database design."
    }
];

const mockFeedback = {
    overallScore: 85,
    strengths: [
        "Strong technical understanding of React optimization techniques",
        "Good awareness of performance profiling tools",
        "Excellent explanation of code splitting and bundle optimization"
    ],
    improvements: [
        "Could be more specific about useCallback dependencies",
        "Missing mention of React Query/React Router lazy loading",
        "Consider virtualization for large lists"
    ],
    tips: [
        "Practice with React DevTools Performance tab",
        "Consider server-side rendering for initial load performance",
        "Think about context vs prop drilling trade-offs"
    ],
    faangGood: true
};

// Interfaces for type safety
interface DemoQuestion {
    id: string;
    question: string;
    sampleAnswer: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface DemoFeedback {
    overallScore: number;
    strengths: string[];
    improvements: string[];
    tips: string[];
    faangGood: boolean;
}

interface DemoStep {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'active' | 'completed';
    icon: React.ReactNode;
}

export default function DemoPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    // Mock demo flow steps (Phase 2A Week 5 Implementation)
    const steps: DemoStep[] = [
        {
            id: 'show-question',
            title: 'Show Sample Question',
            description: 'Display a sample technical interview question',
            status: currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : 'pending',
            icon: <MessageCircle className="w-5 h-5" />
        },
        {
            id: 'sample-answer',
            title: 'See Personalization Benefits',
            description: 'Show how our system creates tailored content',
            status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending',
            icon: <User className="w-5 h-5" />
        },
        {
            id: 'ai-feedback',
            title: 'Experience AI Feedback',
            description: 'See detailed, actionable feedback from our AI model',
            status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending',
            icon: <Award className="w-5 h-5" />
        },
        {
            id: 'signup-teaser',
            title: 'Unlock Full Experience',
            description: 'See what you get when you sign up',
            status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending',
            icon: <Star className="w-5 h-5" />
        }
    ];

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const getStatusIcon = (status: DemoStep['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'active':
                return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
            default:
                return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-black font-sans">
            <SEO
                title="Demo: AI Technical Interview Practice - Experience Before You Sign Up"
                description="Try Ainterview's AI interview practice demo. See how personalized feedback works with sample technical interview questions. Sign up to unlock full AI coaching."
                keywords="AI interview demo, technical interview trial, interview simulator online, AI coaching demo, FAANG preparation trial"
            />

            <Navigation />

            <main className="flex-1 p-4 relative z-10">
                <div className="container mx-auto max-w-6xl py-8">
                    {/* SEO-Optimized Header (Phase 2A Week 5) */}
                    <div className="text-center mb-12">
                        <div className="flex justify-center mb-6">
                            <Target className="w-16 h-16 text-green-600" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                            Try AI Interview Practice
                        </h1>
                        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto mb-8">
                            Experience how Ainterview's personalized AI coaching transforms your technical interview preparation.
                            See sample questions and get a preview of our AI feedback system.
                        </p>

                        {/* Social Proof Pill */}
                        <div className="inline-flex items-center px-6 py-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
                            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                87% of users report higher confidence • FAANG-standard analysis
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Progress Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="dark:bg-gray-800/50 sticky top-4">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Mic className="w-5 h-5" />
                                        Demo Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {steps.map((step, index) => (
                                        <div key={step.id} className="flex items-start gap-3">
                                            <div className="mt-1">
                                                {getStatusIcon(step.status)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                    {step.title}
                                                </h3>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Navigation Buttons */}
                                    <div className="pt-6 space-y-2 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex gap-2">
                                            {currentStep > 0 && (
                                                <Button onClick={prevStep} variant="outline" size="sm" className="flex-1">
                                                    Previous
                                                </Button>
                                            )}
                                            {currentStep < steps.length - 1 && (
                                                <Button onClick={nextStep} size="sm" className="flex-1 bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90">
                                                    Next
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Demo Content */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Step 0: Show Sample Question */}
                            {currentStep >= 0 && (
                                <Card className="dark:bg-gray-800/50">
                                    <CardHeader>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <MessageCircle className="w-6 h-6 text-blue-600" />
                                            Sample Interview Question
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                                                    {demoQuestions[0].category}
                                                </span>
                                                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded">
                                                    {demoQuestions[0].difficulty}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                {demoQuestions[0].question}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                In our full system, this question would be customized to your specific job application and company. The question type and difficulty would be tailored to your target position level.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 1: Sample Answer Shows Personalization */}
                            {currentStep >= 1 && (
                                <Card className="dark:bg-gray-800/50">
                                    <CardHeader>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <User className="w-6 h-6 text-green-600" />
                                            Personalized Content Creation
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-gradient-to-r from-green-50 to-lime-50 dark:from-green-900/20 dark:to-lime-900/20 p-6 rounded-lg">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                Sample Response (Personalized for a Senior React Developer position)
                                            </h3>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700 mb-4">
                                                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                                                    {demoQuestions[0].sampleAnswer}
                                                </p>
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                                    ✨ What Makes Our Answers Different:
                                                </h4>
                                                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                                    <li>• References your actual CV and experience</li>
                                                    <li>• Tailored to the specific company and role</li>
                                                    <li>• Optimized for the interviewer's perspective</li>
                                                    <li>• Uses industry-best practices for your tech stack</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 2: AI Feedback Preview */}
                            {currentStep >= 2 && (
                                <Card className="dark:bg-gray-800/50">
                                    <CardHeader>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <Award className="w-6 h-6 text-purple-600" />
                                            FAANG-Level AI Feedback
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
                                            {/* Overall Score */}
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    AI Analysis Score
                                                </h3>
                                                <div className="text-3xl font-bold text-purple-600">
                                                    {mockFeedback.overallScore}/100
                                                </div>
                                            </div>

                                            {/* Strengths */}
                                            <div className="mb-6">
                                                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" />
                                                    What You Did Well
                                                </h4>
                                                <ul className="space-y-2">
                                                    {mockFeedback.strengths.map((strength, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <span className="text-green-600 mt-1">✓</span>
                                                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                                {strength}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Areas for Improvement */}
                                            <div className="mb-6">
                                                <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-3 flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    Areas to Improve
                                                </h4>
                                                <ul className="space-y-2">
                                                    {mockFeedback.improvements.map((improvement, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <span className="text-yellow-600 mt-1">📈</span>
                                                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                                {improvement}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Tips */}
                                            <div className="mb-6">
                                                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                                                    <Star className="w-4 h-4" />
                                                    Expert Tips for You
                                                </h4>
                                                <ul className="space-y-2">
                                                    {mockFeedback.tips.map((tip, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <span className="text-blue-600 mt-1">💡</span>
                                                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                                {tip}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                                <p className="text-sm text-green-800 dark:text-green-200">
                                                    <strong>FAANG-Ready:</strong> This response demonstrates strong expertise and would perform well in interviews at top tech companies. Keep practicing these specific optimization techniques!
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 3: Sign-Up Teaser with Benefits */}
                            {currentStep >= 3 && (
                                <Card className="dark:bg-gray-800/50 border-2 border-green-200 dark:border-green-700">
                                    <CardHeader>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <Star className="w-6 h-6 text-yellow-500" />
                                            Unlock Your Full Potential
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-gradient-to-r from-green-50 via-lime-50 to-green-50 dark:from-green-900/20 dark:via-lime-900/20 dark:to-green-900/20 p-6 rounded-lg">
                                            <div className="text-center mb-8">
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                                    Ready to Get Your Best Interview Score Yet?
                                                </h3>
                                                <p className="text-gray-700 dark:text-gray-300">
                                                    Join thousands of developers who've landed their dream jobs
                                                </p>
                                            </div>

                                            {/* Benefits Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg">
                                                    <User className="w-8 h-8 text-blue-600" />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                                            Personalized Questions
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Based on your CV, target job, and company
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg">
                                                    <Award className="w-8 h-8 text-purple-600" />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                                            Expert AI Feedback
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Detailed analysis against FAANG standards
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg">
                                                    <Mic className="w-8 h-8 text-green-600" />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                                            Practice Session Recording
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Self-assess your delivery and confidence
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg">
                                                    <TrendingUp className="w-8 h-8 text-orange-600" />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                                            Progress Tracking
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            See improvement over time with detailed analytics
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-3 gap-4 mb-8">
                                                <div className="text-center bg-white dark:bg-gray-800 p-4 rounded-lg">
                                                    <div className="text-2xl font-bold text-green-600">87%</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        Higher Confidence
                                                    </div>
                                                </div>
                                                <div className="text-center bg-white dark:bg-gray-800 p-4 rounded-lg">
                                                    <div className="text-2xl font-bold text-blue-600">42%</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        Better Job Offers
                                                    </div>
                                                </div>
                                                <div className="text-center bg-white dark:bg-gray-800 p-4 rounded-lg">
                                                    <div className="text-2xl font-bold text-purple-600">24/7</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        AI Availability
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA Buttons */}
                                            <div className="text-center space-y-4">
                                                <Button
                                                    size="lg"
                                                    className="w-full md:w-auto px-8 py-4 text-lg bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90 transition-all duration-200 transform hover:scale-105"
                                                    onClick={() => router.push('/auth')}
                                                >
                                                    🔥 Start Your First Interview Now
                                                </Button>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    5 free credits when you sign up • No credit card required
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Footer CTA for incomplete demo */}
                            {currentStep < 3 && (
                                <Card className="dark:bg-gray-800/50 border-dashed border-gray-300">
                                    <CardContent className="p-8 text-center">
                                        <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            Complete the Demo to Unlock Everything
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            See what signing up unlocks - personalized interviews, unlimited practice, and your path to a better job.
                                        </p>
                                        {currentStep === steps.length - 1 && (
                                            <Button onClick={nextStep} className="bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90">
                                                Show Me What I Get With Sign-Up
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* x402 Compliance Badge */}
                    <div className="mt-12 flex justify-center">
                        <X402ComplianceBadge />
                    </div>
                </div>
            </main>
        </div>
    );
}
