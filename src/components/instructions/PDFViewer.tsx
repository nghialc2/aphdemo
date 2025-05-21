
import React from 'react';
import { FileText } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  fileName?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, fileName = "document.pdf" }) => {
  return (
    <div className="flex flex-col items-center w-full space-y-4">
      <div className="border rounded-md w-full overflow-hidden" style={{ height: '600px' }}>
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          allow="autoplay"
          style={{ border: "none" }}
          title={fileName}
        />
      </div>
      
      <div className="text-xs text-gray-500 text-center w-full">
        <p>Nếu tài liệu không hiển thị, hãy <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-fpt-blue hover:underline">nhấn vào đây</a> để xem trong tab mới</p>
      </div>
    </div>
  );
};

export default PDFViewer;
