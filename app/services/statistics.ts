import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserStatistics,
  WordStatistic,
  GlobalStatistics,
  AttemptData,
  LevelProgress,
} from '../types/statistics';
import type { JLPTLevel, DataLevel, DisplayMode } from '../types/word';
import { getWordsByLevel } from './wordLoader';

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

/**
 * Get all available word IDs for a specific level
 * Mirrors the word selection logic from wordSelection.ts
 *
 * Rules (cumulative pattern):
 * - Kana: N5 romaji
 * - N5: N5 kanji + N4 romaji
 * - N4: N5 kanji + N4 kanji + N3 romaji
 * - N3: N5 kanji + N4 kanji + N3 kanji + N2 romaji
 * - N2: N5 kanji + N4 kanji + N3 kanji + N2 kanji + N1 romaji
 * - N1: N5 kanji + N4 kanji + N3 kanji + N2 kanji + N1 kanji
 */
function getAvailableWordIdsForLevel(level: JLPTLevel): number[] {
  const wordIds = new Set<number>();

  switch (level) {
    case 'Kana':
      // Kana: N5 romaji only
      getWordsByLevel('N5').words.forEach(w => wordIds.add(w.id));
      break;

    case 'N5':
      // N5 kanji + N4 romaji
      getWordsByLevel('N5').words.forEach(w => wordIds.add(w.id));
      getWordsByLevel('N4').words.forEach(w => wordIds.add(w.id));
      break;

    case 'N4':
      // N5 kanji + N4 kanji + N3 romaji
      getWordsByLevel('N5').words.forEach(w => wordIds.add(w.id));
      getWordsByLevel('N4').words.forEach(w => wordIds.add(w.id));
      getWordsByLevel('N3').words.forEach(w => wordIds.add(w.id));
      break;

    case 'N3':
      // N5 kanji + N4 kanji + N3 kanji + N2 romaji
      getWordsByLevel('N5').words.forEach(w => wordIds.add(w.id));
      getWordsByLevel('N4').words.forEach(w => wordIds.add(w.id));
      getWordsByLevel('N3').words.forEach(w => wordIds.add(w.id));
      getWordsByLevel('N2').words.forEach(w => wordIds.add(w.id));
      break;

    case 'N2':
      // N5 kanji + N4 kanji + N3 kanji + N2 kanji + N1 romaji
      getWordsByLevel('N5').words.forEach(w => wordIds.add(w.id));
      getWordsByLevel('N4').words.forEach(w => wordIds.add(w.id));
      getWordsByLevel('N3').words.forEach(w => wordIds.add(w.id));
      getWordsByLevel('N2').words.forEach(w => wordIds.add(w.id));
      getWordsByLevel('N1').words.forEach(w => wordIds.add(w.id));
      break;

    case 'N1':
      // N5 kanji + N4 kanji + N3 kanji + N2 kanji + N1 kanji
      getWordsByLevel('N5').words.forEach(w => wordIds.add(w.id));
      getWordsByLevel('N4').words.forEach(w => wordIds.add(w.id));
      getWordsByLevel('N3').words.forEach(w => wordIds.add(w.id));
      getWordsByLevel('N2').words.forEach(w => wordIds.add(w.id));
      getWordsByLevel('N1').words.forEach(w => wordIds.add(w.id));
      break;
  }

  return Array.from(wordIds);
}

/**
 * Calculate total points for a word across all difficulties in a level
 * Sums points from Facile, Normal, Difficile, Extrême
 */
function getTotalPointsForWord(
  wordId: number,
  level: JLPTLevel,
  stats: UserStatistics
): number {
  const difficulties = ['Facile', 'Normal', 'Difficile', 'Extrême'] as const;
  let totalPoints = 0;

  for (const difficulty of difficulties) {
    const key = getWordStatKey(wordId, level, difficulty);
    const wordStat = stats.words[key];
    if (wordStat) {
      totalPoints += wordStat.points;
    }
  }

  return totalPoints;
}

/**
 * Calculate progression for a specific JLPT level
 *
 * Returns statistics on how many words are mastered in this level.
 * A word is considered "mastered" if the sum of points across all difficulties >= 5.
 *
 * @param level - The JLPT level to calculate progression for
 * @returns LevelProgress object with totalWords, masteredWords, and percentage
 */
export async function calculateLevelProgress(level: JLPTLevel): Promise<LevelProgress> {
  try {
    // Load current statistics
    const stats = await loadStatistics();

    // Get all word IDs available in this level
    const availableWordIds = getAvailableWordIdsForLevel(level);
    const totalWords = availableWordIds.length;

    // Count how many words have >= 5 points total
    let masteredWords = 0;
    for (const wordId of availableWordIds) {
      const totalPoints = getTotalPointsForWord(wordId, level, stats);
      if (totalPoints >= 5) {
        masteredWords++;
      }
    }

    // Calculate percentage (rounded to 2 decimals)
    const percentage = totalWords > 0
      ? Math.round((masteredWords / totalWords) * 10000) / 100
      : 0;

    return {
      level,
      totalWords,
      masteredWords,
      percentage,
    };
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to calculate level progress:', error);
    }
    // Return empty progress on error
    return {
      level,
      totalWords: 0,
      masteredWords: 0,
      percentage: 0,
    };
  }
}
