
import { useEffect, useRef } from "react";
import { useSession } from "@/context/SessionContext";
import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/utils";
import { Message, Model } from "@/types";
import { GitCompareArrows } from "lucide-react";

interface ComparisonViewProps {
  leftMessages: Message[];
  rightMessages: Message[];
}

const ComparisonView = ({ leftMessages, rightMessages }: ComparisonViewProps) => {
  const { availableModels } = useSession();
  const { leftModelId, rightModelId } = useCompare();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Find model names for display
  const leftModel = availableModels.find(m => m.id === leftModelId) || { name: "Model A" } as Model;
  const rightModel = availableModels.find(m => m.id === rightModelId) || { name: "Model B" } as Model;
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [leftMessages, rightMessages]);
  
  // Make sure we have valid arrays to work with
  const safeLeftMessages = Array.isArray(leftMessages) ? leftMessages : [];
  const safeRightMessages = Array.isArray(rightMessages) ? rightMessages : [];
  
  // Show placeholder if no messages
  if (safeLeftMessages.length === 0 && safeRightMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 dark:text-gray-300">
        <div className="mb-2 w-12 h-12 bg-fpt-blue/10 dark:bg-fpt-blue/20 rounded-full flex items-center justify-center">
          <GitCompareArrows className="h-6 w-6 text-fpt-blue" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
          Comparison Mode Active
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-sm">
          Send a message to see responses from both models side by side.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 gap-2 py-4 px-2 dark:bg-dark-background">
      <div className="border-r dark:border-dark-border pr-2">
        <div className="sticky top-0 bg-white dark:bg-dark-card p-2 mb-2 z-10 flex items-center justify-center">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-full text-sm font-medium">
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
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {message.role === "user" ? "You" : leftModel.name}
                  </p>
                  <div className="message-content whitespace-pre-wrap dark:text-gray-200">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pl-2">
        <div className="sticky top-0 bg-white dark:bg-dark-card p-2 mb-2 z-10 flex items-center justify-center">
          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-full text-sm font-medium">
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
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {message.role === "user" ? "You" : rightModel.name}
                  </p>
                  <div className="message-content whitespace-pre-wrap dark:text-gray-200">
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
  );
};

export default ComparisonView;
