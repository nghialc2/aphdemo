
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface WelcomeContentProps {
  isInEditMode?: boolean;
  contentEdits?: any;
  onContentUpdate?: (updates: any) => void;
}

const WelcomeContent: React.FC<WelcomeContentProps> = ({ isInEditMode = false, contentEdits, onContentUpdate }) => {
  const [title, setTitle] = useState(contentEdits?.title || "Xin chào mừng các bạn đã đến với Lab thực hành của chương trình AI-Powered HRM");
  const [description, setDescription] = useState(contentEdits?.description || "Phòng Lab này cho phép bạn thực hành xây dựng các câu lệnh hiệu quả cho các mô hình ngôn ngữ lớn. Bạn sẽ học cách:");
  const [points, setPoints] = useState(contentEdits?.points || [
    "Viết hướng dẫn rõ ràng, cụ thể",
    "Cấu trúc câu lệnh để có phản hồi tối ưu",
    "So sánh kết quả giữa các mô hình khác nhau",
    "Lặp lại và hoàn thiện kỹ năng xây dựng câu lệnh"
  ]);
  const [startInstructions, setStartInstructions] = useState(contentEdits?.startInstructions || [
    "Chọn một mô hình từ menu thả xuống trong bảng điều khiển trò chuyện",
    "Nhập câu lệnh của bạn trong ô nhập tin nhắn",
    "Xem xét phản hồi và điều chỉnh phương pháp của bạn"
  ]);
  const [reminder, setReminder] = useState(contentEdits?.reminder || "Hãy nhớ: Chất lượng câu lệnh của bạn ảnh hưởng trực tiếp đến chất lượng của các phản hồi!");

  // Handlers with persistence
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onContentUpdate?.({ title: newTitle });
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    onContentUpdate?.({ description: newDescription });
  };

  const handleReminderChange = (newReminder: string) => {
    setReminder(newReminder);
    onContentUpdate?.({ reminder: newReminder });
  };

  const updatePoint = (index: number, value: string) => {
    const newPoints = [...points];
    newPoints[index] = value;
    setPoints(newPoints);
    onContentUpdate?.({ points: newPoints });
  };

  const addPoint = () => {
    const newPoints = [...points, "Điểm học tập mới"];
    setPoints(newPoints);
    onContentUpdate?.({ points: newPoints });
  };

  const removePoint = (index: number) => {
    if (points.length > 1) {
      const newPoints = points.filter((_, i) => i !== index);
      setPoints(newPoints);
      onContentUpdate?.({ points: newPoints });
    }
  };

  const updateStartInstruction = (index: number, value: string) => {
    const newInstructions = [...startInstructions];
    newInstructions[index] = value;
    setStartInstructions(newInstructions);
    onContentUpdate?.({ startInstructions: newInstructions });
  };

  const addStartInstruction = () => {
    const newInstructions = [...startInstructions, "Bước hướng dẫn mới"];
    setStartInstructions(newInstructions);
    onContentUpdate?.({ startInstructions: newInstructions });
  };

  const removeStartInstruction = (index: number) => {
    if (startInstructions.length > 1) {
      const newInstructions = startInstructions.filter((_, i) => i !== index);
      setStartInstructions(newInstructions);
      onContentUpdate?.({ startInstructions: newInstructions });
    }
  };

  if (isInEditMode) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tiêu đề:</label>
          <Textarea
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-xl font-bold text-fpt-orange"
            rows={2}
          />
        </div>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Mô tả:</label>
            <Textarea
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Điểm học tập:</label>
              <Button
                type="button"
                size="sm"
                onClick={addPoint}
                className="flex items-center gap-1 h-7"
              >
                <Plus className="h-3 w-3" />
                Thêm điểm
              </Button>
            </div>
            {points.map((point, index) => (
              <div key={index} className="flex items-center gap-2 ml-4">
                <Textarea
                  value={point}
                  onChange={(e) => updatePoint(index, e.target.value)}
                  rows={1}
                  className="flex-1"
                />
                {points.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removePoint(index)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="bg-fpt-lightGreen p-4 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-fpt-green">Bắt đầu:</p>
              <Button
                type="button"
                size="sm"
                onClick={addStartInstruction}
                className="flex items-center gap-1 h-7 bg-fpt-green hover:bg-green-700"
              >
                <Plus className="h-3 w-3" />
                Thêm bước
              </Button>
            </div>
            {startInstructions.map((instruction, index) => (
              <div key={index} className="flex items-center gap-2 ml-2">
                <div className="flex-shrink-0 text-sm font-medium text-fpt-green">
                  {index + 1}.
                </div>
                <Textarea
                  value={instruction}
                  onChange={(e) => updateStartInstruction(index, e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                {startInstructions.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeStartInstruction(index)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Lời nhắc nhở:</label>
            <Textarea
              value={reminder}
              onChange={(e) => handleReminderChange(e.target.value)}
              className="text-sm text-gray-600 italic"
              rows={2}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-fpt-orange break-words">
        {title}
      </h3>
      
      <div className="space-y-3">
        <p>
          {description}
        </p>
        
        <ul className="list-disc list-inside space-y-1 ml-4">
          {points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
        
        <div className="bg-fpt-lightGreen p-4 rounded-md">
          <p className="font-medium text-fpt-green">Bắt đầu:</p>
          <ol className="list-decimal list-inside ml-2 space-y-1">
            {startInstructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
        
        <p className="text-sm text-gray-600 italic">
          {reminder}
        </p>
      </div>
    </div>
  );
};

export default WelcomeContent;
