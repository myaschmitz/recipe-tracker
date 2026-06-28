import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { TIMEOUTS } from '@/config/constants';

export function useAuthWithTimeout(timeoutMs = TIMEOUTS.AUTH_TIMEOUT) {
  const auth = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (auth.loading) {
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
