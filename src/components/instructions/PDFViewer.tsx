
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Enable text and annotation layers for selectable content
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Point PDF.js to local worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

interface PDFViewerProps {
  pdfUrl: string;           // Path to PDF in public/
  fileName?: string;        // Display name in footer
  fallbackUrls?: string[];  // Optional backup URLs
}

// Cache storage key prefix
const CACHE_KEY_PREFIX = 'pdf-cache-';

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
  const [scale, setScale] = useState(1);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  
  // Refs for panning functionality
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });

  // Improved PDF caching with memory cache and localStorage
  const pdfCache = useRef<Map<string, ArrayBuffer>>(new Map());

  // Check cache and fetch PDF - optimized version
  useEffect(() => {
    const cacheKey = `${CACHE_KEY_PREFIX}${currentUrl}`;
    
    const fetchAndCachePDF = async () => {
      try {
        // First check memory cache (fastest)
        if (pdfCache.current.has(currentUrl)) {
          console.log('Loading PDF from memory cache:', currentUrl);
          setPdfData(pdfCache.current.get(currentUrl) || null);
          return;
        }
        
        // Then check localStorage
        const cachedPdf = localStorage.getItem(cacheKey);
        if (cachedPdf) {
          console.log('Loading PDF from cache:', currentUrl);
          // Convert base64 string back to ArrayBuffer
          const binaryString = atob(cachedPdf);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const arrayBuffer = bytes.buffer;
          
          // Store in memory cache for faster subsequent access
          pdfCache.current.set(currentUrl, arrayBuffer);
          setPdfData(arrayBuffer);
          return;
        }
        
        // If not in cache, fetch it
        console.log('Fetching PDF from server:', currentUrl);
        const response = await fetch(currentUrl);
        if (!response.ok) throw new Error('PDF fetch failed');
        
        const arrayBuffer = await response.arrayBuffer();
        
        // Store in memory cache
        pdfCache.current.set(currentUrl, arrayBuffer);
        setPdfData(arrayBuffer);
        
        // Store in localStorage (convert ArrayBuffer to base64 string)
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        
        try {
          localStorage.setItem(cacheKey, base64);
          console.log('PDF cached successfully');
        } catch (err) {
          console.warn('Failed to cache PDF, possibly exceeding storage quota', err);
          // Silently fail on storage errors - we can still display the PDF
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
        tryNext();
      }
    };

    // Start PDF loading
    fetchAndCachePDF();
    
    // Preload with link tag as additional fallback
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'document';
    link.href = currentUrl;
    document.head.appendChild(link);
    
    return () => { document.head.removeChild(link); };
  }, [currentUrl]);
  
  // Try next URL on error
  const tryNext = () => {
    if (currentIndex < urls.length - 1) {
      setCurrentIndex(i => i + 1);
      setHasError(false);
      setPage(1);
      setPdfData(null);
    } else {
      setHasError(true);
    }
  };

  // PDF loaded successfully
  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setHasError(false);
  };

  // Error loading PDF
  const onLoadError = (error: any) => {
    console.error('PDF load error:', error);
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
    if (scale > 1) {
      setIsPanning(true);
      setStartPanPosition({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && scale > 1) {
      const newX = e.clientX - startPanPosition.x;
      const newY = e.clientY - startPanPosition.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  // Reset position when changing pages or zoom level
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [page, scale <= 1]);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-red-500">
        <FileText className="h-16 w-16 mb-4" />
        <p>Không thể tải PDF từ các nguồn.</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => { setCurrentIndex(0); setHasError(false); setPage(1); setPdfData(null); }}
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
        className="w-full border rounded-md relative overflow-hidden" 
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
          className={`py-4 flex justify-center ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
          style={{ 
            overflow: 'auto',
            transform: scale > 1 ? `translate(${position.x}px, ${position.y}px)` : 'none',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <Document
            file={pdfData || currentUrl}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fpt-blue mb-2"></div>
                <p>Đang tải tài liệu...</p>
              </div>
            }
          >
            <Page
              pageNumber={page}
              width={550}
              scale={scale}
              renderAnnotationLayer // enable annotation layer
              renderTextLayer       // enable selectable text layer
            />
          </Document>
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
