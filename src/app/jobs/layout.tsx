import { Metadata } from 'next';
import B2BNavigation from '@/components/b2b-navigation';

export const metadata: Metadata = {
    title: 'Available Jobs - Ainterview',
    description: 'Browse and apply to job posts created by companies using AI-powered interviews.',
};

export default function JobsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
            <B2BNavigation />
            {children}
        </div>
    );
}
