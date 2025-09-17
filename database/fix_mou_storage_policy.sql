-- Fix storage policies for MOU document uploads
-- This adds policies to allow MOU uploads to the sources bucket

-- Create a policy for MOU document uploads in the mou-documents folder
CREATE POLICY "Allow MOU document uploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'sources' AND 
  starts_with(name, 'mou-documents/') AND
  auth.role() = 'authenticated'
);

-- Create a policy for MOU document downloads
CREATE POLICY "Allow MOU document downloads" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'sources' AND 
  starts_with(name, 'mou-documents/') AND
  auth.role() = 'authenticated'
);

-- Create a policy for MOU document updates (if needed)
CREATE POLICY "Allow MOU document updates" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'sources' AND 
  starts_with(name, 'mou-documents/') AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'sources' AND 
  starts_with(name, 'mou-documents/') AND
  auth.role() = 'authenticated'
);

-- Create a policy for MOU document deletion (if needed)
CREATE POLICY "Allow MOU document deletion" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'sources' AND 
  starts_with(name, 'mou-documents/') AND
  auth.role() = 'authenticated'
);