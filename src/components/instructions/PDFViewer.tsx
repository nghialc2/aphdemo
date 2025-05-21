
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import CSS for PDF viewer
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker - using version-matched CDN
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
  const [processedUrl, setProcessedUrl] = useState<string>("");

  // Convert Google Drive URL to a direct download format
  useEffect(() => {
    const getDirectDownloadUrl = (url: string): string => {
      if (url.includes('drive.google.com/file/d/')) {
        // Extract file ID from URL
        const fileIdMatch = url.match(/\/d\/([^\/]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          const fileId = fileIdMatch[1];
          // Use a more reliable format for Google Drive links
          return `https://drive.google.com/uc?id=${fileId}&export=download`;
        }
      }
      return url;
    };

    console.log("Original URL:", pdfUrl);
    const directUrl = getDirectDownloadUrl(pdfUrl);
    console.log("Processed URL:", directUrl);
    setProcessedUrl(directUrl);
  }, [pdfUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log("PDF loaded successfully with", numPages, "pages");
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

  // Use our built-in sample PDF as a fallback for testing/development
  const fallbackPdf = "/exercise1.pdf";
  
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
              <p>Không thể tải tài liệu từ Google Drive (có thể do hạn chế CORS).</p>
              <p className="mt-2">Đang thử tải tài liệu mặc định...</p>
              <Document 
                file={fallbackPdf}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(err) => console.error('Fallback PDF error:', err)}
                className="flex justify-center py-4 mt-4"
              >
                <Page 
                  pageNumber={1} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={550}
                  className="shadow-md"
                />
              </Document>
              <a href={processedUrl} target="_blank" rel="noopener noreferrer" className="text-fpt-blue hover:underline mt-2 block">
                Nhấn vào đây để mở tài liệu trong tab mới
              </a>
            </div>
          </div>
        )}
        
        {!loading && !error && processedUrl && (
          <Document 
            file={processedUrl} 
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
