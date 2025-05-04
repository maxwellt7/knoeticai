
import React from 'react';
import { MessageSquare, ClipboardList } from 'lucide-react';
import { stackIcons } from './ChatIcons';

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
  onSelect: (id: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ conversations, onSelect }) => {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-400 p-4 bg-zinc-900 rounded-md bg-opacity-50 backdrop-blur-sm">
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs mt-1">Your chat history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        // Get the right icon based on conversation type
        let icon;
        if (conversation.type === 'stack' && conversation.stackId) {
          const IconComponent = stackIcons[conversation.stackId] || MessageSquare;
          icon = <IconComponent className="h-5 w-5" />;
        } else if (conversation.type === 'business') {
          icon = <ClipboardList className="h-5 w-5" />;
        } else {
          icon = <MessageSquare className="h-5 w-5" />;
        }

        // Format the time to be more readable
        const timestamp = new Date(conversation.timestamp);
        const timeAgo = getTimeAgo(timestamp);

        // Get message count
        const messageCount = conversation.messages.length;

        // Determine the glow color based on conversation type
        const glowColor = conversation.type === 'stack' ? 
          'group-hover:shadow-[0_0_10px_rgba(79,209,197,0.5)]' : 
          conversation.type === 'business' ? 
            'group-hover:shadow-[0_0_10px_rgba(150,230,161,0.5)]' : 
            'group-hover:shadow-[0_0_10px_rgba(191,143,255,0.5)]';

        // Determine the background and accent colors based on conversation type
        const bgColor = 'bg-zinc-900 bg-opacity-60 group-hover:bg-zinc-800';
        const iconBgColor = conversation.type === 'stack' ? 
          'bg-cyan-950 text-cyan-400' : 
          conversation.type === 'business' ? 
            'bg-green-950 text-green-400' : 
            'bg-purple-950 text-purple-400';
        
        return (
          <button
            key={conversation.id}
            className={`w-full text-left px-4 py-3 rounded-md transition-all duration-300 group ${bgColor} ${glowColor} backdrop-blur-sm border border-gray-800 group-hover:border-gray-700`}
            onClick={() => onSelect(conversation.id)}
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-md mr-3 ${iconBgColor}`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-200 truncate">{conversation.title}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {messageCount} {messageCount === 1 ? 'message' : 'messages'} · {timeAgo}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Helper function to get formatted time ago
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

export default ChatHistory;
