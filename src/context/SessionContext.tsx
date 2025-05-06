import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ChatSession, Message, Model } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

// Map of model IDs to their corresponding n8n URLs
const MODEL_N8N_URLS: Record<string, string> = {
  "gpt-4o-mini": "https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba", // URL for GPT-4o Mini
  "gpt-4": "https://n8n-gpt4-url.com", // Replace with actual URL for GPT-4
  "claude-3": "https://n8n-claude3-url.com", // Replace with actual URL for Claude 3
  "llama-3": "https://n8n-llama3-url.com", // Replace with actual URL for Llama 3
};

// Fallback URL if a model doesn't have a specific URL defined
const DEFAULT_N8N_URL = "https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba"; // Default n8n URL

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
  const { toast } = useToast();

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
      
      // Get the current model ID for this session
      const modelId = currentSession?.modelId || selectedModel.id;
      
      // Determine which n8n URL to use based on the model
      const n8nUrl = MODEL_N8N_URLS[modelId] || DEFAULT_N8N_URL;
      
      // Send request to the appropriate n8n URL for this model
      let assistantResponse;
      try {
        console.log(`Sending request to n8n URL: ${n8nUrl} for model: ${modelId}`);
        
        // Make sure we're using the correct URL format - don't add any additional path
        const response = await fetch(n8nUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            modelId: modelId
          }),
        });
        
        if (!response.ok) {
          console.error(`n8n returned status: ${response.status}`);
          throw new Error(`n8n returned an error: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Invalid content type received:', contentType);
          throw new Error('Invalid response format from n8n endpoint');
        }
        
        const data = await response.json();
        console.log("Response from n8n:", data);
        
        // Allow for different response formats
        assistantResponse = data.text || data.response || data.content || data.message;
        
        if (!assistantResponse) {
          console.error('Missing response content:', data);
          throw new Error('Response from n8n does not contain expected content');
        }
      } catch (error) {
        console.error("Error calling n8n:", error);
        toast({
          title: "Connection Error",
          description: `There was an error connecting to the n8n endpoint for ${modelId}. Please check the console for details.`,
          variant: "destructive",
        });
        assistantResponse = `There was an error connecting to the n8n endpoint for ${modelId}. Please check the console for details.`;
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
