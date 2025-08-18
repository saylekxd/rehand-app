import { supabase } from '@/lib/supabase';
import { UserStatsService } from './userStats';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  target?: number;
  category: 'milestone' | 'streak' | 'consistency' | 'time' | 'special';
  icon: 'trophy' | 'fire' | 'target' | 'clock' | 'star';
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface AchievementCriteria {
  id: string;
  title: string;
  description: string;
  category: Achievement['category'];
  icon: Achievement['icon'];
  rarity: Achievement['rarity'];
  checkFunction: (userId: string) => Promise<{ earned: boolean; progress?: number; target?: number; earnedAt?: string }>;
}

export class AchievementService {
  // Define all available achievements
  private static achievementCriteria: AchievementCriteria[] = [
    // Milestone Achievements
    {
      id: 'first_exercise',
      title: 'Pierwszy krok',
      description: 'Ukończyłeś pierwsze ćwiczenie',
      category: 'milestone',
      icon: 'trophy',
      rarity: 'bronze',
      checkFunction: async (userId: string) => {
        const { data, error } = await supabase
          .from('user_exercises')
          .select('completed_at')
          .eq('user_id', userId)
          .order('completed_at', { ascending: true })
          .limit(1);

        if (error || !data || data.length === 0) {
          return { earned: false, progress: 0, target: 1 };
        }

        return { 
          earned: true, 
          earnedAt: data[0].completed_at,
          progress: 1,
          target: 1
        };
      }
    },
    {
      id: 'exercise_10',
      title: 'Regularność',
      description: '10 ukończonych ćwiczeń',
      category: 'milestone',
      icon: 'target',
      rarity: 'bronze',
      checkFunction: async (userId: string) => {
        const count = await UserStatsService.getCompletedExercisesCount(userId);
        const earned = count >= 10;
        
        if (earned) {
          const { data } = await supabase
            .from('user_exercises')
            .select('completed_at')
            .eq('user_id', userId)
            .order('completed_at', { ascending: true })
            .limit(10);
          
          const earnedAt = data && data.length >= 10 ? data[9].completed_at : undefined;
          return { earned: true, earnedAt, progress: count, target: 10 };
        }
        
        return { earned: false, progress: count, target: 10 };
      }
    },
    {
      id: 'exercise_25',
      title: 'Determinacja',
      description: '25 ukończonych ćwiczeń',
      category: 'milestone',
      icon: 'target',
      rarity: 'silver',
      checkFunction: async (userId: string) => {
        const count = await UserStatsService.getCompletedExercisesCount(userId);
        const earned = count >= 25;
        
        if (earned) {
          const { data } = await supabase
            .from('user_exercises')
            .select('completed_at')
            .eq('user_id', userId)
            .order('completed_at', { ascending: true })
            .limit(25);
          
          const earnedAt = data && data.length >= 25 ? data[24].completed_at : undefined;
          return { earned: true, earnedAt, progress: count, target: 25 };
        }
        
        return { earned: false, progress: count, target: 25 };
      }
    },
    {
      id: 'exercise_50',
      title: 'Mistrz',
      description: '50 ukończonych ćwiczeń',
      category: 'milestone',
      icon: 'trophy',
      rarity: 'gold',
      checkFunction: async (userId: string) => {
        const count = await UserStatsService.getCompletedExercisesCount(userId);
        const earned = count >= 50;
        
        if (earned) {
          const { data } = await supabase
            .from('user_exercises')
            .select('completed_at')
            .eq('user_id', userId)
            .order('completed_at', { ascending: true })
            .limit(50);
          
          const earnedAt = data && data.length >= 50 ? data[49].completed_at : undefined;
          return { earned: true, earnedAt, progress: count, target: 50 };
        }
        
        return { earned: false, progress: count, target: 50 };
      }
    },
    {
      id: 'exercise_100',
      title: 'Legenda',
      description: '100 ukończonych ćwiczeń',
      category: 'milestone',
      icon: 'trophy',
      rarity: 'platinum',
      checkFunction: async (userId: string) => {
        const count = await UserStatsService.getCompletedExercisesCount(userId);
        const earned = count >= 100;
        
        if (earned) {
          const { data } = await supabase
            .from('user_exercises')
            .select('completed_at')
            .eq('user_id', userId)
            .order('completed_at', { ascending: true })
            .limit(100);
          
          const earnedAt = data && data.length >= 100 ? data[99].completed_at : undefined;
          return { earned: true, earnedAt, progress: count, target: 100 };
        }
        
        return { earned: false, progress: count, target: 100 };
      }
    },

    // Streak Achievements
    {
      id: 'streak_3',
      title: 'Dobry start',
      description: '3 dni z rzędu',
      category: 'streak',
      icon: 'fire',
      rarity: 'bronze',
      checkFunction: async (userId: string) => {
        const streak = await UserStatsService.getCurrentStreak(userId);
        return { 
          earned: streak >= 3, 
          progress: streak, 
          target: 3,
          earnedAt: streak >= 3 ? new Date().toISOString() : undefined
        };
      }
    },
    {
      id: 'streak_7',
      title: 'Wytrwałość',
      description: '7 dni z rzędu',
      category: 'streak',
      icon: 'fire',
      rarity: 'silver',
      checkFunction: async (userId: string) => {
        const streak = await UserStatsService.getCurrentStreak(userId);
        return { 
          earned: streak >= 7, 
          progress: streak, 
          target: 7,
          earnedAt: streak >= 7 ? new Date().toISOString() : undefined
        };
      }
    },
    {
      id: 'streak_14',
      title: 'Nieustępliwy',
      description: '14 dni z rzędu',
      category: 'streak',
      icon: 'fire',
      rarity: 'gold',
      checkFunction: async (userId: string) => {
        const streak = await UserStatsService.getCurrentStreak(userId);
        return { 
          earned: streak >= 14, 
          progress: streak, 
          target: 14,
          earnedAt: streak >= 14 ? new Date().toISOString() : undefined
        };
      }
    },
    {
      id: 'streak_30',
      title: 'Niezłomny',
      description: '30 dni z rzędu',
      category: 'streak',
      icon: 'fire',
      rarity: 'platinum',
      checkFunction: async (userId: string) => {
        const streak = await UserStatsService.getCurrentStreak(userId);
        return { 
          earned: streak >= 30, 
          progress: streak, 
          target: 30,
          earnedAt: streak >= 30 ? new Date().toISOString() : undefined
        };
      }
    },

    // Time-based Achievements
    {
      id: 'time_60',
      title: 'Godzina mocy',
      description: '60 minut ćwiczeń',
      category: 'time',
      icon: 'clock',
      rarity: 'bronze',
      checkFunction: async (userId: string) => {
        const totalMinutes = await UserStatsService.getTotalMinutesExercised(userId);
        return { 
          earned: totalMinutes >= 60, 
          progress: totalMinutes, 
          target: 60,
          earnedAt: totalMinutes >= 60 ? new Date().toISOString() : undefined
        };
      }
    },
    {
      id: 'time_300',
      title: 'Maraton',
      description: '5 godzin ćwiczeń',
      category: 'time',
      icon: 'clock',
      rarity: 'silver',
      checkFunction: async (userId: string) => {
        const totalMinutes = await UserStatsService.getTotalMinutesExercised(userId);
        return { 
          earned: totalMinutes >= 300, 
          progress: totalMinutes, 
          target: 300,
          earnedAt: totalMinutes >= 300 ? new Date().toISOString() : undefined
        };
      }
    },
    {
      id: 'time_600',
      title: 'Ultramaraton',
      description: '10 godzin ćwiczeń',
      category: 'time',
      icon: 'clock',
      rarity: 'gold',
      checkFunction: async (userId: string) => {
        const totalMinutes = await UserStatsService.getTotalMinutesExercised(userId);
        return { 
          earned: totalMinutes >= 600, 
          progress: totalMinutes, 
          target: 600,
          earnedAt: totalMinutes >= 600 ? new Date().toISOString() : undefined
        };
      }
    },

    // Consistency Achievements
    {
      id: 'weekly_goal_1',
      title: 'Cel tygodnia',
      description: 'Osiągnij tygodniowy cel',
      category: 'consistency',
      icon: 'target',
      rarity: 'bronze',
      checkFunction: async (userId: string) => {
        const weeklyGoal = await UserStatsService.getWeeklyGoal(userId);
        const { progress, minutesThisWeek } = await UserStatsService.getWeeklyProgress(userId, weeklyGoal);
        return { 
          earned: progress >= 100, 
          progress: minutesThisWeek, 
          target: weeklyGoal,
          earnedAt: progress >= 100 ? new Date().toISOString() : undefined
        };
      }
    }
  ];

  /**
   * Get all achievements for a user with their earned status
   */
  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const achievements: Achievement[] = [];

      // Check each achievement criteria
      for (const criteria of this.achievementCriteria) {
        const result = await criteria.checkFunction(userId);
        
        achievements.push({
          id: criteria.id,
          title: criteria.title,
          description: criteria.description,
          category: criteria.category,
          icon: criteria.icon,
          rarity: criteria.rarity,
          earned: result.earned,
          earnedAt: result.earnedAt,
          progress: result.progress,
          target: result.target
        });
      }

      // Sort achievements: earned first, then by rarity
      achievements.sort((a, b) => {
        if (a.earned !== b.earned) return a.earned ? -1 : 1;
        
        const rarityOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      });

      return achievements;
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  }

  /**
   * Get achievements stats (total, earned, by rarity)
   */
  static async getAchievementStats(userId: string): Promise<{
    total: number;
    earned: number;
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  }> {
    try {
      const achievements = await this.getUserAchievements(userId);
      
      const stats = {
        total: achievements.length,
        earned: achievements.filter(a => a.earned).length,
        bronze: achievements.filter(a => a.earned && a.rarity === 'bronze').length,
        silver: achievements.filter(a => a.earned && a.rarity === 'silver').length,
        gold: achievements.filter(a => a.earned && a.rarity === 'gold').length,
        platinum: achievements.filter(a => a.earned && a.rarity === 'platinum').length,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching achievement stats:', error);
      return { total: 0, earned: 0, bronze: 0, silver: 0, gold: 0, platinum: 0 };
    }
  }

  /**
   * Check for newly earned achievements (for notifications)
   */
  static async checkNewAchievements(userId: string, lastChecked?: string): Promise<Achievement[]> {
    try {
      const achievements = await this.getUserAchievements(userId);
      
      if (!lastChecked) {
        return achievements.filter(a => a.earned);
      }

      const lastCheckedDate = new Date(lastChecked);
      return achievements.filter(a => 
        a.earned && 
        a.earnedAt && 
        new Date(a.earnedAt) > lastCheckedDate
      );
    } catch (error) {
      console.error('Error checking new achievements:', error);
      return [];
    }
  }

  /**
   * Get achievements by category
   */
  static async getAchievementsByCategory(userId: string, category: Achievement['category']): Promise<Achievement[]> {
    const achievements = await this.getUserAchievements(userId);
    return achievements.filter(a => a.category === category);
  }

  /**
   * Get next achievements to unlock (not earned, sorted by progress)
   */
  static async getNextAchievements(userId: string, limit: number = 3): Promise<Achievement[]> {
    const achievements = await this.getUserAchievements(userId);
    
    return achievements
      .filter(a => !a.earned && a.progress !== undefined && a.target !== undefined)
      .sort((a, b) => {
        const progressA = (a.progress! / a.target!) * 100;
        const progressB = (b.progress! / b.target!) * 100;
        return progressB - progressA; // Highest progress first
      })
      .slice(0, limit);
  }
} 