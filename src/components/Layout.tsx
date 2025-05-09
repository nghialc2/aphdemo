
import { useState, useEffect } from 'react';
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

const Layout = () => {
  const [isInstructionsCollapsed, setIsInstructionsCollapsed] = useState(false);
  
  // Set CSS variable for sidebar width based on collapsed state
  useEffect(() => {
    const width = isInstructionsCollapsed ? "48px" : "50%"; // 12px -> 48px for w-12
    document.documentElement.style.setProperty('--sidebar-width', width);
    
    // Cleanup when component unmounts
    return () => {
      document.documentElement.style.removeProperty('--sidebar-width');
    };
  }, [isInstructionsCollapsed]);
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <SidebarProvider defaultOpen={false}>
        <div className="flex-1 flex overflow-hidden w-full">
          {isInstructionsCollapsed ? (
            <div className="w-12 border-r border-gray-200 flex items-start justify-center pt-4">
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
            <div className="w-1/2 md:w-2/5 xl:w-1/3 h-full overflow-hidden">
              <InstructionsPanel 
                collapsible={true}
                onCollapse={() => setIsInstructionsCollapsed(true)}
              />
            </div>
          )}
          
          <div className={`${isInstructionsCollapsed ? 'flex-1' : 'w-1/2 md:w-3/5 xl:w-2/3'} h-full overflow-hidden relative flex`}>
            <ChatInterface />
            
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
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
