import React from 'react';
import { useParams } from 'react-router-dom';
import { useNotebooks } from '@/hooks/insights/useNotebooks';
import { useSources } from '@/hooks/insights/useSources';
import { useNotes } from '@/hooks/insights/useNotes';
import NotebookHeader from '@/components/insights/notebook/NotebookHeader';
import SourcesSidebar from '@/components/insights/notebook/SourcesSidebar';
import ChatArea from '@/components/insights/notebook/ChatArea';
import NoteEditor from '@/components/insights/notebook/NoteEditor';
import StudioSidebar from '@/components/insights/notebook/StudioSidebar';
import MobileNotebookTabs from '@/components/insights/notebook/MobileNotebookTabs';
import { useIsMobile } from '@/hooks/insights/use-mobile';

const DocumentationNotebook = () => {
  const { id } = useParams();
  const isMobile = useIsMobile();
  const { data: notebooks } = useNotebooks();
  const { data: sources } = useSources(id);
  const { data: notes } = useNotes(id);

  const notebook = notebooks?.find(n => n.id === id);

  if (!notebook) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Notebook not found</h2>
          <p className="text-muted-foreground">The requested notebook could not be found.</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <NotebookHeader notebook={notebook} />
        <MobileNotebookTabs 
          notebook={notebook}
          sources={sources || []}
          notes={notes || []}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <NotebookHeader notebook={notebook} />
      <div className="flex-1 flex overflow-hidden">
        <SourcesSidebar 
          notebookId={id!} 
          sources={sources || []} 
        />
        <div className="flex-1 flex">
          <ChatArea notebookId={id!} />
          <div className="w-1/2 flex">
            <NoteEditor 
              notebookId={id!} 
              notes={notes || []} 
            />
            <StudioSidebar notebookId={id!} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationNotebook;