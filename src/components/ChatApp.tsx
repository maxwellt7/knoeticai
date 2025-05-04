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
  PenTool,
  Bug
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
import OpenAIKeyModal, { hasStoredApiKey, initFromStoredKey } from './OpenAIKeyModal';
import { isOpenAIInitialized } from '@/lib/services/openai';
import { assistantManager } from '@/lib/services/assistantManager';

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
  console.log('ChatApp component rendering'); // Debug log
  
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
  const [showDebug, setShowDebug] = useState(false); // Debug panel visibility
  const [showOpenAIKeyModal, setShowOpenAIKeyModal] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Adding test message for debugging
  useEffect(() => {
    // Add a debug message to see if messages are rendering
    setMessages([{
      id: Date.now(),
      text: "DEBUG: This is a test message to see if rendering works.",
      sender: 'system',
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    console.log('Debug message added to state');
  }, []);

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
    console.log('User auth effect running, user:', user); // Debug log
    
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
    
    console.log('Checking connections for user:', user.id); // Debug log
    
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
      console.log('Connection state updated:', newConnectionState); // Debug log
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
    
    console.log('Conversation saved:', newConversation); // Debug log
  };

  // Handlers
  const handleSendMessage = async (inputMessage: string) => {
    if (!inputMessage.trim()) return;
    
    setIsLoading(true);
    
    // Find the current conversation if it exists
    const currentConversation = conversations.find(conv => {
      // Match by type and stack
      if (conv.type === 'stack' && isStackMode && conv.stackId === activeStack) {
        // Compare first few messages to identify the same stack conversation
        return conv.messages.length > 0 && 
          messages.length > 0 && 
          conv.messages[0].text === messages[0].text;
      } else if (conv.type === 'business' && activeTab === 'business') {
        // For business, look at the most recent business conversation
        return true;
      } else if (conv.type === 'personal' && activeTab === 'personal' && !isStackMode) {
        // For personal, look at the most recent personal conversation
        return true;
      }
      return false;
    });
    
    const conversationId = currentConversation?.id;
    
    // Add the user message
    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Get response from appropriate assistant
      let botResponse: string;
      
      // If OpenAI is not initialized, handle without AI
      if (!isOpenAIInitialized()) {
        // Display a message about needing an API key
        botResponse = "Please add your OpenAI API key to enable AI-powered responses.";
        setShowOpenAIKeyModal(true);
      } else if (isStackMode && activeStack) {
        const assistant = assistantManager.getAssistant(activeStack);
        botResponse = await assistant.sendMessage(inputMessage);
      } else if (activeTab === 'business') {
        const assistant = assistantManager.getAssistant('business');
        botResponse = await assistant.sendMessage(inputMessage);
      } else {
        const assistant = assistantManager.getAssistant('personal');
        botResponse = await assistant.sendMessage(inputMessage);
      }
      
      // Add the bot response
      const botMessage: Message = {
        id: Date.now(),
        text: botResponse,
        sender: 'bot',
        stack: isStackMode ? activeStack : undefined,
        timestamp: new Date().toLocaleTimeString()
      };
      
      const updatedMessages = [...messages, userMessage, botMessage];
      setMessages(updatedMessages);
      
      // If this is part of an existing conversation, update it
      if (conversationId) {
        await updateConversation(conversationId, updatedMessages);
      }
      // Otherwise, if we have enough messages, save as a new conversation
      else if (updatedMessages.length >= 4) {
        await saveCurrentConversation();
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm sorry, there was an error processing your message. Please try again.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
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
    
    console.log('Conversation loaded:', conversation); // Debug log
  };

  const handleSelectAssistant = (type: 'personal' | 'business' | 'stack') => {
    console.log('Assistant selected:', type); // Debug log
    
    setActiveTab(type);
    if (type === 'stack') {
      // Show stack options in sidebar
      setIsStackMode(true);
    } else {
      setIsStackMode(false);
      setActiveStack(null);
    }
    setShowSelection(false);
    
    // Add a welcome message
    setMessages([{
      id: Date.now(),
      text: `Welcome to the ${type} assistant! Type a message to get started.`,
      sender: 'system',
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleSelectStack = (stackId: string) => {
    console.log('Stack selected:', stackId); // Debug log
    
    setActiveTab('personal');
    setIsStackMode(true);
    setActiveStack(stackId);
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
    
    console.log('Back to selection'); // Debug log
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
    
    console.log('Conversation type changed to:', newTab); // Debug log
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
    
    console.log('Stack mode started:', stackId); // Debug log
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
    console.log('Toggle connection for:', service); // Debug log
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
      
      console.log('User logged out'); // Debug log
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
    
    console.log('API key updated for:', provider); // Debug log
  };

  // Add this useEffect after the existing useEffect that checks user auth status
  useEffect(() => {
    if (user) {
      // Check if OpenAI API key is stored
      if (!hasStoredApiKey()) {
        setShowOpenAIKeyModal(true);
      } else {
        // Initialize OpenAI client with stored key
        initFromStoredKey();
      }
    }
  }, [user]);

  if (!user) {
    console.log('No user, redirecting to login'); // Debug log
    return null; // The ProtectedRoute component will handle the redirect
  }

  // DEBUG: Add stack questions logging
  console.log('Stack questions available:', Object.keys(stackQuestions));
  console.log('Current messages:', messages);
  console.log('Show selection:', showSelection);

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
          {/* Debug button */}
          <Button
            onClick={() => setShowDebug(!showDebug)}
            variant="ghost"
            size="icon"
            className="text-white"
            title="Debug Mode"
          >
            <Bug className="h-5 w-5" />
          </Button>
          
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
      
      {/* Debug Panel */}
      {showDebug && (
        <div className="mx-4 mb-4 p-4 bg-[#22242f] text-white rounded-lg border border-white/10">
          <h2 className="font-bold mb-2">Debug Information</h2>
          <div className="text-xs font-mono">
            <p>Active Tab: {activeTab}</p>
            <p>Stack Mode: {isStackMode ? 'true' : 'false'}</p>
            <p>Active Stack: {activeStack || 'none'}</p>
            <p>Show Selection: {showSelection ? 'true' : 'false'}</p>
            <p>Message Count: {messages.length}</p>
            <p>User: {user ? user.email : 'not logged in'}</p>
            <details>
              <summary>Messages</summary>
              <pre className="mt-2 bg-black p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(messages, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        {showSelection ? (
          <AssistantSelection 
            onSelectAssistant={handleSelectAssistant} 
            onSelectStack={handleSelectStack}
          />
        ) : (
          <div className="flex h-full">
            {isStackMode && (
              <StackOptions
                options={stackOptions}
                activeStack={activeStack}
                onStackSelect={handleSelectStack}
                isConnected={isConnected}
                toggleConnection={toggleConnection}
              />
            )}
            <div className={`flex-1 ${isStackMode ? 'ml-4' : ''}`}>
              <ChatInterface
                activeAssistant={activeTab as 'personal' | 'business' | 'stack'}
                messages={messages}
                onSendMessage={handleSendMessage}
                onBackClick={handleBackToSelection}
                isLoading={isLoading}
                conversations={conversations}
                onSelectConversation={loadConversation}
              />
              
              {/* Fallback debug message rendering - in case ChatInterface isn't working */}
              {messages.length > 0 && showDebug && (
                <div className="mt-4 bg-yellow-800 p-4 rounded-lg">
                  <h3 className="font-bold text-yellow-200">Fallback Message Display:</h3>
                  {messages.map(msg => (
                    <div key={msg.id} className="my-2 p-2 bg-yellow-900 rounded">
                      <p><strong>{msg.sender}:</strong> {msg.text}</p>
                      <p className="text-xs opacity-75">{msg.timestamp}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
      
      {/* OpenAI API Key Modal */}
      <OpenAIKeyModal 
        isOpen={showOpenAIKeyModal}
        onClose={() => setShowOpenAIKeyModal(false)}
      />
    </div>
  );
};

export default ChatApp;
