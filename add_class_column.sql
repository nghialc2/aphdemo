-- ============================================================================
-- ADD CLASS COLUMN TO TABLES FOR PROJECT CATEGORIZATION
-- Run this to add the class field for project organization
-- ============================================================================

-- Add class column to action_items table
ALTER TABLE public.action_items 
ADD COLUMN IF NOT EXISTS class text;

-- Add class column to weekly_decisions table
ALTER TABLE public.weekly_decisions 
ADD COLUMN IF NOT EXISTS class text;

-- Update the table comments
COMMENT ON COLUMN public.action_items.class IS 'Project classification: MBA, MSE, LBM, CUD, FPUB, IR, Other Projects';
COMMENT ON COLUMN public.weekly_decisions.class IS 'Project classification: MBA, MSE, LBM, CUD, FPUB, IR, Other Projects';

-- Grant permissions for the new columns
GRANT ALL ON public.action_items TO anon, authenticated;
GRANT ALL ON public.weekly_decisions TO anon, authenticated;

-- Verify the changes
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('action_items', 'weekly_decisions')
AND column_name = 'class';