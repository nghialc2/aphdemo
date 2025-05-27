
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface InvideoContentProps {
  onBackClick?: () => void;
}

const InvideoContent: React.FC<InvideoContentProps> = ({ onBackClick }) => {
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
        Invideo
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="font-medium">Thông tin về Invideo:</p>
        <p className="mt-2">
          Invideo là nền tảng AI tạo video đào tạo tự động từ nội dung văn bản.
        </p>
      </div>
      
      <div className="bg-fpt-lightGreen p-4 rounded-md">
        <p className="font-medium text-fpt-green">Hướng dẫn sử dụng Invideo:</p>
        <ol className="list-decimal list-inside mt-2 space-y-2">
          <li>Đăng ký tài khoản Invideo</li>
          <li>Chọn template video phù hợp</li>
          <li>Nhập nội dung văn bản đào tạo</li>
          <li>Để AI tạo video tự động</li>
          <li>Chỉnh sửa và xuất video</li>
        </ol>
      </div>
    </div>
  );
};

export default InvideoContent;
