'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { AuthExpiryHandler } from '@/components/auth/auth-expiry-handler';
import { LiveEventsBridge } from '@/components/auth/live-events-bridge';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthExpiryHandler />
      <LiveEventsBridge />
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(11, 15, 26, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f8fafc',
          },
        }}
      />
    </QueryClientProvider>
  );
}
