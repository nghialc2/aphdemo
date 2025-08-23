# Admin System Setup Guide

This guide explains how to set up and use the admin functionality for the APH Demo application.

## Overview

The admin system allows the account `nghialc2@fsb.edu.vn` to upload and manage content for the application without needing to modify code. Content is automatically stored in the GitHub repository for version control and accessibility.

## Features

- **Admin Role**: Hardcoded admin access for `nghialc2@fsb.edu.vn`
- **Content Management**: Create, edit, and delete instructional content
- **File Upload**: Upload files that are automatically stored on GitHub
- **Content Types**: Support for documents, tutorials, exercises, and examples
- **GitHub Integration**: Automatic file storage in the GitHub repository

## Setup Instructions

### 1. Database Migration

Run the following SQL migration in your Supabase database:

```sql
-- Execute the contents of supabase_migration.sql
```

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
# GitHub Integration (for admin content upload)
VITE_GITHUB_TOKEN=your_github_personal_access_token
```

To create a GitHub token:
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with `repo` permissions
3. Copy the token and add it to your environment variables

### 3. GitHub Repository Structure

The admin system will create files in the following structure:
```
your-repo/
├── admin-content/
│   ├── Document_Title_2024-01-01T12-00-00.pdf
│   ├── Tutorial_Name_2024-01-01T12-30-00.md
│   └── ...
```

## Usage Guide

### Accessing Admin Dashboard

1. Login with the admin account: `nghialc2@fsb.edu.vn`
2. Click on your user avatar in the top-right corner
3. Select "Admin Dashboard" from the dropdown menu
4. Navigate to `/admin` route

### Creating Content

1. Click "Tạo nội dung mới" (Create New Content)
2. Fill in the form:
   - **Title**: Content title
   - **Content Type**: Select from document, tutorial, exercise, or example
   - **Content**: Main content (supports Markdown)
   - **File**: Optional file attachment
3. Click "Tạo mới" (Create)

### Managing Content

- **Edit**: Click the edit button on any content card
- **Delete**: Click the delete button and confirm
- **View Files**: Click the GitHub link to view uploaded files

### File Upload Process

When a file is uploaded:
1. File is converted to base64
2. Uploaded to GitHub repository via GitHub API
3. Stored in `admin-content/` directory
4. GitHub URL is saved in the database
5. File is accessible via direct GitHub link

## Supported File Types

- **Documents**: PDF, DOC, DOCX, TXT, MD
- **Images**: PNG, JPG, JPEG
- **Maximum size**: 10MB per file

## Security Features

- **Role-based access**: Only admin users can access admin features
- **Domain restriction**: Only `@fsb.edu.vn` emails can login
- **Database security**: Row Level Security (RLS) policies protect admin content
- **GitHub integration**: Files are stored in version-controlled repository

## Troubleshooting

### Admin Access Issues
- Ensure you're logged in with `nghialc2@fsb.edu.vn`
- Check database for correct role assignment
- Verify environment variables are set

### File Upload Issues
- Check GitHub token permissions
- Verify repository access
- Ensure file size is under 10MB
- Check browser console for error messages

### Database Issues
- Ensure migration has been run
- Check RLS policies are active
- Verify admin role is set in users table

## Technical Architecture

### Components
- `useAdmin.tsx`: Hook for checking admin status
- `useAdminContent.tsx`: Hook for content management
- `AdminDashboard.tsx`: Main admin interface
- `AdminPage.tsx`: Admin route component

### Database Schema
```sql
-- Users table (extended)
users {
  id: UUID,
  email: TEXT,
  role: TEXT, -- 'admin' for admin users
  created_at: TIMESTAMP
}

-- Admin content table
admin_content {
  id: UUID,
  title: TEXT,
  content: TEXT,
  content_type: TEXT,
  github_url: TEXT,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
  created_by: UUID -> users.id
}
```

### GitHub Integration
- Uses GitHub REST API v3
- Personal Access Token authentication
- Automatic commit messages
- Direct file access via download URLs

## Future Enhancements

Possible future improvements:
- Multiple admin users
- Content approval workflow  
- File versioning
- Content analytics
- Bulk content operations
- Content scheduling