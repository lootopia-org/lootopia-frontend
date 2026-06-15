import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const backendUrl =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.wookiesrpeople2.dev';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['api.wookiesrpeople2.dev', 'localhost', 'www.wookiesrpeople2.dev'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: 'api.wookiesrpeople2.dev' },
      { protocol: 'http', hostname: 'api.wookiesrpeople2.dev' },
      { protocol: 'https', hostname: 'www.wookiesrpeople2.dev' },
      { protocol: 'http', hostname: 'www.wookiesrpeople2.dev' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/ws',
        destination: `${backendUrl}/ws`,
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
