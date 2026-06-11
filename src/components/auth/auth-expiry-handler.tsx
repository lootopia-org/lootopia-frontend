'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { registerUnauthorizedHandler } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/queries';
import { useAuthStore } from '@/lib/auth/session-store';

export function AuthExpiryHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const redirecting = useRef(false);
  const reset = useAuthStore((s) => s.reset);
  const qc = useQueryClient();

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      if (redirecting.current || pathname.startsWith('/auth')) return;
      redirecting.current = true;
      reset();
      qc.removeQueries({ queryKey: queryKeys.me });
      const next = encodeURIComponent(pathname);
      router.replace(`/auth/login?next=${next}`);
    });
  }, [pathname, router, reset, qc]);

  return null;
}
