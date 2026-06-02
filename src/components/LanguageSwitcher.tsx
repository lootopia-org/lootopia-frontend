import React from 'react';
import { useI18n } from '@/hooks/useI18n';

export const LanguageSwitcher: React.FC = () => {
  const { changeLanguage, currentLanguage } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition ${
          currentLanguage === 'en'
            ? 'bg-white bg-opacity-20'
            : 'hover:bg-white hover:bg-opacity-10'
        }`}
        title="English"
      >
        <span className="text-lg">🇬🇧</span>
        <span className="text-sm font-medium">EN</span>
      </button>

      <button
        onClick={() => changeLanguage('fr')}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition ${
          currentLanguage === 'fr'
            ? 'bg-white bg-opacity-20'
            : 'hover:bg-white hover:bg-opacity-10'
        }`}
        title="Français"
      >
        <span className="text-lg">🇫🇷</span>
        <span className="text-sm font-medium">FR</span>
      </button>
    </div>
  );
};
