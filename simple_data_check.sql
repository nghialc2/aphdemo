-- ============================================================================
-- SIMPLE DATA VERIFICATION QUERIES
-- Run these one by one in Supabase SQL Editor
-- ============================================================================

-- 1. Check if weekly_meetings table exists and has data
SELECT COUNT(*) as total_weekly_meetings FROM public.weekly_meetings;

-- 2. Show recent weekly meetings
SELECT 
    id,
    week_date,
    title,
    source_type,
    imported_at,
    total_action_items,
    total_decisions,
    array_length(attendees, 1) as attendee_count
FROM public.weekly_meetings
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check action_items table
SELECT COUNT(*) as total_action_items FROM public.action_items;

-- 4. Show action items with week_date
SELECT 
    id,
    title,
    week_date,
    weekly_meeting_id,
    status,
    priority,
    assignee
FROM public.action_items
WHERE week_date IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check weekly_decisions table
SELECT COUNT(*) as total_decisions FROM public.weekly_decisions;

-- 6. Show recent decisions
SELECT 
    id,
    title,
    week_date,
    weekly_meeting_id,
    impact_level
FROM public.weekly_decisions
ORDER BY created_at DESC
LIMIT 5;

-- 7. Current week's data
SELECT 
    date_trunc('week', CURRENT_DATE)::date as current_week_start,
    COUNT(*) as meetings_this_week
FROM public.weekly_meetings
WHERE week_date = date_trunc('week', CURRENT_DATE)::date;

-- 8. Check your user ID
SELECT auth.uid() as your_user_id;

-- 9. Check if you can see your own data
SELECT 
    COUNT(*) as your_meetings
FROM public.weekly_meetings
WHERE created_by = auth.uid();

-- 10. Check table permissions
SELECT 
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'authenticated'
AND table_schema = 'public'
AND table_name IN ('weekly_meetings', 'action_items', 'weekly_decisions')
ORDER BY table_name, privilege_type;