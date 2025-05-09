
import { useState } from "react";
import { useSession } from "@/context/SessionContext";
import { useCompare } from "@/context/CompareContext";
import { Message, Model } from "@/types";
import { useToast } from "@/hooks/use-toast";
import ComparisonPlaceholder from "./comparison/ComparisonPlaceholder";
import ComparisonContent from "./comparison/ComparisonContent";

interface ComparisonViewProps {
  leftMessages: Message[];
  rightMessages: Message[];
}

const ComparisonView = ({ leftMessages, rightMessages }: ComparisonViewProps) => {
  const { availableModels, sendComparisonMessage, isProcessing, getContextPrompt, currentSession } = useSession();
  const { leftModelId, rightModelId } = useCompare();
  const [leftInputValue, setLeftInputValue] = useState("");
  const [rightInputValue, setRightInputValue] = useState("");
  const { toast } = useToast();
  
  // Find model names for display
  const leftModel = availableModels.find(m => m.id === leftModelId) || { name: "Model A", id: leftModelId } as Model;
  const rightModel = availableModels.find(m => m.id === rightModelId) || { name: "Model B", id: rightModelId } as Model;
  
  // Make sure we have valid arrays to work with
  const safeLeftMessages = Array.isArray(leftMessages) ? leftMessages : [];
  const safeRightMessages = Array.isArray(rightMessages) ? rightMessages : [];
  
  const handleSubmit = async (inputValue: string, modelId: string) => {
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
      
      // Determine which input value to use and which model to send to
      const isLeftModel = modelId === leftModelId;
      
      // Send comparison message
      await sendComparisonMessage(inputValue, leftModelId, rightModelId, contextPrompt);
      
      // Only clear the input that was used
      if (isLeftModel) {
        setLeftInputValue("");
      } else {
        setRightInputValue("");
      }
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
        leftInputValue={leftInputValue}
        rightInputValue={rightInputValue}
        setLeftInputValue={setLeftInputValue}
        setRightInputValue={setRightInputValue}
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
      leftInputValue={leftInputValue}
      rightInputValue={rightInputValue}
      setLeftInputValue={setLeftInputValue}
      setRightInputValue={setRightInputValue}
      handleSubmit={handleSubmit}
      isProcessing={isProcessing}
    />
  );
};

export default ComparisonView;
