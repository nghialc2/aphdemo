import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Send, X, Minimize2, Maximize2, Bot, User } from 'lucide-react';
import OpenAI from 'openai';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  className?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '👋 Hello! I\'m your AI assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const openai = useRef<OpenAI | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      openai.current = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !openai.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await openai.current.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for the FPT Software application. You can help users with general questions about the platform, provide guidance, and assist with various tasks. Keep your responses concise and helpful.',
          },
          ...messages.slice(-5).map(msg => ({
            role: msg.isUser ? 'user' as const : 'assistant' as const,
            content: msg.content,
          })),
          {
            role: 'user',
            content: inputValue,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble connecting to the AI service. Please try again later.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setIsOpen(true)}
            className={`fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-to-br from-[#1EAEDB] to-blue-600 hover:from-[#1EAEDB]/90 hover:to-blue-600/90 text-white shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 z-50 transform hover:scale-110 ${className}`}
            size="icon"
          >
            <Bot className="h-7 w-7" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Chat with AI Assistant</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 w-96 shadow-2xl border-0 bg-white/95 backdrop-blur-lg z-50 transition-all duration-300 rounded-2xl overflow-hidden ${
        isMinimized ? 'h-16' : 'h-[500px]'
      } ${className}`}
    >
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1EAEDB] to-blue-600 text-white">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-white/80">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 p-0 text-white hover:bg-white/20"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(500px-4rem)]">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!message.isUser && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1EAEDB] to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 text-sm shadow-sm ${
                      message.isUser
                        ? 'bg-gradient-to-br from-[#1EAEDB] to-blue-600 text-white rounded-2xl rounded-br-md'
                        : 'bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-200'
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.isUser && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2 justify-start">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1EAEDB] to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white text-gray-800 p-3 rounded-2xl rounded-bl-md text-sm shadow-sm border border-gray-200">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#1EAEDB] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#1EAEDB] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-[#1EAEDB] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-gray-50/50">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 border-2 border-gray-200 focus:border-[#1EAEDB] rounded-xl"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="bg-gradient-to-br from-[#1EAEDB] to-blue-600 hover:from-[#1EAEDB]/90 hover:to-blue-600/90 rounded-xl shadow-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default Chatbot;