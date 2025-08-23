# Google Sheets API Setup Guide

## Overview
To enable automatic import and real-time syncing with Google Sheets, you need to set up Google Sheets API credentials.

## Method 1: API Key (Recommended for Public Sheets)

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it something like "Meeting Minutes Integration"

### Step 2: Enable Google Sheets API
1. In Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Google Sheets API"
3. Click on "Google Sheets API" and click **Enable**

### Step 3: Create API Key
1. Go to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS > API key**
3. Copy the API key (it looks like: `AIzaSyC8_example_key_here`)
4. **Optional**: Click on the key to restrict it:
   - Application restrictions: HTTP referrers
   - Add your domain (e.g., `https://yourdomain.com/*`)
   - API restrictions: Select "Google Sheets API"

### Step 4: Add to Environment Variables
Add to your `.env` file:
```env
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyC8_example_key_here
```

### Step 5: Make Your Sheet Public
1. Open your Google Sheet
2. Click **Share** button
3. Change access to **"Anyone with the link can view"**
4. Copy the sharing link

## Method 2: Service Account (For Private Sheets)

### Step 1-2: Same as Method 1

### Step 3: Create Service Account
1. Go to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS > Service account**
3. Name: "Meeting Minutes Reader"
4. Click **Create and Continue**
5. Skip role assignment (click Continue)
6. Click **Done**

### Step 4: Create Service Account Key
1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key > Create new key**
4. Choose **JSON** format
5. Download the JSON file

### Step 5: Add to Environment Variables
Add the entire JSON content to your `.env` file:
```env
VITE_GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'
```

### Step 6: Share Sheet with Service Account
1. Open your Google Sheet
2. Click **Share** button  
3. Add the service account email (from the JSON file)
4. Give it "Viewer" access

## Usage Instructions

### 1. Sheet Structure
Create sheets with these columns:
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Type | Content | Assignee | Due Date | Priority | Status | Notes |

### 2. Weekly Sheet Naming
Name your sheet tabs like:
- `Week-2025-08-21`
- `Week-2025-08-28`  
- `Week-2025-09-04`

### 3. Import in Application
1. Open Task & Tracking Dashboard
2. Click "Import from Sheets"
3. Paste your Google Sheets URL
4. Click "Import from URL"
5. **Enable Auto-sync** for real-time updates!

## Features Enabled

### ✅ With API Setup:
- **Direct URL import** - No CSV downloads needed
- **Auto-sync** - Updates every 30 seconds automatically
- **Multi-sheet support** - Import from specific weekly sheets
- **Real-time collaboration** - Team edits show up automatically
- **Sheet selection** - Choose which week to import

### ❌ Without API Setup:
- Manual CSV upload only
- No automatic updates
- No multi-sheet support

## Security Notes

### API Key Method:
- ✅ Simple setup
- ✅ Good for public/team sheets  
- ⚠️ Anyone with key can access public sheets
- ⚠️ Key exposed in frontend code

### Service Account Method:
- ✅ More secure
- ✅ Works with private sheets
- ✅ Granular permissions
- ⚠️ More complex setup

## Troubleshooting

### Common Issues:

**"API key not found"**
- Check `.env` file has `VITE_GOOGLE_SHEETS_API_KEY`
- Restart your development server after adding env vars

**"Permission denied"**
- Make sure sheet is public (API key method)
- Or share with service account email (service account method)

**"Sheet not found"**
- Verify the Google Sheets URL is correct
- Check sheet name spelling (case sensitive)

**"No data found"**
- Ensure sheet has header row and data
- Check sheet tab name matches expected format

### Test Your Setup:
1. Create a test sheet with sample data
2. Try importing in the app
3. Enable auto-sync and make a change in the sheet
4. Verify changes appear in the app within 30 seconds

## Cost Information
- **Google Sheets API**: 100 requests/day/user for free
- **Typical usage**: 1-5 requests per import, 2 requests per auto-sync cycle
- **Estimated capacity**: Supports several teams with frequent updates

This setup enables seamless real-time collaboration between Google Sheets and your Task & Tracking dashboard! 🚀