
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Enable text and annotation layers for selectable content
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Point PDF.js to CDN worker to ensure compatibility
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;           // Path to PDF in public/
  fileName?: string;        // Display name in footer
  fallbackUrls?: string[];  // Optional backup URLs
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  fileName = 'document.pdf',
  fallbackUrls = [],
}) => {
  const [urls] = useState<string[]>([pdfUrl, ...fallbackUrls]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentUrl = urls[currentIndex];

  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log(`Attempting to load PDF from: ${currentUrl}`);
    setIsLoading(true);
    // Reset error state when URL changes
    setHasError(false);
  }, [currentUrl]);

  // Try next URL on error
  const tryNext = () => {
    console.log(`Error loading PDF from ${currentUrl}, trying next URL if available`);
    if (currentIndex < urls.length - 1) {
      setCurrentIndex(i => i + 1);
      setHasError(false);
      setPage(1);
    } else {
      console.error("All PDF URLs failed to load");
      setHasError(true);
    }
  };

  // PDF loaded successfully
  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log(`PDF loaded successfully with ${numPages} pages`);
    setNumPages(numPages);
    setHasError(false);
    setIsLoading(false);
  };

  // Error loading PDF
  const onLoadError = (error: any) => {
    console.error('PDF load error:', error);
    setIsLoading(false);
    tryNext();
  };

  // Change page with bounds
  const changePage = (delta: number) => {
    setPage(prev => Math.min(Math.max(prev + delta, 1), numPages));
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-red-500">
        <FileText className="h-16 w-16 mb-4" />
        <p>Không thể tải PDF từ các nguồn.</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => { setCurrentIndex(0); setHasError(false); setPage(1); }}
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
          onLoadSuccess={onLoadSuccess}
          onLoadError={onLoadError}
          loading={
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fpt-blue mb-2"></div>
              <p>Đang tải tài liệu...</p>
            </div>
          }
          className="py-4 flex justify-center"
        >
          <Page
            pageNumber={page}
            width={550}
            renderAnnotationLayer // enable annotation layer
            renderTextLayer       // enable selectable text layer
          />
        </Document>
      </div>

      {numPages > 0 && (
        <div className="flex items-center space-x-4">
          <Button size="sm" variant="outline" onClick={() => changePage(-1)} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Trang trước
          </Button>
          <span>{page} / {numPages}</span>
          <Button size="sm" variant="outline" onClick={() => changePage(1)} disabled={page >= numPages}>
            Trang sau <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {numPages > 0 && (
        <div className="text-xs text-gray-500">
          {fileName} –{' '}
          <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-fpt-blue hover:underline">
            Mở ở tab mới
          </a>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
