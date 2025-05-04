
import React from 'react';

interface DataSourceItemProps {
  name: string;
  icon: React.ReactNode;
  isConnected: boolean;
  onClick?: () => void;
  isClickable?: boolean;
}

const DataSourceItem: React.FC<DataSourceItemProps> = ({ 
  name, 
  icon, 
  isConnected, 
  onClick,
  isClickable = true 
}) => {
  return (
    <div 
      className={`flex items-center justify-between text-sm ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={isClickable && onClick ? onClick : undefined}
    >
      <div className="flex items-center">
        <div className="text-gray-500 mr-2">{icon}</div>
        <span className="text-gray-700">{name}</span>
      </div>
      <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
    </div>
  );
};

export default DataSourceItem;
