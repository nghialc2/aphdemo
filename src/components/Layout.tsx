
import { useState } from 'react';
import Header from './Header';
import InstructionsPanel from './InstructionsPanel';
import ChatInterface from './chat/ChatInterface';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';

const Layout = () => {
  const [isInstructionsCollapsed, setIsInstructionsCollapsed] = useState(false);
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
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
        
        <div className={`${isInstructionsCollapsed ? 'flex-1' : 'w-1/2 md:w-3/5 xl:w-2/3'} h-full overflow-hidden`}>
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default Layout;
