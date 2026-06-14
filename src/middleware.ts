import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const protectedPrefixes = ['/dashboard', '/settings', '/partner', '/admin'];

function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split('/');
  const maybeLocale = segments[1];
  if (routing.locales.includes(maybeLocale as (typeof routing.locales)[number])) {
    const rest = segments.slice(2).join('/');
    return rest ? `/${rest}` : '/';
  }
  return pathname;
}

function localeFromPathname(pathname: string): string {
  const maybeLocale = pathname.split('/')[1];
  if (routing.locales.includes(maybeLocale as (typeof routing.locales)[number])) {
    return maybeLocale;
  }
  return routing.defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameWithoutLocale = stripLocalePrefix(pathname);
  const token =
    request.cookies.get('session')?.value ||
    request.cookies.get('authToken')?.value;

  const isProtected = protectedPrefixes.some(
    (prefix) =>
      pathnameWithoutLocale === prefix ||
      pathnameWithoutLocale.startsWith(`${prefix}/`)
  );

  if (isProtected && !token) {
    const locale = localeFromPathname(pathname);
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set('next', pathnameWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(en|fr)/:path*',
    '/((?!api|media|_next|.*\\..*).*)',
  ],
};
