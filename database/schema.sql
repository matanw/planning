-- Personal Hierarchical Task Management System Database Schema
-- PostgreSQL Database Schema

-- Create the tasks table with hierarchical structure
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'done')),
    deadline TIMESTAMP WITH TIME ZONE,
    parent_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    labels TEXT[] DEFAULT '{}',
    priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 5)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO tasks (title, description, status, parent_id, labels) VALUES
('Education', 'Learning and educational goals', 'in_progress', NULL, ARRAY['learning', 'personal']),
('Halacha', 'Jewish law studies', 'not_started', 1, ARRAY['religion', 'study']),
('Meat & Milk Discussion', 'Understanding the laws of mixing meat and milk', 'not_started', 2, ARRAY['kashrut', 'halacha']),
('Finish source page TaaM Kaikar', 'Complete the source analysis for TaaM Kaikar', 'not_started', 3, ARRAY['research', 'sources']),
('Finance', 'Financial planning and management', 'not_started', NULL, ARRAY['money', 'planning']),
('Social Security', 'Social security related tasks', 'not_started', 5, ARRAY['government', 'benefits']),
('Check unemployment situation', 'Verify current unemployment status and benefits', 'not_started', 6, ARRAY['benefits', 'status'])
ON CONFLICT DO NOTHING;
