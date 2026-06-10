'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { motion } from 'framer-motion';
import { useI18n } from '@/hooks/useI18n';

export default function TermsPage() {
  const { t } = useI18n();

  const sections = [
    { titleKey: 'terms.section1.title', contentKey: 'terms.section1.content' },
    { titleKey: 'terms.section2.title', contentKey: 'terms.section2.content' },
    { titleKey: 'terms.section3.title', contentKey: 'terms.section3.content' },
    { titleKey: 'terms.section4.title', contentKey: 'terms.section4.content' },
    { titleKey: 'terms.section5.title', contentKey: 'terms.section5.content' },
    { titleKey: 'terms.section6.title', contentKey: 'terms.section6.content' },
  ];

  return (
    <div className="overflow-hidden">
      <section className="bg-cream py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-dark mb-6">{t('terms.title')}</h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-3xl mx-auto">{t('terms.heroSubtitle')}</p>
          <p className="inline-block rounded-full border-2 border-dark bg-card-yellow text-dark text-xs font-bold px-3 py-1 mt-6">{t('terms.lastUpdated')}: April 15, 2026</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto rounded-2xl bg-card-yellow border-2 border-dark shadow-arcade p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 pt-1">
              <div className="w-6 h-6 bg-dark rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="font-bold text-dark text-lg mb-2">{t('terms.notice.title')}</h2>
              <p className="text-gray-700">{t('terms.notice.content')}</p>
            </div>
          </div>
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
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-card-orange space-y-4">
              <h2 className="text-2xl font-extrabold text-dark">{t('terms.contact.title')}</h2>
              <p className="text-gray-700">{t('terms.contact.description')}</p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>{t('terms.contact.emailLabel')}:</strong>{' '}
                  <a href="mailto:legal@lootopia.com" className="text-primary hover:underline">
                    legal@lootopia.com
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong>{t('terms.contact.addressLabel')}:</strong> {t('terms.contact.addressValue')}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4 bg-light">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-dark mb-6 text-center">{t('terms.links.title')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a href="/privacy" className="text-center p-6 bg-white rounded-2xl border-2 border-dark shadow-arcade hover:shadow-arcade-lg transition group">
              <div className="w-12 h-12 mx-auto mb-4 bg-dark rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-bold text-dark">{t('terms.links.privacy')}</h3>
            </a>
            <a href="/contact" className="text-center p-6 bg-white rounded-2xl border-2 border-dark shadow-arcade hover:shadow-arcade-lg transition group">
              <div className="w-12 h-12 mx-auto mb-4 bg-dark rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-dark">{t('terms.links.contact')}</h3>
            </a>
            <a href="/about" className="text-center p-6 bg-white rounded-2xl border-2 border-dark shadow-arcade hover:shadow-arcade-lg transition group">
              <div className="w-12 h-12 mx-auto mb-4 bg-dark rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-dark">{t('terms.links.about')}</h3>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
