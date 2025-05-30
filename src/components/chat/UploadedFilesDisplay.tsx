
import { FileText, Image, File } from "lucide-react";
import { UploadedFile } from "@/hooks/useFileUpload";

interface UploadedFilesDisplayProps {
  files: UploadedFile[];
}

const UploadedFilesDisplay = ({ files }: UploadedFilesDisplayProps) => {
  const getFileIcon = (file: UploadedFile) => {
    if (file.type === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
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
    <div className="flex flex-wrap gap-2 mb-3">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 border"
        >
          {getFileIcon(file)}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700 truncate max-w-32">
              {file.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatFileSize(file.size)}
            </span>
          </div>
          {file.type === 'application/pdf' && file.extractedContent && (
            <div className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
              PDF đã xử lý
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UploadedFilesDisplay;
