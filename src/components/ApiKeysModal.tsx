
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: {
    claude: string;
    openai: string;
    grok: string;
    openrouter: string;
  };
  updateApiKey: (provider: string, value: string) => void;
}

const ApiKeysModal: React.FC<ApiKeysModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  updateApiKey,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">API Keys</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Claude API Key</label>
            <Input
              type="password"
              value={apiKeys.claude}
              onChange={(e) => updateApiKey('claude', e.target.value)}
              placeholder="Enter Claude API key"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">OpenAI API Key</label>
            <Input
              type="password"
              value={apiKeys.openai}
              onChange={(e) => updateApiKey('openai', e.target.value)}
              placeholder="Enter OpenAI API key"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Grok API Key</label>
            <Input
              type="password"
              value={apiKeys.grok}
              onChange={(e) => updateApiKey('grok', e.target.value)}
              placeholder="Enter Grok API key"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">OpenRouter API Key</label>
            <Input
              type="password"
              value={apiKeys.openrouter}
              onChange={(e) => updateApiKey('openrouter', e.target.value)}
              placeholder="Enter OpenRouter API key"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeysModal;
