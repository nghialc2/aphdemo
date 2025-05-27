
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
import GammaContent from './instructions/GammaContent';
import GensparkContent from './instructions/GensparkContent';
import NapkinContent from './instructions/NapkinContent';
import InvideoContent from './instructions/InvideoContent';
import HeygenContent from './instructions/HeygenContent';
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
    
    // Set default tab based on exercise
    if (exercise.id === 'exercise-2-2') {
      setActiveTab("gamma"); // Default to first tab for exercise-2-2
    } else {
      setActiveTab("instructions"); // Default to instructions for other exercises
    }
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedExercise(null);
    setActiveTab("instructions");
  };

  // Show additional tabs for exercise-1-1 and exercise-1-2
  const showExercise1Tabs = currentView === 'exercise' && (selectedExercise?.id === 'exercise-1-1' || selectedExercise?.id === 'exercise-1-2');
  
  // Show special tabs for exercise-2-2 (without instructions tab)
  const showExercise22Tabs = currentView === 'exercise' && selectedExercise?.id === 'exercise-2-2';
  
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
          
          {/* Special tabs for exercise-2-2 */}
          {showExercise22Tabs && (
            <>
              <TabsContent 
                value="gamma" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <GammaContent />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="genspark" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <GensparkContent />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="napkin" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <NapkinContent />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="invideo" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <InvideoContent />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="heygen" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <HeygenContent />
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
