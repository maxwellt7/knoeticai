
import React from 'react';
import { User, Briefcase, Globe, Brain, Lightbulb, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface AssistantSelectionProps {
  onSelectAssistant: (type: 'personal' | 'business' | 'stack') => void;
}

const AssistantSelection: React.FC<AssistantSelectionProps> = ({ onSelectAssistant }) => {
  const [ideaInput, setIdeaInput] = React.useState('');

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (ideaInput.trim()) {
      console.log("Adding idea:", ideaInput);
      setIdeaInput('');
      // In a real app, this would add the idea to state or database
    }
  };

  return (
    <div className="flex flex-col space-y-10">
      <h1 className="text-2xl font-semibold text-center text-white">Choose Your Assistant</h1>

      {/* First row of assistants */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="assistant-card personal cursor-pointer flex flex-col items-start" 
          onClick={() => onSelectAssistant('personal')}
        >
          <div className="mb-4 p-2 rounded-full bg-blue-900/30 text-blue-400">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-medium text-white">Personal Assistant</h2>
          <p className="text-sm text-gray-400 mt-1">Manage your personal data</p>
        </div>

        <div 
          className="assistant-card business cursor-pointer flex flex-col items-start" 
          onClick={() => onSelectAssistant('business')}
        >
          <div className="mb-4 p-2 rounded-full bg-green-900/30 text-green-400">
            <Briefcase className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-medium text-white">Business Assistant</h2>
          <p className="text-sm text-gray-400 mt-1">Your professional helper</p>
        </div>

        <div 
          className="assistant-card stack cursor-pointer flex flex-col items-start" 
          onClick={() => onSelectAssistant('stack')}
        >
          <div className="mb-4 p-2 rounded-full bg-purple-900/30 text-purple-400">
            <Globe className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-medium text-white">Stack Assistant</h2>
          <p className="text-sm text-gray-400 mt-1">Structured conversations</p>
        </div>
      </div>

      {/* Second row of AI assistants */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="assistant-card personal cursor-pointer flex flex-col items-start">
          <div className="mb-4 p-2 rounded-full bg-blue-900/30 text-blue-400">
            <Brain className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-medium text-white">AI Personal Assistant</h2>
          <p className="text-sm text-gray-400 mt-1">Powered by AI</p>
        </div>

        <div className="assistant-card business cursor-pointer flex flex-col items-start">
          <div className="mb-4 p-2 rounded-full bg-green-900/30 text-green-400">
            <Brain className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-medium text-white">AI Business Assistant</h2>
          <p className="text-sm text-gray-400 mt-1">AI for professional tasks</p>
        </div>

        <div className="assistant-card stack cursor-pointer flex flex-col items-start">
          <div className="mb-4 p-2 rounded-full bg-purple-900/30 text-purple-400">
            <Brain className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-medium text-white">AI Structured Conversations</h2>
          <p className="text-sm text-gray-400 mt-1">AI-guided reflections</p>
        </div>
      </div>

      {/* Idea Log */}
      <div className="idea-log mt-10">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-purple-900/30 text-purple-400 mr-2">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">Idea Log</h2>
            <p className="text-sm text-gray-400">Capture your ideas for later reference</p>
          </div>
        </div>
        
        <form onSubmit={handleAddIdea} className="mt-4 relative">
          <Input
            value={ideaInput}
            onChange={(e) => setIdeaInput(e.target.value)}
            placeholder="Add a new idea..."
            className="chat-input pr-10 w-full"
          />
          <Button 
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-purple-600 text-white rounded-full h-8 w-8 flex items-center justify-center"
            disabled={!ideaInput.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="mt-8 empty-state">
          <div className="text-purple-400 mb-4">
            <Lightbulb className="h-10 w-10" />
          </div>
          <p className="text-gray-400 text-lg mb-1">No ideas yet</p>
          <p className="text-gray-500 text-sm text-center">
            Add your first idea above to get started
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssistantSelection;
