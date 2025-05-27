
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface NapkinContentProps {
  onBackClick?: () => void;
}

const NapkinContent: React.FC<NapkinContentProps> = ({ onBackClick }) => {
  return (
    <div className="space-y-4">
      {onBackClick && (
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
      )}
      
      <h3 className="text-xl font-bold text-fpt-orange">
        Napkin
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="font-medium">Thông tin về Napkin:</p>
        <p className="mt-2">
          Napkin là công cụ AI chuyên tạo ra các biểu đồ, sơ đồ và hình ảnh minh họa cho học liệu.
        </p>
      </div>
      
      <div className="bg-fpt-lightGreen p-4 rounded-md">
        <p className="font-medium text-fpt-green">Hướng dẫn sử dụng Napkin:</p>
        <ol className="list-decimal list-inside mt-2 space-y-2">
          <li>Truy cập Napkin AI</li>
          <li>Mô tả loại biểu đồ cần tạo</li>
          <li>Cung cấp dữ liệu hoặc ý tưởng</li>
          <li>Tạo và tùy chỉnh biểu đồ</li>
        </ol>
      </div>
    </div>
  );
};

export default NapkinContent;
