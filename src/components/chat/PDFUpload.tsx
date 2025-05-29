
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, X } from "lucide-react";

interface PDFUploadProps {
  sessionId: string;
  onUploadComplete: (fileData: { id: string; filename: string; fileUrl: string }) => void;
}

const PDFUpload = ({ sessionId, onUploadComplete }: PDFUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a PDF file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
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
      
      // Trigger n8n workflow
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
      const response = await fetch('https://n8n.srv798777.hstgr.cloud/webhook/pdf-processing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId,
          fileUrl,
          filename,
          sessionId
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
  };

  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
      {!selectedFile ? (
        <>
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </span>
            </Button>
          </label>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-1">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm truncate">{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <Button
            onClick={uploadPDF}
            disabled={uploading}
            size="sm"
          >
            {uploading ? "Uploading..." : "Process"}
          </Button>
        </>
      )}
    </div>
  );
};

export default PDFUpload;
