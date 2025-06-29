-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT NULL;

-- Create admin_content table
CREATE TABLE IF NOT EXISTS admin_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL,
    github_url TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES users(id) NOT NULL
);

-- Create RLS policies for admin_content table (skip if already exists)
ALTER TABLE admin_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (ignore errors)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins can read all content" ON admin_content;
    DROP POLICY IF EXISTS "Admins can insert content" ON admin_content;
    DROP POLICY IF EXISTS "Admins can update their content" ON admin_content;
    DROP POLICY IF EXISTS "Admins can delete their content" ON admin_content;
EXCEPTION 
    WHEN OTHERS THEN NULL;
END $$;

-- Allow admins to read all content
CREATE POLICY "Admins can read all content" ON admin_content
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Allow admins to insert content
CREATE POLICY "Admins can insert content" ON admin_content
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Allow admins to update content they created
CREATE POLICY "Admins can update their content" ON admin_content
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Allow admins to delete content they created
CREATE POLICY "Admins can delete their content" ON admin_content
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_admin_content_updated_at 
    BEFORE UPDATE ON admin_content
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    exercise_type TEXT DEFAULT 'basic',
    pdf_url TEXT,
    file_name TEXT,
    drive_link TEXT,
    custom_title TEXT,
    border_color TEXT DEFAULT '#3B82F6',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Create exercise_content_edits table for tracking content modifications
CREATE TABLE IF NOT EXISTS exercise_content_edits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exercise_id TEXT NOT NULL,
    edit_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES users(id) NOT NULL
);

-- Create instruction_content_edits table for tracking instruction modifications
CREATE TABLE IF NOT EXISTS instruction_content_edits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    component_id TEXT NOT NULL,
    edit_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES users(id) NOT NULL
);

-- Enable RLS for exercises table
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_content_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE instruction_content_edits ENABLE ROW LEVEL SECURITY;

-- Drop existing exercise policies if they exist (ignore errors)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Everyone can read exercises" ON exercises;
    DROP POLICY IF EXISTS "Admins can insert exercises" ON exercises;
    DROP POLICY IF EXISTS "Admins can update exercises" ON exercises;
    DROP POLICY IF EXISTS "Admins can delete exercises" ON exercises;
    DROP POLICY IF EXISTS "Everyone can read exercise content edits" ON exercise_content_edits;
    DROP POLICY IF EXISTS "Admins can manage exercise content edits" ON exercise_content_edits;
    DROP POLICY IF EXISTS "Everyone can read instruction content edits" ON instruction_content_edits;
    DROP POLICY IF EXISTS "Admins can manage instruction content edits" ON instruction_content_edits;
EXCEPTION 
    WHEN OTHERS THEN NULL;
END $$;

-- Exercises policies
CREATE POLICY "Everyone can read exercises" ON exercises
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert exercises" ON exercises
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update exercises" ON exercises
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete exercises" ON exercises
    FOR DELETE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Exercise content edits policies
CREATE POLICY "Everyone can read exercise content edits" ON exercise_content_edits
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage exercise content edits" ON exercise_content_edits
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Instruction content edits policies  
CREATE POLICY "Everyone can read instruction content edits" ON instruction_content_edits
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage instruction content edits" ON instruction_content_edits
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Drop existing triggers if they exist (ignore errors)
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS update_exercises_updated_at ON exercises;
    DROP TRIGGER IF EXISTS update_exercise_content_edits_updated_at ON exercise_content_edits;
    DROP TRIGGER IF EXISTS update_instruction_content_edits_updated_at ON instruction_content_edits;
EXCEPTION 
    WHEN OTHERS THEN NULL;
END $$;

-- Triggers for updated_at
CREATE TRIGGER update_exercises_updated_at 
    BEFORE UPDATE ON exercises
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_content_edits_updated_at 
    BEFORE UPDATE ON exercise_content_edits
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instruction_content_edits_updated_at 
    BEFORE UPDATE ON instruction_content_edits
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Note: The admin user will be automatically assigned admin role when they first login
-- This is handled in the useAdmin.tsx hook, not in the migration