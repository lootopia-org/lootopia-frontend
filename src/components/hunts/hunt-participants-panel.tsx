'use client';

import { useTranslations } from 'next-intl';
import { useHuntParticipants } from '@/lib/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HuntParticipantsPanelProps {
  huntId: string;
}

export function HuntParticipantsPanel({ huntId }: HuntParticipantsPanelProps) {
  const t = useTranslations('hunts.participants');
  const { data: participants, isLoading, error } = useHuntParticipants(huntId);

  const sortedParticipants = [...(participants ?? [])].sort(
    (a, b) => (b.pointsAwarded ?? 0) - (a.pointsAwarded ?? 0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title', { count: participants?.length ?? 0 })}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-white/50">{t('loadFailed')}</p>
        ) : sortedParticipants.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sortedParticipants.map((p) => (
              <div
                key={p.userId}
                className="flex items-center justify-between rounded-lg glass px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{p.email}</p>
                  <p className="text-xs text-white/40">
                    {t('joined', {
                      date: p.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : '—',
                    })}
                  </p>
                  {typeof p.points === 'number' && (
                    <p className="mt-1 text-xs text-white/50">
                      {t('totalPoints', { points: p.points })}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <Badge variant={p.completedAt ? 'teal' : 'default'}>
                    {p.completedAt ? t('status.completed') : t('status.inProgress')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/50">{t('empty')}</p>
        )}
      </CardContent>
    </Card>
  );
}
