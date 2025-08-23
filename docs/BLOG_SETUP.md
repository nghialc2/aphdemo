# Blog Management Setup

## Database Migration

To set up the blog posts table in Supabase, run the following SQL migration:

```sql
-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
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

-- Enable RLS (Row Level Security)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

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

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON public.blog_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## How to Use

1. **For Public Users**: 
   - Visit `/blog` to view all blog posts
   - No login required for viewing

2. **For Admin (nghialc2@fsb.edu.vn)**:
   - Visit `/blog` and click "Admin Đăng nhập" 
   - Sign in with Google OAuth
   - Once logged in as admin, you can:
     - ➕ **Add new posts**: Click "Thêm Bài Viết" button
     - ✏️ **Edit posts**: Click edit icon on any post
     - 🗑️ **Delete posts**: Click trash icon on any post

## Features

- **Database Persistence**: All blog posts are stored in Supabase
- **Admin Security**: Only nghialc2@fsb.edu.vn can create/edit/delete posts
- **Real-time Updates**: Changes appear immediately for all users
- **Responsive Design**: Works on all device sizes
- **Form Validation**: Required fields are validated before saving
- **Loading States**: Shows loading indicators during operations
- **Error Handling**: Displays user-friendly error messages

## Database Schema

- `id`: Auto-incrementing primary key
- `title`: Blog post title (required)
- `excerpt`: Blog post description (required)  
- `category`: Post category (required)
- `author_name`: Author's name (required)
- `author_avatar`: URL to author's avatar image (optional)
- `author_initials`: Auto-generated from author name
- `image_url`: URL to post's featured image (optional)
- `featured`: Boolean flag for featured posts
- `created_at`: Timestamp when post was created
- `updated_at`: Timestamp when post was last updated
- `created_by`: UUID of user who created the post

## Security

- Row Level Security (RLS) enabled
- Public read access for all blog posts
- Write access restricted to admin email only
- Google OAuth authentication required for admin functions