// Browser-compatible Google Sheets API client
// Using direct REST API calls instead of googleapis library

interface GoogleSheetsResponse {
  values?: string[][];
}

interface SheetInfo {
  properties: {
    title: string;
    sheetId: number;
  };
}

interface MeetingMinutesRow {
  class: string;
  type: string;
  content: string;
  assignee: string;
  dueDate: string;
  priority: string;
  status: string;
  notes: string;
}

class GoogleSheetsService {
  private apiKey: string | null = null;
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || null;
  }

  private async makeRequest(url: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Google Sheets API key not configured. Please set VITE_GOOGLE_SHEETS_API_KEY in your environment variables.');
    }

    const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}key=${this.apiKey}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Sheets API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Extract spreadsheet ID and sheet name from Google Sheets URL
   */
  private parseSheetUrl(url: string): { spreadsheetId: string; sheetName?: string } | null {
    try {
      // Handle different URL formats:
      // https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=123
      // https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=123&range=A1:G100
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) return null;

      const spreadsheetId = match[1];

      // Try to extract sheet name from URL fragment
      let sheetName: string | undefined;
      const gidMatch = url.match(/#gid=(\d+)/);
      const rangeMatch = url.match(/[#&]range=([^&]+)/);
      
      if (rangeMatch) {
        // Extract sheet name from range (e.g., "Week-2025-08-21!A1:G100")
        const rangeParts = decodeURIComponent(rangeMatch[1]).split('!');
        if (rangeParts.length > 1) {
          sheetName = rangeParts[0];
        }
      }

      return { spreadsheetId, sheetName };
    } catch (error) {
      console.error('Error parsing sheet URL:', error);
      return null;
    }
  }

  /**
   * Get sheet metadata to find sheet names and gids
   */
  async getSheetMetadata(spreadsheetId: string): Promise<{ title: string; sheetId: number; sheetName: string }[]> {
    try {
      const url = `${this.baseUrl}/${spreadsheetId}?fields=sheets(properties(title,sheetId))`;
      const response = await this.makeRequest(url);

      return response.sheets?.map((sheet: SheetInfo) => ({
        title: sheet.properties?.title || '',
        sheetId: sheet.properties?.sheetId || 0,
        sheetName: sheet.properties?.title || '',
      })) || [];
    } catch (error) {
      console.error('Error getting sheet metadata:', error);
      throw error;
    }
  }

  /**
   * Read data from a specific sheet
   */
  async readSheetData(
    spreadsheetId: string, 
    sheetName?: string, 
    range: string = 'A:H'
  ): Promise<string[][]> {
    try {
      const fullRange = sheetName ? `${sheetName}!${range}` : range;
      const encodedRange = encodeURIComponent(fullRange);
      
      const url = `${this.baseUrl}/${spreadsheetId}/values/${encodedRange}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;
      const response: GoogleSheetsResponse = await this.makeRequest(url);

      return response.values || [];
    } catch (error) {
      console.error('Error reading sheet data:', error);
      throw error;
    }
  }

  /**
   * Import meeting minutes from Google Sheets URL
   */
  async importMeetingMinutes(url: string, targetSheetName?: string): Promise<{
    data: MeetingMinutesRow[];
    sheetName: string;
    lastUpdated: string;
  }> {
    const parsed = this.parseSheetUrl(url);
    if (!parsed) {
      throw new Error('Invalid Google Sheets URL');
    }

    const { spreadsheetId } = parsed;

    // If no specific sheet name provided, try to find weekly sheets
    let sheetName = targetSheetName || parsed.sheetName;
    
    if (!sheetName) {
      // Get all sheets and find the most recent weekly sheet
      const sheets = await this.getSheetMetadata(spreadsheetId);
      const weeklySheets = sheets
        .filter(s => s.sheetName.match(/week-?\d{4}-\d{2}-\d{2}/i))
        .sort((a, b) => b.sheetName.localeCompare(a.sheetName)); // Sort by date descending
      
      if (weeklySheets.length > 0) {
        sheetName = weeklySheets[0].sheetName;
      } else {
        // Fallback to first sheet
        sheetName = sheets[0]?.sheetName || 'Sheet1';
      }
    }

    // Read the data
    const rawData = await this.readSheetData(spreadsheetId, sheetName);
    
    if (rawData.length === 0) {
      throw new Error('No data found in the sheet');
    }

    // Skip header row and convert to MeetingMinutesRow format
    // New column structure: Class, Type, Content, Assignee, Due Date, Priority, Status, Notes
    const data: MeetingMinutesRow[] = rawData
      .slice(1) // Skip header
      .filter(row => row.length > 2 && row[2]?.toString().trim()) // Must have content (column C)
      .map(row => ({
        class: row[0]?.toString() || 'Other',  // Column A: Class
        type: row[1]?.toString() || '',        // Column B: Type
        content: row[2]?.toString() || '',     // Column C: Content
        assignee: row[3]?.toString() || '',    // Column D: Assignee
        dueDate: row[4]?.toString() || '',     // Column E: Due Date
        priority: row[5]?.toString() || '',    // Column F: Priority
        status: row[6]?.toString() || '',      // Column G: Status
        notes: row[7]?.toString() || '',       // Column H: Notes
      }));

    return {
      data,
      sheetName,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get all weekly meeting sheets from a spreadsheet
   */
  async getWeeklySheets(spreadsheetId: string): Promise<{
    sheetName: string;
    date: string;
    itemCount: number;
  }[]> {
    const sheets = await this.getSheetMetadata(spreadsheetId);
    const weeklySheets = sheets.filter(s => 
      s.sheetName.match(/week-?\d{4}-\d{2}-\d{2}/i)
    );

    const results = [];
    for (const sheet of weeklySheets) {
      try {
        const data = await this.readSheetData(spreadsheetId, sheet.sheetName);
        const itemCount = data.slice(1).filter(row => 
          row.length > 2 && row[2]?.toString().trim()  // Content is now in column C
        ).length;

        // Extract date from sheet name
        const dateMatch = sheet.sheetName.match(/(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : '';

        results.push({
          sheetName: sheet.sheetName,
          date,
          itemCount,
        });
      } catch (error) {
        console.warn(`Failed to read sheet ${sheet.sheetName}:`, error);
      }
    }

    return results.sort((a, b) => b.date.localeCompare(a.date));
  }

  /**
   * Set up polling for sheet changes (basic implementation)
   */
  async pollForChanges(
    url: string,
    callback: (data: MeetingMinutesRow[]) => void,
    intervalMs: number = 30000 // 30 seconds
  ): Promise<() => void> {
    let lastData: string = '';
    let isPolling = true;

    const poll = async () => {
      if (!isPolling) return;

      try {
        const result = await this.importMeetingMinutes(url);
        const currentData = JSON.stringify(result.data);
        
        if (currentData !== lastData) {
          lastData = currentData;
          callback(result.data);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }

      if (isPolling) {
        setTimeout(poll, intervalMs);
      }
    };

    // Start polling
    poll();

    // Return cleanup function
    return () => {
      isPolling = false;
    };
  }
}

export const googleSheetsService = new GoogleSheetsService();
export type { MeetingMinutesRow };