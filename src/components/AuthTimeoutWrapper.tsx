'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, AlertCircle } from 'lucide-react';

interface AuthTimeoutWrapperProps {
  children: React.ReactNode;
  timeoutMs?: number;
}

export function AuthTimeoutWrapper({ children, timeoutMs = 6000 }: AuthTimeoutWrapperProps) {
  const { loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      setRetryCount(0);
      return;
    }

    const timer = setTimeout(() => {
      setTimedOut(true);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [loading, timeoutMs, retryCount]);

  const handleRetry = () => {
    setTimedOut(false);
    setRetryCount(prev => prev + 1);
    // Force a page reload to retry auth
    window.location.reload();
  };

  const handleSkipAuth = () => {
    // For development - allow proceeding without auth
    setTimedOut(false);
  };

  // Render a consistent loading state on server and client to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-8 w-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading Recipe Hub...</p>
        </div>
      </div>
    );
  }

  if (loading && timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-gray-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Loading Timeout</h1>
            <p className="text-gray-600">
              The app is taking longer than expected to load. This might be due to a slow network connection.
            </p>
          </div>

        <div className="space-y-3">
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/auth?mode=login'}
            className="w-full"
          >
            Go to Sign In
          </Button>

          {process.env.NODE_ENV === 'development' && (
            <Button 
              variant="ghost" 
              onClick={handleSkipAuth}
              className="w-full text-sm"
            >
              Skip Auth (Dev Only)
            </Button>
          )}
        </div>

        {retryCount > 0 && (
          <p className="text-gray-600 text-sm">
            Retry attempt: {retryCount}
          </p>
        )}

        <div className="text-gray-600 text-xs space-y-1">
          <p>If this continues:</p>
          <ul className="text-left space-y-1">
            <li>• Check your internet connection</li>
            <li>• Try refreshing the page</li>
            <li>• Clear browser cache</li>
          </ul>
        </div>
      </div>
    </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <p className="text-gray-600">Loading Recipe Hub...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
