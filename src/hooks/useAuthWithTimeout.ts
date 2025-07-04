import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export function useAuthWithTimeout(timeoutMs = 10000) {
  const auth = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (auth.loading) {
        console.warn('Auth loading has timed out');
        setTimedOut(true);
      }
    }, timeoutMs);

    if (!auth.loading) {
      clearTimeout(timer);
      setTimedOut(false);
    }

    return () => clearTimeout(timer);
  }, [auth.loading, timeoutMs]);

  return {
    ...auth,
    timedOut
  };
}
