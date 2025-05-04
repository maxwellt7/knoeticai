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
  History,
  Circle,
  Book,
  HeartHandshake,
  PenTool
} from 'lucide-react';
import ChatMessage from './ChatMessage';
import DataSourceItem from './DataSourceItem';
import ApiKeysModal from './ApiKeysModal';
import LoginScreen from './LoginScreen';
import ChatInput from './ChatInput';
import StackOptions from './StackOptions';
import ChatHistory from './ChatHistory';
import AssistantSelection from './AssistantSelection';
import ChatInterface from './ChatInterface';
import { Button } from '@/components/ui/button';
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
  const [showSelection, setShowSelection] = useState(true);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Stack options and questions
  const stackOptions: StackOption[] = [
    { id: 'idea', name: 'Idea Assistant', icon: <PenTool className="h-5 w-5" />, color: 'bg-indigo-500' },
    { id: 'reflection', name: 'Reflection', icon: <ThumbsUp className="h-5 w-5" />, color: 'bg-blue-500' },
    { id: 'gratitude', name: 'Gratitude', icon: <Heart className="h-5 w-5" />, color: 'bg-pink-500' },
    { id: 'goals', name: 'Goals', icon: <TrendingUp className="h-5 w-5" />, color: 'bg-green-500' },
    { id: 'creativity', name: 'Creativity', icon: <Lightbulb className="h-5 w-5" />, color: 'bg-yellow-500' },
    { id: 'journal', name: 'Journal', icon: <Book className="h-5 w-5" />, color: 'bg-purple-500' },
    { id: 'relationships', name: 'Relationships', icon: <HeartHandshake className="h-5 w-5" />, color: 'bg-red-500' },
  ];

  const stackQuestions: Record<string, string[]> = {
    reflection: [
      "What's one thing that went well for you today?",
      "What's something you found challenging recently?",
      "What's one lesson you learned from your experiences this week?",
      "How would you like to approach similar situations in the future?"
    ],
    gratitude: [
      "Name three things you're grateful for in this moment.",
      "Who is someone that has positively impacted your life recently?",
      "What's something in your environment or daily routine you appreciate?",
      "What opportunity are you thankful to have right now?"
    ],
    goals: [
      "What's one important goal you're working toward right now?",
      "What small step could you take today to move closer to your goal?",
      "What obstacles might stand in your way?",
      "How might you overcome these obstacles?"
    ],
    creativity: [
      "What creative project or idea has been on your mind lately?",
      "What's one way you could approach this idea differently?",
      "What resources would help you bring this idea to life?",
      "How might you carve out time to work on this creative pursuit?"
    ],
    journal: [
      "How would you describe your mood today?",
      "What was the highlight of your day?",
      "What's something that's been on your mind lately?",
      "If you could change one thing about your day, what would it be and why?"
    ],
    relationships: [
      "Who is someone important in your life that you'd like to connect with more?",
      "What quality do you most appreciate about this person?",
      "What's one way you could strengthen this relationship?",
      "How do healthy relationships contribute to your wellbeing?"
    ],
    idea: [
      // Section 1: Framing & Identification
      "What would you like to title this emerging idea or opportunity?",
      "Which domain of business does this affect? (production, profit, process, or protection)",
      "What specific problem or opportunity triggered this idea for you?",
      
      // Section 2: Idea Clarification
      "In one or two sentences, what is the core concept of your idea?",
      "How does this idea connect to your 3-year vision and 1-year chief aim?",
      "What need or 'job-to-be-done' does this idea address for you or others?",
      
      // Section 3: Emotional Intelligence
      "What emotions arise when you consider pursuing this idea?",
      "What story or beliefs are you telling yourself about this idea's potential?",
      "How might these emotions be influencing your perception of the idea's value?",
      
      // Section 4: Evidence Building
      "What is one measurable fact that supports this idea's viability?",
      "Why is this particular fact significant to your decision-making process?",
      "What concise label would capture the essence of this supporting fact?",
      "Would you like to add another supporting fact? (If yes, we'll repeat the last three questions)",
      
      // Section 5: Impact Assessment
      "If successfully executed, what specific positive outcomes would this idea create for you and others?",
      "If not pursued, what specific opportunities might be missed or problems left unsolved?",
      "How does this idea's potential impact compare to other initiatives you could pursue?",
      
      // Section 6: Resource Reality Check
      "What key resources (time, money, skills, relationships) are required to execute this idea?",
      "Which of these resources do you already possess, and which would you need to acquire?",
      "What is the minimum viable version of this idea you could test quickly?",
      
      // Section 7: Alignment & Decision
      "On a scale of 1-10, how aligned is this idea with your 1-year chief aim? What's your reasoning?",
      "What single insight or revelation has emerged from exploring this idea?",
      "What immediate, specific action will you take in the next 48 hours to advance or test this idea?",
      
      // Section 8: Final Check
      "Does this idea pass the test to become a viable idea you should implement?",
      "When should you implement it? (now, later date, undecided, or conditional on other outcome)",
      "Would you like to dive deeper into this idea?",
      "Why would you like to dive deeper, and what would you like to figure out?"
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
          if (activeStack === 'idea') {
            // For idea assistant, suggest frameworks based on responses
            botResponse = "Thank you for working through this idea evaluation process. Based on your responses, would you like me to guide you through a specific framework to further develop this idea?";
          } else {
            botResponse = "Thanks for completing this reflection stack! Would you like to try another?";
          }
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

  const handleSelectAssistant = (type: 'personal' | 'business' | 'stack') => {
    setActiveTab(type);
    if (type === 'stack') {
      // For stack, we'll show the stack options
      setIsStackMode(true);
    } else {
      setIsStackMode(false);
      setActiveStack(null);
    }
    setShowSelection(false);
  };

  const handleSelectStack = (stackId: string) => {
    setActiveTab('personal');
    setIsStackMode(true);
    setActiveStack(null);
    setShowSelection(false);
    
    // Start the selected stack immediately
    startStackMode(stackId);
  };

  const handleBackToSelection = () => {
    // Save current conversation if needed
    if (messages.length > 0) {
      saveCurrentConversation();
    }
    
    // Reset states
    setMessages([]);
    setShowSelection(true);
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

    let welcomeMessage = "";
    if (stackId === 'idea') {
      welcomeMessage = "Welcome to the Idea Assistant! I'm here to help you flesh out your idea and determine if it aligns with your goals. Let's start with the first question.";
    } else {
      welcomeMessage = `Starting ${stackOptions.find(s => s.id === stackId)!.name} conversation...`;
    }
    
    setMessages([{
      id: Date.now(),
      text: welcomeMessage,
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
    <div className="flex flex-col h-screen bg-[#191b24]">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="text-purple-500 mr-2">
            <Circle className="h-6 w-6" fill="#9580ff" stroke="#9580ff" />
          </div>
          <h1 className="text-xl font-semibold text-white">Knoetic</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Settings button */}
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="ghost"
            size="icon"
            className="text-white"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          {/* Account button */}
          <Button
            variant="ghost"
            className="text-white flex items-center"
          >
            <span className="mr-2">Account</span>
            <User className="h-5 w-5" />
          </Button>
          
          {/* Settings dropdown */}
          {showSettings && (
            <div className="absolute right-4 top-14 w-48 bg-[#22242f] rounded-lg shadow-lg py-1 z-10 border border-white/5">
              <button
                onClick={() => {
                  setShowApiKeys(!showApiKeys);
                  setShowSettings(false);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-[#2d2f3a] w-full text-left"
              >
                <Key className="h-4 w-4 mr-2" />
                API Keys
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-[#2d2f3a] w-full text-left"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        {showSelection ? (
          <AssistantSelection 
            onSelectAssistant={handleSelectAssistant} 
            onSelectStack={handleSelectStack}
          />
        ) : (
          <ChatInterface
            activeAssistant={activeTab as 'personal' | 'business' | 'stack'}
            messages={messages}
            onSendMessage={handleSendMessage}
            onBackClick={handleBackToSelection}
            isLoading={isLoading}
            conversations={conversations}
            onSelectConversation={loadConversation}
          />
        )}
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
