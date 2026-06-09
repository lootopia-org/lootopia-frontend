'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { motion } from 'framer-motion';
import { useI18n } from '@/hooks/useI18n';

export default function Home() {
  const { t } = useI18n();

  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.553-.894L9 7.5m0 0l6.553-3.894A1 1 0 0117 5.618v10.764a1 1 0 01-1.553.894L9 12.5m0 0V20m6.553-15.894A1 1 0 0117 5.618v10.764m0 0l5.447 2.724A1 1 0 0024 18.382V7.618a1 1 0 00-1.553-.894L17 9.5" />
        </svg>
      ),
      titleKey: 'home.features.interactiveMaps',
      descKey: 'home.features.mapsDesc',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.5a2 2 0 00-1 .268M7 21H5a2 2 0 01-2-2v-4a2 2 0 012-2h2.5" />
        </svg>
      ),
      titleKey: 'home.features.arExperience',
      descKey: 'home.features.arDesc',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      titleKey: 'home.features.gamification',
      descKey: 'home.features.gamificationDesc',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
        </svg>
      ),
      titleKey: 'home.features.socialPlay',
      descKey: 'home.features.socialDesc',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="bg-gradient text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold">{t('home.welcome')}</h1>
            <p className="text-xl md:text-2xl text-orange-100 max-w-2xl mx-auto">
              {t('home.subtitle')}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/chases">
                <Button size="lg" className="!bg-white !text-primary hover:!bg-orange-50">
                  {t('home.exploreChasesBtn')}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline">
                  {t('home.getStartedBtn')}
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-16 flex justify-center"
          >
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80"
                alt={t('home.exploreChasesBtn')}
                width={520}
                height={320}
                priority
                className="w-[300px] h-[200px] md:w-[520px] md:h-[320px] rounded-3xl object-cover shadow-2xl ring-4 ring-white/20"
              />
              <div className="absolute -bottom-6 -left-4 md:-left-8 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&h=96&q=80"
                  alt="Treasure Player"
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full"
                />
                <div className="text-left">
                  <p className="text-sm font-bold leading-tight text-dark">Treasure Player</p>
                  <p className="text-xs text-gray-500">Lvl 8 · 1240 pts</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-dark text-center mb-16">{t('home.whyChoose')}</h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="text-center space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center mx-auto">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-dark">{t(feature.titleKey)}</h3>
                  <p className="text-gray-600 text-sm">{t(feature.descKey)}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-secondary text-white py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <div className="text-4xl font-bold mb-2">10K+</div>
            <p>{t('home.stats.activePlayers')}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-4xl font-bold mb-2">500+</div>
            <p>{t('home.stats.treasureHunts')}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-4xl font-bold mb-2">100+</div>
            <p>{t('home.stats.locations')}</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold text-dark">{t('home.readyForAdventure')}</h2>
          <p className="text-xl text-gray-600">
            {t('home.joinThousands')}
          </p>
          <div className="pt-6">
            <Link href="/auth/register">
              <Button size="lg">{t('home.startQuestBtn')}</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
