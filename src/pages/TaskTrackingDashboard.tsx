import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useTaskTracking } from '@/hooks/useTaskTracking';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuickActionsModal } from '@/components/task-tracking/QuickActionsModal';
import { MeetingMinutesForm } from '@/components/task-tracking/MeetingMinutesForm';
import { SimpleGoogleSheetsImporter } from '@/components/task-tracking/SimpleGoogleSheetsImporter';
import { LLMAnalysisWidget } from '@/components/task-tracking/LLMAnalysisWidget';
import { WeeklyReportView } from '@/components/task-tracking/WeeklyReportView';
import { DataImportHistory } from '@/components/task-tracking/DataImportHistory';
import { llmAnalysisService } from '@/services/llmAnalysisService';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { 
  Calendar, 
  Target, 
  Users, 
  TrendingUp, 
  Clock, 
  Plus,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  CalendarDays,
  FileText,
  ArrowLeft,
  LogIn,
  LogOut
} from 'lucide-react';


export default function TaskTrackingDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'weekly' | 'monthly' | 'quarterly'>('weekly');
  const navigate = useNavigate();
  const { kpis, upcomingMeetings, recentMeetings, actionItems, loading, error, refetch } = useTaskTracking(selectedTimeframe);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showGoogleSheetsImporter, setShowGoogleSheetsImporter] = useState(false);
  
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-600';
      case 'at_risk': return 'text-yellow-600';
      case 'blocked': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Auth check error:', error);
        }
        setUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        setShowAuth(false);
        refetch(); // Refresh data after login
      }
    });
    
    return () => subscription.unsubscribe();
  }, [refetch]);
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for verification link!');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setAuthLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Show auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Task & Tracking</h2>
            <p className="mt-2 text-gray-600">Sign in to access the dashboard</p>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={authLoading}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                >
                  {authMode === 'login' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading dashboard</div>
          <p className="text-gray-600">{error}</p>
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
              className="flex items-center"
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
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">R&D Hub</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button onClick={handleSignOut} variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task & Tracking Dashboard</h1>
              <p className="text-gray-600 mt-2">
                {selectedTimeframe === 'weekly' 
                  ? 'Weekly team reports with AI-powered insights and Google Sheets integration'
                  : 'Monitor team progress, meetings, and strategic goals'}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => setShowGoogleSheetsImporter(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Import Weekly Data
              </Button>
              <QuickActionsModal onSuccess={refetch}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Actions
                </Button>
              </QuickActionsModal>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex space-x-2 bg-white p-1 rounded-lg border inline-flex">
            {['weekly', 'monthly', 'quarterly'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} View
              </button>
            ))}
          </div>

          {/* Weekly Report View or KPI Cards */}
          {selectedTimeframe === 'weekly' ? (
            <WeeklyReportView onRefresh={refetch} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {kpis.length > 0 ? kpis.map((kpi, index) => {
                const progressPercentage = Math.round((kpi.current_value / kpi.target_value) * 100);
                const status = progressPercentage >= 90 ? 'on_track' : progressPercentage >= 70 ? 'at_risk' : 'blocked';
                return (
                  <Card key={kpi.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{kpi.metric_name}</CardTitle>
                      <Target className={`h-4 w-4 ${getStatusColor(status)}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {kpi.unit === 'usd' ? `$${kpi.current_value.toLocaleString()}` : `${kpi.current_value}${kpi.unit || ''}`}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        Target: {kpi.unit === 'usd' ? `$${kpi.target_value.toLocaleString()}` : `${kpi.target_value}${kpi.unit || ''}`}
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="text-xs text-gray-500 mt-1">{progressPercentage}% Complete</div>
                    </CardContent>
                  </Card>
                );
              }) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No KPIs found for {selectedTimeframe} timeframe. Create your first KPI to get started.
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Upcoming Meetings */}
            <Card className="xl:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Upcoming Meetings
                </CardTitle>
                <CardDescription>This week's scheduled meetings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingMeetings.length > 0 ? upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{meeting.title}</h4>
                      <div className="flex items-center text-xs text-gray-600 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(meeting.meeting_date).toLocaleDateString()}
                        <Users className="h-3 w-3 ml-3 mr-1" />
                        {meeting.attendees?.length || 0}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {meeting.meeting_type.replace('_', ' ')}
                    </Badge>
                  </div>
                )) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No upcoming meetings scheduled
                  </div>
                )}
                <QuickActionsModal onSuccess={refetch}>
                  <Button variant="outline" className="w-full mt-3">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </QuickActionsModal>
              </CardContent>
            </Card>

            {/* Action Items Status */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Action Items & Tasks
                </CardTitle>
                <CardDescription>Current team action items and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {actionItems.length > 0 ? actionItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3 flex-1">
                        {getTaskStatusIcon(item.status)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-gray-600">
                            Assigned to {item.assignee} • Due {new Date(item.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No action items found
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 mt-4">
                  <QuickActionsModal onSuccess={refetch}>
                    <Button variant="outline" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </QuickActionsModal>
                  <Button variant="outline" className="flex-1">
                    <PieChart className="h-4 w-4 mr-2" />
                    Kanban View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Meetings & Analytics */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Recent Meeting Minutes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Recent Meeting Minutes
                </CardTitle>
                <CardDescription>Latest team meetings and outcomes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentMeetings.length > 0 ? recentMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{meeting.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(meeting.meeting_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                )) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No recent meetings found
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowMeetingForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Minutes
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowGoogleSheetsImporter(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Import from Sheets
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Team Performance Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Team Performance Analytics
                </CardTitle>
                <CardDescription>Key metrics and trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">87%</div>
                    <div className="text-xs text-gray-600">Tasks On Time</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">4.2</div>
                    <div className="text-xs text-gray-600">Avg Meeting Rating</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">23</div>
                    <div className="text-xs text-gray-600">Goals Achieved</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">92%</div>
                    <div className="text-xs text-gray-600">Team Engagement</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* LLM Analysis Section */}
          <LLMAnalysisWidget onAnalysisComplete={refetch} />

          {/* Data Import History - Only show in weekly view */}
          {selectedTimeframe === 'weekly' && (
            <DataImportHistory onRefresh={refetch} />
          )}

          {/* Quick Actions Bar */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowMeetingForm(true)}>
                  📝 New Meeting Minutes
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowGoogleSheetsImporter(true)}>
                  📊 Import from Sheets
                </Button>
                <QuickActionsModal onSuccess={refetch}>
                  <Button size="sm" variant="outline">
                    🎯 Add Goal
                  </Button>
                </QuickActionsModal>
                <QuickActionsModal onSuccess={refetch}>
                  <Button size="sm" variant="outline">
                    ✅ Create Action Item
                  </Button>
                </QuickActionsModal>
                <Button size="sm" variant="outline">
                  📊 Update KPI
                </Button>
                <Button size="sm" variant="outline">
                  📈 Progress Report
                </Button>
                <Button size="sm" variant="outline">
                  👥 Team Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Meeting Minutes Form Modal */}
      {showMeetingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <MeetingMinutesForm 
              onSave={(data) => {
                console.log('Meeting saved:', data);
                setShowMeetingForm(false);
                refetch();
              }}
              onCancel={() => setShowMeetingForm(false)}
            />
          </div>
        </div>
      )}

      {/* Google Sheets Importer Modal */}
      {showGoogleSheetsImporter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <SimpleGoogleSheetsImporter 
              onImportComplete={async (data, sheetName) => {
                console.log('Imported data:', data, 'Sheet:', sheetName);
                
                try {
                  // Get current user
                  const { data: { user }, error: userError } = await supabase.auth.getUser();
                  if (userError || !user) {
                    console.error('User authentication error:', userError);
                    alert('Please log in again to import data');
                    return;
                  }
                  
                  console.log('Authenticated user:', user.id);

                  // Extract week date from sheet name (e.g., "Week-2025-08-21")
                  const weekMatch = sheetName.match(/(\d{4}-\d{2}-\d{2})/);
                  const weekDate = weekMatch ? weekMatch[1] : new Date().toISOString().split('T')[0];
                  
                  // Get Monday of the week
                  const inputDate = new Date(weekDate);
                  const monday = new Date(inputDate);
                  monday.setDate(inputDate.getDate() - inputDate.getDay() + 1);
                  const weekStartDate = monday.toISOString().split('T')[0];

                  // Prepare meeting data
                  const attendees = [...new Set(data.map(item => item.assignee).filter(Boolean))];
                  const agendaItems = data.filter(item => item.type.toLowerCase() === 'agenda').map(item => item.content);
                  const actionItemsCount = data.filter(item => item.type.toLowerCase() === 'action item').length;
                  const completedCount = data.filter(item => item.type.toLowerCase() === 'action item' && item.status?.toLowerCase() === 'done').length;
                  const decisionsCount = data.filter(item => item.type.toLowerCase() === 'decision').length;

                  // Check if meeting already exists for this week
                  const { data: existingMeetings } = await supabase
                    .from('weekly_meetings')
                    .select('id')
                    .eq('week_date', weekStartDate)
                    .eq('title', sheetName);
                  
                  if (existingMeetings && existingMeetings.length > 0) {
                    console.log('Meeting already exists for this week, updating...');
                    // Update existing meeting
                    const { data: meetingData, error: updateError } = await supabase
                      .from('weekly_meetings')
                      .update({
                        attendees: attendees,
                        agenda_items: agendaItems,
                        total_action_items: actionItemsCount,
                        completed_action_items: completedCount,
                        total_decisions: decisionsCount,
                        imported_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', existingMeetings[0].id)
                      .select()
                      .single();
                    
                    if (updateError) {
                      console.error('Error updating weekly meeting:', updateError);
                      alert('Failed to update meeting data. Please check console.');
                      return;
                    }
                    
                    // Delete old action items and decisions before re-importing
                    await supabase.from('action_items').delete().eq('weekly_meeting_id', existingMeetings[0].id);
                    await supabase.from('weekly_decisions').delete().eq('weekly_meeting_id', existingMeetings[0].id);
                    
                    var finalMeetingId = existingMeetings[0].id;
                  } else {
                    // Create new meeting
                    const { data: meetingData, error: meetingError } = await supabase
                      .from('weekly_meetings')
                      .insert([{
                        week_date: weekStartDate,
                        title: sheetName,
                        meeting_type: 'weekly_standup',
                        attendees: attendees,
                        agenda_items: agendaItems,
                        total_action_items: actionItemsCount,
                        completed_action_items: completedCount,
                        total_decisions: decisionsCount,
                        source_type: 'google_sheets',
                        imported_at: new Date().toISOString(),
                        created_by: user.id
                      }])
                      .select()
                      .single();

                    if (meetingError) {
                      console.error('Error creating weekly meeting:', meetingError);
                      alert('Failed to create meeting record. Please check if tables exist.');
                      return;
                    }
                    
                    var finalMeetingId = meetingData.id;
                  }
                  
                  console.log('Meeting saved with ID:', finalMeetingId);

                  // Create action items
                  const actionItemsData = data.filter(item => item.type.toLowerCase() === 'action item' && item.content.trim());
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
                        weekly_meeting_id: finalMeetingId,
                        created_by: user.id
                      }]);
                    
                    if (itemError) {
                      console.error('Error creating action item:', itemError, item);
                    }
                  }

                  // Create decisions
                  const decisionsData = data.filter(item => item.type.toLowerCase() === 'decision' && item.content.trim());
                  console.log(`Creating ${decisionsData.length} decisions...`);
                  
                  for (const item of decisionsData) {
                    const { error: decisionError } = await supabase
                      .from('weekly_decisions')
                      .insert([{
                        weekly_meeting_id: finalMeetingId,
                        week_date: weekStartDate,
                        title: item.content,
                        description: item.notes || null,
                        impact_level: item.priority?.toLowerCase() || 'medium',
                        status: 'decided',
                        created_by: user.id
                      }]);
                    
                    if (decisionError) {
                      console.error('Error creating decision:', decisionError, item);
                    }
                  }

                  console.log('Weekly data saved to database successfully');
                  
                  // Verify data was saved
                  const { data: verifyMeeting } = await supabase
                    .from('weekly_meetings')
                    .select('*')
                    .eq('week_date', weekStartDate)
                    .single();
                  
                  console.log('Verification - Meeting saved:', verifyMeeting);
                  
                  // Wait a moment for data to propagate
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  // Automatically trigger LLM analysis after successful import
                  if (verifyMeeting) {
                    try {
                      console.log('Triggering LLM analysis for imported data...');
                      await llmAnalysisService.analyzeWeeklyData(weekStartDate, 1);
                      console.log('LLM analysis completed successfully');
                    } catch (analysisError) {
                      console.error('LLM analysis failed:', analysisError);
                      // Continue even if analysis fails
                    }
                  }
                  
                  setShowGoogleSheetsImporter(false);
                  
                  // Force refresh to show new data
                  await refetch();
                  
                  // If in weekly view, ensure it shows current week's data
                  if (selectedTimeframe === 'weekly') {
                    setSelectedTimeframe('monthly');
                    setTimeout(() => setSelectedTimeframe('weekly'), 100);
                  }
                  
                  alert('Data imported successfully! Check the weekly view.');
                } catch (error) {
                  console.error('Error saving imported data:', error);
                  alert('Failed to import data. Please check console for details.');
                }
              }}
            />
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowGoogleSheetsImporter(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}