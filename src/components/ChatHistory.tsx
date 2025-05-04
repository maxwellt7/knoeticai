
import React from 'react';
import { MessageSquare, Clock } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 p-4">
        <MessageSquare className="h-10 w-10 mb-3 text-gray-500/50" />
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs mt-1 text-gray-500">Your chat history will appear here</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/5">
        <h2 className="font-medium text-white">Previous Conversations</h2>
      </div>
      
      <div className="flex space-x-2 px-4 py-3">
        <button 
          onClick={() => setActiveTab('recent')} 
          className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'recent' ? 'bg-[#2d2f3a] text-white' : 'text-gray-400 hover:text-gray-300'}`}
        >
          Recent
        </button>
        <button 
          onClick={() => setActiveTab('all')} 
          className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'all' ? 'bg-[#2d2f3a] text-white' : 'text-gray-400 hover:text-gray-300'}`}
        >
          All
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-none px-3">
        <div className="space-y-2 py-2">
          {conversations.map((conversation) => {
            // Format the time to be more readable
            const timestamp = new Date(conversation.timestamp);
            const timeAgo = getTimeAgo(timestamp);

            // Get first user message as preview
            const userMessage = conversation.messages.find(m => m.sender === 'user')?.text || '';
            const preview = userMessage.length > 40 ? `${userMessage.slice(0, 40)}...` : userMessage;

            return (
              <button
                key={conversation.id}
                className="w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-[#2d2f3a] border border-transparent hover:border-white/10"
                onClick={() => onSelect(conversation.id)}
              >
                <div className="flex items-center mb-2">
                  {conversation.type === 'personal' ? (
                    <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center mr-2">
                      <MessageSquare className="h-4 w-4 text-blue-400" />
                    </div>
                  ) : conversation.type === 'business' ? (
                    <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center mr-2">
                      <MessageSquare className="h-4 w-4 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center mr-2">
                      <MessageSquare className="h-4 w-4 text-purple-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-200 truncate">{conversation.title}</h3>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>
                {preview && (
                  <p className="text-xs text-gray-500 line-clamp-2 pl-10">
                    {preview}
                  </p>
                )}
              </button>
            );
          })}
        </div>
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

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
};

export default ChatHistory;
