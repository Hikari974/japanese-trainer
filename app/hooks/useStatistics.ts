import { useState, useEffect } from 'react';
import {
  loadStatistics,
  recordAttempt,
  resetStatistics,
  type UserStatistics,
} from '../services/statistics';
import type { AttemptData } from '../types/statistics';

/**
 * React hook for managing user statistics
 * Automatically loads statistics on mount and provides update functions
 */
export function useStatistics() {
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load statistics on mount
  useEffect(() => {
    loadStatistics()
      .then(setStatistics)
      .finally(() => setIsLoading(false));
  }, []);

  /**
   * Record a validation attempt
   * Updates local state and returns points earned
   */
  const recordAttemptHook = async (attemptData: AttemptData): Promise<number> => {
    const pointsEarned = await recordAttempt(attemptData);

    // Reload statistics to refresh UI
    const updatedStats = await loadStatistics();
    setStatistics(updatedStats);

    return pointsEarned;
  };

  /**
   * Reset all statistics
   * Updates local state to empty default
   */
  const resetStatsHook = async (): Promise<void> => {
    await resetStatistics();

    // Reload statistics to refresh UI
    const updatedStats = await loadStatistics();
    setStatistics(updatedStats);
  };

  return {
    statistics,
    isLoading,
    recordAttempt: recordAttemptHook,
    resetStats: resetStatsHook,
  };
}
