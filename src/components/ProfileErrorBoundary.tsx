"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ProfileErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ProfileErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ProfileErrorBoundary extends React.Component<
  ProfileErrorBoundaryProps,
  ProfileErrorBoundaryState
> {
  constructor(props: ProfileErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ProfileErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Profile Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <h1 className="text-2xl font-bold text-destructive">Profile Loading Error</h1>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                There was an issue loading your profile. This might be due to:
              </p>
              
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Network connectivity issues</li>
                <li>Database connection timeout</li>
                <li>Authentication session expired</li>
              </ul>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                >
                  Go to Home
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Development Error Details:</h3>
                  <pre className="text-xs text-red-700 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ProfileErrorBoundary;
