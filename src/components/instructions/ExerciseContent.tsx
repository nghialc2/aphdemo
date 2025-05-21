
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ExerciseContentProps {
  exercise: Exercise;
  onBackClick: () => void;
}

// Define the types for exercise content
export type Exercise = {
  id: string;
  title: string;
  description: string;
  content?: React.ReactNode;
};

const ExerciseContent: React.FC<ExerciseContentProps> = ({ exercise, onBackClick }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBackClick}
          className="flex items-center text-fpt-blue"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
      </div>
      
      <h3 className="text-xl font-bold text-fpt-orange">
        {exercise.title}
      </h3>
      
      {exercise.content ? (
        exercise.content
      ) : (
        <>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="font-medium">Mô tả bài tập:</p>
            <p className="mt-2">{exercise.description}</p>
          </div>
          
          <div className="bg-fpt-lightGreen p-4 rounded-md">
            <p className="font-medium text-fpt-green">Hướng dẫn thực hiện:</p>
            <ol className="list-decimal list-inside mt-2 space-y-2">
              <li>Sử dụng mẫu câu lệnh phù hợp với chủ đề bài tập</li>
              <li>Xác định rõ vai trò, mục tiêu và ràng buộc</li>
              <li>Thử nghiệm với một số mô hình khác nhau để so sánh kết quả</li>
              <li>Điều chỉnh câu lệnh dựa trên phản hồi nhận được</li>
            </ol>
          </div>
          
          <div className="border-l-4 border-fpt-blue pl-3">
            <p className="font-medium">Gợi ý:</p>
            <p className="text-sm mt-1">
              Hãy bắt đầu bằng cách xác định rõ vai trò AI cần đảm nhiệm và bối cảnh cụ thể của nhiệm vụ HRM.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ExerciseContent;
