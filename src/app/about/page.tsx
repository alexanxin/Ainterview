import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/navigation';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
      <Navigation />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-3xl py-8">
          <Card className="shadow-xl dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                About Ainterview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-lime-600 text-white">
                  <span className="text-3xl font-bold">AI</span>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  AI-powered interview preparation platform
                </p>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  How It Works
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Ainterview uses advanced AI to create personalized interview experiences. 
                  By analyzing job postings, company information, and your CV, our AI interviewer 
                  asks relevant questions that mirror what you might face in a real interview.
                </p>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Key Features
                </h2>
                <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Personalized interview questions based on job postings and company info</li>
                  <li>AI-powered feedback on your responses</li>
                  <li>Practice on-demand with 24/7 availability</li>
                  <li>Progress tracking and improvement insights</li>
                  <li>Compatible with PWA for offline practice</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Our Mission
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  To help job seekers succeed in their interviews by providing realistic, 
                  personalized practice experiences that build confidence and improve performance. 
                  We believe that everyone deserves a fair chance to showcase their skills, 
                  and proper preparation makes all the difference.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}