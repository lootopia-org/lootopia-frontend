'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Users, Map, LogOut } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/auth/session-store';
import { useManagedHunts, useProfiles } from '@/lib/api/queries';
import { RoleGuard } from '@/components/auth/role-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
  const t = useTranslations('admin');
  const { data: profiles } = useProfiles(true);
  const { data: hunts } = useManagedHunts();
  const reset = useAuthStore((s) => s.reset);

  const handleLogout = async () => {
    await authApi.logout();
    reset();
    window.location.href = '/';
  };

  return (
    <RoleGuard allowed={['admin']}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold">
              {t('console.heading')}
            </h1>
            <p className="mt-2 text-white/50">{t('console.subhead')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{t('console.cards.playerProfiles')}</CardTitle>
              <Users className="h-5 w-5 text-teal" />
            </CardHeader>
            <CardContent>
              <p className="font-[family-name:var(--font-syne)] text-4xl font-bold text-gold">
                {profiles?.length ?? '—'}
              </p>
              <Button variant="ghost" className="mt-4 px-0" asChild>
                <Link href="/admin/profiles">{t('console.cards.viewAllProfiles')}</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{t('console.cards.treasureHunts')}</CardTitle>
              <Map className="h-5 w-5 text-gold" />
            </CardHeader>
            <CardContent>
              <p className="font-[family-name:var(--font-syne)] text-4xl font-bold text-teal">
                {hunts?.length ?? '—'}
              </p>
              <Button variant="ghost" className="mt-4 px-0" asChild>
                <Link href="/admin/hunts">{t('console.cards.manageHunts')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Button variant="secondary" asChild>
            <Link href="/admin/profiles">{t('console.quickLinks.profiles')}</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/admin/hunts">{t('console.quickLinks.hunts')}</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/partner/hunts/new">{t('console.quickLinks.createHunt')}</Link>
          </Button>
        </div>
      </div>
    </RoleGuard>
  );
}
