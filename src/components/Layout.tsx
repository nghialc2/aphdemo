
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

const Layout = () => {
  const [isInstructionsCollapsed, setIsInstructionsCollapsed] = useState(false);
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      
      <SidebarProvider defaultOpen={false}>
        <div className="flex-1 flex overflow-hidden w-full">
          {isInstructionsCollapsed ? (
            <div className="w-10 border-r border-gray-200 flex items-start justify-center pt-4">
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
            <div className="w-[40%] md:w-[35%] lg:w-1/3 h-full overflow-hidden">
              <InstructionsPanel 
                collapsible={true}
                onCollapse={() => setIsInstructionsCollapsed(true)}
              />
            </div>
          )}
          
          <div className={`${isInstructionsCollapsed ? 'flex-1' : 'w-[60%] md:w-[65%] lg:w-2/3'} h-full overflow-hidden relative flex`}>
            <ChatInterface />
            
            <Sidebar side="right">
              <SidebarHeader>
                <div className="flex items-center gap-2 px-2">
                  <h3 className="font-medium text-sm">Chat History</h3>
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
