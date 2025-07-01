import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List,
  ListOrdered,
  Type,
  Image,
  Video,
  Quote,
  Table,
  Code,
  Link,
  Upload,
  Eye,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Nhập nội dung...", 
  className,
  rows = 6 
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [embedCode, setEmbedCode] = useState('');

  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertHTMLAtCursor = useCallback((html: string) => {
    console.log('insertHTMLAtCursor called with:', html);
    console.log('editorRef.current:', editorRef.current);
    
    if (editorRef.current) {
      editorRef.current.focus();
      console.log('Editor focused');
      
      // Save current content
      const currentContent = editorRef.current.innerHTML;
      console.log('Current content before insertion:', currentContent);
      
      // Try direct innerHTML approach first for complex embeds
      try {
        if (currentContent.trim() === '' || currentContent === '<br>') {
          // Empty editor, just set the content
          editorRef.current.innerHTML = html;
          console.log('Set as initial content');
        } else {
          // For Twitter embeds, use a different approach to preserve content
          if (html.includes('twitter-tweet')) {
            console.log('Inserting Twitter embed with special handling');
            
            // Create a temporary container to hold the embed
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Get the actual blockquote element
            const blockquote = tempDiv.querySelector('blockquote.twitter-tweet');
            const script = tempDiv.querySelector('script[src*="platform.twitter.com"]');
            
            if (blockquote) {
              // Ensure the blockquote has proper attributes for Twitter widgets
              blockquote.setAttribute('data-conversation', 'none');
              blockquote.setAttribute('data-theme', 'light');
              
              // Append the blockquote directly
              editorRef.current.appendChild(blockquote.cloneNode(true));
              
              // Add script if needed
              if (script && !document.querySelector('script[src*="platform.twitter.com"]')) {
                document.head.appendChild(script.cloneNode(true));
              }
              
              console.log('Twitter embed inserted with preserved content');
            } else {
              // Fallback to regular append
              editorRef.current.innerHTML = currentContent + html;
            }
          } else {
            // Regular content - append normally
            editorRef.current.innerHTML = currentContent + html;
            console.log('Appended to existing content');
          }
        }
        
        console.log('Content after direct insertion:', editorRef.current.innerHTML);
        
        // Use setTimeout to ensure DOM is updated before calling onChange
        setTimeout(() => {
          const finalContent = editorRef.current?.innerHTML || '';
          console.log('Final content after timeout:', finalContent);
          onChange(finalContent);
          
        }, 100);
        
      } catch (error) {
        console.error('Direct innerHTML failed:', error);
        
        // Fallback to selection approach
        if (document.getSelection) {
          const selection = document.getSelection();
          console.log('Fallback: Selection:', selection);
          
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            console.log('Fallback: Using selection range approach');
            
            try {
              // Try inserting as text node first, then parse
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = html;
              
              while (tempDiv.firstChild) {
                range.insertNode(tempDiv.firstChild);
              }
              
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
              
              setTimeout(() => {
                onChange(editorRef.current?.innerHTML || '');
              }, 100);
              
            } catch (rangeError) {
              console.error('Range insertion failed:', rangeError);
              
              // Last resort: execCommand
              document.execCommand('insertHTML', false, html);
              setTimeout(() => {
                onChange(editorRef.current?.innerHTML || '');
              }, 100);
            }
          }
        }
      }
      
      editorRef.current.focus();
    } else {
      console.error('editorRef.current is null!');
    }
  }, [onChange]);

  const formatText = (command: string, value?: string) => {
    executeCommand(command, value);
    editorRef.current?.focus();
  };

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Process embeds when switching to preview mode
  useEffect(() => {
    if (showPreview && previewRef.current && value) {
      previewRef.current.innerHTML = value;
    }
  }, [showPreview, value]);

  const isCommandActive = (command: string): boolean => {
    return document.queryCommandState(command);
  };


  const insertImage = () => {
    if (imageUrl.trim()) {
      const imgHtml = `<img src="${imageUrl}" alt="Inserted image" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
      insertHTMLAtCursor(imgHtml);
      setImageUrl('');
      setShowImageDialog(false);
    }
  };

  const insertVideo = () => {
    if (videoUrl.trim()) {
      let embedHtml = '';
      console.log('Processing video URL:', videoUrl);
      
      // YouTube video - Enhanced detection
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        let videoId = '';
        
        if (videoUrl.includes('youtu.be')) {
          // Format: https://youtu.be/VIDEO_ID
          videoId = videoUrl.split('/').pop()?.split('?')[0] || '';
        } else if (videoUrl.includes('youtube.com')) {
          // Format: https://www.youtube.com/watch?v=VIDEO_ID
          const urlParams = new URLSearchParams(videoUrl.split('?')[1]);
          videoId = urlParams.get('v') || '';
        }
        
        if (videoId) {
          embedHtml = `
            <div style="margin: 20px 0; position: relative; width: 100%; height: 0; padding-bottom: 56.25%; background: #000; border-radius: 8px; overflow: hidden;">
              <iframe 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
              </iframe>
            </div>
          `;
          console.log('Created YouTube embed for video ID:', videoId);
        }
      }
      // Vimeo video - Enhanced detection
      else if (videoUrl.includes('vimeo.com')) {
        let videoId = '';
        
        // Handle different Vimeo URL formats
        const vimeoMatch = videoUrl.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
        videoId = vimeoMatch?.[1] || '';
        
        if (videoId) {
          embedHtml = `
            <div style="margin: 20px 0; position: relative; width: 100%; height: 0; padding-bottom: 56.25%; background: #000; border-radius: 8px; overflow: hidden;">
              <iframe 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                src="https://player.vimeo.com/video/${videoId}?byline=0&portrait=0" 
                frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen>
              </iframe>
            </div>
          `;
          console.log('Created Vimeo embed for video ID:', videoId);
        }
      }
      // Direct video URL - Enhanced with better styling
      else {
        embedHtml = `
          <div style="margin: 20px 0; border-radius: 8px; overflow: hidden; background: #000;">
            <video controls style="width: 100%; height: auto; display: block;">
              <source src="${videoUrl}" type="video/mp4">
              <source src="${videoUrl}" type="video/webm">
              <source src="${videoUrl}" type="video/ogg">
              Your browser does not support the video tag.
            </video>
          </div>
        `;
        console.log('Created direct video embed');
      }
      
      if (embedHtml) {
        insertHTMLAtCursor(embedHtml);
        setVideoUrl('');
        setShowVideoDialog(false);
        console.log('Video embed inserted successfully');
      } else {
        alert('Could not process this video URL. Please check the format.');
      }
    }
  };

  const insertLink = () => {
    if (linkUrl.trim() && linkText.trim()) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      insertHTMLAtCursor(linkHtml);
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
    }
  };

  const insertEmbed = () => {
    console.log('insertEmbed function called');
    console.log('embedCode value:', embedCode);
    console.log('embedCode trimmed length:', embedCode.trim().length);
    
    if (embedCode.trim()) {
      console.log('Inserting embed code:', embedCode);
      const htmlToInsert = `<div style="margin: 20px 0;">${embedCode}</div>`;
      console.log('HTML to insert:', htmlToInsert);
      
      // Try multiple methods to ensure insertion works
      try {
        insertHTMLAtCursor(htmlToInsert);
      } catch (error) {
        console.error('insertHTMLAtCursor failed:', error);
        
        // Fallback: direct innerHTML manipulation
        if (editorRef.current) {
          console.log('Using fallback innerHTML method');
          editorRef.current.innerHTML += htmlToInsert;
          onChange(editorRef.current.innerHTML);
        }
      }
      
      setEmbedCode('');
      setShowEmbedDialog(false);
      console.log('Embed dialog closed and code cleared');
    } else {
      console.log('No embed code provided - embedCode is empty');
      alert('Vui lòng nhập mã embed trước khi chèn!');
    }
  };

  const insertTable = () => {
    const tableHtml = `
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0; border: 1px solid #ddd;">
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 3</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 4</td>
        </tr>
      </table>
    `;
    insertHTMLAtCursor(tableHtml);
  };

  const insertQuote = () => {
    const quoteHtml = `<blockquote style="border-left: 4px solid #ccc; margin: 20px 0; padding: 10px 20px; background-color: #f9f9f9; font-style: italic;">Nhập nội dung trích dẫn ở đây...</blockquote>`;
    insertHTMLAtCursor(quoteHtml);
  };

  const insertCodeBlock = () => {
    const codeHtml = `<pre style="background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin: 20px 0; overflow-x: auto;"><code>// Nhập code ở đây
console.log("Hello World!");</code></pre>`;
    insertHTMLAtCursor(codeHtml);
  };

  const toolbarButtons = [
    {
      command: 'bold',
      icon: Bold,
      title: 'Đậm (Ctrl+B)',
      shortcut: 'Ctrl+B'
    },
    {
      command: 'italic',
      icon: Italic,
      title: 'Nghiêng (Ctrl+I)',
      shortcut: 'Ctrl+I'
    },
    {
      command: 'underline',
      icon: Underline,
      title: 'Gạch chân (Ctrl+U)',
      shortcut: 'Ctrl+U'
    },
    { type: 'separator' },
    {
      command: 'justifyLeft',
      icon: AlignLeft,
      title: 'Căn trái'
    },
    {
      command: 'justifyCenter',
      icon: AlignCenter,
      title: 'Căn giữa'
    },
    {
      command: 'justifyRight',
      icon: AlignRight,
      title: 'Căn phải'
    },
    {
      command: 'justifyFull',
      icon: AlignJustify,
      title: 'Căn đều'
    },
    { type: 'separator' },
    {
      command: 'insertUnorderedList',
      icon: List,
      title: 'Danh sách dấu chấm'
    },
    {
      command: 'insertOrderedList',
      icon: ListOrdered,
      title: 'Danh sách số'
    }
  ];

  const multimediaButtons = [
    {
      action: () => setShowImageDialog(true),
      icon: Image,
      title: 'Chèn hình ảnh'
    },
    {
      action: () => setShowVideoDialog(true),
      icon: Video,
      title: 'Chèn video (YouTube/Vimeo)'
    },
    {
      action: () => setShowLinkDialog(true),
      icon: Link,
      title: 'Chèn liên kết'
    },
    {
      action: insertTable,
      icon: Table,
      title: 'Chèn bảng'
    },
    {
      action: insertQuote,
      icon: Quote,
      title: 'Chèn trích dẫn'
    },
    {
      action: insertCodeBlock,
      icon: Code,
      title: 'Chèn code'
    }
  ];

  const fontSizes = [
    { label: 'Nhỏ', value: '1' },
    { label: 'Bình thường', value: '3' },
    { label: 'Lớn', value: '5' },
    { label: 'Rất lớn', value: '7' }
  ];

  return (
    <div className={cn("border border-gray-200 rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
        {toolbarButtons.map((button, index) => {
          if (button.type === 'separator') {
            return <div key={index} className="w-px h-6 bg-gray-300 mx-1" />;
          }

          const Icon = button.icon!;
          const isActive = isCommandActive(button.command!);

          return (
            <Button
              key={button.command}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                isActive && "bg-blue-100 text-blue-700"
              )}
              onClick={() => formatText(button.command!)}
              title={button.title}
              type="button"
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}

        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Font Size Selector */}
        <select
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
          onChange={(e) => formatText('fontSize', e.target.value)}
          title="Kích thước chữ"
        >
          {fontSizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>

        {/* Text Color */}
        <input
          type="color"
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          onChange={(e) => formatText('foreColor', e.target.value)}
          title="Màu chữ"
        />

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Multimedia Buttons */}
        {multimediaButtons.map((button, index) => {
          const Icon = button.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={button.action}
              title={button.title}
              type="button"
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Preview Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0",
            showPreview && "bg-blue-100 text-blue-700"
          )}
          onClick={() => setShowPreview(!showPreview)}
          title={showPreview ? "Chế độ chỉnh sửa" : "Chế độ xem trước"}
          type="button"
        >
          {showPreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      {/* Editor and Preview */}
      {!showPreview ? (
        <div
          ref={editorRef}
          contentEditable
          className={cn(
            "p-3 focus:outline-none focus:ring-0 prose prose-sm max-w-none",
            "min-h-24 bg-white text-gray-900",
            rows && `min-h-[${rows * 1.5}rem]`
          )}
          style={{ 
            minHeight: `${rows * 1.5}rem`,
            lineHeight: '1.5'
          }}
          onInput={handleInput}
          onBlur={handleInput}
          data-placeholder={placeholder}
          suppressContentEditableWarning={true}
        />
      ) : (
        <div
          ref={previewRef}
          className={cn(
            "p-3 prose prose-lg max-w-none bg-white text-gray-900",
            rows && `min-h-[${rows * 1.5}rem]`
          )}
          style={{ 
            minHeight: `${rows * 1.5}rem`,
            lineHeight: '1.5'
          }}
        />
      )}

      {/* Placeholder styling */}
      <style>{`
        [contenteditable]:empty::before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        [contenteditable] p {
          margin: 0.5rem 0;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
        }
      `}</style>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chèn Hình Ảnh</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">URL Hình ảnh</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={insertImage} className="flex-1">
                Chèn Hình Ảnh
              </Button>
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chèn Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <h4 className="font-medium text-blue-900 mb-2">Định dạng được hỗ trợ:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• <strong>YouTube:</strong> https://youtube.com/watch?v=VIDEO_ID</li>
                <li>• <strong>YouTube Short:</strong> https://youtu.be/VIDEO_ID</li>
                <li>• <strong>Vimeo:</strong> https://vimeo.com/VIDEO_ID</li>
                <li>• <strong>Video file:</strong> Direct .mp4, .webm, .ogg links</li>
              </ul>
            </div>
            <div>
              <label className="text-sm font-medium">URL Video</label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Khuyến nghị: Sử dụng YouTube hoặc Vimeo để tiết kiệm băng thông
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={insertVideo} className="flex-1">
                Chèn Video
              </Button>
              <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chèn Liên Kết</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Văn bản hiển thị</label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Nhập văn bản hiển thị"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL Liên kết</label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={insertLink} className="flex-1">
                Chèn Liên Kết
              </Button>
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}