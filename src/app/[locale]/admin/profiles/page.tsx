'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Check, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { useProfiles, useUpdateAdminProfile } from '@/lib/api/queries';
import { RoleGuard } from '@/components/auth/role-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Profile } from '@/types';

function ProfileRow({ profile }: { profile: Profile }) {
  const t = useTranslations('admin.profiles');
  const updateProfile = useUpdateAdminProfile();
  const [editing, setEditing] = useState(false);
  const [points, setPoints] = useState(String(profile.points));
  const [level, setLevel] = useState(String(profile.level));
  const [completed, setCompleted] = useState(String(profile.completedHunts ?? 0));

  const resetForm = () => {
    setPoints(String(profile.points));
    setLevel(String(profile.level));
    setCompleted(String(profile.completedHunts ?? 0));
  };

  const handleSave = async () => {
    const parsedPoints = Number(points);
    const parsedLevel = Number(level);
    const parsedCompleted = Number(completed);

    if (Number.isNaN(parsedPoints) || Number.isNaN(parsedLevel) || Number.isNaN(parsedCompleted)) {
      toast.error(t('toasts.invalidNumbers'));
      return;
    }

    try {
      await updateProfile.mutateAsync({
        userId: profile.userId,
        payload: { points: parsedPoints, level: parsedLevel, completedHunts: parsedCompleted },
      });
      toast.success(t('toasts.updated'));
      setEditing(false);
    } catch {
      toast.error(t('toasts.updateFailed'));
    }
  };

  return (
    <tr className="border-b border-white/5">
      <td className="py-3 pr-4 font-medium">{profile.username || '—'}</td>
      <td className="py-3 pr-4 text-white/60">{profile.email || '—'}</td>
      <td className="py-3 pr-4">
        {editing ? (
          <Input value={points} onChange={(e) => setPoints(e.target.value)} className="h-8 w-24" inputMode="numeric" />
        ) : (
          <span className="text-gold">{profile.points}</span>
        )}
      </td>
      <td className="py-3 pr-4">
        {editing ? (
          <Input value={level} onChange={(e) => setLevel(e.target.value)} className="h-8 w-24" inputMode="decimal" />
        ) : (
          <span className="text-teal">{profile.level}</span>
        )}
      </td>
      <td className="py-3 pr-4">
        {editing ? (
          <Input value={completed} onChange={(e) => setCompleted(e.target.value)} className="h-8 w-24" inputMode="numeric" />
        ) : (
          profile.completedHunts ?? 0
        )}
      </td>
      <td className="py-3">
        {editing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => void handleSave()} disabled={updateProfile.isPending}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { resetForm(); setEditing(false); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => { resetForm(); setEditing(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </td>
    </tr>
  );
}

export default function AdminProfilesPage() {
  const t = useTranslations('admin.profiles');
  const { data: profiles, isLoading } = useProfiles(true);

  return (
    <RoleGuard allowed={['admin']}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" /> {t('back')}
          </Link>
        </Button>
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold mb-8">
          {t('heading')}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>{t('tableTitle', { count: profiles?.length ?? 0 })}</CardTitle>
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
                      <th className="pb-3 pr-4">{t('columns.username')}</th>
                      <th className="pb-3 pr-4">{t('columns.email')}</th>
                      <th className="pb-3 pr-4">{t('columns.points')}</th>
                      <th className="pb-3 pr-4">{t('columns.level')}</th>
                      <th className="pb-3 pr-4">{t('columns.completed')}</th>
                      <th className="pb-3">{t('columns.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile) => (
                      <ProfileRow key={profile.id} profile={profile} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-white/50">{t('empty')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
