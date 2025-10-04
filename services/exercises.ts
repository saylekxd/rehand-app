import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise } from '@/types';

export interface ExerciseFilters {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  searchQuery?: string;
  duration?: {
    min?: number;
    max?: number;
  };
}

export class ExercisesService {
  private static readonly PREMIUM_OVERRIDE_KEY = 'premium_override_until';

  private static async getPremiumActive(): Promise<boolean> {
    try {
      // 1) Optimistic override window
      try {
        const untilStr = await AsyncStorage.getItem(this.PREMIUM_OVERRIDE_KEY);
        const until = untilStr ? Number(untilStr) : 0;
        if (Number.isFinite(until) && until > Date.now()) {
          return true;
        }
      } catch {}

      // 2) Source of truth from DB view
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id;
      if (!userId) return false;
      const { data } = await supabase
        .from('v_user_entitlements')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      const premium = Boolean((data as any)?.premium_active);

      // If DB confirms premium, clear any stale override
      if (premium) {
        try { await AsyncStorage.removeItem(this.PREMIUM_OVERRIDE_KEY); } catch {}
      }
      return premium;
    } catch {
      return false;
    }
  }
  /**
   * Fetch all active exercises from the database
   */
  static async getAllExercises(): Promise<{ data: Exercise[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('difficulty', { ascending: true })
        .order('duration_minutes', { ascending: true });

      // Gate on entitlement (client-side safeguard; server-side should use RLS or view if desired)
      const premium = await this.getPremiumActive();
      const filtered = premium ? (data || []) : (data || []).filter((e: any) => e.is_trial === true);

      if (error) {
        console.error('Error fetching exercises:', error);
        return { data: null, error };
      }

      return { data: filtered, error: null };
    } catch (error) {
      console.error('Error in getAllExercises:', error);
      return { data: null, error };
    }
  }

  /**
   * Fetch exercises with filters
   */
  static async getFilteredExercises(filters: ExerciseFilters): Promise<{ data: Exercise[] | null; error: any }> {
    try {
      let query = supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true);

      // Apply category filter
      if (filters.category && filters.category !== 'Wszystkie') {
        query = query.eq('category', filters.category);
      }

      // Apply difficulty filter
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      // Apply duration filter
      if (filters.duration?.min) {
        query = query.gte('duration_minutes', filters.duration.min);
      }
      if (filters.duration?.max) {
        query = query.lte('duration_minutes', filters.duration.max);
      }

      // Apply search query
      if (filters.searchQuery && filters.searchQuery.trim()) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }

      // Order results
      query = query.order('category', { ascending: true })
                  .order('difficulty', { ascending: true })
                  .order('duration_minutes', { ascending: true });

      const { data, error } = await query;
      const premium = await this.getPremiumActive();
      const filtered = premium ? (data || []) : (data || []).filter((e: any) => e.is_trial === true);

      if (error) {
        console.error('Error fetching filtered exercises:', error);
        return { data: null, error };
      }

      return { data: filtered, error: null };
    } catch (error) {
      console.error('Error in getFilteredExercises:', error);
      return { data: null, error };
    }
  }

  /**
   * Get unique categories from exercises
   */
  static async getCategories(): Promise<{ data: string[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('category')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching categories:', error);
        return { data: null, error };
      }

      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map(item => item.category) || [])];
      
      return { data: uniqueCategories, error: null };
    } catch (error) {
      console.error('Error in getCategories:', error);
      return { data: null, error };
    }
  }

  /**
   * Get exercise by ID
   */
  static async getExerciseById(id: string): Promise<{ data: Exercise | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching exercise by ID:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getExerciseById:', error);
      return { data: null, error };
    }
  }

  /**
   * Record exercise completion for user
   */
  static async recordExerciseCompletion(
    userId: string, 
    exerciseId: string, 
    durationCompleted: number,
    difficultyRating?: number,
    notes?: string
  ): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('user_exercises')
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          duration_completed: durationCompleted,
          difficulty_rating: difficultyRating,
          notes,
          completed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error recording exercise completion:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in recordExerciseCompletion:', error);
      return { error };
    }
  }

  /**
   * Get user's exercise history
   */
  static async getUserExerciseHistory(userId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_exercises')
        .select(`
          *,
          exercises (
            title,
            category,
            difficulty,
            duration_minutes
          )
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching user exercise history:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in getUserExerciseHistory:', error);
      return { data: null, error };
    }
  }
} 