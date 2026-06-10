'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { motion } from 'framer-motion';
import { useI18n } from '@/hooks/useI18n';

export default function AboutPage() {
  const { t } = useI18n();

  const values = [
    {
      icon: (
        <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      titleKey: 'about.entertainment',
      descKey: 'about.entertainmentDesc',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5a2.5 2.5 0 002.5-2.5V3.935m0 0a48.11 48.11 0 03-7.228-.06m0 0a48.254 48.254 0 07-7.228.06m0 0A2.25 2.25 0 003 12a2.25 2.25 0 006.714 0m0 0A24.376 24.376 0 012.5 12c0 1.896.72 3.681 1.89 5" />
        </svg>
      ),
      titleKey: 'about.accessibility',
      descKey: 'about.accessibilityDesc',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      titleKey: 'about.innovation',
      descKey: 'about.innovationDesc',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 4H9m6 16H9m6-4H9" />
        </svg>
      ),
      titleKey: 'about.community',
      descKey: 'about.communityDesc',
    },
  ];

  const team = [
    {
      name: 'Alice Martin',
      roleKey: 'about.ceoFounder',
    },
    {
      name: 'Bob Chen',
      roleKey: 'about.cto',
    },
    {
      name: 'Carol Johnson',
      roleKey: 'about.cto',
    },
    {
      name: 'David Lee',
      roleKey: 'about.cmo',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
      <section className="bg-cream py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-dark mb-6">{t('about.title')}</h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-black text-dark mb-6">{t('about.ourMission')}</h2>
              <p className="text-lg text-gray-600">{t('about.missionDesc')}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center"
            >
              <div className="w-20 h-20 bg-dark rounded-xl border-2 border-dark shadow-arcade flex items-center justify-center">
                <svg className="w-10 h-10 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.553-.894L9 7.5m0 0l6.553-3.894A1 1 0 0117 5.618v10.764a1 1 0 01-1.553.894L9 12.5m0 0V20m6.553-15.894A1 1 0 0117 5.618v10.764m0 0l5.447 2.724A1 1 0 0024 18.382V7.618a1 1 0 00-1.553-.894L17 9.5" />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-dark text-center mb-16">{t('about.ourValues')}</h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="text-center space-y-4 h-full">
                  <div className="w-12 h-12 bg-dark rounded-xl flex items-center justify-center mx-auto">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-dark">{t(value.titleKey)}</h3>
                  <p className="text-gray-600 text-sm">{t(value.descKey)}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-dark text-center mb-16">{t('about.ourTeam')}</h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {team.map((member, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="text-center space-y-3">
                  <div className="w-20 h-20 bg-card-orange border-2 border-dark rounded-full mx-auto" />
                  <div>
                    <h3 className="font-bold text-dark text-lg">{member.name}</h3>
                    <p className="text-primary font-medium text-sm">{t(member.roleKey)}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
