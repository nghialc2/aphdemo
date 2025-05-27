
import React from 'react';

const GammaContent: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-fpt-orange">
        Gamma
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="font-medium">Thông tin về Gamma:</p>
        <p className="mt-2">
          Gamma là một công cụ AI hỗ trợ tạo nội dung và thiết kế học liệu tương tác.
        </p>
      </div>
      
      <div className="bg-fpt-lightGreen p-4 rounded-md">
        <p className="font-medium text-fpt-green">Hướng dẫn sử dụng Gamma:</p>
        <ol className="list-decimal list-inside mt-2 space-y-2">
          <li>Truy cập vào trang web Gamma</li>
          <li>Tạo tài khoản hoặc đăng nhập</li>
          <li>Chọn loại nội dung muốn tạo</li>
          <li>Sử dụng AI để tạo nội dung tự động</li>
        </ol>
      </div>
    </div>
  );
};

export default GammaContent;
