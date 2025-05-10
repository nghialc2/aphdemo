
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/context/SessionContext";
import { useCompare } from "@/context/CompareContext";
import ChatMessageList from "./ChatMessageList";
import ComparisonView from "./ComparisonView";
import { Send } from "lucide-react";
import ContextPrompt from './ContextPrompt';
import ChatTopbar from './ChatTopbar';

const ChatInterface = () => {
  const [inputValue, setInputValue] = useState("");
  const [showContextPrompt, setShowContextPrompt] = useState(false);
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
      if (isCompareMode) {
        // Send comparison message
        await sendComparisonMessage(inputValue, leftModelId, rightModelId, contextPrompt);
      } else {
        // Send regular message
        await sendMessage(inputValue, contextPrompt);
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
      
      <div className="flex flex-col h-full">
        {showContextPrompt && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <ContextPrompt 
              value={contextPrompt}
              onChange={handleContextChange}
            />
          </div>
        )}
        
        {/* Message list section with fixed height */}
        <div className="flex-grow overflow-auto" style={{ height: "calc(100% - 100px)" }}>
          {isCompareMode ? (
            <ComparisonView 
              leftMessages={comparisonMessages.leftMessages}
              rightMessages={comparisonMessages.rightMessages}
            />
          ) : (
            <ChatMessageList />
          )}
        </div>
        
        {/* Input section with fixed position at the bottom */}
        <div className="border-t border-gray-200 p-4 bg-white" style={{ minHeight: "100px" }}>
          <form onSubmit={handleSubmit} className="flex space-x-2">
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
