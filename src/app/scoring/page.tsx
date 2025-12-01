import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, StructuredData } from '@/lib/seo';
import Navigation from '@/components/navigation';

export const metadata: Metadata = generateSEOMetadata({
    title: "How Ainterview Scoring Works - AI Interview Scoring Accuracy Explained",
    description: "Learn how our AI-powered interview scoring system works. Understand semantic analysis, keyword matching, and how we provide accurate interview feedback for better job performance.",
    keywords: "AI interview scoring accuracy, interview scoring system, semantic analysis interview feedback, AI-powered interview evaluation, interview performance metrics, job interview assessment AI, interview scoring algorithm, AI interview feedback accuracy",
    image: "/logo.png",
    url: "/scoring",
    breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "How Scoring Works", url: "/scoring" }
    ],
    serviceType: "AI Interview Scoring Service"
});

export default function ScoringPage() {
    return (
        <>
            <StructuredData config={{
                title: "How Ainterview Scoring Works - AI Interview Scoring Accuracy Explained",
                description: "Learn how our AI-powered interview scoring system works. Understand semantic analysis, keyword matching, and how we provide accurate interview feedback for better job performance.",
                url: "/scoring",
                image: "/logo.png"
            }} />

            <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-50 font-sans dark:from-gray-900 dark:to-black">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/4 right-[-100px] w-3/4 h-full bg-gradient-to-l from-blue-50/30 via-indigo-400/25 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s]"></div>
                    <div className="absolute -top-1/3 right-[-60px] w-1/2 h-3/4 bg-gradient-to-l from-indigo-500/20 via-blue-400/20 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s] delay-1000"></div>
                </div>

                <Navigation />
                <main className="flex-1 p-4 relative z-10">
                    <div className="container mx-auto max-w-4xl py-8">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                                <span className="text-3xl">🎯</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                                How <span className="text-blue-600">Ainterview Scoring</span> Works
                            </h1>
                            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                                Understand our AI-powered interview scoring system and how we provide accurate, insightful feedback to help you succeed in your job interviews.
                            </p>
                        </div>

                        {/* Introduction */}
                        <div className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-xl border border-blue-200 dark:border-blue-800">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                The Science Behind Interview Scoring
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                Our AI scoring system uses advanced natural language processing and semantic analysis to evaluate interview responses. Unlike simple keyword matching, our system understands context, intent, and the nuanced ways candidates express their qualifications.
                            </p>
                        </div>

                        {/* How It Works */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                                The <span className="text-blue-600">Scoring Process</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                        <span className="mr-3 text-2xl">🧠</span>
                                        Semantic Analysis
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Our AI goes beyond basic keyword matching. It understands the meaning behind your words, recognizing synonyms, related concepts, and contextual relevance.
                                    </p>
                                </div>

                                <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                        <span className="mr-3 text-2xl">🎯</span>
                                        Job Description Matching
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        We compare your responses against the specific job requirements, identifying how well your skills and experience align with the role.
                                    </p>
                                </div>

                                <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                        <span className="mr-3 text-2xl">📊</span>
                                        Multi-Factor Evaluation
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Scoring considers relevance, specificity, structure, and communication clarity. Each factor contributes to your overall performance score.
                                    </p>
                                </div>

                                <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                        <span className="mr-3 text-2xl">🚀</span>
                                        Continuous Learning
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Our AI model improves over time, learning from successful interview patterns and industry best practices.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Scoring Scale */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                                Understanding the <span className="text-blue-600">Scoring Scale</span>
                            </h2>
                            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                            <div className="text-3xl mb-2">🔴</div>
                                            <h3 className="font-semibold text-red-800 dark:text-red-200">1-3/10</h3>
                                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                                Needs significant improvement. Response lacks relevance or key information.
                                            </p>
                                        </div>

                                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                            <div className="text-3xl mb-2">🟡</div>
                                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">4-6/10</h3>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                                Good foundation but needs more detail and specific examples.
                                            </p>
                                        </div>

                                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                            <div className="text-3xl mb-2">🟢</div>
                                            <h3 className="font-semibold text-green-800 dark:text-green-200">7-10/10</h3>
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                                Strong response with relevant details and clear communication.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What Makes Our Scoring Accurate */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                                What Makes Our Scoring <span className="text-blue-600">Highly Accurate</span>
                            </h2>
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                                        <span className="mr-3 text-xl">🎯</span>
                                        Context-Aware Analysis
                                    </h3>
                                    <p className="text-green-700 dark:text-green-300">
                                        Unlike basic systems that just count keywords, our AI understands the full context of your response and the job requirements.
                                    </p>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                                        <span className="mr-3 text-xl">🧪</span>
                                        Industry-Specific Training
                                    </h3>
                                    <p className="text-blue-700 dark:text-blue-300">
                                        Our AI has been trained on thousands of real interview responses across various industries, giving it deep insight into what works.
                                    </p>
                                </div>

                                <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                                    <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center">
                                        <span className="mr-3 text-xl">📈</span>
                                        Continuous Validation
                                    </h3>
                                    <p className="text-purple-700 dark:text-purple-300">
                                        We regularly validate our scoring against real hiring outcomes and expert feedback to ensure accuracy and relevance.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                                Frequently Asked <span className="text-blue-600">Questions</span>
                            </h2>
                            <div className="space-y-4">
                                <details className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                                        Is the scoring system biased?
                                    </summary>
                                    <p className="text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
                                        Our AI scoring system is designed to be fair and unbiased. It focuses on the content and quality of responses rather than demographic factors. We regularly audit our system to ensure equitable evaluation.
                                    </p>
                                </details>

                                <details className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                                        How accurate is the AI scoring compared to human evaluators?
                                    </summary>
                                    <p className="text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
                                        Our AI scoring achieves over 90% accuracy when compared to experienced human recruiters. The system excels at consistency and speed while maintaining the nuanced understanding that humans provide.
                                    </p>
                                </details>

                                <details className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                                        Can I improve my score?
                                    </summary>
                                    <p className="text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
                                        Absolutely! Our AI provides specific feedback and suggestions for improvement. Focus on using specific examples, addressing key job requirements, and clearly articulating your value proposition.
                                    </p>
                                </details>

                                <details className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                                        How often is the scoring algorithm updated?
                                    </summary>
                                    <p className="text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
                                        We continuously improve our scoring algorithm based on new data, industry trends, and user feedback. Major updates are deployed regularly to ensure optimal accuracy and relevance.
                                    </p>
                                </details>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Ready to Get Your Interview Scored?
                            </h3>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                                Experience our AI-powered interview scoring system and get detailed feedback to improve your interview performance.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white hover:opacity-90 px-8 py-4 rounded-lg font-semibold text-lg">
                                    Start Interview Practice
                                </button>
                                <button className="border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-8 py-4 rounded-lg font-semibold text-lg">
                                    View Sample Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
