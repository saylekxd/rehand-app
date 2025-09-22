import React, { useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';
import { getStoredLanguage } from '@/lib/i18n';
import { loadTranslations, type SupportedLanguage } from '@/lib/translationLoader';

const getDeviceLocale = (): string => {
  try {
    const locale =
      Platform.OS === 'ios'
        ? (NativeModules.SettingsManager?.settings?.AppleLocale ||
            NativeModules.SettingsManager?.settings?.AppleLanguages?.[0])
        : NativeModules.I18nManager?.localeIdentifier;
    if (!locale) return 'en';
    return String(locale).replace('_', '-').split('-')[0].toLowerCase();
  } catch {
    return 'en';
  }
};

// Load translations from JSON files
const resources = loadTranslations();

// Initialize i18n once at module load to avoid setState during render warnings
const initialLang = (() => {
  const lng = getDeviceLocale();
  return ['pl', 'en'].includes(lng) ? lng : 'en';
})();

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: initialLang,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
  })
  .catch(() => {});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // If user set a preferred language previously, apply it at startup
  useEffect(() => {
    (async () => {
      const saved = await getStoredLanguage();
      if (saved && i18n.language !== saved) {
        try { await i18n.changeLanguage(saved); } catch {}
      }
    })();
  }, []);
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};