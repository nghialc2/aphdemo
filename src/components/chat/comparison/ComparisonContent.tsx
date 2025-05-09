
import { useRef, useEffect } from "react";
import { Message, Model } from "@/types";
import ComparisonMessageList from "./ComparisonMessageList";
import ComparisonInputForm from "./ComparisonInputForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ComparisonContentProps {
  leftMessages: Message[];
  rightMessages: Message[];
  leftModel: Model;
  rightModel: Model;
  activeTab: "left" | "right";
  setActiveTab: (tab: "left" | "right") => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (inputValue: string) => Promise<void>;
  isProcessing: boolean;
}

const ComparisonContent = ({
  leftMessages,
  rightMessages,
  leftModel,
  rightModel,
  activeTab,
  setActiveTab,
  inputValue,
  setInputValue,
  handleSubmit,
  isProcessing,
}: ComparisonContentProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [leftMessages, rightMessages]);
  
  return (
    <div className="flex flex-col h-full relative">
      <div className="overflow-y-auto pb-32">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "left" | "right")} 
          className="w-full"
        >
          <TabsList className="w-full mb-4 grid grid-cols-2">
            <TabsTrigger 
              value="left"
              className={activeTab === "left" ? "bg-blue-100" : ""}
            >
              {leftModel.name}
            </TabsTrigger>
            <TabsTrigger 
              value="right"
              className={activeTab === "right" ? "bg-green-100" : ""}
            >
              {rightModel.name}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="left" className="p-2">
            <ComparisonMessageList 
              messages={leftMessages} 
              model={leftModel}
              isLeft={true}
            />
          </TabsContent>
          
          <TabsContent value="right" className="p-2">
            <ComparisonMessageList 
              messages={rightMessages} 
              model={rightModel}
            />
          </TabsContent>
        </Tabs>
        <div ref={messagesEndRef} />
      </div>
      
      <ComparisonInputForm
        activeModel={activeTab === "left" ? leftModel : rightModel}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={handleSubmit}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default ComparisonContent;
