
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Book, BookOpen, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import our new components
import WelcomeContent from './instructions/WelcomeContent';
import ExercisesList from './instructions/ExercisesList';
import ExerciseContent from './instructions/ExerciseContent';
import ExamplesContent from './instructions/ExamplesContent';
import ThongTinContent from './instructions/ThongTinContent';
import GammaContent from './instructions/GammaContent';
import GensparkContent from './instructions/GensparkContent';
import NapkinContent from './instructions/NapkinContent';
import InvideoContent from './instructions/InvideoContent';
import HeygenContent from './instructions/HeygenContent';
import { exercisesData } from './instructions/ExercisesData';
import { Exercise } from './instructions/ExerciseContent';
import { ExerciseEditModal } from './admin/ExerciseEditModal';
import { useAdmin } from '@/context/AdminContext';
import PDFViewer from './instructions/PDFViewer';
import { exerciseService } from '@/services/exerciseService';
import { useToast } from '@/hooks/use-toast';
import { githubUploadService } from '@/services/githubUpload';

interface InstructionsPanelProps {
  collapsible?: boolean;
  onCollapse?: () => void;
}

const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ 
  collapsible = false,
  onCollapse
}) => {
  const [activeTab, setActiveTab] = useState<string>("instructions");
  const [currentView, setCurrentView] = useState<'main' | 'exercise'>('main');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const { isInEditMode } = useAdmin();
  const { toast } = useToast();
  
  // State for tracking exercise content edits
  const [exerciseContentEdits, setExerciseContentEdits] = useState<{[key: string]: any}>({});
  
  // State for tracking instruction content edits
  const [instructionContentEdits, setInstructionContentEdits] = useState<{[key: string]: any}>({});

  // Function to recreate React content from serializable data
  const recreateExerciseContent = (exercise: Exercise): Exercise => {
    // Always recreate content to ensure it's up to date
    let content: React.ReactNode = null;

    // Determine exercise type if not set
    let exerciseType = exercise.exerciseType;
    if (!exerciseType) {
      if (exercise.pdfUrl && exercise.pdfUrl.trim()) {
        exerciseType = 'pdf';
      } else if (exercise.driveLink && exercise.driveLink.trim()) {
        exerciseType = 'drive-link';
      } else {
        exerciseType = 'basic';
      }
    }

    if (exerciseType === 'pdf') {
      content = (
        <div className="space-y-4 text-sm">
          <h4 className="font-semibold text-base text-fpt-blue">{exercise.customTitle || exercise.title}</h4>
          {exercise.pdfUrl ? (
            <div className="space-y-2">
              <PDFViewer
                pdfUrl={exercise.pdfUrl}
                fileName={exercise.fileName || exercise.title}
                fallbackUrls={[]}
              />
              <div className="text-center">
                <a
                  href={exercise.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-fpt-blue hover:underline"
                >
                  Mở PDF trong tab mới
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              <p>Chưa có PDF được tải lên</p>
              <p className="text-xs mt-1">Sử dụng chế độ chỉnh sửa để tải lên PDF</p>
            </div>
          )}
        </div>
      );
    } else if (exerciseType === 'drive-link' && exercise.driveLink) {
      content = (
        <div className="space-y-4 text-sm">
          <a 
            href={exercise.driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-base text-fpt-blue hover:text-blue-800 underline block"
          >
            Hãy tải dữ liệu demo thực hành tại đây
          </a>
          <p className="text-sm text-gray-600">{exercise.description}</p>
        </div>
      );
    } else {
      content = (
        <div className="space-y-4 text-sm">
          <h4 className="font-semibold text-base text-fpt-blue">{exercise.customTitle || exercise.title}</h4>
          <p className="text-sm">{exercise.description}</p>
        </div>
      );
    }

    return {
      ...exercise,
      exerciseType,
      content
    };
  };

  // Load exercises from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load exercises from database
        const dbExercises = await exerciseService.fetchExercises();
        
        if (dbExercises.length === 0) {
          // Initialize with default exercises if database is empty
          await exerciseService.initializeDefaultExercises(exercisesData);
          const exercisesWithContent = exercisesData.map(recreateExerciseContent);
          setExercises(exercisesWithContent);
        } else {
          // Recreate React content for exercises loaded from database
          const exercisesWithContent = dbExercises.map(recreateExerciseContent);
          setExercises(exercisesWithContent);
        }

        // Load content edits
        const [exerciseEdits, instructionEdits] = await Promise.all([
          exerciseService.fetchExerciseContentEdits(),
          exerciseService.fetchInstructionContentEdits(),
        ]);

        setExerciseContentEdits(exerciseEdits);
        setInstructionContentEdits(instructionEdits);

      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to default data on error
        const exercisesWithContent = exercisesData.map(recreateExerciseContent);
        setExercises(exercisesWithContent);
        
        toast({
          title: "Lỗi tải dữ liệu",
          description: "Không thể tải dữ liệu từ server. Sử dụng dữ liệu mặc định.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);
  
  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentView('exercise');
    
    // Set default tab based on exercise
    if (exercise.id === 'exercise-2-2') {
      setActiveTab("gamma"); // Default to first tab for exercise-2-2
    } else {
      setActiveTab("instructions"); // Default to instructions for other exercises
    }

    // Scroll to top of the content area
    setTimeout(() => {
      const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedExercise(null);
    setActiveTab("instructions");

    // Scroll to top when going back to main
    setTimeout(() => {
      const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleAddExercise = () => {
    setEditingExercise(null);
    setIsEditModalOpen(true);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setIsEditModalOpen(true);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      // Find the exercise to get PDF information before deletion
      const exerciseToDelete = exercises.find(ex => ex.id === exerciseId);
      
      // Delete PDF file from GitHub if it exists
      if (exerciseToDelete?.pdfUrl || exerciseToDelete?.fileName) {
        console.log('🗑️ Deleting PDF file from GitHub for exercise:', exerciseId);
        
        let fileToDelete = '';
        
        // Extract filename from GitHub URL (most reliable)
        if (exerciseToDelete.pdfUrl && exerciseToDelete.pdfUrl.includes('githubusercontent.com')) {
          const urlParts = exerciseToDelete.pdfUrl.split('/');
          fileToDelete = urlParts[urlParts.length - 1];
          console.log('   - Extracted from GitHub URL:', fileToDelete);
        }
        // Use fileName if it looks like a GitHub filename
        else if (exerciseToDelete.fileName && (exerciseToDelete.fileName.match(/^\d{13}_/) || exerciseToDelete.fileName.endsWith('.pdf'))) {
          fileToDelete = exerciseToDelete.fileName;
          console.log('   - Using fileName:', fileToDelete);
        }
        
        // Try to delete from GitHub if we have a valid filename
        if (fileToDelete && !fileToDelete.includes("Hướng dẫn") && fileToDelete !== "undefined") {
          try {
            console.log('🗑️ Attempting to delete from GitHub:', fileToDelete);
            const deleteResult = await githubUploadService.deleteFile(fileToDelete);
            
            if (deleteResult.success) {
              console.log('✅ Successfully deleted PDF from GitHub');
            } else {
              console.log('⚠️ Could not delete PDF from GitHub:', deleteResult.error);
            }
          } catch (error) {
            console.error('❌ Error deleting PDF from GitHub:', error);
            // Continue with exercise deletion even if PDF deletion fails
          }
        } else {
          console.log('⏭️ Skipping GitHub deletion (no valid filename or protected file)');
        }
      }
      
      // Delete exercise from database
      await exerciseService.deleteExercise(exerciseId);
      setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
      
      toast({
        title: "Xóa thành công",
        description: "Bài tập và file PDF đã được xóa khỏi cơ sở dữ liệu và GitHub.",
      });
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast({
        title: "Lỗi xóa bài tập",
        description: "Không thể xóa bài tập. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleSaveExercise = async (exercise: Exercise) => {
    try {
      const savedExercise = await exerciseService.saveExercise(exercise);
      
      // Force recreation of content to ensure React components are updated
      const exerciseWithContent = recreateExerciseContent({
        ...savedExercise,
        content: undefined // Clear old content to force recreation
      });
      
      if (editingExercise || exercises.some(ex => ex.id === exercise.id)) {
        // Update existing exercise
        setExercises(prev => prev.map(ex => ex.id === exercise.id ? exerciseWithContent : ex));
        
        // Update selectedExercise if it's the one being edited
        if (selectedExercise && selectedExercise.id === exercise.id) {
          setSelectedExercise(exerciseWithContent);
        }
      } else {
        // Add new exercise
        setExercises(prev => [...prev, exerciseWithContent]);
      }
      
      // Only close modal if it was opened from the modal
      if (editingExercise) {
        setIsEditModalOpen(false);
        setEditingExercise(null);
      }
      
      toast({
        title: "Lưu thành công",
        description: `Bài tập "${exercise.title}" đã được lưu vào cơ sở dữ liệu.`,
      });
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast({
        title: "Lỗi lưu bài tập",
        description: "Không thể lưu bài tập. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleReorderExercises = (newOrder: Exercise[]) => {
    // Update UI immediately for smooth drag and drop
    setExercises(newOrder);
    
    // Save to database in background
    exerciseService.updateExerciseOrder(newOrder)
      .then(() => {
        console.log('Exercise order saved successfully');
      })
      .catch((error) => {
        console.error('Error updating exercise order:', error);
        // Show error but don't revert the UI change
        toast({
          title: "Lỗi lưu thứ tự",
          description: "Thứ tự hiển thị đã thay đổi nhưng không thể lưu vào cơ sở dữ liệu.",
          variant: "destructive",
        });
      });
  };


  const handleExerciseContentUpdate = async (exerciseId: string, updates: any) => {
    const newEdits = {
      ...exerciseContentEdits[exerciseId],
      ...updates
    };
    
    setExerciseContentEdits(prev => ({
      ...prev,
      [exerciseId]: newEdits
    }));

    try {
      await exerciseService.saveExerciseContentEdit(exerciseId, newEdits);
    } catch (error) {
      console.error('Error saving exercise content edit:', error);
      // Don't show toast for every keystroke, just log the error
    }
  };

  const handleInstructionContentUpdate = async (componentId: string, updates: any) => {
    const newEdits = {
      ...instructionContentEdits[componentId],
      ...updates
    };
    
    setInstructionContentEdits(prev => ({
      ...prev,
      [componentId]: newEdits
    }));

    try {
      await exerciseService.saveInstructionContentEdit(componentId, newEdits);
    } catch (error) {
      console.error('Error saving instruction content edit:', error);
      // Don't show toast for every keystroke, just log the error
    }
  };

  // Show additional tabs for exercise-1-1 and exercise-1-2
  const showExercise1Tabs = currentView === 'exercise' && (selectedExercise?.id === 'exercise-1-1' || selectedExercise?.id === 'exercise-1-2');
  
  // Show special tabs for exercise-2-2 (without instructions tab)
  const showExercise22Tabs = currentView === 'exercise' && selectedExercise?.id === 'exercise-2-2';
  
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="font-bold text-lg text-fpt-blue">Hướng Dẫn</h2>
        <div className="flex items-center gap-2">
          {collapsible && (
            <Button variant="ghost" size="icon" onClick={onCollapse}>
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Thu gọn</span>
            </Button>
          )}
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="px-4 py-2 justify-start border-b w-full rounded-none bg-gray-50 flex-shrink-0">
          {/* Show instructions tab for main view and exercises other than 2-2 */}
          {(currentView === 'main' || !showExercise22Tabs) && (
            <TabsTrigger value="instructions" className="flex items-center">
              <Book className="mr-2 h-4 w-4" />
              <span>Hướng Dẫn</span>
            </TabsTrigger>
          )}
          
          {/* Show additional tabs for exercise-1-1 and exercise-1-2 */}
          {showExercise1Tabs && (
            <>
              <TabsTrigger value="thongtin" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                <span>Thông Tin</span>
              </TabsTrigger>
              <TabsTrigger value="examples" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Ví dụ về Prompt</span>
              </TabsTrigger>
            </>
          )}
          
          {/* Show special tabs for exercise-2-2 */}
          {showExercise22Tabs && (
            <>
              <TabsTrigger value="gamma" className="flex items-center">
                <span>Gamma</span>
              </TabsTrigger>
              <TabsTrigger value="genspark" className="flex items-center">
                <span>Genspark</span>
              </TabsTrigger>
              <TabsTrigger value="napkin" className="flex items-center">
                <span>Napkin</span>
              </TabsTrigger>
              <TabsTrigger value="invideo" className="flex items-center">
                <span>Invideo</span>
              </TabsTrigger>
              <TabsTrigger value="heygen" className="flex items-center">
                <span>Heygen</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>
        
        <div className="flex-1 relative overflow-hidden">
          {/* Instructions tab content */}
          {(currentView === 'main' || !showExercise22Tabs) && (
            <TabsContent 
              value="instructions" 
              className="absolute inset-0 m-0"
            >
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fpt-blue mx-auto"></div>
                        <p className="text-gray-600">Đang tải dữ liệu...</p>
                      </div>
                    </div>
                  ) : currentView === 'main' ? (
                    <>
                      <WelcomeContent 
                        isInEditMode={isInEditMode}
                        contentEdits={instructionContentEdits['welcome']}
                        onContentUpdate={(updates) => handleInstructionContentUpdate('welcome', updates)}
                      />
                      <ExercisesList 
                        exercises={exercises} 
                        onExerciseClick={handleExerciseClick}
                        onAddExercise={isInEditMode ? handleAddExercise : undefined}
                        onEditExercise={isInEditMode ? handleEditExercise : undefined}
                        onDeleteExercise={isInEditMode ? handleDeleteExercise : undefined}
                        onReorderExercises={isInEditMode ? handleReorderExercises : undefined}
                      />
                    </>
                  ) : (
                    selectedExercise && (
                      <ExerciseContent 
                        exercise={selectedExercise} 
                        onBackClick={handleBackToMain}
                        isInEditMode={isInEditMode}
                        contentEdits={exerciseContentEdits[selectedExercise.id]}
                        onContentUpdate={(updates) => handleExerciseContentUpdate(selectedExercise.id, updates)}
                        onExerciseUpdate={isInEditMode ? handleSaveExercise : undefined}
                      />
                    )
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          )}
          
          {/* Additional tabs for exercise-1-1 and exercise-1-2 */}
          {showExercise1Tabs && (
            <>
              <TabsContent 
                value="examples" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <ExamplesContent 
                      isInEditMode={isInEditMode}
                      contentEdits={instructionContentEdits['examples']}
                      onContentUpdate={(updates) => handleInstructionContentUpdate('examples', updates)}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="thongtin" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <ThongTinContent isInEditMode={isInEditMode} />
                  </div>
                </ScrollArea>
              </TabsContent>
            </>
          )}
          
          {/* Special tabs for exercise-2-2 */}
          {showExercise22Tabs && (
            <>
              <TabsContent 
                value="gamma" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <GammaContent onBackClick={handleBackToMain} isInEditMode={isInEditMode} />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="genspark" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <GensparkContent onBackClick={handleBackToMain} isInEditMode={isInEditMode} />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="napkin" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <NapkinContent onBackClick={handleBackToMain} isInEditMode={isInEditMode} />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="invideo" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <InvideoContent onBackClick={handleBackToMain} isInEditMode={isInEditMode} />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="heygen" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <HeygenContent onBackClick={handleBackToMain} isInEditMode={isInEditMode} />
                  </div>
                </ScrollArea>
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
      
      {/* Admin Exercise Edit Modal */}
      {isInEditMode && (
        <ExerciseEditModal
          exercise={editingExercise}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingExercise(null);
          }}
          onSave={handleSaveExercise}
        />
      )}
    </div>
  );
};

export default InstructionsPanel;
