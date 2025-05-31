import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, Upload, X, FileText, Image, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
}

const FileUpload = ({ onFileSelect, selectedFiles, onRemoveFile, disabled }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [disabled]);

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      // Giới hạn kích thước file: 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: `File ${file.name} quá lớn. Giới hạn 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    if (file.type === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Count file types
  const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
  const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
  const otherFiles = selectedFiles.filter(file => 
    !file.type.startsWith('image/') && file.type !== 'application/pdf'
  );

  return (
    <div className="space-y-2">
      {/* File stats summary */}
      {selectedFiles.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          {pdfFiles.length > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
              {pdfFiles.length} PDF {pdfFiles.length === 1 ? 'file' : 'files'}
            </span>
          )}
          {imageFiles.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
              {imageFiles.length} {imageFiles.length === 1 ? 'hình ảnh' : 'hình ảnh'}
            </span>
          )}
          {otherFiles.length > 0 && (
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">
              {otherFiles.length} {otherFiles.length === 1 ? 'file khác' : 'file khác'}
            </span>
          )}
          {pdfFiles.length > 0 && (
            <span className="text-xs text-green-600 ml-auto">
              Nội dung PDF sẽ được trích xuất
            </span>
          )}
        </div>
      )}

      {/* File list */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 bg-white rounded-md px-3 py-2 border text-sm",
                file.type === 'application/pdf' 
                  ? "border-red-200" 
                  : "border-gray-200"
              )}
            >
              {getFileIcon(file)}
              <span className="flex-1 truncate max-w-32">{file.name}</span>
              <span className="text-gray-500 text-xs">{formatFileSize(file.size)}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-4 w-4 p-0 hover:bg-red-100"
                onClick={() => onRemoveFile(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          disabled={disabled}
        />
        
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        {selectedFiles.length > 0 && (
          <span className="text-xs text-gray-500">
            {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} đã chọn
          </span>
        )}
      </div>

      {/* Drag overlay */}
      {isDragOver && (
        <div
          className={cn(
            "fixed inset-0 bg-blue-500/20 z-50 flex items-center justify-center",
            "border-2 border-dashed border-blue-500"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">Thả file vào đây</p>
            <p className="text-sm text-gray-500 mt-2">Hỗ trợ PDF, hình ảnh và các file khác</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
