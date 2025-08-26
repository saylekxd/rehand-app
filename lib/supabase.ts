import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Get Supabase configuration with layered fallbacks: env → app.json extra → hardcoded safe defaults
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  (Constants.expoConfig?.extra as any)?.supabaseUrl ??
  'https://ihgfxnyppyoitmzdexic.supabase.co';

const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ??
  (Constants.expoConfig?.extra as any)?.supabaseKey ??
  'sb_publishable_oK6KLv7brZYI7EauI00PDQ_Ey-tWUw8';

// In production, avoid throwing on missing config; rely on fallbacks above

// Custom storage implementation using Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase; 