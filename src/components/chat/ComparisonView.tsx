
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/context/SessionContext";
import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/utils";
import { Message, Model } from "@/types";
import { GitCompareArrows, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ComparisonViewProps {
  leftMessages: Message[];
  rightMessages: Message[];
}

const ComparisonView = ({ leftMessages, rightMessages }: ComparisonViewProps) => {
  const { availableModels } = useSession();
  const { leftModelId, rightModelId } = useCompare();
  const { sendComparisonMessage, isProcessing } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for separate input fields
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  
  // Find model names for display
  const leftModel = availableModels.find(m => m.id === leftModelId) || { name: "Model A" } as Model;
  const rightModel = availableModels.find(m => m.id === rightModelId) || { name: "Model B" } as Model;
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [leftMessages, rightMessages]);
  
  // Make sure we have valid arrays to work with
  const safeLeftMessages = Array.isArray(leftMessages) ? leftMessages : [];
  const safeRightMessages = Array.isArray(rightMessages) ? rightMessages : [];
  
  // Handle submitting messages for each side
  const handleLeftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leftInput.trim() === "") return;
    
    await sendComparisonMessage(leftInput, leftModelId, null, "");
    setLeftInput("");
  };
  
  const handleRightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rightInput.trim() === "") return;
    
    await sendComparisonMessage(rightInput, null, rightModelId, "");
    setRightInput("");
  };
  
  return (
    <div className="grid grid-cols-2 gap-2 h-full">
      {/* Left Model Column */}
      <div className="border-r pr-2 flex flex-col h-full">
        <div className="sticky top-0 bg-white p-2 mb-2 z-10 flex items-center justify-center">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {leftModel.name}
          </span>
        </div>
        <div className="overflow-y-auto flex-1 py-4 px-2">
          {safeLeftMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="mb-2 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <GitCompareArrows className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Nhắn tin để bắt đầu trò chuyện với {leftModel.name}
              </p>
            </div>
          ) : (
            safeLeftMessages.map((message) => (
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
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-gray-200 p-4 bg-white mt-auto">
          <form onSubmit={handleLeftSubmit} className="flex space-x-2">
            <Input
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder={`Nhắn tin với ${leftModel.name}...`}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isProcessing || leftInput.trim() === ""}
            >
              <Send className="h-4 w-4 mr-2" />
              Gửi
            </Button>
          </form>
        </div>
      </div>
      
      {/* Right Model Column */}
      <div className="pl-2 flex flex-col h-full">
        <div className="sticky top-0 bg-white p-2 mb-2 z-10 flex items-center justify-center">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {rightModel.name}
          </span>
        </div>
        <div className="overflow-y-auto flex-1 py-4 px-2">
          {safeRightMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="mb-2 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <GitCompareArrows className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Nhắn tin để bắt đầu trò chuyện với {rightModel.name}
              </p>
            </div>
          ) : (
            safeRightMessages.map((message) => (
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
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-gray-200 p-4 bg-white mt-auto">
          <form onSubmit={handleRightSubmit} className="flex space-x-2">
            <Input
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder={`Nhắn tin với ${rightModel.name}...`}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isProcessing || rightInput.trim() === ""}
            >
              <Send className="h-4 w-4 mr-2" />
              Gửi
            </Button>
          </form>
        </div>
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ComparisonView;
