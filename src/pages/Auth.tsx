
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Password Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account",
        });
        
        // For development, auto redirect since we don't want to wait for email verification
        navigate('/');
      } else {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in",
        });
        
        navigate('/');
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication failed",
        description: error.message || "There was an error during authentication",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">Multi-Agent Chat</h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? "Create your account" : "Please login to access your personalized chat agents"}
          </p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
          </Button>
          
          <div className="text-center text-sm text-gray-600 mt-4">
            {isSignUp ? (
              <p>Already have an account? <button 
                type="button"
                onClick={() => setIsSignUp(false)} 
                className="text-blue-600 hover:text-blue-800"
              >
                Login
              </button></p>
            ) : (
              <p>Don't have an account? <button 
                type="button"
                onClick={() => setIsSignUp(true)} 
                className="text-blue-600 hover:text-blue-800"
              >
                Sign up
              </button></p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
