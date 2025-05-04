
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
  Circle
} from 'lucide-react';

// Map stack IDs to their respective icons
export const stackIcons: Record<string, typeof MessageSquare> = {
  'happy': ThumbsUp,
  'gratitude': Heart,
  'abundance': Zap,
  'anger': Flame,
  'idea': Lightbulb,
  'discover': Compass,
  'testing': FlaskConical,
  'improvement': TrendingUp,
};

export const getIconForStackId = (stackId: string) => {
  return stackIcons[stackId] || MessageSquare;
};

export const getIconForChatType = (type: 'personal' | 'business' | 'stack', stackId?: string) => {
  if (type === 'stack' && stackId && stackIcons[stackId]) {
    const Icon = stackIcons[stackId];
    return <Icon className="h-5 w-5" />;
  }
  
  if (type === 'business') {
    return <ClipboardList className="h-5 w-5" />;
  }
  
  return <MessageSquare className="h-5 w-5" />;
};
