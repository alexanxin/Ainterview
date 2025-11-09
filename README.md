# Ainterview - AI-Powered Interview Preparation Platform

[![x402 Protocol](https://img.shields.io/badge/x402-Compatible-green)](https://x402.org)
[![Solana](https://img.shields.io/badge/Blockchain-Solana-purple)](https://solana.com)
[![AI Powered](https://img.shields.io/badge/AI-Gemini-blue)](https://gemini.google.com)

## Project Overview

Ainterview is an innovative AI-powered interview preparation platform that connects job applicants with AI interviewers specially trained for each application. These AI interviewers have deep insights from job postings, company information scraped from websites, and applicant CVs and cover letters to create highly realistic interview simulations.

Project overview videos:

[![The Ten Cent Problem](https://img.youtube.com/vi/IWqbMx01vVs/0.jpg)](https://www.youtube.com/watch?v=IWqbMx01vVs)
[![Ainterview & Micropayments](https://img.youtube.com/vi/lCBCCdj9HA/0.jpg)](https://www.youtube.com/watch?v=mlCBCCdj9HA)
[![Ainterview Pay Per Question](https://img.youtube.com/vi/HZQrrLLOciM/0.jpg)](https://www.youtube.com/watch?v=HZQrrLLOciM)

### Key Features

- **Hyper-Personalization**: Creates interview simulations specifically tailored to each job application and company
- **Dynamic AI Interviewers**: AI agents specifically trained on job posting requirements and company culture
- **Seamless Integration**: Incorporates information from user's CV and cover letter into the interview simulation
- **On-Demand Availability**: Access completely personalized interview practice sessions anytime
- **Intelligent Feedback System**: Provides detailed feedback on both content and delivery
- **x402 Protocol Payment Integration**: Implements x402 protocol for all platform transactions, enabling instant and reliable stablecoin payments

## Technology Stack

- **Frontend**: React.js with TypeScript as a Next.js application
- **Backend**: Next.js API routes deployed on Vercel
- **Database**: Supabase for PostgreSQL database with real-time subscriptions and authentication
- **AI/ML**: Google's Gemini for core AI interviewer functionality
- **Blockchain**: Solana integration for x402 protocol transactions
- **Payment**: x402 protocol implementation for stablecoin payments
- **Hosting**: Vercel for global CDN distribution
- **UI Components**: Radix UI primitives and Tailwind CSS

## Core Architecture

The application is structured as a Progressive Web Application (PWA) with the following key components:

- **AI Interviewer Creation**: Generates AI interviewers based on job posting text input
- **Text-Based Interview Simulation**: Platform for users to engage in text-based conversations with AI interviewers
- **User Profile System**: Basic user profiles where job seekers can input their CV/resume and cover letter information
- **Job Posting Integration**: Mechanism for users to input job posting information to customize the AI interviewer
- **Payment Processing**: x402 protocol integration for all platform transactions
- **Feedback System**: Feedback on user responses based on alignment with job requirements

## x402 Protocol Integration

Ainterview features innovative integration with the x402 protocol, representing a significant advancement in autonomous digital transactions. This protocol enables AI-driven commerce where automated systems can execute transactions without human intervention, positioning Ainterview at the forefront of autonomous payment systems.

- Solana blockchain integration for high-speed, low-cost transactions
- Support for Solana-based stablecoins for x402 transactions
- Integration with Phantom and other Solana-compatible wallets
- Real-time monitoring of Solana-based x402 transactions
- Smart contract integration for automated subscription management

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Access to Google Gemini API
- Supabase account for database services
- Solana wallet for x402 transactions

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd ainterview
   ```

2. Install dependencies:

   ```bash
   cd app
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   # Add your API keys and configuration
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
ainterview/
├── app/                    # Next.js application
│   ├── src/
│   │   ├── app/           # Application routes and pages
│   │   ├── lib/           # Utility functions and libraries
│   │   └── components/    # React components
├── docs/                  # Documentation files
├── public/                # Static assets
├── package.json          # Main package configuration
└── app/package.json      # Next.js application package configuration
```

## Target Users

### Primary: Mid to Senior-Level Tech Professionals (2-8 years experience)

- Age: 25-35 years old
- Education: Bachelor's or higher degree in technical field
- Income level: $60,000-$150,000 annually

### Secondary: New Graduates and Early Career Professionals (0-2 years experience)

- Age: 22-28 years old
- Current situation: Recent graduates, junior roles, or career changers

### Tertiary: Career Changers

- Age: 28-45 years old
- Experience: 3-15 years in a different industry or role

## Goals & Success Metrics

### Business Objectives:

- Achieve 10,000 registered users within the first 12 months
- Generate $500,000 in annual recurring revenue by month 18
- Establish Ainterview as the leading AI-powered interview preparation tool for mid to senior-level tech professionals by year 2

### User Success Metrics:

- Improve user interview-to-offer ratio by 25% compared to industry average
- Achieve a 40% increase in user confidence scores after completing 3 interview simulations
- Reduce average time from job application to offer by 15% for active Ainterview users

## Post-MVP Vision

### Phase 2 Features:

- Voice and video interview capabilities
- Advanced analytics dashboard
- Industry-specific AI models
- Integration with job platforms
- Mobile application
- Corporate solutions

### Long-term Vision:

- Comprehensive career development platform
- AI agent marketplace
- Global multi-language support
- Skills assessment integration
- Enterprise partnership network

## Technical Considerations

- **Performance Requirements**: Text-based responses under 3 seconds; 9.5% uptime SLA
- **Browser Support**: Chrome, Firefox, Safari, and Edge (latest two versions)
- **Security**: End-to-end encryption for user data, GDPR compliance, secure storage of payment information
- **Scalability**: Designed for growth with Vercel's serverless functions and Supabase database services

## Challenges Addressed

Ainterview addresses several key challenges in the job interview preparation space:

1. **Generic Preparation Methods**: Provides role-specific practice instead of generic questions
2. **Limited Access to Role-Specific Practice**: Offers on-demand access without scheduling constraints
3. **Information Gap**: Connects job requirements, company culture, and applicant background
4. **Lack of Detailed Feedback**: Provides personalized feedback based on job requirements
5. **Psychological Barriers**: Reduces interview anxiety through repetitive practice with realistic scenarios

## Innovation Highlights

- **x402 Protocol Implementation**: Early adoption of the innovative x402 payment protocol for autonomous transactions
- **AI-Powered Personalization**: Advanced AI that understands job requirements and company culture
- **Seamless Integration**: Combines job posting requirements, company information, and applicant background
- **Blockchain Payment Integration**: Utilizes Solana blockchain for fast, low-cost transactions

## Development Status

The project is currently in the MVP phase with plans for continuous development and enhancement. The core functionality includes text-based interview simulations with AI interviewers, user profiles, and x402 payment integration.

## Future Development

The roadmap includes:

- Voice and video interview capabilities
- Mobile application development
- Advanced analytics and reporting
- Multi-language support
- Corporate partnership programs
- AI agent marketplace

## Contributing

We welcome contributions to the Ainterview project. Please review our contribution guidelines in the documentation.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For more information about Ainterview, please contact the development team.
