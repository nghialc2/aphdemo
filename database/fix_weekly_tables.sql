-- ============================================================================
-- FIX WEEKLY TABLES - SIMPLE VERSION
-- Run this to fix the 409 error
-- ============================================================================

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS public.weekly_decisions CASCADE;
DROP TABLE IF EXISTS public.action_items CASCADE;
DROP TABLE IF EXISTS public.weekly_meetings CASCADE;

-- Create simple weekly_meetings table
CREATE TABLE public.weekly_meetings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    week_date date NOT NULL,
    title text NOT NULL,
    meeting_type text DEFAULT 'weekly_standup',
    attendees text[],
    agenda_items text[],
    total_action_items integer DEFAULT 0,
    completed_action_items integer DEFAULT 0,
    total_decisions integer DEFAULT 0,
    source_type text DEFAULT 'google_sheets',
    imported_at timestamp with time zone DEFAULT now(),
    created_by text DEFAULT 'anonymous',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create simple action_items table
CREATE TABLE public.action_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    assignee text,
    priority text DEFAULT 'medium',
    status text DEFAULT 'backlog',
    due_date date,
    week_date date,
    weekly_meeting_id uuid REFERENCES public.weekly_meetings(id) ON DELETE CASCADE,
    created_by text DEFAULT 'anonymous',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create simple weekly_decisions table
CREATE TABLE public.weekly_decisions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_meeting_id uuid NOT NULL REFERENCES public.weekly_meetings(id) ON DELETE CASCADE,
    week_date date NOT NULL,
    title text NOT NULL,
    description text,
    impact_level text DEFAULT 'medium',
    status text DEFAULT 'decided',
    created_by text DEFAULT 'anonymous',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_weekly_meetings_week_date ON public.weekly_meetings(week_date);
CREATE INDEX idx_action_items_weekly_meeting_id ON public.action_items(weekly_meeting_id);
CREATE INDEX idx_weekly_decisions_weekly_meeting_id ON public.weekly_decisions(weekly_meeting_id);

-- Disable RLS
ALTER TABLE public.weekly_meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_decisions DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.weekly_meetings TO anon, authenticated;
GRANT ALL ON public.action_items TO anon, authenticated;
GRANT ALL ON public.weekly_decisions TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Test insert to verify it works
INSERT INTO public.weekly_meetings (
    week_date, 
    title, 
    attendees, 
    agenda_items,
    total_action_items,
    total_decisions
) VALUES (
    '2025-08-19',
    'Test Meeting',
    ARRAY['Test User'],
    ARRAY['Test Agenda'],
    1,
    1
) RETURNING id, title;

-- Clean up test data
DELETE FROM public.weekly_meetings WHERE title = 'Test Meeting';

-- Verify tables exist
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('weekly_meetings', 'action_items', 'weekly_decisions')
ORDER BY table_name, ordinal_position;