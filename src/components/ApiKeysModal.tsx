
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
  const { toast } = useToast();
  const { user } = useAuth();
  const [notionApiKey, setNotionApiKey] = useState<string>('');
  const [clickupApiKey, setClickupApiKey] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch API keys from Supabase when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchApiKeys();
    }
  }, [isOpen, user]);

  const fetchApiKeys = async () => {
    if (!user) return;

    try {
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
        setNotionApiKey(data.notion_api_key || '');
        setClickupApiKey(data.clickup_api_key || '');
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .update({
          notion_api_key: notionApiKey,
          clickup_api_key: clickupApiKey,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving API keys:', error);
        toast({
          title: 'Error',
          description: 'Failed to save API keys',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'API keys saved successfully',
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

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
          
          {/* Notion API Key */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Notion API Key</label>
            <Input
              type="password"
              value={notionApiKey}
              onChange={(e) => setNotionApiKey(e.target.value)}
              placeholder="Enter your Notion API key"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is your personal Notion integration token
            </p>
          </div>
          
          {/* ClickUp API Key */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">ClickUp API Key</label>
            <Input
              type="password"
              value={clickupApiKey}
              onChange={(e) => setClickupApiKey(e.target.value)}
              placeholder="Enter your ClickUp API key"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is your personal ClickUp API token
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeysModal;
