
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    // Show loading state while checking auth
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    // Redirect to auth page if not logged in
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
