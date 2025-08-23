-- ============================================================================
-- APPLY WEEKLY TRACKING SYSTEM
-- Run this in Supabase SQL Editor to fix the 404 and 400 errors
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- WEEKLY MEETINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_meetings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_date date NOT NULL,
    title text NOT NULL,
    meeting_type text DEFAULT 'weekly_standup',
    attendees text[],
    duration_minutes integer,
    agenda_items text[],
    discussion_notes text,
    total_action_items integer DEFAULT 0,
    completed_action_items integer DEFAULT 0,
    total_decisions integer DEFAULT 0,
    total_blockers integer DEFAULT 0,
    source_type text DEFAULT 'manual',
    source_url text,
    imported_at timestamp with time zone,
    team_mood text,
    energy_level integer CHECK (energy_level IS NULL OR (energy_level >= 1 AND energy_level <= 10)),
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- UPDATE ACTION ITEMS TABLE
-- ============================================================================

-- Add week_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'action_items' 
                   AND column_name = 'week_date') THEN
        ALTER TABLE public.action_items ADD COLUMN week_date date;
    END IF;
END $$;

-- Add weekly_meeting_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'action_items' 
                   AND column_name = 'weekly_meeting_id') THEN
        ALTER TABLE public.action_items 
        ADD COLUMN weekly_meeting_id uuid REFERENCES public.weekly_meetings(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- WEEKLY DECISIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_decisions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    weekly_meeting_id uuid NOT NULL REFERENCES public.weekly_meetings(id) ON DELETE CASCADE,
    week_date date NOT NULL,
    title text NOT NULL,
    description text,
    decision_type text,
    impact_level text,
    decision_maker text,
    implementation_date date,
    status text DEFAULT 'decided',
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- WEEKLY BLOCKERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_blockers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    weekly_meeting_id uuid NOT NULL REFERENCES public.weekly_meetings(id) ON DELETE CASCADE,
    week_date date NOT NULL,
    title text NOT NULL,
    description text,
    blocker_type text,
    severity text,
    affected_team_members text[],
    estimated_impact_days integer,
    resolution_date date,
    status text DEFAULT 'active',
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- LLM ANALYSIS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.llm_analysis (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_type text NOT NULL,
    time_period text NOT NULL,
    weeks_analyzed date[],
    meetings_count integer,
    action_items_count integer,
    decisions_count integer,
    blockers_count integer,
    executive_summary text,
    key_achievements text[],
    main_challenges text[],
    recurring_themes text[],
    productivity_score integer CHECK (productivity_score IS NULL OR (productivity_score >= 1 AND productivity_score <= 10)),
    collaboration_score integer CHECK (collaboration_score IS NULL OR (collaboration_score >= 1 AND collaboration_score <= 10)),
    morale_trend text,
    velocity_trend text,
    strategic_recommendations text[],
    operational_improvements text[],
    risk_alerts text[],
    llm_model text,
    prompt_version text,
    confidence_score numeric,
    processing_time_seconds numeric,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- STRATEGIC METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.strategic_metrics (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    llm_analysis_id uuid REFERENCES public.llm_analysis(id) ON DELETE CASCADE,
    metric_name text NOT NULL,
    metric_category text,
    time_period text NOT NULL,
    current_value numeric,
    previous_value numeric,
    trend_direction text,
    confidence_level numeric,
    unit text,
    description text,
    insights text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Weekly meetings indexes
CREATE INDEX IF NOT EXISTS idx_weekly_meetings_week_date ON public.weekly_meetings(week_date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_meetings_type ON public.weekly_meetings(meeting_type);
CREATE INDEX IF NOT EXISTS idx_weekly_meetings_created_by ON public.weekly_meetings(created_by);

-- Action items indexes
CREATE INDEX IF NOT EXISTS idx_action_items_week_date ON public.action_items(week_date);
CREATE INDEX IF NOT EXISTS idx_action_items_weekly_meeting ON public.action_items(weekly_meeting_id);

-- Decisions indexes
CREATE INDEX IF NOT EXISTS idx_weekly_decisions_week_date ON public.weekly_decisions(week_date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_decisions_impact ON public.weekly_decisions(impact_level);

-- Blockers indexes
CREATE INDEX IF NOT EXISTS idx_weekly_blockers_week_date ON public.weekly_blockers(week_date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_blockers_severity ON public.weekly_blockers(severity);
CREATE INDEX IF NOT EXISTS idx_weekly_blockers_status ON public.weekly_blockers(status);

-- LLM analysis indexes
CREATE INDEX IF NOT EXISTS idx_llm_analysis_type ON public.llm_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_llm_analysis_period ON public.llm_analysis(time_period);

-- Strategic metrics indexes
CREATE INDEX IF NOT EXISTS idx_strategic_metrics_category ON public.strategic_metrics(metric_category);
CREATE INDEX IF NOT EXISTS idx_strategic_metrics_period ON public.strategic_metrics(time_period);

-- ============================================================================
-- ENABLE RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.weekly_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_blockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Team can view weekly meetings" ON public.weekly_meetings;
DROP POLICY IF EXISTS "Team can create weekly meetings" ON public.weekly_meetings;
DROP POLICY IF EXISTS "Team can update weekly meetings" ON public.weekly_meetings;
DROP POLICY IF EXISTS "Team can delete own weekly meetings" ON public.weekly_meetings;

DROP POLICY IF EXISTS "Team can view weekly decisions" ON public.weekly_decisions;
DROP POLICY IF EXISTS "Team can create weekly decisions" ON public.weekly_decisions;
DROP POLICY IF EXISTS "Team can update weekly decisions" ON public.weekly_decisions;

DROP POLICY IF EXISTS "Team can view weekly blockers" ON public.weekly_blockers;
DROP POLICY IF EXISTS "Team can create weekly blockers" ON public.weekly_blockers;
DROP POLICY IF EXISTS "Team can update weekly blockers" ON public.weekly_blockers;

DROP POLICY IF EXISTS "Team can view llm analysis" ON public.llm_analysis;
DROP POLICY IF EXISTS "Anyone can create llm analysis" ON public.llm_analysis;

DROP POLICY IF EXISTS "Team can view strategic metrics" ON public.strategic_metrics;

-- Weekly meetings policies
CREATE POLICY "Team can view weekly meetings" ON public.weekly_meetings 
    FOR SELECT USING (true);

CREATE POLICY "Team can create weekly meetings" ON public.weekly_meetings 
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team can update weekly meetings" ON public.weekly_meetings 
    FOR UPDATE USING (true);

CREATE POLICY "Team can delete own weekly meetings" ON public.weekly_meetings 
    FOR DELETE USING (auth.uid() = created_by);

-- Weekly decisions policies
CREATE POLICY "Team can view weekly decisions" ON public.weekly_decisions 
    FOR SELECT USING (true);

CREATE POLICY "Team can create weekly decisions" ON public.weekly_decisions 
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team can update weekly decisions" ON public.weekly_decisions 
    FOR UPDATE USING (auth.uid() = created_by);

-- Weekly blockers policies
CREATE POLICY "Team can view weekly blockers" ON public.weekly_blockers 
    FOR SELECT USING (true);

CREATE POLICY "Team can create weekly blockers" ON public.weekly_blockers 
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team can update weekly blockers" ON public.weekly_blockers 
    FOR UPDATE USING (auth.uid() = created_by);

-- LLM analysis policies (allow anyone to create for service functions)
CREATE POLICY "Team can view llm analysis" ON public.llm_analysis 
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create llm analysis" ON public.llm_analysis 
    FOR INSERT WITH CHECK (true);

-- Strategic metrics policies
CREATE POLICY "Team can view strategic metrics" ON public.strategic_metrics 
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create strategic metrics" ON public.strategic_metrics 
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- CREATE OR REPLACE TRIGGER FUNCTION
-- ============================================================================

-- Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ADD TRIGGERS FOR updated_at
-- ============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_weekly_meetings_updated_at ON public.weekly_meetings;
DROP TRIGGER IF EXISTS trigger_weekly_decisions_updated_at ON public.weekly_decisions;
DROP TRIGGER IF EXISTS trigger_weekly_blockers_updated_at ON public.weekly_blockers;
DROP TRIGGER IF EXISTS trigger_llm_analysis_updated_at ON public.llm_analysis;

-- Create triggers
CREATE TRIGGER trigger_weekly_meetings_updated_at
    BEFORE UPDATE ON public.weekly_meetings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_weekly_decisions_updated_at
    BEFORE UPDATE ON public.weekly_decisions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_weekly_blockers_updated_at
    BEFORE UPDATE ON public.weekly_blockers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_llm_analysis_updated_at
    BEFORE UPDATE ON public.llm_analysis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT ALL ON public.weekly_meetings TO authenticated;
GRANT ALL ON public.weekly_decisions TO authenticated;
GRANT ALL ON public.weekly_blockers TO authenticated;
GRANT ALL ON public.llm_analysis TO authenticated;
GRANT ALL ON public.strategic_metrics TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify the setup:
-- SELECT COUNT(*) FROM public.weekly_meetings;
-- SELECT COUNT(*) FROM public.weekly_decisions;
-- SELECT COUNT(*) FROM public.weekly_blockers;
-- SELECT COUNT(*) FROM public.llm_analysis;
-- SELECT COUNT(*) FROM public.strategic_metrics;

-- Check if columns exist:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_schema = 'public' AND table_name = 'action_items' 
-- AND column_name IN ('week_date', 'weekly_meeting_id');

COMMENT ON TABLE public.weekly_meetings IS 'Weekly team meetings with Google Sheets import support';
COMMENT ON TABLE public.weekly_decisions IS 'Key decisions made during weekly meetings';
COMMENT ON TABLE public.weekly_blockers IS 'Blockers and impediments tracked weekly';
COMMENT ON TABLE public.llm_analysis IS 'AI-powered analysis of weekly data';
COMMENT ON TABLE public.strategic_metrics IS 'Metrics derived from LLM analysis';