import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileSpreadsheet, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Calendar,
  Users,
  Target,
  Zap,
  Clock
} from 'lucide-react';
import { googleSheetsService } from '@/services/googleSheetsAPI';
import { GoogleSheetsStatus } from './GoogleSheetsStatus';

interface MeetingMinutesRow {
  type: string;
  content: string;
  assignee: string;
  dueDate: string;
  priority: string;
  status: string;
  notes: string;
}

interface GoogleSheetsImporterProps {
  onImportComplete?: (data: MeetingMinutesRow[], sheetName: string) => void;
}

export const GoogleSheetsImporter: React.FC<GoogleSheetsImporterProps> = ({ onImportComplete }) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [importedData, setImportedData] = useState<MeetingMinutesRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [availableSheets, setAvailableSheets] = useState<{sheetName: string; date: string; itemCount: number}[]>([]);

  // Extract sheet ID from Google Sheets URL
  const extractSheetId = (url: string): string | null => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  // Import using Google Sheets API
  const importFromGoogleSheets = async () => {
    if (!sheetUrl.trim()) {
      setError('Please enter a Google Sheets URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await googleSheetsService.importMeetingMinutes(
        sheetUrl, 
        sheetName || undefined
      );
      
      setImportedData(result.data);
      setLastUpdated(result.lastUpdated);
      
      if (onImportComplete) {
        onImportComplete(result.data, result.sheetName);
      }
    } catch (err) {
      console.error('Import error:', err);
      if (err instanceof Error) {
        if (err.message.includes('API key not configured')) {
          setError(
            'Google Sheets API not configured.\n\n' +
            'Please follow these steps:\n' +
            '1. Get an API key from Google Cloud Console\n' +
            '2. Add VITE_GOOGLE_SHEETS_API_KEY=your_key to your .env file\n' +
            '3. Restart your development server\n\n' +
            'See GOOGLE_SHEETS_API_SETUP.md for detailed instructions.'
          );
        } else if (err.message.includes('403') || err.message.includes('permission')) {
          setError(
            'Permission denied. Please make sure:\n\n' +
            '1. Your Google Sheet is publicly accessible\n' +
            '2. Share → Anyone with the link can view\n' +
            '3. The sheet URL is correct'
          );
        } else {
          setError(`Import failed: ${err.message}`);
        }
      } else {
        setError('Failed to import from Google Sheets');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load available weekly sheets
  const loadAvailableSheets = async () => {
    if (!sheetUrl.trim()) return;

    try {
      const sheetId = extractSheetId(sheetUrl);
      if (!sheetId) return;

      const sheets = await googleSheetsService.getWeeklySheets(sheetId);
      setAvailableSheets(sheets);
    } catch (error) {
      console.warn('Failed to load available sheets:', error);
    }
  };

  // Auto-sync functionality
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (autoSync && sheetUrl.trim()) {
      googleSheetsService.pollForChanges(
        sheetUrl,
        (newData) => {
          setImportedData(newData);
          setLastUpdated(new Date().toISOString());
          if (onImportComplete) {
            onImportComplete(newData, sheetName || 'Auto-synced Sheet');
          }
        },
        30000 // Poll every 30 seconds
      ).then((cleanupFn) => {
        cleanup = cleanupFn;
      });
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [autoSync, sheetUrl, sheetName, onImportComplete]);

  // Handle CSV file upload
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const parsedData = parseCSVToMeetingMinutes(csvText);
        
        setImportedData(parsedData);
        if (onImportComplete) {
          onImportComplete(parsedData, sheetName || file.name.replace('.csv', ''));
        }
      } catch (err) {
        setError('Failed to parse CSV file. Please check the format.');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read CSV file.');
      setLoading(false);
    };

    reader.readAsText(file);
  };

  // Parse CSV data to meeting minutes format
  const parseCSVToMeetingMinutes = (csvText: string): MeetingMinutesRow[] => {
    const lines = csvText.split('\n');
    const rows: MeetingMinutesRow[] = [];

    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Better CSV parsing that handles quoted values
      const columns = parseCSVLine(line);
      
      if (columns.length >= 2) { // At least type and content
        rows.push({
          type: columns[0] || '',
          content: columns[1] || '',
          assignee: columns[2] || '',
          dueDate: columns[3] || '',
          priority: columns[4] || '',
          status: columns[5] || '',
          notes: columns[6] || ''
        });
      }
    }

    return rows.filter(row => row.content.trim()); // Only include rows with content
  };

  // Better CSV parsing that handles quoted values
  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'agenda': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'discussion': return 'bg-green-100 text-green-800 border-green-200';
      case 'action item': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'decision': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done': 
      case 'completed': 
        return <Check className="h-4 w-4 text-green-600" />;
      case 'in progress': 
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default: 
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const generateTemplateUrl = () => {
    // This would be your actual template Google Sheets URL
    return 'https://docs.google.com/spreadsheets/d/TEMPLATE_ID/edit#gid=0';
  };

  return (
    <div className="space-y-6">
      {/* Status Check */}
      <GoogleSheetsStatus />
      
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Import Meeting Minutes from Google Sheets
          </CardTitle>
          <CardDescription>
            Import collaborative meeting minutes from your team's Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Instructions */}
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Instructions:</strong>
              <div className="space-y-3">
                <p><strong>Setup Requirements:</strong></p>
                <ol className="list-decimal list-inside ml-4 space-y-1 text-sm">
                  <li>Set up Google Sheets API credentials (see below)</li>
                  <li>Create a Google Sheet with columns: Type | Content | Assignee | Due Date | Priority | Status | Notes</li>
                  <li>Make the sheet accessible (public or share with service account)</li>
                  <li>Use weekly sheet names like "Week-2025-08-21"</li>
                </ol>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>API Setup Required:</strong> To use automatic import and sync, you need to configure Google Sheets API credentials.
                    Add <code>VITE_GOOGLE_SHEETS_API_KEY</code> to your .env file.
                  </AlertDescription>
                </Alert>
              </div>
            </AlertDescription>
          </Alert>

          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium">Download Template</h4>
              <p className="text-sm text-gray-600">Get started with our pre-configured template</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.open(generateTemplateUrl(), '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Use Template
            </Button>
          </div>

          {/* Import Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sheet-url">Google Sheets URL*</Label>
              <Input
                id="sheet-url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>
            <div>
              <Label htmlFor="sheet-name">Meeting Name</Label>
              <Input
                id="sheet-name"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="e.g., Weekly Standup - Aug 21, 2025"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="whitespace-pre-line">{error}</div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex space-x-2">
              <Button 
                onClick={importFromGoogleSheets} 
                disabled={loading || !sheetUrl.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import from URL
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => document.getElementById('csv-upload')?.click()}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
              <Button 
                variant="outline"
                onClick={loadAvailableSheets}
                disabled={loading || !sheetUrl.trim()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Sheets
              </Button>
            </div>

            {/* Auto-sync toggle */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Auto-sync every 30 seconds</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="sr-only peer"
                  disabled={!sheetUrl.trim()}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          {/* Hidden CSV file input */}
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Available Sheets */}
      {availableSheets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Weekly Sheets</CardTitle>
            <CardDescription>Select a specific week to import</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {availableSheets.map((sheet) => (
                <div key={sheet.sheetName} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="font-medium text-sm">{sheet.sheetName}</h4>
                    <p className="text-xs text-gray-600">
                      {sheet.date} • {sheet.itemCount} items
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSheetName(sheet.sheetName);
                      importFromGoogleSheets();
                    }}
                    disabled={loading}
                  >
                    Import
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Imported Data */}
      {importedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Imported Data</CardTitle>
            <CardDescription>
              {importedData.length} items imported from Google Sheets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastUpdated && (
              <div className="flex items-center justify-between mb-4 p-2 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 text-green-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Last updated: {new Date(lastUpdated).toLocaleString()}</span>
                </div>
                {autoSync && (
                  <Badge className="bg-green-100 text-green-800">
                    <Zap className="h-3 w-3 mr-1" />
                    Auto-syncing
                  </Badge>
                )}
              </div>
            )}
            <div className="space-y-3">
              {importedData.map((row, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    <Badge className={getTypeColor(row.type)}>
                      {row.type}
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{row.content}</h4>
                      {row.assignee && (
                        <p className="text-xs text-gray-600 flex items-center mt-1">
                          <Users className="h-3 w-3 mr-1" />
                          {row.assignee}
                          {row.dueDate && (
                            <>
                              <Calendar className="h-3 w-3 ml-3 mr-1" />
                              {row.dueDate}
                            </>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {row.priority && (
                      <Badge className={getPriorityColor(row.priority)} variant="outline">
                        {row.priority}
                      </Badge>
                    )}
                    {row.status && (
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(row.status)}
                        <span className="text-xs text-gray-600">{row.status}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {importedData.filter(row => row.type.toLowerCase() === 'action item').length}
                </div>
                <div className="text-sm text-gray-600">Action Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importedData.filter(row => row.status?.toLowerCase() === 'done').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {importedData.filter(row => row.priority?.toLowerCase() === 'high' || row.priority?.toLowerCase() === 'critical').length}
                </div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};