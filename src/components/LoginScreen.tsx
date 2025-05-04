
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginScreenProps {
  onLogin: () => void;
  isLoading: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoading }) => {
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
            />
          </div>
          <Button
            onClick={onLogin}
            className="w-full"
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <div className="text-center text-sm text-gray-600 mt-4">
            <p>Don't have an account? <a href="#" className="text-blue-600 hover:text-blue-800">Sign up</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
