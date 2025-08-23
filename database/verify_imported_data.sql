-- ============================================================================
-- VERIFY AND FIX IMPORTED DATA VISIBILITY
-- Run this in Supabase SQL Editor to check imported data
-- ============================================================================

-- 1. Check if weekly_meetings table exists and has data
SELECT 
    'weekly_meetings' as table_name,
    COUNT(*) as record_count,
    MIN(week_date) as earliest_date,
    MAX(week_date) as latest_date,
    array_agg(DISTINCT source_type) as source_types
FROM public.weekly_meetings;

-- 2. Check action_items with week_date
SELECT 
    'action_items' as table_name,
    COUNT(*) as total_records,
    COUNT(week_date) as records_with_week_date,
    COUNT(weekly_meeting_id) as records_with_meeting_id,
    MIN(week_date) as earliest_week,
    MAX(week_date) as latest_week
FROM public.action_items;

-- 3. Check weekly_decisions
SELECT 
    'weekly_decisions' as table_name,
    COUNT(*) as record_count,
    MIN(week_date) as earliest_date,
    MAX(week_date) as latest_date
FROM public.weekly_decisions;

-- 4. View recent imports (last 7 days)
SELECT 
    id,
    week_date,
    title,
    source_type,
    imported_at,
    total_action_items,
    completed_action_items,
    total_decisions,
    array_length(attendees, 1) as attendee_count,
    created_by,
    created_at
FROM public.weekly_meetings
WHERE source_type = 'google_sheets'
ORDER BY imported_at DESC
LIMIT 10;

-- 5. Check for this week's data specifically
WITH current_week AS (
    SELECT date_trunc('week', CURRENT_DATE)::date as week_start
)
SELECT 
    wm.*,
    (SELECT COUNT(*) FROM action_items ai WHERE ai.weekly_meeting_id = wm.id) as actual_action_items,
    (SELECT COUNT(*) FROM weekly_decisions wd WHERE wd.weekly_meeting_id = wm.id) as actual_decisions
FROM public.weekly_meetings wm, current_week cw
WHERE wm.week_date = cw.week_start;

-- 6. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename IN ('weekly_meetings', 'action_items', 'weekly_decisions', 'llm_analysis')
ORDER BY tablename, policyname;

-- 7. Fix any orphaned action items (no week_date)
UPDATE public.action_items
SET week_date = date_trunc('week', created_at)::date
WHERE week_date IS NULL;

-- 8. Get summary of all weekly data
SELECT 
    wm.week_date,
    COUNT(DISTINCT wm.id) as meetings,
    COUNT(DISTINCT ai.id) as action_items,
    COUNT(DISTINCT wd.id) as decisions,
    array_agg(DISTINCT wm.source_type) as sources
FROM public.weekly_meetings wm
LEFT JOIN public.action_items ai ON ai.weekly_meeting_id = wm.id
LEFT JOIN public.weekly_decisions wd ON wd.weekly_meeting_id = wm.id
GROUP BY wm.week_date
ORDER BY wm.week_date DESC;

-- 9. Check if user has access to data
SELECT 
    auth.uid() as current_user_id,
    email as current_user_email,
    role as current_user_role
FROM auth.users
WHERE id = auth.uid();

-- 10. Grant additional permissions if needed (run as admin)
-- Uncomment these if you're running as database admin:
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;