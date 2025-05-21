
import React from 'react';
import { Exercise } from './ExerciseContent';
import PDFViewer from './PDFViewer';

export const exercisesData: Exercise[] = [
  {
    id: "exercise-1",
    title: "Bài 1: Tối ưu hóa tuyển dụng với AI",
    description: "Viết một câu lệnh xác định cách AI có thể hỗ trợ quy trình tuyển dụng, từ sàng lọc hồ sơ đến đánh giá ứng viên.",
    content: (
      <div className="space-y-4 text-sm">
        <h4 className="font-semibold text-base text-fpt-blue">Tối ưu hóa tuyển dụng với AI</h4>
        
        <PDFViewer pdfUrl="https://drive.google.com/file/d/19A-kFNVb5FmY3EnP_BTpkPPHWGEZ_Ija/view?usp=drive_link" fileName="Bài tập 1.pdf" />
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
