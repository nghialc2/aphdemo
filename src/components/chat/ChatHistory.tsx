
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
  
  const { isCompareMode } = useCompare();
  
  const handleSelectSession = (sessionId: string) => {
    selectSession(sessionId);
    onSelect?.();
  };
  
  const handleNewChat = () => {
    createNewSession();
    onSelect?.();
  };
  
  // Sort sessions by most recent first
  const sortedSessions = [...sessions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
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
      
      {sortedSessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No conversation history yet
        </div>
      ) : (
        <div className="space-y-2">
          {sortedSessions.map((session) => {
            // Get comparison messages for this session
            const comparisonData = getComparisonMessages(session.id);
            const totalComparisonMessages = 
              (comparisonData?.leftMessages?.length || 0) + 
              (comparisonData?.rightMessages?.length || 0);
            
            // Determine if this is a comparison session
            const isComparisonSession = totalComparisonMessages > 0;
            
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
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {isComparisonSession ? (
                      <GitCompareArrows className="h-4 w-4 mr-2 text-fpt-blue" />
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                    )}
                    <span className="font-medium truncate max-w-[200px]">
                      {session.name}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {formatDistanceToNow(session.createdAt, { addSuffix: true })}
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
  );
};

export default ChatHistory;
