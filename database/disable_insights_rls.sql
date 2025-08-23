-- ============================================================================
-- TEMPORARILY DISABLE RLS FOR INSIGHTSLM DATABASE
-- Run this in your InsightsLM Supabase database (taquqwsckvpoxnooamlm)
-- This will allow the app to work while we set up proper authentication
-- ============================================================================

-- Disable RLS on all InsightsLM tables
ALTER TABLE public.notebooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_chat_histories DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anonymous users (for API access)
GRANT ALL ON public.notebooks TO anon;
GRANT ALL ON public.sources TO anon;
GRANT ALL ON public.notes TO anon;
GRANT ALL ON public.documents TO anon;
GRANT ALL ON public.n8n_chat_histories TO anon;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- To re-enable RLS later (when you want to add security back):
-- ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;