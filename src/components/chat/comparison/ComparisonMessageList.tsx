
import { Message, Model } from "@/types";
import ComparisonMessage from "./ComparisonMessage";

interface ComparisonMessageListProps {
  messages: Message[];
  model: Model;
  isLeft?: boolean;
}

const ComparisonMessageList = ({
  messages,
  model,
  isLeft = false,
}: ComparisonMessageListProps) => {
  return (
    <div>
      <div className="space-y-2">
        {messages.map((message) => (
          <ComparisonMessage 
            key={message.id}
            message={message}
            modelName={model.name}
            isLeft={isLeft}
          />
        ))}
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Không có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonMessageList;
