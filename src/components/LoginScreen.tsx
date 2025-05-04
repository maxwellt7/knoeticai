
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface LoginScreenProps {
  onLogin: () => void;
  isLoading: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoading }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localIsLoading, setLocalIsLoading] = useState(false);

  const handleLogin = async () => {
    setLocalIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      onLogin();
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "There was an error logging in",
        variant: "destructive"
      });
    } finally {
      setLocalIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate('/auth');
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">Multi-Agent Chat</h1>
          <p className="text-gray-600 mt-2">Please login to access your personalized chat agents</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            onClick={handleLogin}
            className="w-full"
            disabled={localIsLoading || isLoading}
          >
            {localIsLoading || isLoading ? "Logging in..." : "Login"}
          </Button>
          <div className="text-center text-sm text-gray-600 mt-4">
            <p>Don't have an account? <Button variant="link" className="p-0" onClick={handleSignUp}>Sign up</Button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
