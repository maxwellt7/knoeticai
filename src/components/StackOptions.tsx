
import React from 'react';
import { getIconForStackId } from './ChatIcons';
import DataSourceItem from './DataSourceItem';
import { Database, Clock } from 'lucide-react';

interface StackOption {
  id: string;
  name: string;
  color: string;
}

interface StackOptionsProps {
  options: StackOption[];
  activeStack: string | null;
  onStackSelect: (stackId: string) => void;
  isConnected: {
    supabase: boolean;
    notion: boolean;
    clickup: boolean;
  };
  toggleConnection?: (service: 'supabase' | 'notion' | 'clickup') => void;
}

const StackOptions: React.FC<StackOptionsProps> = ({ 
  options, 
  activeStack, 
  onStackSelect,
  isConnected,
  toggleConnection
}) => {
  return (
    <div className="w-64 min-w-64 border-r border-gray-200 h-full bg-white flex flex-col">
      {/* Assistant type selection */}
      <div className="flex flex-col">
        <button className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 font-medium">
          <MessageSquare size={18} />
          <span>Personal Agent</span>
        </button>
        <button className="flex items-center gap-2 p-3 text-gray-700 hover:bg-gray-50">
          <ClipboardText size={18} />
          <span>Business Agent</span>
        </button>
        <div className="border-t border-gray-200 my-2"></div>
      </div>

      {/* Stack Options */}
      <div className="p-4">
        <h3 className="font-medium text-gray-700 mb-3">Stack Options</h3>
        <div className="grid grid-cols-2 gap-2">
          {options.map((stack) => (
            <button
              key={stack.id}
              onClick={() => onStackSelect(stack.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border hover:bg-gray-50 ${
                activeStack === stack.id ? stack.color + ' bg-opacity-20 border-opacity-0' : 'border-gray-200'
              }`}
            >
              <div className={`p-1 rounded-full ${stack.color} bg-opacity-10 mb-1`}>
                {getIconForStackId(stack.id)}
              </div>
              <span className="text-xs font-medium text-gray-700">{stack.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Data Sources */}
      <div className="p-4 mt-auto">
        <h3 className="font-medium text-gray-700 mb-3">Data Sources</h3>
        <div className="space-y-3">
          <DataSourceItem 
            name="Supabase" 
            icon={<Database size={18} />} 
            isConnected={isConnected.supabase}
            onClick={toggleConnection ? () => toggleConnection('supabase') : undefined}
            isClickable={false}
          />
          <DataSourceItem 
            name="Notion" 
            icon={<ClipboardText size={18} />} 
            isConnected={isConnected.notion}
            onClick={toggleConnection ? () => toggleConnection('notion') : undefined}
            isClickable={true}
          />
          <DataSourceItem 
            name="ClickUp" 
            icon={<Clock size={18} />} 
            isConnected={isConnected.clickup}
            onClick={toggleConnection ? () => toggleConnection('clickup') : undefined}
            isClickable={true}
          />
        </div>
      </div>
    </div>
  );
};

// Add these imports at the top
import { MessageSquare, ClipboardText } from 'lucide-react';

export default StackOptions;
