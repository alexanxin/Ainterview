import type { Metadata } from 'next';

const siteUrl = 'https://ainterview.app';

// Optimized long-tail keywords focusing on technical niche specialization and high-conversion intent
const defaultKeywords = 'AI mock interview coaching, technical interview preparation AI, systems design interview practice, coding interview AI feedback, behavioral interview STAR method AI, AI interview prep for software engineers, personalized job-specific interview simulation, real-time AI feedback technical interviews, practice FAANG coding questions, best AI tool for interview preparation 2025';

export interface SEOConfig {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url: string;
    noindex?: boolean;
    canonical?: string;
    breadcrumbs?: Array<{ name: string; url: string }>;
    type?: 'website' | 'article';
    serviceType?: string;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    articleSection?: string;
    tags?: string[];
}

// Generate metadata for Next.js pages
export function generateMetadata(config: SEOConfig): Metadata {
    const fullUrl = `${siteUrl}${config.url}`;
    const fullImageUrl = config.image ?
        (config.image.startsWith('http') ? config.image : `${siteUrl}${config.image}`) :
        `${siteUrl}/logo.png`;
    const finalCanonical = config.canonical || fullUrl;
    const finalKeywords = config.keywords || defaultKeywords;

    return {
        title: config.title,
        description: config.description,
        keywords: finalKeywords,
        authors: [{ name: config.author || "Ainterview Team" }],
        creator: "Ainterview Team",
        publisher: "Ainterview",
        robots: {
            index: !config.noindex,
            follow: !config.noindex,
        },
        openGraph: {
            type: (config.type || 'website') as 'website' | 'article',
            title: config.title,
            description: config.description,
            url: fullUrl,
            siteName: 'Ainterview',
            images: [{
                url: fullImageUrl,
                width: 1200,
                height: 630,
                alt: config.title,
            }],
            locale: 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title: config.title,
            description: config.description,
            images: [fullImageUrl],
            creator: '@Ainterview',
        },
        alternates: {
            canonical: finalCanonical,
        },
    };
}

// Generate structured data as JSON string
export function generateStructuredData(config: SEOConfig): string {
    const fullUrl = `${siteUrl}${config.url}`;
    const structuredData = [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Ainterview",
            "description": "AI-powered interview preparation platform with x402 protocol payments that provides personalized, realistic interview simulations with instant feedback.",
            "url": siteUrl,
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${siteUrl}/help?search={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Ainterview",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${siteUrl}/logo.png`
                }
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Ainterview",
            "applicationCategory": "EducationApplication",
            "operatingSystem": "Web",
            "description": "AI-powered interview preparation platform with x402 protocol micropayments that provides personalized, realistic interview simulations with instant feedback using Gemini 2.5.",
            "url": siteUrl,
            "image": `${siteUrl}/logo.png`,
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Free with credit system - 5 free credits on registration, 2 free credits daily. 97% payment cost reduction with x402 protocol"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250",
                "bestRating": "5",
                "worstRating": "1"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Ainterview",
                "url": siteUrl
            },
            "featureList": [
                "AI-powered personalized interview questions",
                "Real-time feedback and analysis",
                "Voice recording capabilities",
                "Progress tracking and analytics",
                "Company-specific interview preparation",
                "x402 protocol payment integration",
                "Solana blockchain micropayments",
                "Gemini 2.5 AI model"
            ]
        }
    ] as const;

    // Create additional schema objects
    const additionalSchemas: Array<Record<string, unknown>> = [];

    // Add breadcrumbs
    if (config.breadcrumbs) {
        const breadcrumbSchema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": config.breadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": crumb.name,
                "item": `${siteUrl}${crumb.url}`
            }))
        };
        additionalSchemas.push(breadcrumbSchema);
    }

    // Add service schema
    if (config.serviceType) {
        const serviceSchema = {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": config.title,
            "description": config.description,
            "serviceType": config.serviceType,
            "provider": {
                "@type": "Organization",
                "name": "Ainterview"
            },
            "areaServed": "Worldwide",
            "url": fullUrl,
            "priceRange": "Free with paid credits via x402 protocol"
        };
        additionalSchemas.push(serviceSchema);
    }

    // Add FAQ schema for homepage
    if (config.url === "/") {
        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "How much does it cost?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Your first interview is free! After that, you get 2 free credits daily, or purchase credits starting at $0.50 each. No credit card required to get started."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What makes Ainterview different?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Our AI is trained specifically on your target job and company, creating hyper-personalized interviews that mirror real hiring processes. Unlike generic tools, we analyze your exact job requirements."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Can I try it free?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes! You get 5 free credits when you sign up, plus 2 additional free credits every day to continue practicing systems design and behavioral interviews."
                    }
                },
                {
                    "@type": "Question",
                    "name": "How accurate is the feedback?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Our AI provides detailed analysis of your answers against FAANG interview standards. Get specific feedback on technical depth, communication clarity, and problem-solving approach."
                    }
                }
            ]
        };
        additionalSchemas.push(faqSchema);
    }

    const allSchemas = [...structuredData, ...additionalSchemas];
    return JSON.stringify(allSchemas, null, 2);
}

// Component for rendering structured data
export function StructuredData({ config }: { config: SEOConfig }) {
    const structuredData = generateStructuredData(config);

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: structuredData }}
        />
    );
}

// Pre-configured SEO settings for common pages
export const pageSEO = {
    homepage: {
        title: "Ainterview: AI Mock Interview Coaching for High-Stakes Roles",
        description: "Stop practicing generic answers. Get personalized AI feedback tailored to your exact job description and land the high-paying role.",
        keywords: "AI mock interview coaching, technical interview preparation AI, systems design interview practice, coding interview AI feedback, behavioral interview STAR method AI, AI interview prep for software engineers",
        image: "/logo.png",
        url: "/",
    } as SEOConfig,

    about: {
        title: "About Ainterview - Revolutionary AI Interview Platform with x402 Payments",
        description: "Discover how Ainterview revolutionizes interview preparation with AI-powered personalization, realistic Gemini simulations, instant feedback, and groundbreaking x402 protocol integration.",
        keywords: "about ainterview, AI interview platform, x402 protocol, interview preparation company, AI technology interviews, Solana blockchain payments, micropayment AI service, technical interview prep",
        image: "/logo.png",
        url: "/about",
        breadcrumbs: [
            { name: "Home", url: "/" },
            { name: "About", url: "/about" }
        ],
        serviceType: "AI Interview Preparation Service"
    } as SEOConfig,

    help: {
        title: "Help Center - Ainterview x402 Protocol AI Interview Platform",
        description: "Complete guide to using Ainterview's x402 protocol integration. Learn about AI interview preparation, Gemini-powered feedback, credit system, and Solana micropayment setup.",
        keywords: "ainterview help, x402 protocol guide, AI interview support, user documentation, Gemini AI interview, Solana payment help, micropayment troubleshooting, interview preparation guide",
        image: "/logo.png",
        url: "/help",
        breadcrumbs: [
            { name: "Home", url: "/" },
            { name: "Help", url: "/help" }
        ]
    } as SEOConfig,

    interview: {
        title: "Start AI Interview Practice - Personalized Gemini-Powered Simulation",
        description: "Begin your personalized AI interview practice with Gemini 2.5. Enter job posting and CV details for hyper-realistic interview simulation with real-time feedback.",
        keywords: "AI interview practice, personalized interview simulation, Gemini 2.5 interview model, AI feedback job posting analysis, technical interview prep AI, real-time interview performance analytics",
        image: "/logo.png",
        url: "/interview",
        noindex: true,
        breadcrumbs: [
            { name: "Home", url: "/" },
            { name: "Interview", url: "/interview" }
        ]
    } as SEOConfig,

    dashboard: {
        title: "Dashboard - Your AI Interview Progress & Analytics",
        description: "View your interview progress, performance analytics, and credit balance. Track improvement with detailed Gemini AI feedback and insights.",
        keywords: "interview dashboard, AI interview progress, performance analytics, interview tracking, Gemini AI feedback, real-time interview analytics",
        image: "/logo.png",
        url: "/dashboard",
        noindex: true,
        breadcrumbs: [
            { name: "Home", url: "/" },
            { name: "Dashboard", url: "/dashboard" }
        ]
    } as SEOConfig,

    profile: {
        title: "Profile - Manage Your AI Interview Data",
        description: "Update your profile, CV, and professional information for better Gemini AI interview personalization. Import from LinkedIn PDF.",
        keywords: "ainterview profile, CV management, AI interview personalization, resume, professional profile, LinkedIn import, AI feedback optimization",
        image: "/logo.png",
        url: "/profile",
        noindex: true,
        breadcrumbs: [
            { name: "Home", url: "/" },
            { name: "Profile", url: "/profile" }
        ]
    } as SEOConfig,

    auth: {
        title: "Sign In - Access Ainterview's x402 AI Interview Platform",
        description: "Sign in to Ainterview to access your AI interview practice sessions, x402 micropayment system, and personalized Gemini-powered interview preparation.",
        keywords: "ainterview sign in, x402 platform access, AI interview platform login, authentication, Solana payment integration",
        image: "/logo.png",
        url: "/auth",
        noindex: true
    } as SEOConfig,
} as const;

export type PageSEOKey = keyof typeof pageSEO;
