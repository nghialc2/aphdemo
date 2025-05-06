import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ChatSession, Message, Model } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Add the n8n URL here
const N8N_URL = "https://your-n8n-instance-url.com"; // Replace with your actual n8n URL

interface SessionContextProps {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  availableModels: Model[];
  selectedModel: Model;
  createNewSession: () => void;
  selectSession: (sessionId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  selectModel: (modelId: string) => void;
  isProcessing: boolean;
}

const defaultModels: Model[] = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", tags: ["Default"] },
  { id: "gpt-4", name: "GPT-4", tags: ["Advanced"] },
  { id: "claude-3", name: "Claude 3", tags: ["Advanced"] },
  { id: "llama-3", name: "Llama 3", tags: ["Open Source"] },
];

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [availableModels] = useState<Model[]>(defaultModels);
  const [selectedModel, setSelectedModel] = useState<Model>(defaultModels[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentSession = currentSessionId 
    ? sessions.find(session => session.id === currentSessionId) || null
    : null;

  useEffect(() => {
    // On component mount, create a new session if none exists
    if (sessions.length === 0) {
      createNewSession();
    }
  }, []);
  
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: `New Chat ${sessions.length + 1}`,
      messages: [],
      modelId: selectedModel.id,
      createdAt: Date.now()
    };
    
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
  };
  
  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };
  
  const selectModel = (modelId: string) => {
    const model = availableModels.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      
      // Update current session model if it exists
      if (currentSessionId) {
        setSessions(prev => 
          prev.map(session => 
            session.id === currentSessionId 
              ? { ...session, modelId } 
              : session
          )
        );
      }
    }
  };
  
  const sendMessage = async (content: string) => {
    if (!currentSessionId) return;
    
    setIsProcessing(true);
    
    try {
      // Add user message
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: Date.now()
      };
      
      // Update sessions with user message
      setSessions(prev => 
        prev.map(session => 
          session.id === currentSessionId
            ? { 
                ...session, 
                messages: [...session.messages, userMessage],
                title: session.messages.length === 0 ? content.slice(0, 20) + (content.length > 20 ? '...' : '') : session.title
              }
            : session
        )
      );
      
      // Send request to n8n
      let assistantResponse;
      try {
        const response = await fetch(`${N8N_URL}/webhook/chat-request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            modelId: currentSession?.modelId || selectedModel.id
          }),
        });
        
        if (!response.ok) {
          throw new Error(`n8n returned an error: ${response.status}`);
        }
        
        const data = await response.json();
        assistantResponse = data.response || "Sorry, I couldn't process your request";
      } catch (error) {
        console.error("Error calling n8n:", error);
        assistantResponse = "There was an error connecting to n8n. Please check the console for details.";
      }
      
      // Add assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: Date.now()
      };
      
      // Update sessions with assistant message
      setSessions(prev => 
        prev.map(session => 
          session.id === currentSessionId
            ? { ...session, messages: [...session.messages, assistantMessage] }
            : session
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <SessionContext.Provider 
      value={{
        currentSession,
        sessions,
        availableModels,
        selectedModel,
        createNewSession,
        selectSession,
        sendMessage,
        selectModel,
        isProcessing
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
