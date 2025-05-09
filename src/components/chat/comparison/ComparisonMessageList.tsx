
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
    <div className={isLeft ? "border-r pr-2" : "pl-2"}>
      <div className="sticky top-0 bg-white p-2 mb-2 z-10 flex items-center justify-center">
        <span className={`px-3 py-1 ${isLeft ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"} rounded-full text-sm font-medium`}>
          {model.name}
        </span>
      </div>
      <div className="space-y-2">
        {messages.map((message) => (
          <ComparisonMessage 
            key={message.id}
            message={message}
            modelName={model.name}
            isLeft={isLeft}
          />
        ))}
      </div>
    </div>
  );
};

export default ComparisonMessageList;
