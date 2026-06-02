'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { tokenService } from '@/lib/storage-service';

export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setLoading, initializeAuth, logout } =
    useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  };

  const requirePartnerAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!isLoading && isAuthenticated && user?.role !== 'admin' && user?.role !== 'partner') {
      router.push('/chases');
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    requireAuth,
    requirePartnerAuth,
  };
};
