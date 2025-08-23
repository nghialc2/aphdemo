
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/insights/client';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  url: string;
  name: string;
}

export const useFileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const addFiles = (files: FileList | File[]) => {
    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setUploadedFiles([]);
  };

  const uploadFiles = async (sessionId?: string) => {
    if (selectedFiles.length === 0) {
      return { success: false, urls: [] };
    }

    setIsUploading(true);
    const urls: string[] = [];

    try {
      for (const file of selectedFiles) {
        const fileExtension = file.name.split('.').pop() || 'bin';
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const filePath = `uploads/${sessionId || 'general'}/${timestamp}_${randomId}.${fileExtension}`;
        
        console.log('Uploading file to:', filePath);
        
        const { data, error } = await supabase.storage
          .from('sources')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error);
          throw error;
        }

        console.log('File uploaded successfully:', data);
        
        const { data: urlData } = supabase.storage
          .from('sources')
          .getPublicUrl(filePath);
        
        urls.push(urlData.publicUrl);
        setUploadedFiles(prev => [...prev, { url: urlData.publicUrl, name: file.name }]);
      }

      setSelectedFiles([]);
      return { success: true, urls };
    } catch (error) {
      console.error('File upload failed:', error);
      toast({
        title: "Upload Error",
        description: `Failed to upload files. Please try again.`,
        variant: "destructive",
      });
      return { success: false, urls: [] };
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFile = async (file: File, notebookId: string, sourceId: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      const fileExtension = file.name.split('.').pop() || 'bin';
      const filePath = `${notebookId}/${sourceId}.${fileExtension}`;
      
      console.log('Uploading file to:', filePath);
      
      const { data, error } = await supabase.storage
        .from('sources')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('File uploaded successfully:', data);
      return filePath;
    } catch (error) {
      console.error('File upload failed:', error);
      toast({
        title: "Upload Error",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const getFileUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('sources')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  return {
    selectedFiles,
    uploadedFiles,
    isUploading,
    isProcessing,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    uploadFile,
    getFileUrl,
  };
};
