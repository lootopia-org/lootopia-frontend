'use client';

import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always render with provider to avoid hydration mismatch
  return (
    <I18nextProvider i18n={i18n}>
      {mounted ? children : null}
    </I18nextProvider>
  );
};
