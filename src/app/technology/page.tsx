import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, StructuredData, pageSEO } from '@/lib/seo';
import Navigation from '@/components/navigation';
import X402ComplianceBadge from '@/components/x402-compliance-badge';

export const metadata: Metadata = generateSEOMetadata({
    title: "Technology Stack - Ainterview's x402 Protocol & AI Architecture",
    description: "Explore the cutting-edge technology behind Ainterview: x402 protocol integration, Gemini 2.5 AI models, Next.js architecture, Supabase PostgreSQL, and Solana blockchain micropayments.",
    keywords: "Next.js AI application, Supabase PostgreSQL schema, Gemini AI interview simulator, AI service monetization, serverless AI API, real-time credit updates, JWT-based authentication Supabase, x402 protocol implementation, Solana micropayment architecture",
    image: "/logo.png",
    url: "/technology",
    breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Technology", url: "/technology" }
    ],
    serviceType: "AI Technology Platform"
});

export default function TechnologyPage() {
    const techStack = [
        {
            category: "AI & Machine Learning",
            icon: "🤖",
            technologies: [
                {
                    name: "Gemini 2.5",
                    description: "Advanced AI model powering personalized interview questions and real-time feedback analysis",
                    features: ["Natural language processing", "Context understanding", "Real-time response generation"]
                },
                {
                    name: "AI Interview Simulator",
                    description: "Custom AI engine trained on job-specific requirements and company culture",
                    features: ["Hyper-personalization", "Dynamic question generation", "Behavioral analysis"]
                }
            ]
        },
        {
            category: "Blockchain & Payments",
            icon: "⛓️",
            technologies: [
                {
                    name: "x402 Protocol",
                    description: "Revolutionary micropayment protocol enabling autonomous AI service transactions",
                    features: ["HTTP 402 compliance", "97% cost reduction", "Autonomous payments"]
                },
                {
                    name: "Solana Integration",
                    description: "High-speed blockchain infrastructure for instant, low-cost transactions",
                    features: ["Sub-3 second confirmations", "Multi-token support (USDC, USDT, CASH)", "Phantom wallet integration"]
                }
            ]
        },
        {
            category: "Frontend & Backend",
            icon: "⚡",
            technologies: [
                {
                    name: "Next.js Application",
                    description: "Modern React framework with server-side rendering and optimized performance",
                    features: ["Server-side rendering", "API routes", "TypeScript support", "PWA capabilities"]
                },
                {
                    name: "Real-time Credit System",
                    description: "Dynamic credit tracking with instant updates and balance synchronization",
                    features: ["Live credit updates", "Real-time synchronization", "Persistent storage"]
                }
            ]
        },
        {
            category: "Database & Auth",
            icon: "🗄️",
            technologies: [
                {
                    name: "Supabase PostgreSQL",
                    description: "Robust database schema with real-time subscriptions and advanced querying",
                    features: ["PostgreSQL schema", "Real-time subscriptions", "Row-level security", "Advanced indexing"]
                },
                {
                    name: "JWT Authentication",
                    description: "Secure authentication system with Supabase integration",
                    features: ["JWT-based auth", "Session management", "Secure API access", "User role management"]
                }
            ]
        }
    ];

    const x402Features = [
        {
            title: "Complete Protocol Compliance",
            description: "Full HTTP 402 response implementation with detailed payment metadata",
            technical: "AI agents can execute transactions autonomously without human intervention"
        },
        {
            title: "Two-Phase Verification",
            description: "Dual security layer combining blockchain verification with database validation",
            technical: "Blockchain + database verification for maximum security and reliability"
        },
        {
            title: "Multi-Token Architecture",
            description: "Support for USDC, USDT, and Phantom CASH tokens on Solana network",
            technical: "Seamless multi-token payments with automatic exchange rate handling"
        },
        {
            title: "Micropayment Optimization",
            description: "$0.10 per AI interaction enabling sustainable freemium business model",
            technical: "Ultra-low transaction fees enable micro-payments for individual AI interactions"
        }
    ];

    return (
        <>
            <StructuredData config={{
                title: "Technology Stack - Ainterview's x402 Protocol & AI Architecture",
                description: "Explore the cutting-edge technology behind Ainterview: x402 protocol integration, Gemini 2.5 AI models, Next.js architecture, Supabase PostgreSQL, and Solana blockchain micropayments.",
                url: "/technology",
                image: "/logo.png"
            }} />

            <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-purple-50 font-sans dark:from-gray-900 dark:to-black">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/4 right-[-100px] w-3/4 h-full bg-gradient-to-l from-green-500/30 via-lime-400/25 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s]"></div>
                    <div className="absolute -top-1/3 right-[-60px] w-1/2 h-3/4 bg-gradient-to-l from-lime-500/20 via-green-400/20 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s] delay-1000"></div>
                </div>

                <Navigation />
                <main className="flex-1 p-4 relative z-10">
                    <div className="container mx-auto max-w-6xl py-8">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-lime-600 text-white">
                                <span className="text-3xl font-bold">⚡</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                                Technology <span className="text-green-600">Architecture</span>
                            </h1>
                            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
                                Exploring the cutting-edge technologies powering Ainterview's revolutionary AI interview preparation platform
                            </p>
                        </div>

                        {/* x402 Protocol Highlight */}
                        <div className="mb-16 bg-gradient-to-r from-green-100 to-lime-100 dark:from-green-900/20 dark:to-lime-900/20 p-8 rounded-xl border border-green-200 dark:border-green-800">
                            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                                🚀 x402 Protocol Implementation
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {x402Features.map((feature, index) => (
                                    <div key={index} className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                        <p className="text-gray-700 dark:text-gray-300 mb-2">{feature.description}</p>
                                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">{feature.technical}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Technology Stack */}
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                                Complete <span className="text-green-600">Technology Stack</span>
                            </h2>
                            <div className="space-y-8">
                                {techStack.map((category, categoryIndex) => (
                                    <div key={categoryIndex} className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                                            <span className="text-3xl mr-3">{category.icon}</span>
                                            {category.category}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {category.technologies.map((tech, techIndex) => (
                                                <div key={techIndex} className="p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-lg">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{tech.name}</h4>
                                                    <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">{tech.description}</p>
                                                    <ul className="space-y-1">
                                                        {tech.features.map((feature, featureIndex) => (
                                                            <li key={featureIndex} className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                                                <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Innovation Highlights */}
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                                Innovation <span className="text-green-600">Highlights</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                                    <div className="text-4xl mb-4">💡</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Personalization</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        Hyper-personalized interview questions generated by Gemini 2.5 based on job postings and company culture
                                    </p>
                                </div>
                                <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                                    <div className="text-4xl mb-4">⚡</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Autonomous Payments</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        First AI service to implement full x402 protocol for autonomous micropayment transactions
                                    </p>
                                </div>
                                <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                                    <div className="text-4xl mb-4">📊</div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Analytics</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        Advanced performance tracking with instant feedback and progress visualization
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Technical Architecture */}
                        <div className="mb-16 bg-gray-50/50 dark:bg-gray-800/30 p-8 rounded-xl">
                            <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-8">
                                Technical <span className="text-green-600">Architecture</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
                                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                        <li>• <strong>97% payment cost reduction</strong> compared to traditional processors</li>
                                        <li>• <strong>Sub-3 second</strong> transaction confirmations</li>
                                        <li>• <strong>99.9% uptime</strong> with serverless architecture</li>
                                        <li>• <strong>Real-time synchronization</strong> across all components</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Scalability</h3>
                                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                        <li>• <strong>Serverless AI API</strong> with auto-scaling</li>
                                        <li>• <strong>Edge computing</strong> for global performance</li>
                                        <li>• <strong>Microservices architecture</strong> for modular scaling</li>
                                        <li>• <strong>CDN distribution</strong> via Vercel infrastructure</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* x402 Compliance Badge */}
                        <div className="flex justify-center mt-8">
                            <X402ComplianceBadge />
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}