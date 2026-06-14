'use client';

import { Pause, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateHuntStatus } from '@/lib/api/queries';
import type { Hunt, HuntStatus } from '@/types';
import { Button } from '@/components/ui/button';

interface HuntPauseButtonProps {
  hunt: Hunt;
  size?: 'sm' | 'default';
}

export function HuntPauseButton({ hunt, size = 'sm' }: HuntPauseButtonProps) {
  const updateStatus = useUpdateHuntStatus(hunt.id);
  const isPaused = hunt.status === 'paused';
  const nextStatus: HuntStatus = isPaused ? 'active' : 'paused';
  const label = isPaused ? 'Resume hunt' : 'Pause hunt';

  const handleToggle = async () => {
    const action = isPaused ? 'resumed' : 'paused';
    try {
      await updateStatus.mutateAsync(nextStatus);
      toast.success(`Hunt ${action}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to ${isPaused ? 'resume' : 'pause'} hunt`);
    }
  };

  if (hunt.status === 'archived' || hunt.status === 'draft') {
    return null;
  }

  return (
    <Button
      size={size}
      variant={isPaused ? 'default' : 'secondary'}
      onClick={() => void handleToggle()}
      disabled={updateStatus.isPending}
    >
      {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
      {label}
    </Button>
  );
}
