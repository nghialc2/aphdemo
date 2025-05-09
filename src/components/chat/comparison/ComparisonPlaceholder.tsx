
import { GitCompareArrows } from "lucide-react";
import ComparisonInputForm from "./ComparisonInputForm";
import { Model } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ComparisonPlaceholderProps {
  leftModel: Model;
  rightModel: Model;
  activeTab: "left" | "right";
  setActiveTab: (tab: "left" | "right") => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (inputValue: string) => Promise<void>;
  isProcessing: boolean;
}

const ComparisonPlaceholder = ({
  leftModel,
  rightModel,
  activeTab,
  setActiveTab,
  inputValue,
  setInputValue,
  handleSubmit,
  isProcessing,
}: ComparisonPlaceholderProps) => {
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
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-4">
                <div className="mb-2 w-12 h-12 bg-fpt-blue/10 rounded-full flex items-center justify-center mx-auto">
                  <GitCompareArrows className="h-6 w-6 text-fpt-blue" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 font-bold">
                  {leftModel.name}
                </h3>
                <p className="text-gray-700 text-sm mt-2 max-w-sm">
                  Gửi tin nhắn để xem phản hồi từ mô hình này.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="right" className="p-2">
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-4">
                <div className="mb-2 w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <GitCompareArrows className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 font-bold">
                  {rightModel.name}
                </h3>
                <p className="text-gray-700 text-sm mt-2 max-w-sm">
                  Gửi tin nhắn để xem phản hồi từ mô hình này.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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

export default ComparisonPlaceholder;
