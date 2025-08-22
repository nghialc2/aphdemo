import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimpleGoogleSheetsImporter } from '@/components/task-tracking/SimpleGoogleSheetsImporter';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Upload,
  ArrowLeft,
  Target,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Award,
  Zap,
  Timer,
  User,
  MapPin,
  Star,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskTrackingUserMenu from '@/components/TaskTrackingUserMenu';

interface WeeklyData {
  id: string;
  week_date: string;
  title: string;
  attendees: string[];
  agenda_items: string[];
  total_action_items: number;
  completed_action_items: number;
  total_decisions: number;
  total_discussions: number;
  imported_at: string;
  action_items: ActionItem[];
  decisions: Decision[];
  discussions: Discussion[];
}

interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  priority: string;
  status: string;
  due_date?: string;
  notes?: string;
  class?: string;
}

interface Decision {
  id: string;
  title: string;
  description?: string;
  impact_level: string;
  class?: string;
}

interface Discussion {
  id: string;
  title: string;
  assignee?: string;
  priority?: string;
  status?: string;
  notes?: string;
  due_date?: string;
  class?: string;
}

// Project categories and their colors
const PROJECT_CATEGORIES = [
  { id: 'all', name: 'All Projects', color: 'bg-gradient-to-r from-gray-500 to-gray-600', borderColor: 'border-gray-300', bgLight: 'bg-gray-50' },
  { id: 'MBA', name: 'MBA', color: 'bg-gradient-to-r from-blue-500 to-blue-600', borderColor: 'border-blue-300', bgLight: 'bg-blue-50' },
  { id: 'MSE', name: 'MSE', color: 'bg-gradient-to-r from-green-500 to-green-600', borderColor: 'border-green-300', bgLight: 'bg-green-50' },
  { id: 'LBM', name: 'LBM', color: 'bg-gradient-to-r from-purple-500 to-purple-600', borderColor: 'border-purple-300', bgLight: 'bg-purple-50' },
  { id: 'CUD', name: 'CUD', color: 'bg-gradient-to-r from-orange-500 to-orange-600', borderColor: 'border-orange-300', bgLight: 'bg-orange-50' },
  { id: 'FPUB', name: 'FPUB', color: 'bg-gradient-to-r from-pink-500 to-pink-600', borderColor: 'border-pink-300', bgLight: 'bg-pink-50' },
  { id: 'IR', name: 'IR', color: 'bg-gradient-to-r from-indigo-500 to-indigo-600', borderColor: 'border-indigo-300', bgLight: 'bg-indigo-50' },
  { id: 'Other', name: 'Other Projects', color: 'bg-gradient-to-r from-teal-500 to-teal-600', borderColor: 'border-teal-300', bgLight: 'bg-teal-50' },
];

export default function EnhancedWeeklyDashboard() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [currentWeek, setCurrentWeek] = useState('');
  const [availableWeeks, setAvailableWeeks] = useState<{date: string, hasData: boolean}[]>([]);
  const [selectedProject, setSelectedProject] = useState('all');
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

  // Generate all weeks from August 2025 to December 2025
  const generateWeeksFromAugust2025 = () => {
    const weeks = [];
    const startDate = new Date('2025-08-04'); // First Monday of August 2025
    const endDate = new Date('2025-12-29'); // Last Monday of December 2025
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      weeks.push({
        date: currentDate.toISOString().split('T')[0],
        hasData: false
      });
      currentDate.setDate(currentDate.getDate() + 7); // Add 7 days for next week
    }
    return weeks;
  };

  useEffect(() => {
    const weekStart = getWeekStart();
    setCurrentWeek(weekStart);
    const generatedWeeks = generateWeeksFromAugust2025();
    setAvailableWeeks(generatedWeeks);
    loadWeeklyDataWithStatus(generatedWeeks);
    loadWeeklyData(weekStart);
  }, []);

  // Load data status for all generated weeks
  const loadWeeklyDataWithStatus = async (weeks: {date: string, hasData: boolean}[]) => {
    try {
      const { data: meetings, error } = await supabase
        .from('weekly_meetings')
        .select('week_date')
        .order('week_date', { ascending: false });

      if (error) {
        console.error('Error loading meetings for status:', error);
        return;
      }

      const weeksWithData = meetings?.map(m => m.week_date) || [];
      
      // Update weeks with data status
      const updatedWeeks = weeks.map(week => ({
        ...week,
        hasData: weeksWithData.includes(week.date)
      }));
      
      setAvailableWeeks(updatedWeeks);
    } catch (error) {
      console.error('Error loading weekly data status:', error);
    }
  };

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

      // Process discussions from raw data
      const allData = meeting.raw_data || [];
      const discussions = allData.filter(item => item.type?.toLowerCase() === 'discussion').map((item, idx) => ({
        id: `discussion-${idx}`,
        title: item.content || item.title,
        assignee: item.assignee,
        priority: item.priority,
        status: item.status,
        notes: item.notes,
        due_date: item.dueDate,
        class: item.class || 'Other'
      }));

      setWeeklyData({
        ...meeting,
        action_items: actionItems || [],
        decisions: decisions || [],
        discussions
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

      // Prepare data - extract all three types
      const attendees = [...new Set(data.map(item => item.assignee).filter(Boolean))];
      const actionItemsData = data.filter(item => item.type?.toLowerCase() === 'action item' && item.content?.trim());
      const decisionsData = data.filter(item => item.type?.toLowerCase() === 'decision' && item.content?.trim());
      const discussionsData = data.filter(item => item.type?.toLowerCase() === 'discussion' && item.content?.trim());
      
      console.log('Processed data with Class field:', {
        actionItems: actionItemsData,
        decisions: decisionsData,
        discussions: discussionsData
      });

      // Delete existing data for this week first
      await supabase.from('weekly_meetings').delete().eq('week_date', weekStartDate);

      // Create weekly meeting
      const meetingPayload = {
        week_date: weekStartDate,
        title: sheetName,
        meeting_type: 'weekly_standup',
        attendees: attendees,
        agenda_items: [], // No separate agenda items
        total_action_items: actionItemsData.length,
        completed_action_items: actionItemsData.filter(i => i.status?.toLowerCase() === 'done').length,
        total_decisions: decisionsData.length,
        total_discussions: discussionsData.length,
        source_type: 'google_sheets',
        raw_data: data, // Store all raw data for processing
        created_by: 'anonymous'
      };

      const { data: meetingData, error: meetingError } = await supabase
        .from('weekly_meetings')
        .insert([meetingPayload])
        .select()
        .single();

      if (meetingError) {
        alert(`Failed to import meeting data: ${meetingError.message}`);
        return;
      }

      // Create action items
      for (const item of actionItemsData) {
        await supabase.from('action_items').insert([{
          title: item.content,
          assignee: item.assignee || null,
          due_date: item.dueDate || null,
          priority: item.priority?.toLowerCase() || 'medium',
          status: item.status?.toLowerCase() || 'in_progress',
          notes: item.notes || null,
          class: item.class || 'Other',
          week_date: weekStartDate,
          weekly_meeting_id: meetingData.id,
          created_by: 'anonymous'
        }]);
      }

      // Create decisions  
      for (const item of decisionsData) {
        await supabase.from('weekly_decisions').insert([{
          weekly_meeting_id: meetingData.id,
          week_date: weekStartDate,
          title: item.content,
          description: item.notes || null,
          impact_level: item.priority?.toLowerCase() || 'medium',
          status: 'decided',
          class: item.class || 'Other',
          created_by: 'anonymous'
        }]);
      }

      setShowImporter(false);
      await loadWeeklyData(weekStartDate);
      setCurrentWeek(weekStartDate);
      // Refresh weeks with updated status
      const updatedWeeks = generateWeeksFromAugust2025();
      await loadWeeklyDataWithStatus(updatedWeeks);
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

  const handleWeekChange = (weekDate: string) => {
    setCurrentWeek(weekDate);
    loadWeeklyData(weekDate);
  };

  const getWeekDisplayName = (weekObj: {date: string, hasData: boolean}) => {
    const today = getWeekStart();
    const weekDate = weekObj.date;
    const displayName = weekDate === today ? 
      `This Week (${formatWeekRange(weekDate)})` : 
      formatWeekRange(weekDate);
    
    return {
      name: displayName,
      hasData: weekObj.hasData
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Filter items by selected project
  const filterByProject = (items: any[]) => {
    if (selectedProject === 'all') return items;
    return items.filter(item => item.class === selectedProject || (!item.class && selectedProject === 'Other'));
  };

  // Get project info by class
  const getProjectInfo = (projectClass: string) => {
    return PROJECT_CATEGORIES.find(p => p.id === (projectClass || 'Other')) || PROJECT_CATEGORIES[PROJECT_CATEGORIES.length - 1];
  };

  // Count items by project
  const getProjectCounts = () => {
    const counts: Record<string, number> = {};
    PROJECT_CATEGORIES.forEach(project => {
      if (project.id === 'all') {
        counts['all'] = (weeklyData?.action_items?.length || 0) + 
                       (weeklyData?.decisions?.length || 0) + 
                       (weeklyData?.discussions?.length || 0);
      } else {
        const actionCount = weeklyData?.action_items?.filter(item => 
          (item.class === project.id) || (!item.class && project.id === 'Other')
        ).length || 0;
        const decisionCount = weeklyData?.decisions?.filter(item => 
          (item.class === project.id) || (!item.class && project.id === 'Other')
        ).length || 0;
        const discussionCount = weeklyData?.discussions?.filter(item => 
          (item.class === project.id) || (!item.class && project.id === 'Other')
        ).length || 0;
        counts[project.id] = actionCount + decisionCount + discussionCount;
      }
    });
    return counts;
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'done': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getCompletionRate = () => {
    if (!weeklyData || weeklyData.total_action_items === 0) return 0;
    return Math.round((weeklyData.completed_action_items / weeklyData.total_action_items) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Fast skeleton header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-px bg-gray-300" />
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Fast skeleton content */}
        <div className="container mx-auto px-6 py-8">
          <div className="text-center mb-10">
            <div className="w-96 h-12 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="w-64 h-6 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-white/90 p-4 rounded-xl border border-blue-200 shadow-lg">
              <div className="w-full h-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white/90 p-6 rounded-xl border border-blue-200">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
                <div className="w-full h-6 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="w-3/4 h-4 bg-gray-200 rounded mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/explore')} className="hover:bg-blue-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Explore
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <img src="/logo_FSB_new.png" alt="FSB Logo" className="h-8" />
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              <Activity className="h-3 w-3 mr-1" />
              Live Dashboard
            </Badge>
            <TaskTrackingUserMenu />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Header Section - Compact Design */}
        <div className="text-center mb-10">
          {/* Hero Title */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-2">
              📊 Weekly Team Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Track progress, decisions, and discussions across your weekly meetings
            </p>
          </div>

          {/* Compact Week Selector Card */}
          <div className="max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-2 border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-3">
                  
                  {/* Compact Week Selector Header */}
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-gray-800">Select Your Week</h3>
                    </div>
                  </div>

                  {/* Compact Week Selector */}
                  <div className="w-full max-w-xl">
                    <Select value={currentWeek} onValueChange={handleWeekChange}>
                      <SelectTrigger className="w-full h-12 bg-gradient-to-r from-white via-blue-50 to-indigo-50 hover:from-blue-100 hover:via-indigo-50 hover:to-purple-50 border-2 border-blue-300 hover:border-indigo-400 text-gray-800 font-semibold shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
                        <div className="flex items-center justify-between w-full px-2">
                          <div className="flex items-center space-x-3">
                            <div className="p-1.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg">
                              <Calendar className="h-4 w-4 text-white" />
                            </div>
                            <SelectValue placeholder="🗓️ Choose your week..." className="font-semibold" />
                          </div>
                          <div className="flex items-center space-x-2">
                            {availableWeeks.find(w => w.date === currentWeek)?.hasData && (
                              <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs font-semibold text-green-700">Data</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="w-full max-w-xl bg-white/98 backdrop-blur-md border-2 border-blue-200 shadow-xl rounded-xl p-1">
                        <div className="grid gap-0.5">
                          {availableWeeks.map((week) => {
                            const displayInfo = getWeekDisplayName(week);
                            const isCurrentWeek = week.date === getWeekStart();
                            return (
                              <SelectItem 
                                key={week.date} 
                                value={week.date} 
                                className="p-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 cursor-pointer transition-all duration-150 rounded-lg border border-transparent hover:border-blue-200"
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center space-x-3">
                                    {/* Compact Status Indicator */}
                                    <div className="relative">
                                      {displayInfo.hasData ? (
                                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                                          <CheckCircle className="h-4 w-4 text-white" />
                                        </div>
                                      ) : (
                                        <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center shadow-md">
                                          <Upload className="h-4 w-4 text-white" />
                                        </div>
                                      )}
                                      {isCurrentWeek && (
                                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                          <Star className="h-1.5 w-1.5 text-white" />
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Compact Week Information */}
                                    <div className="text-left">
                                      <div className="font-semibold text-gray-800">
                                        {displayInfo.name}
                                      </div>
                                      <div className="flex items-center space-x-1.5 text-xs mt-0.5">
                                        {displayInfo.hasData ? (
                                          <Badge className="bg-green-100 text-green-700 px-1.5 py-0.5 text-xs font-medium">
                                            <FileText className="h-2.5 w-2.5 mr-1" />
                                            Data
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-orange-100 text-orange-600 px-1.5 py-0.5 text-xs font-medium">
                                            <Upload className="h-2.5 w-2.5 mr-1" />
                                            Upload
                                          </Badge>
                                        )}
                                        {isCurrentWeek && (
                                          <Badge className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 text-xs font-medium">
                                            <Star className="h-2.5 w-2.5 mr-1" />
                                            Current
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Compact Status Display */}
                  <div className="flex items-center justify-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1.5 bg-green-50 px-2.5 py-1.5 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="font-semibold text-green-700">
                        {availableWeeks.filter(w => w.hasData).length} with data
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-orange-50 px-2.5 py-1.5 rounded-full">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span className="font-semibold text-orange-700">
                        {availableWeeks.filter(w => !w.hasData).length} ready
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-blue-50 px-2.5 py-1.5 rounded-full">
                      <Activity className="w-3 h-3 text-blue-600" />
                      <span className="font-semibold text-blue-700">
                        {availableWeeks.length} total
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Current Selection Info */}
          <div className="mt-6 text-lg text-gray-600 font-medium">
            {weeklyData ? (
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Displaying data for selected week</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Upload className="h-5 w-5 text-orange-500" />
                <span>No data for selected week - ready for upload</span>
              </div>
            )}
          </div>
          
          {/* Always Available Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            {!weeklyData ? (
              <Button 
                onClick={() => setShowImporter(true)} 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg transform hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span>Import Google Sheets Data</span>
                  <div className="p-1 bg-white/20 rounded-full">
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </div>
                </div>
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => setShowImporter(true)} 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Re-import Data</span>
                  </div>
                </Button>
                <Button 
                  onClick={() => loadWeeklyData(currentWeek)} 
                  variant="outline" 
                  size="lg" 
                  className="bg-white/90 hover:bg-white border-2 border-blue-300 hover:border-blue-400 text-blue-700 hover:text-blue-800 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5" />
                    <span>Refresh Data</span>
                  </div>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Project Tabs - Only show when data exists */}
        {weeklyData && (
          <div className="max-w-7xl mx-auto mb-8">
            <Card className="bg-white/90 backdrop-blur-sm border border-blue-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-semibold text-gray-600 mr-3">Filter by Project:</span>
                  {PROJECT_CATEGORIES.map(project => {
                    const count = getProjectCounts()[project.id] || 0;
                    const isActive = selectedProject === project.id;
                    return (
                      <Button
                        key={project.id}
                        onClick={() => setSelectedProject(project.id)}
                        variant={isActive ? "default" : "outline"}
                        className={`
                          relative transition-all duration-200 transform hover:scale-105
                          ${isActive 
                            ? `${project.color} text-white border-0 shadow-lg` 
                            : `bg-white hover:bg-gray-50 ${project.borderColor} border-2`
                          }
                        `}
                      >
                        <span className="font-semibold">{project.name}</span>
                        {count > 0 && (
                          <Badge 
                            className={`ml-2 ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}
                            variant="secondary"
                          >
                            {count}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content */}
        {!weeklyData ? (
          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 max-w-lg mx-auto border border-gray-200">
              <FileText className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Weekly Data Yet</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Upload your Google Sheets to see your team's weekly insights come to life!
              </p>
              <Button onClick={() => setShowImporter(true)} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Upload className="h-5 w-5 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Overview Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white">
                <div className="flex items-center justify-between mb-2">
                  <Award className="h-8 w-8" />
                  <span className="text-2xl font-bold">{getCompletionRate()}%</span>
                </div>
                <p className="text-green-100">Completion Rate</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-8 w-8" />
                  <span className="text-2xl font-bold">{weeklyData.total_action_items}</span>
                </div>
                <p className="text-blue-100">Action Items</p>
              </div>
              
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-6 rounded-2xl text-white">
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className="h-8 w-8" />
                  <span className="text-2xl font-bold">{weeklyData.total_discussions || weeklyData.discussions?.length || 0}</span>
                </div>
                <p className="text-teal-100">Discussions</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl text-white">
                <div className="flex items-center justify-between mb-2">
                  <Lightbulb className="h-8 w-8" />
                  <span className="text-2xl font-bold">{weeklyData.total_decisions}</span>
                </div>
                <p className="text-purple-100">Key Decisions</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Left Column - Meeting Info */}
              <div className="xl:col-span-1 space-y-6">
                
                {/* Meeting Overview */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-xl">
                      <MessageSquare className="h-6 w-6 mr-3 text-blue-600" />
                      {weeklyData.title}
                    </CardTitle>
                    <CardDescription className="flex items-center text-gray-600">
                      <Timer className="h-4 w-4 mr-1" />
                      Imported {new Date(weeklyData.imported_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Ring */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${getCompletionRate() * 2.51} 251`}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-800">{getCompletionRate()}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center mb-6">
                      <p className="text-lg font-semibold text-gray-800 mb-1">Week Progress</p>
                      <p className="text-gray-600">
                        {weeklyData.completed_action_items} of {weeklyData.total_action_items} tasks completed
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Members */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-indigo-600" />
                      Team Members ({weeklyData.attendees.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {weeklyData.attendees.map((attendee, idx) => (
                        <div key={idx} className="flex items-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-full mr-3">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-800">{attendee}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Agenda Items */}
                {weeklyData.agenda_items.length > 0 && (
                  <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-green-600" />
                        Meeting Agenda ({weeklyData.agenda_items.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {weeklyData.agenda_items.map((item, idx) => (
                          <div key={idx} className="flex items-start p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-sm font-bold">
                              {idx + 1}
                            </div>
                            <span className="text-gray-800 leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Columns - Action Items & Decisions */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* Action Items */}
                {weeklyData.action_items.length > 0 && (
                  <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Zap className="h-6 w-6 mr-2 text-yellow-600" />
                          Action Items ({weeklyData.action_items.length})
                        </div>
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          {weeklyData.completed_action_items} Done
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filterByProject(weeklyData.action_items).map((item, idx) => {
                          const projectInfo = getProjectInfo(item.class || 'Other');
                          return (
                            <div key={item.id} className={`p-4 rounded-xl border-2 ${projectInfo.borderColor} ${projectInfo.bgLight} hover:shadow-md transition-all`}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(item.status)}
                                  <Badge className={getPriorityColor(item.priority)} variant="secondary">
                                    {item.priority}
                                  </Badge>
                                  <Badge className={`${projectInfo.color} text-white text-xs px-2 py-1`}>
                                    {projectInfo.name}
                                  </Badge>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  #{idx + 1}
                                </Badge>
                              </div>
                            
                            <h4 className="font-semibold text-gray-900 mb-2 leading-tight">{item.title}</h4>
                            
                            {/* Show notes if available */}
                            {item.notes && (
                              <div className="mb-3 p-2 bg-blue-50 rounded-lg border-l-2 border-blue-300">
                                <p className="text-sm text-gray-700 italic">
                                  <span className="font-medium text-blue-700">Note:</span> {item.notes}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {item.assignee || 'Unassigned'}
                              </div>
                              {item.due_date && (
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(item.due_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${item.status === 'done' ? 'border-green-500 text-green-700' : 'border-blue-500 text-blue-700'}`}
                              >
                                {item.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Discussions */}
                {weeklyData.discussions && weeklyData.discussions.length > 0 && (
                  <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MessageSquare className="h-6 w-6 mr-2 text-teal-600" />
                          Discussions ({weeklyData.discussions.length})
                        </div>
                        <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                          Team Talk
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filterByProject(weeklyData.discussions).map((discussion, idx) => {
                          const projectInfo = getProjectInfo(discussion.class || 'Other');
                          return (
                            <div key={discussion.id} className={`p-4 rounded-xl border-2 ${projectInfo.borderColor} ${projectInfo.bgLight} hover:shadow-md transition-all`}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                    {idx + 1}
                                </div>
                                {discussion.priority && (
                                  <Badge className={getPriorityColor(discussion.priority)} variant="secondary">
                                    {discussion.priority}
                                  </Badge>
                                )}
                              </div>
                              {discussion.status && (
                                <Badge variant="outline" className="text-xs border-teal-500 text-teal-700">
                                  {discussion.status}
                                </Badge>
                              )}
                            </div>
                            
                            <h4 className="font-semibold text-gray-900 mb-2 leading-tight">{discussion.title}</h4>
                            
                            {discussion.notes && (
                              <p className="text-gray-700 text-sm leading-relaxed mb-3">{discussion.notes}</p>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              {discussion.assignee && (
                                <div className="flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  {discussion.assignee}
                                </div>
                              )}
                              {discussion.due_date && (
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(discussion.due_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Key Decisions */}
                {weeklyData.decisions.length > 0 && (
                  <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-6 w-6 mr-2 text-purple-600" />
                          Key Decisions ({weeklyData.decisions.length})
                        </div>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          Strategic
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {filterByProject(weeklyData.decisions).map((decision, idx) => {
                          const projectInfo = getProjectInfo(decision.class || 'Other');
                          return (
                            <div key={decision.id} className={`p-5 rounded-xl border-2 ${projectInfo.borderColor} ${projectInfo.bgLight}`}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                    {idx + 1}
                                  </div>
                                  <Badge className={`${projectInfo.color} text-white text-xs px-2 py-1`}>
                                    {projectInfo.name}
                                  </Badge>
                                </div>
                                <Badge className={`${getPriorityColor(decision.impact_level)} ml-2`}>
                                  {decision.impact_level} impact
                                </Badge>
                              </div>
                            
                            <h4 className="font-bold text-gray-900 mb-2 text-lg">{decision.title}</h4>
                            
                            {decision.description && (
                              <p className="text-gray-700 leading-relaxed mb-3">{decision.description}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="border-purple-500 text-purple-700">
                                ✅ {decision.status}
                              </Badge>
                              <div className="flex items-center text-sm text-gray-600">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                Strategic Impact
                              </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Google Sheets Importer Modal */}
      {showImporter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Import Weekly Data
                </h3>
                <p className="text-gray-600 mt-1">Transform your Google Sheets into beautiful insights</p>
              </div>
              <Button variant="ghost" onClick={() => setShowImporter(false)} className="hover:bg-gray-100">
                <span className="text-2xl">×</span>
              </Button>
            </div>
            
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <Upload className="h-4 w-4" />
              <AlertDescription className="text-blue-800">
                <strong>Pro tip:</strong> Make sure your Google Sheet follows the template format: 
                <code className="bg-blue-100 px-2 py-1 rounded ml-1">Type | Content | Assignee | Due Date | Priority | Status | Notes</code>
              </AlertDescription>
            </Alert>
            
            <SimpleGoogleSheetsImporter onImportComplete={handleImport} />
          </div>
        </div>
      )}
    </div>
  );
}