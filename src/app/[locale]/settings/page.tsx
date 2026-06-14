'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/auth/session-store';
import { useMe, useJoinedHunts } from '@/lib/api/queries';
import { AppDownloadBanner, AppDownloadQr } from '@/components/layout/app-download-banner';
import { ProfileSettings } from '@/components/auth/profile-settings';
import { SecuritySettings } from '@/components/auth/security-settings';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoleGuard, ROLE_HOME } from '@/components/auth/role-guard';
import { formatDuration, isStaffRole } from '@/lib/utils';

export default function SettingsPage() {
  const t = useTranslations('common.settings');
  const tCommon = useTranslations('common');
  const tShared = useTranslations('hunts.shared');
  const { data: user } = useMe();
  const { data: joinedHunts } = useJoinedHunts(!!user);
  const reset = useAuthStore((s) => s.reset);

  const showDownloadCta = !isStaffRole(user);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      reset();
      window.location.href = '/';
    } catch {
      toast.error(t('logoutFailed'));
    }
  };

  const homeLabel =
    user?.role === 'admin'
      ? t('roleLinks.adminConsole')
      : user?.role === 'partner'
        ? t('roleLinks.partnerStudio')
        : t('roleLinks.viewStats');

  return (
    <RoleGuard allowed={['player', 'partner', 'admin']}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-10">
          <div>
            <h1 className="font-[family-name:var(--font-syne)] text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Settings className="h-8 w-8 text-gold" />
              {t('heading')}
            </h1>
            <p className="mt-2 text-white/50">
              {t('signedInAs', { username: user?.username ?? '' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="outline" size="sm" asChild>
              <Link href={user ? ROLE_HOME[user.role] : '/dashboard'}>{homeLabel}</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              {t('signOut')}
            </Button>
          </div>
        </div>

        {showDownloadCta && (
          <div className="mb-8">
            <AppDownloadBanner compact />
          </div>
        )}

<div className={`grid gap-8 ${showDownloadCta ? 'lg:grid-cols-3' : 'lg:grid-cols-1 max-w-3xl mx-auto w-full'}`}>
  <div className={`${showDownloadCta ? 'lg:col-span-2' : ''} space-y-8`}>
            <ProfileSettings />

            <Card>
              <CardHeader>
                <CardTitle>{t('activeHunts.heading')}</CardTitle>
              </CardHeader>
              <CardContent>
                {joinedHunts && joinedHunts.length > 0 ? (
                  <ul className="space-y-3">
                    {joinedHunts.map((hunt) => (
                      <li key={hunt.id} className="flex items-center justify-between rounded-xl glass px-4 py-3">
                        <div>
                          <Link href={`/hunts/${hunt.id}`} className="font-medium hover:text-gold">
                            {hunt.title}
                          </Link>
                          <p className="text-xs text-white/40 mt-1">
                            {tCommon('stepsDuration', {
                              stepCount: hunt.steps?.length ?? 0,
                              duration: formatDuration(hunt.estimatedDuration, (key, values) => tShared(key, values)),
                            })}
                          </p>
                        </div>
                        <Badge variant="teal">{t('activeHunts.inProgress')}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/50 text-sm">{t('activeHunts.empty')}</p>
                )}
              </CardContent>
            </Card>

            <SecuritySettings />
          </div>

          {showDownloadCta ? (
            <div>
              <AppDownloadQr />
            </div>
          ) : null}
        </div>
      </div>
    </RoleGuard>
  );
}
