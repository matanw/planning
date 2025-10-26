-- Supabase database schema for Task Management System

-- Enable UUID extension if needed (for auto-incrementing IDs)
-- Note: We'll use integer IDs for simplicity to match existing structure

-- Create the tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'done')),
  deadline TIMESTAMPTZ,
  parent_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  labels TEXT[] DEFAULT ARRAY[]::TEXT[],
  priority INTEGER NOT NULL DEFAULT 0 CHECK (priority >= 0 AND priority <= 5)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
-- Allow anonymous users to read and write for now
-- You can modify this to add authentication later
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (you can restrict this later)
DROP POLICY IF EXISTS "Allow anonymous access" ON tasks;
CREATE POLICY "Allow anonymous access" ON tasks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert sample data (optional)
-- This will only insert if the table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tasks LIMIT 1) THEN
    INSERT INTO tasks (title, description, status, parent_id, labels, priority) VALUES
      ('Education', 'Learning and educational goals', 'in_progress', NULL, ARRAY['learning', 'personal'], 0),
      ('Halacha', 'Jewish law studies', 'not_started', 1, ARRAY['religion', 'study'], 0),
      ('Meat & Milk Discussion', 'Understanding the laws of mixing meat and milk', 'not_started', 2, ARRAY['kashrut', 'halacha'], 0),
      ('Finish source page TaaM Kaikar', 'Complete the source analysis for TaaM Kaikar', 'not_started', 3, ARRAY['research', 'sources'], 0),
      ('Finance', 'Financial planning and management', 'not_started', NULL, ARRAY['money', 'planning'], 0),
      ('Social Security', 'Social security related tasks', 'not_started', 5, ARRAY['government', 'benefits'], 0),
      ('Check unemployment situation', 'Verify current unemployment status and benefits', 'not_started', 6, ARRAY['benefits', 'status'], 0);
  END IF;
END $$;

