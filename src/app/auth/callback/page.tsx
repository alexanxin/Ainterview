// Force dynamic rendering to avoid useSearchParams hydration issues
'use client';
export const dynamic = 'force-dynamic';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/navigation';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    // Handle the authentication callback
    const handleCallback = async () => {
      // In a real implementation, you would handle the OAuth callback here
      // For now, we'll just redirect to the specified path or dashboard
      router.push(redirectPath);
    };

    handleCallback();
  }, [router, redirectPath]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-black">
      <Navigation />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-md py-12 px-4">
          <Card className="shadow-xl dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                Authenticating...
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-12">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-white">
                  <img src="/logo.png" alt="Ainterview Logo" className="h-full w-full p-2" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Setting up your account
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we authenticate your account and redirect you...
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth')}
                >
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-black">
        <Navigation />
        <main className="flex-1 p-4">
          <div className="container mx-auto max-w-md py-12 px-4">
            <Card className="shadow-xl dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                  Loading...
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Please wait...
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
