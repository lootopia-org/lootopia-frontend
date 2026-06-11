'use client';

import { use } from 'react';
import Link from 'next/link';
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
  const { data: hunt, isLoading } = useHunt(id);

  return (
    <RoleGuard allowed={['partner', 'admin']}>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/partner">
            <ArrowLeft className="h-4 w-4" /> Back to studio
          </Link>
        </Button>
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold mb-8">
          Edit <span className="text-gold">hunt</span>
        </h1>
        {isLoading ? (
          <div className="glass rounded-2xl h-96 animate-pulse" />
        ) : hunt ? (
          <HuntWizard mode="edit" hunt={hunt} key={hunt.id} />
        ) : (
          <p className="text-white/50">Hunt not found.</p>
        )}
      </div>
    </RoleGuard>
  );
}
