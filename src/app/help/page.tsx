// Enhanced Help Page with SEO for Login-Gated Content Strategy
// Phase 1B: Content-Driven Acquisition Funnel

'use client'


import { useState } from 'react';
import Navigation from '@/components/navigation';
import X402ComplianceBadge from '@/components/x402-compliance-badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Book, Search, ArrowRight, ExternalLink } from 'lucide-react';
import { StructuredData, pageSEO } from '@/lib/seo';

// FAQ Schema for AEO Targeting (Questions SERP Opportunities)
const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How does AI interview practice work?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "AI-powered interview practice creates hyper-personalized interview simulations based on your target job and company. Sign up to experience unlimited AI interview sessions with real-time feedback. Try free with our demo or unlock full features now."
            }
        },
        {
            "@type": "Question",
            "name": "What makes Ainterview different from other interview prep?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Unlike generic interview prep tools, Ainterview trains AI on your specific job posting and company culture for personalized practice. Unlock AI interviewers that understand your target role and provide feedback beyond generic tips."
            }
        },
        {
            "@type": "Question",
            "name": "How many credits do I need for AI interviews?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Standard 5-question interviews cost 5 credits, 10-question sessions cost 10 credits. Get 2 free credits daily plus registration bonus. Sign up now to access unlimited AI interview practice and personalized feedback."
            }
        },
        {
            "@type": "Question",
            "name": "Why should I choose AI interview coaching?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "AI interview coaching provides instant feedback, tracks progress, and adapts to your specific job requirements. Join thousands who improved their interview skills with personalized AI practice. Unlock full access with free credits."
            }
        },
        {
            "@type": "Question",
            "name": "What jobs can I practice for with AI interviews?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Practice for technical roles, software engineering, data science, product management, and more. Our AI adapts to different job types and company cultures. Get personalized practice for FAANG and top tech companies. Sign up for unlimited access."
            }
        },
        {
            "@type": "Question",
            "name": "How to prepare for FAANG technical interviews?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Prepare with AI that generates company-specific questions and provides detailed feedback. Master technical interviews with personalized practice sessions. Unlock premium AI coaching features and practice unlimited sessions for top-tier roles."
            }
        },
        {
            "@type": "Question",
            "name": "What is the best interview practice method?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The best method combines targeted practice with expert feedback. Experience AI-powered interview practice with personalized guidance and progress tracking. Sign up for unlimited access and discover the most effective preparation strategy."
            }
        },
        {
            "@type": "Question",
            "name": "Can I practice coding interviews with AI?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Practice technical interviews including coding with AI feedback. Get personalized coaching for algorithm problems, system design, and technical questions. Unlock unlimited AI practice sessions with detailed code analysis and improvement suggestions."
            }
        }
    ]
};

interface SearchResult {
    id: string;
    title: string;
    content: string;
    highlightedContent?: string;
    keywords: string[];
}

export default function HelpPage() {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const tableOfContents = [
        { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
        { id: 'account-setup', title: 'Account Setup and Authentication', icon: '🔐' },
        { id: 'profile-management', title: 'Profile Management', icon: '👤' },
        { id: 'credit-system', title: 'Credit System and Payments', icon: '💳' },
        { id: 'creating-interviews', title: 'Creating Interview Sessions', icon: '📝' },
        { id: 'conducting-interviews', title: 'Conducting Interviews', icon: '🎤' },
        { id: 'voice-recording', title: 'Voice Recording Feature', icon: '🎧' },
        { id: 'feedback-analytics', title: 'Feedback and Analytics', icon: '📊' },
        { id: 'practice-mode', title: 'Practice Mode', icon: '🏃' },
        { id: 'payments', title: 'Payment and x402 Protocol', icon: '💰' },
        { id: 'troubleshooting', title: 'Troubleshooting', icon: '🔧' },
        { id: 'faq', title: 'Frequently Asked Questions', icon: '❓' },
    ];

    // Search functionality
    const helpContent = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            content: 'Ainterview AI-powered interview preparation platform personalized interview simulations AI interviewers trained job posting company information background highly relevant practice sessions mirror actual interview experience',
            keywords: ['getting started', 'ainterview', 'ai', 'interview preparation', 'personalized', 'simulation', 'practice']
        },
        {
            id: 'account-setup',
            title: 'Account Setup and Authentication',
            content: 'invitation code platform access email authentication verification account setup welcome credits daily credits',
            keywords: ['account', 'setup', 'authentication', 'invitation code', 'email verification', 'credits']
        },
        {
            id: 'profile-management',
            title: 'Profile Management',
            content: 'profile information personal information professional information bio experience education skills LinkedIn PDF import',
            keywords: ['profile', 'management', 'bio', 'experience', 'education', 'skills', 'linkedin', 'pdf import']
        },
        {
            id: 'credit-system',
            title: 'Credit System and Payments',
            content: 'credits currency AI interactions starting interview re-answering questions generating similar questions registration bonus daily free credits credit costs',
            keywords: ['credits', 'payments', 'currency', 'cost', 'pricing', 'free credits', 'registration bonus']
        },
        {
            id: 'creating-interviews',
            title: 'Creating Interview Sessions',
            content: 'new interview job information job title company name job description company information background interview settings number of questions interview type practice mode',
            keywords: ['creating interviews', 'new interview', 'job information', 'job title', 'company name', 'job description', 'interview settings']
        },
        {
            id: 'conducting-interviews',
            title: 'Conducting Interviews',
            content: 'interview interface question display answer input text area voice recording microphone recording timer STAR method structured response answer length content best practices',
            keywords: ['conducting interviews', 'interview interface', 'question display', 'answer input', 'voice recording', 'star method']
        },
        {
            id: 'voice-recording',
            title: 'Voice Recording Feature',
            content: 'voice recording microphone permissions recording timer speech-to-text accuracy recording best practices environment setup recording technique recording tips',
            keywords: ['voice recording', 'microphone', 'speech to text', 'recording', 'audio', 'transcription']
        },
        {
            id: 'feedback-analytics',
            title: 'Feedback and Analytics',
            content: 'feedback question analysis AI feedback improvement suggestions performance analytics interview metrics skill assessment progress tracking',
            keywords: ['feedback', 'analytics', 'performance', 'metrics', 'progress tracking', 'improvement', 'analysis']
        },
        {
            id: 'practice-mode',
            title: 'Practice Mode',
            content: 'practice mode similar questions focused training question generation practice session features practice strategy effective practice',
            keywords: ['practice mode', 'practice', 'similar questions', 'focused training', 'question generation']
        },
        {
            id: 'payments',
            title: 'Payment and x402 Protocol',
            content: 'x402 payment protocol blockchain transactions supported payment tokens USDC PYUSD CASH wallet connection payment details transaction confirmation',
            keywords: ['payments', 'x402', 'blockchain', 'wallet', 'USDC', 'PYUSD', 'CASH', 'transaction']
        },
        {
            id: 'troubleshooting',
            title: 'Troubleshooting',
            content: 'troubleshooting common issues solutions account access credit system interview session voice recording payment browser compatibility',
            keywords: ['troubleshooting', 'problems', 'issues', 'solutions', 'browser', 'compatibility', 'errors']
        },
        {
            id: 'faq',
            title: 'Frequently Asked Questions',
            content: 'frequently asked questions general questions credit payment questions technical questions account privacy questions support contact',
            keywords: ['faq', 'frequently asked questions', 'general questions', 'support', 'help']
        }
    ];

    const performSearch = (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const results = helpContent.filter(item => {
            const searchText = query.toLowerCase();
            return (
                item.title.toLowerCase().includes(searchText) ||
                item.content.toLowerCase().includes(searchText) ||
                item.keywords.some(keyword => keyword.toLowerCase().includes(searchText))
            );
        });

        // Highlight matching terms
        const highlightedResults = results.map(item => {
            const highlightedContent = item.content.replace(
                new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>'
            );
            return {
                ...item,
                highlightedContent
            };
        });

        setSearchResults(highlightedResults);
        setShowSearchResults(true);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        performSearch(value);
    };

    const handleResultClick = (sectionId: string) => {
        setSearchQuery('');
        setShowSearchResults(false);
        scrollToSection(sectionId);
    };

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            {/* Structured Data for SEO */}
            <StructuredData config={pageSEO.help} />

            <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-purple-50 font-sans dark:from-gray-900 dark:to-black">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/4 right-[-100px] w-3/4 h-full bg-gradient-to-l from-green-500/30 via-lime-400/25 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s]"></div>
                    <div className="absolute -top-1/3 right-[-60px] w-1/2 h-3/4 bg-gradient-to-l from-lime-500/20 via-green-400/20 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s] delay-1000"></div>
                </div>

                <Navigation />
                <main className="flex-1 p-4 relative z-10">
                    <div className="container mx-auto max-w-6xl py-8">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-lime-600 text-white mx-auto">
                                <HelpCircle className="h-10 w-10" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                                Help <span className="text-green-600">Center</span>
                            </h1>
                            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
                                Everything you need to know about using Ainterview effectively
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-12">
                            <div className="max-w-2xl mx-auto relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search help articles..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            {/* Search Results */}
                            {showSearchResults && (
                                <div className="max-w-2xl mx-auto mt-4">
                                    {searchResults.length > 0 ? (
                                        <Card className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                                                Search Results ({searchResults.length})
                                            </h3>
                                            <div className="space-y-3">
                                                {searchResults.map((result) => (
                                                    <div
                                                        key={result.id}
                                                        onClick={() => handleResultClick(result.id)}
                                                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                                    >
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                                            {result.title}
                                                        </h4>
                                                        <p
                                                            className="text-sm text-gray-600 dark:text-gray-300"
                                                            dangerouslySetInnerHTML={{
                                                                __html: result.highlightedContent || result.content
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    ) : (
                                        <Card className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                            <p className="text-gray-600 dark:text-gray-300">
                                                No results found for "{searchQuery}"
                                            </p>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Table of Contents Sidebar */}
                            <div className="lg:col-span-1">
                                <Card className="p-6 sticky top-24 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                        <Book className="h-5 w-5 mr-2" />
                                        Table of Contents
                                    </h3>
                                    <nav className="space-y-2">
                                        {tableOfContents.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => scrollToSection(item.id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === item.id
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <span className="mr-2">{item.icon}</span>
                                                {item.title}
                                            </button>
                                        ))}
                                    </nav>
                                </Card>
                            </div>

                            {/* Main Content */}
                            <div className="lg:col-span-3 space-y-12">
                                {/* Getting Started */}
                                <section id="getting-started">
                                    <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                            🚀 Getting Started
                                        </h2>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">What is Ainterview?</h3>
                                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                                    Ainterview is an AI-powered interview preparation platform that provides personalized, realistic interview simulations.
                                                    Our AI interviewers are trained on real job postings, company information, and your background to create highly relevant
                                                    practice sessions that mirror actual interview experiences.
                                                </p>
                                                <img
                                                    src="/help/1.png"
                                                    alt="Ainterview Homepage"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Key Features</h3>
                                                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                                    <li className="flex items-start">
                                                        <span className="text-green-500 mr-2">•</span>
                                                        <strong>Hyper-Personalized AI Interviews:</strong> AI interviewers trained specifically for each job application
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="text-green-500 mr-2">•</span>
                                                        <strong>Realistic Interview Simulations:</strong> Dynamic questions based on job requirements and company culture
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="text-green-500 mr-2">•</span>
                                                        <strong>Instant Expert Feedback:</strong> Detailed analysis and improvement suggestions after each question
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="text-green-500 mr-2">•</span>
                                                        <strong>Voice-to-Text Recording:</strong> Speak your answers for more natural practice
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="text-green-500 mr-2">•</span>
                                                        <strong>Comprehensive Analytics:</strong> Track your progress and improvement over time
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="text-green-500 mr-2">•</span>
                                                        <strong>x402 Payment Protocol:</strong> Secure blockchain-based payment system
                                                    </li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Who Can Use Ainterview?</h3>
                                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                                                    Ainterview is currently invite-only, but accessible to anyone with an invitation code. The platform serves:
                                                </p>
                                                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                                    <li className="flex items-start">
                                                        <span className="text-green-500 mr-2">•</span>
                                                        <strong>Primary:</strong> Mid to senior-level tech professionals (2-8 years experience)
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="text-green-500 mr-2">•</span>
                                                        <strong>Secondary:</strong> New graduates and early career professionals
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="text-green-500 mr-2">•</span>
                                                        <strong>Tertiary:</strong> Career changers transitioning to new industries
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* Account Setup and Authentication */}
                                <section id="account-setup">
                                    <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                            🔐 Account Setup and Authentication
                                        </h2>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Step 1: Access the Platform</h3>
                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>1. Visit <a href="https://ainterview.app" className="text-green-600 hover:underline">https://ainterview.app</a></li>
                                                    <li>2. You&apos;ll be prompted to enter an invitation code</li>
                                                    <li>3. Find invitation codes in the README.md file on the app&apos;s GitHub page</li>
                                                    <li>4. Enter the code to gain access to the platform</li>
                                                </ol>
                                                <img
                                                    src="/help/1-1.png"
                                                    alt="Invitation Code Entry"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />


                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Step 2: Create Your Account</h3>
                                                <img
                                                    src="/help/2-1.png"
                                                    alt="Account Registration"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />
                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300">
                                                    <li>1. <strong>Email Authentication:</strong> Enter your email address</li>
                                                    <li>2. <strong>Email Verification:</strong> Check your email and click the verification link</li>
                                                    <li>3. <strong>Initial Setup:</strong> Complete the initial account setup process</li>
                                                    <li>4. <strong>Welcome Credits:</strong> Receive 5 free credits upon successful registration</li>
                                                </ol>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Step 3: Daily Credit Claiming</h3>
                                                <img
                                                    src="/help/2-3.png"
                                                    alt="Email Verification"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />
                                                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                                    <li className="flex items-start">
                                                        <span className="text-green-500 mr-2">•</span>
                                                        <strong>Free Daily Credits:</strong> Claim 2 additional free credits each day
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="text-green-500 mr-2">•</span>
                                                        <strong>Credit Display:</strong> Your current credit balance is shown in the top navigation
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* Profile Management */}
                                <section id="profile-management">
                                    <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                            👤 Profile Management
                                        </h2>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Accessing Your Profile</h3>
                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300">
                                                    <li>1. Click on your profile menu item in the top navigation</li>
                                                    <li>2. You&apos;ll see your current profile information and editing options</li>
                                                </ol>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Manual Profile Setup</h3>
                                                <p className="text-gray-600 dark:text-gray-300 mb-3">Complete these sections to personalize your interview experience:</p>
                                                <img
                                                    src="/help/3-1.png"
                                                    alt="Professional Information"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />

                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Personal Information</h4>

                                                    <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                        <li>• <strong>Full Name:</strong> Your complete legal name</li>
                                                        <li>• <strong>Email:</strong> Your contact email (auto-populated and non-editable)</li>
                                                        <li>• <strong>Phone:</strong> Your phone number</li>
                                                        <li>• <strong>Location:</strong> Your current city and country</li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Professional Information</h4>
                                                    <img
                                                        src="/help/3-2.png"
                                                        alt="Profile Management Interface"
                                                        className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                    />
                                                    <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                        <li>• <strong>Bio:</strong> A brief professional summary</li>
                                                        <li>• <strong>Experience:</strong> Your work history and accomplishments</li>
                                                        <li>• <strong>Education:</strong> Your educational background</li>
                                                        <li>• <strong>Skills:</strong> Your technical and professional skills</li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">LinkedIn PDF Import</h3>
                                                <img
                                                    src="/help/3-3.png"
                                                    alt="LinkedIn PDF Import"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />
                                                <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                    Ainterview can automatically import your profile information from a LinkedIn PDF:
                                                </p>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">How to Import:</h4>
                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300">
                                                    <li>1. <strong>Export Your LinkedIn Profile:</strong>
                                                        <ul className="ml-4 mt-1">
                                                            <li>• Go to your LinkedIn profile page</li>
                                                            <li>• Click the &quot;Resources&quot; button</li>
                                                            <li>• Select &quot;Save to PDF&quot;</li>
                                                            <li>• Download the generated PDF</li>
                                                        </ul>
                                                    </li>
                                                    <li>2. <strong>Upload to Ainterview:</strong>
                                                        <ul className="ml-4 mt-1">
                                                            <li>• In your profile page, find the &quot;Import from LinkedIn PDF&quot; section</li>
                                                            <li>• Click &quot;Select LinkedIn PDF&quot; and choose your downloaded file</li>
                                                            <li>• Click &quot;Import Data&quot;</li>
                                                            <li>• Wait for the import to complete</li>
                                                        </ul>
                                                    </li>
                                                    <li>3. <strong>Review and Edit:</strong>
                                                        <ul className="ml-4 mt-1">
                                                            <li>• The system will auto-populate your profile fields</li>
                                                            <li>• Review the imported information</li>
                                                            <li>• Make any necessary adjustments</li>
                                                            <li>• Click "Save Profile" to confirm</li>
                                                        </ul>
                                                    </li>
                                                </ol>
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* Credit System and Payments */}
                                <section id="credit-system">
                                    <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                            💳 Credit System and Payments
                                        </h2>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Understanding Credits</h3>
                                                <img
                                                    src="/help/4-1.png"
                                                    alt="Credits Overview"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />
                                                <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                    Credits are the currency used for AI interactions in Ainterview:
                                                </p>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                    <li>• <strong>Starting Interview:</strong> 5-10 credits (based on number of questions)</li>
                                                    <li>• <strong>Re-answering Questions:</strong> 1 credit per question</li>
                                                    <li>• <strong>Generating Similar Questions:</strong> 1 credit per question</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Free Credit System</h3>
                                                <img
                                                    src="/help/4-3.png"
                                                    alt="Free Credit System"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Registration Bonus</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>5 Free Credits:</strong> Given upon successful account registration</li>
                                                    <li>• <strong>One-time Benefit:</strong> Only available for new users</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Daily Free Credits</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                    <li>• <strong>2 Credits Daily:</strong> Available to all users every day</li>
                                                    <li>• <strong>Easy Claiming:</strong> Click the refresh icon next to your credit display</li>
                                                    <li>• <strong>Accrual:</strong> Credits accumulate if not claimed daily</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Credit Costs by Feature</h3>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-gray-600 dark:text-gray-300">
                                                        <thead>
                                                            <tr className="border-b border-gray-200 dark:border-gray-600">
                                                                <th className="text-left py-2">Action</th>
                                                                <th className="text-left py-2">Credit Cost</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td className="py-2">Start Interview (5 questions)</td>
                                                                <td className="py-2">5 credits</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-2">Start Interview (10 questions)</td>
                                                                <td className="py-2">10 credits</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-2">Re-answer Question</td>
                                                                <td className="py-2">1 credit</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-2">Practice Similar Question</td>
                                                                <td className="py-2">1 credit</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-2">Daily Free Credits</td>
                                                                <td className="py-2">2 credits</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Credit Balance Display</h3>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                    <li>• <strong>Navigation Bar:</strong> Current credit count displayed prominently</li>
                                                    <li>• <strong>Color Coding:</strong> Green text indicates available credits</li>
                                                    <li>• <strong>Refresh Button:</strong> Plus icon (+) to claim daily free credits</li>
                                                    <li>• <strong>Real-time Updates:</strong> Balance updates automatically after transactions</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* Creating Interview Sessions */}
                                <section id="creating-interviews">
                                    <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                            📝 Creating Interview Sessions
                                        </h2>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Starting a New Interview</h3>
                                                <img
                                                    src="/help/5-1.png"
                                                    alt="New Interview Setup Interface"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />
                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300">
                                                    <li>1. <strong>Navigate to Interview Setup:</strong>
                                                        <ul className="ml-4 mt-1">
                                                            <li>• Click "New Interview" from the dashboard</li>
                                                            <li>• Or go directly to the Interview page</li>
                                                        </ul>
                                                    </li>
                                                </ol>


                                                <ol className="space-y-5 text-gray-600 dark:text-gray-300 my-5">
                                                    <li>2. <strong>Enter Job Information:</strong>
                                                        <img
                                                            src="/help/5-2.png"
                                                            alt="Job Information Entry Form"
                                                            className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 my-5"
                                                        />
                                                        <ul className="ml-4 mt-1">
                                                            <li>• <strong>Job Title:</strong> The specific position you're applying for</li>
                                                            <li>• <strong>Company Name:</strong> The hiring organization</li>
                                                            <li>• <strong>Job Description:</strong> Paste the complete job posting</li>
                                                            <li>• <strong>Company Information:</strong> Any additional company details you know</li>
                                                        </ul>
                                                    </li>
                                                </ol>


                                                <ol className="space-y-5 text-gray-600 dark:text-gray-300 my-5">
                                                    <li>3. <strong>Set Your Background:</strong>
                                                        <img
                                                            src="/help/5-4.png"
                                                            alt="Background Information Setup"
                                                            className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 my-5"
                                                        />
                                                        <ul className="ml-4 mt-1">
                                                            <li>• Choose between your saved profile or session-only data</li>
                                                            <li>• If using session data, enter your CV information</li>
                                                            <li>• Include relevant experience, skills, and background</li>
                                                        </ul>
                                                    </li>
                                                </ol>


                                                <ol className="space-y-5 text-gray-600 dark:text-gray-300 my-5">
                                                    <li>4. <strong>Configure Interview Settings:</strong>
                                                        <img
                                                            src="/help/5-5.png"
                                                            alt="Interview Configuration Settings"
                                                            className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 my-5"
                                                        />
                                                        <ul className="ml-4 mt-1">
                                                            <li>• <strong>Number of Questions:</strong> Choose 5 or 10 questions</li>
                                                            <li>• <strong>Interview Type:</strong> Select the type of role you're preparing for</li>
                                                            <li>• <strong>Practice Mode:</strong> Optionally enable practice mode for focused training</li>
                                                        </ul>
                                                    </li>
                                                </ol>

                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Job Information Best Practices</h3>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Job Description</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>Complete Posting:</strong> Include the entire job description</li>
                                                    <li>• <strong>Requirements:</strong> List all required skills and qualifications</li>
                                                    <li>• <strong>Responsibilities:</strong> Include key job duties and expectations</li>
                                                    <li>• <strong>Company Values:</strong> Look for and include company culture information</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Company Research</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                    <li>• <strong>Official Website:</strong> Visit the company&apos;s about page</li>
                                                    <li>• <strong>Mission Statement:</strong> Understand company values and culture</li>
                                                    <li>• <strong>Recent News:</strong> Include relevant company developments</li>
                                                    <li>• <strong>Industry Position:</strong> Note the company&apos;s standing in their field</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* Conducting Interviews */}
                                <section id="conducting-interviews">
                                    <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                            🎤 Conducting Interviews
                                        </h2>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Interview Interface</h3>
                                                <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                    Once your interview session starts, you'll see:
                                                </p>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Question Display</h4>
                                                <img
                                                    src="/help/6-1.png"
                                                    alt="Interview Interface Overview"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>Current Question:</strong> Prominently displayed in a green-highlighted box</li>
                                                    <li>• <strong>Question Progress:</strong> Visual progress bar showing completion status</li>
                                                    <li>• <strong>Question Counter:</strong> "Question X of Y" indicator</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Answer Input</h4>
                                                <img
                                                    src="/help/6-3.png"
                                                    alt="Question Display and Answer Interface"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>Text Area:</strong> Large text box for typing your answer</li>
                                                    <li>• <strong>Character Limit:</strong> No strict limit, but aim for comprehensive responses</li>
                                                    <li>• <strong>Auto-save:</strong> Your answer is automatically saved as you type</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Voice Recording (SOON)</h4>

                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                    <li>• <strong>Microphone Button:</strong> Click to start/stop voice recording</li>
                                                    <li>• <strong>Recording Timer:</strong> Shows recording duration (max 30 seconds)</li>
                                                    <li>• <strong>Audio Quality Tips:</strong> Built-in guidance for optimal recording</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Answering Questions Effectively</h3>


                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Structured Response Format</h4>
                                                <p className="text-gray-600 dark:text-gray-300 mb-2">Use the STAR method for behavioral questions:</p>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>Situation:</strong> Set the context</li>
                                                    <li>• <strong>Task:</strong> Describe your responsibility</li>
                                                    <li>• <strong>Action:</strong> Explain what you did</li>
                                                    <li>• <strong>Result:</strong> Share the outcome</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Answer Length Guidelines</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>Minimum:</strong> 2-3 sentences for basic responses</li>
                                                    <li>• <strong>Optimal:</strong> 1-3 minutes when speaking</li>
                                                    <li>• <strong>Maximum:</strong> 5 minutes for complex scenarios</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Content Best Practices</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                    <li>• <strong>Be Specific:</strong> Use concrete examples and metrics</li>
                                                    <li>• <strong>Stay Relevant:</strong> Connect your experience to the job requirements</li>
                                                    <li>• <strong>Show Growth:</strong> Demonstrate learning and development</li>
                                                    <li>• <strong>Demonstrate Skills:</strong> Highlight relevant competencies</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* Voice Recording Feature */}
                                <section id="voice-recording">
                                    <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                            🎧 Voice Recording Feature (soon)
                                        </h2>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">How to Use Voice Recording</h3>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Starting Recording</h4>
                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300">
                                                    <li>1. <strong>Click the Microphone Button:</strong> Look for the 🎤 icon</li>
                                                    <li>2. <strong>Grant Permissions:</strong> Allow microphone access when prompted</li>
                                                    <li>3. <strong>Start Speaking:</strong> Begin your answer after the beep</li>
                                                    <li>4. <strong>Monitor Duration:</strong> Watch the recording timer (max 30 seconds)</li>
                                                </ol>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Recording Best Practices</h3>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Environment Setup</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>Quiet Space:</strong> Minimize background noise</li>
                                                    <li>• <strong>Good Microphone:</strong> Use headphones or a quality microphone</li>
                                                    <li>• <strong>Stable Internet:</strong> Ensure reliable connection for speech-to-text</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recording Technique</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>Clear Speech:</strong> Speak clearly and at moderate pace</li>
                                                    <li>• <strong>Professional Tone:</strong> Maintain interview-appropriate demeanor</li>
                                                    <li>• <strong>Technical Terms:</strong> Pronounce technical terms clearly</li>
                                                    <li>• <strong>Breathing:</strong> Speak naturally with proper pauses</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recording Tips Interface</h4>
                                                <p className="text-gray-600 dark:text-gray-300 mb-2">
                                                    Access additional guidance by clicking "Recording Tips" during your interview:
                                                </p>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>✓ Find a quiet space with minimal background noise</li>
                                                    <li>✓ Speak clearly and at a moderate pace</li>
                                                    <li>✓ Use a good quality microphone (headphones work best)</li>
                                                    <li>✓ Position yourself close to, but not too close to, the mic</li>
                                                    <li>✓ Enunciate clearly, especially technical terms</li>
                                                    <li>✓ Keep answers concise but specific (1-3 minutes typically)</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Speech-to-Text Accuracy</h3>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">What Works Well</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>Clear Pronunciation:</strong> Standard English pronunciation</li>
                                                    <li>• <strong>Simple Vocabulary:</strong> Avoid complex or unusual terms</li>
                                                    <li>• <strong>Steady Pace:</strong> Consistent speaking speed</li>
                                                    <li>• <strong>Good Audio Quality:</strong> Clear microphone input</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Potential Issues</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>Technical Jargon:</strong> May not recognize specialized terms</li>
                                                    <li>• <strong>Accents:</strong> Heavy accents may reduce accuracy</li>
                                                    <li>• <strong>Background Noise:</strong> Interferes with speech recognition</li>
                                                    <li>• <strong>Fast Speech:</strong> Rapid talking reduces accuracy</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Manual Text Entry</h4>
                                                <p className="text-gray-600 dark:text-gray-300 mb-2">If voice recording doesn't work well:</p>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                    <li>• <strong>Switch to Text:</strong> Simply type your answer in the text area</li>
                                                    <li>• <strong>No Penalty:</strong> Text answers receive the same AI analysis</li>
                                                    <li>• <strong>Edit Capability:</strong> You can type, edit, and refine your response</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* Feedback and Analytics */}
                                <section id="feedback-analytics">
                                    <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                            📊 Feedback and Analytics
                                        </h2>

                                        <img
                                            src="/help/8-1.png"
                                            alt="Dashboard View of Interview History"
                                            className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                        />

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Accessing Your Feedback</h3>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">From Dashboard</h4>

                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>1. <strong>Recent Interviews:</strong> View your latest interview sessions</li>
                                                    <li>2. <strong>Feedback Button:</strong> Click "View Feedback" on any completed interview</li>
                                                    <li>3. <strong>Performance Metrics:</strong> See your overall improvement trends</li>
                                                </ol>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Direct Access</h4>

                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300">
                                                    <li>1. <strong>Feedback Page:</strong> Navigate to the Feedback section</li>
                                                    <li>2. <strong>Interview List:</strong> See all your completed interview sessions</li>
                                                    <li>3. <strong>Detailed Analysis:</strong> Click on any session for comprehensive feedback</li>
                                                </ol>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Understanding Your Feedback</h3>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Question-by-Question Analysis</h4>

                                                <p className="text-gray-600 dark:text-gray-300 mb-2">For each question, you'll see:</p>

                                                <div className="space-y-4">
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900 dark:text-white mb-1">Your Original Question</h5>
                                                        <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>• <strong>Question Text:</strong> The exact question asked</li>
                                                            <li>• <strong>Context:</strong> The job and company information used</li>
                                                            <li>• <strong>Question Number:</strong> Position in the interview sequence</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h5 className="font-semibold text-gray-900 dark:text-white mb-1">Your Answer</h5>
                                                        <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>• <strong>Full Response:</strong> Complete text of your answer</li>
                                                            <li>• <strong>Word Count:</strong> Number of words in your response</li>
                                                            <li>• <strong>Key Points:</strong> Main topics you covered</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h5 className="font-semibold text-gray-900 dark:text-white mb-1">AI Feedback</h5>
                                                        <img
                                                            src="/help/8-3.png"
                                                            alt="Feedback Page Interface"
                                                            className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                        />
                                                        <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>• <strong>Overall Assessment:</strong> General evaluation of your answer</li>
                                                            <li>• <strong>Strengths:</strong> What you did well</li>
                                                            <li>• <strong>Areas for Improvement:</strong> Specific suggestions for enhancement</li>
                                                            <li>• <strong>Rating:</strong> Score out of 10 for your response</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h5 className="font-semibold text-gray-900 dark:text-white mb-1">Improvement Suggestions</h5>
                                                        <img
                                                            src="/help/8-5.png"
                                                            alt="Performance Analytics Dashboard"
                                                            className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                        />
                                                        <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>• <strong>Specific Recommendations:</strong> Actionable advice for better responses</li>
                                                            <li>• <strong>Examples:</strong> Suggested improvements with examples</li>
                                                            <li>• <strong>Follow-up Questions:</strong> Questions you might expect next</li>
                                                            <li>• <strong>Skill Development:</strong> Areas to focus your preparation</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Performance Analytics</h3>
                                                <img
                                                    src="/help/8-4.png"
                                                    alt="Detailed Question Analysis View"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interview Metrics</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>Total Sessions:</strong> Number of interviews completed</li>
                                                    <li>• <strong>Questions Answered:</strong> Total questions across all sessions</li>
                                                    <li>• <strong>Average Rating:</strong> Your overall performance score</li>
                                                    <li>• <strong>Improvement Trend:</strong> How your ratings change over time</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Skill Assessment</h4>
                                                <img
                                                    src="/help/13.png"
                                                    alt="Detailed Question Analysis View"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>Communication:</strong> Clarity and structure of responses</li>
                                                    <li>• <strong>Relevance:</strong> How well you addressed the question</li>
                                                    <li>• <strong>Examples:</strong> Use of specific, relevant examples</li>
                                                    <li>• <strong>Confidence:</strong> Overall confidence in your delivery</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Progress Tracking</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                    <li>• <strong>Weekly Reports:</strong> Performance summaries by week</li>
                                                    <li>• <strong>Monthly Trends:</strong> Longer-term improvement patterns</li>
                                                    <li>• <strong>Goal Setting:</strong> Targets for future improvement</li>
                                                    <li>• <strong>Achievement Badges:</strong> Milestones and accomplishments</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* Practice Mode */}
                                <section id="practice-mode">
                                    <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                            🏃 Practice Mode
                                        </h2>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">What is Practice Mode?</h3>
                                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                                    Practice mode allows you to focus on specific areas of improvement by generating similar questions
                                                    to ones you've struggled with in past interviews.
                                                </p>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Accessing Practice Mode</h3>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">From Feedback Page</h4>
                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>1. <strong>Select an Interview:</strong> Choose a completed interview session</li>
                                                    <li>2. <strong>Find a Question:</strong> Locate the question you want to practice</li>
                                                    <li>3. <strong>Click "Practice Similar Question":</strong> Generate a variation</li>
                                                </ol>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">From Interview Session</h4>
                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300">
                                                    <li>1. <strong>During Interview:</strong> You can enable practice mode before starting</li>
                                                    <li>2. <strong>Session Settings:</strong> Choose practice mode in the interview setup</li>
                                                </ol>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">How Practice Mode Works</h3>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Question Generation</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>AI-Powered:</strong> Creates similar questions using advanced AI</li>
                                                    <li>• <strong>Personalized:</strong> Based on your original question and background</li>
                                                    <li>• <strong>Relevant:</strong> Maintains connection to the job and company context</li>
                                                    <li>• <strong>Challenging:</strong> Targets the specific skills you need to improve</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Practice Session Features</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                    <li>• <strong>Single Question Focus:</strong> Practice one question at a time</li>
                                                    <li>• <strong>Immediate Feedback:</strong> Get instant analysis of your response</li>
                                                    <li>• <strong>Credit Efficient:</strong> Only costs 1 credit per practice question</li>
                                                    <li>• <strong>Progress Tracking:</strong> Practice sessions are saved to your history</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Practice Mode Best Practices</h3>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">When to Use Practice Mode</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>After Poor Performance:</strong> When you receive low ratings on specific questions</li>
                                                    <li>• <strong>Before Important Interviews:</strong> To prepare for specific question types</li>
                                                    <li>• <strong>Regular Practice:</strong> To maintain and improve your skills</li>
                                                    <li>• <strong>Skill Development:</strong> To work on particular competencies</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Effective Practice Strategy</h4>
                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300">
                                                    <li>1. <strong>Identify Weak Areas:</strong> Review feedback to find low-scoring topics</li>
                                                    <li>2. <strong>Generate Similar Questions:</strong> Create multiple variations</li>
                                                    <li>3. <strong>Practice Regularly:</strong> Use practice mode consistently</li>
                                                    <li>4. <strong>Track Improvement:</strong> Monitor your progress over time</li>
                                                    <li>5. <strong>Combine with Other Prep:</strong> Use alongside other interview preparation</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* Payment and x402 Protocol */}
                                <section id="payments">
                                    <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                            💰 Payment and x402 Protocol
                                        </h2>

                                        <img
                                            src="/help/10-1.png"
                                            alt="Payment Overview Interface"
                                            className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                        />

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Understanding x402 Payments</h3>
                                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                                                    x402 is an innovative payment protocol that enables secure, blockchain-based transactions.
                                                    Ainterview uses x402 to provide:
                                                </p>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                    <li>• <strong>Instant Payments:</strong> Fast transaction processing</li>
                                                    <li>• <strong>Low Fees:</strong> Minimal transaction costs</li>
                                                    <li>• <strong>Global Access:</strong> Available worldwide</li>
                                                    <li>• <strong>Multiple Tokens:</strong> Support for various cryptocurrencies</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Supported Payment Tokens</h3>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">USDC (USD Coin)</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>Stable Value:</strong> Pegged to US Dollar</li>
                                                    <li>• <strong>Wide Acceptance:</strong> Most commonly supported token</li>
                                                    <li>• <strong>Easy Purchase:</strong> Available on most exchanges</li>
                                                    <li>• <strong>Recommended:</strong> Best option for most users</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">PYUSD (PayPal USD)</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>PayPal Integration:</strong> Backed by PayPal</li>
                                                    <li>• <strong>Dollar-Pegged:</strong> Stable value like USDC</li>
                                                    <li>• <strong>Growing Support:</strong> Increasingly available</li>
                                                    <li>• <strong>Alternative Option:</strong> Good second choice</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">CASH (Phantom Cash)</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                    <li>• <strong>Phantom Wallet:</strong> Native integration with Phantom wallet</li>
                                                    <li>• <strong>Community Driven:</strong> Supported by Phantom ecosystem</li>
                                                    <li>• <strong>Emerging Token:</strong> Newer option with growing adoption</li>
                                                    <li>• <strong>Special Access:</strong> Available to Phantom wallet users</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Making a Payment</h3>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Step 1: Access Payment Page</h4>
                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>1. <strong>Insufficient Credits:</strong> Click "Buy Credits" when prompted</li>
                                                    <li>2. <strong>Direct Navigation:</strong> Go to Payment page from main menu</li>
                                                    <li>3. <strong>Credit Display:</strong> Click the plus (+) icon next to your credit count</li>
                                                </ol>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Step 2: Connect Your Wallet</h4>
                                                <img
                                                    src="/help/10-2.png"
                                                    alt="Wallet Connection Interface"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />
                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>1. <strong>Wallet Connection:</strong> Click "Connect Wallet" button</li>
                                                    <li>2. <strong>Choose Wallet:</strong> Select your Solana-compatible wallet</li>
                                                    <li>3. <strong>Approve Connection:</strong> Authorize the connection in your wallet</li>
                                                    <li>4. <strong>Verify Status:</strong> Confirm wallet is connected (button will change)</li>
                                                </ol>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Step 3: Select Payment Details</h4>
                                                <img
                                                    src="/help/10-3.png"
                                                    alt="Wallet Connection Interface"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />
                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>1. <strong>Choose Token:</strong> Select USDC, PYUSD, or CASH</li>
                                                    <li>2. <strong>Set Credit Amount:</strong> Use slider to choose 5-100 credits</li>
                                                    <li>3. <strong>View Cost:</strong> See USD amount for your selected credits</li>
                                                    <li>4. <strong>Review Total:</strong> Confirm the transaction amount</li>
                                                </ol>
                                                <img
                                                    src="/help/10-4.png"
                                                    alt="Select amount and token for payment"
                                                    className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                                />

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Step 4: Complete Transaction</h4>
                                                <ol className="space-y-2 text-gray-600 dark:text-gray-300">
                                                    <li>1. <strong>Click Payment Button:</strong> Initiate the blockchain transaction</li>
                                                    <li>2. <strong>Approve in Wallet:</strong> Confirm the transaction in your wallet</li>
                                                    <li>3. <strong>Wait for Confirmation:</strong> Transaction processing takes 10-30 seconds</li>
                                                    <li>4. <strong>Receive Confirmation:</strong> You'll see success message and credit update</li>
                                                </ol>
                                            </div>
                                            <img
                                                src="/help/10-5.png"
                                                alt="Select amount and token for payment"
                                                className="w-full max-w-2xl mx-auto mb-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
                                            />
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Payment Security</h3>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Blockchain Verification</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>Transaction Recording:</strong> All payments recorded on Solana blockchain</li>
                                                    <li>• <strong>Immutable Records:</strong> Transactions cannot be altered or reversed</li>
                                                    <li>• <strong>Public Verification:</strong> Transaction status publicly verifiable</li>
                                                    <li>• <strong>Fraud Protection:</strong> Built-in security features</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">x402 Protocol Benefits</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                    <li>• <strong>Autonomous Payments:</strong> No intermediary required</li>
                                                    <li>• <strong>Global Access:</strong> Available anywhere with internet</li>
                                                    <li>• <strong>Low Fees:</strong> Minimal transaction costs</li>
                                                    <li>• <strong>Fast Settlement:</strong> Quick payment confirmation</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* Troubleshooting */}
                                <section id="troubleshooting">
                                    <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                            🔧 Troubleshooting
                                        </h2>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Common Issues and Solutions</h3>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Account and Access Issues</h4>
                                                <div className="space-y-4 mb-6">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Problem: Can't access the platform</p>
                                                        <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>• Solution: Ensure you have a valid invitation code from the README.md</li>
                                                            <li>• Check: Verify the code is entered exactly as shown</li>
                                                            <li>• Support: Contact the development team if codes don't work</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Problem: Email verification not working</p>
                                                        <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>• Check: Verify you're using the correct email address</li>
                                                            <li>• Resend: Look for "Resend verification email" option</li>
                                                            <li>• Spam Folder: Check your spam/junk email folder</li>
                                                            <li>• Timeout: Verification links expire after 24 hours</li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Credit System Issues</h4>
                                                <div className="space-y-4 mb-6">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Problem: Credits not showing after payment</p>
                                                        <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>• Wait: Allow 30-60 seconds for blockchain confirmation</li>
                                                            <li>• Refresh: Click the refresh icon next to your credit display</li>
                                                            <li>• Check Wallet: Verify transaction was approved in your wallet</li>
                                                            <li>• Support: Contact support if credits don't appear after 5 minutes</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Problem: Daily free credits not available</p>
                                                        <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>• Timing: Free credits reset at midnight UTC</li>
                                                            <li>• Claim: Click the refresh icon (+) to claim daily credits</li>
                                                            <li>• Eligibility: Must have used all previous free credits first</li>
                                                            <li>• Account Status: Ensure your account is in good standing</li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interview Session Issues</h4>
                                                <div className="space-y-4 mb-6">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Problem: Interview won't start</p>
                                                        <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>• Credits: Verify you have sufficient credits</li>
                                                            <li>• Profile: Ensure you have entered job posting and CV information</li>
                                                            <li>• Browser: Try refreshing the page or using a different browser</li>
                                                            <li>• Connection: Check your internet connection</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Problem: AI not responding</p>
                                                        <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>• Credits: Ensure you have enough credits for AI interactions</li>
                                                            <li>• API Status: Check if there are any service announcements</li>
                                                            <li>• Retry: Wait a moment and try again</li>
                                                            <li>• Support: Contact support for persistent issues</li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Voice Recording Issues</h4>
                                                <div className="space-y-4 mb-6">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Problem: Microphone not working</p>
                                                        <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>• Permissions: Check browser permissions for microphone access</li>
                                                            <li>• Hardware: Verify your microphone is working in other applications</li>
                                                            <li>• Browser: Try using Chrome or Firefox for best compatibility</li>
                                                            <li>• HTTPS: Ensure you're using a secure connection (https://)</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Problem: Speech-to-text not accurate</p>
                                                        <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>• Environment: Reduce background noise</li>
                                                            <li>• Speaking: Speak clearly and at moderate pace</li>
                                                            <li>• Technical Terms: Consider typing complex technical terms</li>
                                                            <li>• Alternative: Use text input instead of voice recording</li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Payment Issues</h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Problem: Wallet not connecting</p>
                                                        <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>• Extension: Ensure wallet browser extension is installed</li>
                                                            <li>• Unlock: Make sure your wallet is unlocked</li>
                                                            <li>• Network: Verify you're on the correct Solana network</li>
                                                            <li>• Refresh: Try refreshing the page and reconnecting</li>
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Problem: Transaction failing</p>
                                                        <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>• Balance: Check you have enough tokens and SOL for fees</li>
                                                            <li>• Network: Verify Solana network is functioning</li>
                                                            <li>• Wallet: Try disconnecting and reconnecting your wallet</li>
                                                            <li>• Support: Contact support for failed transactions</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Browser Compatibility</h3>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recommended Browsers</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>Chrome:</strong> Full feature support, best performance</li>
                                                    <li>• <strong>Firefox:</strong> Good compatibility, all features work</li>
                                                    <li>• <strong>Safari:</strong> Good on macOS, some features may be limited</li>
                                                    <li>• <strong>Edge:</strong> Full support on Windows</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Required Features</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                                                    <li>• <strong>JavaScript:</strong> Must be enabled</li>
                                                    <li>• <strong>Local Storage:</strong> Required for session persistence</li>
                                                    <li>• <strong>Microphone Access:</strong> Needed for voice recording</li>
                                                    <li>• <strong>WebRTC:</strong> Required for blockchain wallet connections</li>
                                                </ul>

                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">For Best Experience</h4>
                                                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                                                    <li>• <strong>Stable Internet:</strong> Use reliable broadband connection</li>
                                                    <li>• <strong>Updated Browser:</strong> Keep your browser updated to latest version</li>
                                                    <li>• <strong>Clear Cache:</strong> Clear browser cache if experiencing issues</li>
                                                    <li>• <strong>Close Tabs:</strong> Limit the number of open tabs for better performance</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* FAQ */}
                                <section id="faq">
                                    <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                            ❓ Frequently Asked Questions
                                        </h2>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">General Questions</h3>

                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: What makes Ainterview different from other interview prep tools?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A: Ainterview uses AI specifically trained on your target job and company, providing hyper-personalized
                                                            interview practice. Unlike generic question banks, our AI understands the specific role requirements
                                                            and company culture you're interviewing for.
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: How accurate is the AI feedback?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A: Our AI uses advanced language models trained on thousands of successful interview responses.
                                                            While it's highly accurate, it's designed to be a guide for improvement rather than a definitive
                                                            assessment. Use it to identify patterns and areas for development.
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: Can I use Ainterview for any type of interview?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A: Ainterview currently focuses on behavioral and general interview questions. It's excellent for
                                                            roles requiring communication skills, problem-solving, and cultural fit assessment. Technical role
                                                            interviews may need additional preparation for role-specific questions.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Credit and Payment Questions</h3>

                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: How many credits do I need for a full interview?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A: A standard 5-question interview costs 5 credits, and a 10-question interview costs 10 credits.
                                                            You also get 2 free credits daily, plus your initial 5 credits when you register.
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: Do unused credits expire?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A: No, purchased credits do not expire. You can use them anytime. Free daily credits must be
                                                            claimed each day and cannot be accumulated.
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: What happens if I run out of credits during an interview?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A: You'll be prompted to purchase more credits to continue. The interview will pause, and you
                                                            can resume once you have sufficient credits.
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: Is x402 payment secure?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A: Yes, x402 payments are secured by blockchain technology. All transactions are recorded on
                                                            the Solana blockchain, making them immutable and publicly verifiable.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Technical Questions</h3>

                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: Can I use Ainterview on mobile devices?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A: Ainterview is a Progressive Web App (PWA) that works on mobile browsers. For the best experience,
                                                            we recommend using a desktop computer, but mobile access is available.
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: What if I don't want to use voice recording?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A: Voice recording is optional. You can always type your answers in the text area. The AI provides
                                                            the same quality feedback for both voice and text responses.
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: How long should my answers be?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A: Aim for 1-3 minutes when speaking or 100-300 words when typing. The AI evaluates content
                                                            quality over length, so focus on providing comprehensive, relevant responses.
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: Can I practice with the same job posting multiple times?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A: Yes, you can create multiple interview sessions with the same job posting. Each session will
                                                            generate different questions, providing varied practice opportunities.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Account and Privacy Questions</h3>

                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: How is my data protected?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A: We use industry-standard encryption and security measures. Your personal information and
                                                            interview responses are stored securely and never shared with third parties.
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: Can I delete my account and data?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A: Yes, you can request account deletion at any time. All your data will be permanently
                                                            removed from our systems.
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: Will my interview responses be used to train the AI?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A: No, your personal interview responses are not used to train the AI. They're only used to
                                                            provide your personal feedback and analytics.
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">Q: How do I get the best results from Ainterview?</p>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                                                            A:
                                                        </p>
                                                        <ol className="mt-1 space-y-1 text-gray-600 dark:text-gray-300">
                                                            <li>1. Complete your profile with detailed, accurate information</li>
                                                            <li>2. Research the company and role thoroughly</li>
                                                            <li>3. Practice regularly, not just before interviews</li>
                                                            <li>4. Review feedback carefully and implement suggestions</li>
                                                            <li>5. Use practice mode to focus on weak areas</li>
                                                        </ol>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Troubleshooting Quick Reference</h3>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-gray-600 dark:text-gray-300">
                                                        <thead>
                                                            <tr className="border-b border-gray-200 dark:border-gray-600">
                                                                <th className="text-left py-2">Issue</th>
                                                                <th className="text-left py-2">Quick Solution</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td className="py-2">Can't access platform</td>
                                                                <td className="py-2">Check invitation code in README.md</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-2">No credits showing</td>
                                                                <td className="py-2">Refresh page or click credit refresh icon</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-2">Interview won't start</td>
                                                                <td className="py-2">Verify job posting and CV info are entered</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-2">Voice not working</td>
                                                                <td className="py-2">Check browser permissions and microphone</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-2">Payment failing</td>
                                                                <td className="py-2">Ensure wallet connected and sufficient balance</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="py-2">AI not responding</td>
                                                                <td className="py-2">Check credit balance and try again</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Support Contact</h3>
                                                <p className="text-gray-600 dark:text-gray-300">For additional support:</p>
                                                <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                                                    <li>• <strong>Technical Issues:</strong> Check the troubleshooting section above</li>
                                                    <li>• <strong>Account Problems:</strong> Contact the development team</li>
                                                    <li>• <strong>Payment Issues:</strong> Verify wallet connection and transaction status</li>
                                                    <li>• <strong>Feature Requests:</strong> Share your ideas with the development team</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                </section>

                                {/* Back to Top Button */}
                                <div className="text-center">
                                    <Button
                                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                        className="bg-gradient-to-r from-green-600 to-lime-500 text-white hover:opacity-90 font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                                    >
                                        <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                                        Back to Top
                                    </Button>
                                </div>

                                {/* x402 Compliance Badge */}
                                <div className="flex justify-center mt-8">
                                    <X402ComplianceBadge />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
