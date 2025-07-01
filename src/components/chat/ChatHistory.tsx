import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";
import { useCompare } from "@/context/CompareContext";
import { formatDistanceToNow } from "date-fns";
import { Clock, MessageSquare, Plus, GitCompareArrows } from "lucide-react";

interface ChatHistoryProps {
  onSelect?: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ onSelect }) => {
  const { 
    sessions, 
    currentSession, 
    selectSession, 
    createNewSession,
    getComparisonMessages
  } = useSession();
  
  const { isCompareMode, toggleCompareMode } = useCompare();
  
  const handleSelectSession = (sessionId: string) => {
    // Get the session to check if it's a comparison session
    const session = sessions.find(s => s.id === sessionId);
    
    // First select the session - this will update URL hash
    selectSession(sessionId);
    
    // Close the sidebar if needed
    onSelect?.();
  };
  
  const handleNewChat = () => {
    createNewSession();
    onSelect?.();
  };
  
  // Sort sessions by most recent first, using updatedAt for better ordering
  const sortedSessions = [...sessions].sort((a, b) => {
    // Prioritize current session
    if (currentSession?.id === a.id) return -1;
    if (currentSession?.id === b.id) return 1;
    
    // Then sort by most recently updated
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
  
  // Filter sessions to only show those with messages or the current session
  const filteredSessions = sortedSessions.filter(session => {
    // Always show current session
    if (currentSession && session.id === currentSession.id) return true;
    
    // For comparison sessions, check comparison messages
    if (session.isComparisonMode) {
      const comparisonData = getComparisonMessages(session.id);
      const totalComparisonMessages = 
        (comparisonData?.leftMessages?.length || 0) + 
        (comparisonData?.rightMessages?.length || 0);
      return totalComparisonMessages > 0;
    }
    
    // For regular sessions, check messages array
    return session.messages.length > 0;
  });
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-medium text-gray-700">Your conversations</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center"
          onClick={handleNewChat}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No conversation history yet
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSessions.map((session) => {
            // Get comparison messages for this session
            const comparisonData = getComparisonMessages(session.id);
            const totalComparisonMessages = 
              (comparisonData?.leftMessages?.length || 0) + 
              (comparisonData?.rightMessages?.length || 0);
            
            // Determine if this is a comparison session by either:
            // 1. Having comparison messages
            // 2. Having the isComparisonMode flag set
            const isComparisonSession = 
              totalComparisonMessages > 0 || 
              session.isComparisonMode === true;
            
            // Get the accurate message count
            const messageCount = isComparisonSession 
              ? Math.floor(totalComparisonMessages / 2) // Divide by 2 because user messages are duplicated
              : session.messages.length;
              
            return (
              <button
                key={session.id}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentSession?.id === session.id
                    ? "bg-fpt-blue/10 border-l-4 border-fpt-blue"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleSelectSession(session.id)}
              >
                <div className="mb-1">
                  <div className="flex items-start mb-1">
                    {isComparisonSession ? (
                      <GitCompareArrows className="h-4 w-4 mr-2 text-fpt-blue flex-shrink-0 mt-0.5" />
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="font-medium text-sm leading-tight break-words flex-1">
                      {session.name}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 ml-6">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {formatDistanceToNow(session.createdAt, { addSuffix: false })}
                    </span>
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-500 truncate">
                  {messageCount} message{messageCount !== 1 ? 's' : ''} • {isComparisonSession ? 'comparison' : 'chat'}
                </div>
              </button>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
