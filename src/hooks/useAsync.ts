'use client';

import { useState, useCallback, useEffect } from 'react';
import { useNotificationStore } from '@/lib/notification-store';

export const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true,
  onSuccess?: (data: T) => void,
  onError?: (error: E) => void
) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const { addNotification } = useNotificationStore();

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setStatus('success');
      setData(response);
      onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err as E;
      setStatus('error');
      setError(error);
      addNotification({
        type: 'error',
        message: String(error),
      });
      onError?.(error);
    }
  }, [asyncFunction, onSuccess, onError, addNotification]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
};
