
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/context/SessionContext";
import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/utils";
import { Message, Model } from "@/types";
import { GitCompareArrows, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ComparisonViewProps {
  leftMessages: Message[];
  rightMessages: Message[];
}

const ComparisonView = ({ leftMessages, rightMessages }: ComparisonViewProps) => {
  const { availableModels, sendComparisonMessage, isProcessing, getContextPrompt, currentSession } = useSession();
  const { leftModelId, rightModelId } = useCompare();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [leftInputValue, setLeftInputValue] = useState("");
  const [rightInputValue, setRightInputValue] = useState("");
  const { toast } = useToast();
  
  // Find model names for display
  const leftModel = availableModels.find(m => m.id === leftModelId) || { name: "Model A" } as Model;
  const rightModel = availableModels.find(m => m.id === rightModelId) || { name: "Model B" } as Model;
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [leftMessages, rightMessages]);
  
  // Make sure we have valid arrays to work with
  const safeLeftMessages = Array.isArray(leftMessages) ? leftMessages : [];
  const safeRightMessages = Array.isArray(rightMessages) ? rightMessages : [];
  
  const handleSubmit = async (inputValue: string, modelId: string) => {
    if (inputValue.trim() === "") {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tin nhắn",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get context prompt for current session
      const contextPrompt = currentSession ? getContextPrompt(currentSession.id) : "";
      
      // Send comparison message
      await sendComparisonMessage(inputValue, leftModelId, rightModelId, contextPrompt);
      
      // Clear both inputs after sending
      setLeftInputValue("");
      setRightInputValue("");
    } catch (error) {
      console.error("Error sending comparison message:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };
  
  // Show placeholder if no messages
  if (safeLeftMessages.length === 0 && safeRightMessages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="mb-2 w-12 h-12 bg-fpt-blue/10 rounded-full flex items-center justify-center mx-auto">
              <GitCompareArrows className="h-6 w-6 text-fpt-blue" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 font-bold">
              Chế độ so sánh đã kích hoạt
            </h3>
            <p className="text-gray-700 text-sm mt-2 max-w-sm">
              Gửi tin nhắn để xem phản hồi từ cả hai mô hình cạnh nhau.
            </p>
          </div>
        </div>
        
        {/* Fixed input form at bottom */}
        <div className="border-t border-gray-200 p-4 bg-white sticky bottom-0">
          <div className="grid grid-cols-2 gap-2">
            <div className="border-r pr-2">
              <p className="text-xs font-medium text-gray-600 mb-2 text-center">{leftModel.name}</p>
              <div className="flex space-x-2">
                <Input
                  value={leftInputValue}
                  onChange={(e) => setLeftInputValue(e.target.value)}
                  placeholder="Nhập câu hỏi của bạn..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleSubmit(leftInputValue, leftModelId)}
                  disabled={isProcessing || leftInputValue.trim() === ""}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2 text-center">{rightModel.name}</p>
              <div className="flex space-x-2">
                <Input
                  value={rightInputValue}
                  onChange={(e) => setRightInputValue(e.target.value)}
                  placeholder="Nhập câu hỏi của bạn..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleSubmit(rightInputValue, rightModelId)}
                  disabled={isProcessing || rightInputValue.trim() === ""}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {isProcessing && (
            <div className="text-xs text-center mt-2 text-gray-500 animate-pulse">
              Đang so sánh mô hình...
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full relative">
      {/* Scrollable messages container with specific height to allow for fixed input */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="grid grid-cols-2 gap-2 py-4 px-2">
          <div className="border-r pr-2">
            <div className="sticky top-0 bg-white p-2 mb-2 z-10 flex items-center justify-center">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {leftModel.name}
              </span>
            </div>
            <div className="overflow-y-auto">
              {safeLeftMessages.map((message) => (
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
                      <p className="text-xs font-medium text-gray-600">
                        {message.role === "user" ? "Bạn" : leftModel.name}
                      </p>
                      <div className="message-content whitespace-pre-wrap text-gray-900">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pl-2">
            <div className="sticky top-0 bg-white p-2 mb-2 z-10 flex items-center justify-center">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {rightModel.name}
              </span>
            </div>
            <div className="overflow-y-auto">
              {safeRightMessages.map((message) => (
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
                      <p className="text-xs font-medium text-gray-600">
                        {message.role === "user" ? "Bạn" : rightModel.name}
                      </p>
                      <div className="message-content whitespace-pre-wrap text-gray-900">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Fixed input form at the bottom */}
      <div className="border-t border-gray-200 p-4 bg-white absolute bottom-0 left-0 right-0">
        <div className="grid grid-cols-2 gap-2">
          <div className="border-r pr-2">
            <p className="text-xs font-medium text-gray-600 mb-2 text-center">{leftModel.name}</p>
            <div className="flex space-x-2">
              <Input
                value={leftInputValue}
                onChange={(e) => setLeftInputValue(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={isProcessing}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSubmit(leftInputValue, leftModelId)}
                disabled={isProcessing || leftInputValue.trim() === ""}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2 text-center">{rightModel.name}</p>
            <div className="flex space-x-2">
              <Input
                value={rightInputValue}
                onChange={(e) => setRightInputValue(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={isProcessing}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSubmit(rightInputValue, rightModelId)}
                disabled={isProcessing || rightInputValue.trim() === ""}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {isProcessing && (
          <div className="text-xs text-center mt-2 text-gray-500 animate-pulse">
            Đang so sánh mô hình...
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonView;
