
import React from 'react';
import { MessageSquare, Briefcase, Circle, PenTool } from 'lucide-react';
import { getIconForStackId } from './ChatIcons';

interface AssistantSelectionProps {
  onSelectAssistant: (type: 'personal' | 'business' | 'stack') => void;
}

const AssistantSelection: React.FC<AssistantSelectionProps> = ({ onSelectAssistant }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col items-center justify-center mb-10 mt-8">
        <div className="flex items-center mb-2">
          <Circle className="h-8 w-8 text-purple-500 mr-3" fill="#9580ff" stroke="#9580ff" />
          <h1 className="text-3xl font-bold text-white">Knoetic</h1>
        </div>
        <p className="text-gray-400 text-lg">Choose your assistant type</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div 
          className="assistant-card personal cursor-pointer"
          onClick={() => onSelectAssistant('personal')}
        >
          <div className="p-2 rounded-full bg-blue-500/20 w-fit mb-4">
            <MessageSquare className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-lg font-medium text-white mb-2">Personal Assistant</h2>
          <p className="text-gray-400 text-sm">
            Chat with an assistant that understands your personal data, habits, and preferences.
          </p>
        </div>

        <div 
          className="assistant-card business cursor-pointer"
          onClick={() => onSelectAssistant('business')}
        >
          <div className="p-2 rounded-full bg-green-500/20 w-fit mb-4">
            <Briefcase className="h-6 w-6 text-green-400" />
          </div>
          <h2 className="text-lg font-medium text-white mb-2">Business Assistant</h2>
          <p className="text-gray-400 text-sm">
            Get updates on projects, tasks, and business metrics from your connected services.
          </p>
        </div>

        <div 
          className="assistant-card stack cursor-pointer"
          onClick={() => onSelectAssistant('stack')}
        >
          <div className="p-2 rounded-full bg-purple-500/20 w-fit mb-4">
            <PenTool className="h-6 w-6 text-purple-400" />
          </div>
          <h2 className="text-lg font-medium text-white mb-2">Stack Assistant</h2>
          <p className="text-gray-400 text-sm">
            Use guided conversations with structured questions to help you reflect and gain insights.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssistantSelection;
