-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT, -- Full content of the blog post
    category TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    author_initials TEXT,
    image_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Add content column if it doesn't exist
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Enable RLS (Row Level Security)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Everyone can view blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;

-- Create policy for public read access
CREATE POLICY "Everyone can view blog posts" ON public.blog_posts
    FOR SELECT USING (true);

-- Create policy for admin write access
CREATE POLICY "Admins can insert blog posts" ON public.blog_posts
    FOR INSERT WITH CHECK (
        auth.email() = 'nghialc2@fsb.edu.vn'
    );

CREATE POLICY "Admins can update blog posts" ON public.blog_posts
    FOR UPDATE USING (
        auth.email() = 'nghialc2@fsb.edu.vn'
    );

CREATE POLICY "Admins can delete blog posts" ON public.blog_posts
    FOR DELETE USING (
        auth.email() = 'nghialc2@fsb.edu.vn'
    );

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON public.blog_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial blog posts
INSERT INTO public.blog_posts (title, excerpt, category, author_name, author_avatar, author_initials, image_url, featured) VALUES
(
    'AI-Powered HRM: Transforming Workforce Management in 2025',
    'Discover how artificial intelligence is revolutionizing human resource management, from recruitment automation to employee engagement analytics. Learn the latest trends and best practices for implementing AI in your HR strategy.',
    'AI & Công nghệ',
    'Dr. Nguyễn Văn An',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'NA',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    true
),
(
    'Building Effective AI Training Programs for Business Leaders',
    'A comprehensive guide to designing and implementing AI literacy programs for executives and managers. Includes practical frameworks and real-world case studies from successful organizations.',
    'Giáo dục',
    'Lê Thị Minh',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    'LM',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=300&fit=crop',
    false
),
(
    'The Future of Business Education: Integrating AI into MBA Programs',
    'How top business schools are incorporating artificial intelligence into their curricula. Explore innovative teaching methods and the skills future business leaders need to succeed in an AI-driven world.',
    'Giáo dục Kinh doanh',
    'Prof. Trần Đức Huy',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'TH',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=300&fit=crop',
    false
);