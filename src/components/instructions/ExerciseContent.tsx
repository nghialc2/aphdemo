
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { githubUploadService, GitHubUploadService } from '@/services/githubUpload';
import PDFViewer from './PDFViewer';

interface ExerciseContentProps {
  exercise: Exercise;
  onBackClick: () => void;
  isInEditMode?: boolean;
  contentEdits?: any;
  onContentUpdate?: (updates: any) => void;
  onExerciseUpdate?: (updatedExercise: Exercise) => void;
}

// Define the types for exercise content
export type Exercise = {
  id: string;
  title: string;
  description: string;
  content?: React.ReactNode;
  borderColor?: string; // Custom border color for the exercise
  // Serializable exercise data for localStorage
  exerciseType?: 'basic' | 'pdf' | 'drive-link';
  pdfUrl?: string;
  fileName?: string;
  driveLink?: string;
  customTitle?: string;
};

const ExerciseContent: React.FC<ExerciseContentProps> = ({ 
  exercise, 
  onBackClick, 
  isInEditMode = false, 
  contentEdits, 
  onContentUpdate,
  onExerciseUpdate
}) => {
  // Use persisted edits if available, otherwise use original values
  const [title, setTitle] = useState(contentEdits?.title || exercise.title);
  const [description, setDescription] = useState(contentEdits?.description || exercise.description);
  
  // Extract PDF info if exercise has content with PDFViewer
  const extractPDFInfo = () => {
    if (exercise.id === "exercise-1-1") {
      return {
        hasCustomContent: true,
        customTitle: "Tối ưu hóa tuyển dụng với AI - Tạo JD",
        pdfUrl: "https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/huong_dan_thuc_hanh_tao_JD.pdf",
        fileName: "Hướng dẫn thực hành tạo JD.pdf",
        fallbackUrl: "/huong_dan_thuc_hanh_tao_JD.pdf"
      };
    } else if (exercise.id === "exercise-1-2") {
      return {
        hasCustomContent: true,
        customTitle: "Tối ưu hóa tuyển dụng với AI - Scanning & Interview",
        pdfUrl: "https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/huong_dan_thuc_hanh_tao_workflow.pdf",
        fileName: "Hướng dẫn thực hành tạo workflow.pdf",
        fallbackUrl: "/huong_dan_thuc_hanh_tao_workflow.pdf"
      };
    } else if (exercise.id === "exercise-2-1") {
      return {
        hasCustomContent: true,
        customTitle: "Thiết kế đào tạo cá nhân hóa bằng AI - TNA",
        hasLink: true,
        linkUrl: "https://drive.google.com/drive/folders/1zr9Qhx-AsTP6_JsPb8xSyufGOYBBzziX?usp=sharing",
        linkText: "Hãy tải dữ liệu demo thực hành tại đây",
        pdfUrl: "https://raw.githubusercontent.com/nghialc2/aphdemo/main/public/Huong_dan_thuc_hanh_custom_GPT_Analysis_Design.pdf",
        fileName: "Huong_dan_thuc_hanh_custom_GPT_Analysis_Design.pdf",
        fallbackUrl: "/Huong_dan_thuc_hanh_custom_GPT_Analysis_Design.pdf"
      };
    } else if (exercise.id === "exercise-2-2") {
      return {
        hasCustomContent: true,
        customTitle: "Thiết kế đào tạo cá nhân hóa bằng AI - Thiết kế học liệu",
        pdfUrl: "",
        fileName: "Hướng dẫn thiết kế học liệu.pdf",
        fallbackUrl: "/huong_dan_thiet_ke_hoc_lieu.pdf"
      };
    } else if (exercise.id === "exercise-3") {
      return {
        hasCustomContent: true,
        customTitle: "Quản trị hiệu suất liên tục với AI",
        pdfUrl: "",
        fileName: "Hướng dẫn quản trị hiệu suất.pdf",
        fallbackUrl: "/huong_dan_quan_tri_hieu_suat.pdf"
      };
    } else if (exercise.id === "exercise-4") {
      return {
        hasCustomContent: true,
        customTitle: "Nâng cao trải nghiệm nhân viên bằng AI",
        pdfUrl: "",
        fileName: "Hướng dẫn trải nghiệm nhân viên.pdf",
        fallbackUrl: "/huong_dan_trai_nghiem_nhan_vien.pdf"
      };
    }
    return { hasCustomContent: false };
  };

  const pdfInfo = extractPDFInfo();
  
  // Initialize state with priority: contentEdits > exercise data > extractPDFInfo fallback
  const [customTitle, setCustomTitle] = useState(
    contentEdits?.customTitle ?? exercise.customTitle ?? pdfInfo.customTitle ?? ""
  );
  const [pdfUrl, setPdfUrl] = useState(
    contentEdits?.pdfUrl ?? exercise.pdfUrl ?? pdfInfo.pdfUrl ?? ""
  );
  const [fileName, setFileName] = useState(
    contentEdits?.fileName ?? exercise.fileName ?? pdfInfo.fileName ?? ""
  );
  const [fallbackUrl, setFallbackUrl] = useState(
    contentEdits?.fallbackUrl ?? pdfInfo.fallbackUrl ?? ""
  );
  const [linkUrl, setLinkUrl] = useState(
    contentEdits?.linkUrl ?? exercise.driveLink ?? pdfInfo.linkUrl ?? ""
  );
  const [linkText, setLinkText] = useState(
    contentEdits?.linkText ?? pdfInfo.linkText ?? ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const [pdfViewerKey, setPdfViewerKey] = useState(0);
  const [hasRecentUpload, setHasRecentUpload] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [persistentPdfUrl, setPersistentPdfUrl] = useState<string>(''); // GitHub URL for persistence

  // Set up GitHub upload completion callback
  useEffect(() => {
    (window as any).onGitHubUploadComplete = (fileName: string, githubUrl: string) => {
      console.log('📎 GitHub upload completed for:', fileName, 'URL:', githubUrl);
      setPersistentPdfUrl(githubUrl);
      
      toast({
        title: "📎 GitHub sync completed",
        description: "PDF is now available permanently and will persist after refresh.",
      });
    };

    return () => {
      (window as any).onGitHubUploadComplete = null;
    };
  }, [toast]);

  // Update state when exercise or contentEdits changes (but not during recent uploads)
  useEffect(() => {
    if (hasRecentUpload) {
      console.log('⏸️ Skipping useEffect due to recent upload');
      return;
    }
    
    console.log('🔄 useEffect triggered - updating state from exercise/contentEdits');
    console.log('   - contentEdits?.pdfUrl:', contentEdits?.pdfUrl);
    console.log('   - exercise.pdfUrl:', exercise.pdfUrl);
    console.log('   - pdfInfo.pdfUrl:', pdfInfo.pdfUrl);
    console.log('   - current pdfUrl state:', pdfUrl);
    
    // Check if exercise has been explicitly cleared (exerciseType is 'basic' with no pdfUrl)
    const exerciseExplicitlyCleared = exercise.exerciseType === 'basic' && !exercise.pdfUrl;
    console.log('   - Exercise explicitly cleared?', exerciseExplicitlyCleared);
    
    // If exercise is explicitly cleared, don't restore fallback URLs from pdfInfo
    const newPdfUrl = exerciseExplicitlyCleared ? "" : 
      (contentEdits?.pdfUrl && contentEdits.pdfUrl.trim()) ? contentEdits.pdfUrl : 
      (exercise.pdfUrl ?? pdfInfo.pdfUrl ?? "");
    
    const newFileName = exerciseExplicitlyCleared ? "" :
      (contentEdits?.fileName && contentEdits.fileName.trim()) ? contentEdits.fileName : 
      (exercise.fileName ?? pdfInfo.fileName ?? "");
    
    const newFallbackUrl = exerciseExplicitlyCleared ? "" :
      (contentEdits?.fallbackUrl && contentEdits.fallbackUrl.trim()) ? contentEdits.fallbackUrl : 
      (pdfInfo.fallbackUrl ?? "");
    
    // Don't override existing blob URLs with empty values unless explicitly cleared
    const shouldUpdatePdfUrl = exerciseExplicitlyCleared || newPdfUrl || !pdfUrl.startsWith('blob:');
    const shouldUpdateFileName = exerciseExplicitlyCleared || newFileName || !fileName;
    
    console.log('   - Should update pdfUrl?', shouldUpdatePdfUrl, '(newValue:', newPdfUrl, ')');
    console.log('   - Should update fileName?', shouldUpdateFileName, '(newValue:', newFileName, ')');
    console.log('   - Setting fallbackUrl to:', newFallbackUrl);
    
    setCustomTitle(contentEdits?.customTitle ?? exercise.customTitle ?? pdfInfo.customTitle ?? "");
    if (shouldUpdatePdfUrl) setPdfUrl(newPdfUrl);
    if (shouldUpdateFileName) setFileName(newFileName);
    setFallbackUrl(newFallbackUrl);
    setLinkUrl(contentEdits?.linkUrl ?? exercise.driveLink ?? pdfInfo.linkUrl ?? "");
    setLinkText(contentEdits?.linkText ?? pdfInfo.linkText ?? "");
  }, [exercise, contentEdits, pdfInfo.customTitle, pdfInfo.pdfUrl, pdfInfo.fileName, pdfInfo.fallbackUrl, pdfInfo.linkUrl, pdfInfo.linkText, hasRecentUpload, pdfUrl, fileName]);

  // Handlers to update both local state and persist changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onContentUpdate?.({ title: newTitle });
  };

  const handleCustomTitleChange = (newCustomTitle: string) => {
    setCustomTitle(newCustomTitle);
    onContentUpdate?.({ customTitle: newCustomTitle });
  };

  const handlePdfUrlChange = (newPdfUrl: string) => {
    console.log('🔗 handlePdfUrlChange called with:', newPdfUrl);
    setPdfUrl(newPdfUrl);
    if (newPdfUrl && newPdfUrl.startsWith('blob:')) {
      console.log('🔗 Blob URL detected, updating contentEdits directly to persist');
      // For blob URLs, we need to ensure they persist by updating the contentEdits
      onContentUpdate?.({ pdfUrl: newPdfUrl });
    } else {
      onContentUpdate?.({ pdfUrl: newPdfUrl });
    }
    console.log('🔗 setPdfUrl called, onContentUpdate called');
  };

  const handleFileNameChange = (newFileName: string) => {
    console.log('📝 handleFileNameChange called with:', newFileName);
    setFileName(newFileName);
    onContentUpdate?.({ fileName: newFileName });
  };

  const handleFallbackUrlChange = (newFallbackUrl: string) => {
    console.log('🔄 handleFallbackUrlChange called with:', newFallbackUrl);
    setFallbackUrl(newFallbackUrl);
    onContentUpdate?.({ fallbackUrl: newFallbackUrl });
  };

  const handleLinkUrlChange = (newLinkUrl: string) => {
    setLinkUrl(newLinkUrl);
    onContentUpdate?.({ linkUrl: newLinkUrl });
  };

  const handleLinkTextChange = (newLinkText: string) => {
    setLinkText(newLinkText);
    onContentUpdate?.({ linkText: newLinkText });
  };

  // File upload functions
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file using the service
    const validation = GitHubUploadService.validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Lỗi file",
        description: validation.error || "File không hợp lệ",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('🚀 Starting file upload for:', file.name);
      
      // Upload file using the GitHub service
      const result = await githubUploadService.uploadFile(file);
      
      console.log('📥 Upload complete. Result:', result);
      console.log('📥 Success status:', result.success);
      console.log('📥 Raw URL:', result.rawUrl);
      console.log('📥 Fallback URL:', result.fallbackUrl);
      console.log('📥 File name:', result.fileName);
      
      if (result.success) {
        console.log('✅ Upload successful, updating URLs...');
        
        // Set flag to prevent useEffect from overriding our URLs
        setHasRecentUpload(true);
        
        // Clear any old URLs first to ensure clean state
        console.log('🧹 Clearing old URLs...');
        handlePdfUrlChange('');
        handleFallbackUrlChange('');
        
        // Wait a moment for state to clear, then set new URLs
        setTimeout(() => {
          console.log('🔄 Setting new URLs:');
          console.log('   - pdfUrl:', result.rawUrl);
          console.log('   - fileName:', result.fileName);
          console.log('   - fallbackUrl:', result.fallbackUrl || '');
          
          handlePdfUrlChange(result.rawUrl);
          handleFileNameChange(result.fileName);
          handleFallbackUrlChange(result.fallbackUrl || '');
          
          // Force refresh the PDF viewer with new URLs
          setTimeout(() => {
            console.log('🔄 Refreshing PDF viewer...');
            setPdfViewerKey(prev => prev + 1);
            
            // Clear the flag after everything is done
            setTimeout(() => {
              console.log('🔓 Clearing recent upload flag');
              setHasRecentUpload(false);
            }, 2000);
          }, 100);
        }, 100);
        
        toast({
          title: "Upload thành công! 🎉",
          description: `File ${result.fileName} đã được upload lên GitHub và sẵn sàng hiển thị.`,
        });
      } else {
        throw new Error(result.error || 'Unknown upload error');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Lỗi upload",
        description: error instanceof Error ? error.message : "Không thể upload file. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };


  const handleRemovePDF = async () => {
    console.log('🗑️ Removing PDF...');
    console.log('   - fileName:', fileName);
    console.log('   - pdfUrl:', pdfUrl);
    console.log('   - persistentPdfUrl:', persistentPdfUrl);
    
    // Determine which file to delete from GitHub
    let fileToDelete = '';
    
    // First priority: Extract from GitHub URL (most reliable)
    if (persistentPdfUrl || (pdfUrl && pdfUrl.includes('githubusercontent.com'))) {
      const urlToCheck = persistentPdfUrl || pdfUrl;
      const urlParts = urlToCheck.split('/');
      fileToDelete = urlParts[urlParts.length - 1];
      console.log('   - Extracted from GitHub URL:', fileToDelete);
    }
    
    // Second priority: Use fileName only if it looks like a GitHub filename (contains timestamp)
    else if (fileName && (fileName.match(/^\d{13}_/) || fileName.endsWith('.pdf'))) {
      fileToDelete = fileName;
      console.log('   - Using fileName (looks like GitHub file):', fileToDelete);
    }
    
    // If fileName looks like a display name, don't use it for GitHub deletion
    else if (fileName && !fileName.includes('_') && !fileName.endsWith('.pdf')) {
      console.log('   - Skipping fileName (looks like display name):', fileName);
    }
    
    console.log('   - fileToDelete:', fileToDelete);
    
    // Try to delete from GitHub if we have a filename and it's not a default file
    if (fileToDelete && !fileToDelete.includes("Hướng dẫn") && fileToDelete !== "undefined") {
      try {
        console.log('🗑️ Attempting to delete from GitHub:', fileToDelete);
        const deleteResult = await githubUploadService.deleteFile(fileToDelete);
        
        if (deleteResult.success) {
          console.log('✅ Successfully deleted from GitHub');
          toast({
            title: "PDF đã được xóa khỏi GitHub 🗑️",
            description: `File ${fileToDelete} đã được xóa khỏi repository.`,
          });
        } else {
          console.log('❌ Failed to delete from GitHub:', deleteResult.error);
          toast({
            title: "Không thể xóa file từ GitHub",
            description: deleteResult.error || "File có thể đã bị xóa hoặc không tồn tại",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('❌ Delete error:', error);
        toast({
          title: "Lỗi khi xóa file từ GitHub",
          description: "Có lỗi khi kết nối với GitHub, nhưng thông tin PDF sẽ được xóa khỏi form.",
          variant: "destructive",
        });
      }
    } else {
      console.log('⏭️ Skipping GitHub deletion (no valid filename or protected file)');
    }
    
    // Clear all PDF-related state
    console.log('🧹 Clearing all PDF data...');
    handlePdfUrlChange("");
    handleFileNameChange("");
    handleFallbackUrlChange("");
    setPersistentPdfUrl(""); // Clear the persistent URL
    
    // Force refresh the PDF viewer
    setPdfViewerKey(prev => prev + 1);
    
    // Auto-save to database to persist the deletion
    if (onExerciseUpdate) {
      console.log('💾 Auto-saving exercise to persist PDF deletion...');
      setTimeout(async () => {
        try {
          const updatedExercise: Exercise = {
            ...exercise,
            pdfUrl: undefined,
            fileName: undefined,
            exerciseType: 'basic', // Reset to basic type
          };
          
          await onExerciseUpdate(updatedExercise);
          console.log('✅ Exercise auto-saved after PDF deletion');
        } catch (error) {
          console.error('❌ Failed to auto-save exercise after deletion:', error);
          toast({
            title: "Cảnh báo",
            description: "PDF đã được xóa khỏi form nhưng có thể chưa được lưu vào database. Hãy lưu bài tập manually.",
            variant: "destructive",
          });
        }
      }, 500);
    }
    
    toast({
      title: "PDF đã được xóa ✅",
      description: "Tất cả thông tin PDF đã được xóa khỏi bài tập và database.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBackClick}
          className="flex items-center text-fpt-blue"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
      </div>
      
      {isInEditMode ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tiêu đề bài tập:</label>
            <Textarea
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-xl font-bold text-fpt-orange"
              rows={2}
            />
          </div>
          
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tiêu đề nội dung:</label>
            <Input
              value={customTitle}
              onChange={(e) => handleCustomTitleChange(e.target.value)}
              className="font-semibold text-fpt-blue"
            />
          </div>
          
          {pdfInfo.hasLink && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Link tải dữ liệu:</label>
                <Input
                  value={linkUrl}
                  onChange={(e) => handleLinkUrlChange(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Văn bản link:</label>
                <Input
                  value={linkText}
                  onChange={(e) => handleLinkTextChange(e.target.value)}
                />
              </div>
            </>
          )}
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium text-gray-700 mb-3">Quản lý PDF</h4>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <p className="font-medium text-blue-800 mb-1">Hướng dẫn upload:</p>
              <ul className="text-blue-700 text-xs space-y-1">
                <li>• Chỉ chấp nhận file PDF (tối đa 10MB)</li>
                <li>• File sẽ được tự động upload lên GitHub public folder</li>
                <li>• Các URL sẽ được điền tự động sau khi upload thành công</li>
                <li>• File có thể được truy cập ngay lập tức qua PDF viewer</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">URL PDF chính:</label>
                <Input
                  value={pdfUrl}
                  onChange={(e) => handlePdfUrlChange(e.target.value)}
                  placeholder="https://example.com/file.pdf"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tên file hiển thị:</label>
                <Input
                  value={fileName}
                  onChange={(e) => handleFileNameChange(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">URL dự phòng:</label>
                <Input
                  value={fallbackUrl}
                  onChange={(e) => handleFallbackUrlChange(e.target.value)}
                  placeholder="/local-file.pdf"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className={`flex items-center gap-1 ${isUploading ? 'bg-blue-500' : ''}`}
                    onClick={triggerFileUpload}
                    disabled={isUploading}
                  >
                    <Upload className={`h-3 w-3 ${isUploading ? 'animate-bounce' : ''}`} />
                    {isUploading ? "Đang tải lên..." : "Tải lên PDF mới"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                    onClick={handleRemovePDF}
                    disabled={isUploading}
                  >
                    <Trash2 className="h-3 w-3" />
                    Xóa PDF
                  </Button>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                {isUploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white rounded border">
              <p className="text-sm text-gray-600 mb-2">Xem trước PDF:</p>
              <PDFViewer
                key={`edit-${pdfViewerKey}`}
                pdfUrl={pdfUrl}
                fileName={fileName}
                fallbackUrls={[fallbackUrl]}
              />
              {isInEditMode && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                  <p><strong>Debug URLs:</strong></p>
                  <p>Primary: {pdfUrl}</p>
                  <p>Fallback: {fallbackUrl}</p>
                  <p>Persistent: {persistentPdfUrl || 'Not yet available'}</p>
                  {persistentPdfUrl && (
                    <p className="text-green-600 font-medium">✅ GitHub URL ready - will persist after refresh</p>
                  )}
                  {pdfUrl.startsWith('blob:') && !persistentPdfUrl && (
                    <p className="text-amber-600 font-medium">⏳ Using temporary blob URL - GitHub sync in progress</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Save button for exercise changes */}
          <div className="mt-6 pt-4 border-t">
            <Button 
              onClick={async () => {
                if (!onExerciseUpdate) {
                  toast({
                    title: "Lỗi lưu",
                    description: "Không thể lưu thay đổi. Chức năng lưu không khả dụng.",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  // Determine exercise type based on content
                  let exerciseType: 'basic' | 'pdf' | 'drive-link' = 'basic';
                  if (pdfUrl && pdfUrl.trim()) {
                    exerciseType = 'pdf';
                  } else if (linkUrl && linkUrl.trim()) {
                    exerciseType = 'drive-link';
                  }

                  // Use persistent GitHub URL if available, otherwise use current pdfUrl
                  const urlToSave = persistentPdfUrl || pdfUrl;
                  console.log('💾 Saving exercise with URL:', urlToSave);
                  console.log('   - persistentPdfUrl:', persistentPdfUrl);
                  console.log('   - current pdfUrl:', pdfUrl);

                  // Create updated exercise object
                  const updatedExercise: Exercise = {
                    ...exercise,
                    title: title,
                    description: description,
                    exerciseType: exerciseType,
                    pdfUrl: urlToSave || undefined,
                    fileName: fileName || undefined,
                    driveLink: linkUrl || undefined,
                    customTitle: customTitle || undefined,
                  };

                  // Call the update function
                  await onExerciseUpdate(updatedExercise);
                  
                  toast({
                    title: "Thay đổi đã được lưu! ✅",
                    description: "Tất cả thay đổi của bài tập đã được lưu vào cơ sở dữ liệu.",
                  });
                } catch (error) {
                  console.error('Error saving exercise changes:', error);
                  toast({
                    title: "Lỗi lưu bài tập",
                    description: "Không thể lưu thay đổi. Vui lòng thử lại.",
                    variant: "destructive",
                  });
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Lưu thay đổi bài tập
            </Button>
          </div>
          
        </div>
      ) : (
        <>
          <h3 className="text-xl font-bold text-fpt-orange">
            {title}
          </h3>
          
          <div className="space-y-4 text-sm">
            <h4 className="font-semibold text-base text-fpt-blue">{customTitle}</h4>
            
            {pdfInfo.hasLink && linkUrl && (
              <a 
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-base text-fpt-blue hover:text-blue-800 underline block"
              >
                {linkText}
              </a>
            )}
            
            <PDFViewer
              key={`view-${pdfViewerKey}`}
              pdfUrl={pdfUrl}
              fileName={fileName}
              fallbackUrls={[fallbackUrl]}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ExerciseContent;
