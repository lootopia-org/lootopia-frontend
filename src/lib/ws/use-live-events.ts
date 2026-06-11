'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getAuthToken } from '@/lib/api/client';
import { invalidateLiveQueries } from '@/lib/api/queries';
import type { LiveEvent } from '@/types';

function getWsUrl(): string {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/ws`;
  }
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://api.wookiesrpeople2.dev';
  const wsBase = apiUrl.replace(/^http/, 'ws');
  return `${wsBase}/ws`;
}

function isLiveEvent(data: unknown): data is LiveEvent {
  return (
    typeof data === 'object' &&
    data !== null &&
    'topic' in data &&
    typeof (data as LiveEvent).topic === 'string' &&
    (data as LiveEvent).topic.length > 0
  );
}

export function useLiveEvents(enabled: boolean) {
  const qc = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;

    const token = getAuthToken();
    if (!token) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          action: 'subscribe',
          topics: ['hunts', 'profiles', 'hunt_steps'],
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as unknown;
        if (isLiveEvent(data)) {
          invalidateLiveQueries(qc, data);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      if (enabled) {
        reconnectTimer.current = setTimeout(connect, 5000);
      }
    };
  }, [enabled, qc]);

  useEffect(() => {
    connect();

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'ping' }));
      }
    }, 30_000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);
}
