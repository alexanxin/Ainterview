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