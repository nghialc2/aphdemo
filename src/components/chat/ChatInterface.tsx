import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/context/SessionContext";
import { useCompare } from "@/context/CompareContext";
import { useFileUpload } from "@/hooks/useFileUpload";
import ChatMessageList from "./ChatMessageList";
import ModelSelector from "./ModelSelector";
import ComparisonModelSelectors from "./ComparisonModelSelectors";
import ComparisonView from "./ComparisonView";
import FileUpload from "./FileUpload";
import UploadedFilesDisplay from "./UploadedFilesDisplay";
import { History, Send, GitCompareArrows, Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContextPrompt from './ContextPrompt';
import ChatTopbar from './ChatTopbar';

const ChatInterface = () => {
  const [inputValue, setInputValue] = useState("");
  const [showContextPrompt, setShowContextPrompt] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { 
    sessions,
    currentSession, 
    sendMessage, 
    sendComparisonMessage,
    isProcessing,
    updateContextPrompt,
    getContextPrompt,
    updateExtractContent,
    getExtractContent,
    getComparisonMessages,
    createNewSession
  } = useSession();
  
  const {
    isCompareMode,
    toggleCompareMode,
    leftModelId,
    rightModelId
  } = useCompare();

  const {
    selectedFiles,
    uploadedFiles,
    isUploading,
    isProcessing: isFileProcessing,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
  } = useFileUpload();
  
  // Get the context prompt for the current session
  const [contextPrompt, setContextPrompt] = useState("");
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Update the context prompt when the current session changes
  useEffect(() => {
    if (currentSession) {
      setContextPrompt(getContextPrompt(currentSession.id));
    } else {
      setContextPrompt("");
    }
  }, [currentSession, getContextPrompt]);
  
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
    
    // Create a new session either way - helps track comparison sessions separately
    // Clear context prompt
    setContextPrompt("");
    // Create a new session (this will automatically be selected as current)
    createNewSession();
  };

  // Handle drag events for the entire chat container
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only hide drag overlay if leaving the chat container
    if (!chatContainerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Don't process files if in comparison mode, let ComparisonView handle it
    if (isCompareMode) {
      toast({
        title: "Lưu ý",
        description: "Vui lòng sử dụng chức năng upload file bên trong các khung chat",
      });
      return;
    }
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (inputValue.trim() === "" && selectedFiles.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tin nhắn hoặc chọn file",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have a current session
    if (!currentSession) {
      createNewSession();
      return;
    }
    
    try {
      let messageContent = inputValue;
      let filesProcessed = false;
      
      // Process files if any
      if (selectedFiles.length > 0) {
        console.log('Processing files for submission:', selectedFiles);
        const uploadResult = await uploadFiles(currentSession.id);
        
        if (uploadResult.files.length > 0) {
          filesProcessed = true;
          // Create file info for display in chat
          const fileInfo = uploadResult.files.map(f => `[File: ${f.name}]`).join(' ');
          
          // Update message content for display (include file info)
          messageContent = inputValue.trim() ? 
            `${inputValue}\n\n${fileInfo}` : 
            `${fileInfo}`;
          
          // Store extracted content in session storage
          if (uploadResult.extractedContent && uploadResult.extractedContent.length > 0) {
            console.log('Extracted content length:', uploadResult.extractedContent.length);
            console.log('Storing extracted content in session:', uploadResult.extractedContent.substring(0, 200) + '...');
            
            // Count PDF files
            const pdfFiles = uploadResult.files.filter(f => f.type === 'application/pdf');
            
            try {
              // Store extracted content
              updateExtractContent(currentSession.id, uploadResult.extractedContent);
              
              // Force a small delay to ensure extract content is saved
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Double check the extract content was saved correctly
              const savedContent = getExtractContent(currentSession.id);
              console.log('Verified saved content length:', savedContent.length);
              
              // Show success toast
              toast({
                title: `Đã xử lý ${uploadResult.files.length} file`,
                description: `Đã trích xuất ${uploadResult.extractedContent.length.toLocaleString()} ký tự từ ${pdfFiles.length} file PDF`,
              });
            } catch (error) {
              console.error('Error saving extracted content:', error);
              toast({
                title: "Lỗi lưu trữ",
                description: "Không thể lưu trữ nội dung được trích xuất từ PDF",
                variant: "destructive",
              });
            }
          } else {
            console.log('No extracted content available from upload result');
          }
        }
      }
      
      // Small delay to ensure state updates have been processed
      if (filesProcessed) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Verify and log extract content before sending
      const extractContent = getExtractContent(currentSession.id);
      console.log('Extract content available:', Boolean(extractContent));
      console.log('Extract content length:', extractContent ? extractContent.length : 0);
      if (extractContent && extractContent.length > 0) {
        console.log('First 200 chars of extract content:', extractContent.substring(0, 200) + '...');
      }
      
      // Always trim the message content to avoid empty messages
      messageContent = messageContent.trim();
      
      // Don't send empty messages
      if (!messageContent) {
        console.log('No message content to send after processing');
        return;
      }
      
      // Only send messages in normal mode
      if (!isCompareMode) {
        // Send regular message
        await sendMessage(messageContent, contextPrompt);
      } else {
        // We shouldn't get here since the input is hidden in comparison mode
        console.log('Message not sent: comparison mode active');
        return;
      }
      
      setInputValue("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // Get comparison messages if in compare mode
  const comparisonMessages = currentSession 
    ? getComparisonMessages(currentSession.id) 
    : { leftMessages: [], rightMessages: [] };

  return (
    <div 
      ref={chatContainerRef}
      className="flex flex-col h-full border-l border-gray-200 w-full relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-blue-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-700">Thả file vào đây</p>
            <p className="text-sm text-gray-500">Hỗ trợ tất cả các loại file</p>
          </div>
        </div>
      )}

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
        
        <ScrollArea className="flex-1" type="always">
          {isCompareMode ? (
            <ComparisonView 
              leftMessages={comparisonMessages.leftMessages}
              rightMessages={comparisonMessages.rightMessages}
            />
          ) : (
            <ChatMessageList />
          )}
        </ScrollArea>
        
        <div className="border-t border-gray-200 p-4 bg-white">
          {!isCompareMode && (
            <FileUpload
              onFileSelect={addFiles}
              selectedFiles={selectedFiles}
              onRemoveFile={removeFile}
              disabled={isProcessing || isUploading || isFileProcessing}
            />
          )}
          
          {!isCompareMode && (
            <form onSubmit={handleSubmit} className="flex space-x-2 mt-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tin nhắn của bạn..."
                disabled={isProcessing || isUploading || isFileProcessing}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isProcessing || isUploading || isFileProcessing || (inputValue.trim() === "" && selectedFiles.length === 0)}
              >
                <Send className="h-4 w-4 mr-2" />
                Gửi
              </Button>
            </form>
          )}
          {(isProcessing || isUploading || isFileProcessing) && (
            <div className="text-xs text-center mt-2 text-gray-500 animate-pulse">
              {isFileProcessing ? "Đang xử lý PDF..." : isUploading ? "Đang upload file..." : "Đang xử lý yêu cầu..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
