'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { motion } from 'framer-motion';
import { useI18n } from '@/hooks/useI18n';

export default function PrivacyPage() {
  const { t } = useI18n();

  const sections = [
    { titleKey: 'privacy.section1.title', contentKey: 'privacy.section1.content' },
    { titleKey: 'privacy.section2.title', contentKey: 'privacy.section2.content' },
    { titleKey: 'privacy.section3.title', contentKey: 'privacy.section3.content' },
    { titleKey: 'privacy.section4.title', contentKey: 'privacy.section4.content' },
    { titleKey: 'privacy.section5.title', contentKey: 'privacy.section5.content' },
    { titleKey: 'privacy.section6.title', contentKey: 'privacy.section6.content' },
  ];

  return (
    <div className="overflow-hidden">
      <section className="bg-cream py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-dark mb-6">{t('privacy.title')}</h1>
          <p className="inline-block rounded-full border-2 border-dark bg-card-yellow text-dark text-xs font-bold px-3 py-1 mt-6">{t('privacy.lastUpdated')}: April 15, 2025</p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="space-y-3">
                <h2 className="text-2xl font-extrabold text-dark">{t(section.titleKey)}</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{t(section.contentKey)}</p>
              </Card>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-card-orange space-y-4">
              <h2 className="text-2xl font-extrabold text-dark">{t('privacy.contact.title')}</h2>
              <p className="text-gray-700">{t('privacy.contact.description')}</p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>{t('privacy.contact.emailLabel')}:</strong>{' '}
                  <a href="mailto:privacy@lootopia.com" className="text-primary hover:underline">
                    privacy@lootopia.com
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong>{t('privacy.contact.addressLabel')}:</strong> {t('privacy.contact.addressValue')}
                </p>
                <p className="text-gray-700">
                  <strong>{t('privacy.contact.responseLabel')}:</strong> {t('privacy.contact.responseValue')}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4 bg-light">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-dark mb-6 text-center">{t('privacy.links.title')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a href="/terms" className="text-center p-6 bg-white rounded-2xl border-2 border-dark shadow-arcade hover:shadow-arcade-lg transition group">
              <div className="w-12 h-12 mx-auto mb-4 bg-dark rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-dark">{t('privacy.links.terms')}</h3>
            </a>
            <a href="/contact" className="text-center p-6 bg-white rounded-2xl border-2 border-dark shadow-arcade hover:shadow-arcade-lg transition group">
              <div className="w-12 h-12 mx-auto mb-4 bg-dark rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-dark">{t('privacy.links.contact')}</h3>
            </a>
            <a href="/about" className="text-center p-6 bg-white rounded-2xl border-2 border-dark shadow-arcade hover:shadow-arcade-lg transition group">
              <div className="w-12 h-12 mx-auto mb-4 bg-dark rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-dark">{t('privacy.links.about')}</h3>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
