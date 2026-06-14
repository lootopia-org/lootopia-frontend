'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Trophy, Star, Map, Settings, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMe, useProfile, useJoinedHunts, useCompletedHunts } from '@/lib/api/queries';
import { DashboardSceneWrapper } from '@/components/three/dashboard-scene-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoleGuard } from '@/components/auth/role-guard';
import { formatDuration } from '@/lib/utils';

const MAX_LEVEL = 100;

const statVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  index,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  accent: string;
  index: number;
  loading?: boolean;
}) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={statVariants}>
      <Card className="h-full">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/50">{label}</p>
              {loading ? (
                <div className="mt-2 h-9 w-16 rounded-lg bg-white/5 animate-pulse" />
              ) : (
                <p className={`mt-1 font-[family-name:var(--font-syne)] text-3xl font-bold ${accent}`}>
                  {value}
                </p>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl glass">
              <Icon className={`h-5 w-5 ${accent}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LevelCard({
  level,
  index,
  loading,
  label,
}: {
  level: number;
  index: number;
  loading?: boolean;
  label: string;
}) {
  const pct = Math.min(100, Math.max(0, (level / MAX_LEVEL) * 100));

  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={statVariants}>
      <Card className="h-full">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm text-white/50">{label}</p>
              {loading ? (
                <div className="mt-2 h-9 w-16 rounded-lg bg-white/5 animate-pulse" />
              ) : (
                <>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-[family-name:var(--font-syne)] text-3xl font-bold text-teal">
                      {level}
                    </span>
                    <span className="text-xs text-white/30">/ {MAX_LEVEL}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-teal"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: index * 0.08 + 0.3, duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass">
              <TrendingUp className="h-5 w-5 text-teal" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const t = useTranslations('common.dashboard');
  const tCommon = useTranslations('common');
  const tShared = useTranslations('hunts.shared');
  const { data: user } = useMe();
  const { data: profile, isLoading: profileLoading } = useProfile(!!user);
  const { data: joinedHunts, isLoading: huntsLoading } = useJoinedHunts(!!user);
  const { data: completedHunts, isLoading: completedLoading } = useCompletedHunts(!!user);

  const activeCount = joinedHunts?.length ?? 0;
  const completedHuntCount = completedHunts?.length ?? 0;
  const level = profile?.level ?? 1;
  const points = profile?.points ?? 0;
  const completed = profile?.completedHunts ?? 0;

  return (
    <RoleGuard allowed={['player']}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between mb-10">
          <div>
            <h1 className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl font-bold">
              {t('heading', { username: user?.username ?? '' })}
            </h1>
            <p className="mt-2 text-white/50">{t('subhead')}</p>
          </div>
          <div className="flex items-center gap-3">
            <DashboardSceneWrapper />
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                {t('settingsLink')}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <LevelCard level={level} label={t('stats.level')} index={0} loading={profileLoading} />
          <StatCard icon={Star} label={t('stats.totalPoints')} value={points.toLocaleString()} accent="text-gold" index={1} loading={profileLoading} />
          <StatCard icon={Trophy} label={t('stats.huntsCompleted')} value={completed} accent="text-amber-300" index={2} loading={profileLoading} />
          <StatCard icon={Map} label={t('stats.activeHunts')} value={activeCount} accent="text-teal" index={3} loading={huntsLoading} />
        </div>

        {!profileLoading && !profile && (
          <Card className="mb-8 border-gold/20">
            <CardContent className="py-6">
              <p className="text-sm text-white/60">{t('profileEmpty')}</p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('joinedHunts.heading')}</CardTitle>
            {!huntsLoading && activeCount > 0 && (
              <Badge variant="teal">{t('joinedHunts.badge', { count: activeCount })}</Badge>
            )}
          </CardHeader>
          <CardContent>
            {huntsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : joinedHunts && joinedHunts.length > 0 ? (
              <ul className="space-y-3">
                {joinedHunts.map((hunt) => (
                  <li key={hunt.id} className="flex items-center justify-between rounded-xl glass px-4 py-3">
                    <div>
                      <Link href={`/hunts/${hunt.id}`} className="font-medium hover:text-gold">
                        {hunt.title}
                      </Link>
                      <p className="text-xs text-white/40 mt-1">
                        {tCommon('stepsDuration', {
                          stepCount: hunt.steps?.length ?? 0,
                          duration: formatDuration(hunt.estimatedDuration, (key, values) => tShared(key, values)),
                        })}
                      </p>
                    </div>
                    <Badge variant="teal">{t('joinedHunts.inProgress')}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white/50 text-sm">{t('joinedHunts.empty')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('completedHunts.heading')}</CardTitle>
            {!completedLoading && completedHuntCount > 0 && (
              <Badge variant="default">{t('completedHunts.badge', { count: completedHuntCount })}</Badge>
            )}
          </CardHeader>
          <CardContent>
            {completedLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : completedHunts && completedHunts.length > 0 ? (
              <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
                {completedHunts.map((hunt) => (
                  <li
                    key={hunt.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 opacity-75"
                  >
                    <div>
                      <Link href={`/hunts/${hunt.id}`} className="font-medium text-white/70 hover:text-gold line-through">
                        {hunt.title}
                      </Link>
                      <p className="text-xs text-white/35 mt-1">
                        {tCommon('stepsDuration', {
                          stepCount: hunt.steps?.length ?? 0,
                          duration: formatDuration(hunt.estimatedDuration, (key, values) => tShared(key, values)),
                        })}
                      </p>
                    </div>
                    <Badge variant="default">{t('completedHunts.completed')}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white/50 text-sm">{t('completedHunts.empty')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}