import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface KPI {
  id: string;
  goal_id: string;
  metric_name: string;
  current_value: number;
  target_value: number;
  unit: string;
  measurement_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  meeting_type: string;
  meeting_date: string;
  start_time?: string;
  end_time?: string;
  attendees: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'in_progress' | 'done' | 'overdue';
  meeting_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'monthly' | 'quarterly' | 'yearly';
  target_value: number;
  current_value: number;
  unit?: string;
  start_date: string;
  due_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'at_risk' | 'blocked';
  created_at: string;
  updated_at: string;
}

export const useTaskTracking = (timeframe: 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'quarterly') => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = async () => {
    try {
      // Skip KPIs for weekly view as they focus on weekly meetings
      if (timeframe === 'weekly') {
        setKpis([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('kpis')
        .select(`
          *,
          goals!inner (
            type
          )
        `)
        .eq('goals.type', timeframe)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKpis(data || []);
    } catch (err) {
      console.error('Error fetching KPIs:', err);
      setError('Failed to fetch KPIs');
    }
  };

  const fetchMeetings = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (timeframe === 'weekly') {
        console.log('Fetching weekly meetings...');
        
        // Use weekly meetings data
        const { data: weeklyMeetings, error } = await supabase
          .from('weekly_meetings')
          .select('*')
          .order('week_date', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching weekly meetings:', error);
          throw error;
        }
        
        console.log(`Found ${weeklyMeetings?.length || 0} weekly meetings`);
        
        // Convert weekly meetings to Meeting format for compatibility
        const convertedMeetings = (weeklyMeetings || []).map(wm => ({
          id: wm.id,
          title: wm.title,
          meeting_type: wm.meeting_type || 'weekly_standup',
          meeting_date: wm.week_date,
          attendees: wm.attendees || [],
          notes: wm.discussion_notes,
          created_at: wm.created_at,
          updated_at: wm.updated_at
        }));
        
        // Split into upcoming and recent based on week_date
        setUpcomingMeetings(convertedMeetings.filter(m => m.meeting_date >= today));
        setRecentMeetings(convertedMeetings.filter(m => m.meeting_date < today));
      } else {
        // Use regular meetings data for other timeframes
        const { data: upcoming, error: upcomingError } = await supabase
          .from('meetings')
          .select('*')
          .gte('meeting_date', today)
          .order('meeting_date', { ascending: true })
          .limit(5);

        if (upcomingError) throw upcomingError;
        setUpcomingMeetings(upcoming || []);

        const { data: recent, error: recentError } = await supabase
          .from('meetings')
          .select('*')
          .lt('meeting_date', today)
          .order('meeting_date', { ascending: false })
          .limit(5);

        if (recentError) throw recentError;
        setRecentMeetings(recent || []);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to fetch meetings');
    }
  };

  const fetchActionItems = async () => {
    try {
      let query = supabase.from('action_items').select('*');
      
      if (timeframe === 'weekly') {
        // For weekly view, get last 4 weeks of action items
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        const fourWeeksAgoStr = fourWeeksAgo.toISOString().split('T')[0];
        
        query = query.gte('week_date', fourWeeksAgoStr);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Update overdue status based on due date
      const today = new Date().toISOString().split('T')[0];
      const updatedItems = data?.map(item => ({
        ...item,
        status: item.due_date < today && item.status !== 'done' ? 'overdue' as const : item.status
      })) || [];
      
      setActionItems(updatedItems);
    } catch (err) {
      console.error('Error fetching action items:', err);
      setError('Failed to fetch action items');
    }
  };

  const fetchGoals = async () => {
    try {
      // Skip goals for weekly view as they focus on weekly meetings
      if (timeframe === 'weekly') {
        setGoals([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('type', timeframe)
        .neq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to fetch goals');
    }
  };

  const createActionItem = async (actionItem: Omit<ActionItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('action_items')
        .insert([actionItem])
        .select()
        .single();

      if (error) throw error;
      
      setActionItems(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating action item:', err);
      throw err;
    }
  };

  const updateActionItem = async (id: string, updates: Partial<ActionItem>) => {
    try {
      const { data, error } = await supabase
        .from('action_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setActionItems(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (err) {
      console.error('Error updating action item:', err);
      throw err;
    }
  };

  const createMeeting = async (meeting: {
    title: string;
    meeting_type: string;
    meeting_date: string;
    start_time?: string;
    end_time?: string;
    attendees?: string[];
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert([{
          ...meeting,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      const today = new Date().toISOString().split('T')[0];
      if (meeting.meeting_date >= today) {
        setUpcomingMeetings(prev => [...prev, data].sort((a, b) => a.meeting_date.localeCompare(b.meeting_date)));
      }
      
      return data;
    } catch (err) {
      console.error('Error creating meeting:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchKPIs(),
        fetchMeetings(),
        fetchActionItems(),
        fetchGoals()
      ]);
      
      setLoading(false);
    };

    loadData();
  }, [timeframe]);

  const refetch = async () => {
    await Promise.all([
      fetchKPIs(),
      fetchMeetings(),
      fetchActionItems(),
      fetchGoals()
    ]);
  };

  return {
    kpis,
    upcomingMeetings,
    recentMeetings,
    actionItems,
    goals,
    loading,
    error,
    refetch,
    createActionItem,
    updateActionItem,
    createMeeting
  };
};