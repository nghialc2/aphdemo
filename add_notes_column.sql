-- ============================================================================
-- ADD NOTES COLUMN TO ACTION_ITEMS TABLE
-- Run this to add the missing notes field
-- ============================================================================

-- Add notes column to action_items table
ALTER TABLE public.action_items 
ADD COLUMN IF NOT EXISTS notes text;

-- Update the table comment
COMMENT ON COLUMN public.action_items.notes IS 'Additional notes or details for the action item';

-- Grant permissions for the new column
GRANT ALL ON public.action_items TO anon, authenticated;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'action_items'
AND column_name = 'notes';