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

  useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      setRetryCount(0);
      return;
    }

    const timer = setTimeout(() => {
      console.warn('Auth loading timeout reached');
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
    console.warn('Skipping auth loading - proceeding without authentication');
  };

  // Use exact theme colors to match the app perfectly
  // Use direct HSL values to avoid white flash before CSS loads
  // Single style object that uses CSS media queries for responsive theming
  const loadingStyle = {
    colorScheme: 'light dark' as const,
    backgroundColor: 'hsl(199, 20%, 98%)', // Light: --neutral-50 (background)
    color: 'hsl(199, 18%, 9%)',           // Light: --neutral-900 (foreground)
  };

  // CSS media query styles for dark mode
  const darkModeStyles = `
    @media (prefers-color-scheme: dark) {
      .loading-container {
        background-color: hsl(199, 18%, 9%) !important;
        color: hsl(199, 18%, 96%) !important;
      }
      .loading-text {
        color: hsl(199, 12%, 64%) !important;
      }
      .loading-spinner {
        color: hsl(199, 41%, 42%) !important;
      }
      .loading-icon {
        color: hsl(199, 12%, 64%) !important;
      }
    }
  `;

  if (loading && timedOut) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: darkModeStyles }} />
        <div className="loading-container min-h-screen flex items-center justify-center p-4" style={loadingStyle}>
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <AlertCircle className="loading-icon h-16 w-16" style={{ color: 'hsl(199, 12%, 32%)' }} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold" style={{ color: 'hsl(199, 18%, 9%)' }}>Loading Timeout</h1>
              <p className="loading-text" style={{ color: 'hsl(199, 12%, 32%)' }}>
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
            <p className="loading-text text-sm" style={{ color: 'hsl(199, 12%, 32%)' }}>
              Retry attempt: {retryCount}
            </p>
          )}

          <div className="loading-text text-xs space-y-1" style={{ color: 'hsl(199, 12%, 32%)' }}>
            <p>If this continues:</p>
            <ul className="text-left space-y-1">
              <li>• Check your internet connection</li>
              <li>• Try refreshing the page</li>
              <li>• Clear browser cache</li>
            </ul>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: darkModeStyles }} />
        <div className="loading-container min-h-screen flex items-center justify-center p-4" style={loadingStyle}>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {/* Use the same primary color as the app's theme */}
              <Loader2 
                className="loading-spinner h-8 w-8 animate-spin" 
                style={{ color: 'hsl(199, 41%, 33%)' }} 
              />
            </div>
            <p className="loading-text" style={{ color: 'hsl(199, 12%, 32%)' }}>Loading Recipe Hub...</p>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
