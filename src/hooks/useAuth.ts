import { useState, useEffect } from "react";

// Mock auth hook - replace with real authentication later
export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      // TODO: Replace with actual auth logic
      // For now, return false to show landing page
      setUser(null); // Change to a user object when you want to test dashboard
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { user, isLoading };
}
