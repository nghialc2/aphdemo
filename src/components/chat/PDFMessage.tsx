
import { FileText, Download, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFMessageProps {
  filename: string;
  fileUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  uploadedAt: string;
}

const PDFMessage = ({ filename, fileUrl, status, uploadedAt }: PDFMessageProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Processed successfully';
      case 'processing':
        return 'Processing...';
      case 'pending':
        return 'Waiting to process...';
      case 'failed':
        return 'Processing failed';
      default:
        return 'Unknown status';
    }
  };

  const handleDownload = () => {
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="chat-message mb-4">
      <div className="flex items-start">
        <div className="w-6 h-6 rounded-full mr-3 flex-shrink-0 flex items-center justify-center bg-blue-100">
          <FileText className="h-4 w-4 text-blue-600" />
        </div>
        <div className="space-y-1 flex-1">
          <p className="text-xs font-medium text-gray-500">File Upload</p>
          <div className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <FileText className="h-8 w-8 text-red-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {filename}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon()}
                  <p className="text-xs text-gray-500">
                    {getStatusText()}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Uploaded at {new Date(uploadedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="flex-shrink-0 ml-2"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFMessage;
