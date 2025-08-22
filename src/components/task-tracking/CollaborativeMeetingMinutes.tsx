import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  Clock,
  User,
  Check,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MeetingMinutesRow {
  id: string;
  meeting_id: string;
  row_type: 'agenda' | 'discussion' | 'action_item' | 'decision';
  content: string;
  assignee?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'completed';
  order_index: number;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

interface UserPresence {
  user_id: string;
  user_email: string;
  row_id?: string;
  last_seen: string;
}

interface CollaborativeMeetingMinutesProps {
  meetingId: string;
  meetingTitle: string;
  onClose: () => void;
}

export const CollaborativeMeetingMinutes: React.FC<CollaborativeMeetingMinutesProps> = ({
  meetingId,
  meetingTitle,
  onClose
}) => {
  const [rows, setRows] = useState<MeetingMinutesRow[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});

  // Initialize real-time subscriptions
  useEffect(() => {
    const initializeRealtime = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch existing meeting minutes rows
      await fetchMeetingRows();

      // Subscribe to meeting_minutes_rows changes
      const rowsSubscription = supabase
        .channel(`meeting_${meetingId}_rows`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'meeting_minutes_rows',
            filter: `meeting_id=eq.${meetingId}`
          },
          (payload) => {
            handleRowChange(payload);
          }
        )
        .subscribe();

      // Subscribe to user presence
      const presenceSubscription = supabase
        .channel(`meeting_${meetingId}_presence`)
        .on('presence', { event: 'sync' }, () => {
          const state = presenceSubscription.presenceState();
          const users = Object.values(state).flat() as UserPresence[];
          setActiveUsers(users);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && user) {
            // Track presence
            await presenceSubscription.track({
              user_id: user.id,
              user_email: user.email,
              last_seen: new Date().toISOString()
            });
          }
        });

      setLoading(false);

      // Cleanup subscriptions
      return () => {
        supabase.removeChannel(rowsSubscription);
        supabase.removeChannel(presenceSubscription);
      };
    };

    initializeRealtime();
  }, [meetingId]);

  const fetchMeetingRows = async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_minutes_rows')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setRows(data || []);
    } catch (error) {
      console.error('Error fetching meeting rows:', error);
    }
  };

  const handleRowChange = (payload: any) => {
    const { eventType, new: newRow, old: oldRow } = payload;
    
    setRows(prev => {
      switch (eventType) {
        case 'INSERT':
          return [...prev, newRow].sort((a, b) => a.order_index - b.order_index);
        case 'UPDATE':
          return prev.map(row => row.id === newRow.id ? newRow : row);
        case 'DELETE':
          return prev.filter(row => row.id !== oldRow.id);
        default:
          return prev;
      }
    });
  };

  const addRow = async (type: MeetingMinutesRow['row_type']) => {
    if (!currentUser) return;

    const newOrderIndex = Math.max(...rows.map(r => r.order_index), 0) + 1;
    
    try {
      const { data, error } = await supabase
        .from('meeting_minutes_rows')
        .insert([{
          meeting_id: meetingId,
          row_type: type,
          content: '',
          order_index: newOrderIndex,
          created_by: currentUser.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Focus on the new row
      setTimeout(() => {
        const input = inputRefs.current[data.id];
        if (input) {
          input.focus();
          setEditingRow(data.id);
        }
      }, 100);
    } catch (error) {
      console.error('Error adding row:', error);
    }
  };

  const updateRow = async (rowId: string, updates: Partial<MeetingMinutesRow>) => {
    if (!currentUser) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('meeting_minutes_rows')
        .update({
          ...updates,
          updated_by: currentUser.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', rowId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating row:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (rowId: string) => {
    try {
      const { error } = await supabase
        .from('meeting_minutes_rows')
        .delete()
        .eq('id', rowId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  const handleContentChange = (rowId: string, content: string) => {
    // Optimistic update for immediate feedback
    setRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, content } : row
    ));
    
    // Debounced save to database
    const timeoutId = setTimeout(() => {
      updateRow(rowId, { content });
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const getRowTypeColor = (type: MeetingMinutesRow['row_type']) => {
    switch (type) {
      case 'agenda': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'discussion': return 'bg-green-100 text-green-800 border-green-200';
      case 'action_item': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'decision': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRowTypeIcon = (type: MeetingMinutesRow['row_type']) => {
    switch (type) {
      case 'agenda': return '📋';
      case 'discussion': return '💬';
      case 'action_item': return '✅';
      case 'decision': return '⚖️';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6" />
              <div>
                <CardTitle className="text-xl">{meetingTitle} - Meeting Minutes</CardTitle>
                <CardDescription>Collaborative real-time editing</CardDescription>
              </div>
            </div>
            
            {/* Active Users */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Active:</span>
              <div className="flex -space-x-2">
                {activeUsers.slice(0, 5).map((user) => (
                  <Avatar key={user.user_id} className="h-8 w-8 border-2 border-white">
                    <AvatarFallback className="text-xs">
                      {user.user_email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {activeUsers.length > 5 && (
                  <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                    +{activeUsers.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => addRow('agenda')}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              📋 Agenda Item
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => addRow('discussion')}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              💬 Discussion
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => addRow('action_item')}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              ✅ Action Item
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => addRow('decision')}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              ⚖️ Decision
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Minutes Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-700 w-32">Type</th>
                  <th className="text-left p-3 font-medium text-gray-700">Content</th>
                  <th className="text-left p-3 font-medium text-gray-700 w-40">Assignee</th>
                  <th className="text-left p-3 font-medium text-gray-700 w-32">Due Date</th>
                  <th className="text-left p-3 font-medium text-gray-700 w-24">Priority</th>
                  <th className="text-left p-3 font-medium text-gray-700 w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <Badge className={getRowTypeColor(row.row_type)}>
                        {getRowTypeIcon(row.row_type)} {row.row_type.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Input
                        ref={(el) => {
                          if (el) inputRefs.current[row.id] = el;
                        }}
                        value={row.content}
                        onChange={(e) => handleContentChange(row.id, e.target.value)}
                        onFocus={() => setEditingRow(row.id)}
                        onBlur={() => setEditingRow(null)}
                        placeholder={`Enter ${row.row_type.replace('_', ' ')}...`}
                        className={`border-none bg-transparent focus:bg-white focus:border-blue-200 ${
                          editingRow === row.id ? 'ring-2 ring-blue-200' : ''
                        }`}
                      />
                    </td>
                    <td className="p-3">
                      {(row.row_type === 'action_item') && (
                        <Input
                          value={row.assignee || ''}
                          onChange={(e) => updateRow(row.id, { assignee: e.target.value })}
                          placeholder="Assignee"
                          className="border-none bg-transparent focus:bg-white focus:border-blue-200"
                        />
                      )}
                    </td>
                    <td className="p-3">
                      {(row.row_type === 'action_item') && (
                        <Input
                          type="date"
                          value={row.due_date || ''}
                          onChange={(e) => updateRow(row.id, { due_date: e.target.value })}
                          className="border-none bg-transparent focus:bg-white focus:border-blue-200"
                        />
                      )}
                    </td>
                    <td className="p-3">
                      {(row.row_type === 'action_item') && (
                        <select
                          value={row.priority || 'medium'}
                          onChange={(e) => updateRow(row.id, { priority: e.target.value as any })}
                          className="w-full p-1 border-none bg-transparent focus:bg-white focus:border-blue-200 rounded"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      )}
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteRow(row.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No meeting minutes yet. Click the buttons above to start adding content.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {saving && (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => console.log('Export functionality')}>
            <Save className="h-4 w-4 mr-2" />
            Export Minutes
          </Button>
        </div>
      </div>
    </div>
  );
};