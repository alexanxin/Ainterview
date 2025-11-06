import { 
  validateUserProfile,
  validateInterviewContext,
  sanitizeInput,
  UserProfileSchema,
  InterviewContextSchema
} from '@/lib/validations';

describe('Validations', () => {
  describe('UserProfile Validation', () => {
    it('should validate a correct user profile', () => {
      const validProfile = {
        full_name: 'John Doe',
        email: 'john@example.com',
        bio: 'Software engineer with 5 years of experience',
        experience: 'Senior developer at ABC Corp',
        education: 'BSc Computer Science from XYZ University',
        skills: 'React, TypeScript, Node.js',
      };

      const result = validateUserProfile(validProfile);
      expect(result).toEqual(validProfile);
    });

    it('should throw an error for invalid email', () => {
      const invalidProfile = {
        full_name: 'John Doe',
        email: 'invalid-email',
      };

      expect(() => validateUserProfile(invalidProfile)).toThrow();
    });

    it('should throw an error for name that is too short', () => {
      const invalidProfile = {
        full_name: 'J',
        email: 'john@example.com',
      };

      expect(() => validateUserProfile(invalidProfile)).toThrow();
    });

    it('should throw an error for name that is too long', () => {
      const invalidProfile = {
        full_name: 'A'.repeat(101),
        email: 'john@example.com',
      };

      expect(() => validateUserProfile(invalidProfile)).toThrow();
    });

    it('should validate optional fields correctly', () => {
      const validProfile = {
        full_name: 'John Doe',
        email: 'john@example.com',
      }; // No optional fields

      const result = validateUserProfile(validProfile);
      expect(result).toEqual(validProfile);
    });
  });

  describe('Interview Context Validation', () => {
    it('should validate a correct interview context', () => {
      const validContext = {
        jobPosting: 'Full Stack Developer position with React and Node experience',
        companyInfo: 'Tech company focused on productivity tools',
        userCv: '5 years of React experience with multiple successful projects',
      };

      const result = validateInterviewContext(validContext);
      expect(result).toEqual(validContext);
    });

    it('should throw an error for job posting that is too short', () => {
      const invalidContext = {
        jobPosting: 'Short',
        companyInfo: 'Tech company',
        userCv: 'Experience',
      };

      expect(() => validateInterviewContext(invalidContext)).toThrow();
    });

    it('should throw an error for job posting that is too long', () => {
      const invalidContext = {
        jobPosting: 'A'.repeat(10001),
        companyInfo: 'Tech company',
        userCv: 'Experience',
      };

      expect(() => validateInterviewContext(invalidContext)).toThrow();
    });

    it('should throw an error for missing required field', () => {
      const invalidContext = {
        jobPosting: 'Full Stack Developer position',
        companyInfo: 'Tech company',
        // userCv is missing
      };

      expect(() => validateInterviewContext(invalidContext)).toThrow();
    });
  });

  describe('Input Sanitization', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World');
    });

    it('should remove javascript protocol', () => {
      const input = 'Click <a href="javascript:alert(\'xss\')">here</a>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Click <a href="">here</a>');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World');
    });

    it('should handle normal input without modification', () => {
      const input = 'Hello World!';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World!');
    });

    it('should remove multiple script tags', () => {
      const input = '<script>bad code</script>Safe<input><script>more bad code</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Safe');
    });

    it('should handle nested script tags', () => {
      const input = '<script>outer<script>nested</script>code</script>safe';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('safe');
    });
  });

  describe('Zod Schema Validations', () => {
    it('should validate user profile with Zod schema', () => {
      const validInput = {
        full_name: 'John Doe',
        email: 'john@example.com',
        bio: 'Software engineer',
      };

      const result = UserProfileSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate interview context with Zod schema', () => {
      const validInput = {
        jobPosting: 'Developer position',
        companyInfo: 'Tech company',
        userCv: 'Relevant experience',
      };

      const result = InterviewContextSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should fail validation for invalid email', () => {
      const invalidInput = {
        full_name: 'John Doe',
        email: 'not-an-email',
      };

      const result = UserProfileSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});