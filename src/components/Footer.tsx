'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-dark text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Lootopia</h3>
            <p className="text-gray-400 text-sm">
              Discover amazing treasure hunts and create unforgettable experiences.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white">{t('home.exploreChasesBtn')}</a></li>
              <li><a href="#" className="hover:text-white">Create Chase</a></li>
              <li><a href="#" className="hover:text-white">{t('navbar.leaderboard')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/about" className="hover:text-white transition">{t('footer.about')}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">{t('footer.contact')}</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">{t('footer.terms')}</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">{t('footer.privacy')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white">Twitter</a></li>
              <li><a href="#" className="hover:text-white">Facebook</a></li>
              <li><a href="#" className="hover:text-white">Instagram</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Lootopia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
