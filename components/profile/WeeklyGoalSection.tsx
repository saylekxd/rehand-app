import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Target, CheckCircle, Clock } from 'lucide-react-native';

interface WeeklyGoalSectionProps {
  weeklyGoal: number;
  loading: boolean;
}

export default function WeeklyGoalSection({ weeklyGoal, loading }: WeeklyGoalSectionProps) {
  const progress = Math.min(weeklyGoal || 0, 100);
  const isCompleted = progress >= 100;
  const isNearCompletion = progress >= 80;

  const getProgressColor = () => {
    if (isCompleted) return '#10B981';
    if (isNearCompletion) return '#F59E0B';
    return '#2563EB';
  };

  const getProgressIcon = () => {
    if (isCompleted) return <CheckCircle size={20} color="#10B981" />;
    return <Target size={20} color={getProgressColor()} />;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Tygodniowy cel</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2563EB" />
        </View>
      ) : (
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View style={styles.goalTitleContainer}>
              {getProgressIcon()}
              <Text style={styles.goalTitle}>Postęp tego tygodnia</Text>
            </View>
            <View style={styles.percentageContainer}>
              <Text style={[styles.goalPercentage, { color: getProgressColor() }]}>
                {Math.round(progress)}%
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress}%`,
                    backgroundColor: getProgressColor()
                  }
                ]} 
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>0%</Text>
              <Text style={styles.progressLabel}>50%</Text>
              <Text style={styles.progressLabel}>100%</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.statText}>120 min</Text>
              <Text style={styles.statSubtext}>cel tygodniowy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Target size={16} color="#6B7280" />
              <Text style={styles.statText}>{Math.round((progress / 100) * 120)} min</Text>
              <Text style={styles.statSubtext}>wykonane</Text>
            </View>
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
    marginBottom: 16,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  percentageContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goalPercentage: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  statSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
}); 