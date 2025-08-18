import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/useUserStats';
import { Settings, Trophy, Calendar, TrendingUp, User, Bell, Shield, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';

export default function ProfileTab() {
  const { user, signOut } = useAuth();
  const { stats, loading: statsLoading, error: statsError, refetch } = useUserStats(user?.id || null);

  const menuItems = [
    { id: '1', title: 'Ustawienia', icon: Settings, subtitle: 'Personalizacja aplikacji' },
    { id: '2', title: 'Powiadomienia', icon: Bell, subtitle: 'Zarządzaj przypomnieniami' },
    { id: '3', title: 'Prywatność', icon: Shield, subtitle: 'Bezpieczeństwo danych' },
    { id: '4', title: 'Pomoc', icon: HelpCircle, subtitle: 'Wsparcie i FAQ' },
  ];

  const achievements = [
    { id: '1', title: 'Pierwszy krok', description: 'Ukończyłeś pierwsze ćwiczenie', earned: true },
    { id: '2', title: 'Wytrwałość', description: '7 dni z rzędu', earned: true },
    { id: '3', title: 'Mistrz', description: '50 ukończonych ćwiczeń', earned: false },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Wylogowanie',
      'Czy na pewno chcesz się wylogować?',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Wyloguj', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.email?.split('@')[0] || 'Użytkownik';
  };

  const getFitnessLevelDisplay = () => {
    switch (user?.fitness_level) {
      case 'beginner':
        return 'Poziom początkujący';
      case 'intermediate':
        return 'Poziom średniozaawansowany';
      case 'advanced':
        return 'Poziom zaawansowany';
      default:
        return 'Poziom nie określony';
    }
  };

  const getAvatarUrl = () => {
    return user?.avatar_url || 'https://images.pexels.com/photos/3823495/pexels-photo-3823495.jpeg?auto=compress&cs=tinysrgb&w=200';
  };

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
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: getAvatarUrl() }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{getDisplayName()}</Text>
              <Text style={styles.userLevel}>{getFitnessLevelDisplay()}</Text>
              {user.goals && user.goals.length > 0 && (
                <View style={styles.goalsContainer}>
                  <Text style={styles.goalsLabel}>Cele: </Text>
                  <Text style={styles.goalsText} numberOfLines={1}>
                    {user.goals.slice(0, 2).join(', ')}
                    {user.goals.length > 2 ? '...' : ''}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.editButton}>
              <User size={20} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Twoje postępy</Text>
          {statsLoading ? (
            <View style={styles.loadingStats}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Ładowanie statystyk...</Text>
            </View>
          ) : statsError ? (
            <View style={styles.errorStats}>
              <Text style={styles.errorText}>Błąd ładowania statystyk</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Trophy size={24} color="#F59E0B" />
                <Text style={styles.statValue}>{stats?.completedExercises || 0}</Text>
                <Text style={styles.statLabel}>Ukończone ćwiczenia</Text>
              </View>
              <View style={styles.statCard}>
                <Calendar size={24} color="#10B981" />
                <Text style={styles.statValue}>{stats?.streakDays || 0}</Text>
                <Text style={styles.statLabel}>Dni z rzędu</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp size={24} color="#2563EB" />
                <Text style={styles.statValue}>{stats?.totalMinutes || 0}</Text>
                <Text style={styles.statLabel}>Minut ćwiczeń</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.weeklyGoalContainer}>
          <Text style={styles.sectionTitle}>Tygodniowy cel</Text>
          {statsLoading ? (
            <View style={styles.loadingGoal}>
              <ActivityIndicator size="small" color="#2563EB" />
            </View>
          ) : (
            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalText}>Postęp tego tygodnia</Text>
                <Text style={styles.goalPercentage}>{stats?.weeklyGoal || 0}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${stats?.weeklyGoal || 0}%` }]} />
              </View>
              <Text style={styles.goalSubtext}>
                {(stats?.weeklyGoal || 0) >= 80 
                  ? 'Świetna robota! Jesteś blisko celu' 
                  : 'Kontynuuj ćwiczenia aby osiągnąć swój cel'
                }
              </Text>
            </View>
          )}
        </View>

        {/* Health Info Section - New */}
        {user.medical_conditions && user.medical_conditions.length > 0 && (
          <View style={styles.healthContainer}>
            <Text style={styles.sectionTitle}>Informacje zdrowotne</Text>
            <View style={styles.healthCard}>
              <View style={styles.conditionsContainer}>
                <Text style={styles.conditionsLabel}>Uwagi medyczne:</Text>
                <View style={styles.tagsContainer}>
                  {user.medical_conditions.map((condition, index) => (
                    <View key={index} style={styles.conditionTag}>
                      <Text style={styles.conditionTagText}>{condition}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Osiągnięcia</Text>
          <View style={styles.achievementsList}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={[
                styles.achievementCard,
                !achievement.earned && styles.achievementCardLocked
              ]}>
                <Trophy 
                  size={20} 
                  color={achievement.earned ? '#F59E0B' : '#D1D5DB'} 
                />
                <View style={styles.achievementContent}>
                  <Text style={[
                    styles.achievementTitle,
                    !achievement.earned && styles.achievementTitleLocked
                  ]}>
                    {achievement.title}
                  </Text>
                  <Text style={[
                    styles.achievementDescription,
                    !achievement.earned && styles.achievementDescriptionLocked
                  ]}>
                    {achievement.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Ustawienia</Text>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <item.icon size={20} color="#6B7280" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          ))}
          
          {/* Logout Button */}
          <TouchableOpacity style={[styles.menuItem, styles.logoutMenuItem]} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
                <LogOut size={20} color="#EF4444" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuItemTitle, styles.logoutText]}>Wyloguj się</Text>
                <Text style={styles.menuItemSubtitle}>Zakończ sesję</Text>
              </View>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  goalsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  goalsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  goalsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#2563EB',
    flex: 1,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  weeklyGoalContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  goalPercentage: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  goalSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  healthContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  conditionsContainer: {
    marginBottom: 12,
  },
  conditionsLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  conditionTagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
  },
  achievementsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 2,
  },
  achievementTitleLocked: {
    color: '#9CA3AF',
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  achievementDescriptionLocked: {
    color: '#D1D5DB',
  },
  menuContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutMenuItem: {
    marginTop: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutIconContainer: {
    backgroundColor: '#FEF2F2',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 2,
  },
  logoutText: {
    color: '#EF4444',
  },
  menuItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  menuItemArrow: {
    fontSize: 24,
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
  },
  bottomSpacing: {
    height: 32,
  },
  loadingStats: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingGoal: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  errorStats: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
});
