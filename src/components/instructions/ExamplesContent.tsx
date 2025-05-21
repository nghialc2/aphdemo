
import React from 'react';

const ExamplesContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-fpt-blue">
          Ví Dụ Về Câu Lệnh
        </h3>
        
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <p className="font-medium">Câu lệnh cơ bản:</p>
          <p className="text-sm font-mono bg-white p-2 rounded mt-1 border border-gray-200">
            Viết một đoạn ngắn về trí tuệ nhân tạo.
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Quá mơ hồ, có thể nhận kết quả chung chung
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <p className="font-medium">Câu lệnh cải thiện:</p>
          <p className="text-sm font-mono bg-white p-2 rounded mt-1 border border-gray-200">
            Hãy đóng vai một nhà báo công nghệ viết cho đối tượng doanh nghiệp. Viết một đoạn văn hấp dẫn dài 100 từ về cách AI tạo sinh đang chuyển đổi dịch vụ khách hàng vào năm 2025. Hãy đưa vào một ví dụ cụ thể và một số liệu thống kê.
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Vai trò rõ ràng, đối tượng, độ dài, và yêu cầu cụ thể
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <p className="font-medium">Câu lệnh nâng cao:</p>
          <p className="text-sm font-mono bg-white p-2 rounded mt-1 border border-gray-200 break-words">
            Tôi muốn bạn đóng vai một nhà nghiên cứu UX cấp cao đang tạo báo cáo cho quản lý sản phẩm.
            
            Bước 1: Xác định 3 vấn đề về khả năng sử dụng thường gặp ảnh hưởng đến ứng dụng ngân hàng di động.
            
            Bước 2: Với mỗi vấn đề, giải thích tác động đến cả trải nghiệm người dùng và các chỉ số kinh doanh.
            
            Bước 3: Đề xuất các giải pháp dựa trên bằng chứng cho từng vấn đề, trích dẫn nghiên cứu hoặc nguyên tắc UX liên quan.
            
            Định dạng phản hồi như một báo cáo có cấu trúc với các điểm đánh dấu và tiêu đề phần rõ ràng.
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Hướng dẫn nhiều bước với hướng dẫn định dạng rõ ràng
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamplesContent;
