import { useState } from 'react';
import Header from './Header';
import InstructionsPanel from './InstructionsPanel';
import ChatInterface from './chat/ChatInterface';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';
import ChatHistory from './chat/ChatHistory';
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from './ui/sidebar';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from './ui/resizable';

const Layout = () => {
  const [isInstructionsCollapsed, setIsInstructionsCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header should always be visible */}
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <SidebarProvider defaultOpen={false}>
        <div className="flex-1 flex overflow-hidden w-full pt-[60px]">
          {isInstructionsCollapsed ? (
            <div className="w-12 border-r border-gray-200 flex items-start justify-center pt-4 overflow-y-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsInstructionsCollapsed(false)}
                className="text-fpt-blue"
              >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Expand</span>
              </Button>
            </div>
          ) : (
            <ResizablePanelGroup direction="horizontal" className="w-full h-full">
              <ResizablePanel 
                defaultSize={33} 
                minSize={20} 
                maxSize={60}
                className="h-full"
              >
                <div className="h-full overflow-y-auto">
                  <InstructionsPanel 
                    collapsible={true}
                    onCollapse={() => setIsInstructionsCollapsed(true)}
                  />
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              <ResizablePanel className="h-full relative flex">
                <div className="flex-1 h-full overflow-hidden">
                  <ChatInterface />
                </div>
                
                <Sidebar side="right">
                  <SidebarHeader>
                    <div className="flex items-center gap-2 px-2">
                      <h3 className="font-medium">Chat History</h3>
                    </div>
                  </SidebarHeader>
                  <SidebarContent>
                    <SidebarGroup>
                      <SidebarGroupLabel>Recent Sessions</SidebarGroupLabel>
                      <div className="px-2">
                        <ChatHistory onSelect={() => {}} />
                      </div>
                    </SidebarGroup>
                  </SidebarContent>
                  <SidebarFooter>
                    <div className="text-xs text-center text-gray-500 p-2">
                      APH Demo Lab - Chat History
                    </div>
                  </SidebarFooter>
                </Sidebar>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
