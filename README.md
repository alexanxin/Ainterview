# Ainterview

AI-powered interview preparation platform that helps job seekers practice for interviews with personalized AI-generated questions and feedback.

## About

Ainterview is an innovative platform that connects job applicants with AI interviewers specially trained for each application. The system leverages job posting requirements, company information, and applicant background to generate realistic interview experiences that mirror what applicants can expect in their actual interviews.

The platform addresses the significant gap in personalized, on-demand interview preparation that aligns with specific job requirements. Traditional methods are generic, time-consuming, and fail to provide role-specific practice, leading to poor interview performance and higher rejection rates.

## Key Features

- **Hyper-Personalization**: AI interviewers specifically tailored to each job application and company culture
- **Realistic Simulation**: Dynamic AI interviewers that understand job requirements and company culture
- **Seamless Integration**: Incorporates information from user CV and cover letter into the interview simulation
- **On-Demand Availability**: Practice anytime with completely personalized interview sessions
- **Intelligent Feedback**: Detailed feedback highlighting strengths and improvement areas

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **AI Engine**: Google Gemini for intelligent question generation and feedback
- **Authentication**: Supabase for user management and data storage
- **Payments**: x402 protocol for autonomous blockchain-based transactions
- **Deployment**: Vercel for hosting and global CDN distribution

## Development Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file with your API keys (see `.env.example` for required variables)

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [https://theainterview.vercel.app](https://theainterview.vercel.app) in your browser.

## Contributing

We welcome contributions to Ainterview! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
