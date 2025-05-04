import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrainCircuit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { initOpenAI } from '@/lib/services/openai';

interface OpenAIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OpenAIKeyModal: React.FC<OpenAIKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Initialize OpenAI with the API key
      initOpenAI(apiKey);
      
      // Store the API key in localStorage (consider more secure methods for production)
      localStorage.setItem('openai_api_key', apiKey);
      
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved",
      });
      
      onClose();
    } catch (error) {
      console.error('Error initializing OpenAI client:', error);
      toast({
        title: "Error",
        description: "Failed to initialize OpenAI client",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <BrainCircuit className="mr-2 h-5 w-5" />
            OpenAI API Key
          </DialogTitle>
          <DialogDescription>
            Enter your OpenAI API key to enable AI-powered responses
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="col-span-3"
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never sent to our servers
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Saving..." : "Save API Key"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to check if the API key is stored
export const hasStoredApiKey = (): boolean => {
  return !!localStorage.getItem('openai_api_key');
};

// Helper function to initialize OpenAI from stored key
export const initFromStoredKey = (): boolean => {
  const storedKey = localStorage.getItem('openai_api_key');
  if (storedKey) {
    try {
      initOpenAI(storedKey);
      return true;
    } catch (error) {
      console.error('Error initializing OpenAI from stored key:', error);
      return false;
    }
  }
  return false;
};

export default OpenAIKeyModal; 