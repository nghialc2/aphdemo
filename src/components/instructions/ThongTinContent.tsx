
import React, { useState } from 'react';
import PDFViewer from './PDFViewer';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface ThongTinContentProps {
  isInEditMode?: boolean;
}

const ThongTinContent: React.FC<ThongTinContentProps> = ({ isInEditMode = false }) => {
  const [title, setTitle] = useState("Thông Tin Chi Tiết");
  const [pdfUrl, setPdfUrl] = useState("https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/smartlife_retail_case_study.pdf");
  const [fileName, setFileName] = useState("SmartLife Retail Case Study");
  const [fallbackUrl, setFallbackUrl] = useState("/smartlife_retail_case_study.pdf");

  if (isInEditMode) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tiêu đề:</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold text-fpt-blue"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">URL PDF chính:</label>
          <Input
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            placeholder="https://example.com/file.pdf"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tên file hiển thị:</label>
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">URL dự phòng:</label>
          <Input
            value={fallbackUrl}
            onChange={(e) => setFallbackUrl(e.target.value)}
            placeholder="/local-file.pdf"
          />
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 mb-2">Xem trước PDF:</p>
          <PDFViewer
            pdfUrl={pdfUrl}
            fileName={fileName}
            fallbackUrls={[fallbackUrl]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-fpt-blue mb-4">{title}</h3>
      <PDFViewer
        pdfUrl={pdfUrl}
        fileName={fileName}
        fallbackUrls={[fallbackUrl]}
      />
    </div>
  );
};

export default ThongTinContent;
