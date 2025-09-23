import { Resource } from 'i18next';

// Load all translation files for a given language
export const loadTranslations = (): Resource => {
  const resources: Resource = {
    en: {},
    pl: {},
  };

  // English translations
  resources.en = {
    common: require('../locales/en/common.json'),
    auth: require('../locales/en/auth.json'),
    intro: require('../locales/en/intro.json'),
    profile: require('../locales/en/profile.json'),
    exercises: require('../locales/en/exercises.json'),
    ai: require('../locales/en/ai.json'),
    privacy: require('../locales/en/privacy.json'),
    help: require('../locales/en/help.json'),
    profileHeader: require('../locales/en/profileHeader.json'),
    profileStats: require('../locales/en/profileStats.json'),
    achievements: require('../locales/en/achievements.json'),
    healthInfo: require('../locales/en/healthInfo.json'),
    settings: require('../locales/en/settings.json'),
    notifications: require('../locales/en/notifications.json'),
    editProfile: require('../locales/en/editProfile.json'),
    onboarding: require('../locales/en/onboarding.json'),
  };

  // Polish translations
  resources.pl = {
    common: require('../locales/pl/common.json'),
    auth: require('../locales/pl/auth.json'),
    intro: require('../locales/pl/intro.json'),
    profile: require('../locales/pl/profile.json'),
    exercises: require('../locales/pl/exercises.json'),
    ai: require('../locales/pl/ai.json'),
    privacy: require('../locales/pl/privacy.json'),
    help: require('../locales/pl/help.json'),
    profileHeader: require('../locales/pl/profileHeader.json'),
    profileStats: require('../locales/pl/profileStats.json'),
    achievements: require('../locales/pl/achievements.json'),
    healthInfo: require('../locales/pl/healthInfo.json'),
    settings: require('../locales/pl/settings.json'),
    notifications: require('../locales/pl/notifications.json'),
    editProfile: require('../locales/pl/editProfile.json'),
    onboarding: require('../locales/pl/onboarding.json'),
  };

  return resources;
};

// Get available languages
export const getAvailableLanguages = () => ['en', 'pl'] as const;

// Type for supported languages
export type SupportedLanguage = 'en' | 'pl';
