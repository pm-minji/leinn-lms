-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE learners ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- LEARNER POLICIES
-- ============================================

-- Learners can view their own reflections
CREATE POLICY "Learners can view own reflections"
ON reflections FOR SELECT
USING (
  learner_id IN (
    SELECT id FROM learners WHERE user_id = auth.uid()
  )
);

-- Learners can insert their own reflections
CREATE POLICY "Learners can insert own reflections"
ON reflections FOR INSERT
WITH CHECK (
  learner_id IN (
    SELECT id FROM learners WHERE user_id = auth.uid()
  )
);

-- Learners can update their own reflections (only content and title)
CREATE POLICY "Learners can update own reflections"
ON reflections FOR UPDATE
USING (
  learner_id IN (
    SELECT id FROM learners WHERE user_id = auth.uid()
  )
);

-- Learners can view their own profile
CREATE POLICY "Learners can view own profile"
ON learners FOR SELECT
USING (user_id = auth.uid());

-- ============================================
-- COACH POLICIES
-- ============================================

-- Coaches can view reflections from their assigned teams
CREATE POLICY "Coaches can view team reflections"
ON reflections FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM coach_teams
    WHERE coach_id IN (
      SELECT id FROM coaches WHERE user_id = auth.uid()
    )
  )
  OR
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Coaches can update reflections from their assigned teams (add feedback)
CREATE POLICY "Coaches can update team reflections"
ON reflections FOR UPDATE
USING (
  team_id IN (
    SELECT team_id FROM coach_teams
    WHERE coach_id IN (
      SELECT id FROM coaches WHERE user_id = auth.uid()
    )
  )
  OR
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Coaches can view learners from their assigned teams
CREATE POLICY "Coaches can view team learners"
ON learners FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM coach_teams
    WHERE coach_id IN (
      SELECT id FROM coaches WHERE user_id = auth.uid()
    )
  )
  OR
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Coaches can view their own coaching logs
CREATE POLICY "Coaches can view own coaching logs"
ON coaching_logs FOR SELECT
USING (
  coach_id IN (
    SELECT id FROM coaches WHERE user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Coaches can insert their own coaching logs
CREATE POLICY "Coaches can insert own coaching logs"
ON coaching_logs FOR INSERT
WITH CHECK (
  coach_id IN (
    SELECT id FROM coaches WHERE user_id = auth.uid()
  )
);

-- Coaches can update their own coaching logs
CREATE POLICY "Coaches can update own coaching logs"
ON coaching_logs FOR UPDATE
USING (
  coach_id IN (
    SELECT id FROM coaches WHERE user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Coaches can view teams they are assigned to
CREATE POLICY "Coaches can view assigned teams"
ON teams FOR SELECT
USING (
  id IN (
    SELECT team_id FROM coach_teams
    WHERE coach_id IN (
      SELECT id FROM coaches WHERE user_id = auth.uid()
    )
  )
  OR
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- ADMIN POLICIES
-- ============================================

-- Admins can do everything on users
CREATE POLICY "Admins have full access to users"
ON users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can do everything on teams
CREATE POLICY "Admins have full access to teams"
ON teams FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can do everything on coaches
CREATE POLICY "Admins have full access to coaches"
ON coaches FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can do everything on learners
CREATE POLICY "Admins have full access to learners"
ON learners FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can do everything on coach_teams
CREATE POLICY "Admins have full access to coach_teams"
ON coach_teams FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can do everything on ai_prompt_templates
CREATE POLICY "Admins have full access to ai_prompt_templates"
ON ai_prompt_templates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can view all reflections
CREATE POLICY "Admins can view all reflections"
ON reflections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can view all coaching logs
CREATE POLICY "Admins can view all coaching logs"
ON coaching_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- PUBLIC POLICIES (for authenticated users)
-- ============================================

-- Users can view their own user record
CREATE POLICY "Users can view own record"
ON users FOR SELECT
USING (id = auth.uid());

-- Users can update their own user record
CREATE POLICY "Users can update own record"
ON users FOR UPDATE
USING (id = auth.uid());
