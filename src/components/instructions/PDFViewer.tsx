import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import CSS for PDF viewer layers
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Use local worker to ensure version match
// Copy pdf.worker.min.js from node_modules/pdfjs-dist/build into your public/ folder
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  pdfUrl: string;           // Main PDF URL (e.g., "/filename.pdf" when placed in public/)
  fileName?: string;        // Display name
  fallbackUrls?: string[];  // Optional backup URLs
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  fileName = 'document.pdf',
  fallbackUrls = [],
}) => {
  // Combine primary and fallback URLs
  const [urls] = useState<string[]>([pdfUrl, ...fallbackUrls]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentUrl = urls[currentIndex];

  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [hasError, setHasError] = useState(false);

  const tryNextUrl = () => {
    if (currentIndex < urls.length - 1) {
      setCurrentIndex(idx => idx + 1);
      setHasError(false);
      setPage(1);
    } else {
      setHasError(true);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setHasError(false);
  };

  const onDocumentLoadError = (error: any) => {
    console.error('PDF load error:', error);
    tryNextUrl();
  };

  const changePage = (delta: number) => {
    setPage(prev => Math.min(Math.max(prev + delta, 1), numPages));
  };

  // If all URLs fail, show error UI
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-red-500">
        <FileText className="h-16 w-16 mb-4" />
        <p>Không thể tải PDF từ các nguồn.</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => {
            setCurrentIndex(0);
            setHasError(false);
            setPage(1);
          }}
        >
          Thử lại
        </Button>
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-fpt-blue hover:underline"
        >
          Mở ở tab mới
        </a>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <div className="w-full border rounded-md" style={{ minHeight: 600 }}>
        <Document
          file={currentUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fpt-blue mx-auto mb-2"></div>
              <p>Đang tải...</p>
            </div>
          }
          className="py-4 flex justify-center"
        >
          <Page
            pageNumber={page}
            width={550}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        </Document>
      </div>

      {numPages > 0 && (
        <div className="flex items-center space-x-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => changePage(-1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Trang trước
          </Button>
          <span>{page} / {numPages}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => changePage(1)}
            disabled={page >= numPages}
          >
            Trang sau <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {numPages > 0 && (
        <div className="text-xs text-gray-500">
          {fileName} -{' '}
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fpt-blue hover:underline"
          >
            Mở ở tab mới
          </a>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
