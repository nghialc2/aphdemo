
import React from 'react';

const HeygenContent: React.FC = () => {
  return (
    <div className="space-y-4">
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
