-- ============================================================================
-- FIX SOURCES RLS POLICIES FOR INSIGHTSLM DATABASE
-- This updates sources policies to match the notebook JWT-based auth pattern
-- Run this in your InsightsLM Supabase database
-- ============================================================================

-- Drop existing sources policies
DROP POLICY IF EXISTS "Users can view sources from their notebooks" ON public.sources;
DROP POLICY IF EXISTS "Users can create sources in their notebooks" ON public.sources;
DROP POLICY IF EXISTS "Users can update sources in their notebooks" ON public.sources;
DROP POLICY IF EXISTS "Users can delete sources from their notebooks" ON public.sources;
DROP POLICY IF EXISTS "Users can manage sources in their notebooks" ON public.sources;

-- Create new JWT-based policies that match the notebook policies

-- Sources SELECT policy
CREATE POLICY "Authenticated users can view sources from their notebooks"
    ON public.sources FOR SELECT
    USING (
        auth.jwt() ->> 'sub' IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.notebooks
            WHERE notebooks.id = sources.notebook_id
            AND (
                notebooks.user_id::text = (auth.jwt() ->> 'sub')
                OR notebooks.user_id IS NULL
            )
        )
    );

-- Sources INSERT policy
CREATE POLICY "Authenticated users can create sources in their notebooks"
    ON public.sources FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'sub' IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.notebooks
            WHERE notebooks.id = sources.notebook_id
            AND (
                notebooks.user_id::text = (auth.jwt() ->> 'sub')
                OR notebooks.user_id IS NULL
            )
        )
    );

-- Sources UPDATE policy
CREATE POLICY "Authenticated users can update sources in their notebooks"
    ON public.sources FOR UPDATE
    USING (
        auth.jwt() ->> 'sub' IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.notebooks
            WHERE notebooks.id = sources.notebook_id
            AND notebooks.user_id::text = (auth.jwt() ->> 'sub')
        )
    );

-- Sources DELETE policy
CREATE POLICY "Authenticated users can delete sources from their notebooks"
    ON public.sources FOR DELETE
    USING (
        auth.jwt() ->> 'sub' IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.notebooks
            WHERE notebooks.id = sources.notebook_id
            AND notebooks.user_id::text = (auth.jwt() ->> 'sub')
        )
    );

-- Also update notes, documents, and chat histories tables to use JWT pattern
-- Notes policies
DROP POLICY IF EXISTS "Users can manage notes in their notebooks" ON public.notes;
CREATE POLICY "Authenticated users can manage notes in their notebooks"
    ON public.notes FOR ALL
    USING (
        auth.jwt() ->> 'sub' IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.notebooks
            WHERE notebooks.id = notes.notebook_id
            AND notebooks.user_id::text = (auth.jwt() ->> 'sub')
        )
    );

-- Documents policies
DROP POLICY IF EXISTS "Users can manage documents" ON public.documents;
CREATE POLICY "Authenticated users can manage documents"
    ON public.documents FOR ALL
    USING (
        auth.jwt() ->> 'sub' IS NOT NULL
        AND metadata ->> 'user_id' = (auth.jwt() ->> 'sub')
    );

-- Chat histories policies
DROP POLICY IF EXISTS "Users can manage their chat histories" ON public.n8n_chat_histories;
CREATE POLICY "Authenticated users can manage their chat histories"
    ON public.n8n_chat_histories FOR ALL
    USING (
        auth.jwt() ->> 'sub' IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.notebooks
            WHERE notebooks.id = n8n_chat_histories.session_id
            AND notebooks.user_id::text = (auth.jwt() ->> 'sub')
        )
    );

-- Alternative: Temporarily disable RLS for testing (less secure)
-- Uncomment these lines if the above doesn't work:
-- ALTER TABLE public.sources DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.n8n_chat_histories DISABLE ROW LEVEL SECURITY;