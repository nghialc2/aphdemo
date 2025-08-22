-- ============================================================================
-- ADMIN USERS TABLE MIGRATION
-- Create users table for admin role management
-- ============================================================================

-- Create users table for admin role management (or add missing columns)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    role text DEFAULT 'user',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add missing columns if they don't exist
DO $$ BEGIN
    ALTER TABLE public.users ADD COLUMN full_name text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.users ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.users ADD COLUMN created_at timestamp with time zone DEFAULT timezone('utc'::text, now());
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
CREATE POLICY "Users can view all users"
    ON public.users FOR SELECT
    USING (true); -- Anyone can view user list

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Admins can update any user's role
DROP POLICY IF EXISTS "Admins can update user roles" ON public.users;
CREATE POLICY "Admins can update user roles"
    ON public.users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Add trigger for updated_at (only if updated_at column exists)
DO $$ BEGIN
    -- Check if updated_at column exists, then create trigger
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'updated_at' 
        AND table_schema = 'public'
    ) THEN
        DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
        CREATE TRIGGER trigger_users_updated_at
            BEFORE UPDATE ON public.users
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Insert or update default admin users
INSERT INTO public.users (id, email, role, full_name) 
SELECT 
    au.id,
    au.email,
    'admin',
    CASE au.email
        WHEN 'nghialc2@fsb.edu.vn' THEN 'Nghia LC'
        WHEN 'tungnt247@fsb.edu.vn' THEN 'Tung NT'
        WHEN 'thaonp70@fsb.edu.vn' THEN 'Thao NP'
        ELSE au.email
    END
FROM auth.users au
WHERE au.email IN ('nghialc2@fsb.edu.vn', 'tungnt247@fsb.edu.vn', 'thaonp70@fsb.edu.vn')
ON CONFLICT (id) DO UPDATE SET 
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);