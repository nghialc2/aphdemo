import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Users,
  Target,
  FileText,
  TrendingUp,
  Brain,
  Database,
  RefreshCw
} from 'lucide-react';

interface WeeklyMeeting {
  id: string;
  week_date: string;
  title: string;
  attendees: string[];
  agenda_items: string[];
  discussion_notes?: string;
  total_action_items: number;
  completed_action_items: number;
  total_decisions: number;
  total_blockers: number;
  source_type: string;
  imported_at?: string;
  team_mood?: string;
  energy_level?: number;
}

interface ActionItem {
  id: string;
  title: string;
  assignee?: string;
  priority: string;
  status: string;
  due_date?: string;
  week_date: string;
}

interface Decision {
  id: string;
  title: string;
  description?: string;
  impact_level?: string;
  week_date: string;
}

interface WeeklyReportViewProps {
  selectedWeek?: string;
  onRefresh?: () => void;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({ 
  selectedWeek, 
  onRefresh 
}) => {
  const [weeklyMeetings, setWeeklyMeetings] = useState<WeeklyMeeting[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeekDate, setSelectedWeekDate] = useState<string>('');

  // Get Monday of current week or selected week
  const getWeekStart = (date: Date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    const weekDate = selectedWeek || getWeekStart();
    setSelectedWeekDate(weekDate);
    fetchWeeklyData(weekDate);
  }, [selectedWeek]);
  
  // Also refetch when onRefresh prop changes
  useEffect(() => {
    if (onRefresh) {
      fetchWeeklyData(selectedWeekDate);
    }
  }, [onRefresh]);

  const fetchWeeklyData = async (weekDate: string) => {
    setLoading(true);
    setError(null);
    
    console.log(`Fetching weekly data for date: ${weekDate}`);

    try {
      // Fetch weekly meetings
      const { data: meetings, error: meetingsError } = await supabase
        .from('weekly_meetings')
        .select('*')
        .eq('week_date', weekDate)
        .order('created_at', { ascending: false });

      if (meetingsError) {
        console.error('Error fetching weekly meetings:', meetingsError);
        throw meetingsError;
      }
      
      console.log(`Found ${meetings?.length || 0} weekly meetings`);
      setWeeklyMeetings(meetings || []);

      // Fetch action items for the week
      const { data: items, error: itemsError } = await supabase
        .from('action_items')
        .select('*')
        .eq('week_date', weekDate)
        .order('priority', { ascending: true });

      if (itemsError) throw itemsError;
      setActionItems(items || []);

      // Fetch decisions for the week
      const { data: decs, error: decsError } = await supabase
        .from('weekly_decisions')
        .select('*')
        .eq('week_date', weekDate)
        .order('impact_level', { ascending: false });

      if (decsError) throw decsError;
      setDecisions(decs || []);

    } catch (err) {
      console.error('Error fetching weekly data:', err);
      setError('Failed to load weekly data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const calculateCompletionRate = () => {
    if (actionItems.length === 0) return 0;
    const completed = actionItems.filter(item => item.status === 'done').length;
    return Math.round((completed / actionItems.length) * 100);
  };

  const formatWeekRange = (weekDate: string) => {
    const start = new Date(weekDate);
    const end = new Date(weekDate);
    end.setDate(end.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading weekly report...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const hasData = weeklyMeetings.length > 0 || actionItems.length > 0 || decisions.length > 0;

  return (
    <div className="space-y-6">
      {/* Week Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-xl">
                <Calendar className="h-5 w-5 mr-2" />
                Week of {formatWeekRange(selectedWeekDate)}
              </CardTitle>
              <CardDescription className="mt-1">
                Weekly tracking and performance summary
              </CardDescription>
            </div>
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {!hasData ? (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            No data recorded for this week yet. Import from Google Sheets or create meeting minutes to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Weekly Meetings Summary */}
          {weeklyMeetings.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {weeklyMeetings.map((meeting) => (
                <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      <Badge variant="outline">
                        {meeting.source_type === 'google_sheets' ? (
                          <>
                            <FileText className="h-3 w-3 mr-1" />
                            Imported
                          </>
                        ) : (
                          'Manual'
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Attendees */}
                    <div className="flex items-start space-x-2">
                      <Users className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Attendees</p>
                        <p className="text-sm text-gray-800">
                          {meeting.attendees.join(', ') || 'No attendees recorded'}
                        </p>
                      </div>
                    </div>

                    {/* Agenda Items */}
                    {meeting.agenda_items && meeting.agenda_items.length > 0 && (
                      <div className="flex items-start space-x-2">
                        <Target className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600">Agenda</p>
                          <ul className="text-sm text-gray-800 space-y-1">
                            {meeting.agenda_items.map((item, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {meeting.completed_action_items}/{meeting.total_action_items}
                        </p>
                        <p className="text-xs text-gray-600">Actions Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {meeting.total_decisions}
                        </p>
                        <p className="text-xs text-gray-600">Decisions Made</p>
                      </div>
                    </div>

                    {/* Team Mood */}
                    {(meeting.team_mood || meeting.energy_level) && (
                      <div className="flex items-center justify-between pt-3 border-t">
                        {meeting.team_mood && (
                          <Badge className="capitalize">
                            Mood: {meeting.team_mood}
                          </Badge>
                        )}
                        {meeting.energy_level && (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-2">Energy:</span>
                            <Progress value={meeting.energy_level * 10} className="w-20 h-2" />
                            <span className="text-sm font-medium ml-2">{meeting.energy_level}/10</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Import Info */}
                    {meeting.imported_at && (
                      <p className="text-xs text-gray-500 pt-2 border-t">
                        Imported: {new Date(meeting.imported_at).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Action Items Summary */}
          {actionItems.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Action Items ({actionItems.length})
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Completion:</span>
                    <Progress value={calculateCompletionRate()} className="w-24 h-2" />
                    <span className="text-sm font-medium">{calculateCompletionRate()}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {actionItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
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
                      <Badge className={getPriorityColor(item.priority)} variant="outline">
                        {item.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Decisions Summary */}
          {decisions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Key Decisions ({decisions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {decisions.map((decision) => (
                    <div key={decision.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{decision.title}</h4>
                          {decision.description && (
                            <p className="text-xs text-gray-600 mt-1">{decision.description}</p>
                          )}
                        </div>
                        {decision.impact_level && (
                          <Badge variant="outline" className={getImpactColor(decision.impact_level)}>
                            {decision.impact_level} impact
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Week Stats Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Week Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {weeklyMeetings.length}
                  </p>
                  <p className="text-xs text-gray-600">Meetings</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {actionItems.filter(i => i.status === 'done').length}
                  </p>
                  <p className="text-xs text-gray-600">Completed Tasks</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {decisions.length}
                  </p>
                  <p className="text-xs text-gray-600">Decisions</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {[...new Set(actionItems.map(i => i.assignee).filter(Boolean))].length}
                  </p>
                  <p className="text-xs text-gray-600">Team Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};