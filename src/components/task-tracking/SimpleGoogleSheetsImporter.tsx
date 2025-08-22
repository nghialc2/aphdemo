import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Calendar,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';
import { googleSheetsService } from '@/services/googleSheetsAPI';
import { GoogleSheetsStatus } from './GoogleSheetsStatus';

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

interface SimpleGoogleSheetsImporterProps {
  onImportComplete?: (data: MeetingMinutesRow[], sheetName: string) => void;
}

export const SimpleGoogleSheetsImporter: React.FC<SimpleGoogleSheetsImporterProps> = ({ onImportComplete }) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [importedData, setImportedData] = useState<MeetingMinutesRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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
            'Or use CSV upload method below.'
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
        setLastUpdated(new Date().toISOString());
        
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
      
      if (columns.length >= 3) { // At least class, type and content
        rows.push({
          class: columns[0] || 'Other',
          type: columns[1] || '',
          content: columns[2] || '',
          assignee: columns[3] || '',
          dueDate: columns[4] || '',
          priority: columns[5] || '',
          status: columns[6] || '',
          notes: columns[7] || ''
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
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in progress': 
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default: 
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Check */}
      <GoogleSheetsStatus />
      
      {/* Import Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Import Meeting Minutes
          </CardTitle>
          <CardDescription>
            Import your team's collaborative meeting minutes from Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Import Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sheet-url">Google Sheets URL</Label>
              <Input
                id="sheet-url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>
            <div>
              <Label htmlFor="sheet-name">Meeting Name (Optional)</Label>
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
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Import from Google Sheets
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => document.getElementById('csv-upload')?.click()}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Upload CSV File
            </Button>
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

      {/* Preview Imported Data */}
      {importedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
            <CardDescription>
              {importedData.length} items imported successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastUpdated && (
              <div className="flex items-center mb-4 p-2 bg-green-50 rounded-lg">
                <Clock className="h-4 w-4 mr-2 text-green-700" />
                <span className="text-sm text-green-700">Imported: {new Date(lastUpdated).toLocaleString()}</span>
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
            
            <Alert className="mt-4">
              <Check className="h-4 w-4" />
              <AlertDescription>
                Data imported successfully! The meeting minutes have been processed and are ready for use in your Task & Tracking dashboard.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};