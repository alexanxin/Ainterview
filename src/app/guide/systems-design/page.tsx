'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, Users, Clock, Zap, Brain, Code, Database, Globe } from 'lucide-react';
import Link from 'next/link';
import { StructuredData } from '@/lib/seo';
import SEO from '@/components/seo';

export default function SystemsDesignGuidePage() {
    return (
        <>
            <SEO
                title="Systems Design Interview Practice with AI Feedback | FAANG Level Preparation"
                description="Master systems design interviews with AI-powered practice. Get instant feedback on scalability, architecture decisions, and system design questions for Google, Meta, AWS interviews."
                keywords="systems design interview practice AI, FAANG systems design questions, scalable system architecture practice, high-level design interview AI, technical system design interview practice, practice systems design interview questions with AI feedback"
            />
            <StructuredData config={{
                title: "Systems Design Interview Practice with AI Feedback | FAANG Level Preparation",
                description: "Master systems design interviews with AI-powered practice. Get instant feedback on scalability, architecture decisions, and system design questions for Google, Meta, AWS interviews.",
                url: "/guide/systems-design"
            }} />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-black py-12 px-4">
                <div className="container mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="text-6xl">🏗️</div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                            Systems Design <br />
                            <span className="text-green-600">Interview Mastery</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8">
                            Practice FAANG-level systems design interviews with AI feedback. Master scalability, high-level design, and architectural decisions that get you hired at top tech companies.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                            <Badge variant="secondary" className="px-4 py-2 text-lg">FAANG Level Practice</Badge>
                            <Badge variant="outline" className="px-4 py-2 text-lg">Real-Time AI Feedback</Badge>
                            <Badge variant="secondary" className="px-4 py-2 text-lg">Scalability Architecture</Badge>
                            <Badge variant="outline" className="px-4 py-2 text-lg">100+ System Designs</Badge>
                        </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                        <div className="text-center p-6 bg-white/80 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                            <Code className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">80%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Higher Passing Rate</div>
                        </div>
                        <div className="text-center p-6 bg-white/80 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                            <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">100+</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Design Problems</div>
                        </div>
                        <div className="text-center p-6 bg-white/80 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">42%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Job Offer Success</div>
                        </div>
                        <div className="text-center p-6 bg-white/80 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">45min</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Session Time</div>
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="text-center">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Start Your FAANG Systems Design Journey Today
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                            Practice with AI feedback designed for Google, Meta, Amazon, and Apple interviews. Get 5 free interviews to test your systems design skills.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                            <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg">
                                🎯 Start Free Systems Design Practice
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/help">Learn More About AI Feedback</Link>
                            </Button>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium">
                                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                                &ldquo;42% of Ainterview users get FAANG offers within 6 months of practice&rdquo;
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
