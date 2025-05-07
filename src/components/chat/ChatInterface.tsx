
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/context/SessionContext";
import { useCompare } from "@/context/CompareContext";
import ChatMessageList from "./ChatMessageList";
import ModelSelector from "./ModelSelector";
import ComparisonModelSelectors from "./ComparisonModelSelectors";
import ComparisonView from "./ComparisonView";
import { History, Send, GitCompareArrows, Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    if (inputRef.current && !isCompareMode) {
      inputRef.current.focus();
    }
  }, [isCompareMode]);
  
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
      // Only handle regular messages here - compare mode has its own input
      if (!isCompareMode) {
        // Send regular message
        await sendMessage(inputValue, contextPrompt);
        setInputValue("");
      }
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
    <div className="flex flex-col h-full border-l border-gray-200 dark:border-dark-border w-full chat-interface">
      <ChatTopbar 
        showContextPrompt={showContextPrompt}
        setShowContextPrompt={setShowContextPrompt}
        isCompareMode={isCompareMode}
        handleToggleCompareMode={handleToggleCompareMode}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden dark:bg-dark-background">
        {showContextPrompt && (
          <div className="p-4 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card">
            <ContextPrompt 
              value={contextPrompt}
              onChange={handleContextChange}
            />
          </div>
        )}
        
        <ScrollArea className="flex-1">
          {isCompareMode ? (
            <ComparisonView 
              leftMessages={comparisonMessages.leftMessages}
              rightMessages={comparisonMessages.rightMessages}
            />
          ) : (
            <ChatMessageList />
          )}
        </ScrollArea>
        
        {/* Only show the input form when NOT in compare mode */}
        {!isCompareMode && (
          <div className="border-t border-gray-200 dark:border-dark-border p-4 bg-white dark:bg-dark-card">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your prompt here..."
                disabled={isProcessing}
                className="flex-1 dark:bg-dark-input dark:text-dark-foreground dark:border-dark-border chat-input"
              />
              <Button 
                type="submit" 
                disabled={isProcessing || inputValue.trim() === ""}
                className="chat-button"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
            {isProcessing && (
              <div className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400 animate-pulse">
                Processing your request...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
