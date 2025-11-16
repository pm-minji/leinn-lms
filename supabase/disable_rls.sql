-- Disable Row Level Security on all tables
-- This will remove all RLS policies and allow application-level authorization

-- Drop all existing policies first
DROP POLICY IF EXISTS "Learners can view own reflections" ON reflections;
DROP POLICY IF EXISTS "Learners can insert own reflections" ON reflections;
DROP POLICY IF EXISTS "Learners can update own reflections" ON reflections;
DROP POLICY IF EXISTS "Learners can view own profile" ON learners;

DROP POLICY IF EXISTS "Coaches can view team reflections" ON reflections;
DROP POLICY IF EXISTS "Coaches can update team reflections" ON reflections;
DROP POLICY IF EXISTS "Coaches can view team learners" ON learners;
DROP POLICY IF EXISTS "Coaches can view own coaching logs" ON coaching_logs;
DROP POLICY IF EXISTS "Coaches can insert own coaching logs" ON coaching_logs;
DROP POLICY IF EXISTS "Coaches can update own coaching logs" ON coaching_logs;
DROP POLICY IF EXISTS "Coaches can view assigned teams" ON teams;

DROP POLICY IF EXISTS "Admins have full access to users" ON users;
DROP POLICY IF EXISTS "Admins have full access to teams" ON teams;
DROP POLICY IF EXISTS "Admins have full access to coaches" ON coaches;
DROP POLICY IF EXISTS "Admins have full access to learners" ON learners;
DROP POLICY IF EXISTS "Admins have full access to coach_teams" ON coach_teams;
DROP POLICY IF EXISTS "Admins have full access to ai_prompt_templates" ON ai_prompt_templates;
DROP POLICY IF EXISTS "Admins can view all reflections" ON reflections;
DROP POLICY IF EXISTS "Admins can view all coaching logs" ON coaching_logs;

DROP POLICY IF EXISTS "Users can view own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE coaches DISABLE ROW LEVEL SECURITY;
ALTER TABLE learners DISABLE ROW LEVEL SECURITY;
ALTER TABLE coach_teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE reflections DISABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE okrs DISABLE ROW LEVEL SECURITY;
ALTER TABLE peer_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates DISABLE ROW LEVEL SECURITY;