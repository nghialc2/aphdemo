
import React from 'react';

const WelcomeContent: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-fpt-orange break-words">
        Xin chào mừng các bạn đã đến với Lab thực hành của chương trình AI-Powered HRM
      </h3>
      
      <div className="space-y-3">
        <p>
          Phòng Lab này cho phép bạn thực hành xây dựng các câu lệnh hiệu quả cho
          các mô hình ngôn ngữ lớn. Bạn sẽ học cách:
        </p>
        
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Viết hướng dẫn rõ ràng, cụ thể</li>
          <li>Cấu trúc câu lệnh để có phản hồi tối ưu</li>
          <li>So sánh kết quả giữa các mô hình khác nhau</li>
          <li>Lặp lại và hoàn thiện kỹ năng xây dựng câu lệnh</li>
        </ul>
        
        <div className="bg-fpt-lightGreen p-4 rounded-md">
          <p className="font-medium text-fpt-green">Bắt đầu:</p>
          <ol className="list-decimal list-inside ml-2 space-y-1">
            <li>Chọn một mô hình từ menu thả xuống trong bảng điều khiển trò chuyện</li>
            <li>Nhập câu lệnh của bạn trong ô nhập tin nhắn</li>
            <li>Xem xét phản hồi và điều chỉnh phương pháp của bạn</li>
          </ol>
        </div>
        
        <p className="text-sm text-gray-600 italic">
          Hãy nhớ: Chất lượng câu lệnh của bạn ảnh hưởng trực tiếp đến chất lượng của các phản hồi!
        </p>
      </div>
    </div>
  );
};

export default WelcomeContent;
