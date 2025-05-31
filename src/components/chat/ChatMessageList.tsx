import { useSession } from "@/context/SessionContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import FileDisplay from "./FileDisplay";
import { useEffect, useRef, useState } from "react";

const ChatMessageList = () => {
  const { currentSession } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [prevMessageCount, setPrevMessageCount] = useState(0);
  
  // Debug info only
  useEffect(() => {
    if (currentSession) {
      console.log("ChatMessageList rendering session:", currentSession.id);
      console.log("Messages:", currentSession.messages.length);
    } else {
      console.log("ChatMessageList: No current session");
    }
  }, [currentSession]);

  // Update local count when session messages change
  useEffect(() => {
    if (currentSession && currentSession.messages) {
      const newCount = currentSession.messages.length;
      if (newCount !== messageCount) {
        setPrevMessageCount(messageCount);
        setMessageCount(newCount);
        console.log("ChatMessageList: Messages count updated to", newCount);
      }
    }
  }, [currentSession?.messages, messageCount]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    // Only scroll to bottom when message count increases (new message)
    if (messageCount > prevMessageCount && messagesEndRef.current) {
      console.log("Scrolling to bottom due to new message");
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageCount, prevMessageCount]);

  if (!currentSession || currentSession.messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Chào mừng đến với Chat AI</p>
          <p className="text-sm">Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn</p>
        </div>
      </div>
    );
  }

  const messages = [...currentSession.messages]; // Create a copy to force re-render

  return (
    <div 
      className="flex-1 p-4 space-y-4 h-full overflow-hidden" 
      ref={scrollAreaRef}
    >
      <div className="h-full overflow-y-auto pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-blue-100">
                  <Bot className="h-4 w-4 text-blue-600" />
                </AvatarFallback>
              </Avatar>
            )}
            
            <div
              className={`max-w-[70%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
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
              
              <div className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
                {message.modelId && message.modelId !== 'error' && (
                  <span className="ml-2">• {message.modelId}</span>
                )}
              </div>
            </div>

            {message.role === 'user' && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-green-100">
                  <User className="h-4 w-4 text-green-600" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} style={{ height: '1px', marginTop: '20px' }} />
      </div>
    </div>
  );
};

export default ChatMessageList;
