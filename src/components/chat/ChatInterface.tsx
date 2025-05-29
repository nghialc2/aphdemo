
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/context/SessionContext";
import { useCompare } from "@/context/CompareContext";
import { usePDFProcessing } from "@/hooks/usePDFProcessing";
import ChatMessageList from "./ChatMessageList";
import ModelSelector from "./ModelSelector";
import ComparisonModelSelectors from "./ComparisonModelSelectors";
import ComparisonView from "./ComparisonView";
import PDFUpload from "./PDFUpload";
import PDFStatus from "./PDFStatus";
import PDFMessage from "./PDFMessage";
import { History, Send, GitCompareArrows, Settings, Paperclip } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContextPrompt from './ContextPrompt';
import ChatTopbar from './ChatTopbar';
import { supabase } from "@/integrations/supabase/client";

const ChatInterface = () => {
  const [inputValue, setInputValue] = useState("");
  const [showContextPrompt, setShowContextPrompt] = useState(false);
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { 
    currentSession, 
    sendMessage, 
    sendComparisonMessage,
    isProcessing,
    updateContextPrompt,
    getContextPrompt,
    getComparisonMessages,
    createNewSession
  } = useSession();
  const {
    isCompareMode,
    toggleCompareMode,
    leftModelId,
    rightModelId
  } = useCompare();
  
  // Get the context prompt for the current session
  const [contextPrompt, setContextPrompt] = useState("");
  
  // Use PDF processing hook
  const { getProcessedContent } = usePDFProcessing(currentSession?.id || '');
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Update the context prompt when the current session changes
  useEffect(() => {
    if (currentSession) {
      setContextPrompt(getContextPrompt(currentSession.id));
      loadUploadedFiles(currentSession.id);
    } else {
      setContextPrompt("");
      setUploadedFiles([]);
    }
  }, [currentSession, getContextPrompt]);

  // Load uploaded files for the current session
  const loadUploadedFiles = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('pdf_uploads')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading uploaded files:', error);
        return;
      }

      setUploadedFiles(data || []);
    } catch (error) {
      console.error('Error loading uploaded files:', error);
    }
  };
  
  // Update context in the context store when it changes locally
  const handleContextChange = (value: string) => {
    setContextPrompt(value);
    if (currentSession) {
      updateContextPrompt(currentSession.id, value);
    }
  };

  // Handle toggle of compare mode
  const handleToggleCompareMode = () => {
    const newCompareMode = !isCompareMode;
    toggleCompareMode();
    
    // If exiting compare mode, create a new session
    if (!newCompareMode) {
      // Clear context prompt
      setContextPrompt("");
      // Create a new session (this will automatically be selected as current)
      createNewSession();
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (inputValue.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get processed PDF content to include in context
      const pdfContent = getProcessedContent();
      let enhancedContextPrompt = contextPrompt;
      
      if (pdfContent.length > 0) {
        const pdfContextAddition = pdfContent.map(pdf => 
          `\n\nContent from ${pdf.filename}:\n${pdf.content}`
        ).join('\n');
        enhancedContextPrompt = contextPrompt + pdfContextAddition;
        
        console.log('Enhanced context with PDF content:', {
          originalPrompt: contextPrompt,
          pdfFiles: pdfContent.length,
          enhancedLength: enhancedContextPrompt.length
        });
      }
      
      if (isCompareMode) {
        // Send comparison message
        await sendComparisonMessage(inputValue, leftModelId, rightModelId, enhancedContextPrompt);
      } else {
        // Send regular message
        await sendMessage(inputValue, enhancedContextPrompt);
      }
      setInputValue("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePDFUploadComplete = (fileData: { id: string; filename: string; fileUrl: string }) => {
    console.log("PDF upload completed:", fileData);
    
    // Add the file to the uploaded files list immediately
    const newFile = {
      id: fileData.id,
      filename: fileData.filename,
      file_url: fileData.fileUrl,
      processing_status: 'pending',
      created_at: new Date().toISOString(),
      session_id: currentSession?.id
    };
    
    setUploadedFiles(prev => [...prev, newFile]);
    setShowPDFUpload(false);
    
    toast({
      title: "PDF uploaded",
      description: `${fileData.filename} is being processed. You can now ask questions about it.`,
    });
  };

  // Get comparison messages if in compare mode
  const comparisonMessages = currentSession 
    ? getComparisonMessages(currentSession.id) 
    : { leftMessages: [], rightMessages: [] };

  return (
    <div className="flex flex-col h-full border-l border-gray-200 w-full">
      <ChatTopbar 
        showContextPrompt={showContextPrompt}
        setShowContextPrompt={setShowContextPrompt}
        isCompareMode={isCompareMode}
        handleToggleCompareMode={handleToggleCompareMode}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {showContextPrompt && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <ContextPrompt 
              value={contextPrompt}
              onChange={handleContextChange}
            />
          </div>
        )}
        
        {/* PDF Status Panel */}
        {currentSession && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <PDFStatus sessionId={currentSession.id} />
          </div>
        )}
        
        <ScrollArea className="flex-1">
          <div className="py-4 px-2">
            {/* Show uploaded files in chat */}
            {uploadedFiles.map((file) => (
              <PDFMessage
                key={file.id}
                filename={file.filename}
                fileUrl={file.file_url}
                status={file.processing_status}
                uploadedAt={file.created_at}
              />
            ))}
            
            {/* Show regular chat messages */}
            {isCompareMode ? (
              <ComparisonView 
                leftMessages={comparisonMessages.leftMessages}
                rightMessages={comparisonMessages.rightMessages}
              />
            ) : (
              <ChatMessageList />
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t border-gray-200 p-4 bg-white space-y-2">
          {/* PDF Upload Section */}
          {showPDFUpload && currentSession && (
            <PDFUpload 
              sessionId={currentSession.id}
              onUploadComplete={handlePDFUploadComplete}
            />
          )}
          
          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPDFUpload(!showPDFUpload)}
              className="flex-shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your prompt here..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isProcessing || inputValue.trim() === ""}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
          {isProcessing && (
            <div className="text-xs text-center mt-2 text-gray-500 animate-pulse">
              Processing your request...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
