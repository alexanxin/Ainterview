# Ainterview App

AI-powered interview preparation platform that helps job seekers practice for interviews with personalized AI-generated questions and feedback.

## Features

- AI-powered interview questions based on job postings and user CVs
- Personalized feedback on interview answers
- Practice sessions with progress tracking
- Integration with x402 payment protocol for premium features
- Responsive web application with PWA support

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file with your API keys:
   ```
   GEMINI_API_KEY=your_google_gemini_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Make sure to set the following environment variables in your `.env.local` file:

- `GEMINI_API_KEY` - Google Gemini API key for AI features
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.