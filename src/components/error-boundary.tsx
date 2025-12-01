'use client';

import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Check if this is the specific DOM manipulation error we're trying to fix
        if (error.message.includes('removeChild') && error.message.includes('not a child of this node')) {
            console.warn('DOM manipulation error caught by ErrorBoundary:', error);
            // Don't show error UI for this specific error, just log it
            return { hasError: false };
        }

        // For other errors, show the error UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Check if this is the DOM manipulation error
        if (error.message.includes('removeChild') && error.message.includes('not a child of this node')) {
            console.warn('DOM manipulation error caught and suppressed:', error, errorInfo);
            // Reset error state to prevent error UI
            this.setState({ hasError: false });
            return;
        }

        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError && this.state.error) {
            // Only show error UI for non-DOM manipulation errors
            const FallbackComponent = this.props.fallback || DefaultErrorFallback;
            return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
        }

        return this.props.children;
    }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-8 max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Something went wrong
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {error?.message || 'An unexpected error occurred'}
                </p>
                <button
                    onClick={resetError}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}

export default ErrorBoundary;
