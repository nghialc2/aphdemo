
import { useEffect, useRef } from "react";
import { useSession } from "@/context/SessionContext";
import { cn } from "@/lib/utils";

const ChatMessageList = () => {
  const { currentSession } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);
  
  if (!currentSession || currentSession.messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="mb-2 w-12 h-12 bg-fpt-blue/10 rounded-full flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-fpt-blue"
          >
            <path
              d="M17 3.33782C15.5291 2.48697 13.8214 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22C17.5228 22 22 17.5228 22 12C22 10.1786 21.513 8.47087 20.6622 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M8 12H8.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 12H12.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 12H16.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 font-bold empty-chat-title">
          Welcome to FPT Prompt Arena
        </h3>
        <p className="text-gray-700 text-sm mt-2 max-w-sm empty-chat-description">
          Start a conversation by typing your prompt in the box below.
          Try to be specific and clear with your instructions.
        </p>
      </div>
    );
  }
  
  return (
    <div className="py-4 px-2">
      {currentSession.messages.map((message) => (
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
                {message.role === "user" ? "U" : "A"}
              </span>
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-xs font-medium text-gray-500">
                {message.role === "user" ? "You" : "Assistant"}
              </p>
              <div className="message-content whitespace-pre-wrap text-gray-900">
                {message.content}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
