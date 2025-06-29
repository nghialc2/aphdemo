import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useAdmin } from './useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminContent {
  id: string;
  title: string;
  content: string;
  content_type: string;
  github_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const useAdminContent = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContents = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_content')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin content:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải nội dung quản trị",
          variant: "destructive",
        });
        return;
      }

      setContents(data || []);
    } catch (error) {
      console.error('Error fetching admin content:', error);
    } finally {
      setLoading(false);
    }
  };

  const createContent = async (
    title: string,
    content: string,
    contentType: string,
    file?: File
  ) => {
    if (!isAdmin || !user) return null;

    try {
      let githubUrl = null;

      // If file is provided, upload to GitHub
      if (file) {
        githubUrl = await uploadToGitHub(file, title);
      }

      const { data, error } = await supabase
        .from('admin_content')
        .insert([
          {
            title,
            content,
            content_type: contentType,
            github_url: githubUrl,
            created_by: user.id,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating content:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tạo nội dung mới",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Thành công",
        description: "Đã tạo nội dung mới",
      });

      await fetchContents();
      return data;
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo nội dung",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateContent = async (
    id: string,
    title: string,
    content: string,
    contentType: string,
    file?: File
  ) => {
    if (!isAdmin || !user) return null;

    try {
      let githubUrl = null;

      // If new file is provided, upload to GitHub
      if (file) {
        githubUrl = await uploadToGitHub(file, title);
      }

      const updateData: any = {
        title,
        content,
        content_type: contentType,
        updated_at: new Date().toISOString(),
      };

      if (githubUrl) {
        updateData.github_url = githubUrl;
      }

      const { data, error } = await supabase
        .from('admin_content')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating content:', error);
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật nội dung",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật nội dung",
      });

      await fetchContents();
      return data;
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật nội dung",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteContent = async (id: string) => {
    if (!isAdmin) return false;

    try {
      const { error } = await supabase
        .from('admin_content')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting content:', error);
        toast({
          title: "Lỗi",
          description: "Không thể xóa nội dung",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Thành công",
        description: "Đã xóa nội dung",
      });

      await fetchContents();
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xóa nội dung",
        variant: "destructive",
      });
      return false;
    }
  };

  const uploadToGitHub = async (file: File, title: string): Promise<string | null> => {
    try {
      // Convert file to base64
      const base64Content = await fileToBase64(file);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const extension = file.name.split('.').pop();
      const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${extension}`;
      
      // GitHub API endpoint
      const githubApiUrl = `https://api.github.com/repos/nghialc-fs/aphdemo/contents/admin-content/${filename}`;
      
      // GitHub API request
      const response = await fetch(githubApiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${process.env.VITE_GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add admin content: ${title}`,
          content: base64Content.split(',')[1], // Remove data:type/subtype;base64, prefix
          committer: {
            name: 'APH Admin',
            email: 'nghialc2@fsb.edu.vn'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const result = await response.json();
      return result.content.download_url;
    } catch (error) {
      console.error('Error uploading to GitHub:', error);
      toast({
        title: "Cảnh báo",
        description: "Không thể upload file lên GitHub, nhưng nội dung vẫn được lưu",
        variant: "destructive",
      });
      return null;
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  useEffect(() => {
    if (isAdmin) {
      fetchContents();
    }
  }, [isAdmin]);

  return {
    contents,
    loading,
    createContent,
    updateContent,
    deleteContent,
    fetchContents,
  };
};