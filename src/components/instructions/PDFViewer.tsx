
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

// CSS imports removed for better performance

// Point PDF.js to local worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

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
  const [urls, setUrls] = useState<string[]>([pdfUrl, ...fallbackUrls].filter(url => url));
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentUrl = urls[currentIndex];

  // Track previous primary URL to avoid unnecessary resets
  const prevPrimaryUrlRef = useRef<string>('');
  
  // Update URLs when props change
  useEffect(() => {
    const newUrls = [pdfUrl, ...fallbackUrls].filter(url => url && url.trim() !== '');
    const newPrimaryUrl = newUrls[0] || '';
    
    console.log('📄 PDFViewer updating URLs:', newUrls);
    console.log('📄 Primary URL changed?', newPrimaryUrl !== prevPrimaryUrlRef.current, 'from:', prevPrimaryUrlRef.current, 'to:', newPrimaryUrl);
    
    // Check if the primary URL actually changed (not just a state update)
    const primaryUrlChanged = newPrimaryUrl !== prevPrimaryUrlRef.current;
    
    setUrls(newUrls);
    setCurrentIndex(0);
    setHasError(false);
    setPage(1);
    
    // Only reset numPages if the primary URL actually changed
    if (primaryUrlChanged) {
      console.log('📄 Resetting numPages due to URL change');
      setNumPages(0);
      prevPrimaryUrlRef.current = newPrimaryUrl;
    }
  }, [pdfUrl, fallbackUrls]);

  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [scale, setScale] = useState(1);
  
  // Refs for panning functionality
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });

  // Simple PDF loading - no heavy caching
  useEffect(() => {
    // Reset state for new URL
    setHasError(false);
    setPage(1);
  }, [currentUrl]);
  
  // Try next URL on error
  const tryNext = () => {
    if (currentIndex < urls.length - 1) {
      console.log(`⏭️ Trying next URL (${currentIndex + 1}/${urls.length - 1})`);
      setCurrentIndex(i => i + 1);
      setHasError(false);
      setPage(1);
    } else {
      console.log('❌ All URLs failed, showing error state');
      setHasError(true);
    }
  };

  // PDF loaded successfully
  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('✅ PDF loaded successfully:', currentUrl);
    console.log('Pages:', numPages);
    console.log('URL type:', currentUrl?.startsWith('blob:') ? 'blob' : 'remote');
    setNumPages(numPages);
    setHasError(false);
  };

  // Error loading PDF
  const onLoadError = (error: any) => {
    console.error('PDF load error for URL:', currentUrl, 'Error:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });
    console.error('All available URLs:', urls);
    console.error('Current URL index:', currentIndex);
    console.error('URL type:', currentUrl?.startsWith('blob:') ? 'blob' : 'remote');
    tryNext();
  };

  // Change page with bounds
  const changePage = (delta: number) => {
    setPage(prev => Math.min(Math.max(prev + delta, 1), numPages));
  };

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1 && contentRef.current) {
      setIsPanning(true);
      setStartPanPosition({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault(); // Prevent default behavior
      
      // Change cursor during panning
      if (contentRef.current) {
        contentRef.current.style.cursor = 'grabbing';
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && scale > 1) {
      const newX = e.clientX - startPanPosition.x;
      const newY = e.clientY - startPanPosition.y;
      setPosition({ x: newX, y: newY });
      e.preventDefault(); // Prevent default behavior
    }
  };

  const handleMouseUp = () => {
    if (isPanning && contentRef.current) {
      setIsPanning(false);
      contentRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    if (isPanning && contentRef.current) {
      setIsPanning(false);
      contentRef.current.style.cursor = 'grab';
    }
  };

  // Reset position when changing pages or zoom level
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [page, scale <= 1]);

  // Show placeholder if no URL provided
  if (!currentUrl || urls.length === 0 || currentUrl.trim() === '') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
        <FileText className="h-16 w-16 mb-4" />
        <p>Chưa có file PDF để hiển thị</p>
        <p className="text-sm">Vui lòng upload file PDF hoặc nhập URL</p>
      </div>
    );
  }

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
      <div 
        ref={containerRef}
        className="w-full border rounded-md relative overflow-auto" 
        style={{ minHeight: 600 }}
      >
        {/* Zoom controls */}
        <div className="absolute top-2 right-2 flex space-x-2 z-10 bg-gray-50 p-1 rounded-md shadow-sm">
          <Button
            size="sm"
            variant="ghost"
            onClick={zoomIn}
            title="Phóng to"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={zoomOut}
            title="Thu nhỏ"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs flex items-center">
            {Math.round(scale * 100)}%
          </span>
        </div>

        <div 
          ref={contentRef}
          className="py-4 flex justify-center"
          style={{ 
            cursor: scale > 1 ? 'grab' : 'default',
            overflow: 'auto',
            maxHeight: '600px',
          }}
        >
          <div
            style={{ 
              transform: scale > 1 ? `translate(${position.x}px, ${position.y}px)` : 'none',
              transition: isPanning ? 'none' : 'transform 0.1s ease-out'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <Document
              file={currentUrl}
              onLoadSuccess={onLoadSuccess}
              onLoadError={onLoadError}
              loading={
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fpt-blue mb-2"></div>
                  <p>Đang tải tài liệu...</p>
                  <p className="text-xs text-gray-500 mt-1">{currentUrl}</p>
                </div>
              }
            >
              <Page
                pageNumber={page}
                width={500}
                scale={scale}
                renderAnnotationLayer={false} // disable for performance
                renderTextLayer={false}       // disable for performance
              />
            </Document>
          </div>
        </div>
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
