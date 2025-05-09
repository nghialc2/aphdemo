
import { useState } from "react";
import { useSession } from "@/context/SessionContext";
import { useCompare } from "@/context/CompareContext";
import { Message, Model } from "@/types";
import { useToast } from "@/hooks/use-toast";
import ComparisonPlaceholder from "./comparison/ComparisonPlaceholder";
import ComparisonContent from "./comparison/ComparisonContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ComparisonViewProps {
  leftMessages: Message[];
  rightMessages: Message[];
}

const ComparisonView = ({ leftMessages, rightMessages }: ComparisonViewProps) => {
  const { availableModels, sendComparisonMessage, isProcessing, getContextPrompt, currentSession } = useSession();
  const { leftModelId, rightModelId } = useCompare();
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState<"left" | "right">("left");
  const { toast } = useToast();
  
  // Find model names for display
  const leftModel = availableModels.find(m => m.id === leftModelId) || { name: "Model A", id: leftModelId } as Model;
  const rightModel = availableModels.find(m => m.id === rightModelId) || { name: "Model B", id: rightModelId } as Model;
  
  // Make sure we have valid arrays to work with
  const safeLeftMessages = Array.isArray(leftMessages) ? leftMessages : [];
  const safeRightMessages = Array.isArray(rightMessages) ? rightMessages : [];
  
  const handleSubmit = async (inputValue: string) => {
    if (inputValue.trim() === "") {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tin nhắn",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get context prompt for current session
      const contextPrompt = currentSession ? getContextPrompt(currentSession.id) : "";
      
      // Get the current active model ID
      const modelId = activeTab === "left" ? leftModelId : rightModelId;
      
      // Send comparison message
      await sendComparisonMessage(
        inputValue, 
        leftModelId, 
        rightModelId, 
        contextPrompt
      );
      
      // Clear input after sending
      setInputValue("");
    } catch (error) {
      console.error("Error sending comparison message:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };
  
  // Show placeholder if no messages
  if (safeLeftMessages.length === 0 && safeRightMessages.length === 0) {
    return (
      <ComparisonPlaceholder
        leftModel={leftModel}
        rightModel={rightModel}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={handleSubmit}
        isProcessing={isProcessing}
      />
    );
  }
  
  return (
    <ComparisonContent
      leftMessages={safeLeftMessages}
      rightMessages={safeRightMessages}
      leftModel={leftModel}
      rightModel={rightModel}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      inputValue={inputValue}
      setInputValue={setInputValue}
      handleSubmit={handleSubmit}
      isProcessing={isProcessing}
    />
  );
};

export default ComparisonView;
