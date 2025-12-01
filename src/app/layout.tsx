import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CreditProvider } from "@/lib/credit-context";
import { Toaster } from "sonner";
import SolanaWalletProvider from "@/components/solana-wallet-provider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Global SEO metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://www.ainterview.app'),
  title: {
    default: "Free AI Mock Interview Practice (FAANG Style) | Ainterview",
    template: "%s | Ainterview"
  },
  description: "Master your interviews with AI-powered practice sessions. Get personalized questions based on job postings and company information. Start with 5 free credits!",
  keywords: "AI interview preparation, job interview practice, interview simulation, career preparation, AI interviewer, interview training, job search tools, interview feedback",
  authors: [{ name: "Ainterview Team" }],
  creator: "Ainterview Team",
  publisher: "Ainterview",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.ainterview.app',
    siteName: 'Ainterview',
    title: "Free AI Mock Interview Practice (FAANG Style) | Ainterview",
    description: "Master your interviews with AI-powered practice sessions. Get personalized questions based on job postings and company information. Start with 5 free credits!",
    images: [{
      url: 'https://www.ainterview.app/logo.png',
      width: 1200,
      height: 630,
      alt: 'Ainterview - AI Interview Preparation Platform',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Free AI Mock Interview Practice (FAANG Style) | Ainterview",
    description: "Master your interviews with AI-powered practice sessions. Get personalized questions based on job postings and company information. Start with 5 free credits!",
    images: ['https://www.ainterview.app/logo.png'],
    creator: '@Ainterview',
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
  alternates: {
    canonical: '/',
  },
  manifest: "/manifest.json",
  other: {
    'geo.region': 'US',
    'geo.placename': 'United States',
    'language': 'English',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#10b981" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ainterview" />
        <link rel="icon" href="/logo.png" />
        <link rel="canonical" href="https://www.ainterview.app" />

        {/* Additional SEO meta tags */}
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="audience" content="all" />
        <meta name="coverage" content="worldwide" />
        <meta name="target" content="all" />
        <meta name="category" content="education, career, interview preparation" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-gray-900 dark:text-gray-100`}
      >
        <SolanaWalletProvider>
          <AuthProvider>
            <CreditProvider>
              {children}
            </CreditProvider>
          </AuthProvider>
        </SolanaWalletProvider>
        <Toaster
          richColors
          position="top-right"
          theme="dark"
          closeButton={false}
          expand={false}
          visibleToasts={3}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1F2937',
              color: '#F9FAFB',
              border: '1px solid #374151',
            },
          }}
        />



        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
