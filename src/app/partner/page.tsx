'use client';

import Link from 'next/link';
import { Plus, Pencil, Trash2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/auth/session-store';
import { useHunts, useDeleteHunt, useMe } from '@/lib/api/queries';
import { RoleGuard } from '@/components/auth/role-guard';
import { HuntCard } from '@/components/hunts/hunt-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PartnerPage() {
  const { data: user } = useMe();
  const { data: hunts, isLoading } = useHunts();
  const deleteHunt = useDeleteHunt();
  const reset = useAuthStore((s) => s.reset);

  const myHunts =
    hunts?.filter(
      (h) => h.partnerId === user?.id || user?.role === 'admin'
    ) ?? [];

  const partnerHunts =
    user?.role === 'admin' ? (hunts ?? []) : myHunts;

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteHunt.mutateAsync(id);
      toast.success('Hunt deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    reset();
    window.location.href = '/';
  };

  return (
    <RoleGuard allowed={['partner', 'admin']}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold">
              Partner <span className="text-gold">studio</span>
            </h1>
            <p className="mt-2 text-white/50">Create and manage your treasure hunts</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/partner/hunts/new">
                <Plus className="h-4 w-4" /> New hunt
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl aspect-[4/3] animate-pulse" />
            ))}
          </div>
        ) : partnerHunts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partnerHunts.map((hunt) => (
              <div key={hunt.id} className="relative group">
                <HuntCard hunt={hunt} />
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-8 w-8" asChild>
                    <Link href={`/partner/hunts/${hunt.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleDelete(hunt.id, hunt.title)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="absolute top-3 left-3">
                  <Badge variant={hunt.status === 'active' ? 'teal' : 'draft'}>
                    {hunt.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-16 text-center">
            <p className="text-white/50 mb-6">No hunts yet. Create your first adventure!</p>
            <Button asChild>
              <Link href="/partner/hunts/new">
                <Plus className="h-4 w-4" /> Create hunt
              </Link>
            </Button>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
