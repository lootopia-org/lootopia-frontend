'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Trash2, Pencil, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useManagedHunts, useDeleteHunt, useUpdateHuntStatus } from '@/lib/api/queries';
import { RoleGuard } from '@/components/auth/role-guard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration, huntStatusBadgeVariant } from '@/lib/utils';
import type { Hunt, HuntStatus } from '@/types';

function HuntStatusToggle({ hunt }: { hunt: Hunt }) {
  const t = useTranslations('hunts.shared.pause');
  const tCommon = useTranslations('common');
  const updateStatus = useUpdateHuntStatus(hunt.id);
  if (hunt.status !== 'active' && hunt.status !== 'paused') return null;

  const isPaused = hunt.status === 'paused';
  const nextStatus: HuntStatus = isPaused ? 'active' : 'paused';

  const handleToggle = async () => {
    try {
      await updateStatus.mutateAsync(nextStatus);
      toast.success(isPaused ? t('toasts.resumed') : t('toasts.paused'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.statusUpdateFailed'));
    }
  };

  return (
    <Button size="sm" variant="secondary" onClick={() => void handleToggle()} disabled={updateStatus.isPending}>
      {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
      {isPaused ? tCommon('actions.resume') : tCommon('actions.suspend')}
    </Button>
  );
}

export default function AdminHuntsPage() {
  const t = useTranslations('admin.hunts');
  const tDelete = useTranslations('hunts.shared.delete');
  const tShared = useTranslations('hunts.shared');
  const tCommon = useTranslations('common');
  const { data: hunts, isLoading } = useManagedHunts();
  const deleteHunt = useDeleteHunt();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(tDelete('confirm', { title }))) return;
    try {
      await deleteHunt.mutateAsync(id);
      toast.success(tDelete('deleted'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tDelete('deleteFailed'));
    }
  };

  return (
    <RoleGuard allowed={['admin']}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" /> {t('back')}
          </Link>
        </Button>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold">{t('heading')}</h1>
          <Button asChild>
            <Link href="/partner/hunts/new">{t('createHunt')}</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('tableTitle', { count: hunts?.length ?? 0 })}</CardTitle>
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
                          {tShared(`statusSelect.${hunt.status}`)}
                        </Badge>
                      </div>
                      <p className="text-xs text-white/40 mt-1">
                        {t('meta', {
                          stepCount: hunt.steps?.length ?? 0,
                          duration: formatDuration(hunt.estimatedDuration, (key, values) => tShared(key, values)),
                          partnerIdPrefix: hunt.partnerId.slice(0, 8),
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <HuntStatusToggle hunt={hunt} />
                      <Button size="sm" variant="secondary" asChild>
                        <Link href={`/partner/hunts/${hunt.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                          {t('actions.edit')}
                        </Link>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(hunt.id, hunt.title)}>
                        <Trash2 className="h-3.5 w-3.5" />
                        {t('actions.delete')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/50">{t('empty')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
