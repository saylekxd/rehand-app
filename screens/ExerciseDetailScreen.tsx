import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { 
  X, 
  Play, 
  Clock, 
  Target, 
  Users, 
  Zap, 
  CheckCircle, 
  Dumbbell,
  Heart,
  ArrowRight 
} from 'lucide-react-native';
import { useExercise } from '@/hooks/useExercises';
import { Exercise } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { ExercisesService } from '@/services/exercises';

interface ExerciseDetailScreenProps {
  exerciseId: string;
  onClose: () => void;
}

export default function ExerciseDetailScreen({ exerciseId, onClose }: ExerciseDetailScreenProps) {
  const { exercise, loading, error, refetch } = useExercise(exerciseId);
  const { user } = useAuth();
  const [isStarting, setIsStarting] = useState(false);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const translateDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): string => {
    switch (difficulty) {
      case 'easy': return 'Łatwy';
      case 'medium': return 'Średni';
      case 'hard': return 'Trudny';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard'): string => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getImageUrl = (exercise: Exercise): string => {
    return exercise.image_url || 'https://images.pexels.com/photos/3823495/pexels-photo-3823495.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  const handleStartExercise = async () => {
    if (!exercise || !user) return;

    try {
      setIsStarting(true);
      
      // TODO: Navigate to exercise player/timer screen
      // For now, just record that user started the exercise
      await ExercisesService.recordExerciseCompletion(
        user.id,
        exercise.id,
        exercise.duration_minutes,
        undefined, // difficulty rating will be collected after completion
        'Ćwiczenie rozpoczęte'
      );

      Alert.alert(
        'Ćwiczenie rozpoczęte!',
        `Rozpocząłeś ćwiczenie "${exercise.title}". Powodzenia!`,
        [
          { text: 'OK', onPress: onClose }
        ]
      );

    } catch (error) {
      console.error('Error starting exercise:', error);
      Alert.alert('Błąd', 'Nie udało się rozpocząć ćwiczenia');
    } finally {
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Szczegóły ćwiczenia</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Ładowanie szczegółów ćwiczenia...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Błąd</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Nie udało się załadować szczegółów ćwiczenia'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onClose}>
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Szczegóły ćwiczenia</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: getImageUrl(exercise) }} style={styles.exerciseImage} />
          <View style={styles.imageOverlay}>
            <View style={[
              styles.difficultyBadge, 
              { backgroundColor: getDifficultyColor(exercise.difficulty) }
            ]}>
              <Text style={styles.difficultyText}>
                {translateDifficulty(exercise.difficulty)}
              </Text>
            </View>
          </View>
        </View>

        {/* Exercise Header */}
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseTitle}>{exercise.title}</Text>
          <Text style={styles.exerciseDescription}>{exercise.description}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, styles.timeIcon]}>
              <Clock size={20} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>{formatDuration(exercise.duration_minutes)}</Text>
            <Text style={styles.statLabel}>Czas trwania</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, styles.categoryIcon]}>
              <Target size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{exercise.category}</Text>
            <Text style={styles.statLabel}>Kategoria</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, styles.difficultyIcon]}>
              <Zap size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{translateDifficulty(exercise.difficulty)}</Text>
            <Text style={styles.statLabel}>Trudność</Text>
          </View>
        </View>

        {/* Instructions */}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <CheckCircle size={20} color="#2563EB" />
              <Text style={styles.cardTitle}>Instrukcje wykonania</Text>
            </View>
            {exercise.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Muscle Groups */}
        {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Heart size={20} color="#EF4444" />
              <Text style={styles.cardTitle}>Zaangażowane mięśnie</Text>
            </View>
            <View style={styles.tagsContainer}>
              {exercise.muscle_groups.map((muscle, index) => (
                <View key={index} style={[styles.tag, styles.muscleTag]}>
                  <Text style={[styles.tagText, styles.muscleTagText]}>{muscle}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Equipment */}
        {exercise.equipment && exercise.equipment.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Dumbbell size={20} color="#6B7280" />
              <Text style={styles.cardTitle}>Potrzebny sprzęt</Text>
            </View>
            <View style={styles.tagsContainer}>
              {exercise.equipment.map((item, index) => (
                <View key={index} style={[styles.tag, styles.equipmentTag]}>
                  <Text style={[styles.tagText, styles.equipmentTagText]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* No Equipment Required */}
        {(!exercise.equipment || exercise.equipment.length === 0) && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Dumbbell size={20} color="#10B981" />
              <Text style={styles.cardTitle}>Sprzęt</Text>
            </View>
            <View style={styles.noEquipmentContainer}>
              <CheckCircle size={24} color="#10B981" />
              <Text style={styles.noEquipmentText}>Nie potrzebujesz żadnego sprzętu!</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Start Button */}
      <View style={styles.startButtonContainer}>
        <TouchableOpacity 
          style={[styles.startButton, isStarting && styles.startButtonDisabled]} 
          onPress={handleStartExercise}
          disabled={isStarting}
        >
          {isStarting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Play size={20} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Rozpocznij ćwiczenie</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  exerciseImage: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  exerciseHeader: {
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  exerciseTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statItem: {
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeIcon: {
    backgroundColor: '#EFF6FF',
  },
  categoryIcon: {
    backgroundColor: '#ECFDF5',
  },
  difficultyIcon: {
    backgroundColor: '#FEF3C7',
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  instructionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  muscleTag: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  equipmentTag: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  muscleTagText: {
    color: '#DC2626',
  },
  equipmentTagText: {
    color: '#6B7280',
  },
  noEquipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noEquipmentText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  startButtonContainer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 32,
  },
}); 