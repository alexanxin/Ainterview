// config/app-config.ts
export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  gemini: {
    apiKey: string;
    model: string;
  };
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
  };
  features: {
    freeInterviews: number;
    dailyInteractions: number;
  };
}

export class ConfigService {
  private static config: AppConfig | null = null;

  static load(): AppConfig {
    if (this.config) return this.config;

    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'GEMINI_API_KEY',
    ];

    for (const env of required) {
      if (!process.env[env]) {
        throw new Error(`Missing required environment variable: ${env}`);
      }
    }

    this.config = {
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      gemini: {
        apiKey: process.env.GEMINI_API_KEY!,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      },
      rateLimiting: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      },
      features: {
        freeInterviews: parseInt(process.env.FREE_INTERVIEWS || '1'),
        dailyInteractions: parseInt(process.env.FREE_DAILY_INTERACTIONS || '2'),
      },
    };

    return this.config;
  }
}