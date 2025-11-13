-- Create okrs table (future expansion)
CREATE TABLE okrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  objective TEXT NOT NULL,
  key_results JSONB NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  confidence INTEGER CHECK (confidence >= 1 AND confidence <= 5),
  status TEXT CHECK (status IN ('on_track', 'at_risk', 'off_track')),
  cycle TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create peer_reviews table (future expansion)
CREATE TABLE peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID REFERENCES learners(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES learners(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  collab_score INTEGER CHECK (collab_score >= 1 AND collab_score <= 5),
  exec_score INTEGER CHECK (exec_score >= 1 AND exec_score <= 5),
  lead_score INTEGER CHECK (lead_score >= 1 AND lead_score <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (reviewer_id != reviewee_id)
);

-- Create indexes
CREATE INDEX idx_okrs_team ON okrs(team_id);
CREATE INDEX idx_okrs_cycle ON okrs(cycle);
CREATE INDEX idx_peer_reviews_reviewer ON peer_reviews(reviewer_id);
CREATE INDEX idx_peer_reviews_reviewee ON peer_reviews(reviewee_id);
CREATE INDEX idx_peer_reviews_team ON peer_reviews(team_id);

-- Add updated_at trigger
CREATE TRIGGER update_okrs_updated_at BEFORE UPDATE ON okrs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
