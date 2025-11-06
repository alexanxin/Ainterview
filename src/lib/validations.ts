// validations/index.ts
import { z } from 'zod';

export const UserProfileSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(1000).optional(),
  experience: z.string().max(5000).optional(),
  education: z.string().max(3000).optional(),
  skills: z.string().max(1000).optional(),
});

export const InterviewContextSchema = z.object({
  jobPosting: z.string().min(10).max(10000),
  companyInfo: z.string().min(10).max(5000),
  userCv: z.string().min(10).max(10000),
});

export const sanitizeInput = (input: string): string => {
  // Remove potential prompt injection attempts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
};

export const validateUserProfile = (data: any) => {
  return UserProfileSchema.parse(data);
};

export const validateInterviewContext = (data: any) => {
  return InterviewContextSchema.parse(data);
};