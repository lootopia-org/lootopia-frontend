'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMe } from '@/lib/api/queries';
import type { UserRole } from '@/types';

export function RoleGuard({
  children,
  allowed,
  fallback = '/dashboard',
}: {
  children: React.ReactNode;
  allowed: UserRole[];
  fallback?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useMe();
  const allowedKey = allowed.join(',');
  const allowedSet = useMemo(() => new Set(allowed), [allowedKey]);

  useEffect(() => {
    if (!isLoading && user && !allowedSet.has(user.role)) {
      if (pathname !== fallback) {
        router.replace(fallback);
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
