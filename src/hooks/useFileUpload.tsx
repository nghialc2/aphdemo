import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  extractedContent?: string;
}

export const useFileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const addFiles = (files: File[]) => {
    console.log('Adding files:', files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    const fileTypes = files.reduce((acc, file) => {
      if (file.type === 'application/pdf') acc.pdf++;
      else if (file.type.startsWith('image/')) acc.image++;
      else acc.other++;
      return acc;
    }, { pdf: 0, image: 0, other: 0 });

    const descriptions = [];
    if (fileTypes.pdf > 0) descriptions.push(`${fileTypes.pdf} PDF`);
    if (fileTypes.image > 0) descriptions.push(`${fileTypes.image} hình ảnh`);
    if (fileTypes.other > 0) descriptions.push(`${fileTypes.other} file khác`);

    toast({
      title: "Files đã được chọn",
      description: `Đã chọn ${descriptions.join(', ')}`,
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setUploadedFiles([]);
  };

  const extractPdfContent = async (file: File): Promise<string> => {
    try {
      console.log('Extracting PDF content from:', file.name, 'Size:', file.size);
      setIsProcessing(true);
      
      // Create a more robust PDF content extraction
      const arrayBuffer = await file.arrayBuffer();
      console.log('PDF loaded as ArrayBuffer, size:', arrayBuffer.byteLength);
      
      // Set a processing timeout
      let extractionTimeout: ReturnType<typeof setTimeout> | null = null;
      const timeoutPromise = new Promise<string>((_, reject) => {
        extractionTimeout = setTimeout(() => {
          reject(new Error('PDF extraction timeout after 30 seconds'));
        }, 30000); // 30 second timeout
      });
      
      // Try to use a simpler approach first
      try {
        // Import pdfjs-dist dynamically
        const pdfjsLib = await import('pdfjs-dist');
        
        // Set worker source to the correct path
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.js',
          import.meta.url
        ).toString();
        
        // Race between PDF extraction and timeout
        const extractionPromise = (async () => {
          try {
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            console.log(`PDF document loaded successfully. Pages: ${pdf.numPages}`);
            
            let fullText = '';
            const extractionStart = Date.now();
            
            // Limit to maximum 25 pages for classroom performance
            const pagesToProcess = Math.min(pdf.numPages, 25);
            if (pdf.numPages > 25) {
              console.warn(`PDF has ${pdf.numPages} pages, limiting to first 25 pages for classroom performance`);
            }
            
            for (let i = 1; i <= pagesToProcess; i++) {
              try {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                  .map((item: any) => item.str)
                  .join(' ');
                fullText += pageText + '\n';
                
                // Progress update every few pages
                if (i % 5 === 0 || i === pagesToProcess) {
                  console.log(`Processed ${i}/${pagesToProcess} pages. Current text length: ${fullText.length}`);
                  
                  // Show progress toast for long extractions
                  if (pagesToProcess > 10 && i % 10 === 0) {
                    toast({
                      title: "Đang xử lý PDF",
                      description: `Đã xử lý ${i}/${pagesToProcess} trang (${Math.round(i/pagesToProcess*100)}%)`,
                    });
                  }
                }
              } catch (pageError) {
                console.error(`Error processing page ${i}:`, pageError);
                fullText += `[Page ${i} extraction error]\n`;
              }
              
              // Add a small delay between pages to prevent UI freezing
              if (i < pagesToProcess && i % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
              }
            }
            
            const extractionTime = Date.now() - extractionStart;
            console.log(`PDF extraction completed in ${extractionTime}ms. Content length: ${fullText.length}`);
            
            // Trim and clean up text
            const cleanedText = fullText.trim()
              .replace(/\s+/g, ' ')  // Normalize whitespace
              .replace(/\n\s*\n/g, '\n\n');  // Normalize multiple line breaks
            
            return cleanedText;
          } catch (err) {
            throw err;
          }
        })();
        
        // Race between processing and timeout
        const result = await Promise.race([extractionPromise, timeoutPromise]);
        if (extractionTimeout) clearTimeout(extractionTimeout);
        return result;
      } catch (pdfError) {
        if (extractionTimeout) clearTimeout(extractionTimeout);
        console.error('PDF extraction failed, using fallback:', pdfError);
        // Fallback: return a placeholder text indicating file was uploaded
        return `[PDF File: ${file.name} - Content extraction failed, but file was uploaded successfully]`;
      }
    } catch (error) {
      console.error('Error extracting PDF content:', error);
      toast({
        title: "Lỗi xử lý PDF",
        description: `Không thể trích xuất nội dung từ ${file.name}`,
        variant: "destructive",
      });
      return `[PDF File: ${file.name} - Content extraction failed]`;
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadFiles = async (sessionId: string): Promise<{ files: UploadedFile[], extractedContent: string }> => {
    if (selectedFiles.length === 0) {
      console.log('No files to upload');
      return { files: [], extractedContent: '' };
    }

    console.log('Starting upload process for', selectedFiles.length, 'files');
    setIsUploading(true);
    const newUploadedFiles: UploadedFile[] = [];
    let allExtractedContent = '';

    try {
      // First, process all PDF files - prioritize extracting their content
      const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
      const otherFiles = selectedFiles.filter(file => file.type !== 'application/pdf');
      
      console.log(`Processing ${pdfFiles.length} PDF files and ${otherFiles.length} other files`);
      
      // Limit to max 3 PDF files at once for classroom performance
      const maxPdfToProcess = 3;
      const pdfFilesToProcess = pdfFiles.slice(0, maxPdfToProcess);
      if (pdfFiles.length > maxPdfToProcess) {
        console.warn(`Limiting PDF processing to ${maxPdfToProcess} files for classroom performance`);
        toast({
          title: "Giới hạn xử lý",
          description: `Đang xử lý ${maxPdfToProcess} file PDF đầu tiên (giới hạn để tăng hiệu suất lớp học)`,
        });
      }
      
      // Process PDFs first to extract content
      let documentIndex = 0;
      for (const file of pdfFilesToProcess) {
        try {
          console.log('Processing PDF file:', file.name, 'Size:', file.size);
          documentIndex++;
          
          // Create uploaded file entry
          const uploadedFile: UploadedFile = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            size: file.size,
            url: '', // Will be updated after actual upload
          };
  
          try {
            const extractedContent = await extractPdfContent(file);
            if (extractedContent) {
              uploadedFile.extractedContent = extractedContent;
              
              // Add a clear document separator if not the first document
              if (allExtractedContent) {
                allExtractedContent += '\n\n---NEW DOCUMENT---\n\n';
              }
              
              // Add formatted document header with filename
              allExtractedContent += `[PDF ${documentIndex}: ${file.name}]\n${extractedContent}`;
              
              console.log('PDF content extracted successfully for:', file.name, 'Length:', extractedContent.length);
              console.log('Combined content length so far:', allExtractedContent.length);
              
              const pages = extractedContent.match(/\n/g)?.length || 1;
              toast({
                title: "✅ PDF đã được xử lý",
                description: `${file.name} - ${extractedContent.length.toLocaleString()} ký tự từ ~${pages} trang`,
              });
            }
          } catch (error) {
            console.error('Error processing PDF:', error);
            // Still add the file even if extraction fails
            uploadedFile.extractedContent = `[PDF File: ${file.name} - Upload successful, content extraction failed]`;
            
            // Also add a note in the combined content
            if (allExtractedContent) {
              allExtractedContent += '\n\n---NEW DOCUMENT---\n\n';
            }
            allExtractedContent += `[PDF ${documentIndex}: ${file.name} - Content extraction failed]`;
          }
  
          newUploadedFiles.push(uploadedFile);
          
          // Add a small delay between files to prevent UI freezing
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (fileError) {
          console.error('Error processing file:', fileError);
        }
      }
      
      // Add any remaining PDF files as regular files without extraction
      if (pdfFiles.length > maxPdfToProcess) {
        const remainingPdfs = pdfFiles.slice(maxPdfToProcess);
        for (const file of remainingPdfs) {
          const uploadedFile: UploadedFile = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            size: file.size,
            url: '',
          };
          newUploadedFiles.push(uploadedFile);
        }
      }
      
      // Process other non-PDF files
      for (const file of otherFiles) {
        console.log('Processing non-PDF file:', file.name, 'Type:', file.type);
        
        // Create uploaded file entry for non-PDF file
        const uploadedFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          url: '', // Will be updated after actual upload
        };
        
        newUploadedFiles.push(uploadedFile);
      }

      // Update uploaded files state BEFORE clearing selected files
      setUploadedFiles(prev => {
        const updated = [...prev, ...newUploadedFiles];
        console.log(`Updated uploaded files state with ${newUploadedFiles.length} new files, total: ${updated.length}`);
        return updated;
      });
      
      // Clear selected files AFTER state update
      setSelectedFiles([]);

      // Log information about the combined content
      console.log(`Upload process completed: ${newUploadedFiles.length} files processed`);
      console.log(`Total extracted content length: ${allExtractedContent.length}`);
      console.log(`Content from ${pdfFilesToProcess.length} PDF files included`);
      
      let finalExtractedContent = allExtractedContent.trim();
      
      // Only limit extract content if actually needed
      if (finalExtractedContent.length > 0) {
        // Limit content size for classroom performance
        const maxLength = 50000; // ~50KB limit for classroom performance
        
        if (finalExtractedContent.length > maxLength) {
          finalExtractedContent = finalExtractedContent.substring(0, maxLength);
          console.warn(`Extracted content too large (${allExtractedContent.length} chars), truncated to ${maxLength} chars for classroom performance`);
          toast({
            title: "Nội dung quá lớn",
            description: `Nội dung trích xuất đã vượt quá giới hạn và đã bị cắt ngắn để tăng hiệu suất lớp học`,
          });
        }
        
        toast({
          title: "Thành công",
          description: `Đã xử lý ${pdfFilesToProcess.length} file PDF và trích xuất ${finalExtractedContent.length.toLocaleString()} ký tự`,
        });
      } else {
        toast({
          title: "Thành công",
          description: `Đã xử lý ${newUploadedFiles.length} file thành công.`,
        });
      }
      
      // Ensure we always return an object with files and extractedContent
      return { 
        files: newUploadedFiles, 
        extractedContent: finalExtractedContent
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Lỗi upload",
        description: "Có lỗi xảy ra khi upload file. Vui lòng thử lại.",
        variant: "destructive",
      });
      return { files: [], extractedContent: '' };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    selectedFiles,
    uploadedFiles,
    isUploading,
    isProcessing,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
  };
};
