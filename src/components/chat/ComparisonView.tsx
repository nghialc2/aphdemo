import { useEffect, useRef, useState } from "react";
import { useSession } from "@/context/SessionContext";
import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/utils";
import { Message, Model } from "@/types";
import { GitCompareArrows, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUpload from "./FileUpload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useToast } from "@/hooks/use-toast";
import FileDisplay from "./FileDisplay";

interface ComparisonViewProps {
  leftMessages: Message[];
  rightMessages: Message[];
}

const ComparisonView = ({ leftMessages, rightMessages }: ComparisonViewProps) => {
  const { availableModels, updateExtractContent, getExtractContent, currentSession } = useSession();
  const { leftModelId, rightModelId } = useCompare();
  const { sendComparisonMessage, isProcessing } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const commonAreaRef = useRef<HTMLDivElement>(null);
  const leftMessagesEndRef = useRef<HTMLDivElement>(null);
  const rightMessagesEndRef = useRef<HTMLDivElement>(null);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Track message counts for auto-scrolling
  const [leftMessageCount, setLeftMessageCount] = useState(0);
  const [prevLeftMessageCount, setPrevLeftMessageCount] = useState(0);
  const [rightMessageCount, setRightMessageCount] = useState(0);
  const [prevRightMessageCount, setPrevRightMessageCount] = useState(0);
  
  // Refs for drop zones
  const leftColumnDivRef = useRef<HTMLDivElement>(null);
  const rightColumnDivRef = useRef<HTMLDivElement>(null);
  const commonAreaDivRef = useRef<HTMLDivElement>(null);
  
  // Drag states
  const [leftDragOver, setLeftDragOver] = useState(false);
  const [rightDragOver, setRightDragOver] = useState(false);
  const [commonDragOver, setCommonDragOver] = useState(false);
  
  // State for separate input fields
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [commonInput, setCommonInput] = useState("");
  
  // Update message counts
  useEffect(() => {
    if (leftMessages) {
      const newCount = leftMessages.length;
      if (newCount !== leftMessageCount) {
        setPrevLeftMessageCount(leftMessageCount);
        setLeftMessageCount(newCount);
      }
    }
  }, [leftMessages, leftMessageCount]);
  
  useEffect(() => {
    if (rightMessages) {
      const newCount = rightMessages.length;
      if (newCount !== rightMessageCount) {
        setPrevRightMessageCount(rightMessageCount);
        setRightMessageCount(newCount);
      }
    }
  }, [rightMessages, rightMessageCount]);
  
  // Synchronized scrolling function - only right column controls both
  const handleRightScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const rightContainer = e.currentTarget;
    const scrollPercent = rightContainer.scrollTop / (rightContainer.scrollHeight - rightContainer.clientHeight);
    
    if (leftScrollRef.current) {
      const leftMaxScroll = leftScrollRef.current.scrollHeight - leftScrollRef.current.clientHeight;
      leftScrollRef.current.scrollTop = scrollPercent * leftMaxScroll;
    }
  };

  // Create invisible spacer in right column to match left column height
  const [rightSpacerHeight, setRightSpacerHeight] = useState(0);
  
  useEffect(() => {
    if (leftScrollRef.current && rightScrollRef.current) {
      // Get actual content heights by measuring the containers
      const leftContentHeight = leftScrollRef.current.scrollHeight;
      const rightContentHeight = rightScrollRef.current.scrollHeight - rightSpacerHeight; // Subtract current spacer
      
      if (leftContentHeight > rightContentHeight) {
        const spacerNeeded = leftContentHeight - rightContentHeight;
        setRightSpacerHeight(spacerNeeded);
      } else {
        setRightSpacerHeight(0);
      }
      
      console.log('Left content:', leftContentHeight, 'Right content:', rightContentHeight);
    }
  }, [leftMessages, rightMessages, rightSpacerHeight]);

  // Auto-scroll effects - scroll to bottom when new messages arrive
  useEffect(() => {
    // Only scroll when new messages arrive
    if (leftMessageCount > prevLeftMessageCount && leftScrollRef.current && rightScrollRef.current) {
      console.log("Scrolling both columns to bottom due to new left message");
      // Scroll both to their respective bottoms
      setTimeout(() => {
        if (rightScrollRef.current && leftScrollRef.current) {
          rightScrollRef.current.scrollTop = rightScrollRef.current.scrollHeight;
          leftScrollRef.current.scrollTop = leftScrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [leftMessageCount, prevLeftMessageCount]);
  
  useEffect(() => {
    // Only scroll when new messages arrive
    if (rightMessageCount > prevRightMessageCount && leftScrollRef.current && rightScrollRef.current) {
      console.log("Scrolling both columns to bottom due to new right message");
      // Scroll both to their respective bottoms
      setTimeout(() => {
        if (rightScrollRef.current && leftScrollRef.current) {
          rightScrollRef.current.scrollTop = rightScrollRef.current.scrollHeight;
          leftScrollRef.current.scrollTop = leftScrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [rightMessageCount, prevRightMessageCount]);
  
  // Ensure URL hash is set for comparison mode
  useEffect(() => {
    if (window.location.hash !== '#comparison') {
      window.location.hash = 'comparison';
    }
  }, []);
  
  // File upload states
  // Left model files
  const {
    selectedFiles: selectedLeftFiles,
    uploadedFiles: uploadedLeftFiles,
    isUploading: isUploadingLeft,
    isProcessing: isProcessingLeft,
    addFiles: addLeftFiles,
    removeFile: removeLeftFile,
    clearFiles: clearLeftFiles,
    uploadFiles: uploadLeftFiles,
  } = useFileUpload();
  
  // Right model files
  const {
    selectedFiles: selectedRightFiles,
    uploadedFiles: uploadedRightFiles,
    isUploading: isUploadingRight,
    isProcessing: isProcessingRight,
    addFiles: addRightFiles,
    removeFile: removeRightFile,
    clearFiles: clearRightFiles,
    uploadFiles: uploadRightFiles,
  } = useFileUpload();
  
  // Common files (for both models)
  const {
    selectedFiles: selectedCommonFiles,
    uploadedFiles: uploadedCommonFiles,
    isUploading: isUploadingCommon,
    isProcessing: isProcessingCommon,
    addFiles: addCommonFiles,
    removeFile: removeCommonFile,
    clearFiles: clearCommonFiles,
    uploadFiles: uploadCommonFiles,
  } = useFileUpload();
  
  // Find model names for display
  const leftModel = availableModels.find(m => m.id === leftModelId) || { name: "Model A" } as Model;
  const rightModel = availableModels.find(m => m.id === rightModelId) || { name: "Model B" } as Model;
  
  // Handle drag over for left column
  const handleLeftDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setLeftDragOver(true);
  };
  
  const handleLeftDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!leftColumnRef.current?.contains(e.relatedTarget as Node)) {
      setLeftDragOver(false);
    }
  };
  
  const handleLeftDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLeftDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addLeftFiles(files);
    }
  };
  
  // Handle drag over for right column
  const handleRightDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setRightDragOver(true);
  };
  
  const handleRightDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!rightColumnRef.current?.contains(e.relatedTarget as Node)) {
      setRightDragOver(false);
    }
  };
  
  const handleRightDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRightDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addRightFiles(files);
    }
  };
  
  // Handle drag over for common area
  const handleCommonDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setCommonDragOver(true);
  };
  
  const handleCommonDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!commonAreaRef.current?.contains(e.relatedTarget as Node)) {
      setCommonDragOver(false);
    }
  };
  
  const handleCommonDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCommonDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addCommonFiles(files);
    }
  };
  
  // Handle submitting messages for each side
  const handleLeftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leftInput.trim() === "" && selectedLeftFiles.length === 0) return;
    
    if (!currentSession) return;
    
    try {
      let messageContent = leftInput;
      let filesProcessed = false;
      
      // Process files if any
      if (selectedLeftFiles.length > 0) {
        console.log('Processing files for left model:', selectedLeftFiles);
        const uploadResult = await uploadLeftFiles(currentSession.id);
        
        if (uploadResult.files.length > 0) {
          filesProcessed = true;
          // Create file info for display in chat
          const fileInfo = uploadResult.files.map(f => `[File: ${f.name}]`).join(' ');
          
          // Update message content for display (include file info)
          messageContent = leftInput.trim() ? 
            `${leftInput}\n\n${fileInfo}` : 
            `${fileInfo}`;
          
          // Store extracted content in session storage
          if (uploadResult.extractedContent && uploadResult.extractedContent.length > 0) {
            try {
              // Store extracted content
              updateExtractContent(currentSession.id, uploadResult.extractedContent);
              
              // Force a small delay to ensure extract content is saved
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Double check the extract content was saved correctly
              const savedContent = getExtractContent(currentSession.id);
              console.log('Verified saved content length:', savedContent.length);
              
              // Count PDF files
              const pdfFiles = uploadResult.files.filter(f => f.type === 'application/pdf');
              
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
          }
        }
      }
      
      // State updates are now synchronous with the cache system
      // No delay needed as we use cache for immediate access
      
      // Verify extract content before sending
      const extractContent = getExtractContent(currentSession.id);
      console.log('Extract content available:', Boolean(extractContent));
      console.log('Extract content length:', extractContent ? extractContent.length : 0);
      
      // Always trim the message content to avoid empty messages
      messageContent = messageContent.trim();
      
      // Don't send empty messages
      if (!messageContent) {
        console.log('No message content to send after processing');
        return;
      }
      
      await sendComparisonMessage(messageContent, leftModelId, null, "");
      setLeftInput("");
      clearLeftFiles();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };
  
  const handleRightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rightInput.trim() === "" && selectedRightFiles.length === 0) return;
    
    if (!currentSession) return;
    
    try {
      let messageContent = rightInput;
      let filesProcessed = false;
      
      // Process files if any
      if (selectedRightFiles.length > 0) {
        console.log('Processing files for right model:', selectedRightFiles);
        const uploadResult = await uploadRightFiles(currentSession.id);
        
        if (uploadResult.files.length > 0) {
          filesProcessed = true;
          // Create file info for display in chat
          const fileInfo = uploadResult.files.map(f => `[File: ${f.name}]`).join(' ');
          
          // Update message content for display (include file info)
          messageContent = rightInput.trim() ? 
            `${rightInput}\n\n${fileInfo}` : 
            `${fileInfo}`;
          
          // Store extracted content in session storage
          if (uploadResult.extractedContent && uploadResult.extractedContent.length > 0) {
            try {
              // Store extracted content
              updateExtractContent(currentSession.id, uploadResult.extractedContent);
              
              // Force a small delay to ensure extract content is saved
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Double check the extract content was saved correctly
              const savedContent = getExtractContent(currentSession.id);
              console.log('Verified saved content length:', savedContent.length);
              
              // Count PDF files
              const pdfFiles = uploadResult.files.filter(f => f.type === 'application/pdf');
              
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
          }
        }
      }
      
      // State updates are now synchronous with the cache system
      // No delay needed as we use cache for immediate access
      
      // Verify extract content before sending
      const extractContent = getExtractContent(currentSession.id);
      console.log('Extract content available:', Boolean(extractContent));
      console.log('Extract content length:', extractContent ? extractContent.length : 0);
      
      // Always trim the message content to avoid empty messages
      messageContent = messageContent.trim();
      
      // Don't send empty messages
      if (!messageContent) {
        console.log('No message content to send after processing');
        return;
      }
      
      await sendComparisonMessage(messageContent, null, rightModelId, "");
      setRightInput("");
      clearRightFiles();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };
  
  // Handle submitting common message to both models
  const handleCommonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (commonInput.trim() === "" && selectedCommonFiles.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tin nhắn hoặc chọn file",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentSession) return;
    
    try {
      let messageContent = commonInput;
      let filesProcessed = false;
      
      // Process files if any
      if (selectedCommonFiles.length > 0) {
        console.log('Processing files for both models:', selectedCommonFiles);
        const uploadResult = await uploadCommonFiles(currentSession.id);
        
        if (uploadResult.files.length > 0) {
          filesProcessed = true;
          // Create file info for display in chat
          const fileInfo = uploadResult.files.map(f => `[File: ${f.name}]`).join(' ');
          
          // Update message content for display (include file info)
          messageContent = commonInput.trim() ? 
            `${commonInput}\n\n${fileInfo}` : 
            `${fileInfo}`;
          
          // Store extracted content in session storage
          if (uploadResult.extractedContent && uploadResult.extractedContent.length > 0) {
            try {
              console.log('Extracted content length:', uploadResult.extractedContent.length);
              console.log('Storing extracted content in session:', uploadResult.extractedContent.substring(0, 200) + '...');
              
              // Store extracted content
              updateExtractContent(currentSession.id, uploadResult.extractedContent);
              
              // Force a small delay to ensure extract content is saved
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Double check the extract content was saved correctly
              const savedContent = getExtractContent(currentSession.id);
              console.log('Verified saved content length:', savedContent.length);
              
              // Count PDF files
              const pdfFiles = uploadResult.files.filter(f => f.type === 'application/pdf');
              
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
      
      // State updates are now synchronous with the cache system
      // No delay needed as we use cache for immediate access
      
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
      
      await sendComparisonMessage(messageContent, leftModelId, rightModelId, "");
      setCommonInput("");
      clearCommonFiles();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-[1.2fr_1fr] flex-1 overflow-hidden min-h-0">
        {/* Left Model Column */}
        <div 
          ref={leftColumnRef}
          className={cn(
            "border-r border-gray-200 relative flex flex-col min-h-0",
            leftDragOver && "bg-blue-50"
          )}
          onDragOver={handleLeftDragOver}
          onDragLeave={handleLeftDragLeave}
          onDrop={handleLeftDrop}
        >
          {/* Drag overlay for left column */}
          {leftDragOver && (
            <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-4 shadow-lg text-center">
                <p className="text-blue-600 font-medium">Thả file vào đây</p>
                <p className="text-xs text-blue-500">Gửi đến {leftModel.name}</p>
              </div>
            </div>
          )}
          
          <div className="sticky top-0 bg-white p-2 mb-2 z-10 flex items-center justify-center flex-shrink-0">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {leftModel.name}
            </span>
          </div>
          <div 
            ref={leftScrollRef}
            className="h-full overflow-y-hidden py-6 px-4"
          >
              {leftMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="mb-2 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <GitCompareArrows className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    Nhắn tin để bắt đầu trò chuyện với {leftModel.name}
                  </p>
                </div>
              ) : (
                leftMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "chat-message mb-4",
                      message.role === "user" ? "user-message" : "assistant-message"
                    )}
                  >
                    <div className="flex items-start">
                      <div className={cn(
                        "w-6 h-6 rounded-full mr-3 flex-shrink-0 flex items-center justify-center",
                        message.role === "user" ? "bg-fpt-orange" : "bg-fpt-blue"
                      )}>
                        <span className="text-xs text-white font-bold">
                          {message.role === "user" ? "U" : "L"}
                        </span>
                      </div>
                      <div className="space-y-1 flex-1">
                        <p className="text-xs font-medium text-gray-500">
                          {message.role === "user" ? "Bạn" : leftModel.name}
                        </p>
                        <div className="message-content whitespace-pre-wrap">
                          {/* Display files if any */}
                          {message.hasFiles && message.fileNames && message.fileNames.length > 0 && (
                            <div className="mb-3 space-y-2">
                              {message.fileNames.map((fileName, index) => (
                                <FileDisplay 
                                  key={`${message.id}-file-${index}`}
                                  fileName={fileName}
                                  isProcessed={fileName.toLowerCase().endsWith('.pdf')}
                                />
                              ))}
                            </div>
                          )}
                          
                          {/* Display message content (excluding file info) */}
                          {message.content && (
                            <div className="whitespace-pre-wrap">
                              {/* Strip any [File: filename.pdf] text from displayed content */}
                              {message.content.replace(/\[File: .*?\]/g, '').trim()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              
              <div ref={leftMessagesEndRef} style={{ height: '1px' }} />
          </div>
        </div>
        
        {/* Right Model Column */}
        <div 
          ref={rightColumnRef}
          className={cn(
            "relative flex flex-col min-h-0",
            rightDragOver && "bg-green-50"
          )}
          onDragOver={handleRightDragOver}
          onDragLeave={handleRightDragLeave}
          onDrop={handleRightDrop}
        >
          {/* Drag overlay for right column */}
          {rightDragOver && (
            <div className="absolute inset-0 bg-green-500/10 border-2 border-dashed border-green-500 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-4 shadow-lg text-center">
                <p className="text-green-600 font-medium">Thả file vào đây</p>
                <p className="text-xs text-green-500">Gửi đến {rightModel.name}</p>
              </div>
            </div>
          )}
          
          <div className="sticky top-0 bg-white p-2 mb-2 z-10 flex items-center justify-center flex-shrink-0">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {rightModel.name}
            </span>
          </div>
          <div 
            ref={rightScrollRef}
            className="h-full overflow-y-scroll py-6 px-4"
            onScroll={handleRightScroll}
            style={{ scrollbarWidth: 'thin' }}
          >
              {rightMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="mb-2 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <GitCompareArrows className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    Nhắn tin để bắt đầu trò chuyện với {rightModel.name}
                  </p>
                </div>
              ) : (
                rightMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "chat-message mb-4",
                      message.role === "user" ? "user-message" : "assistant-message"
                    )}
                  >
                    <div className="flex items-start">
                      <div className={cn(
                        "w-6 h-6 rounded-full mr-3 flex-shrink-0 flex items-center justify-center",
                        message.role === "user" ? "bg-fpt-orange" : "bg-green-600"
                      )}>
                        <span className="text-xs text-white font-bold">
                          {message.role === "user" ? "U" : "R"}
                        </span>
                      </div>
                      <div className="space-y-1 flex-1">
                        <p className="text-xs font-medium text-gray-500">
                          {message.role === "user" ? "Bạn" : rightModel.name}
                        </p>
                        <div className="message-content whitespace-pre-wrap">
                          {/* Display files if any */}
                          {message.hasFiles && message.fileNames && message.fileNames.length > 0 && (
                            <div className="mb-3 space-y-2">
                              {message.fileNames.map((fileName, index) => (
                                <FileDisplay 
                                  key={`${message.id}-file-${index}`}
                                  fileName={fileName}
                                  isProcessed={fileName.toLowerCase().endsWith('.pdf')}
                                />
                              ))}
                            </div>
                          )}
                          
                          {/* Display message content (excluding file info) */}
                          {message.content && (
                            <div className="whitespace-pre-wrap">
                              {message.content.replace(/\[File: .*?\]/g, '').trim()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              
              <div ref={rightMessagesEndRef} style={{ height: '1px' }} />
              
              {/* Invisible spacer to match left column height */}
              {rightSpacerHeight > 0 && (
                <div style={{ height: `${rightSpacerHeight}px` }} className="w-full" />
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;