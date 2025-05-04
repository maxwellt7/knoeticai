
import React from 'react';

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
    <div className={`flex mb-4 ${sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-lg px-4 py-3 shadow-md ${
          sender === 'user'
            ? 'bg-purple-600 text-white rounded-tr-none'
            : sender === 'system'
              ? 'bg-[#2d2f3a] text-gray-200 rounded-tl-none'
              : stack && stackOption
                ? `bg-[#2d2f3a] text-gray-200 rounded-tl-none`
                : 'bg-[#2d2f3a] text-gray-200 rounded-tl-none'
        }`}
      >
        {sender === 'bot' && stack && stackOption && (
          <div className="flex items-center mb-2 pb-2 border-b border-gray-600/30">
            <div className="mr-2">{stackOption.icon}</div>
            <span className="text-xs font-medium">
              {stackOption.name} Reflection
            </span>
          </div>
        )}
        <p className="text-sm md:text-base">{text}</p>
        <div className="text-xs mt-2 opacity-60 text-right">
          {timestamp}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
