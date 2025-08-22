import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ExerciseConfig } from '../../types/ai';
import { getAvailableExercises } from '../../configs/exercises';

interface ExerciseSelectorProps {
  selectedExercise: string;
  onExerciseSelect: (exerciseId: string) => void;
  isVisible: boolean;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  selectedExercise,
  onExerciseSelect,
  isVisible
}) => {
  const exercises = getAvailableExercises();

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wybierz ćwiczenie</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.exerciseList}
      >
        {exercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={[
              styles.exerciseCard,
              selectedExercise === exercise.id && styles.selectedCard
            ]}
            onPress={() => onExerciseSelect(exercise.id)}
          >
            <Text style={[
              styles.exerciseName,
              selectedExercise === exercise.id && styles.selectedText
            ]}>
              {exercise.name}
            </Text>
            <Text style={[
              styles.exerciseDescription,
              selectedExercise === exercise.id && styles.selectedDescription
            ]}>
              {getExerciseDescription(exercise)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

/**
 * Zwraca opis ćwiczenia
 */
const getExerciseDescription = (exercise: ExerciseConfig): string => {
  const descriptions: Record<string, string> = {
    'neck_stretch': 'Rozciąganie mięśni szyi',
    'shoulder_raise': 'Wzmacnianie ramion',
    'arm_raise': 'Mobilność stawów ramiennych',
    'squat': 'Wzmacnianie nóg',
    'lunge': 'Równowaga i siła'
  };
  
  return descriptions[exercise.id] || 'Ćwiczenie rehabilitacyjne';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  exerciseList: {
    paddingHorizontal: 4,
  },
  exerciseCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: '#EBF4FF',
    borderColor: '#2563EB',
  },
  exerciseName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 6,
  },
  selectedText: {
    color: '#2563EB',
  },
  exerciseDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedDescription: {
    color: '#1E40AF',
  },
});