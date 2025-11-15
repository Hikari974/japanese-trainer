import { useState, useEffect, useCallback } from 'react';
import {
  loadStatistics,
  recordAttempt,
  resetStatistics,
  calculateLevelProgress,
  isLevelUnlocked,
  unlockLevel,
  getUnlockedLevels,
  registerUnlockCallback,
  type UserStatistics,
} from '../services/statistics';
import type { AttemptData, LevelProgress, LevelUnlockEvent } from '../types/statistics';
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

  /**
   * Check if a JLPT level is unlocked
   */
  const checkLevelUnlocked = useCallback(
    async (level: JLPTLevel): Promise<boolean> => {
      return await isLevelUnlocked(level);
    },
    []
  );

  /**
   * Unlock a JLPT level
   * Returns true if newly unlocked, false if already unlocked
   */
  const unlockLevelHook = useCallback(
    async (level: JLPTLevel): Promise<boolean> => {
      const wasUnlocked = await unlockLevel(level);

      // Reload statistics to refresh UI if level was newly unlocked
      if (wasUnlocked) {
        const updatedStats = await loadStatistics();
        setStatistics(updatedStats);
      }

      return wasUnlocked;
    },
    []
  );

  /**
   * Get all unlocked JLPT levels
   */
  const getUnlockedLevelsHook = useCallback(
    async (): Promise<JLPTLevel[]> => {
      return await getUnlockedLevels();
    },
    []
  );

  /**
   * Register a callback to be notified when a level is automatically unlocked
   * The callback will receive a LevelUnlockEvent with unlock details
   * Returns an unregister function to clean up the callback
   *
   * @example
   * useEffect(() => {
   *   const unregister = registerUnlockCallbackHook((event) => {
   *     console.log(`Level ${event.level} unlocked!`);
   *   });
   *   return unregister; // Cleanup on unmount
   * }, []);
   */
  const registerUnlockCallbackHook = useCallback(
    (callback: (event: LevelUnlockEvent) => void): (() => void) => {
      return registerUnlockCallback(callback);
    },
    []
  );

  return {
    statistics,
    isLoading,
    recordAttempt: recordAttemptHook,
    resetStats: resetStatsHook,
    calculateProgress,
    checkLevelUnlocked,
    unlockLevel: unlockLevelHook,
    getUnlockedLevels: getUnlockedLevelsHook,
    registerUnlockCallback: registerUnlockCallbackHook,
  };
}
