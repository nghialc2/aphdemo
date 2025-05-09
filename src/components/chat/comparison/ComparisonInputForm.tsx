
import { Model } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ComparisonInputFormProps {
  leftModel: Model;
  rightModel: Model;
  leftInputValue: string;
  rightInputValue: string;
  setLeftInputValue: (value: string) => void;
  setRightInputValue: (value: string) => void;
  handleSubmit: (inputValue: string, modelId: string) => Promise<void>;
  isProcessing: boolean;
}

const ComparisonInputForm = ({
  leftModel,
  rightModel,
  leftInputValue,
  rightInputValue,
  setLeftInputValue,
  setRightInputValue,
  handleSubmit,
  isProcessing,
}: ComparisonInputFormProps) => {
  return (
    <div className="fixed bottom-0 right-0 border-t border-gray-200 p-4 bg-white z-10 w-[calc(100%-var(--sidebar-width))]">
      <div className="max-w-full mx-auto">
        <div className="grid grid-cols-2 gap-2">
          <div className="border-r pr-2">
            <p className="text-xs font-medium text-gray-600 mb-2 text-center">{leftModel.name}</p>
            <div className="flex space-x-2">
              <Input
                value={leftInputValue}
                onChange={(e) => setLeftInputValue(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={isProcessing}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSubmit(leftInputValue, leftModel.id)}
                disabled={isProcessing || leftInputValue.trim() === ""}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2 text-center">{rightModel.name}</p>
            <div className="flex space-x-2">
              <Input
                value={rightInputValue}
                onChange={(e) => setRightInputValue(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={isProcessing}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSubmit(rightInputValue, rightModel.id)}
                disabled={isProcessing || rightInputValue.trim() === ""}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {isProcessing && (
          <div className="text-xs text-center mt-2 text-gray-500 animate-pulse">
            Đang so sánh mô hình...
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonInputForm;
