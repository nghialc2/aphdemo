import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Key,
  FileSpreadsheet
} from 'lucide-react';

export const GoogleSheetsStatus: React.FC = () => {
  const hasApiKey = !!import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSpreadsheet className="h-5 w-5 mr-2" />
          Google Sheets Integration Status
        </CardTitle>
        <CardDescription>
          Current setup status for automatic Google Sheets import
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Key Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span className="text-sm font-medium">Google Sheets API Key</span>
          </div>
          <Badge className={hasApiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {hasApiKey ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Configured
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Not Set
              </>
            )}
          </Badge>
        </div>

        {/* Feature Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="font-medium text-green-700">✅ Available Features:</p>
            <ul className="space-y-1 text-gray-600">
              <li>• Manual CSV upload</li>
              <li>• Data preview</li>
              <li>• Action item parsing</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            {hasApiKey ? (
              <>
                <p className="font-medium text-green-700">✅ With API Key:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Direct URL import</li>
                  <li>• Auto-sync (30s)</li>
                  <li>• Multi-sheet support</li>
                  <li>• Real-time updates</li>
                </ul>
              </>
            ) : (
              <>
                <p className="font-medium text-amber-700">⚠️ Requires API Key:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Direct URL import</li>
                  <li>• Auto-sync updates</li>
                  <li>• Multi-sheet support</li>
                  <li>• Real-time collaboration</li>
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Setup Instructions */}
        {!hasApiKey && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>To enable automatic import:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
                  <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">Google Cloud Console <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                  <li>Create/select a project and enable Google Sheets API</li>
                  <li>Create an API key</li>
                  <li>Add <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_SHEETS_API_KEY=your_key</code> to your .env file</li>
                  <li>Restart your development server</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {hasApiKey && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              <strong>Google Sheets API configured!</strong> You can now use direct URL import and auto-sync features.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Capabilities Summary */}
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600">
            <strong>Current mode:</strong> {hasApiKey ? 'Full Integration' : 'Manual Upload Only'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {hasApiKey 
              ? 'Ready for real-time collaboration with Google Sheets' 
              : 'Use CSV upload for now, or set up API key for automatic features'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};