import React, { useState, useEffect } from 'react';
import { Exercise } from '@/components/instructions/ExerciseContent';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PDFViewer from '@/components/instructions/PDFViewer';

interface ExerciseEditModalProps {
  exercise?: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
}

export const ExerciseEditModal: React.FC<ExerciseEditModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    pdfUrl: '',
    driveLink: '',
    exerciseType: 'basic' as 'basic' | 'pdf' | 'drive-link',
    borderColor: '#3B82F6' // Default blue color
  });

  // Predefined color options
  const colorOptions = [
    { name: 'Blue', value: '#3B82F6', class: 'bg-blue-500' },
    { name: 'Orange', value: '#F97316', class: 'bg-orange-500' },
    { name: 'Green', value: '#10B981', class: 'bg-green-500' },
    { name: 'Purple', value: '#8B5CF6', class: 'bg-purple-500' },
    { name: 'Red', value: '#EF4444', class: 'bg-red-500' },
    { name: 'Yellow', value: '#F59E0B', class: 'bg-yellow-500' },
    { name: 'Pink', value: '#EC4899', class: 'bg-pink-500' },
    { name: 'Indigo', value: '#6366F1', class: 'bg-indigo-500' },
    { name: 'Teal', value: '#14B8A6', class: 'bg-teal-500' },
    { name: 'Gray', value: '#6B7280', class: 'bg-gray-500' }
  ];


  useEffect(() => {
    if (exercise) {
      // Use serializable data if available, otherwise parse from content
      let pdfUrl = exercise.pdfUrl || '';
      let driveLink = exercise.driveLink || '';
      let exerciseType = exercise.exerciseType || 'basic';

      // If no serializable data, try to parse from content string (for backward compatibility)
      if (!exercise.exerciseType && exercise.content) {
        const contentString = exercise.content.toString();
        
        const pdfMatch = contentString.match(/pdfUrl="([^"]+)"/);
        if (pdfMatch) {
          pdfUrl = pdfMatch[1];
          exerciseType = 'pdf';
        }

        const driveMatch = contentString.match(/href="([^"]+drive\.google\.com[^"]+)"/);
        if (driveMatch) {
          driveLink = driveMatch[1];
          exerciseType = 'drive-link';
        }
      }

      setFormData({
        id: exercise.id,
        title: exercise.title,
        description: exercise.description || '',
        pdfUrl,
        driveLink,
        exerciseType,
        borderColor: exercise.borderColor || '#3B82F6'
      });
    } else {
      // Reset for new exercise
      const nextId = `exercise-${Date.now()}`;
      setFormData({
        id: nextId,
        title: '',
        description: '',
        pdfUrl: '',
        driveLink: '',
        exerciseType: 'basic',
        borderColor: '#3B82F6'
      });
    }
  }, [exercise]);

  const handleSave = () => {
    let content: React.ReactNode = null;

    if (formData.exerciseType === 'pdf' && formData.pdfUrl) {
      content = (
        <div className="space-y-4 text-sm">
          <h4 className="font-semibold text-base text-fpt-blue">{formData.title}</h4>
          <PDFViewer
            pdfUrl={formData.pdfUrl}
            fileName={formData.title}
          />
        </div>
      );
    } else if (formData.exerciseType === 'drive-link' && formData.driveLink) {
      content = (
        <div className="space-y-4 text-sm">
          <a 
            href={formData.driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-base text-fpt-blue hover:text-blue-800 underline block"
          >
            Hãy tải dữ liệu demo thực hành tại đây
          </a>
          <p className="text-sm text-gray-600">{formData.description}</p>
        </div>
      );
    } else {
      content = (
        <div className="space-y-4 text-sm">
          <h4 className="font-semibold text-base text-fpt-blue">{formData.title}</h4>
          <p className="text-sm">{formData.description}</p>
        </div>
      );
    }

    const newExercise: Exercise = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      content,
      borderColor: formData.borderColor,
      // Store serializable data for localStorage persistence
      exerciseType: formData.exerciseType,
      pdfUrl: formData.pdfUrl,
      fileName: formData.title,
      driveLink: formData.driveLink,
      customTitle: formData.title
    };

    onSave(newExercise);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {exercise ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
          </DialogTitle>
          <DialogDescription>
            {exercise ? 'Cập nhật thông tin bài tập' : 'Tạo bài tập mới cho học viên'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Tiêu đề bài tập</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ví dụ: Bài 1.3: Tối ưu hóa tuyển dụng với AI"
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả ngắn gọn về bài tập"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="exerciseType">Loại bài tập</Label>
            <Select value={formData.exerciseType} onValueChange={(value) => setFormData({ ...formData, exerciseType: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Bài tập cơ bản (chỉ có text)</SelectItem>
                <SelectItem value="pdf">Bài tập có PDF hướng dẫn</SelectItem>
                <SelectItem value="drive-link">Bài tập có link Google Drive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="borderColor">Màu viền bài tập</Label>
            <div className="space-y-3">
              {/* Color preview */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: formData.borderColor }}
                ></div>
                <span className="text-sm text-gray-600">Màu hiện tại: {formData.borderColor}</span>
              </div>
              
              {/* Color options */}
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, borderColor: color.value })}
                    className={`w-10 h-10 rounded border-2 transition-all hover:scale-110 ${
                      formData.borderColor === color.value 
                        ? 'border-gray-800 ring-2 ring-gray-400' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              
              {/* Custom color input */}
              <div className="flex items-center gap-2">
                <Label htmlFor="customColor" className="text-sm">Hoặc chọn màu tùy chỉnh:</Label>
                <input
                  id="customColor"
                  type="color"
                  value={formData.borderColor}
                  onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {formData.exerciseType === 'pdf' && (
            <div>
              <Label htmlFor="pdfUrl">URL của file PDF</Label>
              <Input
                id="pdfUrl"
                value={formData.pdfUrl}
                onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                placeholder="https://raw.githubusercontent.com/user/repo/main/file.pdf"
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste URL của PDF từ GitHub hoặc server khác
              </p>
            </div>
          )}

          {formData.exerciseType === 'drive-link' && (
            <div>
              <Label htmlFor="driveLink">Link Google Drive</Label>
              <Input
                id="driveLink"
                value={formData.driveLink}
                onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                placeholder="https://drive.google.com/drive/folders/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Link tới folder hoặc file trên Google Drive
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={!formData.title.trim()}>
            {exercise ? 'Cập nhật' : 'Tạo bài tập'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};