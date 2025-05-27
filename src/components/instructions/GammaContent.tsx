
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface GammaContentProps {
  onBackClick?: () => void;
}

const GammaContent: React.FC<GammaContentProps> = ({ onBackClick }) => {
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
        Gamma
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="font-medium">Thông tin về Gamma:</p>
        <p className="mt-2">
          Gamma là một công cụ AI hỗ trợ tạo nội dung và thiết kế học liệu tương tác.
        </p>
      </div>
      
      content: (
      <div className="space-y-4 text-sm">
        <h4 className="font-semibold text-base text-fpt-blue">Hướng dẫn sử dụng Gamma</h4>

        <PDFViewer
          pdfUrl="https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/Huong_dan_thuc_hanh_tao_slide_bang_gamma.pdf"
          fileName="Huong_dan_thuc_hanh_tao_slide_bang_gamma.pdf"
          fallbackUrls={[
            "/Huong_dan_thuc_hanh_tao_slide_bang_gamma.pdf"
          ]}
        />
      </div>
    )
  );
};

export default GammaContent;
