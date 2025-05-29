
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, X, File } from "lucide-react";

interface PDFUploadProps {
  sessionId: string;
  onUploadComplete: (fileData: { id: string; filename: string; fileUrl: string }) => void;
}

const PDFUpload = ({ sessionId, onUploadComplete }: PDFUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select a PDF file smaller than 10MB.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile && validateFile(pdfFile)) {
      setSelectedFile(pdfFile);
    } else if (files.length > 0 && !pdfFile) {
      toast({
        title: "Invalid file type",
        description: "Please drop a PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const uploadPDF = async () => {
    if (!selectedFile) return;

    setUploading(true);
    
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${selectedFile.name}`;
      const filePath = `${sessionId}/${fileName}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pdf-uploads')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pdf-uploads')
        .getPublicUrl(filePath);

      // Insert record into database
      const { data: dbData, error: dbError } = await supabase
        .from('pdf_uploads')
        .insert({
          session_id: sessionId,
          filename: selectedFile.name,
          file_url: publicUrl,
          file_size: selectedFile.size,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      console.log("PDF uploaded successfully:", dbData);
      
      // Trigger n8n workflow with uploadId
      await triggerN8nWorkflow(dbData.id, publicUrl, selectedFile.name);
      
      onUploadComplete({
        id: dbData.id,
        filename: selectedFile.name,
        fileUrl: publicUrl
      });

      toast({
        title: "PDF uploaded successfully",
        description: "Your PDF is being processed...",
      });

      setSelectedFile(null);
      
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerN8nWorkflow = async (uploadId: string, fileUrl: string, filename: string) => {
    try {
      // Updated n8n webhook URL to include uploadId as query parameter
      const webhookUrl = `https://n8n.srv798777.hstgr.cloud/webhook/pdf-processing?uploadId=${uploadId}`;
      
      console.log(`Triggering n8n workflow: ${webhookUrl}`);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId,
          fileUrl,
          filename,
          sessionId,
          // Also include the webhook URL for n8n to call back
          callbackUrl: `https://klsjwhmybgjhlcjwjset.supabase.co/functions/v1/pdf-processing-webhook?uploadId=${uploadId}`
        }),
      });

      if (!response.ok) {
        console.error('Failed to trigger n8n workflow');
      } else {
        console.log('n8n workflow triggered successfully');
      }
    } catch (error) {
      console.error('Error triggering n8n workflow:', error);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={`
          border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
        `}
      >
        <div className="flex flex-col items-center space-y-2">
          <File className="h-8 w-8 text-gray-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              Drop your PDF here or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Maximum file size: 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Selected File Display */}
      {selectedFile && (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-white">
          <FileText className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              onClick={uploadPDF}
              disabled={uploading}
              size="sm"
            >
              {uploading ? "Uploading..." : "Process"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUpload;
