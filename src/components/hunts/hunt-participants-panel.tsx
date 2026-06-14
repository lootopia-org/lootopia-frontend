'use client';

import { useHuntParticipants } from '@/lib/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HuntParticipantsPanelProps {
  huntId: string;
}

export function HuntParticipantsPanel({ huntId }: HuntParticipantsPanelProps) {
  const { data: participants, isLoading, error } = useHuntParticipants(huntId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants ({participants?.length ?? 0})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-white/50">Unable to load participants.</p>
        ) : participants && participants.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {participants.map((p) => (
              <div
                key={p.userId}
                className="flex items-center justify-between rounded-lg glass px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{p.email}</p>
                  <p className="text-xs text-white/40">
                    Joined {p.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={p.completedAt ? 'teal' : 'default'}>
                    {p.completedAt ? 'Completed' : 'In progress'}
                  </Badge>
                  <p className="mt-1 text-xs text-gold">{p.pointsAwarded} pts</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/50">No participants yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
