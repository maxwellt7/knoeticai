import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History } from 'lucide-react';
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

interface ChatHistoryProps {
  conversations: Conversation[];
  onSelectConversation: (conversationId: string) => void;
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  activeTab?: string;
  activeStack?: string | null;
  stackOptions?: any[];
  onExitStack?: () => void;
}

interface ChatInterfaceProps {
  activeAssistant: 'personal' | 'business' | 'stack';
  messages: Message[];
  onSendMessage: (message: string) => void;
  onBackClick: () => void;
  isLoading: boolean;
  conversations: Conversation[];
  onSelectConversation: (conversationId: string) => void;
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
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Debug log messages
    console.log('ChatInterface rendering with messages:', messages);
  }, [messages]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBackClick}
          className="text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-medium text-white ml-2">
          {activeAssistant === 'personal' 
            ? 'Personal Assistant' 
            : activeAssistant === 'business' 
              ? 'Business Assistant' 
              : 'Stack Assistant'
          }
        </h2>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(!showHistory)}
            className="text-white"
          >
            <History className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {showHistory && (
          <div className="w-64 mr-4 border-r border-zinc-800 overflow-y-auto">
            <ChatHistory 
              conversations={conversations}
              onSelectConversation={onSelectConversation}
            />
          </div>
        )}
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div 
            className="flex-1 overflow-y-auto pr-1 mb-4 space-y-4 relative"
            style={{
              minHeight: "300px", 
              background: "rgba(25, 27, 36, 0.5)",
              padding: "20px",
              borderRadius: "8px"
            }}
          >
            {messages.length > 0 ? (
              <>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    {...message}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Type a message to start a conversation</p>
              </div>
            )}
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
          
          <ChatInput
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            activeTab={activeAssistant}
            activeStack={null}
            onExitStack={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
