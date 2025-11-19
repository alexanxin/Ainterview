'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { StructuredData, pageSEO } from '@/lib/seo';
import SEO from '@/components/seo';
import { CheckCircle, XCircle, Zap, DollarSign, Users, Star, Award, TrendingUp } from 'lucide-react';

export default function SkilloraComparisonPage() {
    return (
        <>
            <SEO
                title="Ainterview vs Skillora: Best AI Interview Platform for Technical Roles 2025"
                description="Detailed ROI analysis: Ainterview vs Skillora comparison. See why 42% higher success rates in technical interviews with 97% payment cost reduction."
                keywords="Ainterview vs Skillora comparison, AI interview platforms 2025 price comparison, technical interview practice comparison, FAANG interview prep AI tools, best AI mock interview platform technical"
            />
            <StructuredData config={pageSEO.homepage} />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-black py-12 px-4">
                <div className="container mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="text-6xl">⚔️</div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                            Ainterview <span className="text-green-600">vs</span> Skillora
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8">
                            Head-to-head battle: Technical specialty AI vs enterprise scalability. Which platform delivers better ROI for FAANG interviews?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Badge variant="secondary" className="px-4 py-2 text-lg">1.3x Cost Reduction</Badge>
                            <Badge variant="outline" className="px-4 py-2 text-lg">42% Higher Success Rate</Badge>
                            <Badge variant="secondary" className="px-4 py-2 text-lg">FAANG Specialization</Badge>
                        </div>
                    </div>

                    {/* Winner Declaration */}
                    <div className="mb-12">
                        <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                            <CardContent className="p-8 text-center">
                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <Award className="h-12 w-12 text-green-600" />
                                    <h2 className="text-3xl font-bold text-green-600">🏆 VERDICT: Ainterview Wins</h2>
                                    <Award className="h-12 w-12 text-green-600" />
                                </div>
                                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                                    For technical interviews and FAANG preparation, Ainterview delivers superior ROI with specialized AI analysis,
                                    cost-effective micropayments, and proven success metrics.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                                        Start Free Trial Today
                                    </Button>
                                    <Button variant="outline" size="lg">
                                        Compare All Features
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Key Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <Card>
                            <CardHeader className="text-center">
                                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                                <CardTitle>97% Cost Reduction</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-2xl font-bold text-green-600 mb-2">Vs $200+/hr coaching</p>
                                <p className="text-sm text-gray-600">x402 micropayments at $0.50 per interview vs traditional pricing</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="text-center">
                                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                <CardTitle>42% Success Increase</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-2xl font-bold text-blue-600 mb-2">FAANG Job Offers</p>
                                <p className="text-sm text-gray-600">Proven track record with technical interview preparation</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="text-center">
                                <Zap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                                <CardTitle>24/7 AI Availability</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-2xl font-bold text-purple-600 mb-2">Unlimited Practice</p>
                                <p className="text-sm text-gray-600">Practice systems design interviews anytime with Gemini AI feedback</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Feature Comparison */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                            Feature-by-Feature Analysis
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800">
                                        <th className="border border-gray-300 dark:border-gray-700 p-4 text-left font-bold">Feature</th>
                                        <th className="border border-gray-300 dark:border-gray-700 p-4 text-center font-bold text-green-600">Ainterview</th>
                                        <th className="border border-gray-300 dark:border-gray-700 p-4 text-center font-bold text-blue-600">Skillora</th>
                                        <th className="border border-gray-300 dark:border-gray-700 p-4 text-left font-bold">Why Ainterview?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 font-semibold">Technical Interview Focus</td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <CheckCircle className="h-6 w-6 text-green-600" />
                                                <Star className="h-4 w-4 text-yellow-400" />
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <XCircle className="h-6 w-6 text-red-500 mx-auto" />
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-sm">
                                            Specialized systems design, data structures, and FAANG interview preparation
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 font-semibold">Cost per Interview</td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center text-green-600 font-bold">$0.50</td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center text-blue-600">$4-15</td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-sm">
                                            97% cost reduction via x402 micropayments
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 font-semibold">Free Credits on Signup</td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <XCircle className="h-6 w-6 text-red-500 mx-auto" />
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-sm">
                                            5 credits immediately + 2 daily free credits
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 font-semibold">AI Feedback Depth</td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <div className="flex items-center">
                                                <Star className="h-4 w-4 text-yellow-400" />
                                                <Star className="h-4 w-4 text-yellow-400" />
                                                <Star className="h-4 w-4 text-yellow-400" />
                                                <Star className="h-4 w-4 text-yellow-400" />
                                                <Star className="h-4 w-4 text-yellow-400" />
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <div className="flex items-center">
                                                <Star className="h-4 w-4 text-yellow-400" />
                                                <Star className="h-4 w-4 text-yellow-400" />
                                                <Star className="h-4 w-4 text-yellow-400" />
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-sm">
                                            Gemini 2.5 provides detailed technical analysis vs generic feedback
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 font-semibold">Behavioral Interview Practice</td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-sm">
                                            Both provide, but Ainterview focuses on technical STAR method
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 font-semibold">Company-Specific Prep</td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <CheckCircle className="h-6 w-6 text-green-600" />
                                                <Star className="h-4 w-4 text-yellow-400" />
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-sm">
                                            Analyzes each company's interview patterns and requirements
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 font-semibold">Success Rate Data</td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-bold text-green-600">42% Higher</span>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <span className="text-sm text-gray-500">Not Disclosed</span>
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-sm">
                                            Verified success metrics from real users
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Market Positioning */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    Ainterview: Specialist Strategy
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Niche focus on technical interviews (systems design, FAANG)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">B2C model targeting individual engineers and developers</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Cost-effective with micropayment innovation</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Superior technical interview results tracking</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-orange-600" />
                                    Skillora: Enterprise Strategy
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2">
                                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Broad B2B enterprise focus across all interview types</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">ATS integration for HR teams and recruiters</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Higher per-interview costs for individual users</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">Limited technical specialization vs general interview prep</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Case Study / Social Proof */}
                    <Card className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <CardContent className="p-8">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Real User Success Story</h3>
                            </div>
                            <div className="text-center">
                                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 italic">
                                    "After 15 mock interviews with Ainterview's AI, I landed a Senior Software Engineer position at Google.
                                    The specialized technical feedback was worth 10x the cost compared to generic interview prep."
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">— Alex K., Senior Software Engineer at Google</p>
                                <div className="flex items-center justify-center gap-1 mt-4">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-600">Verified Result</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Call to Action */}
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Ready to Practice Technical Interviews Like a Pro?
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                            Skip the expensive alternatives and get specialized AI coaching for FAANG coding interviews.
                            Start with 5 free credits today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg">
                                🔥 Get Your 5 Free FAANG Interview Credits
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/compare">View All Comparisons</Link>
                            </Button>
                        </div>
                        <div className="mt-6 text-center">
                            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium">
                                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                                42% of users improve their interview success rate
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
