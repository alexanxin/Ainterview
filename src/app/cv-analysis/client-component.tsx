'use client';

import Navigation from '@/components/navigation';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function CVAnalysisClient() {
    const router = useRouter();

    const handleAnalyzeClick = useCallback(() => {
        router.push('/profile');
    }, [router]);

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-purple-50 font-sans dark:from-gray-900 dark:to-black">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 right-[-100px] w-3/4 h-full bg-gradient-to-l from-green-50/30 via-lime-400/25 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s]"></div>
                <div className="absolute -top-1/3 right-[-60px] w-1/2 h-3/4 bg-gradient-to-l from-lime-500/20 via-green-400/20 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s] delay-1000"></div>
            </div>

            <Navigation />
            <main className="flex-1 p-4 relative z-10">
                <div className="container mx-auto max-w-6xl py-8">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-70 to-lime-600 text-white">
                            <span className="text-3xl font-bold">📄</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            AI-Powered <span className="text-green-600">CV Analysis</span>
                        </h1>
                        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
                            Get comprehensive feedback on your resume with personalized suggestions for improvement, keyword optimization, and ATS compatibility.
                        </p>
                    </div>

                    {/* Key Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                            <div className="text-4xl mb-4">🔍</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Detailed Feedback</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Get specific recommendations to improve your CV content, structure, and effectiveness.
                            </p>
                        </div>
                        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                            <div className="text-4xl mb-4">✅</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">ATS Optimization</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Optimize your resume for Applicant Tracking Systems with keyword suggestions.
                            </p>
                        </div>
                        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                            <div className="text-4xl mb-4">⚡</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Instant Results</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Receive comprehensive analysis in seconds, not hours or days.
                            </p>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="mb-16 bg-gradient-to-r from-green-10 to-lime-100 dark:from-green-900/20 dark:to-lime-900/20 p-8 rounded-xl border border-green-200 dark:border-green-800">
                        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                            How AI CV Analysis <span className="text-green-600">Works</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center p-4">
                                <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-3">1</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Upload CV</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Paste your resume content</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-3">2</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">AI Analysis</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Our AI reviews your content</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-3">3</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Get Feedback</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Receive detailed suggestions</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto mb-3">4</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Improve</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Enhance your CV quality</p>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                            Advanced <span className="text-green-600">CV Analysis</span> Features
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                    <span className="mr-2">🎯</span>
                                    Content Quality Assessment
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    Evaluate the effectiveness of your CV content, including impact statements, quantified achievements, and professional summary quality.
                                </p>
                            </div>
                            <div className="p-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                    <span className="mr-2">📋</span>
                                    Structure & Format Review
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    Analyze your CV&apos;s layout, formatting consistency, and overall visual appeal to ensure it stands out to recruiters.
                                </p>
                            </div>
                            <div className="p-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                    <span className="mr-2">💡</span>
                                    Keyword Optimization
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    Identify missing industry keywords and optimize your CV for specific job roles and Applicant Tracking Systems.
                                </p>
                            </div>
                            <div className="p-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                    <span className="mr-2">📊</span>
                                    Improvement Tracking
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    Track how your CV improves over time with our quality scoring system and personalized recommendations.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center mb-16">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Ready to Improve Your CV Quality?
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                            Get instant, detailed feedback on your resume and learn how to make it stand out to employers and ATS systems.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleAnalyzeClick}
                                className="bg-gradient-to-r from-green-600 to-lime-500 text-white hover:opacity-90 px-8 py-4 rounded-lg font-semibold text-lg"
                            >
                                Analyze Your CV Now (1 credit)
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}