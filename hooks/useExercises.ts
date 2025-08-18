import { useState, useEffect, useCallback } from 'react';
import { Exercise } from '@/types';
import { ExercisesService, ExerciseFilters } from '@/services/exercises';

export interface UseExercisesReturn {
  exercises: Exercise[];
  categories: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  applyFilters: (filters: ExerciseFilters) => Promise<void>;
}

export function useExercises(): UseExercisesReturn {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch exercises and categories in parallel
      const [exercisesResult, categoriesResult] = await Promise.all([
        ExercisesService.getAllExercises(),
        ExercisesService.getCategories()
      ]);

      if (exercisesResult.error) {
        throw new Error('Nie udało się załadować ćwiczeń');
      }

      if (categoriesResult.error) {
        console.warn('Error fetching categories, using fallback');
      }

      setExercises(exercisesResult.data || []);
      
      // Add "Wszystkie" as first category, then unique categories from data
      const allCategories = ['Wszystkie', ...(categoriesResult.data || [])];
      setCategories(allCategories);

    } catch (err) {
      console.error('Error in fetchExercises:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd');
      setExercises([]);
      setCategories(['Wszystkie']);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(async (filters: ExerciseFilters) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await ExercisesService.getFilteredExercises(filters);

      if (fetchError) {
        throw new Error('Nie udało się przefiltrować ćwiczeń');
      }

      setExercises(data || []);

    } catch (err) {
      console.error('Error in applyFilters:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas filtrowania');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchExercises();
  }, [fetchExercises]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return {
    exercises,
    categories,
    loading,
    error,
    refetch,
    applyFilters,
  };
}

// Hook for single exercise
export function useExercise(exerciseId: string | null) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExercise = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await ExercisesService.getExerciseById(id);

      if (fetchError) {
        throw new Error('Nie udało się załadować ćwiczenia');
      }

      setExercise(data);

    } catch (err) {
      console.error('Error in fetchExercise:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd');
      setExercise(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (exerciseId) {
      fetchExercise(exerciseId);
    } else {
      setExercise(null);
      setLoading(false);
      setError(null);
    }
  }, [exerciseId, fetchExercise]);

  const refetch = useCallback(() => {
    if (exerciseId) {
      fetchExercise(exerciseId);
    }
  }, [exerciseId, fetchExercise]);

  return {
    exercise,
    loading,
    error,
    refetch,
  };
} 