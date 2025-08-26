import { Stack } from 'expo-router';
import { View } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext';

console.log('🚀 _layout.tsx loading...');

export default function RootLayout() {
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
}
