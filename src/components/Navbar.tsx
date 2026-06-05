'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/Button';
import { LootopiaLogo } from '@/components/LootopiaLogo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useI18n();

  const handleLogout = async () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
          <LootopiaLogo className="w-8 h-8" />
          Lootopia
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link href="/chases" className="hover:text-orange-100 transition">
                {t('navbar.explore')}
              </Link>
              {(user?.role === 'admin' || user?.role === 'partner') && (
                <Link href="/partner-studio" className="hover:text-orange-100 transition">
                  {t('navbar.partnerStudio')}
                </Link>
              )}
              <Link href="/my-chases" className="hover:text-orange-100 transition">
                {t('navbar.myChases')}
              </Link>
              <Link href="/leaderboard" className="hover:text-orange-100 transition">
                {t('navbar.leaderboard')}
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="hover:text-orange-100 transition">
                  Admin
                </Link>
              )}
              <Link href="/profile" className="flex items-center gap-2">
                <Image
                  src={user?.profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'Player')}&background=FF6B35&color=fff&size=64&bold=true`}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <span className="flex items-center gap-2">
                  {user?.username}
                  {user?.role && (
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                      {t(`common.roles.${user.role}`)}
                    </span>
                  )}
                </span>
              </Link>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                {t('navbar.logout')}
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button size="sm" variant="outline">
                  {t('navbar.login')}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">{t('navbar.signUp')}</Button>
              </Link>
            </>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};
