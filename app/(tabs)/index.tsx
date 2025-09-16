import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Button,
} from 'react-native';
import { Search, Clock, Target, Play, AlertCircle } from 'lucide-react-native';
import { useExercises } from '@/hooks/useExercises';
import { Exercise } from '@/types';
import ExerciseDetailScreen from '@/screens/ExerciseDetailScreen';
import AuthWrapper from '@/components/auth/AuthWrapper';
import * as Sentry from '@sentry/react-native';

export default function ExercisesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const { exercises, categories, loading, error, refetch, applyFilters } = useExercises();

  // Helper functions
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

  // Apply filters when search or category changes
  const handleFilter = useCallback(async () => {
    await applyFilters({
      category: selectedCategory !== 'Wszystkie' ? selectedCategory : undefined,
      searchQuery: searchQuery.trim() || undefined,
    });
  }, [searchQuery, selectedCategory, applyFilters]);

  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  // Handle exercise selection
  const handleExercisePress = (exercise: Exercise) => {
    setSelectedExerciseId(exercise.id);
  };

  const handleCloseDetail = () => {
    setSelectedExerciseId(null);
  };

  // Error state
  if (error && !loading && exercises.length === 0) {
    return (
      <AuthWrapper>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>Błąd ładowania</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Biblioteka Ćwiczeń</Text>
          <Text style={styles.subtitle}>Wybierz ćwiczenie dostosowane do Twoich potrzeb</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Szukaj ćwiczeń..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Button title='Try!' onPress={ () => { Sentry.captureException(new Error('First error')) }}/>     
        <ScrollView 
          style={styles.exercisesList} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              colors={['#2563EB']}
              tintColor="#2563EB"
            />
          }
        >
          {loading && exercises.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Ładowanie ćwiczeń...</Text>
            </View>
          ) : exercises.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Target size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Brak ćwiczeń</Text>
              <Text style={styles.emptyText}>
                {searchQuery || selectedCategory !== 'Wszystkie' 
                  ? 'Nie znaleziono ćwiczeń spełniających kryteria wyszukiwania'
                  : 'Obecnie brak dostępnych ćwiczeń'
                }
              </Text>
            </View>
          ) : (
            exercises.map((exercise) => (
              <TouchableOpacity 
                key={exercise.id} 
                style={styles.exerciseCard}
                onPress={() => handleExercisePress(exercise)}
              >
                <Image source={{ uri: getImageUrl(exercise) }} style={styles.exerciseImage} />
                <View style={styles.exerciseContent}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                    <View style={[
                      styles.difficultyBadge, 
                      { backgroundColor: getDifficultyColor(exercise.difficulty) + '20' }
                    ]}>
                      <Text style={[
                        styles.difficultyText, 
                        { color: getDifficultyColor(exercise.difficulty) }
                      ]}>
                        {translateDifficulty(exercise.difficulty)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  <View style={styles.exerciseFooter}>
                    <View style={styles.exerciseInfo}>
                      <Clock size={16} color="#6B7280" />
                      <Text style={styles.exerciseInfoText}>{formatDuration(exercise.duration_minutes)}</Text>
                      <Target size={16} color="#6B7280" />
                      <Text style={styles.exerciseInfoText}>{exercise.category}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.playButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleExercisePress(exercise);
                      }}
                    >
                      <Play size={16} color="#FFFFFF" />
                      <Text style={styles.playButtonText}>Zobacz</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Exercise Detail Modal */}
        <Modal
          visible={selectedExerciseId !== null}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCloseDetail}
        >
          {selectedExerciseId && (
            <ExerciseDetailScreen 
              exerciseId={selectedExerciseId}
              onClose={handleCloseDetail}
            />
          )}
        </Modal>
      </SafeAreaView>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  categoriesContainer: {
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  categoriesContent: {
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#2563EB',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  exercisesList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  exerciseContent: {
    padding: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exerciseTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  exerciseDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  playButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
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
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});