
import { 
  MessageSquare, 
  ClipboardList, 
  ThumbsUp, 
  Heart, 
  Zap, 
  Flame, 
  Lightbulb, 
  Compass, 
  FlaskConical, 
  TrendingUp,
  Circle,
  Book,
  HeartHandshake,
  PenTool
} from 'lucide-react';
import React from 'react';

// Map stack IDs to their respective icons
export const stackIcons: Record<string, typeof MessageSquare> = {
  'reflection': ThumbsUp,
  'gratitude': Heart,
  'goals': TrendingUp,
  'creativity': Lightbulb,
  'journal': Book,
  'relationships': HeartHandshake,
};

export const getIconForStackId = (stackId: string) => {
  const IconComponent = stackIcons[stackId] || MessageSquare;
  return <IconComponent className="h-5 w-5" />;
};

export const getIconForChatType = (type: 'personal' | 'business' | 'stack', stackId?: string) => {
  if (type === 'stack' && stackId && stackIcons[stackId]) {
    return getIconForStackId(stackId);
  }
  
  if (type === 'business') {
    return <ClipboardList className="h-5 w-5" />;
  }
  
  return <MessageSquare className="h-5 w-5" />;
};
