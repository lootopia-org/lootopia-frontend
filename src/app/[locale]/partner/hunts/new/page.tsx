'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { HuntWizard } from '@/components/hunts/hunt-wizard';
import { RoleGuard } from '@/components/auth/role-guard';
import { Button } from '@/components/ui/button';
import { useMe } from '@/lib/api/queries';

export default function NewHuntPage() {
  const t = useTranslations('hunts.wizard.pages.create');
  const { data: user } = useMe();

  return (
    <RoleGuard allowed={['partner', 'admin']}>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/partner">
            <ArrowLeft className="h-4 w-4" /> {t('back')}
          </Link>
        </Button>
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold mb-8">{t('heading')}</h1>
        {user && <HuntWizard mode="create" key={user.id} />}
      </div>
    </RoleGuard>
  );
}
