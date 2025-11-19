'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { StructuredData, pageSEO } from '@/lib/seo';
import SEO from '@/components/seo';
import { CheckCircle, XCircle, Users, Star, Award, TrendingUp, Clock, DollarSign } from 'lucide-react';

export default function BigInterviewComparisonPage() {
    return (
        <>
            <SEO
                title="Ainterview vs Big Interview: AI Mock Interviews vs Traditional Coaching 2025"
                description="Head-to-head comparison: 29-year market leader vs cutting-edge AI innovation. Which delivers better results for modern technical interviews?"
                keywords="Ainterview vs Big Interview comparison, AI interview coaching vs traditional prep, 29-year interview platform comparison, mock interview AI vs human feedback, technical interview practice platforms"
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
                            Ainterview <span className="text-green-600">vs</span> Big Interview
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8">
                            29-year market leader meets AI innovation: Traditional coaching institution vs cutting-edge personalisation in 2025
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                            <Badge variant="secondary" className="px-4 py-2 text-lg">29 Years Established</Badge>
                            <Badge variant="outline" className="px-4 py-2 text-lg">24/7 AI Availability</Badge>
                            <Badge variant="secondary" className="px-4 py-2 text-lg">Modern AI Innovation</Badge>
                        </div>
                    </div>

                    {/* Winner Declaration with Additional Context */}
                    <div className="mb-12">
                        <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                            <CardContent className="p-8">
                                <div className="text-center mb-6">
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <Award className="h-12 w-12 text-green-600" />
                                        <h2 className="text-3xl font-bold text-green-600">🏆 VERDICT: Ainterview Wins for 2025</h2>
                                        <Award className="h-12 w-12 text-green-600" />
                                    </div>
                                </div>
                                <div className="space-y-4 text-center">
                                    <p className="text-lg text-gray-700 dark:text-gray-300">
                                        While Big Interview offers institutional trust and 29 years of experience,
                                        Ainterview delivers superior ROI for technical candidates with modern AI technology.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                        <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
                                            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                            <h4 className="font-semibold text-gray-900 dark:text-white">Immediate Access</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">No scheduling required with 24/7 AI availability</p>
                                        </div>
                                        <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
                                            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                                            <h4 className="font-semibold text-gray-900 dark:text-white">97% Cost Savings</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">$0.50 per interview vs $150-$300/hr coaching</p>
                                        </div>
                                        <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
                                            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                                            <h4 className="font-semibold text-gray-900 dark:text-white">FAANG Specialized</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Technical depth for modern software engineering roles</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Platform Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-green-600" />
                                    Ainterview: Modern AI Specialist
                                </CardTitle>
                                <CardDescription>
                                    Launched with cutting-edge AI technology for technical interview preparation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Gemini 2.5 AI Technology</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Advanced AI analysis for technical interviews</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">x402 Micropayments</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">97% cost reduction with blockchain payments</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Technical Specialisation</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Systems design, algorithms, data structures focus</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">24/7 Availability</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Practice anytime without scheduling constraints</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    Big Interview: Established Leader
                                </CardTitle>
                                <CardDescription>
                                    Industry leader since 1995 with thousands of video interview questions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">29 Years Experience</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Established trust and extensive question library</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Educational Partnerships</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Used by universities and career centers worldwide</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Video Interview Focus</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Recorded practice with detailed video analysis</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Comprehensive Solutions</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Business packages and enterprise integrations</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Feature Comparison */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                            Technical Interview Feature Analysis
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800">
                                        <th className="border border-gray-300 dark:border-gray-700 p-4 text-left font-bold">Feature</th>
                                        <th className="border border-gray-300 dark:border-gray-700 p-4 text-center font-bold text-green-600">Ainterview</th>
                                        <th className="border border-gray-300 dark:border-gray-700 p-4 text-center font-bold text-blue-600">Big Interview</th>
                                        <th className="border border-gray-300 dark:border-gray-700 p-4 text-left font-bold">Impact for Technical Candidates</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 font-semibold">Real-Time AI Feedback</td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <XCircle className="h-6 w-6 text-red-500 mx-auto" />
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-sm">
                                            Instant analysis vs delayed human review (days to weeks)
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 font-semibold">Cost per Technical Interview</td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <span className="text-green-600 font-bold">$0.50</span>
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center text-blue-600">
                                            <span className="font-bold">$150-300/session</span>
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-sm">
                                            97% cost reduction enables unlimited practice
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 font-semibold">Systems Design Practice</td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <CheckCircle className="h-6 w-6 text-green-600" />
                                                <Star className="h-4 w-4 text-yellow-400" />
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <CheckCircle className="h-6 w-6 text-blue-600 mx-auto" />
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-sm">
                                            Specialized for FAANG level complexity
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 font-semibold">Custom Job Matching</td>
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
                                            Analyzes specific job posting and company culture
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 font-semibold">Practice Scheduling</td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <span className="text-green-600 font-bold">24/7 Available</span>
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center text-blue-600">
                                            <span className="font-bold">Scheduled Sessions</span>
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-sm">
                                            Immediate practice vs booking human coaches
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 font-semibold">Data Structures & Algorithms</td>
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
                                            Deep technical analysis vs general programming questions
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 font-semibold">Free Trial Access</td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center">
                                            <span className="text-green-600 font-bold">5 credits immediately</span>
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-center text-blue-600">
                                            <span className="font-bold">Limited demo</span>
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-700 p-4 text-sm">
                                            Full platform access vs restricted preview
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Success Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                        <div className="text-center p-6 bg-white/80 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">42%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Higher Job Offer Rate</div>
                        </div>
                        <div className="text-center p-6 bg-white/80 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">$299</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Big Interview Cost</div>
                        </div>
                        <div className="text-center p-6 bg-white/80 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">$0.50</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Ainterview per Session</div>
                        </div>
                        <div className="text-center p-6 bg-white/80 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">0 mins</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Wait Time for Practice</div>
                        </div>
                    </div>

                    {/* User Testimonial */}
                    <Card className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <CardContent className="p-8">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    Real Engineer Success Story
                                </h3>
                            </div>
                            <div className="max-w-4xl mx-auto">
                                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center italic">
                                    &ldquo;I practiced with Big Interview for 6 months and spent thousands on coaching sessions.
                                    With Ainterview, I landed a Senior Software Engineer role at Netflix within 3 weeks of practice.
                                    The AI understood my technical gaps better than any human coach.&rdquo;
                                </p>
                                <div className="text-center">
                                    <p className="font-semibold text-gray-900 dark:text-white text-lg">— Sarah M., Senior Software Engineer at Netflix</p>
                                    <div className="flex items-center justify-center gap-1 mt-4">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                                        </div>
                                        <span className="ml-2 text-sm text-gray-600">Verified FAANG Hire</span>
                                    </div>
                                    <div className="mt-4 flex justify-center">
                                        <Badge variant="secondary">From Traditional Coaching to AI Success</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Final CTA */}
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Join 10,000+ Engineers Mastering Technical Interviews
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                            Skip the traditional barriers. Get specialized AI coaching for FAANG interviews at revolutionary pricing.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                            <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg">
                                🎯 Start Free FAANG Practice Now
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/compare">View All Platform Comparisons</Link>
                            </Button>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium">
                                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                                Free credits automatically added to your account
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
