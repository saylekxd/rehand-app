import { Stack } from 'expo-router';
import { View } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import * as Sentry from '@sentry/react-native';

const isProdBuild = !__DEV__;

if (isProdBuild) {
  Sentry.init({
    dsn: 'https://865b4f9b87891caa676f77b0de92d462@o4508910073348096.ingest.de.sentry.io/4510028390858832',
    sendDefaultPii: true,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 0.2,
    integrations: [Sentry.feedbackIntegration()],
  });
} else {
  // In development: minimal Sentry to avoid interfering with dev tools
  Sentry.init({ dsn: '', enabled: false });
}

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