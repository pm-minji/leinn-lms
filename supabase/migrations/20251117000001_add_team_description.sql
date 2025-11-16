-- Add description column to teams table
ALTER TABLE teams ADD COLUMN description TEXT;

-- Add updated_at column to learners table
ALTER TABLE learners ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add updated_at trigger for learners table
CREATE TRIGGER update_learners_updated_at BEFORE UPDATE ON learners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();