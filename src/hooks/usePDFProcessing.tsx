
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PDFProcessingResult {
  id: string;
  filename: string;
  processed_content: string;
  processed_at: string;
}

export const usePDFProcessing = (sessionId: string) => {
  const [processingResults, setProcessingResults] = useState<PDFProcessingResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!sessionId) return;

    // Set up real-time subscription for processing completions
    const channel = supabase
      .channel('pdf-processing-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pdf_uploads',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newData = payload.new as any;
          
          if (newData.processing_status === 'completed' && newData.processed_content) {
            const result: PDFProcessingResult = {
              id: newData.id,
              filename: newData.filename,
              processed_content: newData.processed_content,
              processed_at: newData.processed_at
            };
            
            setProcessingResults(prev => {
              const exists = prev.find(r => r.id === result.id);
              if (exists) return prev;
              return [...prev, result];
            });

            toast({
              title: "PDF processed successfully",
              description: `${newData.filename} has been processed and is ready to use in chat.`,
            });
          } else if (newData.processing_status === 'failed') {
            toast({
              title: "PDF processing failed",
              description: `Failed to process ${newData.filename}. Please try uploading again.`,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, toast]);

  const getProcessedContent = () => {
    return processingResults.map(result => ({
      filename: result.filename,
      content: result.processed_content
    }));
  };

  return {
    processingResults,
    getProcessedContent
  };
};
