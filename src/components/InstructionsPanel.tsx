
import { useState } from 'react';
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
import { exercisesData } from './instructions/ExercisesData';
import { Exercise } from './instructions/ExerciseContent';

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
  
  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentView('exercise');
    setActiveTab("instructions"); // Reset to instructions tab when entering exercise view
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedExercise(null);
    setActiveTab("instructions"); // Reset to instructions tab when going back
  };

  // Show additional tabs only when viewing exercise-1
  const showAdditionalTabs = currentView === 'exercise' && selectedExercise?.id === 'exercise-1';
  
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="font-bold text-lg text-fpt-blue">Hướng Dẫn</h2>
        {collapsible && (
          <Button variant="ghost" size="icon" onClick={onCollapse}>
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Thu gọn</span>
          </Button>
        )}
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="px-4 py-2 justify-start border-b w-full rounded-none bg-gray-50 flex-shrink-0">
          <TabsTrigger value="instructions" className="flex items-center">
            <Book className="mr-2 h-4 w-4" />
            <span>Hướng Dẫn</span>
          </TabsTrigger>
          {showAdditionalTabs && (
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
        </TabsList>
        
        <div className="flex-1 relative overflow-hidden">
          <TabsContent 
            value="instructions" 
            className="absolute inset-0 m-0"
          >
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                {currentView === 'main' ? (
                  <>
                    <WelcomeContent />
                    <ExercisesList 
                      exercises={exercisesData} 
                      onExerciseClick={handleExerciseClick} 
                    />
                  </>
                ) : (
                  selectedExercise && (
                    <ExerciseContent 
                      exercise={selectedExercise} 
                      onBackClick={handleBackToMain} 
                    />
                  )
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {showAdditionalTabs && (
            <>
              <TabsContent 
                value="examples" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <ExamplesContent />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="thongtin" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <ThongTinContent />
                  </div>
                </ScrollArea>
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default InstructionsPanel;
