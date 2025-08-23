import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useSources } from '@/hooks/useSources';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import NotebookHeader from '@/components/notebook/NotebookHeader';
import SourcesSidebar from '@/components/notebook/SourcesSidebar';
import ChatArea from '@/components/notebook/ChatArea';
import StudioSidebar from '@/components/notebook/StudioSidebar';
import MobileNotebookTabs from '@/components/notebook/MobileNotebookTabs';
import { Citation } from '@/types/message';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Notebook = () => {
  const { id: notebookId } = useParams();
  const { notebooks } = useNotebooks();
  const { sources } = useSources(notebookId);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/explore');
  };

  const notebook = notebooks?.find(n => n.id === notebookId);
  const hasSource = sources && sources.length > 0;
  const isSourceDocumentOpen = !!selectedCitation;

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
  };

  const handleCitationClose = () => {
    setSelectedCitation(null);
  };

  // Dynamic width calculations for desktop - expand studio when editing notes
  const sourcesWidth = isSourceDocumentOpen ? 'w-[35%]' : 'w-[25%]';
  const studioWidth = 'w-[30%]'; // Expanded width for note editing
  const chatWidth = isSourceDocumentOpen ? 'w-[35%]' : 'w-[45%]';

  // FSB Logo component for absolute top
  const FSBLogo = () => (
    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <img 
              src="/logo_FSB_new.png" 
              alt="FSB Logo" 
              className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
              onError={(e) => {
                console.error('Logo failed to load:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-gray-900 text-white px-2 py-1 text-sm">
            Trở về trang chủ
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden relative">
      <NotebookHeader 
        title={notebook?.title || 'Untitled Notebook'} 
        notebookId={notebookId} 
      />
      <FSBLogo />
      
      {isDesktop ? (
        // Desktop layout (3-column)
        <div className="flex-1 flex overflow-hidden">
          <div className={`${sourcesWidth} flex-shrink-0`}>
            <SourcesSidebar 
              hasSource={hasSource || false} 
              notebookId={notebookId}
              selectedCitation={selectedCitation}
              onCitationClose={handleCitationClose}
              setSelectedCitation={setSelectedCitation}
            />
          </div>
          
          <div className={`${chatWidth} flex-shrink-0`}>
            <ChatArea 
              hasSource={hasSource || false} 
              notebookId={notebookId}
              notebook={notebook}
              onCitationClick={handleCitationClick}
            />
          </div>
          
          <div className={`${studioWidth} flex-shrink-0`}>
            <StudioSidebar 
              notebookId={notebookId} 
              onCitationClick={handleCitationClick}
            />
          </div>
        </div>
      ) : (
        // Mobile/Tablet layout (tabs)
        <MobileNotebookTabs
          hasSource={hasSource || false}
          notebookId={notebookId}
          notebook={notebook}
          selectedCitation={selectedCitation}
          onCitationClose={handleCitationClose}
          setSelectedCitation={setSelectedCitation}
          onCitationClick={handleCitationClick}
        />
      )}
    </div>
  );
};

export default Notebook;