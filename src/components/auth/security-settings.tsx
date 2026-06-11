'use client';

import { useState } from 'react';
import { create } from '@github/webauthn-json';
import QRCode from 'qrcode';
import { Shield, Key, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useWebauthnCredentials } from '@/lib/api/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SecuritySettings() {
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [otpauthUri, setOtpauthUri] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [enrollCode, setEnrollCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: credentials, refetch: refetchCredentials } = useWebauthnCredentials();

  const beginTotpEnroll = async () => {
    setLoading(true);
    try {
      const res = await authApi.totpEnrollBegin();
      setTotpSecret(res.secret);
      setOtpauthUri(res.otpauthUri);
      const qr = await QRCode.toDataURL(res.otpauthUri);
      setQrDataUrl(qr);
      toast.success('Scan the QR code with your authenticator app');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start TOTP enrollment');
    } finally {
      setLoading(false);
    }
  };

  const verifyTotpEnroll = async () => {
    setLoading(true);
    try {
      await authApi.totpEnrollVerify(enrollCode);
      setTotpSecret(null);
      setQrDataUrl(null);
      setEnrollCode('');
      toast.success('Two-factor authentication enabled');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const disableTotp = async () => {
    setLoading(true);
    try {
      await authApi.totpDisable(disableCode);
      setDisableCode('');
      toast.success('Two-factor authentication disabled');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const registerPasskey = async () => {
    setLoading(true);
    try {
      const begin = await authApi.webauthnRegisterBegin();
      const credential = await create({
        publicKey: begin.publicKey as unknown as Parameters<typeof create>[0]['publicKey'],
      });
      await authApi.webauthnRegisterComplete(begin.handle, credential);
      await refetchCredentials();
      toast.success('Passkey registered');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Passkey registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gold" />
          Security
        </CardTitle>
        <CardDescription>
          Manage two-factor authentication and passkeys for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="totp">
          <TabsList className="w-full">
            <TabsTrigger value="totp" className="flex-1">
              <Smartphone className="h-4 w-4 mr-1" /> Authenticator
            </TabsTrigger>
            <TabsTrigger value="passkey" className="flex-1">
              <Key className="h-4 w-4 mr-1" /> Passkeys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="totp" className="space-y-4">
            {!totpSecret ? (
              <Button onClick={beginTotpEnroll} disabled={loading}>
                Enable authenticator app
              </Button>
            ) : (
              <div className="space-y-4">
                {qrDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="TOTP QR code" className="mx-auto rounded-lg bg-white p-2" width={180} height={180} />
                )}
                {otpauthUri && (
                  <p className="text-xs text-white/40 break-all">{otpauthUri}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="enroll-code">Verification code</Label>
                  <Input
                    id="enroll-code"
                    value={enrollCode}
                    onChange={(e) => setEnrollCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                  />
                  <Button onClick={verifyTotpEnroll} disabled={loading || enrollCode.length !== 6}>
                    Confirm & enable
                  </Button>
                </div>
              </div>
            )}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <Label htmlFor="disable-code">Disable TOTP (requires current code)</Label>
              <Input
                id="disable-code"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
              <Button variant="destructive" size="sm" onClick={disableTotp} disabled={loading || disableCode.length !== 6}>
                Disable authenticator
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="passkey" className="space-y-4">
            <Button onClick={registerPasskey} disabled={loading}>
              Register new passkey
            </Button>
            {credentials && credentials.length > 0 && (
              <ul className="space-y-2">
                {credentials.map((cred) => (
                  <li key={cred.id} className="rounded-lg glass px-4 py-3 text-sm">
                    <span className="text-white/80">{cred.name || 'Passkey'}</span>
                    <span className="ml-2 text-white/40 text-xs">
                      Added {new Date(cred.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
