import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Model } from '@/types';

export interface Session {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isComparisonMode?: boolean;
}

export interface ComparisonMessage {
  id: string;
  userMessage: string;
  leftResponse: string;
  rightResponse: string;
  timestamp: Date;
  leftModelId: string;
  rightModelId: string;
  hasFiles?: boolean;
  fileNames?: string[];
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
  sendComparisonMessage: (content: string, leftModelId: string | null, rightModelId: string | null, contextPrompt?: string) => Promise<void>;
  isProcessing: boolean;
  updateContextPrompt: (sessionId: string, prompt: string) => void;
  getContextPrompt: (sessionId: string) => string;
  updateExtractContent: (sessionId: string, content: string) => void;
  getExtractContent: (sessionId: string) => string;
  getComparisonMessages: (sessionId: string) => { leftMessages: Message[], rightMessages: Message[] };
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Default available models
const defaultModels: Model[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and efficient', tags: ['fast'] },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable', tags: ['advanced'] },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic model', tags: ['reasoning'] },
];

const LOCAL_STORAGE_KEY = {
  SESSIONS: 'chat-sessions',
  CONTEXT_PROMPTS: 'context-prompts',
  EXTRACT_CONTENTS: 'extract-contents',
  COMPARISON_MESSAGES: 'comparison-messages'
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [contextPrompts, setContextPrompts] = useState<Record<string, string>>({});
  const [extractContents, setExtractContents] = useState<Record<string, string>>({});
  const [comparisonMessages, setComparisonMessages] = useState<Record<string, ComparisonMessage[]>>({});
  const [availableModels] = useState<Model[]>(defaultModels);
  const [selectedModel, setSelectedModel] = useState<Model>(defaultModels[0]);
  const extractContentsCache: Record<string, string> = {};

  // Setup page refresh detection and clear history on refresh
  useEffect(() => {
    // Clear all history when component mounts - effectively clearing on refresh
    console.log('Clearing chat history on page load');
    localStorage.removeItem(LOCAL_STORAGE_KEY.SESSIONS);
    localStorage.removeItem(LOCAL_STORAGE_KEY.CONTEXT_PROMPTS);
    localStorage.removeItem(LOCAL_STORAGE_KEY.EXTRACT_CONTENTS);
    localStorage.removeItem(LOCAL_STORAGE_KEY.COMPARISON_MESSAGES);
    
    // Create a new session with proper comparison mode detection
    const isInComparisonMode = window.location.hash === '#comparison';
    const newSession: Session = {
      id: uuidv4(),
      name: isInComparisonMode ? `So sánh giữa ${new Date().toLocaleTimeString()}` : `Phiên chat mới`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isComparisonMode: isInComparisonMode
    };
    
    setSessions([newSession]);
    setCurrentSession(newSession);
    
  }, []); // Empty dependency array means this runs once on mount

  // Load data from localStorage on initial mount
  useEffect(() => {
    // Clear localStorage on page refresh (F5)
    if (performance.navigation && performance.navigation.type === 1) {
      // This is a page refresh
      console.log('Page was refreshed, clearing chat history');
      localStorage.removeItem(LOCAL_STORAGE_KEY.SESSIONS);
      localStorage.removeItem(LOCAL_STORAGE_KEY.CONTEXT_PROMPTS);
      localStorage.removeItem(LOCAL_STORAGE_KEY.EXTRACT_CONTENTS);
      localStorage.removeItem(LOCAL_STORAGE_KEY.COMPARISON_MESSAGES);
      return;
    }
    
    try {
      // Load sessions
      const savedSessions = localStorage.getItem(LOCAL_STORAGE_KEY.SESSIONS);
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSessions(parsedSessions);
        
        // Set current session to the most recently updated one
        if (parsedSessions.length > 0) {
          const mostRecent = parsedSessions.reduce((latest, session) => 
            new Date(session.updatedAt) > new Date(latest.updatedAt) ? session : latest
          );
          setCurrentSession(mostRecent);
        }
      }
      
      // Load context prompts
      const savedPrompts = localStorage.getItem(LOCAL_STORAGE_KEY.CONTEXT_PROMPTS);
      if (savedPrompts) {
        setContextPrompts(JSON.parse(savedPrompts));
      }
      
      // Load extract contents
      const savedContents = localStorage.getItem(LOCAL_STORAGE_KEY.EXTRACT_CONTENTS);
      if (savedContents) {
        const parsedContents = JSON.parse(savedContents);
        setExtractContents(parsedContents);
        // Also update cache
        Object.assign(extractContentsCache, parsedContents);
      }
      
      // Load comparison messages
      const savedComparisonMessages = localStorage.getItem(LOCAL_STORAGE_KEY.COMPARISON_MESSAGES);
      if (savedComparisonMessages) {
        const parsedMessages = JSON.parse(savedComparisonMessages);
        // Convert string dates back to Date objects
        Object.keys(parsedMessages).forEach(sessionId => {
          parsedMessages[sessionId] = parsedMessages[sessionId].map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        });
        setComparisonMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY.SESSIONS, JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (Object.keys(contextPrompts).length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY.CONTEXT_PROMPTS, JSON.stringify(contextPrompts));
    }
  }, [contextPrompts]);

  useEffect(() => {
    if (Object.keys(extractContents).length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY.EXTRACT_CONTENTS, JSON.stringify(extractContents));
    }
  }, [extractContents]);

  useEffect(() => {
    if (Object.keys(comparisonMessages).length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY.COMPARISON_MESSAGES, JSON.stringify(comparisonMessages));
    }
  }, [comparisonMessages]);

  const selectModel = useCallback((modelId: string) => {
    const model = availableModels.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
    }
  }, [availableModels]);

  const createNewSession = useCallback(() => {
    // Check if we're currently in comparison mode
    const isInComparisonMode = window.location.hash === '#comparison';
    
    const newSession: Session = {
      id: uuidv4(),
      name: isInComparisonMode ? `So sánh giữa ${new Date().toLocaleTimeString()}` : `Phiên chat mới`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isComparisonMode: isInComparisonMode
    };
    setSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession);
  }, []);

  const selectSession = useCallback((sessionId: string) => {
    const session = sessions.find(session => session.id === sessionId);
    if (session) {
      setCurrentSession(session);
      
      // Update URL hash based on session type
      if (session.isComparisonMode) {
        window.location.hash = 'comparison';
      } else {
        window.location.hash = '';
      }
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

  const updateExtractContent = useCallback((sessionId: string, content: string) => {
    console.log('Updating extract content for session:', sessionId, 'Content length:', content.length);
    
    if (!content || content.length === 0) {
      console.warn('Attempt to update extract content with empty string');
      return;
    }
    
    try {
      // Log extract content being added for debugging
      console.log('New content to add:', content.substring(0, 100) + '...');
      
      // Get current content directly from state to ensure latest value
      let existingContent = extractContents[sessionId] || '';
      
      // Also check cache as a backup
      if (!existingContent && extractContentsCache[sessionId]) {
        existingContent = extractContentsCache[sessionId];
        console.log('Retrieved existing content from cache instead of state');
      }
      
      console.log('Existing content length before update:', existingContent.length);
      
      // Create combined content - always append, never replace
      let combinedContent = content;
      if (existingContent) {
        combinedContent = existingContent + '\n\n---SESSION DOCUMENT SEPARATOR---\n\n' + content;
        console.log('Content combined. New length:', combinedContent.length);
      }
      
      // Update both state and cache atomically
      const updatedContent = combinedContent;
      
      // Update cache immediately for fast access
      extractContentsCache[sessionId] = updatedContent;
      console.log('Cache updated with new content, length:', updatedContent.length);
      
      // Also update state for persistence
      setExtractContents(prev => {
        const newState = {
          ...prev,
          [sessionId]: updatedContent
        };
        return newState;
      });
      
      console.log('Extract content successfully updated. New length:', updatedContent.length);
    } catch (error) {
      console.error('Error updating extract content:', error);
    }
  }, [extractContents]);

  const getExtractContent = useCallback((sessionId: string) => {
    try {
      // First try to get from cache for immediate access
      if (extractContentsCache[sessionId]) {
        const cachedContent = extractContentsCache[sessionId];
        console.log('Retrieved extract content from cache, length:', cachedContent.length);
        return cachedContent;
      }
      
      // Fall back to state if not in cache
      const content = extractContents[sessionId] || '';
      console.log('Retrieved extract content from state, length:', content.length);
      
      // Update cache if content found in state but not in cache
      if (content && !extractContentsCache[sessionId]) {
        extractContentsCache[sessionId] = content;
      }
      
      return content;
    } catch (error) {
      console.error('Error getting extract content:', error);
      return '';
    }
  }, [extractContents]);

  const getComparisonMessages = useCallback((sessionId: string) => {
    const msgs = comparisonMessages[sessionId] || [];
    
    // Create user messages and responses for left column
    const leftMessages: Message[] = [];
    // Create user messages and responses for right column
    const rightMessages: Message[] = [];
    
    // For each comparison message, add both user message and response
    msgs.forEach(msg => {
      // Add user message (if any model was targeted)
      if (msg.leftModelId || msg.rightModelId) {
        // Add user message to left column if left model was targeted
        if (msg.leftModelId) {
          leftMessages.push({
            id: `${msg.id}-user-left`,
            role: 'user',
            content: msg.userMessage,
            timestamp: msg.timestamp,
            hasFiles: msg.hasFiles,
            fileNames: msg.fileNames
          });
        }
        
        // Add user message to right column if right model was targeted
        if (msg.rightModelId) {
          rightMessages.push({
            id: `${msg.id}-user-right`,
            role: 'user',
            content: msg.userMessage,
            timestamp: msg.timestamp,
            hasFiles: msg.hasFiles,
            fileNames: msg.fileNames
          });
        }
      }
      
      // Add response for left model (if any)
      if (msg.leftModelId && msg.leftResponse) {
        leftMessages.push({
          id: `${msg.id}-left`,
          role: 'assistant',
          content: msg.leftResponse,
          timestamp: msg.timestamp,
          modelId: msg.leftModelId,
        });
      }
      
      // Add response for right model (if any)
      if (msg.rightModelId && msg.rightResponse) {
        rightMessages.push({
          id: `${msg.id}-right`,
          role: 'assistant',
          content: msg.rightResponse,
          timestamp: msg.timestamp,
          modelId: msg.rightModelId,
        });
      }
    });
    
    return { leftMessages, rightMessages };
  }, [comparisonMessages]);

  const sendComparisonMessage = useCallback(async (content: string, leftModelId: string | null, rightModelId: string | null, contextPrompt?: string) => {
    if (!currentSession) return;
    
    setIsProcessing(true);
    
    try {
      // Extract file information from content for display
      const filePattern = /\[File: ([^\]]+)\]/g;
      const fileMatches = [...content.matchAll(filePattern)];
      const hasFiles = fileMatches.length > 0;
      const fileNames = fileMatches.map(match => match[1]);
      
      // Create a clean version of the message without file markers for sending to the API
      const userMessageText = content.replace(/\[File: .*?\]/g, '').trim();
      
      // Prepare the message to send to the API
      // If the user message only contains file markers and no actual text input, we'll still
      // include a placeholder message with the file info
      const messageForLLM = userMessageText || (hasFiles ? `Tôi đã gửi ${fileNames.length} file: ${fileNames.join(', ')}` : content);
      
      const comparisonMessageId = uuidv4();
      const sessionId = currentSession.id; // Track session ID to ensure consistency
      const extractContent = getExtractContent(sessionId);
      
      // Debug logging to confirm content is available
      if (extractContent) {
        console.log(`[DEBUG] Extract content found for session ${sessionId.substring(0, 8)}...`);
        console.log(`[DEBUG] First 50 chars: ${extractContent.substring(0, 50)}...`);
        console.log(`[DEBUG] Extract content length: ${extractContent.length}`);
      } else {
        console.warn(`[WARN] No extract content available for session ${sessionId}`);
      }
      
      console.log('Sending comparison message to n8n webhook:', {
        message_text: messageForLLM,
        message_length: messageForLLM.length,
        has_files: hasFiles,
        file_count: fileNames.length,
        contextPrompt_length: contextPrompt ? contextPrompt.length : 0,
        extractContent_length: extractContent ? extractContent.length : 0,
        leftModelId,
        rightModelId,
        sessionId,
      });

      // Add a temporary user message for better UX while waiting for response
      const userMessage = {
        id: comparisonMessageId,
        userMessage: content,
        leftResponse: leftModelId ? '... processing ...' : '',
        rightResponse: rightModelId ? '... processing ...' : '',
        timestamp: new Date(),
        leftModelId: leftModelId || '',
        rightModelId: rightModelId || '',
        hasFiles,
        fileNames
      };
      
      // Immediately update state with temp message for better UX
      setComparisonMessages(prev => {
        const updatedMessages = {
          ...prev,
          [sessionId]: [...(prev[sessionId] || []), userMessage],
        };
        
        return updatedMessages;
      });

      let leftData = { output: '' };
      let rightData = { output: '' };
      
      // Only call the left model API if leftModelId is provided
      if (leftModelId) {
        // Prepare payload with extract content properly formatted
        const leftPayload = {
          message: messageForLLM,
          contextPrompt: contextPrompt || '',
          extractContent: extractContent || '',
          modelId: leftModelId,
          sessionId: sessionId,
          hasFiles: hasFiles,
          fileNames: fileNames
        };
        
        console.log('Sending left model request to n8n webhook...');
        console.log('Payload has message:', leftPayload.message ? 'Yes' : 'No');
        console.log('Payload has extractContent:', leftPayload.extractContent ? 'Yes' : 'No');
        
        // API call for left model
        const leftResponse = await fetch('https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(leftPayload),
        });
        
        if (!leftResponse.ok) {
          console.error('n8n webhook returned error status for left model:', leftResponse.status);
          const errorText = await leftResponse.text();
          console.error('Error response body:', errorText);
          throw new Error(`HTTP error for left model! status: ${leftResponse.status}`);
        }
        
        leftData = await leftResponse.json();
        console.log('Left model response received');
      }
      
      // Only call the right model API if rightModelId is provided
      if (rightModelId) {
        // Prepare payload with extract content properly formatted
        const rightPayload = {
          message: messageForLLM,
          contextPrompt: contextPrompt || '',
          extractContent: extractContent || '',
          modelId: rightModelId,
          sessionId: sessionId,
          hasFiles: hasFiles,
          fileNames: fileNames
        };
        
        console.log('Sending right model request to n8n webhook...');
        console.log('Payload has message:', rightPayload.message ? 'Yes' : 'No');
        console.log('Payload has extractContent:', rightPayload.extractContent ? 'Yes' : 'No');
        
        // API call for right model
        const rightResponse = await fetch('https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(rightPayload),
        });
        
        if (!rightResponse.ok) {
          console.error('n8n webhook returned error status for right model:', rightResponse.status);
          const errorText = await rightResponse.text();
          console.error('Error response body:', errorText);
          throw new Error(`HTTP error for right model! status: ${rightResponse.status}`);
        }
        
        rightData = await rightResponse.json();
        console.log('Right model response received');
      }
      
      const newComparisonMessage: ComparisonMessage = {
        id: comparisonMessageId,
        userMessage: content,
        leftResponse: leftModelId ? (leftData.output || 'Tôi xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.') : '',
        rightResponse: rightModelId ? (rightData.output || 'Tôi xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.') : '',
        timestamp: new Date(),
        leftModelId: leftModelId || '',
        rightModelId: rightModelId || '',
        hasFiles,
        fileNames
      };
      
      // Update message state with the final responses
      setComparisonMessages(prev => {
        const currentMessages = prev[sessionId] || [];
        // Replace the temporary message with the real response
        const updatedMessages = currentMessages.filter(msg => msg.id !== userMessage.id);
        
        const newState = {
          ...prev,
          [sessionId]: [...updatedMessages, newComparisonMessage],
        };
        
        return newState;
      });
      
    } catch (error) {
      console.error('Error sending comparison message:', error);
      
      // Just log the error, we don't have direct access to toast here
      // The UI component will show appropriate error messages
    } finally {
      setIsProcessing(false);
    }
  }, [currentSession, getExtractContent]);

  const sendMessage = useCallback(async (content: string, contextPrompt?: string) => {
    if (!currentSession) return;
    
    setIsProcessing(true);
    
    try {
      // Extract file information from content for display
      const filePattern = /\[File: ([^\]]+)\]/g;
      const fileMatches = [...content.matchAll(filePattern)];
      const hasFiles = fileMatches.length > 0;
      const fileNames = fileMatches.map(match => match[1]);
      
      // Create a clean version of the message without file markers for sending to the API
      // but only if there's actual user input besides the file markers
      const userMessageText = content.replace(/\[File: .*?\]/g, '').trim();
      
      // Create user message for display (keep file info)
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: content,
        timestamp: new Date(),
        hasFiles,
        fileNames
      };

      // Track the session ID to ensure we're updating the right session even if it changes during async operations
      const sessionId = currentSession.id;

      // Immediately update local state first, before API call
      setSessions(prevSessions => {
        // Find the current session with most recent data
        const sessionToUpdate = prevSessions.find(s => s.id === sessionId);
        if (!sessionToUpdate) return prevSessions;
        
        const updatedSession = { 
          ...sessionToUpdate,
          messages: [...sessionToUpdate.messages, userMessage],
          updatedAt: new Date()
        };
        
        // Also update the currentSession reference to force UI update
        if (currentSession && currentSession.id === sessionId) {
          setCurrentSession(updatedSession);
        }
        
        return prevSessions.map(session => 
          session.id === sessionId ? updatedSession : session
        );
      });

      // Get extracted content from session storage
      const extractContent = getExtractContent(sessionId);
      
      // Debug logging to confirm content is available
      if (extractContent) {
        console.log(`[DEBUG] Extract content found for session ${sessionId.substring(0, 8)}...`);
        console.log(`[DEBUG] First 50 chars: ${extractContent.substring(0, 50)}...`);
        console.log(`[DEBUG] Extract content length: ${extractContent.length}`);
      } else {
        console.warn(`[WARN] No extract content available for session ${sessionId}`);
      }

      // Prepare the message to send to the API
      // This is where we make sure both user message and extracted content are included
      // If the user message only contains file markers and no actual text input, we'll still
      // include a placeholder message with the file info to ensure the LLM knows files were uploaded
      const messageForLLM = userMessageText || (hasFiles ? `Tôi đã gửi ${fileNames.length} file: ${fileNames.join(', ')}` : content);

      console.log('Sending to n8n webhook:', {
        message_text: messageForLLM,
        message_length: messageForLLM.length,
        has_files: hasFiles,
        file_count: fileNames.length,
        contextPrompt_length: contextPrompt ? contextPrompt.length : 0,
        extractContent_length: extractContent ? extractContent.length : 0,
        modelId: selectedModel.id,
        sessionId: sessionId,
      });

      // Create a message payload for n8n
      // Important: Structure the message in a format expected by the n8n webhook
      const messageToSend = {
        message: messageForLLM,
        contextPrompt: contextPrompt || '',
        extractContent: extractContent || '',
        modelId: selectedModel.id,
        sessionId: sessionId,
        hasFiles: hasFiles,
        fileNames: fileNames
      };

      console.log('Sending request to n8n webhook...');
      console.log('Payload has message:', messageToSend.message ? 'Yes' : 'No');
      console.log('Payload has extractContent:', messageToSend.extractContent ? 'Yes' : 'No');
      
      // Send message and extractContent as separate fields to API
      const response = await fetch('https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(messageToSend),
      });

      if (!response.ok) {
        console.error('n8n webhook returned error status:', response.status);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
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

      // Get the current state of sessions to ensure we're working with latest data
      setSessions(prevSessions => {
        // Find the current session with updated messages
        const latestSession = prevSessions.find(s => s.id === sessionId);
        if (!latestSession) return prevSessions;
        
        // Create a new session with the assistant message added
        const updatedSession = {
          ...latestSession,
          messages: [...latestSession.messages, assistantMessage],
          updatedAt: new Date()
        };
        
        // Also update the currentSession reference to force UI update
        if (currentSession && currentSession.id === sessionId) {
          setCurrentSession(updatedSession);
        }
        
        return prevSessions.map(session => 
          session.id === sessionId ? updatedSession : session
        );
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.',
        timestamp: new Date(),
        modelId: 'error'
      };

      // Use functional state update to ensure we're working with latest state
      setSessions(prevSessions => {
        const latestSession = prevSessions.find(s => s.id === currentSession.id);
        if (!latestSession) return prevSessions;
        
        const updatedSession = {
          ...latestSession,
          messages: [...latestSession.messages, errorMessage],
          updatedAt: new Date()
        };
        
        // Also update the currentSession reference
        if (currentSession) {
          setCurrentSession(updatedSession);
        }
        
        return prevSessions.map(session => 
          session.id === currentSession.id ? updatedSession : session
        );
      });
    } finally {
      setIsProcessing(false);
    }
  }, [currentSession, selectedModel, getExtractContent]);

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
    updateExtractContent,
    getExtractContent,
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
