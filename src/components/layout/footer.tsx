'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Compass } from 'lucide-react';
import { useMe } from '@/lib/api/queries';

export function Footer() {
  const t = useTranslations('common.footer');
  const tNav = useTranslations('common.nav.links');
  const { data: user } = useMe();

  if (user?.role === 'admin' || user?.role === 'partner') {
    return null;
  }

  return (
    <footer className="border-t border-white/5 bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-amber-600 text-background">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-bold">Lootopia</span>
            </div>
            <p className="text-sm text-white/50 max-w-xs">{t('tagline')}</p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-gold">{t('explore.heading')}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/hunts" className="hover:text-teal transition-colors">{t('explore.huntCatalog')}</Link></li>
              <li><Link href="/auth/register" className="hover:text-teal transition-colors">{t('explore.createAccount')}</Link></li>
              <li><Link href="/dashboard" className="hover:text-teal transition-colors">{tNav('dashboard')}</Link></li>
              <li><Link href="/settings" className="hover:text-teal transition-colors">{tNav('settings')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-gold">{t('portals.heading')}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/partner" className="hover:text-teal transition-colors">{t('portals.partnerStudio')}</Link></li>
              <li><Link href="/admin" className="hover:text-teal transition-colors">{t('portals.adminConsole')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-white/40">
          {t('copyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
