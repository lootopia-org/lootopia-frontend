'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { HuntWizard } from '@/components/hunts/hunt-wizard';
import { RoleGuard } from '@/components/auth/role-guard';
import { Button } from '@/components/ui/button';
import { useHunt } from '@/lib/api/queries';

export default function EditHuntPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations('hunts.wizard.pages.edit');
  const { data: hunt, isLoading } = useHunt(id);

  return (
    <RoleGuard allowed={['partner', 'admin']}>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/partner">
            <ArrowLeft className="h-4 w-4" /> {t('back')}
          </Link>
        </Button>
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold mb-8">{t('heading')}</h1>
        {isLoading ? (
          <div className="glass rounded-2xl h-96 animate-pulse" />
        ) : hunt ? (
          <HuntWizard
            mode="edit"
            hunt={hunt}
            key={`${hunt.id}:${hunt.steps?.map((s) => s.id).join(',') ?? ''}`}
          />
        ) : (
          <p className="text-white/50">{t('notFound')}</p>
        )}
      </div>
    </RoleGuard>
  );
}
