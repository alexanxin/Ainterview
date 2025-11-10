'use client';

import { useEffect } from 'react';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    structuredData?: object;
    noindex?: boolean;
    canonical?: string;
    breadcrumbs?: Array<{ name: string; url: string }>;
}

export default function SEO({
    title,
    description,
    keywords,
    image = '/logo.png',
    url = '',
    type = 'website',
    structuredData,
    noindex = false,
    canonical,
    breadcrumbs
}: SEOProps) {
    const siteUrl = 'https://ainterview.app';
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
    const finalCanonical = canonical || fullUrl;

    // Generate breadcrumbs structured data
    const generateBreadcrumbsData = () => {
        if (!breadcrumbs || breadcrumbs.length === 0) return null;

        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": crumb.name,
                "item": `${siteUrl}${crumb.url}`
            }))
        };
    };

    const webSiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Ainterview",
        "description": "AI-powered interview preparation platform",
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
    };

    const softwareApplicationSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Ainterview",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "description": "AI-powered interview preparation platform that provides personalized, realistic interview simulations with instant feedback.",
        "url": fullUrl,
        "image": fullImageUrl,
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Free with credit system - 5 free credits on registration, 2 free credits daily"
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
            "x402 protocol payment integration"
        ]
    };

    // Combine structured data
    const allStructuredData = [
        webSiteSchema,
        softwareApplicationSchema,
        ...(structuredData ? [structuredData] : []),
        ...(breadcrumbs ? [generateBreadcrumbsData()].filter(Boolean) : [])
    ].filter(Boolean);

    useEffect(() => {
        // Update document title
        document.title = title;

        // Helper function to set or update meta tags
        const setMetaTag = (name: string, content: string, property = false) => {
            const attribute = property ? 'property' : 'name';
            let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
            if (element) {
                element.content = content;
            } else {
                element = document.createElement('meta');
                element.setAttribute(attribute, name);
                element.content = content;
                document.head.appendChild(element);
            }
        };

        // Helper function to set link tags
        const setLinkTag = (rel: string, href: string) => {
            let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
            if (element) {
                element.href = href;
            } else {
                element = document.createElement('link');
                element.rel = rel;
                element.href = href;
                document.head.appendChild(element);
            }
        };

        // Set basic meta tags
        setMetaTag('description', description);
        if (keywords) setMetaTag('keywords', keywords);

        // Set canonical URL
        setLinkTag('canonical', finalCanonical);

        // Set robots meta
        setMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        setMetaTag('googlebot', 'index, follow');

        // Open Graph meta tags
        setMetaTag('og:type', type, true);
        setMetaTag('og:title', title, true);
        setMetaTag('og:description', description, true);
        setMetaTag('og:image', fullImageUrl, true);
        setMetaTag('og:url', fullUrl, true);
        setMetaTag('og:site_name', 'Ainterview', true);
        setMetaTag('og:locale', 'en_US', true);

        // Twitter Card meta tags
        setMetaTag('twitter:card', 'summary_large_image');
        setMetaTag('twitter:title', title);
        setMetaTag('twitter:description', description);
        setMetaTag('twitter:image', fullImageUrl);

        // Additional meta tags
        setMetaTag('author', 'Ainterview Team');
        setMetaTag('viewport', 'width=device-width, initial-scale=1.0');
        setMetaTag('language', 'English');
        setMetaTag('geo.region', 'US');
        setMetaTag('geo.placename', 'United States');

        // Remove existing structured data scripts
        const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
        existingScripts.forEach(script => script.remove());

        // Add structured data scripts
        allStructuredData.forEach((schema, index) => {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(schema, null, 2);
            document.head.appendChild(script);
        });
    }, [title, description, keywords, fullImageUrl, fullUrl, finalCanonical, noindex, type, allStructuredData]);

    return null; // This component doesn't render anything visible
}

// Structured Data Component
interface StructuredDataProps {
    config: object;
}

export function StructuredData({ config }: StructuredDataProps) {
    useEffect(() => {
        if (!config) return;

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(config, null, 2);
        document.head.appendChild(script);

        return () => {
            // Cleanup function to remove the script when component unmounts
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [config]);

    return null;
}

// SEO utilities and page configurations
export const pageSEO = {
    home: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Ainterview",
        "description": "AI-powered interview preparation platform with personalized simulations",
        "url": "https://ainterview.app",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://ainterview.app/help?search={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    },
    about: {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About Ainterview",
        "description": "Learn about Ainterview's mission to revolutionize interview preparation with AI technology",
        "url": "https://ainterview.app/about"
    },
    help: {
        "@context": "https://schema.org",
        "@type": "HelpPage",
        "name": "Help Center - Ainterview",
        "description": "Complete help documentation and support for Ainterview platform",
        "url": "https://ainterview.app/help"
    },
    interview: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "AI Interview Practice - Ainterview",
        "description": "Start your personalized AI interview practice session with real job posting and CV integration",
        "url": "https://ainterview.app/interview"
    },
    profile: {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "name": "My Profile - Ainterview",
        "description": "Manage your professional profile and CV information for better interview preparation",
        "url": "https://ainterview.app/profile"
    },
    technology: {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "name": "Ainterview Technology Stack - x402 Protocol & AI Architecture",
        "description": "Explore Ainterview's cutting-edge technology including x402 protocol, Gemini 1.5 Pro AI, and Solana blockchain integration",
        "url": "https://ainterview.app/technology",
        "author": {
            "@type": "Organization",
            "name": "Ainterview Team"
        },
        "datePublished": "2024-01-01",
        "dateModified": "2024-01-01",
        "keywords": "x402 protocol, AI interview platform, Gemini 1.5 Pro, Solana blockchain, micropayments, Next.js application, Supabase database",
        "articleSection": "Technology",
        "wordCount": "2500"
    }
};

// Page-specific metadata configurations
interface ConfigObject {
    name?: string;
    description?: string;
    keywords?: string;
    url?: string;
}

export const generateMetadata = (config: ConfigObject) => {
    if (!config) return {};

    return {
        title: config.name || 'Ainterview - AI Interview Preparation',
        description: config.description || 'AI-powered interview preparation platform',
        keywords: config.keywords || 'AI interview, interview preparation, job interview practice, artificial intelligence',
        openGraph: {
            title: config.name || 'Ainterview - AI Interview Preparation',
            description: config.description || 'AI-powered interview preparation platform',
            url: config.url || 'https://ainterview.app',
            siteName: 'Ainterview',
            images: [
                {
                    url: '/logo.png',
                    width: 1200,
                    height: 630,
                    alt: 'Ainterview - AI Interview Preparation',
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: config.name || 'Ainterview - AI Interview Preparation',
            description: config.description || 'AI-powered interview preparation platform',
            images: ['/logo.png'],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
};