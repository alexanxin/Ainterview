'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { StructuredData, pageSEO } from '@/lib/seo';
import SEO from '@/components/seo';
import { CheckCircle, XCircle, Star } from 'lucide-react';

export default function ComparePage() {
    return (
        <>
            <SEO
                title="AI Interview Platforms Comparison: Choose Best for Technical Interviews"
                description="Compare Ainterview vs Skillora, Big Interview, and Final Round AI. Detailed analysis of features, pricing, and ROI for technical interview preparation."
                keywords="AI interview platforms comparison, Ainterview vs Skillora, interview prep software review, best AI mock interview tool, technical interview AI comparison"
            />
            <StructuredData config={pageSEO.homepage} />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-black py-12 px-4">
                <div className="container mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            AI Interview Platform Comparisons
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Detailed ROI analysis and feature-by-feature comparison of top AI-powered interview preparation platforms
                        </p>
                    </div>

                    {/* Comparison Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        <Link href="/compare/skillora" className="block">
                            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                Ainterview vs Skillora
                                                <Badge variant="secondary">Most Popular</Badge>
                                            </CardTitle>
                                            <CardDescription>
                                                Comprehensive platform face-off: Scalable enterprise features vs niche technical specialization
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 mb-1">
                                                {[1, 2, 3, 4].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                                                <Star className="h-4 w-4 text-gray-300" />
                                            </div>
                                            <p className="text-sm text-gray-600">4.5/5 rating</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-sm">Feature-by-feature breakdown</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-sm">Pricing comparison & cost analysis</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-sm">B2B vs B2C market positioning</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-sm">Winner recommendation & verdict</span>
                                        </div>
                                        <Button className="w-full mt-4">Read Full Comparison</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/compare/big-interview" className="block">
                            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        Ainterview vs Big Interview
                                        <Badge variant="secondary">Available Now</Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        Institutional partnerships meet innovative AI: Traditional coaching authority vs cutting-edge personalisation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-sm">29-year market presence analysis</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-sm">Educational institutional vs fintech AI</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-sm">Detailed feature-by-feature comparison</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="text-sm">Complete ROI and pricing analysis</span>
                                        </div>
                                        <Button className="w-full mt-4">Read Full Comparison</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                        <div className="text-center p-6 bg-white/80 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">42%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Higher Success Rate</div>
                        </div>
                        <div className="text-center p-6 bg-white/80 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">87%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Confidence Increase</div>
                        </div>
                        <div className="text-center p-6 bg-white/80 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">$0.50</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Per Interview Credit</div>
                        </div>
                        <div className="text-center p-6 bg-white/80 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">AI Available</div>
                        </div>
                    </div>

                    {/* VS Stats */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Why Compare Ainterview?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-white/60 dark:bg-gray-800/40 rounded-lg">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Technical Focus</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Specialized analysis for FAANG coding interviews and systems design</p>
                            </div>
                            <div className="p-6 bg-white/60 dark:bg-gray-800/40 rounded-lg">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cost Effective</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">97% payment cost reduction with x402 micropayments vs traditional coaching</p>
                            </div>
                            <div className="p-6 bg-white/60 dark:bg-gray-800/40 rounded-lg">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Always Available</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Practice technical interviews anytime with hyper-realistic Gemini AI feedback</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
