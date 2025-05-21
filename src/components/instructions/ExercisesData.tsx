
import React from 'react';
import { Exercise } from './ExerciseContent';

export const exercisesData: Exercise[] = [
  {
    id: "exercise-1",
    title: "Bài 1: Tối ưu hóa tuyển dụng với AI",
    description: "Viết một câu lệnh xác định cách AI có thể hỗ trợ quy trình tuyển dụng, từ sàng lọc hồ sơ đến đánh giá ứng viên.",
    content: (
      <div className="space-y-4 text-sm">
        <h4 className="font-semibold text-base text-fpt-blue">Tối ưu hóa tuyển dụng với AI</h4>
        
        <div className="space-y-2">
          <p className="font-medium">Mục tiêu:</p>
          <p>Viết câu lệnh prompt giúp AI có thể hỗ trợ hiệu quả trong quy trình tuyển dụng từ sàng lọc hồ sơ đến đánh giá ứng viên.</p>
        </div>
        
        <div className="space-y-2">
          <p className="font-medium">Yêu cầu:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Xác định vai trò AI cần đóng (ví dụ: trợ lý tuyển dụng, chuyên gia đánh giá...)</li>
            <li>Cung cấp bối cảnh về quy trình tuyển dụng cụ thể</li>
            <li>Chỉ định nhiệm vụ rõ ràng AI cần thực hiện</li>
            <li>Xác định các ràng buộc và giới hạn (nếu có)</li>
          </ol>
        </div>
        
        <div className="space-y-2">
          <p className="font-medium">Gợi ý:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Cân nhắc các giai đoạn khác nhau trong quy trình tuyển dụng</li>
            <li>Xác định những thách thức cụ thể cần giải quyết</li>
            <li>Nghĩ về cách AI có thể phân tích và đánh giá thông tin</li>
            <li>Làm rõ đầu ra mong muốn từ AI (định dạng, độ dài, mức độ chi tiết)</li>
          </ul>
        </div>
        
        <div className="bg-fpt-lightGreen p-3 rounded-md">
          <p className="font-medium text-fpt-green">Mẫu khởi đầu:</p>
          <p className="text-xs mt-1 font-mono bg-white p-2 rounded">
            "Bạn là một [vai trò] giúp đánh giá ứng viên cho vị trí [tên vị trí]. Dựa trên [loại thông tin] sau đây, hãy [nhiệm vụ cụ thể]..."
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="font-medium">Tiêu chí đánh giá:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
            <li>Tính cụ thể và rõ ràng của hướng dẫn</li>
            <li>Khả năng giải quyết vấn đề thực tế trong tuyển dụng</li>
            <li>Hiệu quả trong việc tối ưu hóa quy trình</li>
            <li>Tính đạo đức và công bằng trong đánh giá của AI</li>
            <li>Tính ứng dụng thực tế của kết quả</li>
          </ul>
        </div>
        
        <div className="border-l-4 border-fpt-orange p-2 text-xs">
          <p className="font-medium">Lưu ý quan trọng:</p>
          <p>Hãy đảm bảo câu lệnh của bạn thúc đẩy sự công bằng và không thiên vị trong quá trình tuyển dụng. AI nên là một công cụ hỗ trợ quyết định, không phải người ra quyết định cuối cùng.</p>
        </div>
      </div>
    )
  },
  {
    id: "exercise-2",
    title: "Bài 2: Thiết kế đào tạo cá nhân hóa bằng AI",
    description: "Tạo một câu lệnh để AI xây dựng chương trình đào tạo dựa trên kỹ năng hiện tại và mục tiêu phát triển của nhân viên."
  },
  {
    id: "exercise-3",
    title: "Bài 3: Quản trị hiệu suất liên tục với AI",
    description: "Phát triển một câu lệnh để AI phân tích dữ liệu hiệu suất và đề xuất các biện pháp cải thiện cho nhân viên."
  },
  {
    id: "exercise-4",
    title: "Bài 4: Nâng cao trải nghiệm nhân viên bằng AI",
    description: "Tạo một câu lệnh để AI thiết kế giải pháp tăng cường gắn kết và hài lòng của nhân viên trong tổ chức."
  }
];
