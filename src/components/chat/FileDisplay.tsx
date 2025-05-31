import { FileText, File as FileIcon } from "lucide-react";

interface FileDisplayProps {
  fileName: string;
  isProcessed?: boolean;
  fileType?: string;
  extractedContentLength?: number;
}

const FileDisplay = ({ 
  fileName, 
  isProcessed = false, 
  fileType = '',
  extractedContentLength
}: FileDisplayProps) => {
  // Determine file type and icon
  const getFileIcon = () => {
    if (fileType) {
      if (fileType === 'application/pdf') {
        return <FileText className="h-5 w-5 text-red-500" />;
      }
      if (fileType.startsWith('image/')) {
        return <FileIcon className="h-5 w-5 text-blue-500" />;
      }
    }
    
    // Determine by filename extension if fileType not provided
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <FileIcon className="h-5 w-5 text-blue-500" />;
    }
    
    return <FileIcon className="h-5 w-5 text-gray-500" />;
  };
  
  // Format file size for display
  const formatContentSize = (chars: number) => {
    if (chars < 1000) {
      return `${chars} ký tự`;
    } else {
      return `${(chars / 1000).toFixed(1)}K ký tự`;
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm max-w-full">
      <div className="flex-shrink-0">
        {getFileIcon()}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium text-gray-800 truncate">
          {fileName}
        </span>
        {isProcessed && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            {extractedContentLength 
              ? `Đã trích xuất ${formatContentSize(extractedContentLength)}`
              : "Đã trích xuất nội dung"
            }
          </span>
        )}
      </div>
    </div>
  );
};

export default FileDisplay;
