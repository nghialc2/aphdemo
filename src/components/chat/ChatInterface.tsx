
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/context/SessionContext";
import ChatMessageList from "./ChatMessageList";
import ModelSelector from "./ModelSelector";
import { Send } from "lucide-react";

const ChatInterface = () => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { 
    currentSession, 
    sendMessage, 
    isProcessing
  } = useSession();
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
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
    
    await sendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full border-l border-gray-200 w-full">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="font-medium text-fpt-orange">Chat</h2>
        <ModelSelector />
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <ChatMessageList />
        </div>
        
        <div className="border-t border-gray-200 p-4">
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
