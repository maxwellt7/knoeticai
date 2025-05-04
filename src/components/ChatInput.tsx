
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  activeTab: string;
  activeStack: string | null;
  stackOptions: {
    id: string;
    name: string;
    color: string;
    icon: JSX.Element;
  }[];
  onExitStack: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  activeTab,
  activeStack,
  stackOptions,
  onExitStack,
}) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputMessage.trim() === '') return;
    
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const activeStackOption = activeStack ? stackOptions.find(s => s.id === activeStack) : null;

  return (
    <div className="p-4">
      <form onSubmit={handleSendMessage} className="relative">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Message ${activeTab === 'personal' ? 'personal' : 'business'} agent...`}
          className="chat-input pr-12"
        />
        <Button
          type="submit" 
          disabled={inputMessage.trim() === '' || isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-purple-600 text-white rounded-full h-8 w-8 flex items-center justify-center"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      
      {activeStack && activeStackOption && (
        <div className="mt-2 flex items-center text-sm text-gray-400">
          <div className={`h-2 w-2 rounded-full mr-2 bg-purple-500`}></div>
          <span>Active stack: {activeStackOption.name}</span>
          <button 
            onClick={onExitStack}
            className="ml-2 text-xs text-red-400 hover:underline"
          >
            Exit Stack
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
