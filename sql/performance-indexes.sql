-- Database Performance Optimization Indexes
-- Generated to resolve high sequential scan counts on applicant_responses, interview_answers, and interview_questions tables.

-- 1. applicant_responses
-- heavily queried by company_id via job_post join, and by status
-- Original issue: 772,700 seq scans
CREATE INDEX IF NOT EXISTS idx_applicant_responses_job_post_id ON public.applicant_responses(job_post_id);
CREATE INDEX IF NOT EXISTS idx_applicant_responses_status ON public.applicant_responses(status);

-- 2. interview_answers
-- heavily queried by session_id
-- Original issue: 46,370 seq scans
CREATE INDEX IF NOT EXISTS idx_interview_answers_session_id ON public.interview_answers(session_id);

-- 3. interview_questions
-- heavily queried by session_id
-- Original issue: 28,817 seq scans
CREATE INDEX IF NOT EXISTS idx_interview_questions_session_id ON public.interview_questions(session_id);

-- 4. interview_sessions
-- heavily queried by user_id for history lists
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON public.interview_sessions(user_id);

-- 5. job_posts
-- heavily queried by company_id
CREATE INDEX IF NOT EXISTS idx_job_posts_company_id ON public.job_posts(company_id);

-- Comments for documentation
COMMENT ON INDEX idx_applicant_responses_job_post_id IS 'Optimizes joining applicant responses with job posts';
COMMENT ON INDEX idx_applicant_responses_status IS 'Optimizes filtering applicant responses by status (e.g. pending)';
COMMENT ON INDEX idx_interview_answers_session_id IS 'Optimizes fetching all answers for a specific interview session';
COMMENT ON INDEX idx_interview_questions_session_id IS 'Optimizes fetching all questions for a specific interview session';
