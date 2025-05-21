Tuyệt vời! Việc bạn đã đổi tên file là một bước rất quan trọng.

Dưới đây là đoạn code đã được cập nhật theo khuyến nghị, sử dụng đường dẫn raw.githubusercontent.com với tên file đã được làm sạch:

JavaScript

// ... (giữ nguyên các import và cấu hình pdfjs.GlobalWorkerOptions.workerSrc)
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Giả sử bạn đang dùng shadcn/ui

// Import CSS for PDF viewer
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker - using version-matched CDN (giữ nguyên, trừ khi bạn muốn tự host)
// Đảm bảo file pdf.worker.min.js có thể truy cập được từ URL này
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string; // URL chính để tải PDF
  fileName?: string; // Tên hiển thị của file
  fallbackUrls?: string[]; // Các URL dự phòng
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  pdfUrl, 
  fileName = "document.pdf",
  fallbackUrls = [] 
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState<number>(0);
  
  // Combine all URLs, ensuring the primary pdfUrl is always first
  const [allUrls, setAllUrls] = useState<string[]>([]);

  useEffect(() => {
    // Chỉ thiết lập allUrls một lần khi component mount
    setAllUrls([pdfUrl, ...fallbackUrls]);
  }, [pdfUrl, fallbackUrls]); // Dependencies để cập nhật nếu props thay đổi

  // Log tất cả URL để debug
  useEffect(() => {
    if (allUrls.length > 0) { // Đảm bảo allUrls đã được thiết lập
      console.log("PDF loading options:", allUrls);
      console.log("Current attempt URL:", allUrls[currentUrlIndex]);
    }
  }, [allUrls, currentUrlIndex]);

  // Hàm thử tải PDF từ URL tiếp theo trong danh sách
  const tryNextUrl = () => {
    if (currentUrlIndex < allUrls.length - 1) {
      console.log(`Thử tải từ URL tiếp theo: ${allUrls[currentUrlIndex + 1]}`);
      setCurrentUrlIndex(prevIndex => prevIndex + 1);
      setLoading(true);
      setError(false);
      setPageNumber(1); // Reset trang khi thử URL mới
    } else {
      setError(true);
      setLoading(false);
      console.error('All URLs failed to load PDF');
    }
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log("PDF loaded successfully with", numPages, "pages from", allUrls[currentUrlIndex]);
    setNumPages(numPages);
    setLoading(false);
    setError(false); // Đảm bảo reset lỗi nếu tải thành công sau khi retry
  }

  function onDocumentLoadError(err: Error) {
    console.error('Error while loading PDF:', err.message, 'from URL:', allUrls[currentUrlIndex]);
    // Log lỗi chi tiết từ react-pdf
    console.error(err); 
    
    // Thử URL tiếp theo nếu có
    tryNextUrl();
  }

  function changePage(offset: number) {
    const newPageNumber = pageNumber + offset;
    if (newPageNumber >= 1 && newPageNumber <= (numPages || 1)) {
      setPageNumber(newPageNumber);
    }
  }
  
  // Current URL that we're trying to load
  const currentUrl = allUrls[currentUrlIndex];
  
  return (
    <div className="flex flex-col items-center w-full space-y-4">
      <div className="border rounded-md w-full" style={{ minHeight: '600px' }}>
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fpt-blue mx-auto mb-4"></div>
              <p>Đang tải tài liệu từ {currentUrl}...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-red-500">
              <FileText className="h-16 w-16 mx-auto mb-4" />
              <p>Không thể tải tài liệu PDF từ bất kỳ nguồn nào đã thử.</p>
              <p className="mt-2">Vui lòng kiểm tra lại đường dẫn và quyền truy cập.</p>
              <Button 
                onClick={() => {
                  setCurrentUrlIndex(0); // Reset về URL đầu tiên để thử lại
                  setLoading(true);
                  setError(false);
                  setPageNumber(1); // Reset trang khi thử lại
                }}
                variant="outline"
                className="mt-4"
              >
                Thử lại
              </Button>
              <a 
                href={currentUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-fpt-blue hover:underline mt-4 block"
              >
                Nhấn vào đây để mở tài liệu trong tab mới
              </a>
            </div>
          </div>
        )}
        
        {!loading && !error && (
          <Document 
            file={currentUrl} // Truyền URL hiện tại đang được thử
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="flex justify-center py-4"
            loading={
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fpt-blue mx-auto mb-4"></div>
                  <p>Đang tải tài liệu...</p>
                </div>
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              // Đã xóa renderTextLayer=false và renderAnnotationLayer=false
              // để cho phép chọn và copy text theo mặc định của react-pdf
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
              {fileName} - <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-fpt-blue hover:underline">
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