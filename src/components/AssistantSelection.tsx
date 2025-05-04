
import React from 'react';
import { User, Briefcase, Globe, Brain, Lightbulb, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';

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
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-semibold text-center text-white mb-8">Choose Your Assistant</h1>

      {/* First row of assistants */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
        <button 
          onClick={() => onSelectAssistant('personal')}
          className="text-left w-full"
        >
          <div className="assistant-card personal h-full">
            <div className="mb-4 p-3 rounded-full bg-blue-900/30 text-blue-400 w-fit">
              <User className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Personal Assistant</h2>
            <p className="text-sm text-gray-400">Manage your personal data and get insights about your habits and health.</p>
          </div>
        </button>

        <button 
          onClick={() => onSelectAssistant('business')}
          className="text-left w-full"
        >
          <div className="assistant-card business h-full">
            <div className="mb-4 p-3 rounded-full bg-green-900/30 text-green-400 w-fit">
              <Briefcase className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Business Assistant</h2>
            <p className="text-sm text-gray-400">Your professional helper to track projects, tasks, and business metrics.</p>
          </div>
        </button>

        <button 
          onClick={() => onSelectAssistant('stack')}
          className="text-left w-full"
        >
          <div className="assistant-card stack h-full">
            <div className="mb-4 p-3 rounded-full bg-purple-900/30 text-purple-400 w-fit">
              <Globe className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Stack Assistant</h2>
            <p className="text-sm text-gray-400">Structured conversations to reflect and gain insights through guided questions.</p>
          </div>
        </button>
      </div>

      {/* Idea Log Section with better styling */}
      <Card className="mt-10 bg-[#22242f] border-white/5">
        <CardContent className="pt-6">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-full bg-purple-900/30 text-purple-400 mr-3">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Idea Log</h2>
              <p className="text-sm text-gray-400">Capture your ideas for later reference</p>
            </div>
          </div>
          
          <form onSubmit={handleAddIdea} className="mb-6 relative">
            <Input
              value={ideaInput}
              onChange={(e) => setIdeaInput(e.target.value)}
              placeholder="Add a new idea..."
              className="chat-input pr-12 w-full bg-[#191b24] border-white/10"
            />
            <Button 
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-purple-600 text-white rounded-full h-8 w-8 flex items-center justify-center"
              disabled={!ideaInput.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <div className="text-purple-400 mb-4">
              <Lightbulb className="h-10 w-10" />
            </div>
            <p className="text-gray-400 text-lg mb-2">No ideas yet</p>
            <p className="text-gray-500 text-sm text-center max-w-md">
              Add your first idea above to get started
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistantSelection;
