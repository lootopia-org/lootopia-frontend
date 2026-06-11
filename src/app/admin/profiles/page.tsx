'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useProfiles } from '@/lib/api/queries';
import { RoleGuard } from '@/components/auth/role-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminProfilesPage() {
  const { data: profiles, isLoading } = useProfiles(true);

  return (
    <RoleGuard allowed={['admin']}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" /> Back to admin
          </Link>
        </Button>
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold mb-8">
          Player <span className="text-gold">profiles</span>
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>All profiles ({profiles?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : profiles && profiles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-white/50">
                      <th className="pb-3 pr-4">Username</th>
                      <th className="pb-3 pr-4">Points</th>
                      <th className="pb-3 pr-4">Level</th>
                      <th className="pb-3 pr-4">Completed</th>
                      <th className="pb-3">Bio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id} className="border-b border-white/5">
                        <td className="py-3 pr-4 font-medium">{p.username}</td>
                        <td className="py-3 pr-4 text-gold">{p.points}</td>
                        <td className="py-3 pr-4 text-teal">{p.level}</td>
                        <td className="py-3 pr-4">{p.completedHunts ?? 0}</td>
                        <td className="py-3 text-white/50 truncate max-w-xs">{p.bio || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-white/50">No profiles yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
