import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// CSS for PDF viewer (ESM path)
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Use local worker to avoid CDN blocks
// Copy pdf.worker.min.js into public/ and reference it below:
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  fallbackUrls?: string[];
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  fileName = 'document.pdf',
  fallbackUrls = [],
}) => {
  const [urls] = useState<string[]>([pdfUrl, ...fallbackUrls]);
  const [index, setIndex] = useState(0);
  const currentUrl = urls[index];

  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(false);

  const tryNext = () => {
    if (index < urls.length - 1) {
      setIndex(i => i + 1);
      setError(false);
      setPage(1);
    } else {
      setError(true);
    }
  };

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onLoadError = (err: Error) => {
    console.error('PDF load error:', err);
    tryNext();
  };

  const go = (offset: number) => {
    setPage(p => Math.min(Math.max(p + offset, 1), numPages));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-red-500">
        <FileText className="h-16 w-16 mb-4" />
        <p>Không thể tải PDF từ các nguồn.</p>
        <Button onClick={() => { setIndex(0); setError(false); }} variant="outline" className="mt-2">
          Thử lại
        </Button>
        <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="mt-2 text-fpt-blue hover:underline">
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
          <Button onClick={() => go(-1)} disabled={page <= 1} variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" /> Trang trước
          </Button>
          <span>{page} / {numPages}</span>
          <Button onClick={() => go(1)} disabled={page >= numPages} variant="outline" size="sm">
            Trang sau <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {numPages > 0 && (
        <div className="text-xs text-gray-500">
          {fileName} - <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-fpt-blue hover:underline">Mở ở tab mới</a>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
