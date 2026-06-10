'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';
import { LootopiaLogo } from '@/components/LootopiaLogo';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-white border-t-[3px] border-dark py-10 mt-20 text-sm font-medium text-gray-600">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-dark font-extrabold">
            <LootopiaLogo className="w-6 h-6" />
            Lootopia
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <li><Link href="/about" className="font-bold hover:text-primary transition">{t('footer.about')}</Link></li>
            <li><Link href="/contact" className="font-bold hover:text-primary transition">{t('footer.contact')}</Link></li>
            <li><Link href="/terms" className="font-bold hover:text-primary transition">{t('footer.terms')}</Link></li>
            <li><Link href="/privacy" className="font-bold hover:text-primary transition">{t('footer.privacy')}</Link></li>
          </ul>

          <p>&copy; 2026 Lootopia</p>
        </div>
      </div>
    </footer>
  );
};
