
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Circle } from 'lucide-react';
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
      <div className="bg-[#22242f] p-8 rounded-lg shadow-md max-w-md w-full border border-white/5">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <Circle className="h-12 w-12 text-purple-500" fill="#9580ff" stroke="#9580ff" />
          </div>
          <h1 className="text-2xl font-bold text-white">Knoetic</h1>
          <p className="text-gray-400 mt-2">Please login to access your personalized chat agents</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#191b24] border-white/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#191b24] border-white/10"
            />
          </div>
          <Button
            onClick={handleLogin}
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={localIsLoading || isLoading}
          >
            {localIsLoading || isLoading ? "Logging in..." : "Login"}
          </Button>
          <div className="text-center text-sm text-gray-400 mt-4">
            <p>Don't have an account? <Button variant="link" className="p-0 text-purple-400" onClick={handleSignUp}>Sign up</Button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
