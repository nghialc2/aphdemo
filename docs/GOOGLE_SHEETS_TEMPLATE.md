# Google Sheets Meeting Minutes Template

## Setup Instructions

### 1. Create Your Google Sheets File
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: "Team Meeting Minutes - 2025"

### 2. Set Up the Template Structure

#### Main Sheet Headers (Row 1):
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Type | Content | Assignee | Due Date | Priority | Status | Notes |

#### Column Details:
- **Type**: Agenda, Discussion, Action Item, Decision
- **Content**: Description of the item
- **Assignee**: Person responsible (for action items)
- **Due Date**: YYYY-MM-DD format (for action items)
- **Priority**: Low, Medium, High, Critical
- **Status**: Pending, In Progress, Done
- **Notes**: Additional details

### 3. Create Weekly Sheets
For each week, create a new sheet tab:
- **Sheet Name Format**: `Week-YYYY-MM-DD`
- **Examples**: 
  - `Week-2025-08-21`
  - `Week-2025-08-28`
  - `Week-2025-09-04`

### 4. Sample Data Structure

#### Example Sheet: "Week-2025-08-21"
```
Type          | Content                    | Assignee    | Due Date   | Priority | Status      | Notes
Agenda        | Review Q3 goals           |             |            |          |             | 
Discussion    | New hiring process        |             |            |          |             | Team feedback positive
Action Item   | Update project timeline   | John Doe    | 2025-08-25 | High     | In Progress | 
Action Item   | Review budget allocation  | Jane Smith  | 2025-08-30 | Medium   | Pending     | 
Decision      | Approved remote work policy|            |            |          | Done        | Effective Sept 1
```

### 5. Make Sheet Public
1. Click "Share" button (top right)
2. Change access to "Anyone with the link can view"
3. Copy the sharing link

### 6. Import to Application

#### Method 1: CSV Upload (Recommended)
1. In your Google Sheet, go to **File → Download → Comma-separated values (.csv)**
2. Save the CSV file to your computer
3. Open the Task & Tracking dashboard
4. Click "Import from Sheets" button
5. Click "Upload CSV" and select your downloaded file
6. Enter the meeting name and import

#### Method 2: Direct URL (May have CORS issues)
1. Make sure your sheet is publicly accessible
2. Copy the Google Sheets URL
3. Open the Task & Tracking dashboard
4. Click "Import from Sheets" button
5. Paste the URL and click "Import from URL"

**Note**: Method 1 (CSV Upload) is more reliable due to browser security restrictions.

## Tips for Effective Use

### Color Coding (Optional)
You can add conditional formatting in Google Sheets:
- **Action Items**: Orange background
- **Decisions**: Purple background
- **High Priority**: Red text
- **Completed**: Green background

### Collaboration Best Practices
1. **Real-time editing**: Multiple people can edit simultaneously
2. **Comments**: Use Google Sheets comments for discussions
3. **Version history**: Track changes with Google Sheets revision history
4. **Notifications**: Set up email notifications for changes

### Data Validation
Add dropdown lists for consistency:
- **Type**: Agenda, Discussion, Action Item, Decision
- **Priority**: Low, Medium, High, Critical  
- **Status**: Pending, In Progress, Done

## Template URLs

### Master Template
Use this template to get started:
```
https://docs.google.com/spreadsheets/d/1TEMPLATE_ID_HERE/edit#gid=0
```

### Quick Start Steps
1. **Copy template** → Make a copy for your team
2. **Rename** → "Team Meeting Minutes - 2025"
3. **Share** → Make publicly viewable
4. **Create weekly sheets** → One per meeting
5. **Import** → Use the app to import data

## Automation Ideas

### Future Enhancements
- **Google Apps Script**: Auto-create weekly sheets
- **Zapier Integration**: Auto-import to other tools
- **Calendar Integration**: Link to Google Calendar events
- **Slack Notifications**: Auto-post summaries to Slack

This system gives you:
✅ **Real-time collaboration** (Google Sheets native)
✅ **Free solution** (no subscriptions needed)
✅ **Familiar interface** (everyone knows Sheets)
✅ **Data portability** (easy import/export)
✅ **Version control** (Google Sheets history)
✅ **Mobile access** (Google Sheets mobile app)