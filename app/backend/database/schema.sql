-- =======================================================
-- Smart Interview Evaluation System (SIES) Database Schema
-- Supabase / PostgreSQL DDL Script
-- Project URL: https://unkcmtcqyqdtrsqrabpp.supabase.co
-- Paste this script into your Supabase SQL Editor and click "RUN"
-- =======================================================

-- 1. Create Users Table (Real Admins & Students)
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'candidate', 'student')),
    exam_code VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id BIGSERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    type VARCHAR(100) NOT NULL,
    points INT DEFAULT 10,
    admin_email VARCHAR(255) NOT NULL DEFAULT 'admin@sies.ai',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Candidate Evaluation Results Table
CREATE TABLE IF NOT EXISTS public.results (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    overallScore INT NOT NULL CHECK (overallScore >= 0 AND overallScore <= 100),
    technical INT NOT NULL CHECK (technical >= 0 AND technical <= 100),
    hr INT NOT NULL CHECK (hr >= 0 AND hr <= 100),
    communication INT NOT NULL CHECK (communication >= 0 AND communication <= 100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Passed', 'Review', 'Failed')),
    admin_email VARCHAR(255) NOT NULL DEFAULT 'admin@sies.ai',
    exam_code VARCHAR(50),
    questionResults JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_exam_code ON public.users(exam_code);
CREATE INDEX IF NOT EXISTS idx_questions_admin_email ON public.questions(admin_email);
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);
CREATE INDEX IF NOT EXISTS idx_results_admin_email ON public.results(admin_email);
CREATE INDEX IF NOT EXISTS idx_results_exam_code ON public.results(exam_code);
CREATE INDEX IF NOT EXISTS idx_results_status ON public.results(status);
CREATE INDEX IF NOT EXISTS idx_results_date ON public.results(date DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- 6. Public Access Policies (Allow read/insert/update/delete via publishable anon key)
DROP POLICY IF EXISTS "Allow all users operations" ON public.users;
CREATE POLICY "Allow all users operations" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all questions operations" ON public.questions;
CREATE POLICY "Allow all questions operations" ON public.questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all results operations" ON public.results;
CREATE POLICY "Allow all results operations" ON public.results FOR ALL USING (true) WITH CHECK (true);

-- 7. Seed Initial Core Admin Account (Real credentials)
INSERT INTO public.users (name, email, password, role, exam_code) VALUES
('Senior HR Admin', 'admin@sies.ai', 'admin123', 'admin', 'SIES-TECH')
ON CONFLICT (email) DO UPDATE SET exam_code = EXCLUDED.exam_code;

-- 8. Seed Initial Questions Library
INSERT INTO public.questions (question, category, difficulty, type, points, admin_email) VALUES
('Explain the difference between var, let, and const in JavaScript.', 'Technical', 'Easy', 'JavaScript', 10, 'admin@sies.ai'),
('What is the Virtual DOM and how does React optimize UI rendering?', 'Technical', 'Medium', 'React', 15, 'admin@sies.ai'),
('Explain the concept of closures in JavaScript with a real-world use case.', 'Technical', 'Medium', 'JavaScript', 15, 'admin@sies.ai'),
('What are RESTful APIs and what architectural constraints do they follow?', 'Technical', 'Easy', 'Web Development', 10, 'admin@sies.ai'),
('Explain microservices architecture and how services communicate reliably.', 'Technical', 'Hard', 'Architecture', 20, 'admin@sies.ai'),
('Describe a challenging technical project you delivered and how you resolved roadblocks.', 'HR', 'Medium', 'Behavioral', 10, 'admin@sies.ai'),
('How do you handle technical disagreements or conflicts within your engineering team?', 'HR', 'Easy', 'Behavioral', 10, 'admin@sies.ai')
ON CONFLICT DO NOTHING;
