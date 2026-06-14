'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Search } from 'lucide-react';
import { HuntCard } from '@/components/hunts/hunt-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useHunts, useMe } from '@/lib/api/queries';
import type { HuntDifficulty } from '@/types';
import { isPublicHuntStatus } from '@/lib/utils';
import { useMemo, useState } from 'react';

const difficulties: (HuntDifficulty | 'all')[] = ['all', 'easy', 'medium', 'hard'];

export default function HuntsPage() {
  const t = useTranslations('hunts.catalog');
  const tDiff = useTranslations('hunts.shared.difficulties');
  const { data: user, isLoading: userLoading } = useMe();
  const { data: hunts, isLoading, error } = useHunts(!!user);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<HuntDifficulty | 'all'>('all');

  const filtered = useMemo(() => {
    if (!hunts) return [];
    return hunts.filter((h) => {
      const matchesSearch = h.title.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = difficulty === 'all' || h.difficulty === difficulty;
      const isVisible = isPublicHuntStatus(h.status);
      return matchesSearch && matchesDifficulty && isVisible;
    });
  }, [hunts, search, difficulty]);

  if (!userLoading && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold mb-4">{t('guest.heading')}</h1>
        <p className="text-white/50 mb-8">{t('guest.message')}</p>
        <Button asChild>
          <Link href="/auth/login?next=/hunts">{t('guest.signIn')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl font-bold">
          {t('pageHeading')}{' '}
          <span className="text-gold">{t('catalogAccent')}</span>
        </h1>
        <p className="mt-2 text-white/50">{t('subhead')}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            className="pl-10"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {difficulties.map((d) => (
            <Button
              key={d}
              variant={difficulty === d ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setDifficulty(d)}
            >
              {tDiff(d)}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass rounded-2xl aspect-[4/3] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-12 text-center text-white/50">
          {t('errors.loadFailed')}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((hunt) => (
            <HuntCard key={hunt.id} hunt={hunt} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center text-white/50">
          {t('empty')}
        </div>
      )}
    </div>
  );
}
