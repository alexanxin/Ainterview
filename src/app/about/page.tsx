import Navigation from '@/components/navigation';

export default function AboutPage() {
  const features = [
    {
      title: "AI-Powered Personalization",
      description: "Our advanced AI analyzes job postings, company culture, and your background to create tailored interview simulations.",
      icon: "🤖"
    },
    {
      title: "Realistic Practice Environment",
      description: "Experience interview scenarios that mirror actual hiring processes with dynamic AI interviewers.",
      icon: "🎭"
    },
    {
      title: "Instant Expert Feedback",
      description: "Receive actionable feedback after each session to identify strengths and improvement areas.",
      icon: "💬"
    },
    {
      title: "Progressive Difficulty",
      description: "Start with foundational questions and advance to complex scenarios as your skills improve.",
      icon: "📈"
    },
    {
      title: "Gamification & Rewards",
      description: "Earn points, unlock badges, and track your progress with our engaging system.",
      icon: "🏆",
      status: "new"
    },
    {
      title: "Social Features",
      description: "Share achievements, compete with friends, and get motivation from our community.",
      icon: "👥",
      status: "new"
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Enter Job Details & Your CV/Resume",
      description: "Paste the job posting URL or description along with your CV/resume to get started."
    },
    {
      step: 2,
      title: "Answer Tailored Questions",
      description: "Respond to 5-10 AI-generated questions tailored specifically to the job and your background."
    },
    {
      step: 3,
      title: "Get Instant Feedback & Track Progress",
      description: "Receive expert feedback and monitor your improvement over time."
    }
  ];

  const upcomingFeatures = [
    {
      title: "Voice-to-Voice Interviews",
      description: "Practice with real-time voice conversations with AI interviewers.",
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
      description: "AI predicts company-specific questions based on trends and user data.",
      icon: "🔮",
      status: "coming-soon"
    },
    {
      title: "VR Interview Simulations",
      description: "Immersive virtual reality interviews in realistic environments.",
      icon: "🕶️",
      status: "coming-soon"
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 to-purple-50 font-sans dark:from-gray-900 dark:to-black">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 right-[-100px] w-3/4 h-full bg-gradient-to-l from-green-500/30 via-lime-400/25 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s]"></div>
        <div className="absolute -top-1/3 right-[-60px] w-1/2 h-3/4 bg-gradient-to-l from-lime-500/20 via-green-400/20 to-transparent rounded-full blur-3xl animate-pulse [animation-duration:6s] delay-1000"></div>
      </div>

      <Navigation />
      <main className="flex-1 p-4 relative z-10">
        <div className="container mx-auto max-w-5xl py-8">
          <div className="text-center mb-16">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-lime-600 text-white mx-auto">
              <span className="text-3xl font-bold">AI</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About <span className="text-green-600">Ainterview</span>
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
              Revolutionizing Interview Preparation with AI-Powered Personalization
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-12 md:mb-16 text-center">
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Ainterview transforms how job seekers prepare for interviews by providing AI-powered practice sessions
              that are specifically tailored to each job application. Our platform addresses the significant gap in
              personalized, on-demand interview preparation that aligns with specific job requirements.
            </p>
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              AI-Powered • Personalized • On-Demand
            </div>
          </div>

          {/* Free Usage and CTA */}
          {/* <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-xl mb-12 text-center border border-green-200 dark:border-gray-700">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Try Before You Buy
            </h2>
            <p className="text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 max-w-2xl mx-auto text-sm sm:text-base">
              Your first complete interview is completely free! After that, you'll get 2 additional AI interactions per day
              to continue practicing. No credit card required to get started.
            </p>
            <div className="block bg-green-200 dark:bg-green-900/50 text-green-900 dark:text-green-200 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 max-w-max mx-auto">
              <span className="flex items-center justify-center gap-2">
                <span className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></span>
                First interview completely free • No credit card required
              </span>
            </div>
            <a 
              href="/interview" 
              className="inline-block bg-gradient-to-r from-green-600 to-lime-600 text-white hover:opacity-90 font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              Start Practicing Now
            </a>
          </div> */}

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 md:mb-12">
              How Ainterview <span className="text-green-600">Works</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {howItWorks.map((step) => (
                <div key={step.step} className="text-center bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-lime-600 text-white font-bold text-lg">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <a
                href="/interview"
                className="inline-block bg-gradient-to-r from-green-600 to-lime-500 text-white hover:opacity-90 font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 text-base"
              >
                Start Your Free Interview
              </a>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 md:mb-12">
              Powerful <span className="text-green-600">Features</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl mt-1 flex-shrink-0">{feature.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
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
            {/* <div className="text-center mt-8">
              <a
                href="/interview"
                className="inline-block bg-gradient-to-r from-green-600 to-lime-500 text-white hover:opacity-90 font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 text-base"
              >
                Try It Free Now
              </a>
            </div> */}
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 md:mb-12">
              What Our <span className="text-green-600">Users Say</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex text-lg">★★★★★</div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  "Ainterview helped me land my dream job! The AI interviewer felt so realistic that I was completely prepared for my actual interviews."
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">- Sarah M., Software Engineer</p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex text-lg">★★★★★</div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  "The personalized feedback helped me identify my weak points and improve my answers significantly. Worth every penny!"
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">- James T., Product Manager</p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex text-lg">★★★★★</div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  "I was nervous about interviews before, but now I feel confident and prepared. The AI really adapts to your responses."
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">- Maria L., Marketing Director</p>
              </div>
            </div>
          </div>

          {/* Upcoming Features */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-8 md:mb-12">
              Coming <span className="text-green-600">Soon</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/80 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl mt-1 opacity-80 flex-shrink-0">{feature.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{feature.title}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100/50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                          SOON
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission */}
          <div className="bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-xl mb-12 border border-green-200 dark:border-green-900/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
              Our <span className="text-green-600">Mission</span>
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-center max-w-3xl mx-auto">
              To empower job seekers with the tools and confidence they need to succeed in interviews by providing
              realistic, personalized practice experiences that build competence and reduce anxiety. We believe that
              everyone deserves a fair chance to showcase their skills, and proper preparation makes all the difference.
            </p>
          </div>

          {/* Future Improvements */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 md:mb-12">
              Future <span className="text-green-600">Enhancements</span>
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-center max-w-3xl mx-auto mb-8">
              We're constantly working to improve your interview preparation experience.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Adaptive Interview Mode</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Advanced real-time interviews where AI dynamically adjusts questions based on your responses for even more personalized practice.
                </p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Premium Features</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enhanced features including voice interviews, video practice, and more detailed analytics at a premium tier.
                </p>
              </div>
            </div>
          </div>

          {/* Free Usage */}
          <div className="bg-gradient-to-br from-green-50 to-lime-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-xl mb-12 border border-green-200 dark:border-green-900/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Start Your <span className="text-green-600">Journey</span> Today
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Your first complete interview is completely free! After that, you'll get 2 additional AI interactions per day
              to continue practicing. No credit card required to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/interview"
                className="inline-block bg-gradient-to-r from-green-600 to-lime-500 text-white hover:opacity-90 font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 text-base"
              >
                Start Free Interview
              </a>
              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                No credit card required
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}