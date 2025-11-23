import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, StructuredData } from '@/lib/seo';
import Navigation from '@/components/navigation';

export const metadata: Metadata = generateSEOMetadata({
    title: "AI Job Fit Analysis & Career Matching Tool - Perfect Job Match",
    description: "Get detailed AI-powered job fit analysis with personalized career recommendations, skill gap identification, and interview preparation insights. Find your perfect job match.",
    keywords: "AI job fit analysis, career matching tool, job compatibility assessment, AI career guidance, skill gap analysis, job recommendation AI, career fit calculator, job suitability test, personalized career insights, interview preparation matching",
    image: "/logo.png",
    url: "/job-fit-analysis",
    breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Job Fit Analysis", url: "/job-fit-analysis" }
    ],
    serviceType: "AI Career Matching Service"
});

export default function JobFitAnalysisPage() {
    return (
        <>
            <StructuredData config={{
                title: "AI Job Fit Analysis & Career Matching Tool - Perfect Job Match",
                description: "Get detailed AI-powered job fit analysis with personalized career recommendations, skill gap identification, and interview preparation insights. Find your perfect job match.",
                url: "/job-fit-analysis",
                image: "/logo.png"
            }} />

            <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-purple-50 font-sans dark:from-gray-900 dark:to-black">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/4 right-[-100px] w-3/4 h-full bg-gradient-to-l from-blue-50/30 via-cyan-400/25 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s]"></div>
                    <div className="absolute -top-1/3 right-[-60px] w-1/2 h-3/4 bg-gradient-to-l from-cyan-500/20 via-blue-400/20 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s] delay-1000"></div>
                </div>

                <Navigation />
                <main className="flex-1 p-4 relative z-10">
                    <div className="container mx-auto max-w-6xl py-8">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-70 to-cyan-600 text-white">
                                <span className="text-3xl font-bold">🎯</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                                AI-Powered <span className="text-blue-600">Job Fit Analysis</span>
                            </h1>
                            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
                                Discover how well your skills and experience match job requirements with detailed analysis, personalized recommendations, and strategic career guidance.
                            </p>
                        </div>

                        {/* Key Benefits */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                                <div className="text-4xl mb-4">🎯</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Perfect Match Finding</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    Identify jobs where your skills and experience align perfectly with role requirements.
                                </p>
                            </div>
                            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                                <div className="text-4xl mb-4">📈</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Skill Gap Analysis</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    Discover areas for improvement and get targeted recommendations for skill development.
                                </p>
                            </div>
                            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                                <div className="text-4xl mb-4">🚀</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Career Strategy</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    Receive strategic guidance for career progression and interview preparation.
                                </p>
                            </div>
                        </div>

                        {/* How It Works */}
                        <div className="mb-16 bg-gradient-to-r from-blue-10 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 p-8 rounded-xl border border-blue-200 dark:border-blue-800">
                            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                                How AI Job Fit Analysis <span className="text-blue-600">Works</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-3">1</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Submit Profile</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Upload CV and job description</p>
                                </div>
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-3">2</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">AI Matching</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Our AI analyzes compatibility</p>
                                </div>
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-3">3</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Get Insights</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive detailed analysis</p>
                                </div>
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-3">4</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Apply Strategy</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Use insights for applications</p>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                                Advanced <span className="text-blue-600">Job Fit Analysis</span> Features
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                        <span className="mr-2">🎯</span>
                                        Comprehensive Compatibility Score
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        Get a detailed compatibility percentage with specific breakdowns for skills, experience, education, and cultural fit.
                                    </p>
                                </div>
                                <div className="p-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                        <span className="mr-2">📊</span>
                                        Skill Gap Identification
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        Identify missing skills and get personalized recommendations for courses, certifications, or experiences needed.
                                    </p>
                                </div>
                                <div className="p-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                        <span className="mr-2">💬</span>
                                        Interview Preparation Insights
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        Get targeted interview questions you might face and talking points that highlight your fit for the role.
                                    </p>
                                </div>
                                <div className="p-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                        <span className="mr-2">🌟</span>
                                        Career Growth Opportunities
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        Discover long-term career paths within the organization and potential advancement opportunities.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Benefits for Different Users */}
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                                Perfect for <span className="text-blue-600">Every Career Stage</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center p-6 bg-gradient-to-b from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                                    <div className="text-4xl mb-4">🎓</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Recent Graduates</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        Find entry-level positions that match your education and discover transferable skills from projects and internships.
                                    </p>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-b from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                                    <div className="text-4xl mb-4">💼</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Career Changers</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        Identify roles where your transferable skills apply and get guidance on bridging any experience gaps.
                                    </p>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-b from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                                    <div className="text-4xl mb-4">🎖️</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Experienced Professionals</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        Find senior roles that leverage your expertise and identify opportunities for leadership and strategic impact.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="text-center mb-16">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Ready to Find Your Perfect Job Match?
                            </h3>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                                Get comprehensive job fit analysis and discover opportunities that align with your skills, experience, and career goals.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 px-8 py-4 rounded-lg font-semibold text-lg">
                                    Analyze Job Fit Now (1 credit)
                                </button>
                                <button className="border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-8 py-4 rounded-lg font-semibold text-lg">
                                    View Sample Report
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}