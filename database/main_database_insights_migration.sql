-- ============================================================================
-- DOCUMENTATION/INSIGHTS TABLES FOR MAIN DATABASE
-- Run this in your MAIN Supabase database (klsjwhmybgjhlcjwjset)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

-- Create enum types
DO $$ BEGIN
    CREATE TYPE source_type AS ENUM ('pdf', 'text', 'website', 'youtube', 'audio');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Create notebooks table
CREATE TABLE IF NOT EXISTS public.notebooks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    color text DEFAULT 'gray',
    icon text DEFAULT '📝',
    generation_status text DEFAULT 'completed',
    audio_overview_generation_status text,
    audio_overview_url text,
    audio_url_expires_at timestamp with time zone,
    example_questions text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create sources table
CREATE TABLE IF NOT EXISTS public.sources (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    notebook_id uuid NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    title text NOT NULL,
    type source_type NOT NULL,
    url text,
    file_path text,
    file_size bigint,
    display_name text,
    content text,
    summary text,
    processing_status text DEFAULT 'pending',
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    notebook_id uuid NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    source_type text DEFAULT 'user',
    extracted_text text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create documents table for vector embeddings
CREATE TABLE IF NOT EXISTS public.documents (
    id bigserial PRIMARY KEY,
    content text,
    metadata jsonb,
    embedding vector(1536)
);

-- Create chat table
CREATE TABLE IF NOT EXISTS public.n8n_chat_histories (
  id serial not null,
  session_id uuid not null,
  message jsonb not null,
  constraint n8n_chat_histories_pkey primary key (id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON public.notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_updated_at ON public.notebooks(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sources_notebook_id ON public.sources(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notes_notebook_id ON public.notes(notebook_id);
CREATE INDEX IF NOT EXISTS idx_chat_histories_session_id ON public.n8n_chat_histories(session_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Users can create their own notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Users can update their own notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Users can delete their own notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Users can manage sources in their notebooks" ON public.sources;
DROP POLICY IF EXISTS "Users can manage notes in their notebooks" ON public.notes;
DROP POLICY IF EXISTS "Users can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Users can manage their chat histories" ON public.n8n_chat_histories;

-- Notebooks policies
CREATE POLICY "Users can view their own notebooks" ON public.notebooks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notebooks" ON public.notebooks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notebooks" ON public.notebooks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notebooks" ON public.notebooks
    FOR DELETE USING (auth.uid() = user_id);

-- Sources policies
CREATE POLICY "Users can manage sources in their notebooks" ON public.sources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.notebooks 
            WHERE notebooks.id = sources.notebook_id 
            AND notebooks.user_id = auth.uid()
        )
    );

-- Notes policies
CREATE POLICY "Users can manage notes in their notebooks" ON public.notes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.notebooks 
            WHERE notebooks.id = notes.notebook_id 
            AND notebooks.user_id = auth.uid()
        )
    );

-- Documents policies
CREATE POLICY "Users can manage documents" ON public.documents
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Chat histories policies
CREATE POLICY "Users can manage their chat histories" ON public.n8n_chat_histories
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- UPDATE TRIGGERS
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

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_notebooks_updated_at ON public.notebooks;
DROP TRIGGER IF EXISTS update_sources_updated_at ON public.sources;
DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;

-- Create triggers
CREATE TRIGGER update_notebooks_updated_at
    BEFORE UPDATE ON public.notebooks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sources_updated_at
    BEFORE UPDATE ON public.sources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();