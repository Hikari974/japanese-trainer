import { useState, useEffect, useCallback } from 'react';
import {
  loadStatistics,
  recordAttempt,
  resetStatistics,
  calculateLevelProgress,
  type UserStatistics,
} from '../services/statistics';
import type { AttemptData, LevelProgress } from '../types/statistics';
import type { JLPTLevel } from '../types/word';

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

  /**
   * Calculate progression for a specific JLPT level
   * Returns statistics on mastered words (>= 5 points total)
   */
  const calculateProgress = useCallback(
    async (level: JLPTLevel): Promise<LevelProgress> => {
      return await calculateLevelProgress(level);
    },
    []
  );

  return {
    statistics,
    isLoading,
    recordAttempt: recordAttemptHook,
    resetStats: resetStatsHook,
    calculateProgress,
  };
}
