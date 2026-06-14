'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useMe } from '@/lib/api/queries';
import type { UserRole } from '@/types';

export const ROLE_HOME: Record<UserRole, '/dashboard' | '/partner' | '/admin'> = {
  player: '/dashboard',
  partner: '/partner',
  admin: '/admin',
};

export function RoleGuard({
  children,
  allowed,
  fallback,
}: {
  children: React.ReactNode;
  allowed: UserRole[];
  fallback?: '/dashboard' | '/partner' | '/admin';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useMe();
  const allowedKey = allowed.join(',');
  const allowedSet = useMemo(() => new Set(allowed), [allowedKey]);

  useEffect(() => {
    if (!isLoading && user && !allowedSet.has(user.role)) {
      const redirectTo = fallback ?? ROLE_HOME[user.role];
      if (pathname !== redirectTo) {
        router.replace(redirectTo);
      }
    }
  }, [user, isLoading, allowedSet, fallback, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!allowedSet.has(user.role)) return null;

  return <>{children}</>;
}
