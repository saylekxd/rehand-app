import { Stack } from 'expo-router';
import { View } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/contexts/I18nProvider';

console.log('🚀 _layout.tsx loading...');

export default function RootLayout() {
  console.log('🚀 RootLayout rendering...');

  return (
    <I18nProvider>
      <AuthProvider>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="ai-session" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </View>
      </AuthProvider>
    </I18nProvider>
  );
}
