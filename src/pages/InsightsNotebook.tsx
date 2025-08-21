import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NotebookHeader from '@/components/insights/notebook/NotebookHeader';
import SourcesSidebar from '@/components/insights/notebook/SourcesSidebar';
import StudioSidebar from '@/components/insights/notebook/StudioSidebar';
import ChatArea from '@/components/insights/notebook/ChatArea';
import MobileNotebookTabs from '@/components/insights/notebook/MobileNotebookTabs';
import { useNotebooks } from '@/hooks/insights/useNotebooks';
import { useSources } from '@/hooks/insights/useSources';
import { useNotes } from '@/hooks/insights/useNotes';
import { useInsightsAuth } from '@/hooks/useInsightsAuth';
import { useToast } from '@/hooks/use-toast';

const InsightsNotebook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useInsightsAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'sources' | 'studio' | 'chat'>('sources');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const { notebooks, isLoading: notebooksLoading } = useNotebooks();
  const { sources, isLoading: sourcesLoading } = useSources(id || '');
  const { notes } = useNotes(id || '');

  const notebook = notebooks?.find(n => n.id === id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=documentation');
      return;
    }

    if (!notebooksLoading && notebooks && id && !notebook) {
      toast({
        title: "Notebook not found",
        description: "The requested notebook could not be found.",
        variant: "destructive",
      });
      navigate('/documentation');
    }
  }, [authLoading, user, notebooksLoading, notebooks, id, notebook, navigate, toast]);

  if (authLoading || notebooksLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!notebook) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-600">Notebook not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <NotebookHeader 
        notebook={notebook}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className={`transition-all duration-200 ${isSidebarCollapsed ? 'w-0' : 'w-80'} overflow-hidden border-r border-gray-200`}>
          {activeTab === 'sources' && (
            <SourcesSidebar
              notebookId={notebook.id}
              sources={sources || []}
              isLoading={sourcesLoading}
            />
          )}
          {activeTab === 'studio' && (
            <StudioSidebar
              notebookId={notebook.id}
              notes={notes || []}
            />
          )}
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="border-b border-gray-200 bg-white">
            <div className="flex">
              <button
                onClick={() => setActiveTab('sources')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'sources'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Sources ({sources?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('studio')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'studio'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Studio ({notes?.length || 0})
              </button>
            </div>
          </div>
          
          <ChatArea 
            notebook={notebook} 
            notebookId={notebook.id} 
            hasSource={(sources?.length || 0) > 0} 
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex-1 flex flex-col">
        <MobileNotebookTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sourcesCount={sources?.length || 0}
          notesCount={notes?.length || 0}
        />
        
        {activeTab === 'sources' && (
          <SourcesSidebar
            notebookId={notebook.id}
            sources={sources || []}
            isLoading={sourcesLoading}
          />
        )}
        {activeTab === 'studio' && (
          <StudioSidebar
            notebookId={notebook.id}
            notes={notes || []}
          />
        )}
        {activeTab === 'chat' && (
          <ChatArea 
            notebook={notebook} 
            notebookId={notebook.id} 
            hasSource={(sources?.length || 0) > 0} 
          />
        )}
      </div>
    </div>
  );
};

export default InsightsNotebook;