
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

    // Load existing processed PDFs for this session
    const loadProcessedPDFs = async () => {
      try {
        const { data, error } = await supabase
          .from('pdf_uploads')
          .select('id, filename, processed_content, processed_at')
          .eq('session_id', sessionId)
          .eq('processing_status', 'completed')
          .not('processed_content', 'is', null);

        if (error) {
          console.error('Error loading processed PDFs:', error);
          return;
        }

        if (data) {
          const results = data.map(item => ({
            id: item.id,
            filename: item.filename,
            processed_content: item.processed_content || '',
            processed_at: item.processed_at || ''
          }));
          setProcessingResults(results);
          console.log('Loaded existing processed PDFs:', results.length);
        }
      } catch (error) {
        console.error('Error loading processed PDFs:', error);
      }
    };

    loadProcessedPDFs();

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
          console.log('PDF processing update received:', newData);
          
          if (newData.processing_status === 'completed' && newData.processed_content) {
            const result: PDFProcessingResult = {
              id: newData.id,
              filename: newData.filename,
              processed_content: newData.processed_content,
              processed_at: newData.processed_at
            };
            
            setProcessingResults(prev => {
              const exists = prev.find(r => r.id === result.id);
              if (exists) {
                // Update existing result
                return prev.map(r => r.id === result.id ? result : r);
              }
              // Add new result
              console.log('Adding new processed PDF to results:', result.filename);
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
    const content = processingResults.map(result => ({
      filename: result.filename,
      content: result.processed_content
    }));
    
    console.log('Getting processed content:', {
      sessionId,
      resultsCount: processingResults.length,
      contentItems: content.length,
      totalContentLength: content.reduce((sum, item) => sum + item.content.length, 0)
    });
    
    return content;
  };

  return {
    processingResults,
    getProcessedContent
  };
};
