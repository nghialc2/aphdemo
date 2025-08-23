-- ============================================================================
-- SIMPLE WEEKLY DASHBOARD SETUP
-- Run this in Supabase SQL Editor - No authentication required!
-- ============================================================================

-- Create tables with simplified structure
CREATE TABLE IF NOT EXISTS public.weekly_meetings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_by uuid DEFAULT '00000000-0000-0000-0000-000000000000',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create action_items table
CREATE TABLE IF NOT EXISTS public.action_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    assignee text,
    priority text DEFAULT 'medium',
    status text DEFAULT 'backlog',
    due_date date,
    week_date date,
    weekly_meeting_id uuid REFERENCES public.weekly_meetings(id) ON DELETE CASCADE,
    created_by uuid DEFAULT '00000000-0000-0000-0000-000000000000',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create weekly_decisions table
CREATE TABLE IF NOT EXISTS public.weekly_decisions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    weekly_meeting_id uuid NOT NULL REFERENCES public.weekly_meetings(id) ON DELETE CASCADE,
    week_date date NOT NULL,
    title text NOT NULL,
    description text,
    impact_level text DEFAULT 'medium',
    status text DEFAULT 'decided',
    created_by uuid DEFAULT '00000000-0000-0000-0000-000000000000',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weekly_meetings_week_date ON public.weekly_meetings(week_date);
CREATE INDEX IF NOT EXISTS idx_action_items_weekly_meeting_id ON public.action_items(weekly_meeting_id);
CREATE INDEX IF NOT EXISTS idx_weekly_decisions_weekly_meeting_id ON public.weekly_decisions(weekly_meeting_id);

-- DISABLE ROW LEVEL SECURITY for simplicity
ALTER TABLE public.weekly_meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_decisions DISABLE ROW LEVEL SECURITY;

-- Grant public access (be careful in production!)
GRANT ALL ON public.weekly_meetings TO anon, authenticated;
GRANT ALL ON public.action_items TO anon, authenticated;
GRANT ALL ON public.weekly_decisions TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Test the setup
SELECT 'Tables created successfully!' as status;

-- Show table counts
SELECT 
    'weekly_meetings' as table_name, 
    COUNT(*) as record_count 
FROM public.weekly_meetings
UNION ALL
SELECT 
    'action_items' as table_name, 
    COUNT(*) as record_count 
FROM public.action_items
UNION ALL
SELECT 
    'weekly_decisions' as table_name, 
    COUNT(*) as record_count 
FROM public.weekly_decisions;