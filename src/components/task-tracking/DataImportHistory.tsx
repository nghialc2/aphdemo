import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Database,
  FileText,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Eye,
  Trash2
} from 'lucide-react';

interface ImportRecord {
  id: string;
  week_date: string;
  title: string;
  source_type: string;
  imported_at: string;
  total_action_items: number;
  completed_action_items: number;
  total_decisions: number;
  attendees: string[];
  created_at: string;
}

interface DataImportHistoryProps {
  onRefresh?: () => void;
}

export const DataImportHistory: React.FC<DataImportHistoryProps> = ({ onRefresh }) => {
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImport, setSelectedImport] = useState<ImportRecord | null>(null);

  useEffect(() => {
    fetchImportHistory();
  }, []);

  const fetchImportHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all imported weekly meetings
      const { data, error } = await supabase
        .from('weekly_meetings')
        .select('*')
        .eq('source_type', 'google_sheets')
        .order('imported_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setImports(data || []);
    } catch (err) {
      console.error('Error fetching import history:', err);
      setError('Failed to load import history');
    } finally {
      setLoading(false);
    }
  };

  const deleteImport = async (importId: string) => {
    if (!confirm('Are you sure you want to delete this import and all associated data?')) {
      return;
    }

    try {
      // Delete the weekly meeting (cascades to related records)
      const { error } = await supabase
        .from('weekly_meetings')
        .delete()
        .eq('id', importId);

      if (error) throw error;

      // Refresh the list
      await fetchImportHistory();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error deleting import:', err);
      alert('Failed to delete import');
    }
  };

  const formatWeekRange = (weekDate: string) => {
    const start = new Date(weekDate);
    const end = new Date(weekDate);
    end.setDate(end.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getCompletionRate = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading import history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Import History
            </CardTitle>
            <CardDescription>
              Google Sheets imports and data persistence verification
            </CardDescription>
          </div>
          <Button onClick={fetchImportHistory} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {imports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No imports found</p>
            <p className="text-sm text-gray-400 mt-1">
              Import data from Google Sheets to see history here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {imports.map((importRecord) => (
              <div 
                key={importRecord.id} 
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-sm">{importRecord.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatWeekRange(importRecord.week_date)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-lg font-semibold text-blue-600">
                          {importRecord.attendees?.length || 0}
                        </p>
                        <p className="text-xs text-gray-600">Attendees</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-lg font-semibold text-green-600">
                          {importRecord.completed_action_items}/{importRecord.total_action_items}
                        </p>
                        <p className="text-xs text-gray-600">Actions</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <p className="text-lg font-semibold text-purple-600">
                          {importRecord.total_decisions}
                        </p>
                        <p className="text-xs text-gray-600">Decisions</p>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <p className="text-lg font-semibold text-orange-600">
                          {getCompletionRate(importRecord.completed_action_items, importRecord.total_action_items)}%
                        </p>
                        <p className="text-xs text-gray-600">Completion</p>
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-gray-500">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      Imported {new Date(importRecord.imported_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedImport(importRecord)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteImport(importRecord.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Import Stats */}
        {imports.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-sm text-gray-700 mb-3">Import Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-xl font-bold text-gray-700">{imports.length}</p>
                <p className="text-xs text-gray-600">Total Imports</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-xl font-bold text-gray-700">
                  {imports.reduce((sum, i) => sum + i.total_action_items, 0)}
                </p>
                <p className="text-xs text-gray-600">Total Actions</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-xl font-bold text-gray-700">
                  {imports.reduce((sum, i) => sum + i.total_decisions, 0)}
                </p>
                <p className="text-xs text-gray-600">Total Decisions</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-xl font-bold text-gray-700">
                  {[...new Set(imports.flatMap(i => i.attendees || []))].length}
                </p>
                <p className="text-xs text-gray-600">Unique Members</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Selected Import Details Modal */}
      {selectedImport && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImport(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedImport.title}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedImport(null)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Week</p>
                <p className="text-sm">{formatWeekRange(selectedImport.week_date)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Attendees</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedImport.attendees?.map((attendee, idx) => (
                    <Badge key={idx} variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {attendee}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedImport.total_action_items}
                  </p>
                  <p className="text-xs text-gray-600">Action Items</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <p className="text-2xl font-bold text-green-600">
                    {selectedImport.completed_action_items}
                  </p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedImport.total_decisions}
                  </p>
                  <p className="text-xs text-gray-600">Decisions</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Imported on {new Date(selectedImport.imported_at).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Record ID: {selectedImport.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};