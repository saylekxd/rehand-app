import 'react-i18next';
import type { SupportedNamespace } from './i18n';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: any;
      auth: any;
      profile: any;
      exercises: any;
      ai: any;
      privacy: any;
      help: any;
      profileHeader: any;
      profileStats: any;
      achievements: any;
      healthInfo: any;
      settings: any;
      notifications: any;
      editProfile: any;
      onboarding: any;
    };
  }
}
