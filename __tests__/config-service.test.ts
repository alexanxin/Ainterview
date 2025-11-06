import { ConfigService } from '@/lib/config-service';

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  GEMINI_API_KEY: 'test-gemini-key',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX: '100',
  FREE_INTERVIEWS: '1',
  FREE_DAILY_INTERACTIONS: '2',
};

describe('ConfigService', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env = { ...process.env, ...mockEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('load', () => {
    it('should load configuration with all required values', () => {
      const config = ConfigService.load();

      expect(config.supabase.url).toBe(mockEnv.NEXT_PUBLIC_SUPABASE_URL);
      expect(config.supabase.anonKey).toBe(mockEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      expect(config.gemini.apiKey).toBe(mockEnv.GEMINI_API_KEY);
      expect(config.rateLimiting.windowMs).toBe(parseInt(mockEnv.RATE_LIMIT_WINDOW_MS));
      expect(config.rateLimiting.maxRequests).toBe(parseInt(mockEnv.RATE_LIMIT_MAX));
      expect(config.features.freeInterviews).toBe(parseInt(mockEnv.FREE_INTERVIEWS));
      expect(config.features.dailyInteractions).toBe(parseInt(mockEnv.FREE_DAILY_INTERACTIONS));
    });

    it('should throw an error when required environment variable is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      expect(() => ConfigService.load()).toThrow('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
    });

    it('should use default model when GEMINI_MODEL is not set', () => {
      const config = ConfigService.load();
      expect(config.gemini.model).toBe('gemini-2.0-flash');
    });

    it('should use provided model when GEMINI_MODEL is set', () => {
      process.env.GEMINI_MODEL = 'gemini-pro';
      const config = ConfigService.load();
      expect(config.gemini.model).toBe('gemini-pro');
    });

    it('should use default values for optional settings', () => {
      delete process.env.FREE_INTERVIEWS;
      delete process.env.FREE_DAILY_INTERACTIONS;
      delete process.env.RATE_LIMIT_WINDOW_MS;
      delete process.env.RATE_LIMIT_MAX;

      const config = ConfigService.load();
      expect(config.features.freeInterviews).toBe(1);
      expect(config.features.dailyInteractions).toBe(2);
      expect(config.rateLimiting.windowMs).toBe(900000);
      expect(config.rateLimiting.maxRequests).toBe(100);
    });
  });
});