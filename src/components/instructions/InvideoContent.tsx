
import React from 'react';

const InvideoContent: React.FC = () => {
  return (
    <div className="space-y-4">
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
