import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Database, 
  ClipboardList, 
  ThumbsUp, 
  Heart, 
  Zap, 
  Flame, 
  Lightbulb, 
  Compass, 
  FlaskConical, 
  TrendingUp, 
  Lock, 
  Settings, 
  User, 
  LogOut, 
  Key,
  History
} from 'lucide-react';
import ChatMessage from './ChatMessage';
import DataSourceItem from './DataSourceItem';
import ApiKeysModal from './ApiKeysModal';
import LoginScreen from './LoginScreen';
import ChatInput from './ChatInput';
import StackOptions from './StackOptions';
import ChatHistory from './ChatHistory';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Types
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: string;
  stack?: string;
}

interface StackOption {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface Conversation {
  id: string;
  title: string;
  type: 'personal' | 'business' | 'stack';
  stackId?: string;
  messages: Message[];
  timestamp: string;
}

interface UserApiKeys {
  notion_api_key: string | null;
  clickup_api_key: string | null;
}

const ChatApp: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState('personal');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStackMode, setIsStackMode] = useState(false);
  const [activeStack, setActiveStack] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [apiKeys, setApiKeys] = useState({
    claude: '',
    openai: '',
    grok: '',
    openrouter: ''
  });
  const [isConnected, setIsConnected] = useState({
    supabase: false,
    notion: false,
    clickup: false
  });
  // New state for conversation history
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Stack options and questions
  const stackOptions: StackOption[] = [
    { id: 'happy', name: 'Happy', icon: <ThumbsUp className="h-5 w-5" />, color: 'bg-yellow-500' },
    { id: 'gratitude', name: 'Gratitude', icon: <Heart className="h-5 w-5" />, color: 'bg-pink-500' },
    { id: 'abundance', name: 'Abundance', icon: <Zap className="h-5 w-5" />, color: 'bg-purple-500' },
    { id: 'anger', name: 'Anger', icon: <Flame className="h-5 w-5" />, color: 'bg-red-500' },
    { id: 'idea', name: 'Idea', icon: <Lightbulb className="h-5 w-5" />, color: 'bg-blue-500' },
    { id: 'discover', name: 'Discover', icon: <Compass className="h-5 w-5" />, color: 'bg-green-500' },
    { id: 'testing', name: 'Testing', icon: <FlaskConical className="h-5 w-5" />, color: 'bg-orange-500' },
    { id: 'improvement', name: 'Improvement', icon: <TrendingUp className="h-5 w-5" />, color: 'bg-indigo-500' }
  ];

  const stackQuestions: Record<string, string[]> = {
    happy: [
      "What made you smile today?",
      "What's one positive thing that happened recently?",
      "How can you spread happiness to someone else today?"
    ],
    gratitude: [
      "What are three things you're grateful for right now?",
      "Who has helped you recently that you appreciate?",
      "What's something in your environment you're thankful for?"
    ],
    abundance: [
      "What resources do you have in abundance right now?",
      "Where do you see opportunities for growth?",
      "How can you create more value with what you already have?"
    ],
    anger: [
      "What triggered this feeling?",
      "What's underneath this anger?",
      "What constructive action can you take with this energy?"
    ],
    idea: [
      "Describe your idea in one sentence.",
      "What problem does this idea solve?",
      "What's the next step to develop this idea further?"
    ],
    discover: [
      "What are you curious about right now?",
      "What patterns have you noticed lately?",
      "What would you like to learn more about?"
    ],
    testing: [
      "What hypothesis are you testing?",
      "How will you measure success?",
      "What's the smallest experiment you could run?"
    ],
    improvement: [
      "What specific area would you like to improve?",
      "What's one small step you could take today?",
      "How will you track your progress?"
    ]
  };

  // Check user auth status and fetch user info
  useEffect(() => {
    if (user) {
      setCurrentUser({
        id: user.id,
        name: user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: ''
      });
      
      // Check connections
      checkConnections();
    }
  }, [user]);

  // Check if the user has connected their services
  const checkConnections = async () => {
    if (!user) return;
    
    // Supabase is always connected if the user is logged in
    const newConnectionState = { supabase: true, notion: false, clickup: false };
    
    try {
      // Check if the user has Notion and ClickUp API keys
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('notion_api_key, clickup_api_key')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching API keys:', error);
        return;
      }
      
      if (data) {
        newConnectionState.notion = !!data.notion_api_key;
        newConnectionState.clickup = !!data.clickup_api_key;
      }
      
      setIsConnected(newConnectionState);
    } catch (error) {
      console.error('Error checking connections:', error);
    }
  };

  // Helper function to save current conversation
  const saveCurrentConversation = () => {
    if (messages.length === 0) return;
    
    let title = "";
    let type: 'personal' | 'business' | 'stack' = 'personal';
    
    if (isStackMode && activeStack) {
      title = `${stackOptions.find(s => s.id === activeStack)?.name} Reflection`;
      type = 'stack';
    } else if (activeTab === 'business') {
      title = "Business Chat";
      type = 'business';
    } else {
      title = "Personal Chat";
      type = 'personal';
    }
    
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title,
      type,
      stackId: activeStack || undefined,
      messages: [...messages],
      timestamp: new Date().toISOString()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    
    toast({
      title: "Conversation saved",
      description: "Your chat has been saved to history",
    });
  };

  // Handlers
  const handleSendMessage = (inputMessage: string) => {
    // Add user message
    setMessages([...messages, {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    setIsLoading(true);
    
    // Simulate response based on active tab
    setTimeout(() => {
      let botResponse = '';
      
      if (isStackMode && activeStack) {
        // Get next question from the stack
        const currentStackQuestions = stackQuestions[activeStack];
        const questionIndex = messages.filter(m => m.sender === 'bot' && m.stack === activeStack).length;
        
        if (questionIndex < currentStackQuestions.length) {
          botResponse = currentStackQuestions[questionIndex];
        } else {
          botResponse = "Thanks for completing this reflection stack! Would you like to try another?";
          setIsStackMode(false);
          setActiveStack(null);
        }
        
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: botResponse,
          sender: 'bot',
          stack: activeStack,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        // Regular chat mode
        if (activeTab === 'personal') {
          botResponse = "I've checked your Supabase and Notion data. Based on your personal patterns, I suggest focusing on your health goals today. Your sleep data shows improvement!";
        } else if (activeTab === 'business') {
          botResponse = "According to your ClickUp and Notion workspace, you have 3 high-priority tasks due tomorrow. Your 'Website Redesign' project is 78% complete.";
        }
        
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) return;
    
    // Save current conversation first if there are messages
    if (messages.length > 0) {
      saveCurrentConversation();
    }
    
    // Set the appropriate mode
    if (conversation.type === 'stack' && conversation.stackId) {
      setActiveTab('personal');
      setIsStackMode(true);
      setActiveStack(conversation.stackId);
    } else if (conversation.type === 'business') {
      setActiveTab('business');
      setIsStackMode(false);
      setActiveStack(null);
    } else {
      setActiveTab('personal');
      setIsStackMode(false);
      setActiveStack(null);
    }
    
    // Load the messages
    setMessages(conversation.messages);
    
    // Close the history sidebar on mobile
    if (window.innerWidth < 768) {
      setShowHistory(false);
    }
    
    toast({
      title: "Conversation loaded",
      description: `Loaded "${conversation.title}"`,
    });
  };

  const changeConversationType = (newTab: string) => {
    if (activeTab === newTab && !isStackMode) return;
    
    // Save current conversation if there are messages
    if (messages.length > 0) {
      saveCurrentConversation();
    }
    
    // Set the new tab
    setActiveTab(newTab);
    setIsStackMode(false);
    setActiveStack(null);
    
    // Clear the messages
    setMessages([]);
  };

  const startStackMode = (stackId: string) => {
    // Save current conversation if there are messages
    if (messages.length > 0) {
      saveCurrentConversation();
    }
    
    setIsStackMode(true);
    setActiveStack(stackId);
    setMessages([{
      id: Date.now(),
      text: `Starting ${stackOptions.find(s => s.id === stackId)!.name} reflection...`,
      sender: 'system',
      timestamp: new Date().toLocaleTimeString()
    }, {
      id: Date.now() + 1,
      text: stackQuestions[stackId][0],
      sender: 'bot',
      stack: stackId,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Updated to use Supabase to store API keys
  const toggleConnection = async (service: 'supabase' | 'notion' | 'clickup') => {
    if (service === 'supabase') {
      // Supabase connection can't be toggled, it's always on when logged in
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage connections",
        variant: "destructive"
      });
      return;
    }
    
    // For notion and clickup, show the API keys modal
    setShowApiKeys(true);
  };
  
  // Updated to use the Auth context
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setMessages([]);
      setIsConnected({
        supabase: false,
        notion: false,
        clickup: false
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };
  
  const updateApiKey = (provider: string, value: string) => {
    setApiKeys({
      ...apiKeys,
      [provider]: value
    });
  };

  if (!user) {
    return null; // The ProtectedRoute component will handle the redirect
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Multi-Agent Chat</h1>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-3">
            {/* Connection indicators */}
            <div className="flex items-center">
              <div 
                className={`h-2 w-2 rounded-full mr-2 ${isConnected.supabase ? 'bg-green-500' : 'bg-gray-300'}`} 
              />
              <button 
                onClick={() => toggleConnection('supabase')}
                className="text-sm text-gray-700 hover:text-blue-600"
              >
                Supabase
              </button>
            </div>
            <div className="flex items-center">
              <div 
                className={`h-2 w-2 rounded-full mr-2 ${isConnected.notion ? 'bg-green-500' : 'bg-gray-300'}`} 
              />
              <button 
                onClick={() => toggleConnection('notion')}
                className="text-sm text-gray-700 hover:text-blue-600"
              >
                Notion
              </button>
            </div>
            <div className="flex items-center">
              <div 
                className={`h-2 w-2 rounded-full mr-2 ${isConnected.clickup ? 'bg-green-500' : 'bg-gray-300'}`} 
              />
              <button 
                onClick={() => toggleConnection('clickup')}
                className="text-sm text-gray-700 hover:text-blue-600"
              >
                ClickUp
              </button>
            </div>
          </div>
          
          {/* History button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center text-gray-700 hover:text-blue-600 md:hidden"
          >
            <History className="h-5 w-5" />
          </button>
          
          {/* Settings dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <Settings className="h-5 w-5" />
            </button>
            
            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                <button
                  onClick={() => {
                    setShowApiKeys(!showApiKeys);
                    setShowSettings(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Key className="h-4 w-4 mr-2" />
                  API Keys
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
          
          {/* User profile */}
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-2">{currentUser?.name}</span>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="User" className="h-8 w-8 rounded-full" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex h-full">
        {/* Main Sidebar */}
        <div className="w-64 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => changeConversationType('personal')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeTab === 'personal' && !isStackMode ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Personal Agent</span>
              </button>
              <button
                onClick={() => changeConversationType('business')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeTab === 'business' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ClipboardList className="h-5 w-5" />
                <span>Business Agent</span>
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 md:hidden`}
              >
                <History className="h-5 w-5" />
                <span>Chat History</span>
              </button>
            </div>
          </div>
          
          {/* Stack Options */}
          <StackOptions 
            options={stackOptions}
            activeStack={activeStack}
            onStackSelect={startStackMode}
          />
          
          {/* Data Sources */}
          <div className="p-4">
            <h3 className="font-medium text-gray-700 mb-3">Data Sources</h3>
            <div className="space-y-2">
              <DataSourceItem 
                name="Supabase" 
                icon={<Database className="h-4 w-4" />}
                isConnected={isConnected.supabase}
              />
              <DataSourceItem 
                name="Notion" 
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6H18V18H6V6Z" fill="currentColor" />
                  </svg>
                }
                isConnected={isConnected.notion}
              />
              <DataSourceItem 
                name="ClickUp" 
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                isConnected={isConnected.clickup}
              />
            </div>
          </div>
        </div>
        
        {/* Chat History Sidebar */}
        <div className={`${showHistory ? 'block' : 'hidden'} md:block w-72 bg-white border-r flex flex-col`}>
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Chat History</h2>
            <p className="text-xs text-gray-500 mt-1">Previous conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChatHistory conversations={conversations} onSelect={loadConversation} />
          </div>
        </div>
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="mb-4">
                  {activeTab === 'personal' ? 
                    <MessageSquare className="h-12 w-12 text-blue-200" /> : 
                    <ClipboardList className="h-12 w-12 text-blue-200" />
                  }
                </div>
                <p className="text-lg mb-1">No messages yet</p>
                <p className="text-sm max-w-md text-center">
                  {activeTab === 'personal' 
                    ? "Chat with your personal agent to get insights about your habits, health, and personal data." 
                    : "Chat with your business agent to track projects, tasks, and get updates on your business metrics."}
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
                  stackOptions={stackOptions}
                />
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-3/4 rounded-lg px-4 py-2 bg-white border text-gray-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area */}
          <ChatInput 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            activeTab={activeTab}
            activeStack={activeStack}
            stackOptions={stackOptions}
            onExitStack={() => {
              setIsStackMode(false);
              setActiveStack(null);
            }}
          />
        </div>
      </div>
      
      {/* API Keys Modal */}
      <ApiKeysModal 
        isOpen={showApiKeys}
        onClose={() => {
          setShowApiKeys(false);
          // Refresh connections after modal is closed
          checkConnections();
        }}
        apiKeys={apiKeys}
        updateApiKey={updateApiKey}
      />
    </div>
  );
};

export default ChatApp;
