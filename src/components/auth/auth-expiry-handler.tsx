'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { registerUnauthorizedHandler } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/queries';
import { useAuthStore } from '@/lib/auth/session-store';
import { isAuthPath } from '@/lib/utils';

export function AuthExpiryHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const redirecting = useRef(false);
  const reset = useAuthStore((s) => s.reset);
  const qc = useQueryClient();

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      if (redirecting.current || isAuthPath(pathname)) return;
      redirecting.current = true;
      reset();
      qc.removeQueries({ queryKey: queryKeys.me });
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    });
  }, [pathname, router, reset, qc]);

  return null;
}
