-- ============================================================================
-- UPDATE WEEKLY TABLES TO SUPPORT DISCUSSIONS AND RAW DATA
-- Run this to add support for discussion items
-- ============================================================================

-- Add new columns to weekly_meetings table
ALTER TABLE public.weekly_meetings 
ADD COLUMN IF NOT EXISTS total_discussions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS raw_data jsonb;

-- Update the table comment
COMMENT ON COLUMN public.weekly_meetings.total_discussions IS 'Number of discussion items in the meeting';
COMMENT ON COLUMN public.weekly_meetings.raw_data IS 'Raw imported data from Google Sheets for processing all item types';

-- Grant permissions for new columns
GRANT ALL ON public.weekly_meetings TO anon, authenticated;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'weekly_meetings'
AND column_name IN ('total_discussions', 'raw_data');