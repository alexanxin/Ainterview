# Ainterview - AI-Powered Interview Preparation Platform

[![x402 Protocol](https://img.shields.io/badge/x402-Compatible-green)](https://x402.org)
[![Solana](https://img.shields.io/badge/Blockchain-Solana-purple)](https://solana.com)
[![AI Powered](https://img.shields.io/badge/AI-Gemini-blue)](https://gemini.google.com)

Ainterview is an AI-powered interview preparation platform that connects job applicants with AI interviewers specially trained for each application. The system creates highly realistic interview simulations by analyzing job postings, company information, and applicant backgrounds.

## 🏆 x402 Hackathon Prize Applications

Ainterview is participating in the x402 Hackathon with applications for multiple prize categories:

- **Best x402 Agent Application** ($10,000) - Seamless AI service micropayments
- **Best x402 API Integration** ($10,000) - Full HTTP 402 protocol compliance
- **Best use of CASH** ($10,000 in $CASH) - Phantom CASH token integration

**Total Potential: $30,000**

## 📖 Complete Judge Documentation

For comprehensive information for judges and reviewers, see our dedicated hackathon documentation:

### 🎯 **Executive Summary**

[Executive Summary: x402 Payment Protocol Implementation](docs/showcase-materials/executive-summary.md)

**Key Highlights:**

- Complete x402 Protocol Compliance with HTTP 402 responses
- Two-Phase Verification System for security
- Multi-Token Support (USDC, USDT, Phantom CASH)
- 97% Cost Reduction from traditional payment processing

### 🏗️ **Technical Architecture**

[Complete Technical Documentation](docs/showcase-materials/x402-hackathon-technical-architecture.md)

**Technical Implementation:**

- Two-Phase Payment Verification System
- HTTP 402 Response Format with protocol headers
- Security Architecture with dual verification
- Performance & Scalability optimizations

### 🎮 **Demo Guide & Credentials**

[Complete Demo Guide for Judges](docs/showcase-materials/x402-hackathon-demo-guide.md)

**Live Demo Access:**

- **Production URL:** `https://theainterview.vercel.app`
- **Demo Page:** `https://theainterview.vercel.app/demo`
- **Payment:** `https://theainterview.vercel.app/payment`

**Demo Scenarios:**

- Complete user journey (free trial → payment)
- API integration testing
- Multi-token payment demonstration

### 💼 **Business Case & Market Analysis**

[Complete Business Case](docs/showcase-materials/x402-hackathon-business-case.md)

**Business Impact:**

- $18B+ market opportunity in career development
- 97% payment processing cost reduction
- Clear path to $750K ARR
- Strong unit economics: $300 LTV, $15 CAC

### 🎤 **Presentation Outline**

[Presentation Guide for Judges](docs/showcase-materials/x402-hackathon-presentation-outline.md)

**Presentation Structure (15 minutes):**

1. Opening Hook & Problem Statement
2. Technical Implementation Deep Dive
3. User Experience Walkthrough
4. Business Model & Prize Alignment

### 🔑 **Demo Credentials**

[Demo Credentials & Access Information](docs/showcase-materials/demo-credentials.md)

**Test Environment:**

- Pre-configured test wallets
- Token faucet links for devnet
- Troubleshooting guide
- Performance benchmarks

## 🚀 Quick Start for Judges

### 1. **Immediate Demo Access**

```bash
# Navigate to live demo
https://theainterview.vercel.app/demo

# Or test API directly
curl -X POST https://theainterview.vercel.app/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"action":"generateQuestion","userId":"demo"}'
```

### 2. **x402 Protocol Validation**

- Open browser network tab
- Use platform until credits exhausted
- Observe HTTP 402 response with x402 headers
- Complete payment flow with test tokens

### 3. **Technical Assessment**

- Review HTTP 402 compliance in [technical architecture](docs/showcase-materials/x402-hackathon-technical-architecture.md)
- Examine API responses and error handling
- Validate multi-token support (USDC/PYUSD/CASH?)
- Check performance metrics and benchmarks

## 🎯 Project Overview

**Problem Solved**: Job applicants have only one chance to make a first impression in interviews, yet most have limited practice with role-specific questions relevant to their target companies. Traditional interview preparation methods lack personalization and don't reflect actual interview styles.

**Solution**: Ainterview provides infinitely available, completely personalized interview practice sessions that adapt to each specific job application using AI trained on actual job requirements and company culture.

## 🚀 Key Features

### MVP Features

- **AI Interviewer Creation**: Generate AI interviewers based on job posting text input
- **Text-Based Interview Simulation**: Engage in realistic text conversations with AI interviewers
- **User Profile Creation**: Input CV/resume and cover letter information for personalization
- **Job Posting Integration**: Input job postings via URL or text to customize the AI interviewer
- **x402 Protocol Payment Integration**: Instant stablecoin payments on Solana blockchain
- **Feedback System**: Receive feedback on responses based on job requirements
- **User Dashboard**: View past interview sessions and manage profiles
- **Authentication System**: Secure user sign-up and login

### Advanced Features (Post-MVP)

- Voice and video interview capabilities - soon
- Advanced analytics dashboard
- Industry-specific AI models
- Mobile applications
- Corporate solutions
- AI agent marketplace

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 16.0.1 with React 19.2.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

### Backend & Infrastructure

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel
- **AI/ML**: Google Gemini API
- **Blockchain**: Solana
- **Payment Protocol**: x402

### Key Dependencies

- `@solana/web3.js` - Solana blockchain integration
- `@supabase/supabase-js` - Database and authentication
- `@google/generative-ai` - AI interviewer functionality
- `cheerio` - Web scraping for job postings
- `pdfjs-dist` - PDF parsing for resumes

## 📁 Project Structure

```
.
├── app/                          # Next.js application
│   ├── src/
│   │   ├── app/                  # App router pages
│   │   ├── components/           # React components
│   │   └── lib/                  # Utility libraries
│   ├── package.json
│   └── .env.local               # Environment variables
├── docs/                        # Documentation
│   └── showcase-materials/      # x402 hackathon materials
├── test-*.js                    # Test scripts
├── package.json                 # Root package.json
└── database-schema.sql          # Database schema
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Gemini API key
- Solana wallet (for x402 payments)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ainterview
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install app dependencies
   cd app
   npm install
   cd ..
   ```

3. **Set up environment variables**

   Create `.env.local` in the `app/` directory:

   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key

   # Solana/x402 Configuration
   NEXT_PUBLIC_SOLANA_RPC_URL=your_solana_rpc_url
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   ```

4. **Set up database**

   Run the database schema in your Supabase SQL editor:

   ```bash
   # From the project root
   cat database-schema.sql
   ```

   Copy and execute the SQL in Supabase dashboard.

5. **Run the development server**

   ```bash
   cd app
   npm run dev
   ```

   Open [https://theainterview.vercel.app](https://theainterview.vercel.app) in your browser.

## 🔐 Authentication & Security

### Row Level Security (RLS)

The application uses Supabase RLS policies to ensure data security. Tests may require:

- Authenticated user sessions
- Service role key for testing (bypasses RLS)

### Environment Variables

**Required:**

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `GEMINI_API_KEY` - Google Gemini API key

**Optional (for testing):**

- `SUPABASE_SERVICE_ROLE_KEY` - Bypasses RLS during testing

## 💳 Payment Integration (x402)

The platform integrates with the x402 protocol for seamless micropayments:

- **Protocol**: x402 (HTTP 402 Payment Required)
- **Blockchain**: Solana
- **Token**: Stablecoins (USDC, PYUSD, CASH?)
- **Use Cases**: AI service micropayments

### x402 Features

- Complete HTTP 402 protocol compliance
- Multi-token support (USDC, PYUSD, Phantom CASH?)
- Two-phase verification system
- Real-time transaction processing
- Sub-3 second confirmations

## 🤖 AI Interviewer

The AI interviewer is powered by Google Gemini and:

1. Analyzes job postings and company information
2. Generates role-specific interview questions
3. Provides personalized feedback on responses
4. Adapts to user background and experience level

### AI Integration Points

- Job posting analysis
- Question generation
- Response evaluation
- Feedback generation

## 📊 Database Schema

Key tables:

- `profiles` - User profiles and information
- `interview_sessions` - Interview session records
- `interview_questions` - Generated interview questions
- `interview_answers` - User answers and AI feedback
- `user_credits` - Credit management and payment tracking
- `payment_records` - x402 transaction records

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Setup

Configure these in Vercel:

- All variables from `.env.local`
- Build command: `cd app && npm run build`
- Output directory: `app/.next`

## 📈 Monitoring & Analytics

- **Performance**: Vercel analytics
- **Database**: Supabase monitoring
- **Errors**: Vercel error tracking
- **Usage**: Custom usage tracking system
- **Payments**: Transaction monitoring and verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📚 Documentation

### Hackathon Judge Materials

- [Project Brief](docs/brief.md) - Comprehensive project overview
- [x402 Implementation](docs/X402_IMPLEMENTATION.md) - Payment system details
- [Database Test Documentation](docs/TEST_DATABASE.md) - Testing guide
- [API Documentation](docs/api-lifecycle.md) - API design patterns

### Technical Documentation

- [Business Case](docs/showcase-materials/x402-hackathon-business-case.md)
- [Technical Architecture](docs/showcase-materials/x402-hackathon-technical-architecture.md)
- [Demo Guide](docs/showcase-materials/x402-hackathon-demo-guide.md)
- [Presentation Outline](docs/showcase-materials/x402-hackathon-presentation-outline.md)

## 🎯 Success Metrics

### Business Metrics

- 10,000 registered users in 12 months
- $500K ARR by month 18
- 70% monthly retention rate
- 25% free-to-paid conversion rate

### User Success Metrics

- 25% improvement in interview-to-offer ratio
- 40% increase in user confidence scores
- 15% reduction in time-to-placement

### Technical Metrics (x402)

- 100% HTTP 402 protocol compliance
- <3 second transaction times
- 99.9% payment success rate
- Multi-token support validation

## 🔮 Roadmap

### Phase 1 (MVP - 3 months)

- ✅ Core AI interviewer
- ✅ Text-based interviews
- ✅ Basic feedback system
- ✅ x402 payment integration
- ✅ User authentication

### Phase 2 (6-9 months)

- Voice/video interviews
- Advanced analytics
- Mobile apps
- Industry-specific models

### Phase 3 (12+ months)

- AI agent marketplace
- Global expansion
- Corporate solutions
- Predictive analytics

## 🆘 Support

For support, contact me on aleksandar@lll.mk

## 🙏 Acknowledgments

- Google Gemini team for AI capabilities
- Supabase for database infrastructure
- Solana ecosystem for x402 protocol
- Vercel for hosting platform
- x402 protocol team for guidance

---

**Built with ❤️ for job seekers everywhere**

**Ainterview: Demonstrating the future of AI service micropayments through x402 protocol integration**
