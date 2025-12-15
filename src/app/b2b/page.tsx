'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Building2, FileText, Brain, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import B2BSignupSheet from '@/components/b2b-signup-sheet';

export default function B2BLandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden">
                    <div className="container mx-auto px-4 max-w-6xl relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                                Hire Smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-lime-500">AI-Powered Interviews</span>
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                Save time and find the best candidates by automating your initial screening process.
                                Our AI interviews deeper than resume keywords to reveal true potential.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <B2BSignupSheet>
                                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90 transition-all shadow-lg hover:shadow-xl rounded-full">
                                        Start Hiring Now <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </B2BSignupSheet>
                                <Link href="/demo">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full border-2">
                                        View Demo
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0 pointer-events-none opacity-40">
                        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-green-200/30 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-lime-200/30 rounded-full blur-3xl"></div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-y border-green-100 dark:border-green-900/30">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Get your company up and running in minutes and start screening candidates immediately.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-green-200 via-lime-200 to-green-200 dark:from-green-800 dark:via-lime-800 dark:to-green-800 z-0"></div>

                            {/* Step 1 */}
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-green-100 dark:border-green-900 flex items-center justify-center mb-6 transition-transform hover:scale-110 duration-300">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <UserPlus className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Create Account</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    Sign up for a free employer account to get started with our platform.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-green-100 dark:border-green-900 flex items-center justify-center mb-6 transition-transform hover:scale-110 duration-300">
                                    <div className="w-16 h-16 bg-lime-100 dark:bg-lime-900/30 rounded-full flex items-center justify-center">
                                        <Building2 className="h-8 w-8 text-lime-600 dark:text-lime-400" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Setup Company</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    Create your company profile, add details about your industry and culture.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-green-100 dark:border-green-900 flex items-center justify-center mb-6 transition-transform hover:scale-110 duration-300">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Post Jobs</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    Create job listings with custom AI interview questions tailored to the role.
                                </p>
                            </div>

                            {/* Step 4 */}
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-green-100 dark:border-green-900 flex items-center justify-center mb-6 transition-transform hover:scale-110 duration-300">
                                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                        <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Evaluate</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    Review detailed AI analysis, scores, and feedback for every candidate.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features/Trust Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="border-none shadow-md bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                                <CardContent className="p-8 text-center">
                                    <div className="mb-4 inline-flex p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">Bias-Free Screening</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">AI evaluates purely on skills and responses, reducing unconscious bias.</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-md bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                                <CardContent className="p-8 text-center">
                                    <div className="mb-4 inline-flex p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">24/7 Availability</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Candidates can interview anytime, anywhere that suits their schedule.</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-md bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                                <CardContent className="p-8 text-center">
                                    <div className="mb-4 inline-flex p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">Deep Insights</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Get analysis on technical skills, communication, and cultural fit.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="py-20">
                    <div className="container mx-auto px-4 text-center">
                        <div className="inline-block p-1 rounded-full bg-gradient-to-r from-green-600 to-lime-500 mb-8">
                            <div className="bg-white dark:bg-gray-900 rounded-full px-8 py-4">
                                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-lime-500">
                                    Ready to transform your hiring process?
                                </span>
                            </div>
                        </div>
                        <br />
                        <B2BSignupSheet>
                            <Button
                                size="lg"
                                className="text-xl px-12 py-8 h-auto bg-gradient-to-r from-green-600 to-lime-500 text-white hover:opacity-90 transition-all rounded-2xl shadow-2xl hover:shadow-green-500/20"
                            >
                                Create Company Profile
                            </Button>
                        </B2BSignupSheet>
                    </div>
                </section>
            </main>
        </div>
    );
}
