'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Map, Sparkles, Trophy, Download } from 'lucide-react';
import { HeroScene } from '@/components/three/hero-scene-wrapper';
import { AppDownloadBanner } from '@/components/layout/app-download-banner';
import { HuntCard } from '@/components/hunts/hunt-card';
import { Button } from '@/components/ui/button';
import { useHunts, useMe } from '@/lib/api/queries';
import { getAppDownloadUrl, huntStatusSortOrder, isPublicHuntStatus, isStaffRole } from '@/lib/utils';

const features = [
  {
    icon: Map,
    title: 'Real-world adventures',
    description: 'GPS checkpoints and location-based puzzles take you through cities and landmarks.',
  },
  {
    icon: Sparkles,
    title: 'AR treasure hunts',
    description: 'Discover hidden loot through augmented reality — exclusively in the mobile app.',
  },
  {
    icon: Trophy,
    title: 'Track your legacy',
    description: 'View points, level, and completed hunts on your web dashboard.',
  },
];

export default function HomePage() {
  const { data: user } = useMe();
  const { data: hunts, isLoading } = useHunts(!!user);
  const showDownloadCta = !isStaffRole(user);
  const featured =
    hunts
      ?.filter((h) => isPublicHuntStatus(h.status))
      .sort((a, b) => huntStatusSortOrder(a.status) - huntStatusSortOrder(b.status))
      .slice(0, 3) ?? [];

  return (
    <>
      {/* Hero */}
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
              Treasure hunts reimagined
            </p>
            <h1 className="font-[family-name:var(--font-syne)] text-4xl md:text-6xl font-bold leading-tight">
              Find loot.{' '}
              <span className="text-gradient-gold">Level up.</span>
              <br />
              Explore the world.
            </h1>
            <p className="mt-6 text-lg text-white/60 leading-relaxed">
              Browse hunts on the web, track your stats, and download the app to play with AR, GPS, and live riddles.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {showDownloadCta && (
                <Button size="lg" asChild>
                  <a href={getAppDownloadUrl()} download>
                    <Download className="h-5 w-5" />
                    Download app
                  </a>
                </Button>
              )}
              <Button variant="secondary" size="lg" asChild>
                <Link href="/hunts">
                  Browse hunts
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-center mb-12">
          How <span className="text-gold">Lootopia</span> works
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

      {/* Featured hunts */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold">Featured hunts</h2>
            <p className="mt-2 text-white/50">Preview adventures — play them in the app</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/hunts">View all <ArrowRight className="h-4 w-4" /></Link>
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
            <p className="text-white/50 mb-4">Sign in to preview featured hunts from the catalog.</p>
            <Button variant="secondary" asChild>
              <Link href="/auth/login">Sign in</Link>
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
            No hunts available yet. Check back soon!
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
