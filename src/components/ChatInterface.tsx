
import React, { useRef, useEffect } from 'react';
import { User, ArrowLeft, Circle, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import ChatMessage from './ChatMessage';
import ChatHistory from './ChatHistory';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: string;
  stack?: string;
}

interface Conversation {
  id: string;
  title: string;
  type: 'personal' | 'business' | 'stack';
  stackId?: string;
  messages: Message[];
  timestamp: string;
}

interface ChatInterfaceProps {
  activeAssistant: 'personal' | 'business' | 'stack';
  messages: Message[];
  onSendMessage: (message: string) => void;
  onBackClick: () => void;
  isLoading: boolean;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  activeAssistant,
  messages,
  onSendMessage,
  onBackClick,
  isLoading,
  conversations,
  onSelectConversation
}) => {
  const [inputMessage, setInputMessage] = React.useState('');
  const [showHistory, setShowHistory] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAssistantTitle = () => {
    switch (activeAssistant) {
      case 'personal':
        return 'Knoetic Personal';
      case 'business':
        return 'Knoetic Business';
      case 'stack':
        return 'Knoetic Stack';
      default:
        return 'Knoetic';
    }
  };

  const getAssistantDescription = () => {
    switch (activeAssistant) {
      case 'personal':
        return 'Manage your personal data';
      case 'business':
        return 'Your professional helper';
      case 'stack':
        return 'Structured conversations';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with responsive design */}
      <div className="flex items-center px-4 py-3 bg-[#22242f] rounded-t-lg border-b border-white/5">
        <Button 
          onClick={onBackClick}
          variant="ghost" 
          size="icon"
          className="text-white mr-3"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="p-2 rounded-full bg-[#2d2f3a] text-white mr-3">
          <Circle className="h-5 w-5" fill="#9580ff" stroke="#9580ff" />
        </div>
        
        <div className="flex-1">
          <h2 className="font-medium text-white">{getAssistantTitle()}</h2>
          <p className="text-xs text-gray-400">{getAssistantDescription()}</p>
        </div>
        
        {/* Toggle history button on mobile */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden text-gray-300"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'Hide History' : 'History'}
        </Button>
        
        <div className="hidden md:flex items-center">
          <Circle className="h-2 w-2 text-purple-500 mr-2" fill="#9580ff" />
          <span className="text-sm text-gray-300">Connected</span>
        </div>
      </div>

      {/* Main content area with responsive layout */}
      <div className="flex flex-1 h-0 overflow-hidden">
        {/* Chat history sidebar - hidden on mobile by default */}
        <div className={`${showHistory ? 'absolute inset-0 z-10 bg-[#191b24] p-4' : 'hidden'} md:static md:block md:w-72 lg:w-80 bg-[#22242f] border-r border-white/5`}>
          <div className="h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-2 md:hidden">
              <h3 className="font-medium text-white">Chat History</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white" 
                onClick={() => setShowHistory(false)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ChatHistory 
                conversations={conversations}
                onSelect={(id) => {
                  onSelectConversation(id);
                  setShowHistory(false);
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
                <p className="text-lg mb-2 text-white">Get started</p>
                <p className="text-sm max-w-md text-center text-gray-400">
                  {activeAssistant === 'personal' 
                    ? "Chat with your personal assistant to get insights about your habits, health, and personal data." 
                    : activeAssistant === 'business'
                      ? "Chat with your business assistant to track projects, tasks, and get updates on your business metrics."
                      : "Use structured conversations to reflect and gain insights through guided questions."}
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  id={message.id}
                  text={message.text}
                  sender={message.sender}
                  timestamp={message.timestamp}
                  stack={message.stack}
                />
              ))
            )}
            
            {isLoading && (
              <div className="flex items-start">
                <div className="thinking-bubble text-gray-300 text-sm flex items-center">
                  <Circle className="h-3 w-3 mr-1 animate-pulse" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Time badge */}
          {messages.length > 0 && (
            <div className="flex justify-center mx-4 my-2">
              <div className="time-badge text-xs bg-[#2d2f3a] px-3 py-1 rounded-full">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}
          
          {/* Input area */}
          <div className="p-4 border-t border-white/5 bg-[#22242f]">
            <form onSubmit={handleSendMessage} className="relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Message ${getAssistantTitle().toLowerCase()}...`}
                className="chat-input pr-12 bg-[#191b24] border-white/10"
              />
              <Button 
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-purple-600 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-purple-700"
                disabled={!inputMessage.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
