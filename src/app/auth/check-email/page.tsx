'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';

export default function CheckEmailPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-black">
      <Navigation />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-md py-12 px-4">
          <Card className="shadow-xl dark:bg-gray-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-lime-600 text-white">
                <span className="text-2xl font-bold">📧</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                We've sent a magic link to your inbox
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 text-center">
                <p className="text-gray-700 dark:text-gray-300">
                  Please check your email for a magic link to sign in to your Ainterview account.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Didn't receive the email? Check your spam folder or try signing in again.
                </p>
              </div>
              
              <div className="flex flex-col gap-4 pt-4">
                <Button 
                  className="w-full py-6 text-lg" 
                  onClick={() => router.push('/auth')}
                >
                  Back to Sign In
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => router.push('/')}
                >
                  Return to Home
                </Button>
              </div>
              
              <div className="mt-8 rounded-lg bg-green-50 p-4 text-center text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                <p>
                  For security reasons, the magic link will expire in 24 hours.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}