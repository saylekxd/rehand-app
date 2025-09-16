import { Stack } from 'expo-router';
import { View } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://865b4f9b87891caa676f77b0de92d462@o4508910073348096.ingest.de.sentry.io/4510028390858832',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

console.log('🚀 _layout.tsx loading...');

export default Sentry.wrap(function RootLayout() {
  console.log('🚀 RootLayout rendering...');

  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </View>
    </AuthProvider>
  );
});