'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Compass } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMe } from '@/lib/api/queries';
import { cn } from '@/lib/utils';

const publicLinks = [
  { href: '/hunts', label: 'Hunts' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: user } = useMe();

  const dashboardLink =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'partner'
        ? '/partner'
        : '/dashboard';

  const portalLink =
    user?.role === 'admin'
      ? { href: '/admin', label: 'Admin' }
      : user?.role === 'partner'
        ? { href: '/partner', label: 'Partner' }
        : null;

  const navLinks = user
    ? [
        ...publicLinks,
        { href: '/dashboard', label: 'Dashboard' },
        ...(portalLink ? [portalLink] : []),
        { href: '/settings', label: 'Settings' },
      ]
    : publicLinks;

  const hideOnAuth = pathname.startsWith('/auth');

  if (hideOnAuth) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-amber-600 text-background">
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Loot<span className="text-gold">opia</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-gold',
                pathname === link.href || pathname.startsWith(link.href + '/')
                  ? 'text-gold'
                  : 'text-white/70'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button variant="secondary" size="sm" asChild>
              <Link href={dashboardLink}>
                {user.username}
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden rounded-lg p-2 hover:bg-white/5"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 glass md:hidden">
          <div className="flex flex-col gap-2 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-3 text-sm font-medium hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="secondary" asChild>
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Get started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
