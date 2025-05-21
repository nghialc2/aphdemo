
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Cấu hình worker cho pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  fileName?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, fileName = "document.pdf" }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Chuyển đổi Google Drive URL sang dạng có thể tải trực tiếp
  const getDirectDownloadUrl = (url: string): string => {
    if (url.includes('drive.google.com/file/d/')) {
      // Lấy file ID từ URL
      const fileIdMatch = url.match(/\/d\/([^\/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
    }
    return url;
  };

  const processedUrl = getDirectDownloadUrl(pdfUrl);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error while loading PDF:', error);
    setError(true);
    setLoading(false);
  }

  function changePage(offset: number) {
    const newPageNumber = pageNumber + offset;
    if (newPageNumber >= 1 && newPageNumber <= (numPages || 1)) {
      setPageNumber(newPageNumber);
    }
  }

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      <div className="border rounded-md w-full" style={{ minHeight: '600px' }}>
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fpt-blue mx-auto mb-4"></div>
              <p>Đang tải tài liệu...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-red-500">
              <FileText className="h-16 w-16 mx-auto mb-4" />
              <p>Không thể tải tài liệu. Vui lòng thử lại sau.</p>
              <a href={processedUrl} target="_blank" rel="noopener noreferrer" className="text-fpt-blue hover:underline mt-2 block">
                Nhấn vào đây để mở tài liệu trong tab mới
              </a>
            </div>
          </div>
        )}
        
        {!loading && !error && (
          <Document 
            file={processedUrl} 
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="flex justify-center py-4"
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={550}
              className="shadow-md"
            />
          </Document>
        )}
      </div>
      
      {!loading && !error && numPages && (
        <div className="flex items-center justify-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => changePage(-1)} 
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Trang trước
          </Button>
          
          <div className="text-sm">
            Trang {pageNumber} / {numPages}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => changePage(1)} 
            disabled={pageNumber >= numPages}
          >
            Trang sau <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
      
      <div className="text-xs text-gray-500 text-center w-full">
        <p>
          {!error && (
            <>
              {fileName} - <a href={processedUrl} target="_blank" rel="noopener noreferrer" className="text-fpt-blue hover:underline">
                Mở trong tab mới
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default PDFViewer;
