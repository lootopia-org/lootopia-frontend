'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, Download, MapPin, ListOrdered, Users } from 'lucide-react';
import { useHunt, useHuntAnalytics, useMe } from '@/lib/api/queries';
import { AppDownloadBanner } from '@/components/layout/app-download-banner';
import { HuntHeatmap } from '@/components/hunts/hunt-heatmap';
import { HuntParticipantsPanel } from '@/components/hunts/hunt-participants-panel';
import { HuntPauseButton } from '@/components/hunts/hunt-pause-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  canManageHunt,
  cn,
  difficultyBg,
  formatDuration,
  formatStepType,
  getAppDownloadUrl,
  huntStatusBadgeVariant,
  huntStatusLabel,
  isStaffRole,
} from '@/lib/utils';

export default function HuntDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: user, isLoading: userLoading } = useMe();
  const { data: hunt, isLoading, error } = useHunt(id);
  const { data: analytics, isLoading: analyticsLoading } = useHuntAnalytics(id, !!user);

  if (!userLoading && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-white/50 mb-8">Sign in to view hunt details.</p>
        <Button asChild>
          <Link href={`/auth/login?next=/hunts/${id}`}>Sign in</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="glass rounded-2xl h-96 animate-pulse" />
      </div>
    );
  }

  if (error || !hunt) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-white/50">Hunt not found or unavailable.</p>
        <Button variant="secondary" className="mt-4" asChild>
          <Link href="/hunts">Back to catalog</Link>
        </Button>
      </div>
    );
  }

  const sortedSteps = [...(hunt.steps ?? [])].sort((a, b) => a.order - b.order);
  const totalPoints = sortedSteps.reduce((sum, step) => sum + (step.points ?? 0), 0);
  const canManage = canManageHunt(hunt, user);
  const showDownloadCta = !isStaffRole(user);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link href="/hunts" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-gold mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to catalog
      </Link>

      <div className="relative aspect-[21/9] overflow-hidden rounded-2xl mb-8">
        {hunt.image ? (
          <Image src={hunt.image} alt={hunt.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gold/10 to-teal/10">
            <MapPin className="h-16 w-16 text-gold/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex gap-2 mb-3 flex-wrap">
            <Badge className={cn('capitalize', difficultyBg(hunt.difficulty))}>
              {hunt.difficulty}
            </Badge>
            <Badge variant={huntStatusBadgeVariant(hunt.status)}>
              {huntStatusLabel(hunt.status)}
            </Badge>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl font-bold">
              {hunt.title}
            </h1>
            {canManage && <HuntPauseButton hunt={hunt} size="default" />}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <p className="text-white/70 leading-relaxed">{hunt.description}</p>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gold" />
                Player activity heatmap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsLoading || !analytics ? (
                <div className="h-72 rounded-xl glass animate-pulse" />
              ) : (
                <>
                  <HuntHeatmap
                    analytics={analytics}
                    mapKey={analytics.steps
                      .map(
                        (step) =>
                          `${step.stepId}:${step.order}:${step.latitude ?? ''}:${step.longitude ?? ''}:${step.title}`
                      )
                      .join('|')}
                  />
                  <div className="flex flex-wrap gap-4 text-xs text-white/50">
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-gold/70" />
                      Step completions (size = popularity)
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-full bg-teal-400/70" />
                      Recent player locations
                    </span>
                    <span>
                      {analytics.participantCount} participants · {analytics.completedHuntCount} finished
                    </span>
                  </div>
                  {analytics.steps.length > 0 && (
                    <ol className="space-y-2">
                      {[...analytics.steps]
                        .sort((a, b) => b.completionCount - a.completionCount)
                        .slice(0, 5)
                        .map((step) => (
                          <li key={step.stepId} className="flex justify-between text-sm text-white/70">
                            <span>{step.order}. {step.title}</span>
                            <span className="text-gold">{step.completionCount} visits</span>
                          </li>
                        ))}
                    </ol>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListOrdered className="h-5 w-5 text-gold" />
                Steps ({sortedSteps.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {sortedSteps.map((step) => (
                  <li key={step.id ?? step.order} className="flex gap-4 rounded-xl glass p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold text-sm font-bold">
                      {step.order}
                    </span>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-white/50 mt-1">{step.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="default">{formatStepType(step.type)}</Badge>
                        <Badge variant="gold">{step.points} pts</Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {canManage && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Users className="h-4 w-4" />
                Participants
              </div>
              <HuntParticipantsPanel huntId={hunt.id} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Clock className="h-4 w-4" />
                {formatDuration(hunt.estimatedDuration)}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="h-4 w-4" />
                {sortedSteps.length} steps · {totalPoints} points
              </div>
              {hunt.status === 'paused' && (
                <p className="text-sm text-gold">This hunt is currently paused. Gameplay is temporarily unavailable.</p>
              )}
              <Button className="w-full" size="lg" asChild>
                <a href={getAppDownloadUrl()} download>
                  <Download className="h-5 w-5" />
                  Download app to play
                </a>
              </Button>
              <p className="text-xs text-white/40 text-center">
                Gameplay requires the Lootopia mobile app
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {showDownloadCta && (
        <div className="mt-12">
          <AppDownloadBanner
            title="Ready to hunt?"
            description="This adventure is waiting for you in the Lootopia app. GPS, AR, and riddles come alive on mobile."
          />
        </div>
      )}
    </div>
  );
}
