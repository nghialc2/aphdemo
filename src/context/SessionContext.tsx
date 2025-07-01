import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and efficient', tags: ['OpenAI', 'fast'] },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', description: 'Enhanced version', tags: ['OpenAI', 'fast'] },
  { id: 'gpt-o3-mini', name: 'GPT-o3 Mini', description: 'Latest OpenAI model', tags: ['OpenAI', 'advanced'] },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fast Google model', tags: ['Google', 'fast'] },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Enhanced Google model', tags: ['Google', 'fast'] },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most capable Google model', tags: ['Google', 'advanced'] },
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', description: 'Latest Anthropic model', tags: ['Anthropic', 'reasoning'] },
  { id: 'deepseek-reasoner', name: 'Deepseek Reasoner', description: 'Advanced reasoning model', tags: ['Deepseek', 'reasoning'] },
];

// Model webhook URL mapping
const modelWebhookUrls: Record<string, string> = {
  'gpt-4o-mini': 'https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba',
  'gpt-4.1-mini': 'https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba1',
  'gpt-o3-mini': 'https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba2',
  'gemini-2.0-flash': 'https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba3',
  'gemini-2.5-flash': 'https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba4',
  'gemini-2.5-pro': 'https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba5',
  'claude-sonnet-4': 'https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba6',
  'deepseek-reasoner': 'https://n8n.srv798777.hstgr.cloud/webhook/91d2a13d-40e7-4264-b06c-480e08e5b2ba7',
};

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
  
  // Use useRef for cache to prevent memory leaks and enable cleanup
  const extractContentsCache = useRef<Record<string, string>>({});
  
  // Cleanup cache periodically to prevent memory leaks
  useEffect(() => {
    const cleanup = () => {
      const cacheKeys = Object.keys(extractContentsCache.current);
      if (cacheKeys.length > 50) { // Keep only recent 50 items
        console.log('Cleaning up extract contents cache, had', cacheKeys.length, 'items');
        const sortedKeys = cacheKeys.sort();
        const toRemove = sortedKeys.slice(0, cacheKeys.length - 50);
        toRemove.forEach(key => delete extractContentsCache.current[key]);
        console.log('Cache cleaned, now has', Object.keys(extractContentsCache.current).length, 'items');
      }
    };
    
    const interval = setInterval(cleanup, 5 * 60 * 1000); // Cleanup every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Cleanup old chat sessions and files (older than 7 days)
  useEffect(() => {
    const cleanupOldSessions = async () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      setSessions(prevSessions => {
        const filteredSessions = prevSessions.filter(session => {
          const sessionDate = new Date(session.updatedAt);
          return sessionDate > sevenDaysAgo;
        });
        
        if (filteredSessions.length !== prevSessions.length) {
          const deletedCount = prevSessions.length - filteredSessions.length;
          console.log(`Cleaned up ${deletedCount} old chat sessions (older than 7 days)`);
          
          // Also clean up related data for deleted sessions
          const remainingSessionIds = new Set(filteredSessions.map(s => s.id));
          
          setContextPrompts(prev => {
            const cleaned = Object.keys(prev).reduce((acc, sessionId) => {
              if (remainingSessionIds.has(sessionId)) {
                acc[sessionId] = prev[sessionId];
              }
              return acc;
            }, {} as Record<string, string>);
            return cleaned;
          });
          
          setExtractContents(prev => {
            const cleaned = Object.keys(prev).reduce((acc, sessionId) => {
              if (remainingSessionIds.has(sessionId)) {
                acc[sessionId] = prev[sessionId];
              }
              return acc;
            }, {} as Record<string, string>);
            
            // Also clean cache
            Object.keys(extractContentsCache.current).forEach(sessionId => {
              if (!remainingSessionIds.has(sessionId)) {
                delete extractContentsCache.current[sessionId];
              }
            });
            
            return cleaned;
          });
          
          setComparisonMessages(prev => {
            const cleaned = Object.keys(prev).reduce((acc, sessionId) => {
              if (remainingSessionIds.has(sessionId)) {
                acc[sessionId] = prev[sessionId];
              }
              return acc;
            }, {} as Record<string, ComparisonMessage[]>);
            return cleaned;
          });
          
          // If current session was deleted, create a new one
          if (currentSession && !remainingSessionIds.has(currentSession.id)) {
            console.log('Current session was deleted, creating new session');
            const isInComparisonMode = window.location.hash === '#comparison';
            const newSession: Session = {
              id: uuidv4(),
              name: isInComparisonMode ? 'So sánh giữa các mô hình' : 'Cuộc trò chuyện mới',
              messages: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              isComparisonMode: isInComparisonMode
            };
            filteredSessions.push(newSession);
            setCurrentSession(newSession);
          }
        }
        
        return filteredSessions;
      });

      // Also cleanup old uploaded files
      try {
        const { githubUploadService } = await import('@/services/githubUpload');
        const result = await githubUploadService.cleanupOldFiles();
        if (result.deleted > 0) {
          console.log(`Cleaned up ${result.deleted} old uploaded files`);
        }
        if (result.errors.length > 0) {
          console.warn('File cleanup errors:', result.errors);
        }
      } catch (error) {
        console.error('Failed to cleanup old files:', error);
      }
    };
    
    // Run cleanup on mount and then every hour
    cleanupOldSessions();
    const interval = setInterval(cleanupOldSessions, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentSession]);

  // Load existing data from localStorage on mount (preserve chat history)
  useEffect(() => {
    console.log('Loading chat history from localStorage');
    
    // Load existing sessions
    const savedSessions = localStorage.getItem(LOCAL_STORAGE_KEY.SESSIONS);
    const savedContextPrompts = localStorage.getItem(LOCAL_STORAGE_KEY.CONTEXT_PROMPTS);
    const savedExtractContents = localStorage.getItem(LOCAL_STORAGE_KEY.EXTRACT_CONTENTS);
    const savedComparisonMessages = localStorage.getItem(LOCAL_STORAGE_KEY.COMPARISON_MESSAGES);
    
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        // Convert date strings back to Date objects
        const sessionsWithDates = parsedSessions.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        
        setSessions(sessionsWithDates);
        
        // Set the most recent session as current
        if (sessionsWithDates.length > 0) {
          const mostRecent = sessionsWithDates.sort((a: Session, b: Session) => 
            b.updatedAt.getTime() - a.updatedAt.getTime()
          )[0];
          setCurrentSession(mostRecent);
        }
        
        console.log('Loaded', sessionsWithDates.length, 'sessions from localStorage');
      } catch (error) {
        console.error('Error parsing saved sessions:', error);
      }
    }
    
    // Load other saved data
    if (savedContextPrompts) {
      try {
        setContextPrompts(JSON.parse(savedContextPrompts));
      } catch (error) {
        console.error('Error parsing context prompts:', error);
      }
    }
    
    if (savedExtractContents) {
      try {
        setExtractContents(JSON.parse(savedExtractContents));
      } catch (error) {
        console.error('Error parsing extract contents:', error);
      }
    }
    
    if (savedComparisonMessages) {
      try {
        const parsed = JSON.parse(savedComparisonMessages);
        // Convert timestamps back to Date objects
        const withDates = Object.keys(parsed).reduce((acc, key) => {
          acc[key] = parsed[key].map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          return acc;
        }, {} as Record<string, ComparisonMessage[]>);
        setComparisonMessages(withDates);
      } catch (error) {
        console.error('Error parsing comparison messages:', error);
      }
    }
    
    // If no sessions exist, create a new one
    if (!savedSessions || !JSON.parse(savedSessions).length) {
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
      console.log('Created new session since none existed');
    }
    
  }, []); // Empty dependency array means this runs once on mount


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
    try {
      // Check if we're currently in comparison mode
      const isInComparisonMode = window.location.hash === '#comparison';
      
      // Generate a temporary session name (will be updated when first message is sent)
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      const sessionName = isInComparisonMode 
        ? `Cuộc trò chuyện ${timeStr}` 
        : `Cuộc trò chuyện ${timeStr}`;
      
      const newSession: Session = {
        id: uuidv4(),
        name: sessionName,
        messages: [],
        createdAt: now,
        updatedAt: now,
        isComparisonMode: isInComparisonMode
      };
      
      console.log('Creating new session:', newSession.name);
      
      // Update sessions state safely
      setSessions(prev => {
        const newSessions = [...prev, newSession];
        console.log('Updated sessions count:', newSessions.length);
        return newSessions;
      });
      
      // Set as current session
      setCurrentSession(newSession);
      
    } catch (error) {
      console.error('Error creating new session:', error);
      // Fallback: create a simple session
      const fallbackSession: Session = {
        id: uuidv4(),
        name: 'Cuộc trò chuyện mới',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isComparisonMode: false
      };
      setSessions(prev => [...prev, fallbackSession]);
      setCurrentSession(fallbackSession);
    }
  }, []);

  // Function to generate a session name from message content
  const generateSessionName = useCallback((messageContent: string, isComparison: boolean = false) => {
    if (!messageContent || messageContent.trim().length === 0) {
      return isComparison ? 'Cuộc trò chuyện so sánh' : 'Cuộc trò chuyện mới';
    }
    
    // Clean and truncate the message
    const cleaned = messageContent
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\sÀ-ỹ]/g, '') // Keep only letters, numbers, spaces, and Vietnamese characters
      .slice(0, 40); // Limit to 40 characters
    
    // Add ellipsis if truncated
    const finalName = cleaned.length === 40 && messageContent.length > 40 
      ? cleaned + '...' 
      : cleaned;
    
    return finalName || (isComparison ? 'Cuộc trò chuyện so sánh' : 'Cuộc trò chuyện mới');
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
      if (!existingContent && extractContentsCache.current[sessionId]) {
        existingContent = extractContentsCache.current[sessionId];
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
      extractContentsCache.current[sessionId] = updatedContent;
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
      if (extractContentsCache.current[sessionId]) {
        const cachedContent = extractContentsCache.current[sessionId];
        console.log('Retrieved extract content from cache, length:', cachedContent.length);
        return cachedContent;
      }
      
      // Fall back to state if not in cache
      const content = extractContents[sessionId] || '';
      console.log('Retrieved extract content from state, length:', content.length);
      
      // Update cache if content found in state but not in cache
      if (content && !extractContentsCache.current[sessionId]) {
        extractContentsCache.current[sessionId] = content;
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
        leftResponse: leftModelId ? 'Đang xử lý...' : '',
        rightResponse: rightModelId ? 'Đang xử lý...' : '',
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
        const leftWebhookUrl = modelWebhookUrls[leftModelId] || modelWebhookUrls['gpt-4o-mini'];
        const leftResponse = await fetch(leftWebhookUrl, {
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
        const rightWebhookUrl = modelWebhookUrls[rightModelId] || modelWebhookUrls['gpt-4o-mini'];
        const rightResponse = await fetch(rightWebhookUrl, {
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
      
      // Update session name if this is the first comparison message
      setSessions(prevSessions => {
        const sessionToUpdate = prevSessions.find(s => s.id === sessionId);
        if (!sessionToUpdate) return prevSessions;
        
        const existingMessages = comparisonMessages[sessionId] || [];
        const isFirstMessage = existingMessages.length === 0;
        
        if (isFirstMessage) {
          const sessionName = generateSessionName(userMessageText || content, true);
          const updatedSession = { 
            ...sessionToUpdate,
            name: sessionName,
            updatedAt: new Date()
          };
          
          // Also update the currentSession reference
          if (currentSession && currentSession.id === sessionId) {
            setCurrentSession(updatedSession);
          }
          
          return prevSessions.map(session => 
            session.id === sessionId ? updatedSession : session
          );
        }
        
        return prevSessions;
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
        
        // Update session name if this is the first message
        const isFirstMessage = sessionToUpdate.messages.length === 0;
        const sessionName = isFirstMessage 
          ? generateSessionName(userMessageText || content, sessionToUpdate.isComparisonMode)
          : sessionToUpdate.name;
        
        const updatedSession = { 
          ...sessionToUpdate,
          name: sessionName,
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
      const webhookUrl = modelWebhookUrls[selectedModel.id] || modelWebhookUrls['gpt-4o-mini'];
      const response = await fetch(webhookUrl, {
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
