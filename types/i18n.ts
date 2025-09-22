// Auto-generated TypeScript types for translation keys
// This provides type safety when using the t() function

export interface TranslationKeys {
  // Common namespace
  'common:appName': string;
  'common:ok': string;
  'common:cancel': string;

  // Auth namespace
  'auth:welcomeBack': string;
  'auth:signInSubtitle': string;
  'auth:email': string;
  'auth:password': string;
  'auth:signIn': string;
  'auth:forgotPassword': string;
  'auth:noAccount': string;
  'auth:register': string;
  'auth:createAccount': string;
  'auth:startJourney': string;
  'auth:firstName': string;
  'auth:lastName': string;
  'auth:confirmPassword': string;
  'auth:passwordsNotMatch': string;
  'auth:passwordTooShort': string;
  'auth:registrationSuccess': string;
  'auth:haveAccount': string;
  'auth:login': string;

  // Profile namespace
  'profile:loading': string;
  'profile:settings': string;
  'profile:settingsSubtitle': string;
  'profile:notifications': string;
  'profile:notificationsSubtitle': string;
  'profile:privacy': string;
  'profile:privacySubtitle': string;
  'profile:help': string;
  'profile:helpSubtitle': string;
  'profile:logout': string;
  'profile:logoutSubtitle': string;
  'profile:logoutTitle': string;
  'profile:logoutConfirm': string;

  // Exercises namespace
  'exercises:library': string;
  'exercises:pick': string;
  'exercises:searchPlaceholder': string;
  'exercises:all': string;
  'exercises:loading': string;
  'exercises:loadingDetails': string;
  'exercises:details': string;
  'exercises:errorTitle': string;
  'exercises:loadError': string;
  'exercises:emptyTitle': string;
  'exercises:emptyMsg': string;
  'exercises:see': string;
  'exercises:errorLoading': string;
  'exercises:retry': string;
  'exercises:minutes': string;
  'exercises:easy': string;
  'exercises:medium': string;
  'exercises:hard': string;
  'exercises:duration': string;
  'exercises:category': string;
  'exercises:difficulty': string;
  'exercises:instructions': string;
  'exercises:muscles': string;
  'exercises:equipment': string;
  'exercises:noEquipment': string;
  'exercises:start': string;

  // AI namespace
  'ai:title': string;
  'ai:subtitle': string;
  'ai:sessionDoneTitle': string;
  'ai:sessionDoneBack': string;
}

// Supported languages
export type SupportedLanguage = 'en' | 'pl';

// Supported namespaces
export type SupportedNamespace = 
  | 'common'
  | 'auth' 
  | 'profile'
  | 'exercises'
  | 'ai'
  | 'privacy'
  | 'help'
  | 'profileHeader'
  | 'profileStats'
  | 'achievements'
  | 'healthInfo'
  | 'settings'
  | 'notifications'
  | 'editProfile'
  | 'onboarding';

// Helper type for translation key validation
export type TranslationKey<T extends SupportedNamespace> = `${T}:${string}`;
