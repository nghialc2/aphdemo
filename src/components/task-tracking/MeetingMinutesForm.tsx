import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useTaskTracking } from '@/hooks/useTaskTracking';
import { 
  Calendar,
  Clock,
  Users,
  Plus,
  Minus,
  FileText,
  Target,
  CheckCircle,
  X,
  Save
} from 'lucide-react';

interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface Decision {
  id: string;
  title: string;
  description: string;
}

interface MeetingData {
  title: string;
  meetingType: 'weekly_standup' | 'monthly_review' | 'quarterly_planning' | 'project_deepdive' | 'other';
  date: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  agenda: string[];
  notes: string;
  actionItems: ActionItem[];
  decisions: Decision[];
  nextSteps: string[];
}

interface MeetingMinutesFormProps {
  initialData?: Partial<MeetingData>;
  onSave?: (data: MeetingData) => void;
  onCancel: () => void;
}

const meetingTypes = [
  { value: 'weekly_standup', label: 'Weekly Standup', emoji: '📅' },
  { value: 'monthly_review', label: 'Monthly Review', emoji: '📊' },
  { value: 'quarterly_planning', label: 'Quarterly Planning', emoji: '🎯' },
  { value: 'project_deepdive', label: 'Project Deep-dive', emoji: '🔍' },
  { value: 'other', label: 'Other', emoji: '📝' }
];

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
];

export const MeetingMinutesForm: React.FC<MeetingMinutesFormProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const [meetingData, setMeetingData] = useState<MeetingData>({
    title: initialData?.title || '',
    meetingType: initialData?.meetingType || 'weekly_standup',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    attendees: initialData?.attendees || [''],
    agenda: initialData?.agenda || [''],
    notes: initialData?.notes || '',
    actionItems: initialData?.actionItems || [],
    decisions: initialData?.decisions || [],
    nextSteps: initialData?.nextSteps || ['']
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createMeeting, createActionItem } = useTaskTracking();

  const [newActionItem, setNewActionItem] = useState<Partial<ActionItem>>({
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium'
  });

  const [newDecision, setNewDecision] = useState<Partial<Decision>>({
    title: '',
    description: ''
  });

  const updateField = <K extends keyof MeetingData>(field: K, value: MeetingData[K]) => {
    setMeetingData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: 'attendees' | 'agenda' | 'nextSteps', index: number, value: string) => {
    const newArray = [...meetingData[field]];
    newArray[index] = value;
    updateField(field, newArray);
  };

  const addArrayItem = (field: 'attendees' | 'agenda' | 'nextSteps') => {
    updateField(field, [...meetingData[field], '']);
  };

  const removeArrayItem = (field: 'attendees' | 'agenda' | 'nextSteps', index: number) => {
    const newArray = meetingData[field].filter((_, i) => i !== index);
    updateField(field, newArray.length > 0 ? newArray : ['']);
  };

  const addActionItem = () => {
    if (newActionItem.description && newActionItem.assignee) {
      const actionItem: ActionItem = {
        id: Date.now().toString(),
        description: newActionItem.description || '',
        assignee: newActionItem.assignee || '',
        dueDate: newActionItem.dueDate || '',
        priority: newActionItem.priority || 'medium'
      };
      
      updateField('actionItems', [...meetingData.actionItems, actionItem]);
      setNewActionItem({ description: '', assignee: '', dueDate: '', priority: 'medium' });
    }
  };

  const removeActionItem = (id: string) => {
    updateField('actionItems', meetingData.actionItems.filter(item => item.id !== id));
  };

  const addDecision = () => {
    if (newDecision.title && newDecision.description) {
      const decision: Decision = {
        id: Date.now().toString(),
        title: newDecision.title || '',
        description: newDecision.description || ''
      };
      
      updateField('decisions', [...meetingData.decisions, decision]);
      setNewDecision({ title: '', description: '' });
    }
  };

  const removeDecision = (id: string) => {
    updateField('decisions', meetingData.decisions.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    if (!meetingData.title.trim()) {
      setError('Meeting title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Filter out empty strings from arrays
      const cleanedData: MeetingData = {
        ...meetingData,
        attendees: meetingData.attendees.filter(item => item.trim()),
        agenda: meetingData.agenda.filter(item => item.trim()),
        nextSteps: meetingData.nextSteps.filter(item => item.trim())
      };

      // Create the meeting record in the database
      const meetingResponse = await createMeeting({
        title: cleanedData.title,
        date: cleanedData.date,
        type: cleanedData.meetingType,
        attendees_count: cleanedData.attendees.length,
        status: 'completed'
      });

      // Create action items linked to this meeting
      for (const actionItem of cleanedData.actionItems) {
        await createActionItem({
          title: actionItem.description,
          assignee: actionItem.assignee,
          due_date: actionItem.dueDate,
          priority: actionItem.priority,
          status: 'backlog',
          meeting_id: meetingResponse.id
        });
      }

      // Create decisions as special action items
      for (const decision of cleanedData.decisions) {
        await createActionItem({
          title: `Decision: ${decision.title}`,
          description: decision.description,
          assignee: 'Team', // Default assignee for decisions
          due_date: cleanedData.date, // Same date as meeting
          priority: 'medium',
          status: 'done',
          meeting_id: meetingResponse.id
        });
      }

      if (onSave) {
        onSave(cleanedData);
      } else {
        // Reset form if no custom onSave handler
        setMeetingData({
          title: '',
          meetingType: 'weekly_standup',
          date: new Date().toISOString().split('T')[0],
          startTime: '',
          endTime: '',
          attendees: [''],
          agenda: [''],
          notes: '',
          actionItems: [],
          decisions: [],
          nextSteps: ['']
        });
        alert('Meeting minutes saved successfully!');
      }
    } catch (err) {
      console.error('Error saving meeting minutes:', err);
      setError('Failed to save meeting minutes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Meeting Minutes
          </CardTitle>
          <CardDescription>
            Capture meeting details, discussions, and action items
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={meetingData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Weekly Team Standup"
              />
            </div>
            <div>
              <Label htmlFor="meetingType">Meeting Type</Label>
              <select
                id="meetingType"
                value={meetingData.meetingType}
                onChange={(e) => updateField('meetingType', e.target.value as MeetingData['meetingType'])}
                className="w-full p-2 border rounded-md"
              >
                {meetingTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.emoji} {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={meetingData.date}
                onChange={(e) => updateField('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={meetingData.startTime}
                onChange={(e) => updateField('startTime', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={meetingData.endTime}
                onChange={(e) => updateField('endTime', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Attendees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {meetingData.attendees.map((attendee, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={attendee}
                  onChange={(e) => updateArrayField('attendees', index, e.target.value)}
                  placeholder="Name or email"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('attendees', index)}
                  disabled={meetingData.attendees.length === 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('attendees')}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Attendee
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agenda */}
      <Card>
        <CardHeader>
          <CardTitle>Agenda Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {meetingData.agenda.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={item}
                  onChange={(e) => updateArrayField('agenda', index, e.target.value)}
                  placeholder="Agenda item"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('agenda', index)}
                  disabled={meetingData.agenda.length === 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('agenda')}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Agenda Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={meetingData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Detailed discussion notes, key points, and observations..."
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Action Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Action Items */}
          {meetingData.actionItems.map((item) => (
            <div key={item.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium">{item.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>👤 {item.assignee}</span>
                    {item.dueDate && <span>📅 {item.dueDate}</span>}
                    <Badge className={priorities.find(p => p.value === item.priority)?.color}>
                      {item.priority}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeActionItem(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Separator />

          {/* Add New Action Item */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium">Add Action Item</h4>
            <div className="space-y-3">
              <Input
                value={newActionItem.description || ''}
                onChange={(e) => setNewActionItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What needs to be done?"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  value={newActionItem.assignee || ''}
                  onChange={(e) => setNewActionItem(prev => ({ ...prev, assignee: e.target.value }))}
                  placeholder="Assigned to"
                />
                <Input
                  type="date"
                  value={newActionItem.dueDate || ''}
                  onChange={(e) => setNewActionItem(prev => ({ ...prev, dueDate: e.target.value }))}
                />
                <select
                  value={newActionItem.priority || 'medium'}
                  onChange={(e) => setNewActionItem(prev => ({ ...prev, priority: e.target.value as ActionItem['priority'] }))}
                  className="p-2 border rounded-md"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={addActionItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Action Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decisions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Key Decisions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Decisions */}
          {meetingData.decisions.map((decision) => (
            <div key={decision.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{decision.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{decision.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDecision(decision.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Separator />

          {/* Add New Decision */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium">Add Decision</h4>
            <div className="space-y-3">
              <Input
                value={newDecision.title || ''}
                onChange={(e) => setNewDecision(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Decision title"
              />
              <Textarea
                value={newDecision.description || ''}
                onChange={(e) => setNewDecision(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Decision details and rationale"
                rows={2}
              />
              <Button onClick={addDecision}>
                <Plus className="h-4 w-4 mr-2" />
                Add Decision
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps & Follow-ups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {meetingData.nextSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={step}
                  onChange={(e) => updateArrayField('nextSteps', index, e.target.value)}
                  placeholder="Follow-up item or next meeting topic"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('nextSteps', index)}
                  disabled={meetingData.nextSteps.length === 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('nextSteps')}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Next Step
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-700 text-sm">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pb-6">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Meeting Minutes'}
        </Button>
      </div>
    </div>
  );
};