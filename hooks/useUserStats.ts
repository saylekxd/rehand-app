import { useState, useEffect } from 'react';
import { UserStatsService, UserStats } from '@/services/userStats';

interface UseUserStatsResult {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserStats(userId: string | null): UseUserStatsResult {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userStats = await UserStatsService.getAllStats(userId);
      setStats(userStats);
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const refetch = async () => {
    await fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refetch
  };
} 