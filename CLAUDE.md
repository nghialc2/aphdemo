# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Starts dev server on localhost:8080
npm run build        # Production build
npm run build:dev    # Development build with lovable-tagger
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Alternative with Bun
bun install && bun run dev
```

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui components, Tailwind CSS with FPT brand colors
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **State**: React Query + Context API
- **3D/Animations**: Spline, Framer Motion

### Core Modules

1. **Educational Platform** (`/src/components/instructions/`)
   - CEO/CIO/CTO learning tracks
   - Interactive AI tool tutorials (Gamma, GenSpark, HeyGen)
   - Exercise system with admin management

2. **Task Tracking System** (`/src/components/task-tracking/`)
   - Google Sheets integration for data import
   - Weekly reporting and meeting minutes
   - LLM analysis for insights

3. **InsightsLM** (`/src/components/insights/`, `/insights-lm-public/`)
   - Document analysis and chat interface
   - Audio generation and notebook management
   - Separate auth context (`useInsightsAuth`)

4. **Dashboards** (`/src/pages/*Dashboard.tsx`)
   - SimpleWeeklyDashboard, EnhancedWeeklyDashboard
   - ISODashboard, InternationalRelationsDashboard
   - TaskTrackingDashboard

### Database Structure

**Main Tables:**
- `admin_content`, `blog_posts` - Content management
- `exercises`, `exercise_completions` - Learning progress
- `weekly_tracking`, `weekly_reports` - Task tracking
- `notebooks`, `sources`, `messages` - InsightsLM data

**Supabase Edge Functions:**
- `send-chat-message` - LLM chat integration
- `process-document` - Document analysis
- `generate-notebook-content` - AI content generation
- `webhook-handler` - External integrations

### Authentication Pattern

Two separate auth systems:
```typescript
// Main app auth
import { useAuth } from '@/hooks/useAuth';

// InsightsLM auth (separate context)
import { useInsightsAuth } from '@/hooks/useInsightsAuth';
```

### FPT Brand Colors

```css
/* Applied via Tailwind classes */
fpt-blue: #1EAEDB     /* Primary */
fpt-orange: #F97316   /* CIO track */
fpt-green: #4CAF50    /* CTO track */
fpt-darkBlue: #0f5679 /* CEO track */
```

### File Organization

```
/database/     - SQL migrations and setup scripts
/docs/         - Documentation and setup guides
/config/       - Configuration files
/src/
  /components/
    /ui/       - shadcn components
    /task-tracking/
    /insights/
    /instructions/
  /pages/      - Route components
  /hooks/      - Custom React hooks
  /services/   - API services
  /integrations/supabase/ - Database client
```

### Environment Variables

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GOOGLE_SHEETS_API_KEY=  # For task tracking
```

### Development Notes

- Port 8080 is hardcoded in vite.config.ts
- Lovable platform integration present
- Multiple independent feature modules can be enabled/disabled
- RLS (Row Level Security) enabled on Supabase tables
- File uploads go to Supabase Storage buckets

###LOGO RULE: If added a logo somewhere in the app, remember: 
 - Instant tooltips: delayDuration={0} for immediate appearance
  - Vietnamese text: "Trở về trang chủ" on all logos
  - Consistent navigation: All logos navigate to /explore when clicked
  - Visual feedback: Hover effects (opacity change) and cursor pointer
  - Professional styling: Dark tooltip with white text for visibility