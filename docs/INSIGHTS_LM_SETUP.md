# InsightsLM Setup Guide

## Overview

InsightsLM is an open-source NotebookLM alternative that provides AI-powered document analysis, chat functionality, and podcast generation. It's currently set up as a standalone system in the `insights-lm-public/` directory of this project.

## Current Status

The InsightsLM system is **partially configured** but requires several setup steps to be functional.

## Architecture

- **Frontend**: React + TypeScript + Vite + shadcn/ui
- **Backend**: Supabase (Database, Auth, Storage) + N8N (Workflow Automation)
- **AI Services**: OpenAI GPT + Gemini APIs
- **Vector Database**: Supabase with pgvector extension

## Required Services Setup

### 1. Supabase Configuration

**Status**: ❌ **Not Configured**

#### Requirements:
- Create a Supabase project at [supabase.com](https://supabase.com)
- Run the database migration from `supabase/migrations/20250606152423_v0.1.sql`
- Configure environment variables in `.env`:
  ```
  VITE_SUPABASE_URL=your_supabase_project_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

#### Database Schema:
- ✅ Migration file exists with complete schema
- ✅ Includes: profiles, notebooks, sources, notes, documents tables
- ✅ Vector embeddings support with pgvector
- ✅ Row Level Security (RLS) policies
- ✅ Storage buckets for files and audio

### 2. N8N Workflow Automation

**Status**: ❌ **Not Configured**

#### Requirements:
- Set up N8N instance (self-hosted or cloud)
- Import 6 workflow files from `n8n/` directory:
  1. `InsightsLM___Extract_Text.json` - Document text extraction
  2. `InsightsLM___Generate_Notebook_Details.json` - Notebook metadata generation  
  3. `InsightsLM___Upsert_to_Vector_Store.json` - Vector embeddings storage
  4. `InsightsLM___Process_Additional_Sources.json` - Additional source processing
  5. `InsightsLM___Chat.json` - Chat functionality
  6. `InsightsLM___Podcast_Generation.json` - Audio/podcast generation

#### Easy Import Option:
- Use `Import_Insights_LM_Workflows.json` to auto-import all workflows
- This workflow downloads and creates all other workflows automatically

### 3. Supabase Edge Functions Secrets

**Status**: ❌ **Not Configured**

Configure these secrets in Supabase Dashboard → Edge Functions → Secrets:

```
NOTEBOOK_CHAT_URL - N8N webhook URL for chat
NOTEBOOK_GENERATION_URL - N8N webhook URL for notebook generation  
AUDIO_GENERATION_WEBHOOK_URL - N8N webhook URL for audio generation
DOCUMENT_PROCESSING_WEBHOOK_URL - N8N webhook URL for document processing
ADDITIONAL_SOURCES_WEBHOOK_URL - N8N webhook URL for additional sources
NOTEBOOK_GENERATION_AUTH - Password for N8N webhook authentication
OPENAI_API_KEY - OpenAI API key for GPT models
```

### 4. AI Service APIs

**Status**: ❌ **Not Configured**

#### Required API Keys:
- **OpenAI API Key** - For GPT models and embeddings
- **Google Gemini API Key** - Alternative AI model
- Both keys need to be configured in N8N workflows

## Setup Steps

### Step 1: Environment Setup
1. Copy `.env.example` to `.env` in `insights-lm-public/` directory
2. Fill in Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 2: Database Setup
1. Create new Supabase project
2. Enable pgvector extension in SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "vector";
   ```
3. Run the migration file: `supabase/migrations/20250606152423_v0.1.sql`

### Step 3: N8N Setup
1. Set up N8N instance (recommend n8n.cloud for simplicity)
2. Import workflow using `Import_Insights_LM_Workflows.json`
3. Configure credentials in each workflow:
   - Supabase connection
   - OpenAI API key
   - Gemini API key
   - Webhook authentication

### Step 4: Supabase Secrets Configuration
1. Go to Supabase Dashboard → Edge Functions → Secrets
2. Add all required secrets (listed above)
3. Get webhook URLs from your N8N workflows

### Step 5: Run the Application
```bash
cd insights-lm-public/
npm install
npm run dev
```

The application will be available at `http://localhost:8080`

## Key Features (Once Configured)

- ✅ **Document Upload** - PDF, text, audio file support
- ✅ **AI Chat** - Chat with your documents using RAG
- ✅ **Source Citations** - Verifiable references to source material  
- ✅ **Notebook Organization** - Organize sources into themed notebooks
- ✅ **Podcast Generation** - Generate audio discussions from sources
- ✅ **Vector Search** - Semantic search through document content
- ✅ **Multi-user Support** - User authentication and data isolation

## Integration with Main APH Demo App

**Status**: ❌ **Not Integrated**

Currently, InsightsLM exists as a standalone application. To integrate with the main APH demo:

### Option 1: Route Integration
Add routes to main app (`src/App.tsx`) to render InsightsLM pages:
```typescript
// Add routes for /insights, /insights/notebook/:id etc.
```

### Option 2: Iframe/Microfrontend
Embed InsightsLM as iframe or microfrontend in main app

### Option 3: Shared Components
Extract useful components from InsightsLM for use in main app:
- PDF viewer
- Chat interface
- File upload components

## Next Steps

1. **Immediate**: Set up Supabase project and configure environment variables
2. **Short-term**: Configure N8N workflows and test basic functionality  
3. **Medium-term**: Integrate with main APH demo application
4. **Long-term**: Customize UI/features for your specific use case

## Support

- Original documentation: `insights-lm-public/README.md`
- Video walkthrough: https://www.youtube.com/watch?v=IXJEGjfZRBE
- GitHub issues: https://github.com/theaiautomators/insights-lm-public/issues

## Security Notes

- All API keys should be kept secure and not committed to git
- Supabase RLS policies provide data isolation between users
- N8N workflows should use secure webhook authentication
- File uploads are restricted by mime type and size limits