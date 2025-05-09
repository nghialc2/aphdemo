
import { Model } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ComparisonInputFormProps {
  activeModel: Model;
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (inputValue: string) => Promise<void>;
  isProcessing: boolean;
}

const ComparisonInputForm = ({
  activeModel,
  inputValue,
  setInputValue,
  handleSubmit,
  isProcessing,
}: ComparisonInputFormProps) => {
  return (
    <div className="fixed bottom-0 right-0 border-t border-gray-200 p-4 bg-white z-10 w-[calc(100%-var(--sidebar-width))]">
      <div className="max-w-full mx-auto">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            disabled={isProcessing}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputValue.trim() !== "") {
                  handleSubmit(inputValue);
                }
              }
            }}
          />
          <Button 
            onClick={() => handleSubmit(inputValue)}
            disabled={isProcessing || inputValue.trim() === ""}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </Button>
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
