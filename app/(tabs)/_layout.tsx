import { Tabs } from 'expo-router';
import { Book, Brain, User } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import AuthWrapper from '@/components/auth/AuthWrapper';

export default function TabLayout() {
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
            title: 'Ćwiczenia',
            tabBarIcon: ({ size, color }) => (
              <Book size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="ai"
          options={{
            title: 'AI Trener',
            tabBarIcon: ({ size, color }) => (
              <Brain size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
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