
import { cn } from "@/lib/utils";
import { Message } from "@/types";

interface ComparisonMessageProps {
  message: Message;
  modelName: string;
  isLeft?: boolean;
}

const ComparisonMessage = ({
  message,
  modelName,
  isLeft = false,
}: ComparisonMessageProps) => {
  return (
    <div 
      className={cn(
        "chat-message mb-4",
        message.role === "user" ? "user-message" : "assistant-message"
      )}
    >
      <div className="flex items-start">
        <div className={cn(
          "w-6 h-6 rounded-full mr-3 flex-shrink-0 flex items-center justify-center",
          message.role === "user" ? "bg-fpt-orange" : isLeft ? "bg-fpt-blue" : "bg-green-600"
        )}>
          <span className="text-xs text-white font-bold">
            {message.role === "user" ? "U" : isLeft ? "L" : "R"}
          </span>
        </div>
        <div className="space-y-1 flex-1">
          <p className="text-xs font-medium text-gray-600">
            {message.role === "user" ? "Bạn" : modelName}
          </p>
          <div className="message-content whitespace-pre-wrap text-gray-900">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonMessage;
