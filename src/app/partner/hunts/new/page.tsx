'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { HuntWizard } from '@/components/hunts/hunt-wizard';
import { RoleGuard } from '@/components/auth/role-guard';
import { Button } from '@/components/ui/button';
import { useMe } from '@/lib/api/queries';

export default function NewHuntPage() {
  const { data: user } = useMe();

  return (
    <RoleGuard allowed={['partner', 'admin']}>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/partner">
            <ArrowLeft className="h-4 w-4" /> Back to studio
          </Link>
        </Button>
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold mb-8">
          Create new <span className="text-gold">hunt</span>
        </h1>
        {user && <HuntWizard mode="create" key={user.id} />}
      </div>
    </RoleGuard>
  );
}
