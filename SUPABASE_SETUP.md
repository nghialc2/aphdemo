# Supabase Setup for Exercise Management

## Database Migration

To set up the required tables for exercise management, you need to run the SQL commands in `supabase_migration.sql` in your Supabase database.

### Steps:

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to "SQL Editor"

2. **Run Migration**
   - Copy the contents of `supabase_migration.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Verify Tables Created**
   After running the migration, you should have these new tables:
   - `exercises` - Stores exercise data
   - `exercise_content_edits` - Stores exercise content modifications
   - `instruction_content_edits` - Stores instruction content modifications

### Tables Structure:

#### `exercises` table:
- `id` (TEXT, PRIMARY KEY) - Exercise identifier
- `title` (TEXT) - Exercise title
- `description` (TEXT) - Exercise description
- `exercise_type` (TEXT) - Type: 'basic', 'pdf', 'drive-link'
- `pdf_url` (TEXT) - URL to PDF file
- `file_name` (TEXT) - PDF file name
- `drive_link` (TEXT) - Google Drive link
- `custom_title` (TEXT) - Custom title for content
- `border_color` (TEXT) - Border color for UI
- `display_order` (INTEGER) - Order for sorting
- `created_at`, `updated_at` - Timestamps
- `created_by`, `updated_by` - User references

#### `exercise_content_edits` table:
- `id` (UUID, PRIMARY KEY)
- `exercise_id` (TEXT) - Reference to exercise
- `edit_data` (JSONB) - Content modification data
- `created_at`, `updated_at` - Timestamps
- `created_by` - User reference

#### `instruction_content_edits` table:
- `id` (UUID, PRIMARY KEY)  
- `component_id` (TEXT) - Component identifier
- `edit_data` (JSONB) - Content modification data
- `created_at`, `updated_at` - Timestamps
- `created_by` - User reference

### Permissions:

The migration sets up Row Level Security (RLS) policies:
- **Everyone** can read exercises and content edits
- **Only admins** can create, update, delete exercises and content edits
- Admin status is determined by `users.role = 'admin'`

### First Time Setup:

When you first load the app after the migration:
1. The app will detect an empty exercises table
2. It will automatically populate it with default exercises from `ExercisesData.tsx`
3. All future changes will be saved to the database

### Data Flow:

- **Local Development**: Data is loaded from/saved to Supabase
- **Production**: Data is loaded from/saved to Supabase
- **Fallback**: If database is unavailable, app uses default data (read-only)

### Benefits of Supabase Storage:

✅ **Persistent across deployments** - Data survives app updates
✅ **Shared between admins** - All admins see the same exercises  
✅ **Real-time sync** - Changes are immediately saved
✅ **Backup/restore** - Database backups protect your data
✅ **User tracking** - Know who created/modified exercises