import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// CSS for PDF viewer (ESM path)
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set worker from CDN (full URL to avoid mixed-content issues)
pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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
  // Initialize URLs (primary + fallbacks)
  const [allUrls] = useState<string[]>([pdfUrl, ...fallbackUrls]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState<number>(0);
  const currentUrl = allUrls[currentUrlIndex];

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Try next URL in case of load failure
  const tryNextUrl = () => {
    if (currentUrlIndex < allUrls.length - 1) {
      setCurrentUrlIndex(idx => idx + 1);
      setLoading(true);
      setError(false);
      setPageNumber(1);
    } else {
      setError(true);
      setLoading(false);
      console.error('All URLs failed to load PDF');
    }
  };

  // Handlers for PDF.js
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(false);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error('Error loading PDF:', err);
    tryNextUrl();
  };

  // Page navigation
  const changePage = (offset: number) => {
    setPageNumber(prev => {
      const next = prev + offset;
      if (numPages && next >= 1 && next <= numPages) return next;
      return prev;
    });
  };

  // If no URLs, render nothing
  if (!allUrls.length) return null;

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      <div className="border rounded-md w-full" style={{ minHeight: '600px' }}>
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fpt-blue mx-auto mb-4"></div>
              <p>Loading document from {currentUrl}...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-red-500">
              <FileText className="h-16 w-16 mx-auto mb-4" />
              <p>Could not load PDF document from any of the tried sources.</p>
              <p className="mt-2">Please check the URL and access permissions.</p>
              <Button
                onClick={() => {
                  setCurrentUrlIndex(0);
                  setLoading(true);
                  setError(false);
                  setPageNumber(1);
                }}
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fpt-blue hover:underline mt-4 block"
              >
                Open in new tab
              </a>
            </div>
          </div>
        )}

        {/* PDF document view */}
        {!loading && !error && (
          <Document
            file={currentUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="flex justify-center py-4"
            loading={
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fpt-blue mx-auto mb-4"></div>
                  <p>Loading document...</p>
                </div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              width={550}
              className="shadow-md"
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        )}
      </div>

      {/* Pagination controls */}
      {!loading && !error && numPages && (
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous Page
          </Button>
          <div className="text-sm">
            Page {pageNumber} / {numPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
          >
            Next Page <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Footer with file link */}
      <div className="text-xs text-gray-500 text-center w-full">
        {!error && (
          <>
            {fileName} -{' '}
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fpt-blue hover:underline"
            >
              Open in new tab
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
