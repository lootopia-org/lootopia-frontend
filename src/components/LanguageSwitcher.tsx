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
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:bg-gray-50'
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
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:bg-gray-50'
        }`}
        title="Français"
      >
        <span className="text-lg">🇫🇷</span>
        <span className="text-sm font-medium">FR</span>
      </button>
    </div>
  );
};
