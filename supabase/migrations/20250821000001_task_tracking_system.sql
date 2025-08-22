-- ============================================================================
-- TASK & TRACKING SYSTEM DATABASE MIGRATION
-- Team Meeting Minutes, Goals Tracking, and KPI Management System
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Goal types (yearly, quarterly, monthly)
DO $$ BEGIN
    CREATE TYPE goal_type AS ENUM ('yearly', 'quarterly', 'monthly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Goal status
DO $$ BEGIN
    CREATE TYPE goal_status AS ENUM ('not_started', 'in_progress', 'completed', 'at_risk', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Task priority levels
DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('critical', 'high', 'medium', 'low');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Task status
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('backlog', 'in_progress', 'review', 'done', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Meeting types
DO $$ BEGIN
    CREATE TYPE meeting_type AS ENUM ('weekly_standup', 'monthly_review', 'quarterly_planning', 'project_deepdive', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Goals table (Yearly, Quarterly, Monthly targets)
CREATE TABLE IF NOT EXISTS public.goals (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text,
    type goal_type NOT NULL,
    target_value numeric,
    current_value numeric DEFAULT 0,
    unit text, -- e.g., 'percentage', 'count', 'revenue_usd'
    start_date date NOT NULL,
    due_date date NOT NULL,
    status goal_status DEFAULT 'not_started',
    parent_goal_id uuid REFERENCES public.goals(id) ON DELETE SET NULL, -- Link quarterly to yearly, monthly to quarterly
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Meetings table (Team meeting minutes)
CREATE TABLE IF NOT EXISTS public.meetings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    meeting_type meeting_type DEFAULT 'weekly_standup',
    meeting_date date NOT NULL,
    start_time time,
    end_time time,
    agenda text[], -- Array of agenda items
    attendees text[], -- Array of attendee names/emails
    notes text, -- Rich text meeting notes
    decisions text[], -- Array of key decisions made
    next_steps text[], -- Follow-up items for next meeting
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Action Items/Tasks table (Tasks from meetings and general work)
CREATE TABLE IF NOT EXISTS public.action_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id uuid REFERENCES public.meetings(id) ON DELETE SET NULL, -- Can be null for general tasks
    goal_id uuid REFERENCES public.goals(id) ON DELETE SET NULL, -- Link to specific goal
    title text NOT NULL,
    description text,
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date date,
    priority task_priority DEFAULT 'medium',
    status task_status DEFAULT 'backlog',
    progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    estimated_hours numeric,
    actual_hours numeric,
    blocking_issues text[], -- Array of blocking issues
    tags text[], -- Array of tags for categorization
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- KPIs table (Key Performance Indicators tracking)
CREATE TABLE IF NOT EXISTS public.kpis (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    metric_name text NOT NULL,
    unit text, -- e.g., 'percentage', 'count', 'usd'
    target_value numeric NOT NULL,
    current_value numeric DEFAULT 0,
    measurement_date date DEFAULT CURRENT_DATE,
    notes text,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Progress Logs table (Track changes over time)
CREATE TABLE IF NOT EXISTS public.progress_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id uuid REFERENCES public.goals(id) ON DELETE CASCADE,
    action_item_id uuid REFERENCES public.action_items(id) ON DELETE CASCADE,
    previous_value numeric,
    new_value numeric,
    change_type text, -- e.g., 'progress_update', 'status_change', 'target_adjustment'
    notes text,
    updated_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Team Members table (Extended user profiles for team management)
CREATE TABLE IF NOT EXISTS public.team_members (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text NOT NULL,
    role text, -- e.g., 'Team Lead', 'Developer', 'Designer'
    department text,
    avatar_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Goals indexes
CREATE INDEX IF NOT EXISTS idx_goals_type ON public.goals(type);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_due_date ON public.goals(due_date);
CREATE INDEX IF NOT EXISTS idx_goals_assigned_to ON public.goals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_goals_parent_goal_id ON public.goals(parent_goal_id);

-- Meetings indexes
CREATE INDEX IF NOT EXISTS idx_meetings_date ON public.meetings(meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_type ON public.meetings(meeting_type);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON public.meetings(created_by);

-- Action items indexes
CREATE INDEX IF NOT EXISTS idx_action_items_status ON public.action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_priority ON public.action_items(priority);
CREATE INDEX IF NOT EXISTS idx_action_items_assigned_to ON public.action_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON public.action_items(due_date);
CREATE INDEX IF NOT EXISTS idx_action_items_meeting_id ON public.action_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_action_items_goal_id ON public.action_items(goal_id);

-- KPIs indexes
CREATE INDEX IF NOT EXISTS idx_kpis_goal_id ON public.kpis(goal_id);
CREATE INDEX IF NOT EXISTS idx_kpis_measurement_date ON public.kpis(measurement_date DESC);

-- Progress logs indexes
CREATE INDEX IF NOT EXISTS idx_progress_logs_goal_id ON public.progress_logs(goal_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_action_item_id ON public.progress_logs(action_item_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_created_at ON public.progress_logs(created_at DESC);

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    new.updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$;

-- Function to calculate goal completion percentage
CREATE OR REPLACE FUNCTION public.calculate_goal_progress(goal_id_param uuid)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
    SELECT 
        CASE 
            WHEN target_value = 0 THEN 0
            ELSE ROUND((current_value / target_value * 100), 2)
        END
    FROM public.goals 
    WHERE id = goal_id_param;
$$;

-- Function to get overdue action items
CREATE OR REPLACE FUNCTION public.get_overdue_action_items()
RETURNS TABLE(
    id uuid,
    title text,
    assigned_to uuid,
    due_date date,
    days_overdue integer
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        ai.id,
        ai.title,
        ai.assigned_to,
        ai.due_date,
        (CURRENT_DATE - ai.due_date)::integer as days_overdue
    FROM public.action_items ai
    WHERE ai.due_date < CURRENT_DATE 
    AND ai.status NOT IN ('done', 'cancelled')
    ORDER BY ai.due_date ASC;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS trigger_goals_updated_at ON public.goals;
CREATE TRIGGER trigger_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_meetings_updated_at ON public.meetings;
CREATE TRIGGER trigger_meetings_updated_at
    BEFORE UPDATE ON public.meetings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_action_items_updated_at ON public.action_items;
CREATE TRIGGER trigger_action_items_updated_at
    BEFORE UPDATE ON public.action_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_kpis_updated_at ON public.kpis;
CREATE TRIGGER trigger_kpis_updated_at
    BEFORE UPDATE ON public.kpis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_team_members_updated_at ON public.team_members;
CREATE TRIGGER trigger_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Goals policies (Team members can view and edit all team goals)
DROP POLICY IF EXISTS "Team members can view all goals" ON public.goals;
CREATE POLICY "Team members can view all goals"
    ON public.goals FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team members can create goals" ON public.goals;
CREATE POLICY "Team members can create goals"
    ON public.goals FOR INSERT
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Team members can update goals" ON public.goals;
CREATE POLICY "Team members can update goals"
    ON public.goals FOR UPDATE
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team members can delete their goals" ON public.goals;
CREATE POLICY "Team members can delete their goals"
    ON public.goals FOR DELETE
    USING (auth.uid() = created_by);

-- Meetings policies
DROP POLICY IF EXISTS "Team members can view all meetings" ON public.meetings;
CREATE POLICY "Team members can view all meetings"
    ON public.meetings FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team members can create meetings" ON public.meetings;
CREATE POLICY "Team members can create meetings"
    ON public.meetings FOR INSERT
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Team members can update meetings" ON public.meetings;
CREATE POLICY "Team members can update meetings"
    ON public.meetings FOR UPDATE
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team members can delete their meetings" ON public.meetings;
CREATE POLICY "Team members can delete their meetings"
    ON public.meetings FOR DELETE
    USING (auth.uid() = created_by);

-- Action items policies
DROP POLICY IF EXISTS "Team members can view all action items" ON public.action_items;
CREATE POLICY "Team members can view all action items"
    ON public.action_items FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team members can create action items" ON public.action_items;
CREATE POLICY "Team members can create action items"
    ON public.action_items FOR INSERT
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Team members can update action items" ON public.action_items;
CREATE POLICY "Team members can update action items"
    ON public.action_items FOR UPDATE
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team members can delete their action items" ON public.action_items;
CREATE POLICY "Team members can delete their action items"
    ON public.action_items FOR DELETE
    USING (auth.uid() = created_by);

-- KPIs policies
DROP POLICY IF EXISTS "Team members can view all kpis" ON public.kpis;
CREATE POLICY "Team members can view all kpis"
    ON public.kpis FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team members can create kpis" ON public.kpis;
CREATE POLICY "Team members can create kpis"
    ON public.kpis FOR INSERT
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Team members can update kpis" ON public.kpis;
CREATE POLICY "Team members can update kpis"
    ON public.kpis FOR UPDATE
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team members can delete their kpis" ON public.kpis;
CREATE POLICY "Team members can delete their kpis"
    ON public.kpis FOR DELETE
    USING (auth.uid() = created_by);

-- Progress logs policies
DROP POLICY IF EXISTS "Team members can view all progress logs" ON public.progress_logs;
CREATE POLICY "Team members can view all progress logs"
    ON public.progress_logs FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Team members can create progress logs" ON public.progress_logs;
CREATE POLICY "Team members can create progress logs"
    ON public.progress_logs FOR INSERT
    WITH CHECK (auth.uid() = updated_by);

-- Team members policies
DROP POLICY IF EXISTS "Team members can view all team members" ON public.team_members;
CREATE POLICY "Team members can view all team members"
    ON public.team_members FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.team_members;
CREATE POLICY "Users can update their own profile"
    ON public.team_members FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.team_members;
CREATE POLICY "Users can insert their own profile"
    ON public.team_members FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- SAMPLE DATA (Optional - for development/testing)
-- ============================================================================

-- Insert sample goals (uncomment for development)
/*
INSERT INTO public.goals (title, description, type, target_value, unit, start_date, due_date, created_by) VALUES
('Increase Team Productivity', 'Improve overall team productivity by 25%', 'yearly', 25, 'percentage', '2025-01-01', '2025-12-31', (SELECT auth.uid())),
('Complete Q1 Deliverables', 'Finish all Q1 project milestones on time', 'quarterly', 5, 'count', '2025-01-01', '2025-03-31', (SELECT auth.uid())),
('Weekly Meeting Attendance', 'Achieve 90% attendance in weekly meetings', 'monthly', 90, 'percentage', '2025-08-01', '2025-08-31', (SELECT auth.uid()));
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================