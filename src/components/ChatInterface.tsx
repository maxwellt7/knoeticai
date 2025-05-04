
import React from 'react';
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
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const getAssistantTitle = () => {
    switch (activeAssistant) {
      case 'personal':
        return 'Personal Assistant';
      case 'business':
        return 'Business Assistant';
      case 'stack':
        return 'Stack Assistant';
      default:
        return 'Assistant';
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
    <div className="flex flex-col space-y-4 h-full">
      {/* Header */}
      <div className="chat-container flex items-center">
        <Button 
          onClick={onBackClick}
          variant="ghost" 
          size="icon"
          className="text-white mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="p-2 rounded-full bg-[#2d2f3a] text-white mr-3">
          <User className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <h2 className="font-medium text-white">{getAssistantTitle()}</h2>
          <p className="text-xs text-gray-400">{getAssistantDescription()}</p>
        </div>
        
        <div className="flex items-center">
          <Circle className="h-2 w-2 text-purple-500 mr-2" fill="#9580ff" />
          <span className="text-sm text-gray-300">Connected</span>
        </div>
      </div>

      {/* Chat history sidebar */}
      <div className="flex flex-1 h-0">
        <div className="hidden md:block w-72 bg-[#22242f] rounded-lg overflow-hidden">
          <ChatHistory 
            conversations={conversations}
            onSelect={onSelectConversation}
          />
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col ml-0 md:ml-4 chat-container">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <p className="text-lg mb-1 text-white">get started</p>
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
                <div className="thinking-bubble text-gray-300">
                  <Circle className="h-3 w-3 mr-1 animate-pulse" />
                  Thinking...
                </div>
              </div>
            )}
          </div>
          
          {/* Time badge */}
          {messages.length > 0 && (
            <div className="flex justify-end mx-4 my-2">
              <div className="time-badge">
                01:50 PM
              </div>
            </div>
          )}
          
          {/* Input area */}
          <div className="p-4">
            <form onSubmit={handleSendMessage} className="relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Message ${getAssistantTitle().toLowerCase()}...`}
                className="chat-input pr-12"
              />
              <Button 
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-purple-600 text-white rounded-full h-8 w-8 flex items-center justify-center"
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
