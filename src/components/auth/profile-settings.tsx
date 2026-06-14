'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useMe } from '@/lib/api/queries';
import { toImageSrc } from '@/lib/image-utils';
import { ImagePicker } from '@/components/ui/image-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ProfileSettings() {
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
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '?';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your avatar and bio. Images are stored in object storage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-white/10">
            <AvatarImage src={toImageSrc(avatar)} alt={user?.username ?? 'Avatar'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.username}</p>
            <p className="text-sm text-white/50">{user?.email}</p>
          </div>
        </div>

        <ImagePicker
          label="Avatar"
          description="Upload a profile photo. It will be saved to S3-compatible storage."
          uploadKind="avatar"
          value={avatar}
          onChange={setAvatar}
        />

        <div className="space-y-2">
          <Label htmlFor="profile-bio">Bio</Label>
          <Input
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell other hunters a little about yourself"
          />
        </div>

        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </CardContent>
    </Card>
  );
}
