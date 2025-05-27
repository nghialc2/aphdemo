
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
    // Set first available tab based on exercise
    if (exercise.id === 'exercise-2-2') {
      setActiveTab("gamma");
    } else if (exercise.id === 'exercise-1-1' || exercise.id === 'exercise-1-2') {
      setActiveTab("thongtin");
    } else {
      setActiveTab("instructions");
    }
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedExercise(null);
    setActiveTab("instructions");
  };

  // Show additional tabs for exercise-1-1 and exercise-1-2
  const showOriginalTabs = currentView === 'exercise' && (selectedExercise?.id === 'exercise-1-1' || selectedExercise?.id === 'exercise-1-2');
  
  // Show new tabs for exercise-2-2
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
          {currentView === 'main' && (
            <TabsTrigger value="instructions" className="flex items-center">
              <Book className="mr-2 h-4 w-4" />
              <span>Hướng Dẫn</span>
            </TabsTrigger>
          )}
          {showOriginalTabs && (
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
          {currentView === 'main' && (
            <TabsContent 
              value="instructions" 
              className="absolute inset-0 m-0"
            >
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  <WelcomeContent />
                  <ExercisesList 
                    exercises={exercisesData} 
                    onExerciseClick={handleExerciseClick} 
                  />
                </div>
              </ScrollArea>
            </TabsContent>
          )}
          
          {currentView === 'exercise' && selectedExercise && !showOriginalTabs && !showExercise22Tabs && (
            <TabsContent 
              value="instructions" 
              className="absolute inset-0 m-0"
            >
              <ScrollArea className="h-full">
                <div className="p-4">
                  <ExerciseContent 
                    exercise={selectedExercise} 
                    onBackClick={handleBackToMain} 
                  />
                </div>
              </ScrollArea>
            </TabsContent>
          )}
          
          {showOriginalTabs && (
            <>
              <TabsContent 
                value="thongtin" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleBackToMain}
                        className="flex items-center text-fpt-blue"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Quay lại
                      </Button>
                    </div>
                    <ThongTinContent />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="examples" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleBackToMain}
                        className="flex items-center text-fpt-blue"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Quay lại
                      </Button>
                    </div>
                    <ExamplesContent />
                  </div>
                </ScrollArea>
              </TabsContent>
            </>
          )}
          
          {showExercise22Tabs && (
            <>
              <TabsContent 
                value="gamma" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleBackToMain}
                        className="flex items-center text-fpt-blue"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Quay lại
                      </Button>
                    </div>
                    <h3 className="text-xl font-bold text-fpt-orange mb-4">
                      {selectedExercise?.title} - Gamma
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p>Nội dung hướng dẫn sử dụng Gamma sẽ được cập nhật tại đây.</p>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="genspark" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleBackToMain}
                        className="flex items-center text-fpt-blue"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Quay lại
                      </Button>
                    </div>
                    <h3 className="text-xl font-bold text-fpt-orange mb-4">
                      {selectedExercise?.title} - Genspark
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p>Nội dung hướng dẫn sử dụng Genspark sẽ được cập nhật tại đây.</p>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="napkin" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleBackToMain}
                        className="flex items-center text-fpt-blue"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Quay lại
                      </Button>
                    </div>
                    <h3 className="text-xl font-bold text-fpt-orange mb-4">
                      {selectedExercise?.title} - Napkin
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p>Nội dung hướng dẫn sử dụng Napkin sẽ được cập nhật tại đây.</p>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="invideo" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleBackToMain}
                        className="flex items-center text-fpt-blue"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Quay lại
                      </Button>
                    </div>
                    <h3 className="text-xl font-bold text-fpt-orange mb-4">
                      {selectedExercise?.title} - Invideo
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p>Nội dung hướng dẫn sử dụng Invideo sẽ được cập nhật tại đây.</p>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent 
                value="heygen" 
                className="absolute inset-0 m-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleBackToMain}
                        className="flex items-center text-fpt-blue"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Quay lại
                      </Button>
                    </div>
                    <h3 className="text-xl font-bold text-fpt-orange mb-4">
                      {selectedExercise?.title} - Heygen
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p>Nội dung hướng dẫn sử dụng Heygen sẽ được cập nhật tại đây.</p>
                    </div>
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
