
import React, { useState } from 'react';
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

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const activeStackOption = activeStack ? stackOptions.find(s => s.id === activeStack) : null;

  return (
    <div className="border-t p-4 bg-white">
      <div className="flex space-x-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Message ${activeTab === 'personal' ? 'personal' : 'business'} agent...`}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={inputMessage.trim() === '' || isLoading}
        >
          Send
        </Button>
      </div>
      {activeStack && activeStackOption && (
        <div className="mt-2 flex items-center text-sm text-gray-600">
          <div className={`h-2 w-2 rounded-full mr-2 ${activeStackOption.color}`}></div>
          <span>Active stack: {activeStackOption.name}</span>
          <button 
            onClick={onExitStack}
            className="ml-2 text-xs text-red-500 hover:underline"
          >
            Exit Stack
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
