import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Trophy, Calendar, TrendingUp, RefreshCw } from 'lucide-react-native';

interface UserStats {
  completedExercises?: number;
  streakDays?: number;
  totalMinutes?: number;
}

interface StatsSectionProps {
  stats: UserStats | null;
  loading: boolean;
  error: any;
  onRetry: () => void;
}

export default function StatsSection({ stats, loading, error, onRetry }: StatsSectionProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Twoje postępy</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Ładowanie statystyk...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <RefreshCw size={32} color="#EF4444" />
          <Text style={styles.errorText}>Nie udało się załadować statystyk</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.exercisesCard]}>
            <View style={[styles.iconContainer, styles.exercisesIcon]}>
              <Trophy size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{stats?.completedExercises || 0}</Text>
            <Text style={styles.statLabel}>Ukończone{'\n'}ćwiczenia</Text>
          </View>
          
          <View style={[styles.statCard, styles.streakCard]}>
            <View style={[styles.iconContainer, styles.streakIcon]}>
              <Calendar size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats?.streakDays || 0}</Text>
            <Text style={styles.statLabel}>Dni z rzędu</Text>
          </View>
          
          <View style={[styles.statCard, styles.timeCard]}>
            <View style={[styles.iconContainer, styles.timeIcon]}>
              <TrendingUp size={20} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>
              {stats?.totalMinutes ? formatTime(stats.totalMinutes) : '0min'}
            </Text>
            <Text style={styles.statLabel}>Czas{'\n'}ćwiczeń</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
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
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  exercisesCard: {
    borderTopWidth: 3,
    borderTopColor: '#F59E0B',
  },
  streakCard: {
    borderTopWidth: 3,
    borderTopColor: '#10B981',
  },
  timeCard: {
    borderTopWidth: 3,
    borderTopColor: '#2563EB',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  exercisesIcon: {
    backgroundColor: '#FEF3C7',
  },
  streakIcon: {
    backgroundColor: '#ECFDF5',
  },
  timeIcon: {
    backgroundColor: '#EFF6FF',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 12,
  },
  errorContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
}); 