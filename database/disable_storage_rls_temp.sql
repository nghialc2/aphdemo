-- Temporary script to disable RLS on storage for testing
-- WARNING: This reduces security - only use for testing!

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Temporarily disable RLS on storage.objects (CAUTION!)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- To re-enable later, run:
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Check if there are any existing policies
SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';

-- Create a simple permissive policy for testing
CREATE POLICY "Allow all for testing" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'sources')
WITH CHECK (bucket_id = 'sources');

-- Re-enable RLS with the permissive policy
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;