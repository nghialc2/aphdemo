
import { useRef, useEffect } from "react";
import { Message, Model } from "@/types";
import ComparisonMessageList from "./ComparisonMessageList";
import ComparisonInputForm from "./ComparisonInputForm";

interface ComparisonContentProps {
  leftMessages: Message[];
  rightMessages: Message[];
  leftModel: Model;
  rightModel: Model;
  leftInputValue: string;
  rightInputValue: string;
  setLeftInputValue: (value: string) => void;
  setRightInputValue: (value: string) => void;
  handleSubmit: (inputValue: string, modelId: string) => Promise<void>;
  isProcessing: boolean;
}

const ComparisonContent = ({
  leftMessages,
  rightMessages,
  leftModel,
  rightModel,
  leftInputValue,
  rightInputValue,
  setLeftInputValue,
  setRightInputValue,
  handleSubmit,
  isProcessing,
}: ComparisonContentProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [leftMessages, rightMessages]);
  
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="grid grid-cols-2 gap-2 py-4 px-2">
          <ComparisonMessageList 
            messages={leftMessages} 
            model={leftModel}
            isLeft={true}
          />
          
          <ComparisonMessageList 
            messages={rightMessages} 
            model={rightModel}
          />
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <ComparisonInputForm
        leftModel={leftModel}
        rightModel={rightModel}
        leftInputValue={leftInputValue}
        rightInputValue={rightInputValue}
        setLeftInputValue={setLeftInputValue}
        setRightInputValue={setRightInputValue}
        handleSubmit={handleSubmit}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default ComparisonContent;
