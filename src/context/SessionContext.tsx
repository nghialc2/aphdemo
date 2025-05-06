import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ChatSession, Message, Model } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

// Map of model IDs to their corresponding n8n URLs
const MODEL_N8N_URLS: Record<string, string> = {
  "gpt-4o-mini": "https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba",
  "gpt-4.1-mini": "https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba1",
  "gpt-o3-mini": "https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba2",
  "gemini-2.0-flash": "https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba3",
  "gemini-2.5-flash": "https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba4",
};

// Fallback URL if a model doesn't have a specific URL defined
const DEFAULT_N8N_URL = "https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba";

interface SessionContextProps {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  availableModels: Model[];
  selectedModel: Model;
  createNewSession: () => void;
  selectSession: (sessionId: string) => void;
  sendMessage: (content: string, contextPrompt?: string) => Promise<void>;
  sendComparisonMessage: (content: string, leftModelId: string, rightModelId: string, contextPrompt?: string) => Promise<void>;
  selectModel: (modelId: string) => void;
  isProcessing: boolean;
  updateContextPrompt: (sessionId: string, contextPrompt: string) => void;
  getContextPrompt: (sessionId: string) => string;
  getComparisonMessages: (sessionId: string) => {
    leftMessages: Message[];
    rightMessages: Message[];
  };
}

const defaultModels: Model[] = [
  { id: "gpt-4o-mini", name: "GPT 4o mini", tags: ["Default"] },
  { id: "gpt-4.1-mini", name: "GPT 4.1 mini", tags: ["New"] },
  { id: "gpt-o3-mini", name: "GPT o3 mini", tags: ["New"] },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 flash", tags: ["Google"] },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 flash", tags: ["Google"] },
];

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [availableModels] = useState<Model[]>(defaultModels);
  const [selectedModel, setSelectedModel] = useState<Model>(defaultModels[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [contextPrompts, setContextPrompts] = useState<Record<string, string>>({});
  
  // Store comparison session messages separately by sessionId
  const [comparisonMessages, setComparisonMessages] = useState<Record<string, {
    leftMessages: Message[];
    rightMessages: Message[];
  }>>({});
  
  const { toast } = useToast();

  const currentSession = currentSessionId 
    ? sessions.find(session => session.id === currentSessionId) || null
    : null;

  // Storage key for persisting comparison messages
  const COMPARISON_STORAGE_KEY = "aph_demo_comparison_messages";

  // Load saved comparison messages from localStorage on initial load
  useEffect(() => {
    try {
      const savedComparisonMessages = localStorage.getItem(COMPARISON_STORAGE_KEY);
      if (savedComparisonMessages) {
        setComparisonMessages(JSON.parse(savedComparisonMessages));
        console.log("Loaded saved comparison messages:", JSON.parse(savedComparisonMessages));
      }
    } catch (error) {
      console.error("Error loading comparison messages from localStorage:", error);
    }
  }, []);

  // Save comparison messages to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(comparisonMessages).length > 0) {
      try {
        localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(comparisonMessages));
        console.log("Saved comparison messages to localStorage:", comparisonMessages);
      } catch (error) {
        console.error("Error saving comparison messages to localStorage:", error);
      }
    }
  }, [comparisonMessages]);

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
    
    // Initialize empty context for new session
    setContextPrompts(prev => ({
      ...prev,
      [newSession.id]: ""
    }));
    
    // Note: We're not initializing empty comparison messages here anymore
    // since they're now persisted across sessions in localStorage
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

  const updateContextPrompt = (sessionId: string, contextPrompt: string) => {
    setContextPrompts(prev => ({
      ...prev,
      [sessionId]: contextPrompt
    }));
  };

  const getContextPrompt = (sessionId: string): string => {
    return contextPrompts[sessionId] || "";
  };
  
  const getComparisonMessages = (sessionId: string) => {
    return comparisonMessages[sessionId] || { leftMessages: [], rightMessages: [] };
  };

  // Function to call n8n with a model ID and get a response
  const callModelAPI = async (
    content: string, 
    modelId: string, 
    contextPrompt: string, 
    sessionId: string
  ): Promise<string> => {
    try {
      // Determine which n8n URL to use based on the model
      const n8nUrl = MODEL_N8N_URLS[modelId] || DEFAULT_N8N_URL;
      
      console.log(`Sending request to n8n URL: ${n8nUrl} for model: ${modelId}`);
      console.log(`Context prompt: ${contextPrompt}`);
      
      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          contextPrompt: contextPrompt.trim(),
          modelId: modelId,
          sessionId: sessionId
        }),
      });
      
      if (!response.ok) {
        console.error(`n8n returned status: ${response.status}`);
        throw new Error(`n8n returned an error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Response from n8n:", data);
      
      // Improved response handling - check all possible response formats and structures
      let assistantResponse;
      
      if (typeof data === 'string') {
        // If the response is directly a string
        assistantResponse = data;
      } else if (typeof data === 'object' && data !== null) {
        // Try to extract content from various possible fields in the object
        assistantResponse = 
          data.text || 
          data.response || 
          data.content || 
          data.message ||
          data.reply ||
          data.answer ||
          data.result ||
          data.output ||
          // Extract from deeply nested structures if needed
          (data.data && (
            data.data.text || 
            data.data.content || 
            data.data.message ||
            data.data.response
          )) ||
          // Convert the entire object to string as a last resort
          JSON.stringify(data);
      } else {
        throw new Error('Unexpected response format from n8n endpoint');
      }
      
      // Validate that we have a usable response
      if (!assistantResponse || assistantResponse === '{}' || assistantResponse === 'null') {
        throw new Error('Empty or invalid response from n8n');
      }
      
      return assistantResponse;
      
    } catch (error) {
      console.error("Error calling n8n:", error);
      return `There was an error processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };
  
  const sendMessage = async (content: string, contextPrompt: string = "") => {
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

      // Save the context prompt for this session
      if (currentSession) {
        updateContextPrompt(currentSession.id, contextPrompt);
      }
      
      // Get the current model ID for this session
      const modelId = currentSession?.modelId || selectedModel.id;
      
      // Call API for the selected model
      const assistantResponse = await callModelAPI(content, modelId, contextPrompt, currentSessionId);
      
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
  
  const sendComparisonMessage = async (
    content: string, 
    leftModelId: string, 
    rightModelId: string, 
    contextPrompt: string = ""
  ) => {
    if (!currentSessionId) return;
    
    setIsProcessing(true);
    
    try {
      // Create user message
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: Date.now()
      };
      
      // Add user message to both sides of the comparison
      setComparisonMessages(prev => {
        const current = prev[currentSessionId] || { leftMessages: [], rightMessages: [] };
        return {
          ...prev,
          [currentSessionId]: {
            leftMessages: [...current.leftMessages, userMessage],
            rightMessages: [...current.rightMessages, userMessage]
          }
        };
      });
      
      // Save the context prompt for this session
      updateContextPrompt(currentSessionId, contextPrompt);
      
      // Set the session title if it's the first message
      const currentSessionObj = sessions.find(s => s.id === currentSessionId);
      if (currentSessionObj && currentSessionObj.messages.length === 0) {
        setSessions(prev => 
          prev.map(session => 
            session.id === currentSessionId
              ? { ...session, title: content.slice(0, 20) + (content.length > 20 ? '...' : '') }
              : session
          )
        );
      }

      // Call APIs for both models in parallel
      const [leftResponse, rightResponse] = await Promise.all([
        callModelAPI(content, leftModelId, contextPrompt, currentSessionId),
        callModelAPI(content, rightModelId, contextPrompt, currentSessionId)
      ]);
      
      // Create assistant messages
      const leftAssistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: leftResponse,
        timestamp: Date.now()
      };
      
      const rightAssistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: rightResponse,
        timestamp: Date.now()
      };
      
      // Add assistant messages to comparison
      setComparisonMessages(prev => {
        const current = prev[currentSessionId] || { leftMessages: [], rightMessages: [] };
        return {
          ...prev,
          [currentSessionId]: {
            leftMessages: [...current.leftMessages, leftAssistantMessage],
            rightMessages: [...current.rightMessages, rightAssistantMessage]
          }
        };
      });
      
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
        sendComparisonMessage,
        selectModel,
        isProcessing,
        updateContextPrompt,
        getContextPrompt,
        getComparisonMessages
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
