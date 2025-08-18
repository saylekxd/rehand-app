import { supabase } from '@/lib/supabase';

export interface UserStats {
  completedExercises: number;
  totalMinutes: number;
  streakDays: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export class UserStatsService {
  /**
   * Get the total count of completed exercises for a user
   */
  static async getCompletedExercisesCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_exercises')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching completed exercises count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error fetching completed exercises count:', error);
      return 0;
    }
  }

  /**
   * Get the total minutes exercised by a user
   */
  static async getTotalMinutesExercised(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_exercises')
        .select('duration_completed')
        .eq('user_id', userId)
        .not('duration_completed', 'is', null);

      if (error) {
        console.error('Error fetching total minutes:', error);
        return 0;
      }

      const totalMinutes = data?.reduce((sum, exercise) => {
        return sum + (exercise.duration_completed || 0);
      }, 0) || 0;

      return totalMinutes;
    } catch (error) {
      console.error('Error fetching total minutes:', error);
      return 0;
    }
  }

  /**
   * Calculate current exercise streak (consecutive days with exercises)
   */
  static async getCurrentStreak(userId: string): Promise<number> {
    try {
      // Get unique exercise dates for the user, ordered by date descending
      const { data, error } = await supabase
        .from('user_exercises')
        .select('completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching exercise dates:', error);
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      // Group exercises by date and get unique dates
      const uniqueDates = [...new Set(
        data.map(exercise => 
          new Date(exercise.completed_at).toDateString()
        )
      )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      if (uniqueDates.length === 0) {
        return 0;
      }

      // Check if the most recent exercise was today or yesterday
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
        return 0; // Streak is broken if no exercise today or yesterday
      }

      // Calculate consecutive days
      let streak = 1;
      const currentDate = new Date(uniqueDates[0]);

      for (let i = 1; i < uniqueDates.length; i++) {
        const previousDate = new Date(uniqueDates[i]);
        const daysDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000));
        
        if (daysDiff === i) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }

  /**
   * Get weekly exercise progress (minutes this week vs goal)
   */
  static async getWeeklyProgress(userId: string, weeklyGoalMinutes: number = 150): Promise<{ progress: number; minutesThisWeek: number }> {
    try {
      // Get start of current week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - daysToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('user_exercises')
        .select('duration_completed')
        .eq('user_id', userId)
        .gte('completed_at', startOfWeek.toISOString())
        .not('duration_completed', 'is', null);

      if (error) {
        console.error('Error fetching weekly progress:', error);
        return { progress: 0, minutesThisWeek: 0 };
      }

      const minutesThisWeek = data?.reduce((sum, exercise) => {
        return sum + (exercise.duration_completed || 0);
      }, 0) || 0;

      const progress = Math.min(100, Math.round((minutesThisWeek / weeklyGoalMinutes) * 100));

      return { progress, minutesThisWeek };
    } catch (error) {
      console.error('Error calculating weekly progress:', error);
      return { progress: 0, minutesThisWeek: 0 };
    }
  }

  /**
   * Get user's weekly goal from profile (with fallback)
   */
  static async getWeeklyGoal(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('weekly_goal_minutes')
        .eq('id', userId)
        .single();

      if (error || !data?.weekly_goal_minutes) {
        // Default weekly goal based on fitness level
        const { data: profileData } = await supabase
          .from('profiles')
          .select('fitness_level')
          .eq('id', userId)
          .single();

        switch (profileData?.fitness_level) {
          case 'beginner':
            return 90; // 90 minutes per week
          case 'intermediate':
            return 150; // 150 minutes per week
          case 'advanced':
            return 210; // 210 minutes per week
          default:
            return 120; // Default 120 minutes per week
        }
      }

      return data.weekly_goal_minutes;
    } catch (error) {
      console.error('Error fetching weekly goal:', error);
      return 120; // Default fallback
    }
  }

  /**
   * Update user's weekly goal
   */
  static async updateWeeklyGoal(userId: string, weeklyGoalMinutes: number): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          weekly_goal_minutes: weeklyGoalMinutes,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Get comprehensive user stats
   */
  static async getAllStats(userId: string): Promise<UserStats> {
    try {
      // Fetch all stats in parallel for better performance
      const [
        completedExercises,
        totalMinutes,
        streakDays,
        weeklyGoalMinutes
      ] = await Promise.all([
        this.getCompletedExercisesCount(userId),
        this.getTotalMinutesExercised(userId),
        this.getCurrentStreak(userId),
        this.getWeeklyGoal(userId)
      ]);

      const { progress: weeklyGoal, minutesThisWeek } = await this.getWeeklyProgress(userId, weeklyGoalMinutes);

      return {
        completedExercises,
        totalMinutes,
        streakDays,
        weeklyGoal,
        weeklyProgress: minutesThisWeek
      };
    } catch (error) {
      console.error('Error fetching all stats:', error);
      return {
        completedExercises: 0,
        totalMinutes: 0,
        streakDays: 0,
        weeklyGoal: 0,
        weeklyProgress: 0
      };
    }
  }
} 