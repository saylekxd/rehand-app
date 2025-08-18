import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  Text,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/useUserStats';
import { useAchievements } from '@/hooks/useAchievements';
import EditProfileScreen from '@/screens/EditProfileScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import PrivacyScreen from '@/screens/PrivacyScreen';
import HelpScreen from '@/screens/HelpScreen';
import {
  ProfileHeader,
  StatsSection,
  WeeklyGoalSection,
  HealthInfoSection,
  AchievementsSection,
  MenuSection,
} from '@/components/profile';

export default function ProfileTab() {
  const { user, signOut } = useAuth();
  const { stats, loading: statsLoading, error: statsError, refetch } = useUserStats(user?.id || null);
  const { achievements, loading: achievementsLoading, error: achievementsError, refetch: refetchAchievements } = useAchievements(user?.id || null);
  
  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Ładowanie profilu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader 
          user={user} 
          onEditPress={() => setShowEditProfile(true)} 
        />

        <StatsSection
          stats={stats}
          loading={statsLoading}
          error={statsError}
          onRetry={refetch}
        />

        <WeeklyGoalSection
          weeklyGoal={stats?.weeklyGoal || 0}
          loading={statsLoading}
        />

        <HealthInfoSection
          medicalConditions={user.medical_conditions || []}
        />

        <AchievementsSection
          achievements={achievements}
          loading={achievementsLoading}
          error={achievementsError}
          onRetry={refetchAchievements}
        />

        <MenuSection
          onSettingsPress={() => setShowSettings(true)}
          onNotificationsPress={() => setShowNotifications(true)}
          onPrivacyPress={() => setShowPrivacy(true)}
          onHelpPress={() => setShowHelp(true)}
          onLogout={signOut}
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <EditProfileScreen 
          onClose={() => {
            setShowEditProfile(false);
            // Refresh data after profile update
            refetch();
            refetchAchievements();
          }}
        />
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}
      >
        <SettingsScreen onClose={() => setShowSettings(false)} />
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotifications(false)}
      >
        <NotificationsScreen onClose={() => setShowNotifications(false)} />
      </Modal>

      {/* Privacy Modal */}
      <Modal
        visible={showPrivacy}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacy(false)}
      >
        <PrivacyScreen onClose={() => setShowPrivacy(false)} />
      </Modal>

      {/* Help Modal */}
      <Modal
        visible={showHelp}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHelp(false)}
      >
        <HelpScreen onClose={() => setShowHelp(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 32,
  },
});
