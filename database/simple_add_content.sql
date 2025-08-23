-- Simplest migration - just add the content column
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS content TEXT;