'use client';

import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    structuredData?: any;
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

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Canonical URL */}
            <link rel="canonical" href={finalCanonical} />

            {/* Robots Meta */}
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph Meta Tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImageUrl} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:site_name" content="Ainterview" />
            <meta property="og:locale" content="en_US" />

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImageUrl} />

            {/* Additional Meta Tags for better SEO */}
            <meta name="author" content="Ainterview Team" />
            <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
            <meta name="googlebot" content="index, follow" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* Language and Region */}
            <meta name="language" content="English" />
            <meta name="geo.region" content="US" />
            <meta name="geo.placename" content="United States" />

            {/* Structured Data */}
            {allStructuredData.map((schema, index) => (
                <script key={index} type="application/ld+json">
                    {JSON.stringify(schema, null, 2)}
                </script>
            ))}
        </Helmet>
    );
}

// Component for pages that need specific article meta tags
export function ArticleSEO(props: SEOProps & {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    articleSection?: string;
    tags?: string[];
}) {
    const { author, publishedTime, modifiedTime, articleSection, tags, ...seoProps } = props;

    return (
        <SEO {...seoProps} type="article">
            {/* Article-specific meta tags */}
            {author && <meta property="article:author" content={author} />}
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {articleSection && <meta property="article:section" content={articleSection} />}
            {tags && tags.map(tag => (
                <meta key={tag} property="article:tag" content={tag} />
            ))}
        </SEO>
    );
}

// Component for product/service pages
export function ServiceSEO(props: SEOProps & {
    serviceType?: string;
    provider?: string;
    areaServed?: string;
    priceRange?: string;
    aggregateRating?: {
        ratingValue: string;
        ratingCount: string;
    };
}) {
    const { serviceType, provider, areaServed, priceRange, aggregateRating, ...seoProps } = props;

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": props.title,
        "description": props.description,
        "serviceType": serviceType,
        "provider": {
            "@type": "Organization",
            "name": provider || "Ainterview"
        },
        "areaServed": areaServed || "Worldwide",
        "url": seoProps.url ? `${siteUrl}${seoProps.url}` : siteUrl,
        ...(aggregateRating && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": aggregateRating.ratingValue,
                "ratingCount": aggregateRating.ratingCount
            }
        }),
        ...(priceRange && { "priceRange": priceRange })
    };

    return (
        <SEO {...seoProps} type="product" structuredData={serviceSchema} />
    );
}

const siteUrl = 'https://ainterview.app';