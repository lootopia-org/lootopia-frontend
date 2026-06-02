'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
  
  // Use refs for callbacks to avoid dependency issues
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const asyncFunctionRef = useRef(asyncFunction);
  
  // Update refs when callbacks change
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction, onSuccess, onError]);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunctionRef.current();
      setStatus('success');
      setData(response);
      onSuccessRef.current?.(response);
      return response;
    } catch (err) {
      const error = err as E;
      setStatus('error');
      setError(error);
      addNotification({
        type: 'error',
        message: String(error),
      });
      onErrorRef.current?.(error);
    }
  }, [addNotification]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
};
