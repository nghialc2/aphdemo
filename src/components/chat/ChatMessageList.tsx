
import { useSession } from "@/context/SessionContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import FileDisplay from "./FileDisplay";

const ChatMessageList = () => {
  const { currentSession } = useSession();

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

  return (
    <div className="flex-1 p-4 space-y-4">
      {currentSession.messages.map((message) => (
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
            {message.hasFiles && message.fileNames && (
              <div className="mb-3 space-y-2">
                {message.fileNames.map((fileName, index) => (
                  <FileDisplay 
                    key={index} 
                    fileName={fileName}
                    isProcessed={fileName.toLowerCase().endsWith('.pdf')}
                  />
                ))}
              </div>
            )}
            
            {/* Display message content */}
            {message.content && (
              <div className="whitespace-pre-wrap">{message.content}</div>
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
    </div>
  );
};

export default ChatMessageList;
