import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import OnboardingScreen from './OnboardingScreen';
import IntroScreen from './IntroScreen';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { session, user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [introCompleted, setIntroCompleted] = useState<boolean | null>(null);

  // Check if intro was already completed
  useEffect(() => {
    const checkIntroStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem('intro_completed');
        setIntroCompleted(completed === 'true');
      } catch (error) {
        console.error('Error checking intro status:', error);
        setIntroCompleted(false);
      }
    };

    checkIntroStatus();
  }, []);

  const handleIntroComplete = () => {
    setIntroCompleted(true);
  };

  if (loading || introCompleted === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // If no session, check intro first
  if (!session) {
    // Show intro if not completed yet
    if (!introCompleted) {
      return <IntroScreen onComplete={handleIntroComplete} />;
    }

    // Show auth screens after intro is completed
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