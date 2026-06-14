import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  // Package-local bundles: lootopia-frontend/locales/{locale}/*.json
  const [common, auth, hunts, admin, partner, validation] = await Promise.all([
    import(`../../locales/${locale}/common.json`).then((m) => m.default),
    import(`../../locales/${locale}/auth.json`).then((m) => m.default),
    import(`../../locales/${locale}/hunts.json`).then((m) => m.default),
    import(`../../locales/${locale}/admin.json`).then((m) => m.default),
    import(`../../locales/${locale}/partner.json`).then((m) => m.default),
    import(`../../locales/${locale}/validation.json`).then((m) => m.default),
  ]);

  return {
    locale,
    messages: { common, auth, hunts, admin, partner, validation },
  };
});
