
import React from 'react';
import { getIconForStackId } from './ChatIcons';

interface StackOption {
  id: string;
  name: string;
  color: string;
}

interface StackOptionsProps {
  options: StackOption[];
  activeStack: string | null;
  onStackSelect: (stackId: string) => void;
}

const StackOptions: React.FC<StackOptionsProps> = ({ options, activeStack, onStackSelect }) => {
  return (
    <div className="p-4 border-b">
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
  );
};

export default StackOptions;
