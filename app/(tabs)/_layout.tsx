import { Tabs } from 'expo-router';
import { Book, User } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import AuthWrapper from '@/components/auth/AuthWrapper';

export default function TabLayout() {
  const { t } = useTranslation(['common']);
  
  return (
    <AuthWrapper>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#6B7280',
          tabBarLabelStyle: styles.tabBarLabel,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('common:tabs.exercises'),
            tabBarIcon: ({ size, color }) => (
              <Book size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        {/** AI tab removed; sessions are launched via /ai-session full-screen screen */}
        <Tabs.Screen
          name="profile"
          options={{
            title: t('common:tabs.profile'),
            tabBarIcon: ({ size, color }) => (
              <User size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
      </Tabs>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 8,
    paddingTop: 8,
    height: 70,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
});