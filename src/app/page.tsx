'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { motion } from 'framer-motion';
import { useI18n } from '@/hooks/useI18n';

export default function Home() {
  const { t } = useI18n();

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.553-.894L9 7.5m0 0l6.553-3.894A1 1 0 0117 5.618v10.764a1 1 0 01-1.553.894L9 12.5m0 0V20m6.553-15.894A1 1 0 0117 5.618v10.764m0 0l5.447 2.724A1 1 0 0024 18.382V7.618a1 1 0 00-1.553-.894L17 9.5" />
        </svg>
      ),
      titleKey: 'home.features.interactiveMaps',
      descKey: 'home.features.mapsDesc',
      bg: 'bg-card-orange',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.5a2 2 0 00-1 .268M7 21H5a2 2 0 01-2-2v-4a2 2 0 012-2h2.5" />
        </svg>
      ),
      titleKey: 'home.features.arExperience',
      descKey: 'home.features.arDesc',
      bg: 'bg-card-blue',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      titleKey: 'home.features.gamification',
      descKey: 'home.features.gamificationDesc',
      bg: 'bg-card-yellow',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
        </svg>
      ),
      titleKey: 'home.features.socialPlay',
      descKey: 'home.features.socialDesc',
      bg: 'bg-card-green',
    },
  ];

  const stats = [
    { value: '10K+', labelKey: 'home.stats.activePlayers', bg: 'bg-card-orange' },
    { value: '500+', labelKey: 'home.stats.treasureHunts', bg: 'bg-card-blue' },
    { value: '100+', labelKey: 'home.stats.locations', bg: 'bg-card-yellow' },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="overflow-hidden bg-cream">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-center space-y-6"
          >
            <span className="inline-block rounded-full border-2 border-dark bg-warning px-4 py-1.5 text-sm font-extrabold shadow-arcade-sm">
              🏴‍☠️ {t('home.exploreChasesBtn')} !
            </span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-dark">
              {t('home.welcome').replace('Lootopia', '')}
              <span className="text-primary">Lootopia</span>
            </h1>
            <p className="text-lg md:text-xl font-medium text-gray-600 max-w-xl mx-auto">
              {t('home.subtitle')}
            </p>
            <div className="flex items-center gap-6 justify-center flex-wrap pt-2">
              <Link href="/auth/register">
                <Button size="lg">{t('home.getStartedBtn')}</Button>
              </Link>
              <Link
                href="/chases"
                className="text-secondary font-bold underline underline-offset-4 hover:text-primary transition"
              >
                {t('home.exploreChasesBtn')} →
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-16 flex justify-center"
          >
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80"
                alt={t('home.exploreChasesBtn')}
                width={520}
                height={320}
                priority
                className="w-[300px] h-[200px] md:w-[520px] md:h-[320px] rounded-2xl object-cover border-2 border-dark shadow-arcade-lg"
              />
              <div className="absolute -bottom-6 -left-4 md:-left-8 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 border-2 border-dark shadow-arcade">
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&h=96&q=80"
                  alt="Treasure Player"
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full border-2 border-dark"
                />
                <div className="text-left">
                  <p className="text-sm font-extrabold leading-tight text-dark">Treasure Player</p>
                  <p className="text-xs font-semibold text-gray-500">Lvl 8 · 1240 pts</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-dark text-center mb-14">
            {t('home.whyChoose')}
          </h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className={`text-center space-y-4 rounded-2xl border-2 border-dark shadow-arcade-lg p-6 ${feature.bg}`}
              >
                <div className="w-12 h-12 bg-dark text-warning rounded-xl flex items-center justify-center mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-extrabold text-dark">{t(feature.titleKey)}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{t(feature.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`rounded-2xl border-2 border-dark shadow-arcade p-6 ${stat.bg}`}
            >
              <div className="text-4xl md:text-5xl font-black text-dark mb-1">{stat.value}</div>
              <p className="text-gray-700 font-bold text-sm">{t(stat.labelKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto rounded-3xl bg-secondary text-white border-2 border-dark shadow-arcade-lg p-12 md:p-16 text-center space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            {t('home.readyForAdventure')}
          </h2>
          <p className="text-lg text-blue-100 font-medium max-w-xl mx-auto">{t('home.joinThousands')}</p>
          <div className="pt-4">
            <Link href="/auth/register">
              <Button size="lg">{t('home.startQuestBtn')}</Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
