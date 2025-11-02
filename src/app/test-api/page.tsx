'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';

export default function TestApiPage() {
  const [action, setAction] = useState<'generateQuestion' | 'generateFlow' | 'analyzeAnswer'>('generateQuestion');
  const [jobPosting, setJobPosting] = useState('Frontend Developer at TechCorp\nWe are looking for an experienced frontend developer with React, TypeScript, and Next.js skills. The role involves building scalable web applications and working with design teams to implement UI/UX designs. Requirements include 3+ years of experience, strong JavaScript knowledge, and experience with modern build tools.');
  const [companyInfo, setCompanyInfo] = useState('TechCorp is a leading technology company focused on innovative web solutions. We value teamwork, continuous learning, and delivering high-quality products to our customers.');
  const [userCv, setUserCv] = useState('John Doe - Frontend Developer\n5+ years of experience with React, TypeScript, and Next.js\nExperience building scalable web applications\nStrong problem-solving skills and attention to detail\nBachelor\'s degree in Computer Science');
  const [question, setQuestion] = useState('Tell me about yourself and why you\'re interested in this position.');
  const [answer, setAnswer] = useState('I\'m a frontend developer with 5 years of experience building web applications. I\'m particularly interested in this role because of TechCorp\'s focus on innovative solutions and the opportunity to work with modern technologies.');
  const [numQuestions, setNumQuestions] = useState(3);
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const testApi = async () => {
    setLoading(true);
    setResponse(null);
    
    try {
      const context = {
        jobPosting,
        companyInfo,
        userCv
      };

      const requestBody = {
        action,
        context,
        userId: 'test-user'
      };

      if (action === 'analyzeAnswer') {
        (requestBody as any).question = question;
        (requestBody as any).answer = answer;
      } else if (action === 'generateFlow') {
        (requestBody as any).numQuestions = numQuestions;
      }

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `API request failed with status ${res.status}`);
      }

      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('API test error:', error);
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Predefined test data for quick selection
  const predefinedData = {
    jobPosting: "Senior Software Engineer at Google\nResponsibilities include developing scalable systems, mentoring junior developers, and improving code quality. Requirements: 5+ years of experience, strong CS fundamentals, and experience with distributed systems.",
    companyInfo: "Google is a leading technology company focused on making information accessible worldwide. We value innovation, collaboration, and building products that improve people's lives.",
    userCv: "Jane Smith - Software Engineer\n6 years of experience in backend development\nProficient in Python, Java, and distributed systems\nExperience with cloud technologies and microservices architecture\nMaster's degree in Computer Science from Stanford"
  };

  const loadPredefinedData = () => {
    setJobPosting(predefinedData.jobPosting);
    setCompanyInfo(predefinedData.companyInfo);
    setUserCv(predefinedData.userCv);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-900/20 dark:to-gray-950">
      <Navigation />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-6xl py-8">
          <Card className="shadow-xl dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                API Test Page
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Test the x402 Gemini API directly without going through the full interview flow
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant={action === 'generateQuestion' ? 'default' : 'outline'} 
                  onClick={() => setAction('generateQuestion')}
                  className="bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                >
                  Generate Question
                </Button>
                <Button 
                  variant={action === 'generateFlow' ? 'default' : 'outline'} 
                  onClick={() => setAction('generateFlow')}
                  className="bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                >
                  Generate Flow
                </Button>
                <Button 
                  variant={action === 'analyzeAnswer' ? 'default' : 'outline'} 
                  onClick={() => setAction('analyzeAnswer')}
                  className="bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                >
                  Analyze Answer
                </Button>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={loadPredefinedData}
                  variant="outline"
                  className="bg-gradient-to-r from-green-100 to-lime-100 text-gray-900"
                >
                  Load Test Data
                </Button>
                <Button 
                  onClick={testApi}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-lime-500 text-gray-900 hover:opacity-90"
                >
                  {loading ? 'Testing...' : 'Test API'}
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                      Job Posting
                    </label>
                    <Textarea
                      value={jobPosting}
                      onChange={(e) => setJobPosting(e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                      Company Info
                    </label>
                    <Textarea
                      value={companyInfo}
                      onChange={(e) => setCompanyInfo(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                      User CV
                    </label>
                    <Textarea
                      value={userCv}
                      onChange={(e) => setUserCv(e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>

                  {action === 'analyzeAnswer' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                          Question
                        </label>
                        <Textarea
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                          Answer
                        </label>
                        <Textarea
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>
                    </>
                  )}

                  {action === 'generateFlow' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        Number of Questions
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    API Response
                  </label>
                  <div className="h-[500px] border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md p-4 overflow-auto">
                    {response ? (
                      <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {response}
                      </pre>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
                        {loading ? 'Testing API...' : 'Click "Test API" to see response here'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}