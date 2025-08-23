# Fix Weekly Tracking Database Errors

## Problem
You're seeing these errors:
- `404` error for `weekly_meetings` table (table doesn't exist)
- `400` error for `action_items` query (missing `week_date` column)
- `401` errors for authentication/permissions

## Solution

### Step 1: Apply Database Schema Fix

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the ENTIRE contents of `apply_weekly_tracking.sql`
5. Click **Run** button
6. You should see "Success. No rows returned" message

### Step 2: Verify Tables Were Created

Run this verification query in SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('weekly_meetings', 'weekly_decisions', 'weekly_blockers', 'llm_analysis', 'strategic_metrics')
ORDER BY table_name;
```

You should see all 5 tables listed.

### Step 3: Verify Action Items Column

Run this query to check if week_date was added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'action_items' 
AND column_name IN ('week_date', 'weekly_meeting_id');
```

You should see both columns listed.

### Step 4: Test the Application

1. Refresh your application
2. Navigate to Task & Tracking Dashboard
3. Select "Weekly View"
4. The errors should be gone

### Step 5: Import Test Data

1. Click "Import Weekly Data" button
2. Paste your Google Sheets URL
3. The data should import successfully
4. Check the "Import History" section to verify

## If You Still See Errors

### Authentication Issues (401 errors)
If you see 401 errors:
1. Log out and log back in
2. Make sure your user has proper permissions
3. Check that RLS policies were applied correctly

### Missing Tables (404 errors)
If tables are still missing:
1. Check you're in the correct Supabase project
2. Make sure the SQL script ran without errors
3. Try running the migration directly from `supabase/migrations/` folder

### Invalid Queries (400 errors)
If you see 400 errors:
1. The columns might not have been added
2. Re-run just the ALTER TABLE commands from the SQL script

## Testing the Fix

After applying the fix, test these features:

1. **Weekly View**: Should display without errors
2. **Google Sheets Import**: Should save data to database
3. **LLM Analysis**: Should trigger after import (if OpenAI key is configured)
4. **Import History**: Should show all imported data

## Need Help?

If issues persist:
1. Check browser console for specific error messages
2. Check Supabase logs (Dashboard > Logs > API)
3. Verify your `.env` file has correct Supabase credentials