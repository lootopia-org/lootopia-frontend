'use client';

import Link from 'next/link';
import { ArrowLeft, Trash2, Pencil, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useManagedHunts, useDeleteHunt, useUpdateHuntStatus } from '@/lib/api/queries';
import { RoleGuard } from '@/components/auth/role-guard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration, huntStatusBadgeVariant, huntStatusLabel } from '@/lib/utils';
import type { Hunt, HuntStatus } from '@/types';

function HuntStatusToggle({ hunt }: { hunt: Hunt }) {
  const updateStatus = useUpdateHuntStatus(hunt.id);
  if (hunt.status !== 'active' && hunt.status !== 'paused') return null;

  const isPaused = hunt.status === 'paused';
  const nextStatus: HuntStatus = isPaused ? 'active' : 'paused';

  const handleToggle = async () => {
    try {
      await updateStatus.mutateAsync(nextStatus);
      toast.success(isPaused ? 'Hunt resumed' : 'Hunt paused');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Status update failed');
    }
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => void handleToggle()}
      disabled={updateStatus.isPending}
    >
      {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
      {isPaused ? 'Resume' : 'Pause'}
    </Button>
  );
}

export default function AdminHuntsPage() {
  const { data: hunts, isLoading } = useManagedHunts();
  const deleteHunt = useDeleteHunt();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteHunt.mutateAsync(id);
      toast.success('Hunt deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <RoleGuard allowed={['admin']}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" /> Back to admin
          </Link>
        </Button>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold">
            Manage <span className="text-gold">hunts</span>
          </h1>
          <Button asChild>
            <Link href="/partner/hunts/new">Create hunt</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All hunts ({hunts?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : hunts && hunts.length > 0 ? (
              <div className="space-y-3">
                {hunts.map((hunt) => (
                  <div
                    key={hunt.id}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl glass px-4 py-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/hunts/${hunt.id}`} className="font-medium hover:text-gold">
                          {hunt.title}
                        </Link>
                        <Badge variant={huntStatusBadgeVariant(hunt.status)}>
                          {huntStatusLabel(hunt.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-white/40 mt-1">
                        {hunt.steps?.length ?? 0} steps · {formatDuration(hunt.estimatedDuration)} · Partner {hunt.partnerId.slice(0, 8)}…
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <HuntStatusToggle hunt={hunt} />
                      <Button size="sm" variant="secondary" asChild>
                        <Link href={`/partner/hunts/${hunt.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(hunt.id, hunt.title)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/50">No hunts yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
