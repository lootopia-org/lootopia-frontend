'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useMe } from '@/lib/api/queries';
import { toDisplayImageSrc } from '@/lib/image-utils';
import { ImagePicker } from '@/components/ui/image-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ProfileSettings() {
  const t = useTranslations('auth.profile');
  const { data: user, refetch } = useMe();
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBio(user?.bio ?? '');
    setAvatar(user?.avatar);
  }, [user?.bio, user?.avatar]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile({
        bio: bio.trim() || undefined,
        avatar,
      });
      await refetch();
      toast.success(t('toasts.profileUpdated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '?';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-white/10">
            <AvatarImage src={toDisplayImageSrc(avatar)} alt={user?.username ?? t('avatar.alt')} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.username}</p>
            <p className="text-sm text-white/50">{user?.email}</p>
          </div>
        </div>

        <ImagePicker
          label={t('avatar.label')}
          description={t('avatar.description')}
          uploadKind="avatar"
          value={avatar}
          onChange={setAvatar}
        />

        <div className="space-y-2">
          <Label htmlFor="profile-bio">{t('fields.bio')}</Label>
          <Input
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t('placeholders.bio')}
          />
        </div>

        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? t('actions.saving') : t('actions.saveProfile')}
        </Button>
      </CardContent>
    </Card>
  );
}
