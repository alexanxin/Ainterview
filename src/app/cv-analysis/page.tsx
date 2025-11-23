import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, StructuredData } from '@/lib/seo';
import CVAnalysisClient from './client-component.tsx';

export const metadata: Metadata = generateSEOMetadata({
    title: "AI CV Analysis & Optimization Tool - Professional Resume Review",
    description: "Get comprehensive AI-powered CV analysis with personalized feedback, improvement suggestions, and ATS optimization recommendations. Improve your resume quality instantly.",
    keywords: "AI CV analysis, resume analysis tool, CV optimization, AI resume review, professional CV feedback, ATS resume checker, resume improvement AI, CV quality analysis, personalized resume feedback, job application optimization",
    image: "/logo.png",
    url: "/cv-analysis",
    breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "CV Analysis", url: "/cv-analysis" }
    ],
    serviceType: "AI Resume Analysis Service"
});

export default function CVAnalysisPage() {
    return (
        <>
            <StructuredData config={{
                title: "AI CV Analysis & Optimization Tool - Professional Resume Review",
                description: "Get comprehensive AI-powered CV analysis with personalized feedback, improvement suggestions, and ATS optimization recommendations. Improve your resume quality instantly.",
                url: "/cv-analysis",
                image: "/logo.png"
            }} />
            <CVAnalysisClient />
        </>
    );
}