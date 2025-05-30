
import { FileText, Image, File } from "lucide-react";
import { UploadedFile } from "@/hooks/useFileUpload";

interface UploadedFilesDisplayProps {
  files: UploadedFile[];
}

const UploadedFilesDisplay = ({ files }: UploadedFilesDisplayProps) => {
  const getFileIcon = (file: UploadedFile) => {
    if (file.type === 'application/pdf') {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    if (file.type.startsWith('image/')) {
      return <Image className="h-6 w-6 text-blue-500" />;
    }
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow min-w-0 max-w-sm"
        >
          <div className="flex-shrink-0">
            {getFileIcon(file)}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-gray-800 truncate">
              {file.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </span>
              {file.type === 'application/pdf' && file.extractedContent && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  Đã xử lý
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UploadedFilesDisplay;
