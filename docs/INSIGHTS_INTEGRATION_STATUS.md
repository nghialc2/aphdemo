# InsightsLM Integration Status

## ✅ Integration Complete

The InsightsLM system has been successfully integrated into the main APH application.

### Current Status: **RUNNING** on port 8080

## Key Changes Made:

### 1. **Component Migration** ✅
- Copied all InsightsLM components to main project:
  - `/src/components/dashboard/` - Dashboard UI components
  - `/src/components/notebook/` - Notebook interface components  
  - `/src/components/chat/` - Chat and messaging components

### 2. **Service & Hook Migration** ✅
- Created `/src/hooks/insights/` for all InsightsLM hooks
- Created `/src/services/insights/` for authentication service
- Created `/src/types/insights/` for message types
- Created `/src/integrations/supabase/insights/` for database client

### 3. **Import Path Fixes** ✅
All imports have been updated to use correct paths:
- Auth imports: `@/hooks/useAuth` (main APH auth)
- Supabase client: `@/integrations/supabase/insights/client`
- Message types: `@/types/insights/message`
- All hooks: `@/hooks/insights/*`

### 4. **Routing Integration** ✅
New protected routes added to main App.tsx:
```typescript
/insights - InsightsLM Dashboard
/insights/notebook/:id - Individual Notebook view
```

### 5. **Authentication Unified** ✅
- InsightsLM now uses main APH authentication system
- Same `@fsb.edu.vn` Google OAuth
- Shared session management
- Login redirect support: `/login?redirect=insights`

## Database Configuration

InsightsLM uses a **separate Supabase project** for data storage:
- **Main APH**: Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **InsightsLM**: Uses `VITE_INSIGHTS_SUPABASE_URL` and `VITE_INSIGHTS_SUPABASE_ANON_KEY`

This ensures data isolation while sharing authentication.

## How to Access InsightsLM

1. **Start the application**: 
   ```bash
   npm run dev
   ```
   
2. **Navigate to InsightsLM**:
   - Open browser to `http://localhost:8080/insights`
   - Login with your `@fsb.edu.vn` Google account
   - You'll be redirected to the InsightsLM dashboard

3. **Available Features**:
   - Create and manage notebooks
   - Upload documents (PDF, text, audio)
   - Chat with AI about your documents
   - Generate audio podcasts
   - Save notes and insights

## Troubleshooting

### If InsightsLM doesn't load:

1. **Check environment variables** in `.env`:
   ```
   VITE_INSIGHTS_SUPABASE_URL=your_insights_project_url
   VITE_INSIGHTS_SUPABASE_ANON_KEY=your_insights_anon_key
   ```

2. **Ensure database migration** has been run in your InsightsLM Supabase project

3. **Check N8N workflows** are configured (required for full functionality):
   - Document processing
   - Chat functionality  
   - Audio generation

4. **Verify authentication** works:
   - Login with `@fsb.edu.vn` email
   - Check browser console for auth errors

## Architecture Overview

```
Main APH App (port 8080)
├── /aph-lab - Main APH Lab interface
├── /documentation - Documentation system  
├── /insights - InsightsLM Dashboard ← NEW
│   ├── Uses separate Supabase project
│   ├── Shares APH authentication
│   └── /notebook/:id - Notebook interface
└── Other APH routes...
```

## Next Steps

To fully enable all InsightsLM features:

1. ✅ **Database**: Ensure Supabase migration is run
2. ⚠️ **N8N Workflows**: Configure all 6 workflows 
3. ⚠️ **API Keys**: Add OpenAI/Gemini keys to N8N
4. ⚠️ **Edge Functions**: Configure Supabase secrets

The core integration is complete and the app is running. Additional configuration is needed for AI features to work.