
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
    // Set allUrls when component mounts
    setAllUrls([pdfUrl, ...fallbackUrls]);
  }, [pdfUrl, fallbackUrls]);

  // Log all URLs for debugging
  useEffect(() => {
    if (allUrls.length > 0) {
      console.log("PDF loading options:", allUrls);
      console.log("Current attempt URL:", allUrls[currentUrlIndex]);
    }
  }, [allUrls, currentUrlIndex]);

  // Try loading PDF from the next URL in the list
  const tryNextUrl = () => {
    if (currentUrlIndex < allUrls.length - 1) {
      console.log(`Trying to load from next URL: ${allUrls[currentUrlIndex + 1]}`);
      setCurrentUrlIndex(prevIndex => prevIndex + 1);
      setLoading(true);
      setError(false);
      setPageNumber(1); // Reset page when trying a new URL
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
    setError(false); // Reset error if loading succeeds after retry
  }

  function onDocumentLoadError(err: Error) {
    console.error('Error while loading PDF:', err.message, 'from URL:', allUrls[currentUrlIndex]);
    console.error(err); 
    
    // Try next URL if available
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
              <p>Loading document from {currentUrl}...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-red-500">
              <FileText className="h-16 w-16 mx-auto mb-4" />
              <p>Could not load PDF document from any of the tried sources.</p>
              <p className="mt-2">Please check the URL and access permissions.</p>
              <Button 
                onClick={() => {
                  setCurrentUrlIndex(0); // Reset to first URL to try again
                  setLoading(true);
                  setError(false);
                  setPageNumber(1); // Reset page when trying again
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
                Click here to open document in new tab
              </a>
            </div>
          </div>
        )}
        
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
      
      <div className="text-xs text-gray-500 text-center w-full">
        <p>
          {!error && (
            <>
              {fileName} - <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-fpt-blue hover:underline">
                Open in new tab
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default PDFViewer;
