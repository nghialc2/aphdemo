
import React from 'react';
import { Exercise } from './ExerciseContent';
import PDFViewer from './PDFViewer';

export const exercisesData: Exercise[] = [
  {
    id: "exercise-1-1",
    title: "Bài 1.1: Tối ưu hóa tuyển dụng với AI - Tạo JD",
    description: "Viết một câu lệnh xác định cách AI có thể hỗ trợ quy trình tuyển dụng, từ sàng lọc hồ sơ đến đánh giá ứng viên.",
    borderColor: "#3B82F6", // Blue
    exerciseType: "pdf",
    pdfUrl: "https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/huong_dan_thuc_hanh_tao_JD.pdf",
    fileName: "Hướng dẫn thực hành tạo JD.pdf",
    customTitle: "Tối ưu hóa tuyển dụng với AI - Tạo JD",
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
    borderColor: "#3B82F6", // Blue
    exerciseType: "pdf",
    pdfUrl: "https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/huong_dan_thuc_hanh_tao_workflow.pdf",
    fileName: "Hướng dẫn thực hành tạo workflow.pdf",
    customTitle: "Tối ưu hóa tuyển dụng với AI - Scanning & Interview",
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
    borderColor: "#F97316", // Orange
    exerciseType: "drive-link",
    pdfUrl: "https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/Huong_dan_thuc_hanh_custom_GPT_Analysis_Design.pdf",
    fileName: "Huong_dan_thuc_hanh_custom_GPT_Analysis_Design.pdf",
    driveLink: "https://drive.google.com/drive/folders/1zr9Qhx-AsTP6_JsPb8xSyufGOYBBzziX?usp=sharing",
    customTitle: "Thiết kế đào tạo cá nhân hóa bằng AI - TNA",
    content: (
      <div className="space-y-4 text-sm">
       <a 
  href="https://drive.google.com/drive/folders/1zr9Qhx-AsTP6_JsPb8xSyufGOYBBzziX?usp=sharing"
  target="_blank"
  rel="noopener noreferrer"
  className="font-semibold text-base text-fpt-blue hover:text-blue-800 underline block"
>
  Hãy tải dữ liệu demo thực hành tại đây
</a>

        <PDFViewer
          pdfUrl="https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/Huong_dan_thuc_hanh_custom_GPT_Analysis_Design.pdf"
          fileName="Huong_dan_thuc_hanh_custom_GPT_Analysis_Design.pdf"
          fallbackUrls={[
            "/Huong_dan_thuc_hanh_custom_GPT_Analysis_Design.pdf"
          ]}
        />
      </div>
    ) 
  },
  {
    id: "exercise-2-2",
    title: "Bài 2.2: Thiết kế đào tạo cá nhân hóa bằng AI - Thiết kế học liệu",
    description: "Tạo một câu lệnh để AI xây dựng chương trình đào tạo và thiết kế học liệu phù hợp với kết quả phân tích TNA.",
    borderColor: "#F97316", // Orange
    exerciseType: "basic",
    customTitle: "Thiết kế đào tạo cá nhân hóa bằng AI - Thiết kế học liệu",
    content: (
      <div className="space-y-4 text-sm">
        <h4 className="font-semibold text-base text-fpt-blue">Thiết kế đào tạo cá nhân hóa bằng AI - Thiết kế học liệu</h4>

        <PDFViewer
          pdfUrl=""
          fileName="Hướng dẫn thiết kế học liệu.pdf"
          fallbackUrls={[
            "/huong_dan_thiet_ke_hoc_lieu.pdf"
          ]}
        />
      </div>
    )
  },
  {
    id: "exercise-3",
    title: "Bài 3: Quản trị hiệu suất liên tục với AI",
    description: "Phát triển một câu lệnh để AI phân tích dữ liệu hiệu suất và đề xuất các biện pháp cải thiện cho nhân viên.",
    borderColor: "#10B981", // Green
    exerciseType: "basic",
    customTitle: "Quản trị hiệu suất liên tục với AI",
    content: (
      <div className="space-y-4 text-sm">
        <h4 className="font-semibold text-base text-fpt-blue">Quản trị hiệu suất liên tục với AI</h4>

        <PDFViewer
          pdfUrl=""
          fileName="Hướng dẫn quản trị hiệu suất.pdf"
          fallbackUrls={[
            "/huong_dan_quan_tri_hieu_suat.pdf"
          ]}
        />
      </div>
    )
  },
  {
    id: "exercise-4",
    title: "Bài 4: Nâng cao trải nghiệm nhân viên bằng AI",
    description: "Tạo một câu lệnh để AI thiết kế giải pháp tăng cường gắn kết và hài lòng của nhân viên trong tổ chức.",
    borderColor: "#8B5CF6", // Purple
    exerciseType: "basic",
    customTitle: "Nâng cao trải nghiệm nhân viên bằng AI",
    content: (
      <div className="space-y-4 text-sm">
        <h4 className="font-semibold text-base text-fpt-blue">Nâng cao trải nghiệm nhân viên bằng AI</h4>

        <PDFViewer
          pdfUrl=""
          fileName="Hướng dẫn trải nghiệm nhân viên.pdf"
          fallbackUrls={[
            "/huong_dan_trai_nghiem_nhan_vien.pdf"
          ]}
        />
      </div>
    )
  }
];
