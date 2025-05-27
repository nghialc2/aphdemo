
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface HeygenContentProps {
  onBackClick?: () => void;
}

const HeygenContent: React.FC<HeygenContentProps> = ({ onBackClick }) => {
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
        Heygen
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="font-medium">Thông tin về Heygen:</p>
        <p className="mt-2">
          Heygen là công cụ AI tạo video với avatar ảo để làm người thuyết trình trong học liệu.
        </p>
      </div>
      
      <div className="bg-fpt-lightGreen p-4 rounded-md">
        <p className="font-medium text-fpt-green">Hướng dẫn sử dụng Heygen:</p>
        <ol className="list-decimal list-inside mt-2 space-y-2">
          <li>Tạo tài khoản Heygen</li>
          <li>Chọn avatar phù hợp</li>
          <li>Nhập script đào tạo</li>
          <li>Tùy chỉnh giọng nói và cử chỉ</li>
          <li>Tạo video với avatar AI</li>
        </ol>
      </div>
    </div>
  );
};

export default HeygenContent;
