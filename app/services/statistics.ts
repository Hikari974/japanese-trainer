import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserStatistics,
  WordStatistic,
  GlobalStatistics,
  AttemptData,
} from '../types/statistics';

const STORAGE_KEY = '@japanese_trainer:user_statistics';

/**
 * Default empty statistics for first use
 */
const DEFAULT_STATISTICS: UserStatistics = {
  words: {},
  globalStats: {
    totalPoints: 0,
    totalAttempts: 0,
    totalWords: 0,
    perfectCount: 0,
    lastSessionDate: new Date().toISOString(),
  },
};

/**
 * Generate composite key for word statistics
 * Format: "${wordId}-${level}-${difficulty}"
 * Example: "42-N5-Normal"
 */
export function getWordStatKey(wordId: number, level: string, difficulty: string): string {
  return `${wordId}-${level}-${difficulty}`;
}

/**
 * Calculate points earned for an attempt
 * Returns 1 if: correct + single start + translation not viewed
 * Returns 0 otherwise
 */
export function calculatePoints(
  isCorrect: boolean,
  startCount: number,
  translationViewed: boolean
): number {
  if (isCorrect && startCount === 1 && !translationViewed) {
    return 1;
  }
  return 0;
}

/**
 * Load user statistics from local storage
 * Returns default empty statistics on first use or if data is corrupted
 */
export async function loadStatistics(): Promise<UserStatistics> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      // First use - return default empty stats
      return DEFAULT_STATISTICS;
    }

    const parsed = JSON.parse(stored);

    // Validate structure and provide fallbacks
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        words: parsed.words ?? {},
        globalStats: {
          totalPoints: parsed.globalStats?.totalPoints ?? 0,
          totalAttempts: parsed.globalStats?.totalAttempts ?? 0,
          totalWords: parsed.globalStats?.totalWords ?? 0,
          perfectCount: parsed.globalStats?.perfectCount ?? 0,
          lastSessionDate: parsed.globalStats?.lastSessionDate ?? new Date().toISOString(),
        },
      };
    }

    return DEFAULT_STATISTICS;
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to load statistics:', error);
    }
    return DEFAULT_STATISTICS;
  }
}

/**
 * Save user statistics to local storage
 */
export async function saveStatistics(stats: UserStatistics): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to save statistics:', error);
    }
  }
}

/**
 * Record a validation attempt and update statistics
 * Returns the number of points earned (0 or 1)
 */
export async function recordAttempt(attemptData: AttemptData): Promise<number> {
  try {
    const stats = await loadStatistics();
    const key = getWordStatKey(attemptData.wordId, attemptData.level, attemptData.difficulty);
    const now = new Date().toISOString();

    // Calculate points earned
    const pointsEarned = calculatePoints(
      attemptData.isCorrect,
      attemptData.startCount,
      attemptData.translationViewed
    );

    // Get or create word statistic
    const wordStat: WordStatistic = stats.words[key] || {
      wordId: attemptData.wordId,
      romaji: attemptData.romaji,
      level: attemptData.level,
      difficulty: attemptData.difficulty,
      totalAttempts: 0,
      successCount: 0,
      failureCount: 0,
      perfectAttempts: 0,
      points: 0,
      lastAttemptDate: now,
    };

    // Update word statistics
    wordStat.totalAttempts += 1;
    if (attemptData.isCorrect) {
      wordStat.successCount += 1;
    } else {
      wordStat.failureCount += 1;
    }
    if (pointsEarned === 1) {
      wordStat.perfectAttempts += 1;
      wordStat.points += 1;
    }
    wordStat.lastAttemptDate = now;

    // Update words record
    const isNewWord = !stats.words[key];
    stats.words[key] = wordStat;

    // Update global statistics
    stats.globalStats.totalAttempts += 1;
    stats.globalStats.totalPoints += pointsEarned;
    if (pointsEarned === 1) {
      stats.globalStats.perfectCount += 1;
    }
    if (isNewWord) {
      stats.globalStats.totalWords += 1;
    }
    stats.globalStats.lastSessionDate = now;

    // Save updated statistics
    await saveStatistics(stats);

    return pointsEarned;
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to record attempt:', error);
    }
    return 0;  // Return 0 points on error
  }
}

/**
 * Get global statistics
 */
export async function getGlobalStats(): Promise<GlobalStatistics> {
  const stats = await loadStatistics();
  return stats.globalStats;
}

/**
 * Reset all statistics to default empty state
 */
export async function resetStatistics(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATISTICS));
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to reset statistics:', error);
    }
  }
}
