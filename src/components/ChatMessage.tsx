
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

type StackOption = {
  id: string;
  name: string;
  color: string;
  icon: JSX.Element;
};

interface ChatMessageProps {
  id: number;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: string;
  stack?: string;
  stackOptions?: StackOption[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  text,
  sender,
  timestamp,
  stack,
  stackOptions,
}) => {
  const stackOption = stack && stackOptions ? stackOptions.find(s => s.id === stack) : undefined;
  
  return (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3/4 rounded-lg px-4 py-2 ${
          sender === 'user'
            ? 'bg-blue-600 text-white'
            : sender === 'system'
              ? 'bg-gray-200 text-gray-800'
              : stack && stackOption
                ? `${stackOption.color} bg-opacity-20 text-gray-800`
                : 'bg-white border text-gray-800'
        }`}
      >
        {sender === 'bot' && stack && stackOption && (
          <div className="flex items-center mb-1">
            {stackOption.icon}
            <span className="ml-1 text-xs font-medium">
              {stackOption.name} Reflection
            </span>
          </div>
        )}
        <p>{text}</p>
        <div className="text-xs mt-1 opacity-60 text-right">
          {timestamp}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
