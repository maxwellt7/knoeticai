
import React from 'react';
import { MessageSquare, ClipboardList, Clock } from 'lucide-react';
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
  // Tabs state
  const [activeTab, setActiveTab] = React.useState<'recent' | 'all'>('recent');
  
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-400 p-4 bg-[#22242f] rounded-lg glass-morphism">
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs mt-1">Your chat history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="p-4 border-b border-white/5">
        <h2 className="font-medium text-white">Previous Conversations</h2>
      </div>
      
      <div className="flex space-x-2 px-4 mb-4">
        <button 
          onClick={() => setActiveTab('recent')} 
          className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'recent' ? 'bg-[#2d2f3a] text-white' : 'text-gray-400'}`}
        >
          Recent
        </button>
        <button 
          onClick={() => setActiveTab('all')} 
          className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'all' ? 'bg-[#2d2f3a] text-white' : 'text-gray-400'}`}
        >
          All
        </button>
      </div>
      
      <div className="space-y-2 px-4">
        {conversations.map((conversation) => {
          // Get the message count
          const messageCount = conversation.messages.length;
          
          // Format the time to be more readable
          const timestamp = new Date(conversation.timestamp);
          const timeAgo = getTimeAgo(timestamp);

          return (
            <button
              key={conversation.id}
              className="w-full text-left py-3 rounded-lg transition-all duration-200 hover:bg-[#2d2f3a] group"
              onClick={() => onSelect(conversation.id)}
            >
              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-200 truncate">get started</h3>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{timeAgo}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
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

  if (diffMin < 1) return 'less than a minute ago';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
};

export default ChatHistory;
