import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import PDFViewer from './PDFViewer';

interface GensparkContentProps {
  onBackClick?: () => void;
  isInEditMode?: boolean;
}

const GensparkContent: React.FC<GensparkContentProps> = ({ onBackClick, isInEditMode = false }) => {
  const [title, setTitle] = useState("Genspark");
  const [description, setDescription] = useState("Genspark là một nền tảng AI giúp tạo ra các ý tưởng sáng tạo và nội dung đào tạo.");
  const [guideTitle, setGuideTitle] = useState("Hướng dẫn sử dụng Genspark");
  const [pdfUrl, setPdfUrl] = useState("https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/huong_dan_thuc_hanh_tao_slide_bang_genspark.pdf");
  const [fileName, setFileName] = useState("huong_dan_thuc_hanh_tao_slide_bang_genspark.pdf");
  const [fallbackUrl, setFallbackUrl] = useState("/huong_dan_thuc_hanh_tao_slide_bang_genspark.pdf");

  if (isInEditMode) {
    return (
      <div className="space-y-4">
        {onBackClick && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBackClick}
              className="flex items-center text-fpt-blue"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại
            </Button>
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tiêu đề:</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold text-fpt-orange"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Mô tả:</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tiêu đề hướng dẫn:</label>
          <Input
            value={guideTitle}
            onChange={(e) => setGuideTitle(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">URL PDF:</label>
          <Input
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tên file:</label>
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
          />
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 mb-2">Xem trước:</p>
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
      {onBackClick && (
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBackClick}
            className="flex items-center text-fpt-blue"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại
          </Button>
        </div>
      )}
      
      <h3 className="text-xl font-bold text-fpt-orange">
        {title}
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="font-medium">Thông tin về Genspark:</p>
        <p className="mt-2">
          {description}
        </p>
      </div>
      
      <div className="space-y-4 text-sm">
        <h4 className="font-semibold text-base text-fpt-blue">{guideTitle}</h4>

        <PDFViewer
          pdfUrl={pdfUrl}
          fileName={fileName}
          fallbackUrls={[fallbackUrl]}
        />
      </div>
    </div>
  );
};

export default GensparkContent;
