import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PDFViewer from './PDFViewer';

interface InvideoContentProps {
  onBackClick?: () => void;
}

const InvideoContent: React.FC<InvideoContentProps> = ({ onBackClick }) => {
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
        Invideo
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="font-medium">Thông tin về Invideo:</p>
        <p className="mt-2">
          Invideo là nền tảng AI tạo video đào tạo tự động từ nội dung văn bản.
        </p>
      </div>
      
      <div className="space-y-4 text-sm">
        <h4 className="font-semibold text-base text-fpt-blue">Hướng dẫn sử dụng INVIDEO</h4>

        <PDFViewer
          pdfUrl="https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/huong_dan_thuc_hanh_tao_video_bang_INVIDEO.pdf"
          fileName="huong_dan_thuc_hanh_tao_video_bang_INVIDEO.pdf"
          fallbackUrls={[
            "/huong_dan_thuc_hanh_tao_video_bang_INVIDEO.pdf"
          ]}
        />
      </div>
    </div>
  );
};

export default InvideoContent;
