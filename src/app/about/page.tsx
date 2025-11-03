import Navigation from '@/components/navigation';

export default function AboutPage() {
  const features = [
    {
      title: "AI-Powered Personalization",
      description: "Our advanced AI analyzes job postings, company culture, and your background to create uniquely tailored interview simulations.",
      icon: "🤖"
    },
    {
      title: "Realistic Practice Environment",
      description: "Experience interview scenarios that mirror actual hiring processes with dynamic AI interviewers who adapt to your responses.",
      icon: "🎭"
    },
    {
      title: "Instant Expert Feedback",
      description: "Receive detailed, actionable feedback immediately after each practice session to identify strengths and improvement areas.",
      icon: "💬"
    },
    {
      title: "Progressive Difficulty",
      description: "Start with foundational questions and advance to complex scenarios as your skills improve.",
      icon: "📈"
    },
    {
      title: "Gamification & Rewards",
      description: "Earn points, unlock badges, and track your progress with our engaging gamification system.",
      icon: "🏆",
      status: "new"
    },
    {
      title: "Social Features",
      description: "Share achievements, compete with friends, and get motivation from our supportive community.",
      icon: "👥",
      status: "new"
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Enter Job Details",
      description: "Paste the job posting URL or description along with your CV/resume."
    },
    {
      step: 2,
      title: "AI Interviewer Creation",
      description: "Our AI generates a personalized interviewer specifically trained for that role and company."
    },
    {
      step: 3,
      title: "Practice Interview",
      description: "Engage in a realistic interview simulation with questions tailored to the position."
    },
    {
      step: 4,
      title: "Receive Feedback",
      description: "Get instant expert feedback highlighting strengths and improvement opportunities."
    },
    {
      step: 5,
      title: "Track Progress",
      description: "Monitor your improvement over time and focus on areas needing development."
    }
  ];

  const upcomingFeatures = [
    {
      title: "Voice-to-Voice Interviews",
      description: "Practice with real-time voice conversations with AI interviewers for authentic speaking practice.",
      icon: "🎤",
      status: "coming-soon"
    },
    {
      title: "Video Interview Practice",
      description: "Simulate real video interviews with camera and body language analysis.",
      icon: "📹",
      status: "coming-soon"
    },
    {
      title: "Predictive Question Generator",
      description: "AI predicts company-specific questions based on job market trends and user data.",
      icon: "🔮",
      status: "coming-soon"
    },
    {
      title: "VR Interview Simulations",
      description: "Immersive virtual reality interviews in realistic office environments.",
      icon: "🕶️",
      status: "coming-soon"
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-purple-50 font-sans dark:from-gray-900 dark:to-black">
      <Navigation />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-5xl py-8">
          <div className="text-center mb-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-lime-600 text-white">
              <span className="text-3xl font-bold">AI</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              About Ainterview
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Revolutionizing Interview Preparation
            </p>
          </div>
          
          {/* Introduction */}
          <div className="mb-16 text-center">
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Ainterview transforms how job seekers prepare for interviews by providing AI-powered practice sessions 
              that are specifically tailored to each job application. Our platform addresses the significant gap in 
              personalized, on-demand interview preparation that aligns with specific job requirements.
            </p>
          </div>
          
          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-12">
              How Ainterview Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {howItWorks.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Key Features */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-12">
              Powerful Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl mt-1">{feature.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                        {feature.status === 'new' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Upcoming Features */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-6">
              Coming Soon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingFeatures.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-white/80 dark:bg-gray-800/30 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl mt-0.5 opacity-60">{feature.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">{feature.title}</h3>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100/50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                          SOON
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Mission */}
          <div className="bg-gradient-to-r from-green-50 to-lime-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-center max-w-3xl mx-auto">
              To empower job seekers with the tools and confidence they need to succeed in interviews by providing 
              realistic, personalized practice experiences that build competence and reduce anxiety. We believe that 
              everyone deserves a fair chance to showcase their skills, and proper preparation makes all the difference.
            </p>
          </div>
          
          {/* Free Usage */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Try Before You Buy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Your first complete interview is completely free! After that, you'll get 2 additional AI interactions per day 
              to continue practicing. No credit card required to get started.
            </p>
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              First interview completely free • No credit card required
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}