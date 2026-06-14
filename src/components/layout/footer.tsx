'use client';

import Link from 'next/link';
import { Compass } from 'lucide-react';
import { useMe } from '@/lib/api/queries';

export function Footer() {
  const { data: user } = useMe();

  if (user?.role === 'admin' || user?.role === 'partner') {
    return null;
  }

  return (
    <footer className="border-t border-white/5 bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-amber-600 text-background">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-bold">Lootopia</span>
            </div>
            <p className="text-sm text-white/50 max-w-xs">
              Real-world treasure hunts with AR, riddles, and adventure. Play in the app — track progress on the web.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-gold">Explore</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/hunts" className="hover:text-teal transition-colors">Hunt catalog</Link></li>
              <li><Link href="/auth/register" className="hover:text-teal transition-colors">Create account</Link></li>
              <li><Link href="/dashboard" className="hover:text-teal transition-colors">Dashboard</Link></li>
              <li><Link href="/settings" className="hover:text-teal transition-colors">Settings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-gold">Portals</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/partner" className="hover:text-teal transition-colors">Partner studio</Link></li>
              <li><Link href="/admin" className="hover:text-teal transition-colors">Admin console</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Lootopia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
