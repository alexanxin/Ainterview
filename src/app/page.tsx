'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navigation from '@/components/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if the app is running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      console.log('Ainterview is running in PWA mode');
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-purple-50 font-sans dark:from-gray-900 dark:to-black">
      <Navigation />
      <main className="flex w-full flex-1 items-center justify-center p-4">
        <div className="w-full max-w-3xl py-12 px-4">
          <Card className="w-full max-w-2xl shadow-xl dark:bg-gray-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-lime-600 text-white">
                <span className="text-2xl font-bold">AI</span>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                Ainterview
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                AI-powered interview preparation platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 text-center">
                <p className="text-gray-700 dark:text-gray-300">
                  Practice for your next interview with AI-powered simulations tailored to specific job postings and companies.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Get personalized feedback and improve your confidence before the real interview.
                </p>
              </div>
              
              <div className="flex flex-col gap-4 pt-4">
                <Button 
                  className="w-full py-6 text-lg" 
                  onClick={() => router.push('/interview')}
                >
                  Start Interview Practice
                </Button>
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => router.push('/dashboard')}
                  >
                    My Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => router.push('/about')}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 rounded-lg bg-green-50 p-4 text-center text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                <p>Add this app to your home screen for the best experience</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
