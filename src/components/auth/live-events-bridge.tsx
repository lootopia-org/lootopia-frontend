'use client';

import { useMe } from '@/lib/api/queries';
import { useLiveEvents } from '@/lib/ws/use-live-events';

export function LiveEventsBridge() {
  const { data: user } = useMe();
  useLiveEvents(!!user);
  return null;
}
