
import { FileText } from "lucide-react";

interface FileDisplayProps {
  fileName: string;
  isProcessed?: boolean;
}

const FileDisplay = ({ fileName, isProcessed = false }: FileDisplayProps) => {
  return (
    <div className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg px-3 py-2 border border-gray-200 max-w-xs">
      <div className="flex-shrink-0">
        <FileText className="h-6 w-6 text-red-500" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-gray-800 truncate">
          {fileName}
        </span>
        {isProcessed && (
          <span className="text-xs text-green-600 font-medium">
            Đã xử lý
          </span>
        )}
      </div>
    </div>
  );
};

export default FileDisplay;
