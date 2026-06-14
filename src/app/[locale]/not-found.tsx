import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default async function NotFound() {
  const t = await getTranslations('common.notFound');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-[family-name:var(--font-syne)] font-bold text-gold/30">404</p>
      <h1 className="mt-4 font-[family-name:var(--font-syne)] text-2xl font-bold">{t('heading')}</h1>
      <p className="mt-2 text-white/50">{t('message')}</p>
      <Button className="mt-8" asChild>
        <Link href="/">{t('returnHome')}</Link>
      </Button>
    </div>
  );
}
