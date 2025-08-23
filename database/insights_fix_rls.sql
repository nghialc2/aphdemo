-- ============================================================================
-- FIX RLS POLICIES FOR INSIGHTSLM DATABASE
-- This allows users from the main database to access InsightsLM
-- Run this in your InsightsLM Supabase database (taquqwsckvpoxnooamlm)
-- ============================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Users can create their own notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Users can update their own notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Users can delete their own notebooks" ON public.notebooks;

-- Create more permissive policies that check for any authenticated user
-- and store the user_id from the token (even if not in local auth.users)

-- For notebooks, we'll allow any authenticated user to create/manage their notebooks
CREATE POLICY "Authenticated users can view their notebooks" ON public.notebooks
    FOR SELECT USING (
        auth.jwt() ->> 'sub' IS NOT NULL 
        AND (
            user_id::text = (auth.jwt() ->> 'sub')
            OR user_id IS NULL
        )
    );

CREATE POLICY "Authenticated users can create notebooks" ON public.notebooks
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'sub' IS NOT NULL
    );

CREATE POLICY "Authenticated users can update their notebooks" ON public.notebooks
    FOR UPDATE USING (
        auth.jwt() ->> 'sub' IS NOT NULL 
        AND user_id::text = (auth.jwt() ->> 'sub')
    );

CREATE POLICY "Authenticated users can delete their notebooks" ON public.notebooks
    FOR DELETE USING (
        auth.jwt() ->> 'sub' IS NOT NULL 
        AND user_id::text = (auth.jwt() ->> 'sub')
    );

-- Alternative: Temporarily disable RLS (less secure but simpler for testing)
-- Uncomment these lines if the above doesn't work:
-- ALTER TABLE public.notebooks DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.sources DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.n8n_chat_histories DISABLE ROW LEVEL SECURITY;