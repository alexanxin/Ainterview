// Types for the B2B feature

export interface Company {
  id: string;
  user_id: string;
  company_name: string;
  company_description?: string;
  industry?: string;
  company_size?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface JobPost {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  location?: string;
  job_type?: string;
  posted_by: string;
  status: string;
  created_at: string;
  updated_at: string;
  closing_date?: string;
  ai_interview_questions?: any; // JSONB field
  credit_cost_per_applicant: number;
  shareable_url: string;
  slug: string;
}

export interface ApplicantResponse {
  id: string;
  job_post_id: string;
  applicant_user_id?: string;
  applicant_email?: string;
  applicant_name: string;
  applicant_cv?: string;
  answers?: any; // JSONB field
  ai_feedback?: any; // JSONB field
  status: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CompanyCredit {
  id: string;
  company_id: string;
  amount: number;
  cost_usd?: number;
  purchase_date: string;
  expires_at?: string;
  payment_transaction_id?: string;
  status: string;
}

export interface CompanyUsageTracking {
  id: string;
  company_id: string;
  job_post_id?: string;
  applicant_response_id?: string;
  credit_amount: number;
  action: string;
  description?: string;
  created_at: string;
}