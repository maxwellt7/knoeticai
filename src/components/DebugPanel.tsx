import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  Database, 
  RefreshCw, 
  Terminal, 
  Code, 
  Download, 
  ArrowRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './ui/use-toast';
import { isNotionClientInitialized } from '../integrations/notion/client';

const DebugPanel: React.FC = () => {
  const [supabaseStatus, setSupabaseStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [notionStatus, setNotionStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const { toast } = useToast();

  const testSupabaseConnection = async () => {
    setSupabaseStatus('loading');
    setConsoleOutput(prev => [...prev, 'Testing Supabase connection...']);
    
    try {
      const { data, error } = await supabase.from('conversations').select('count').limit(1);
      
      if (error) {
        throw error;
      }
      
      setSupabaseStatus('connected');
      setConsoleOutput(prev => [...prev, '✅ Supabase connection successful']);
    } catch (error: any) {
      setSupabaseStatus('error');
      setConsoleOutput(prev => [...prev, `❌ Supabase connection error: ${error.message}`]);
      
      // Check if the error is about missing table
      if (error.message && error.message.includes('does not exist')) {
        setConsoleOutput(prev => [...prev, '⚠️ The conversations table might not exist. Please run the SQL script to create it.']);
      }
    }
  };

  const testNotionConnection = () => {
    setNotionStatus('loading');
    setConsoleOutput(prev => [...prev, 'Testing Notion connection...']);
    
    try {
      if (isNotionClientInitialized()) {
        setNotionStatus('connected');
        setConsoleOutput(prev => [...prev, '✅ Notion client is initialized']);
      } else {
        setNotionStatus('error');
        setConsoleOutput(prev => [...prev, '❌ Notion client is not initialized']);
      }
    } catch (error: any) {
      setNotionStatus('error');
      setConsoleOutput(prev => [...prev, `❌ Notion check error: ${error.message}`]);
    }
  };

  const verifyDatabaseSchema = async () => {
    setConsoleOutput(prev => [...prev, 'Verifying database schema...']);
    
    try {
      // Check for the existence of the conversations table
      const { data: conversationsExists, error: conversationsError } = await supabase
        .from('conversations')
        .select('count')
        .limit(1);
      
      if (conversationsError) {
        if (conversationsError.message.includes('does not exist')) {
          setConsoleOutput(prev => [...prev, '❌ The conversations table does not exist']);
        } else {
          throw conversationsError;
        }
      } else {
        setConsoleOutput(prev => [...prev, '✅ The conversations table exists']);
      }
      
      // Check for the existence of the user_api_keys table
      const { data: apiKeysExists, error: apiKeysError } = await supabase
        .from('user_api_keys')
        .select('count')
        .limit(1);
      
      if (apiKeysError) {
        if (apiKeysError.message.includes('does not exist')) {
          setConsoleOutput(prev => [...prev, '❌ The user_api_keys table does not exist']);
        } else {
          throw apiKeysError;
        }
      } else {
        setConsoleOutput(prev => [...prev, '✅ The user_api_keys table exists']);
      }
    } catch (error: any) {
      setConsoleOutput(prev => [...prev, `❌ Schema verification error: ${error.message}`]);
    }
  };

  const clearConsole = () => {
    setConsoleOutput([]);
  };

  const exportSchemaSQL = () => {
    const schema = `
-- Define the conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    stack_id TEXT,
    messages JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS conversations_type_idx ON public.conversations(type);

-- Set up RLS (Row Level Security) for the conversations table
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own data
CREATE POLICY "Users can view their own conversations"
    ON public.conversations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own data
CREATE POLICY "Users can insert their own conversations"
    ON public.conversations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own data
CREATE POLICY "Users can update their own conversations"
    ON public.conversations
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy to allow users to delete their own data
CREATE POLICY "Users can delete their own conversations"
    ON public.conversations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
    `;
    
    // Create a blob and download link
    const blob = new Blob([schema], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supabase-create-conversations.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "SQL Exported",
      description: "The SQL schema has been downloaded"
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Terminal className="mr-2 h-5 w-5" />
          Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connections">
          <TabsList className="mb-4">
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="schema">Database Schema</TabsTrigger>
            <TabsTrigger value="console">Console</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connections" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  <span>Supabase Connection</span>
                </div>
                <div className="flex items-center space-x-2">
                  {supabaseStatus === 'loading' ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : supabaseStatus === 'connected' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <Button
                    onClick={testSupabaseConnection}
                    variant="outline"
                    size="sm"
                  >
                    Test Connection
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <Code className="mr-2 h-5 w-5" />
                  <span>Notion API</span>
                </div>
                <div className="flex items-center space-x-2">
                  {notionStatus === 'loading' ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : notionStatus === 'connected' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <Button
                    onClick={testNotionConnection}
                    variant="outline"
                    size="sm"
                  >
                    Test Connection
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="schema" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Button
                  onClick={verifyDatabaseSchema}
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Verify Schema
                </Button>
                
                <Button
                  onClick={exportSchemaSQL}
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export SQL Schema
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                <h3 className="text-sm font-medium mb-2">Required Tables:</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <ArrowRight className="h-3 w-3 mr-2" />
                    conversations - Stores chat history and message data
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-3 w-3 mr-2" />
                    user_api_keys - Stores encrypted API keys for services
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="console" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={clearConsole}
                variant="outline"
                size="sm"
              >
                Clear Console
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-black text-green-400 font-mono text-sm h-80 overflow-y-auto">
              {consoleOutput.length === 0 ? (
                <div className="text-gray-500">Console output will appear here...</div>
              ) : (
                consoleOutput.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap mb-1">{line}</div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DebugPanel; 