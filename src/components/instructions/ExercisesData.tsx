
import React from 'react';
import { Exercise } from './ExerciseContent';
import PDFViewer from './PDFViewer';

export const exercisesData: Exercise[] = [
  {
    id: "exercise-1-1",
    title: "Bài 1.1: Tối ưu hóa tuyển dụng với AI - Tạo JD",
    description: "Viết một câu lệnh xác định cách AI có thể hỗ trợ quy trình tuyển dụng, từ sàng lọc hồ sơ đến đánh giá ứng viên.",
    content: (
      <div className="space-y-4 text-sm">
        <h4 className="font-semibold text-base text-fpt-blue">Tối ưu hóa tuyển dụng với AI - Tạo JD</h4>

        <PDFViewer
          pdfUrl="https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/huong_dan_thuc_hanh_tao_JD.pdf"
          fileName="Hướng dẫn thực hành tạo JD.pdf"
          fallbackUrls={[
            "/huong_dan_thuc_hanh_tao_JD.pdf"
          ]}
        />
      </div>
    )
  },
  {
    id: "exercise-1-2",
    title: "Bài 1.2: Tối ưu hóa tuyển dụng với AI - Scanning & Interview",
    description: "Sử dụng AI để tối ưu hóa quy trình sàng lọc hồ sơ và phỏng vấn ứng viên.",
    content: (
      <div className="space-y-4 text-sm">
        <h4 className="font-semibold text-base text-fpt-blue">Tối ưu hóa tuyển dụng với AI - Scanning & Interview</h4>

        <PDFViewer
          pdfUrl="https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/huong_dan_thuc_hanh_tao_workflow.pdf"
          fileName="Hướng dẫn thực hành tạo workflow.pdf"
          fallbackUrls={[
            "/huong_dan_thuc_hanh_tao_workflow.pdf"
          ]}
        />
      </div>
    )
  },
  {
    id: "exercise-2-1",
    title: "Bài 2.1: Thiết kế đào tạo cá nhân hóa bằng AI - TNA",
    description: "",
    content: (
      <div className="space-y-4 text-sm">
       <a 
  href="https://drive.google.com/drive/folders/1tzpQ2eMUbpMKPQmwO-cZ2Hgsgf-1R0Jg?usp=sharing"
  target="_blank"
  rel="noopener noreferrer"
  className="font-semibold text-base text-fpt-blue hover:text-blue-800 underline block"
>
  Hãy tải dữ liệu demo thực hành tại đây
</a>

        <PDFViewer
          pdfUrl="https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/Huong_dan_thuc_hanh_custom_GPT_TNA.pdf"
          fileName="Huong_dan_thuc_hanh_custom_GPT_TNA.pdf"
          fallbackUrls={[
            "/Huong_dan_thuc_hanh_custom_GPT_TNA.pdf"
          ]}
        />
      </div>
    ) 
  },
  {
    id: "exercise-2-2",
    title: "Bài 2.2: Thiết kế đào tạo cá nhân hóa bằng AI - Thiết kế học liệu",
    description: "Tạo một câu lệnh để AI xây dựng chương trình đào tạo và thiết kế học liệu phù hợp với kết quả phân tích TNA."
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
