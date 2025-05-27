
import React from 'react';

const NapkinContent: React.FC = () => {
  return (
    <div className="space-y-4">
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
