-- Supabase Database Schema for Ainterview

-- Users table (handled by Supabase Auth)
-- The users table is automatically created by Supabase Auth
-- We can extend it with a profiles table

-- User profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  experience TEXT,
  education TEXT,
  skills TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIME ZONE 'utc'::text,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIME ZONE 'utc'::text
);

-- Enable RLS (Row Level Security) for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Interview sessions table
CREATE TABLE interview_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  job_posting TEXT NOT NULL,
  company_info TEXT,
  user_cv TEXT,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIME ZONE 'utc'::text,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIME ZONE 'utc'::text,
  completed BOOLEAN DEFAULT FALSE,
  total_questions INTEGER DEFAULT 0
);

-- Enable RLS for interview_sessions
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own interview sessions" ON interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interview sessions" ON interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own interview sessions" ON interview_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Interview questions table
CREATE TABLE interview_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES interview_sessions NOT NULL,
  question_text TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIME ZONE 'utc'::text
);

-- Enable RLS for interview_questions
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view questions from own sessions" ON interview_questions FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM interview_sessions WHERE id = session_id)
);
CREATE POLICY "Users can insert questions to own sessions" ON interview_questions FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM interview_sessions WHERE id = session_id)
);

-- Interview answers table
CREATE TABLE interview_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES interview_questions NOT NULL,
  session_id UUID REFERENCES interview_sessions NOT NULL, -- Added for easier querying
  user_answer TEXT NOT NULL,
  ai_feedback TEXT,
  improvement_suggestions TEXT[],
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIME ZONE 'utc'::text
);

-- Enable RLS for interview_answers
ALTER TABLE interview_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view answers from own sessions" ON interview_answers FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM interview_sessions WHERE id = session_id)
);
CREATE POLICY "Users can insert answers to own sessions" ON interview_answers FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM interview_sessions WHERE id = session_id)
);

-- User credits table
CREATE TABLE user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIME ZONE 'utc'::text,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIME ZONE 'utc'::text
);

-- Enable RLS for user_credits
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own credits
CREATE POLICY "Users can view own credits" ON user_credits FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own credits record (for initial setup)
CREATE POLICY "Users can insert own credits record" ON user_credits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own credits
CREATE POLICY "Users can update own credits" ON user_credits FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role (authenticated as service_role) to manage credits for any user
-- This is needed for payment processing and other server-side operations
CREATE POLICY "Service role can manage all credits" ON user_credits FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Function to deduct credits safely
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
  new_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits FROM user_credits WHERE user_id = p_user_id;
  
  IF current_credits IS NULL THEN
    INSERT INTO user_credits (user_id, credits) VALUES (p_user_id, 0);
    current_credits := 0;
  END IF;
  
  new_credits := current_credits - p_amount;
  
  IF new_credits < 0 THEN
    RETURN FALSE; -- Insufficient credits
  END IF;
  
  UPDATE user_credits SET credits = new_credits, updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(p_user_id UUID, p_amount INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET credits = user_credits.credits + p_amount, updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to add credits from payment (handles micropayments)
CREATE OR REPLACE FUNCTION add_credits_from_payment(p_user_id UUID, p_usd_amount NUMERIC)
RETURNS BOOLEAN AS $$
DECLARE
  credits_to_add INTEGER;
BEGIN
  -- Convert USD amount to credits (e.g., $0.10 USD = 1 credit)
  -- Adjust this conversion rate as needed for your pricing model
  credits_to_add := (p_usd_amount * 10)::INTEGER;
  
  INSERT INTO user_credits (user_id, credits)
  VALUES (p_user_id, credits_to_add)
  ON CONFLICT (user_id) 
  DO UPDATE SET credits = user_credits.credits + credits_to_add, updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Usage tracking table
CREATE TABLE usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  action TEXT NOT NULL,
  cost INTEGER DEFAULT 1,
  free_interview_used BOOLEAN DEFAULT FALSE,
  interviews_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIME ZONE 'utc'::text
);

-- Enable RLS for usage_tracking
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage data" ON usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage data" ON usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);