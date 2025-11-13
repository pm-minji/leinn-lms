-- Create reflections table
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID REFERENCES learners(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL CHECK (LENGTH(content) >= 100),
  week_start DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' 
    CHECK (status IN ('submitted', 'ai_feedback_done', 'ai_feedback_pending', 'coach_feedback_done')),
  ai_summary TEXT,
  ai_risks TEXT,
  ai_actions TEXT,
  coach_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create coaching_logs table
CREATE TABLE coaching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  learner_id UUID REFERENCES learners(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  session_date DATE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('1:1', 'team', 'weekly')),
  notes TEXT,
  next_actions TEXT,
  follow_up_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for reflections
CREATE INDEX idx_reflections_learner ON reflections(learner_id);
CREATE INDEX idx_reflections_team ON reflections(team_id);
CREATE INDEX idx_reflections_status ON reflections(status);
CREATE INDEX idx_reflections_week_start ON reflections(week_start);

-- Create indexes for coaching_logs
CREATE INDEX idx_coaching_logs_coach ON coaching_logs(coach_id);
CREATE INDEX idx_coaching_logs_learner ON coaching_logs(learner_id);
CREATE INDEX idx_coaching_logs_team ON coaching_logs(team_id);
CREATE INDEX idx_coaching_logs_session_date ON coaching_logs(session_date);
CREATE INDEX idx_coaching_logs_status ON coaching_logs(status);

-- Add updated_at triggers
CREATE TRIGGER update_reflections_updated_at BEFORE UPDATE ON reflections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coaching_logs_updated_at BEFORE UPDATE ON coaching_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
