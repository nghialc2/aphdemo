
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/insights/client';
import { useAdmin } from '@/context/AdminContext';

export interface AdminContent {
  id: string;
  title: string;
  content: string;
  content_type: string;
  github_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const useAdminContent = () => {
  const { isAdmin } = useAdmin();
  const [content, setContent] = useState<AdminContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    if (!isAdmin) {
      setContent([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setContent(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching admin content:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createContent = async (contentData: Omit<AdminContent, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('admin_content')
        .insert({
          ...contentData,
          created_by: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setContent(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating content:', err);
      throw err;
    }
  };

  const updateContent = async (id: string, updates: Partial<AdminContent>) => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const { data, error } = await supabase
        .from('admin_content')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setContent(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (err) {
      console.error('Error updating content:', err);
      throw err;
    }
  };

  const deleteContent = async (id: string) => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const { error } = await supabase
        .from('admin_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setContent(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting content:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchContent();
  }, [isAdmin]);

  return {
    content,
    loading,
    error,
    fetchContent,
    createContent,
    updateContent,
    deleteContent,
  };
};
