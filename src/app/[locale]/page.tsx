'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Map, Sparkles, Trophy, Download } from 'lucide-react';
import { HeroScene } from '@/components/three/hero-scene-wrapper';
import { AppDownloadBanner } from '@/components/layout/app-download-banner';
import { HuntCard } from '@/components/hunts/hunt-card';
import { Button } from '@/components/ui/button';
import { useHunts, useMe } from '@/lib/api/queries';
import { getAppDownloadUrl, huntStatusSortOrder, isPublicHuntStatus, isStaffRole } from '@/lib/utils';

export default function HomePage() {
  const t = useTranslations('common.home');
  const tNav = useTranslations('common.nav.auth');
  const { data: user } = useMe();
  const { data: hunts, isLoading } = useHunts(!!user);
  const showDownloadCta = !isStaffRole(user);

  const features = [
    { icon: Map, title: t('features.realWorld.title'), description: t('features.realWorld.description') },
    { icon: Sparkles, title: t('features.ar.title'), description: t('features.ar.description') },
    { icon: Trophy, title: t('features.legacy.title'), description: t('features.legacy.description') },
  ];

  const featured =
    hunts
      ?.filter((h) => isPublicHuntStatus(h.status))
      .sort((a, b) => huntStatusSortOrder(a.status) - huntStatusSortOrder(b.status))
      .slice(0, 3) ?? [];

  return (
    <>
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <HeroScene />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl glass-strong rounded-3xl p-8 md:p-12 glow-gold"
          >
            <p className="text-sm font-medium uppercase tracking-widest text-teal mb-4">
              {t('eyebrow')}
            </p>
            <h1 className="font-[family-name:var(--font-syne)] text-4xl md:text-6xl font-bold leading-tight">
              {t('headline')}
            </h1>
            <p className="mt-6 text-lg text-white/60 leading-relaxed">{t('subhead')}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              {showDownloadCta && (
                <Button size="lg" asChild>
                  <a href={getAppDownloadUrl()} download>
                    <Download className="h-5 w-5" />
                    {t('downloadApp')}
                  </a>
                </Button>
              )}
              <Button variant="secondary" size="lg" asChild>
                <Link href="/hunts">
                  {t('browseHunts')}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-center mb-12">
          {t('features.heading')}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6"
            >
              <feature.icon className="h-8 w-8 text-gold mb-4" />
              <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-white/50">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold">{t('featured.heading')}</h2>
            <p className="mt-2 text-white/50">{t('featured.subhead')}</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/hunts">{t('featured.viewAll')} <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl aspect-[4/3] animate-pulse" />
            ))}
          </div>
        ) : !user ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-white/50 mb-4">{t('featured.signInPrompt')}</p>
            <Button variant="secondary" asChild>
              <Link href="/auth/login">{tNav('signIn')}</Link>
            </Button>
          </div>
        ) : featured.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((hunt) => (
              <HuntCard key={hunt.id} hunt={hunt} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center text-white/50">
            {t('featured.empty')}
          </div>
        )}
      </section>

      {showDownloadCta && (
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
          <AppDownloadBanner />
        </section>
      )}
    </>
  );
}
