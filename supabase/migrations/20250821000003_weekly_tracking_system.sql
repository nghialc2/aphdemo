-- ============================================================================
-- WEEKLY TRACKING SYSTEM - REDESIGNED FOR WEEKLY-FIRST APPROACH
-- LLM-Powered Analysis of Weekly Meeting Data
-- ============================================================================

-- Drop old tables if they exist (we're starting fresh)
DROP TABLE IF EXISTS public.kpis;
DROP TABLE IF EXISTS public.progress_logs;

-- ============================================================================
-- WEEKLY MEETINGS - PRIMARY ENTITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_meetings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_date date NOT NULL, -- Monday of the week (e.g., 2025-08-18)
    title text NOT NULL,
    meeting_type text DEFAULT 'weekly_standup',
    attendees text[], -- Array of attendee names
    duration_minutes integer,
    
    -- Meeting content
    agenda_items text[],
    discussion_notes text,
    
    -- Meeting outcomes
    total_action_items integer DEFAULT 0,
    completed_action_items integer DEFAULT 0,
    total_decisions integer DEFAULT 0,
    total_blockers integer DEFAULT 0,
    
    -- Import metadata
    source_type text DEFAULT 'manual', -- 'google_sheets', 'manual', 'api'
    source_url text, -- Google Sheets URL if imported
    imported_at timestamp with time zone,
    
    -- Team sentiment (can be filled by LLM analysis)
    team_mood text, -- 'positive', 'neutral', 'concerned', 'blocked'
    energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
    
    -- Standard fields
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- WEEKLY ACTION ITEMS - OPERATIONAL TASKS
-- ============================================================================

-- Update action_items to be weekly-focused
ALTER TABLE public.action_items 
ADD COLUMN IF NOT EXISTS week_date date,
ADD COLUMN IF NOT EXISTS weekly_meeting_id uuid REFERENCES public.weekly_meetings(id) ON DELETE SET NULL;

-- Create index for weekly queries
CREATE INDEX IF NOT EXISTS idx_action_items_week_date ON public.action_items(week_date);
CREATE INDEX IF NOT EXISTS idx_action_items_weekly_meeting ON public.action_items(weekly_meeting_id);

-- ============================================================================
-- WEEKLY DECISIONS - KEY OUTCOMES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_decisions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    weekly_meeting_id uuid NOT NULL REFERENCES public.weekly_meetings(id) ON DELETE CASCADE,
    week_date date NOT NULL,
    
    title text NOT NULL,
    description text,
    decision_type text, -- 'strategic', 'operational', 'resource', 'process'
    impact_level text, -- 'low', 'medium', 'high', 'critical'
    
    -- Decision tracking
    decision_maker text,
    implementation_date date,
    status text DEFAULT 'decided', -- 'decided', 'implementing', 'implemented', 'cancelled'
    
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- WEEKLY BLOCKERS - IMPEDIMENTS TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_blockers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    weekly_meeting_id uuid NOT NULL REFERENCES public.weekly_meetings(id) ON DELETE CASCADE,
    week_date date NOT NULL,
    
    title text NOT NULL,
    description text,
    blocker_type text, -- 'technical', 'resource', 'dependency', 'external', 'process'
    severity text, -- 'low', 'medium', 'high', 'critical'
    
    -- Blocker tracking
    affected_team_members text[],
    estimated_impact_days integer,
    resolution_date date,
    status text DEFAULT 'active', -- 'active', 'resolved', 'escalated', 'cancelled'
    
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- LLM ANALYSIS - AI-POWERED INSIGHTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.llm_analysis (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_type text NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'trend'
    time_period text NOT NULL, -- '2025-W34', '2025-08', '2025-Q3'
    
    -- Analysis scope
    weeks_analyzed date[], -- Array of week dates included in analysis
    meetings_count integer,
    action_items_count integer,
    decisions_count integer,
    blockers_count integer,
    
    -- AI-generated insights
    executive_summary text, -- High-level summary for leadership
    key_achievements text[], -- Major wins and accomplishments
    main_challenges text[], -- Top issues and concerns
    recurring_themes text[], -- Patterns identified across weeks
    
    -- Team performance metrics (AI-derived)
    productivity_score integer CHECK (productivity_score >= 1 AND productivity_score <= 10),
    collaboration_score integer CHECK (collaboration_score >= 1 AND collaboration_score <= 10),
    morale_trend text, -- 'improving', 'stable', 'declining'
    velocity_trend text, -- 'accelerating', 'steady', 'slowing'
    
    -- Recommendations
    strategic_recommendations text[],
    operational_improvements text[],
    risk_alerts text[],
    
    -- LLM metadata
    llm_model text, -- 'gpt-4', 'claude-3', etc.
    prompt_version text,
    confidence_score numeric, -- 0.0 to 1.0
    processing_time_seconds numeric,
    
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- STRATEGIC METRICS - DERIVED FROM LLM ANALYSIS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.strategic_metrics (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    llm_analysis_id uuid REFERENCES public.llm_analysis(id) ON DELETE CASCADE,
    
    metric_name text NOT NULL,
    metric_category text, -- 'productivity', 'quality', 'morale', 'delivery'
    time_period text NOT NULL,
    
    -- Metric values (AI-derived)
    current_value numeric,
    previous_value numeric,
    trend_direction text, -- 'up', 'down', 'stable'
    confidence_level numeric, -- 0.0 to 1.0
    
    -- Context
    unit text, -- '%', 'days', 'count'
    description text,
    insights text,
    
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Weekly meetings indexes
CREATE INDEX IF NOT EXISTS idx_weekly_meetings_week_date ON public.weekly_meetings(week_date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_meetings_type ON public.weekly_meetings(meeting_type);

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
-- FUNCTIONS FOR WEEKLY OPERATIONS
-- ============================================================================

-- Function to get Monday of any given date (for week normalization)
CREATE OR REPLACE FUNCTION public.get_week_start(input_date date)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT input_date - (EXTRACT(DOW FROM input_date)::integer - 1);
$$;

-- Function to get current week's meeting data
CREATE OR REPLACE FUNCTION public.get_current_week_summary()
RETURNS TABLE(
    week_date date,
    total_meetings bigint,
    total_action_items bigint,
    completed_action_items bigint,
    total_decisions bigint,
    active_blockers bigint
)
LANGUAGE sql
STABLE
AS $$
    WITH current_week AS (
        SELECT public.get_week_start(CURRENT_DATE) as week_start
    )
    SELECT 
        cw.week_start,
        COUNT(DISTINCT wm.id) as total_meetings,
        COALESCE(SUM(wm.total_action_items), 0) as total_action_items,
        COALESCE(SUM(wm.completed_action_items), 0) as completed_action_items,
        COUNT(DISTINCT wd.id) as total_decisions,
        COUNT(DISTINCT wb.id) FILTER (WHERE wb.status = 'active') as active_blockers
    FROM current_week cw
    LEFT JOIN public.weekly_meetings wm ON wm.week_date = cw.week_start
    LEFT JOIN public.weekly_decisions wd ON wd.week_date = cw.week_start
    LEFT JOIN public.weekly_blockers wb ON wb.week_date = cw.week_start
    GROUP BY cw.week_start;
$$;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.weekly_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_blockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_metrics ENABLE ROW LEVEL SECURITY;

-- Weekly meetings policies (team accessible)
CREATE POLICY "Team can view weekly meetings" ON public.weekly_meetings FOR SELECT USING (true);
CREATE POLICY "Team can create weekly meetings" ON public.weekly_meetings FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Team can update weekly meetings" ON public.weekly_meetings FOR UPDATE USING (true);

-- Similar policies for other tables
CREATE POLICY "Team can view weekly decisions" ON public.weekly_decisions FOR SELECT USING (true);
CREATE POLICY "Team can create weekly decisions" ON public.weekly_decisions FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team can view weekly blockers" ON public.weekly_blockers FOR SELECT USING (true);
CREATE POLICY "Team can create weekly blockers" ON public.weekly_blockers FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team can view llm analysis" ON public.llm_analysis FOR SELECT USING (true);
CREATE POLICY "System can create llm analysis" ON public.llm_analysis FOR INSERT WITH CHECK (true);

CREATE POLICY "Team can view strategic metrics" ON public.strategic_metrics FOR SELECT USING (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Add updated_at triggers
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

-- ============================================================================
-- SAMPLE WEEKLY DATA (for development/testing)
-- ============================================================================

-- Insert sample weekly meeting
/*
INSERT INTO public.weekly_meetings (
    week_date, title, meeting_type, attendees, 
    agenda_items, total_action_items, total_decisions,
    created_by
) VALUES (
    public.get_week_start(CURRENT_DATE),
    'Weekly Team Standup',
    'weekly_standup',
    ARRAY['John Doe', 'Jane Smith', 'Mike Johnson'],
    ARRAY['Review last week progress', 'Discuss current blockers', 'Plan next week'],
    5, 2,
    (SELECT auth.uid())
);
*/