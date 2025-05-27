import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PDFViewer from './PDFViewer';

interface HeygenContentProps {
  onBackClick?: () => void;
}

const HeygenContent: React.FC<HeygenContentProps> = ({ onBackClick }) => {
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
        Heygen
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="font-medium">Thông tin về Heygen:</p>
        <p className="mt-2">
          Heygen là công cụ AI tạo video với avatar ảo để làm người thuyết trình trong học liệu.
        </p>
      </div>
      
      <div className="space-y-4 text-sm">
        <h4 className="font-semibold text-base text-fpt-blue">Hướng dẫn sử dụng Heygen</h4>

        <PDFViewer
          pdfUrl="https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/huong_dan_thuc_hanh_tao_video_co_avatar_bang_heygen.pdf"
          fileName="huong_dan_thuc_hanh_tao_video_co_avatar_bang_heygen.pdf"
          fallbackUrls={[
            "/huong_dan_thuc_hanh_tao_video_co_avatar_bang_heygen.pdf"
          ]}
        />
      </div>
    </div>
  );
};

export default HeygenContent;
