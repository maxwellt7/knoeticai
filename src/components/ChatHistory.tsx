
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
      <div className="flex flex-col items-center justify-center h-32 text-gray-500 p-4">
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs mt-1">Your chat history will appear here</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
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

        return (
          <button
            key={conversation.id}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
            onClick={() => onSelect(conversation.id)}
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-md mr-3 ${conversation.type === 'stack' ? 'bg-blue-100 text-blue-600' : conversation.type === 'business' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{conversation.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
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
