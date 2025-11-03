'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { sendOtp } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await sendOtp(email);
      
      if (error) {
        setError(error.message || 'Failed to send magic link');
      } else {
        // Redirect to a page that informs the user to check their email
        router.push('/auth/check-email');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
      <Navigation />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-md py-12 px-4">
          <Card className="shadow-xl dark:bg-gray-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-lime-600 text-white">
                <span className="text-2xl font-bold">AI</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Sign In to Ainterview
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Enter your email to receive a magic link
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="dark:bg-gray-700 dark:text-white"
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending Magic Link...' : 'Send Magic Link'}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                <p>
                  By signing in, you agree to our{' '}
                  <a href="/terms" className="text-green-600 hover:underline dark:text-green-400">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-green-600 hover:underline dark:text-green-400">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}