
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useFileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const addFiles = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  const uploadFiles = async (sessionId: string) => {
    if (selectedFiles.length === 0) return [];

    setIsUploading(true);
    const uploadedFiles = [];

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sessionId', sessionId);

        // Simulate upload - replace with actual upload logic
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          uploadedFiles.push({
            id: result.id,
            name: file.name,
            type: file.type,
            size: file.size,
            url: result.url,
          });
        } else {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      toast({
        title: "Thành công",
        description: `Đã upload ${uploadedFiles.length} file thành công.`,
      });

      clearFiles();
      return uploadedFiles;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Lỗi upload",
        description: "Có lỗi xảy ra khi upload file. Vui lòng thử lại.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  return {
    selectedFiles,
    isUploading,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
  };
};
