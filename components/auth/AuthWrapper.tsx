import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import OnboardingScreen from './OnboardingScreen';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { session, user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // If no session, show auth screens
  if (!session) {
    if (authMode === 'login') {
      return (
        <LoginScreen onSwitchToRegister={() => setAuthMode('register')} />
      );
    } else {
      return (
        <RegisterScreen onSwitchToLogin={() => setAuthMode('login')} />
      );
    }
  }

  // If user hasn't completed onboarding, show onboarding
  if (user && !user.onboarding_completed) {
    return <OnboardingScreen />;
  }

  // User is authenticated and onboarded, show main app
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
}); 