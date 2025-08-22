import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Target, CheckSquare, BarChart3, CalendarPlus, AlertTriangle } from 'lucide-react';
import { useTaskTracking } from '@/hooks/useTaskTracking';
import { supabase } from '@/integrations/supabase/client';

interface QuickActionsModalProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export const QuickActionsModal = ({ children, onSuccess }: QuickActionsModalProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createActionItem, createMeeting } = useTaskTracking();

  // Action Item Form State
  const [actionItem, setActionItem] = useState({
    title: '',
    description: '',
    assignee: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });

  // Goal/KPI Form State
  const [goal, setGoal] = useState({
    title: '',
    description: '',
    current_value: 0,
    target_value: 0,
    unit: '',
    type: 'quarterly' as 'monthly' | 'quarterly' | 'yearly',
    start_date: new Date().toISOString().split('T')[0],
    due_date: ''
  });

  // Meeting Form State
  const [meeting, setMeeting] = useState({
    title: '',
    meeting_date: '',
    start_time: '',
    end_time: '',
    meeting_type: 'weekly_standup',
    attendees: [] as string[],
    notes: ''
  });

  const resetForms = () => {
    setActionItem({
      title: '',
      description: '',
      assignee: '',
      due_date: '',
      priority: 'medium'
    });
    setGoal({
      title: '',
      description: '',
      current_value: 0,
      target_value: 0,
      unit: '',
      type: 'quarterly',
      start_date: new Date().toISOString().split('T')[0],
      due_date: ''
    });
    setMeeting({
      title: '',
      meeting_date: '',
      start_time: '',
      end_time: '',
      meeting_type: 'weekly_standup',
      attendees: [],
      notes: ''
    });
  };

  const handleCreateActionItem = async () => {
    if (!actionItem.title.trim() || !actionItem.assignee.trim()) {
      setError('Title and assignee are required for action items');
      return;
    }

    setIsSubmitting(true);
    try {
      await createActionItem({
        title: actionItem.title,
        description: actionItem.description || undefined,
        assignee: actionItem.assignee,
        due_date: actionItem.due_date,
        priority: actionItem.priority,
        status: 'backlog'
      });
      
      resetForms();
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error creating action item:', err);
      setError('Failed to create action item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!goal.title.trim() || goal.target_value <= 0 || !goal.due_date) {
      setError('Title, target value, and due date are required for goals');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('goals')
        .insert([{
          title: goal.title,
          description: goal.description || null,
          type: goal.type,
          current_value: goal.current_value,
          target_value: goal.target_value,
          unit: goal.unit || null,
          start_date: goal.start_date,
          due_date: goal.due_date,
          status: 'not_started',
          created_by: user.user?.id
        }]);

      if (error) throw error;
      
      resetForms();
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error creating goal:', err);
      setError('Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!meeting.title.trim() || !meeting.meeting_date) {
      setError('Title and date are required for meetings');
      return;
    }

    setIsSubmitting(true);
    try {
      await createMeeting({
        title: meeting.title,
        meeting_date: meeting.meeting_date,
        start_time: meeting.start_time || undefined,
        end_time: meeting.end_time || undefined,
        meeting_type: meeting.meeting_type,
        attendees: meeting.attendees.filter(a => a.trim()),
        notes: meeting.notes || undefined
      });
      
      resetForms();
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError('Failed to create meeting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const goalTypeOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const meetingTypes = [
    { value: 'weekly_standup', label: 'Weekly Standup' },
    { value: 'monthly_review', label: 'Monthly Review' },
    { value: 'quarterly_planning', label: 'Quarterly Planning' },
    { value: 'project_deepdive', label: 'Project Deep-dive' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        setError(null);
        resetForms();
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Quick Actions
          </DialogTitle>
          <DialogDescription>
            Quickly create tasks, goals, or schedule meetings to keep your team organized.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="task" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="task" className="flex items-center">
              <CheckSquare className="h-4 w-4 mr-1" />
              Task
            </TabsTrigger>
            <TabsTrigger value="goal" className="flex items-center">
              <Target className="h-4 w-4 mr-1" />
              Goal/KPI
            </TabsTrigger>
            <TabsTrigger value="meeting" className="flex items-center">
              <CalendarPlus className="h-4 w-4 mr-1" />
              Meeting
            </TabsTrigger>
          </TabsList>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mt-4">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              {error}
            </div>
          )}

          <TabsContent value="task" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create Action Item</CardTitle>
                <CardDescription>Add a new task or action item for your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Task Title*</Label>
                  <Input
                    id="task-title"
                    value={actionItem.title}
                    onChange={(e) => setActionItem(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="What needs to be done?"
                  />
                </div>
                
                <div>
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    value={actionItem.description}
                    onChange={(e) => setActionItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about the task..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="task-assignee">Assignee*</Label>
                    <Input
                      id="task-assignee"
                      value={actionItem.assignee}
                      onChange={(e) => setActionItem(prev => ({ ...prev, assignee: e.target.value }))}
                      placeholder="Person responsible"
                    />
                  </div>
                  <div>
                    <Label htmlFor="task-due">Due Date</Label>
                    <Input
                      id="task-due"
                      type="date"
                      value={actionItem.due_date}
                      onChange={(e) => setActionItem(prev => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="task-priority">Priority</Label>
                  <select
                    id="task-priority"
                    value={actionItem.priority}
                    onChange={(e) => setActionItem(prev => ({ ...prev, priority: e.target.value as typeof actionItem.priority }))}
                    className="w-full p-2 border rounded-md"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button onClick={handleCreateActionItem} disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Creating...' : 'Create Action Item'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create Goal</CardTitle>
                <CardDescription>Set a new measurable goal with timeline and targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="goal-title">Goal Title*</Label>
                  <Input
                    id="goal-title"
                    value={goal.title}
                    onChange={(e) => setGoal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Increase revenue, Improve team productivity"
                  />
                </div>

                <div>
                  <Label htmlFor="goal-description">Description</Label>
                  <Textarea
                    id="goal-description"
                    value={goal.description}
                    onChange={(e) => setGoal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the goal in more detail..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="goal-current">Current Value</Label>
                    <Input
                      id="goal-current"
                      type="number"
                      value={goal.current_value}
                      onChange={(e) => setGoal(prev => ({ ...prev, current_value: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-target">Target Value*</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      value={goal.target_value}
                      onChange={(e) => setGoal(prev => ({ ...prev, target_value: parseFloat(e.target.value) || 0 }))}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-unit">Unit</Label>
                    <Input
                      id="goal-unit"
                      value={goal.unit}
                      onChange={(e) => setGoal(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="%, USD, projects"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal-type">Goal Type</Label>
                    <select
                      id="goal-type"
                      value={goal.type}
                      onChange={(e) => setGoal(prev => ({ ...prev, type: e.target.value as typeof goal.type }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {goalTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="goal-due">Due Date*</Label>
                    <Input
                      id="goal-due"
                      type="date"
                      value={goal.due_date}
                      onChange={(e) => setGoal(prev => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>
                </div>

                <Button onClick={handleCreateGoal} disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Creating...' : 'Create Goal'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meeting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule Meeting</CardTitle>
                <CardDescription>Create a new meeting and add it to your calendar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meeting-title">Meeting Title*</Label>
                  <Input
                    id="meeting-title"
                    value={meeting.title}
                    onChange={(e) => setMeeting(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Weekly Team Standup, Q3 Planning"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="meeting-date">Date*</Label>
                    <Input
                      id="meeting-date"
                      type="date"
                      value={meeting.meeting_date}
                      onChange={(e) => setMeeting(prev => ({ ...prev, meeting_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="meeting-start-time">Start Time</Label>
                    <Input
                      id="meeting-start-time"
                      type="time"
                      value={meeting.start_time}
                      onChange={(e) => setMeeting(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="meeting-end-time">End Time</Label>
                    <Input
                      id="meeting-end-time"
                      type="time"
                      value={meeting.end_time}
                      onChange={(e) => setMeeting(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="meeting-type">Meeting Type</Label>
                  <select
                    id="meeting-type"
                    value={meeting.meeting_type}
                    onChange={(e) => setMeeting(prev => ({ ...prev, meeting_type: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    {meetingTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="meeting-notes">Notes</Label>
                  <Textarea
                    id="meeting-notes"
                    value={meeting.notes}
                    onChange={(e) => setMeeting(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional meeting details..."
                    rows={2}
                  />
                </div>

                <Button onClick={handleCreateMeeting} disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};