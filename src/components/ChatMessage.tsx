import React from 'react';
import { stackIcons } from './ChatIcons';

interface ChatMessageProps {
  id: number;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: string;
  stack?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = (props) => {
  const { text, sender, timestamp, stack } = props;
  
  console.log('Rendering ChatMessage:', text.substring(0, 20) + '...', sender);
  
  const getStackIcon = () => {
    if (stack && stack in stackIcons) {
      const IconComponent = stackIcons[stack];
      return <IconComponent className="h-5 w-5 text-white" />;
    }
    return null;
  };
  
  const getStackName = () => {
    switch(stack) {
      case 'reflection': return 'Reflection';
      case 'gratitude': return 'Gratitude';
      case 'goals': return 'Goals';
      case 'creativity': return 'Creativity';
      case 'journal': return 'Journal';
      case 'relationships': return 'Relationships';
      case 'idea': return 'Idea';
      default: return stack;
    }
  };
  
  return (
    <div className={`flex mb-4 ${sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
         style={{border: '1px solid rgba(255,255,255,0.1)', padding: '4px', borderRadius: '4px'}}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-lg px-4 py-3 shadow-md ${
          sender === 'user'
            ? 'bg-purple-600 text-white rounded-tr-none'
            : sender === 'system'
              ? 'bg-[#2d2f3a] text-gray-200 rounded-tl-none'
              : 'bg-[#2d2f3a] text-gray-200 rounded-tl-none'
        }`}
      >
        {sender === 'bot' && stack && (
          <div className="flex items-center mb-2 pb-2 border-b border-gray-600/30">
            <div className="mr-2">{getStackIcon()}</div>
            <span className="text-xs font-medium">
              {getStackName()} Assistant
            </span>
          </div>
        )}
        <p className="text-sm md:text-base whitespace-pre-wrap">{text}</p>
        <div className="text-xs mt-2 opacity-60 text-right">
          {timestamp}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
