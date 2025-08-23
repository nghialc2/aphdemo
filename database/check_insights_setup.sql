-- ============================================================================
-- CHECK EXISTING INSIGHTSLM DATABASE SETUP
-- Run this first to see what already exists
-- ============================================================================

-- Check if tables exist
SELECT 
    'notebooks' as table_name, 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notebooks') as exists
UNION ALL
SELECT 
    'sources', 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sources')
UNION ALL
SELECT 
    'notes', 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes')
UNION ALL
SELECT 
    'documents', 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents')
UNION ALL
SELECT 
    'n8n_chat_histories', 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'n8n_chat_histories');

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('notebooks', 'sources', 'notes', 'documents', 'n8n_chat_histories');

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('notebooks', 'sources', 'notes', 'documents', 'n8n_chat_histories')
ORDER BY tablename, policyname;