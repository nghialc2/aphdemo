
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  extractedContent?: string;
}

export const useFileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const addFiles = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setUploadedFiles([]);
  };

  const extractPdfContent = async (file: File): Promise<string> => {
    try {
      // Using pdf-js to extract text content
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
      
      const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('Error extracting PDF content:', error);
      return '';
    }
  };

  const uploadFiles = async (sessionId: string): Promise<UploadedFile[]> => {
    if (selectedFiles.length === 0) return [];

    setIsUploading(true);
    const newUploadedFiles: UploadedFile[] = [];

    try {
      for (const file of selectedFiles) {
        // Create uploaded file entry first for immediate display
        const uploadedFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          url: '', // Will be updated after actual upload
        };

        newUploadedFiles.push(uploadedFile);

        // If it's a PDF, extract content
        if (file.type === 'application/pdf') {
          setIsProcessing(true);
          try {
            const extractedContent = await extractPdfContent(file);
            uploadedFile.extractedContent = extractedContent;
            
            toast({
              title: "PDF đã được xử lý",
              description: `Đã trích xuất nội dung từ ${file.name}`,
            });
          } catch (error) {
            console.error('Error processing PDF:', error);
            toast({
              title: "Lỗi xử lý PDF",
              description: `Không thể trích xuất nội dung từ ${file.name}`,
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        }

        // Simulate file upload to storage
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('sessionId', sessionId);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            uploadedFile.url = result.url;
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }

      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      clearFiles();

      toast({
        title: "Thành công",
        description: `Đã upload ${newUploadedFiles.length} file thành công.`,
      });

      return newUploadedFiles;
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
    uploadedFiles,
    isUploading,
    isProcessing,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
  };
};
