
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Book, BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InstructionsPanelProps {
  collapsible?: boolean;
  onCollapse?: () => void;
}

const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ 
  collapsible = false,
  onCollapse
}) => {
  const [activeTab, setActiveTab] = useState<string>("instructions");
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-card">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-border p-4">
        <h2 className="font-bold text-lg text-fpt-blue dark:text-fpt-blue">Instructions</h2>
        {collapsible && (
          <Button variant="ghost" size="icon" onClick={onCollapse}>
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Collapse</span>
          </Button>
        )}
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="px-4 py-2 justify-start border-b w-full rounded-none bg-gray-50 dark:bg-dark-card flex-shrink-0">
          <TabsTrigger value="instructions" className="flex items-center dark:text-gray-200 dark:data-[state=active]:text-white">
            <Book className="mr-2 h-4 w-4" />
            <span>Instructions</span>
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center dark:text-gray-200 dark:data-[state=active]:text-white">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Examples</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 relative overflow-hidden">
          <TabsContent 
            value="instructions" 
            className="absolute inset-0 m-0"
          >
            <ScrollArea className="h-full dark:bg-dark-card">
              <div className="p-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-fpt-orange break-words dark:text-fpt-orange">
                    Xin chào mừng các bạn đã đến với Lab thực hành của chương trình AI-Powered HRM
                  </h3>
                  
                  <div className="space-y-3">
                    <p className="dark:text-gray-100">
                      This lab allows you to practice crafting effective prompts for
                      large language models. You'll learn how to:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-1 ml-4 dark:text-gray-200">
                      <li>Write clear, specific instructions</li>
                      <li>Structure prompts for optimal responses</li>
                      <li>Compare results across different models</li>
                      <li>Iterate and refine your prompt engineering skills</li>
                    </ul>
                    
                    <div className="bg-fpt-lightGreen p-4 rounded-md dark:bg-fpt-green/20">
                      <p className="font-medium text-fpt-green dark:text-fpt-green">Getting Started:</p>
                      <ol className="list-decimal list-inside ml-2 space-y-1 dark:text-gray-200">
                        <li>Choose a model from the dropdown in the chat panel</li>
                        <li>Type your prompt in the message input</li>
                        <li>Review the response and refine your approach</li>
                      </ol>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                      Remember: The quality of your prompts directly affects the quality of the responses!
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-fpt-blue dark:text-fpt-blue">
                    Today's Exercises
                  </h3>
                  
                  <div className="border-l-4 border-fpt-blue pl-3">
                    <p className="font-medium dark:text-white">Exercise 1: Role Definition</p>
                    <p className="text-sm dark:text-gray-300">
                      Write a prompt that clearly defines the role the AI should take (e.g., expert copywriter, financial advisor).
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-fpt-orange pl-3">
                    <p className="font-medium dark:text-white">Exercise 2: Constraint Setting</p>
                    <p className="text-sm dark:text-gray-300">
                      Create a prompt with specific constraints (word count, format, audience).
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-fpt-green pl-3">
                    <p className="font-medium dark:text-white">Exercise 3: Sequential Instructions</p>
                    <p className="text-sm dark:text-gray-300">
                      Develop a multi-step prompt that guides the AI through a complex task.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent 
            value="examples" 
            className="absolute inset-0 m-0"
          >
            <ScrollArea className="h-full dark:bg-dark-card">
              <div className="p-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-fpt-blue dark:text-fpt-blue">
                    Example Prompts
                  </h3>
                  
                  <div className="bg-gray-50 dark:bg-dark-muted p-3 rounded-md border border-gray-200 dark:border-dark-border">
                    <p className="font-medium dark:text-white">Basic Prompt:</p>
                    <p className="text-sm font-mono bg-white dark:bg-dark-background p-2 rounded mt-1 border border-gray-200 dark:border-dark-border dark:text-gray-200">
                      Write a short paragraph about artificial intelligence.
                    </p>
                    <p className="text-xs mt-2 text-gray-500 dark:text-gray-300">
                      Too vague, likely to get generic results
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-dark-muted p-3 rounded-md border border-gray-200 dark:border-dark-border">
                    <p className="font-medium dark:text-white">Improved Prompt:</p>
                    <p className="text-sm font-mono bg-white dark:bg-dark-background p-2 rounded mt-1 border border-gray-200 dark:border-dark-border dark:text-gray-200">
                      Act as a technology journalist writing for a business audience. Write a compelling 100-word paragraph about how generative AI is transforming customer service in 2025. Include one specific example and one statistic.
                    </p>
                    <p className="text-xs mt-2 text-gray-500 dark:text-gray-300">
                      Clear role, audience, length, and specific requirements
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-dark-muted p-3 rounded-md border border-gray-200 dark:border-dark-border">
                    <p className="font-medium dark:text-white">Advanced Prompt:</p>
                    <p className="text-sm font-mono bg-white dark:bg-dark-background p-2 rounded mt-1 border border-gray-200 dark:border-dark-border dark:text-gray-200 break-words">
                      I want you to act as a senior UX researcher creating a report for product managers. 
                      
                      Step 1: Identify 3 key usability issues that commonly affect mobile banking apps.
                      
                      Step 2: For each issue, explain the impact on both user experience and business metrics.
                      
                      Step 3: Suggest evidence-based solutions for each issue, citing relevant UX research or principles.
                      
                      Format the response as a structured report with bullet points and clear section headings.
                    </p>
                    <p className="text-xs mt-2 text-gray-500 dark:text-gray-300">
                      Multi-step instructions with clear formatting guidelines
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default InstructionsPanel;
