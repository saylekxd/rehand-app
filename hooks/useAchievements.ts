import { useState, useEffect } from 'react';
import { AchievementService, Achievement } from '@/services/achievements';

interface UseAchievementsResult {
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  stats: {
    total: number;
    earned: number;
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  } | null;
}

export function useAchievements(userId: string | null): UseAchievementsResult {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<UseAchievementsResult['stats']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch achievements and stats in parallel
      const [userAchievements, achievementStats] = await Promise.all([
        AchievementService.getUserAchievements(userId),
        AchievementService.getAchievementStats(userId)
      ]);

      setAchievements(userAchievements);
      setStats(achievementStats);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  const refetch = async () => {
    await fetchAchievements();
  };

  return {
    achievements,
    loading,
    error,
    refetch,
    stats
  };
} 