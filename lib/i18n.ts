import * as SecureStore from 'expo-secure-store';
import i18n from 'i18next';

export const LANGUAGE_STORAGE_KEY = 'app_language';

export async function setAppLanguage(lang: 'pl' | 'en'): Promise<void> {
  try {
    await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, lang);
  } catch {}
  try {
    await i18n.changeLanguage(lang);
  } catch {}
}

export async function getStoredLanguage(): Promise<'pl' | 'en' | null> {
  try {
    const value = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
    if (value === 'pl' || value === 'en') return value;
    return null;
  } catch {
    return null;
  }
}


