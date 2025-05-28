
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { FileText, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFUpload {
  id: string;
  filename: string;
  file_url: string;
  processing_status: string;
  processed_content: string | null;
  uploaded_at: string;
  processed_at: string | null;
}

interface PDFStatusProps {
  sessionId: string;
}

const PDFStatus = ({ sessionId }: PDFStatusProps) => {
  const [uploads, setUploads] = useState<PDFUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUploads();
    
    // Set up real-time subscription for status updates
    const channel = supabase
      .channel('pdf-uploads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pdf_uploads',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          fetchUploads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_uploads')
        .select('*')
        .eq('session_id', sessionId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setUploads(data || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Processed';
      case 'processing':
        return 'Processing...';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading PDFs...</div>;
  }

  if (uploads.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Uploaded PDFs</h4>
      {uploads.map((upload) => (
        <div key={upload.id} className="flex items-center justify-between p-2 border rounded-lg bg-white">
          <div className="flex items-center gap-2 flex-1">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm truncate">{upload.filename}</span>
            <div className="flex items-center gap-1">
              {getStatusIcon(upload.processing_status)}
              <span className="text-xs text-gray-600">{getStatusText(upload.processing_status)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(upload.file_url, '_blank')}
              className="h-6 w-6 p-0"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PDFStatus;
