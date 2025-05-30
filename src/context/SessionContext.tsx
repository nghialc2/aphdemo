import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Model } from '@/types';

export interface Session {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComparisonMessage {
  id: string;
  userMessage: string;
  leftResponse: string;
  rightResponse: string;
  timestamp: Date;
  leftModelId: string;
  rightModelId: string;
}

interface SessionContextType {
  sessions: Session[];
  currentSession: Session | null;
  availableModels: Model[];
  selectedModel: Model;
  createNewSession: () => void;
  selectSession: (sessionId: string) => void;
  selectModel: (modelId: string) => void;
  sendMessage: (content: string, contextPrompt?: string) => Promise<void>;
  sendComparisonMessage: (content: string, leftModelId: string, rightModelId: string, contextPrompt?: string) => Promise<void>;
  isProcessing: boolean;
  updateContextPrompt: (sessionId: string, prompt: string) => void;
  getContextPrompt: (sessionId: string) => string;
  getComparisonMessages: (sessionId: string) => { leftMessages: Message[], rightMessages: Message[] };
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Default available models
const defaultModels: Model[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and efficient', tags: ['fast'] },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable', tags: ['advanced'] },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic model', tags: ['reasoning'] },
];

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [contextPrompts, setContextPrompts] = useState<Record<string, string>>({});
  const [comparisonMessages, setComparisonMessages] = useState<Record<string, ComparisonMessage[]>>({});
  const [availableModels] = useState<Model[]>(defaultModels);
  const [selectedModel, setSelectedModel] = useState<Model>(defaultModels[0]);

  const selectModel = useCallback((modelId: string) => {
    const model = availableModels.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
    }
  }, [availableModels]);

  const createNewSession = useCallback(() => {
    const newSession: Session = {
      id: uuidv4(),
      name: `Phiên chat mới`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession);
  }, []);

  const selectSession = useCallback((sessionId: string) => {
    const session = sessions.find(session => session.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  }, [sessions]);

  const updateContextPrompt = useCallback((sessionId: string, prompt: string) => {
    setContextPrompts(prev => ({
      ...prev,
      [sessionId]: prompt,
    }));
  }, []);

  const getContextPrompt = useCallback((sessionId: string) => {
    return contextPrompts[sessionId] || '';
  }, [contextPrompts]);

  const getComparisonMessages = useCallback((sessionId: string) => {
    const msgs = comparisonMessages[sessionId] || [];
    
    // Group messages by role for left and right models
    const leftMessages: Message[] = msgs.map(msg => ({
      id: `${msg.id}-left`,
      role: 'assistant',
      content: msg.leftResponse,
      timestamp: msg.timestamp,
      modelId: msg.leftModelId,
    }));
    
    const rightMessages: Message[] = msgs.map(msg => ({
      id: `${msg.id}-right`,
      role: 'assistant',
      content: msg.rightResponse,
      timestamp: msg.timestamp,
      modelId: msg.rightModelId,
    }));
    
    return { leftMessages, rightMessages };
  }, [comparisonMessages]);

  const sendComparisonMessage = useCallback(async (content: string, leftModelId: string, rightModelId: string, contextPrompt?: string) => {
    if (!currentSession) return;
    
    setIsProcessing(true);
    
    try {
      const comparisonMessageId = uuidv4();
      
      // Simulate API call for left model
      const leftResponse = await fetch('https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          contextPrompt: contextPrompt || '',
          modelId: leftModelId,
          sessionId: currentSession.id,
        }),
      });
      
      const leftData = await leftResponse.json();
      
      // Simulate API call for right model
      const rightResponse = await fetch('https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          contextPrompt: contextPrompt || '',
          modelId: rightModelId,
          sessionId: currentSession.id,
        }),
      });
      
      const rightData = await rightResponse.json();
      
      const newComparisonMessage: ComparisonMessage = {
        id: comparisonMessageId,
        userMessage: content,
        leftResponse: leftData.output || 'Tôi xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.',
        rightResponse: rightData.output || 'Tôi xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.',
        timestamp: new Date(),
        leftModelId: leftModelId,
        rightModelId: rightModelId,
      };
      
      setComparisonMessages(prev => ({
        ...prev,
        [currentSession.id]: [...(prev[currentSession.id] || []), newComparisonMessage],
      }));
      
    } catch (error) {
      console.error('Error sending comparison message:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [currentSession]);

  const sendMessage = useCallback(async (content: string, contextPrompt?: string) => {
    if (!currentSession) return;
    
    setIsProcessing(true);
    
    try {
      // Extract file information from content for display
      const filePattern = /\[File: ([^\]]+)\]/g;
      const fileMatches = [...content.matchAll(filePattern)];
      const hasFiles = fileMatches.length > 0;
      const fileNames = fileMatches.map(match => match[1]);
      
      // Create display content (remove extracted content section for user message display)
      let displayContent = content;
      if (content.includes('[Nội dung được trích xuất từ file:]')) {
        displayContent = content.split('[Nội dung được trích xuất từ file:]')[0].trim();
      }
      
      // Create user message for display
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: displayContent || (hasFiles ? '' : content),
        timestamp: new Date(),
        hasFiles,
        fileNames
      };

      // Update session with user message
      setSessions(prev => prev.map(session => 
        session.id === currentSession.id
          ? { 
              ...session, 
              messages: [...session.messages, userMessage],
              updatedAt: new Date()
            }
          : session
      ));

      console.log('Sending to n8n webhook:', {
        message: content,
        contextPrompt: contextPrompt || '',
        modelId: selectedModel.id,
        sessionId: currentSession.id,
      });

      // Send full content (including extracted text) to API
      const response = await fetch('https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          contextPrompt: contextPrompt || '',
          modelId: selectedModel.id,
          sessionId: currentSession.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response from n8n:', data);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.output || 'Tôi xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.',
        timestamp: new Date(),
        modelId: selectedModel.id
      };

      setSessions(prev => prev.map(session => 
        session.id === currentSession.id
          ? { 
              ...session, 
              messages: [...session.messages, assistantMessage],
              updatedAt: new Date()
            }
          : session
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.',
        timestamp: new Date(),
        modelId: 'error'
      };

      setSessions(prev => prev.map(session => 
        session.id === currentSession.id
          ? { 
              ...session, 
              messages: [...session.messages, errorMessage],
              updatedAt: new Date()
            }
          : session
      ));
    } finally {
      setIsProcessing(false);
    }
  }, [currentSession, selectedModel]);

  const value = {
    sessions,
    currentSession,
    availableModels,
    selectedModel,
    createNewSession,
    selectSession,
    selectModel,
    sendMessage,
    sendComparisonMessage,
    isProcessing,
    updateContextPrompt,
    getContextPrompt,
    getComparisonMessages,
  };

  return (
    <SessionContext.Provider value={value}>
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
