
import React, { useState } from 'react';
import { Exercise } from './ExerciseContent';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';

interface ExercisesListProps {
  exercises: Exercise[];
  onExerciseClick: (exercise: Exercise) => void;
  onAddExercise?: () => void;
  onEditExercise?: (exercise: Exercise) => void;
  onDeleteExercise?: (exerciseId: string) => Promise<void> | void;
  onReorderExercises?: (newOrder: Exercise[]) => void;
}

const ExercisesList: React.FC<ExercisesListProps> = ({ 
  exercises, 
  onExerciseClick, 
  onAddExercise, 
  onEditExercise, 
  onDeleteExercise,
  onReorderExercises 
}) => {
  const { isInEditMode } = useAdmin();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isInEditMode || !onReorderExercises) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isInEditMode || !onReorderExercises || draggedIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    if (!isInEditMode || !onReorderExercises || draggedIndex === null) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isInEditMode || !onReorderExercises) return;
    // Only clear if we're leaving the entire component
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isInEditMode || !onReorderExercises || draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    
    const newExercises = [...exercises];
    const draggedExercise = newExercises[draggedIndex];
    
    // Remove the dragged exercise
    newExercises.splice(draggedIndex, 1);
    
    // Insert at new position (adjust index if we removed an item before the drop position)
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newExercises.splice(adjustedDropIndex, 0, draggedExercise);
    
    onReorderExercises(newExercises);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-fpt-blue">
          Bài Tập Hôm Nay
        </h3>
        {isInEditMode && onAddExercise && (
          <Button
            size="sm"
            onClick={onAddExercise}
            className="flex items-center gap-1 bg-fpt-blue hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Thêm bài tập
          </Button>
        )}
      </div>
      
      {exercises.map((exercise, index) => (
        <div 
          key={exercise.id}
          draggable={isInEditMode && !!onReorderExercises}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragLeave={handleDragLeave}
          onDragEnd={handleDragEnd}
          onDrop={(e) => handleDrop(e, index)}
          className={`border-l-4 pl-3 hover:bg-gray-50 transition-all duration-200 ${
            !isInEditMode ? 'cursor-pointer' : (onReorderExercises ? 'cursor-move' : 'cursor-pointer')
          } ${
            draggedIndex === index ? 'opacity-50 scale-95' : ''
          } ${
            dragOverIndex === index && draggedIndex !== null && draggedIndex !== index ? 
            'bg-blue-50 border-t-4 border-t-blue-400 transform translate-y-1' : ''
          }`}
          style={{
            borderLeftColor: exercise.borderColor || (
              exercise.id === 'exercise-1-1' || exercise.id === 'exercise-1-2' ? '#3B82F6' : // blue
              exercise.id === 'exercise-2-1' || exercise.id === 'exercise-2-2' ? '#F97316' : // orange
              exercise.id === 'exercise-3' ? '#10B981' : // green
              exercise.id === 'exercise-4' ? '#8B5CF6' : // purple
              '#3B82F6' // default blue
            )
          }}
          onClick={!isInEditMode ? () => onExerciseClick(exercise) : undefined}
        >
          <div className="flex justify-between items-center">
            {/* Drag handle */}
            {isInEditMode && onReorderExercises && (
              <div className="flex items-center mr-2">
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
            )}
            
            <div 
              className={`flex-1 ${!isInEditMode ? 'cursor-pointer' : ''}`}
              onClick={!isInEditMode ? undefined : () => onExerciseClick(exercise)}
            >
              <p className="font-medium">{exercise.title}</p>
              <p className="text-sm">
                {isInEditMode ? 'Kéo thả để sắp xếp lại | Nhấp để xem chi tiết' : 'Nhấp vào đây để xem chi tiết bài tập'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {isInEditMode && (
                <div className="flex items-center gap-1">
                  {onEditExercise && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditExercise(exercise);
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  {onDeleteExercise && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Xóa bài tập "${exercise.title}"?`)) {
                          onDeleteExercise(exercise.id);
                        }
                      }}
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExercisesList;
