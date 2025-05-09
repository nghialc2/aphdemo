
import { GitCompareArrows } from "lucide-react";
import ComparisonInputForm from "./ComparisonInputForm";
import { Model } from "@/types";

interface ComparisonPlaceholderProps {
  leftModel: Model;
  rightModel: Model;
  leftInputValue: string;
  rightInputValue: string;
  setLeftInputValue: (value: string) => void;
  setRightInputValue: (value: string) => void;
  handleSubmit: (inputValue: string, modelId: string) => Promise<void>;
  isProcessing: boolean;
}

const ComparisonPlaceholder = ({
  leftModel,
  rightModel,
  leftInputValue,
  rightInputValue,
  setLeftInputValue,
  setRightInputValue,
  handleSubmit,
  isProcessing,
}: ComparisonPlaceholderProps) => {
  return (
    <div className="flex flex-col h-full relative">
      <div className="overflow-y-auto pb-32">
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-4">
            <div className="mb-2 w-12 h-12 bg-fpt-blue/10 rounded-full flex items-center justify-center mx-auto">
              <GitCompareArrows className="h-6 w-6 text-fpt-blue" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 font-bold">
              Chế độ so sánh đã kích hoạt
            </h3>
            <p className="text-gray-700 text-sm mt-2 max-w-sm">
              Gửi tin nhắn để xem phản hồi từ cả hai mô hình cạnh nhau.
            </p>
          </div>
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

export default ComparisonPlaceholder;
