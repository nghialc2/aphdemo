import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PDFViewer from './PDFViewer';

interface NapkinContentProps {
  onBackClick?: () => void;
}

const NapkinContent: React.FC<NapkinContentProps> = ({ onBackClick }) => {
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
        Napkin
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="font-medium">Thông tin về Napkin:</p>
        <p className="mt-2">
          Napkin là công cụ AI chuyên tạo ra các biểu đồ, sơ đồ và hình ảnh minh họa cho học liệu.
        </p>
      </div>
      
      <div className="space-y-4 text-sm">
        <h4 className="font-semibold text-base text-fpt-blue">Hướng dẫn sử dụng Napkin</h4>

        <PDFViewer
          pdfUrl="https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/huong_dan_truc_quan_hoa_du_lieu_bang_napkin.pdf"
          fileName="huong_dan_truc_quan_hoa_du_lieu_bang_napkin.pdf"
          fallbackUrls={[
            "/huong_dan_truc_quan_hoa_du_lieu_bang_napkin.pdf"
          ]}
        />
      </div>
    </div>
  );
};

export default NapkinContent;
