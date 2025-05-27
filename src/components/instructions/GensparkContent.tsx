
import React from 'react';

const GensparkContent: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-fpt-orange">
        Genspark
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="font-medium">Thông tin về Genspark:</p>
        <p className="mt-2">
          Genspark là một nền tảng AI giúp tạo ra các ý tưởng sáng tạo và nội dung đào tạo.
        </p>
      </div>
      
      <div className="bg-fpt-lightGreen p-4 rounded-md">
        <p className="font-medium text-fpt-green">Hướng dẫn sử dụng Genspark:</p>
        <ol className="list-decimal list-inside mt-2 space-y-2">
          <li>Đăng nhập vào Genspark</li>
          <li>Mô tả chủ đề đào tạo cần thiết</li>
          <li>Để AI tạo ra các ý tưởng và nội dung</li>
          <li>Chỉnh sửa và tùy chỉnh theo nhu cầu</li>
        </ol>
      </div>
    </div>
  );
};

export default GensparkContent;
