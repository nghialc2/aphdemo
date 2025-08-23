import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SimpleGoogleSheetsImporter } from '@/components/task-tracking/SimpleGoogleSheetsImporter';
import { supabase } from '@/integrations/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Calendar, 
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Upload,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WeeklyData {
  id: string;
  week_date: string;
  title: string;
  attendees: string[];
  agenda_items: string[];
  total_action_items: number;
  completed_action_items: number;
  total_decisions: number;
  imported_at: string;
  action_items: ActionItem[];
  decisions: Decision[];
}

interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  priority: string;
  status: string;
  due_date?: string;
}

interface Decision {
  id: string;
  title: string;
  description?: string;
  impact_level: string;
}

export default function SimpleWeeklyDashboard() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [currentWeek, setCurrentWeek] = useState('');
  const navigate = useNavigate();

  // Get current week's Monday
  const getWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    return monday.toISOString().split('T')[0];
  };

  useEffect(() => {
    const weekStart = getWeekStart();
    setCurrentWeek(weekStart);
    loadWeeklyData(weekStart);
  }, []);

  const loadWeeklyData = async (weekDate: string) => {
    setLoading(true);
    try {
      // Get weekly meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('weekly_meetings')
        .select('*')
        .eq('week_date', weekDate)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (meetingError && meetingError.code !== 'PGRST116') {
        console.error('Error loading meeting:', meetingError);
        setWeeklyData(null);
        return;
      }

      if (!meeting) {
        setWeeklyData(null);
        return;
      }

      // Get action items
      const { data: actionItems, error: itemsError } = await supabase
        .from('action_items')
        .select('*')
        .eq('weekly_meeting_id', meeting.id)
        .order('priority', { ascending: false });

      if (itemsError) {
        console.error('Error loading action items:', itemsError);
      }

      // Get decisions
      const { data: decisions, error: decisionsError } = await supabase
        .from('weekly_decisions')
        .select('*')
        .eq('weekly_meeting_id', meeting.id)
        .order('impact_level', { ascending: false });

      if (decisionsError) {
        console.error('Error loading decisions:', decisionsError);
      }

      setWeeklyData({
        ...meeting,
        action_items: actionItems || [],
        decisions: decisions || []
      });

    } catch (error) {
      console.error('Error loading weekly data:', error);
      setWeeklyData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (data: any[], sheetName: string) => {
    try {
      console.log('Importing data:', data, 'Sheet:', sheetName);

      // Extract week date from sheet name
      const weekMatch = sheetName.match(/(\d{4}-\d{2}-\d{2})/);
      const weekDate = weekMatch ? weekMatch[1] : currentWeek;

      // Get Monday of the week
      const inputDate = new Date(weekDate);
      const monday = new Date(inputDate);
      monday.setDate(inputDate.getDate() - inputDate.getDay() + 1);
      const weekStartDate = monday.toISOString().split('T')[0];

      // Prepare data
      const attendees = [...new Set(data.map(item => item.assignee).filter(Boolean))];
      const agendaItems = data.filter(item => item.type?.toLowerCase() === 'agenda').map(item => item.content);
      const actionItemsData = data.filter(item => item.type?.toLowerCase() === 'action item' && item.content?.trim());
      const decisionsData = data.filter(item => item.type?.toLowerCase() === 'decision' && item.content?.trim());

      console.log('Processed data:', {
        weekStartDate,
        attendees: attendees.length,
        agendaItems: agendaItems.length,
        actionItems: actionItemsData.length,
        decisions: decisionsData.length
      });

      // Delete existing data for this week first
      const { error: deleteError } = await supabase
        .from('weekly_meetings')
        .delete()
        .eq('week_date', weekStartDate);

      if (deleteError) {
        console.log('No existing data to delete or delete failed:', deleteError);
      }

      // Create weekly meeting with simplified data
      const meetingPayload = {
        week_date: weekStartDate,
        title: sheetName,
        meeting_type: 'weekly_standup',
        attendees: attendees,
        agenda_items: agendaItems,
        total_action_items: actionItemsData.length,
        completed_action_items: actionItemsData.filter(i => i.status?.toLowerCase() === 'done').length,
        total_decisions: decisionsData.length,
        source_type: 'google_sheets',
        created_by: 'anonymous'
      };

      console.log('Creating meeting with payload:', meetingPayload);

      const { data: meetingData, error: meetingError } = await supabase
        .from('weekly_meetings')
        .insert([meetingPayload])
        .select()
        .single();

      if (meetingError) {
        console.error('Error creating meeting:', meetingError);
        alert(`Failed to import meeting data: ${meetingError.message}`);
        return;
      }

      console.log('Meeting created successfully:', meetingData);

      // Create action items
      console.log(`Creating ${actionItemsData.length} action items...`);
      for (const item of actionItemsData) {
        const { error: itemError } = await supabase
          .from('action_items')
          .insert([{
            title: item.content,
            assignee: item.assignee || null,
            due_date: item.dueDate || null,
            priority: item.priority?.toLowerCase() || 'medium',
            status: item.status?.toLowerCase() === 'done' ? 'done' : 'backlog',
            week_date: weekStartDate,
            weekly_meeting_id: meetingData.id,
            created_by: 'anonymous'
          }]);
        
        if (itemError) {
          console.error('Error creating action item:', itemError, item);
        }
      }

      // Create decisions  
      console.log(`Creating ${decisionsData.length} decisions...`);
      for (const item of decisionsData) {
        const { error: decisionError } = await supabase
          .from('weekly_decisions')
          .insert([{
            weekly_meeting_id: meetingData.id,
            week_date: weekStartDate,
            title: item.content,
            description: item.notes || null,
            impact_level: item.priority?.toLowerCase() || 'medium',
            status: 'decided',
            created_by: 'anonymous'
          }]);
        
        if (decisionError) {
          console.error('Error creating decision:', decisionError, item);
        }
      }

      console.log('Import completed successfully');
      setShowImporter(false);
      
      // Reload data
      await loadWeeklyData(weekStartDate);
      setCurrentWeek(weekStartDate);
      
      alert('Data imported successfully!');

    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import data. Please try again.');
    }
  };

  const formatWeekRange = (weekDate: string) => {
    const start = new Date(weekDate);
    const end = new Date(weekDate);
    end.setDate(end.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'done': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading weekly data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/explore')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Explore
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <img 
                    src="/logo_FSB_new.png" 
                    alt="FSB Logo" 
                    className="h-8 cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => navigate('/explore')}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-gray-900 text-white px-2 py-1 text-sm">
                  Trở về trang chủ
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Weekly Dashboard</h2>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weekly Report</h1>
            <p className="text-gray-600 mt-2">
              Week of {formatWeekRange(currentWeek)}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => loadWeeklyData(currentWeek)} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowImporter(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import Google Sheets
            </Button>
          </div>
        </div>

        {/* Content */}
        {!weeklyData ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Data for This Week</h3>
            <p className="text-gray-600 mb-6">
              Import your Google Sheets data to see weekly reports here.
            </p>
            <Button onClick={() => setShowImporter(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Meeting Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {weeklyData.title}
                </CardTitle>
                <CardDescription>
                  Imported on {new Date(weeklyData.imported_at).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Attendees */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Attendees ({weeklyData.attendees.length})</h4>
                    <div className="space-y-2">
                      {weeklyData.attendees.map((attendee, idx) => (
                        <div key={idx} className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">{attendee}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Agenda */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Agenda ({weeklyData.agenda_items.length})</h4>
                    <div className="space-y-2">
                      {weeklyData.agenda_items.map((item, idx) => (
                        <div key={idx} className="text-sm text-gray-600">
                          • {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Action Items:</span>
                        <span className="text-sm font-medium">
                          {weeklyData.completed_action_items}/{weeklyData.total_action_items}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Decisions:</span>
                        <span className="text-sm font-medium">{weeklyData.total_decisions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Completion Rate:</span>
                        <span className="text-sm font-medium">
                          {weeklyData.total_action_items > 0 
                            ? Math.round((weeklyData.completed_action_items / weeklyData.total_action_items) * 100)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Items */}
            {weeklyData.action_items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Action Items ({weeklyData.action_items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weeklyData.action_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3 flex-1">
                          {getStatusIcon(item.status)}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.title}</p>
                            {item.assignee && (
                              <p className="text-xs text-gray-600">
                                Assigned to: {item.assignee}
                                {item.due_date && ` • Due: ${new Date(item.due_date).toLocaleDateString()}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                          <Badge variant="outline">
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Decisions */}
            {weeklyData.decisions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Decisions ({weeklyData.decisions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weeklyData.decisions.map((decision) => (
                      <div key={decision.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{decision.title}</h4>
                            {decision.description && (
                              <p className="text-xs text-gray-600 mt-1">{decision.description}</p>
                            )}
                          </div>
                          <Badge variant="outline" className={`ml-2 ${getPriorityColor(decision.impact_level)}`}>
                            {decision.impact_level} impact
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Google Sheets Importer Modal */}
      {showImporter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Import Google Sheets Data</h3>
              <Button variant="ghost" onClick={() => setShowImporter(false)}>
                ✕
              </Button>
            </div>
            
            <Alert className="mb-4">
              <AlertDescription>
                Paste your Google Sheets URL below. The sheet should follow the template format with columns: Type, Content, Assignee, Due Date, Priority, Status, Notes.
              </AlertDescription>
            </Alert>
            
            <SimpleGoogleSheetsImporter 
              onImportComplete={handleImport}
            />
          </div>
        </div>
      )}
    </div>
  );
}