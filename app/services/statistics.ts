import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserStatistics,
  WordStatistic,
  GlobalStatistics,
  AttemptData,
  LevelProgress,
  LevelUnlockEvent,
} from '../types/statistics';
import { JLPT_LEVEL_ORDER } from '../types/statistics';
import type { JLPTLevel, DataLevel, DisplayMode } from '../types/word';
import { getWordsByLevel } from './wordLoader';
import type { WordProgress, LevelStatsSummary } from '../types/progress';

const STORAGE_KEY = '@japanese_trainer:user_statistics';

// Cache for unlock status checks (performance optimization)
let unlockedLevelsCache: JLPTLevel[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5000; // 5 seconds

// Event system for level unlock notifications
type UnlockCallback = (event: LevelUnlockEvent) => void;
let unlockCallbacks: UnlockCallback[] = [];

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
  unlockedLevels: ['Kana'],  // Kana unlocked by default for new users
  levelUnlockDates: {
    Kana: new Date().toISOString(),
  },
};

/**
 * Invalidate the unlock status cache
 * Called internally after unlockLevel() to ensure fresh data
 */
function invalidateUnlockedLevelsCache(): void {
  unlockedLevelsCache = null;
  cacheTimestamp = 0;
}

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
 * Migrate old statistics to add unlock fields if missing
 * Preserves all existing data (words, globalStats)
 */
function migrateUnlockFields(oldStats: any): UserStatistics {
  const migrated = { ...oldStats };

  // Add unlock fields if missing
  if (!migrated.unlockedLevels) {
    migrated.unlockedLevels = ['Kana'];
  }

  if (!migrated.levelUnlockDates) {
    migrated.levelUnlockDates = {
      Kana: oldStats.globalStats?.lastSessionDate || new Date().toISOString(),
    };
  }

  return migrated as UserStatistics;
}

/**
 * Load user statistics from local storage
 * Returns default empty statistics on first use or if data is corrupted
 * Automatically migrates old statistics to add unlock fields
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
      const stats: UserStatistics = {
        words: parsed.words ?? {},
        globalStats: {
          totalPoints: parsed.globalStats?.totalPoints ?? 0,
          totalAttempts: parsed.globalStats?.totalAttempts ?? 0,
          totalWords: parsed.globalStats?.totalWords ?? 0,
          perfectCount: parsed.globalStats?.perfectCount ?? 0,
          lastSessionDate: parsed.globalStats?.lastSessionDate ?? new Date().toISOString(),
        },
        unlockedLevels: parsed.unlockedLevels ?? ['Kana'],
        levelUnlockDates: parsed.levelUnlockDates ?? { Kana: new Date().toISOString() },
      };

      // Migrate if unlock fields were missing
      if (!parsed.unlockedLevels || !parsed.levelUnlockDates) {
        const migrated = migrateUnlockFields(parsed);
        await saveStatistics(migrated);  // Persist migration immediately
        return migrated;
      }

      return stats;
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

    // Check and unlock next level if criteria met (fire-and-forget, non-blocking)
    checkAndUnlockNextLevel()
      .then(event => {
        if (event && __DEV__) {
          console.log(`Level ${event.level} unlocked after mastering ${event.previousLevel}`);
        }
      })
      .catch(error => {
        if (__DEV__) {
          console.error('Auto-unlock check failed:', error);
        }
      });

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

/**
 * Check if a JLPT level is unlocked
 * Called frequently by UI components, performance-critical
 * Uses in-memory cache with 5-second TTL to minimize AsyncStorage reads
 *
 * @param level - The JLPT level to check
 * @returns true if level is unlocked, false otherwise
 */
export async function isLevelUnlocked(level: JLPTLevel): Promise<boolean> {
  try {
    const now = Date.now();

    // Use cache if valid (within TTL)
    if (unlockedLevelsCache !== null && (now - cacheTimestamp) < CACHE_TTL_MS) {
      return unlockedLevelsCache.includes(level);
    }

    // Cache miss or expired - reload from storage
    const stats = await loadStatistics();

    // Update cache
    unlockedLevelsCache = [...stats.unlockedLevels]; // Clone for safety
    cacheTimestamp = now;

    return stats.unlockedLevels.includes(level);
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to check level unlock status:', error);
    }
    return false;
  }
}

/**
 * Unlock a JLPT level
 * Adds level to unlocked list and records unlock timestamp
 * Idempotent - safe to call multiple times for same level
 *
 * @param level - The JLPT level to unlock
 * @returns true if level was newly unlocked, false if already unlocked
 */
export async function unlockLevel(level: JLPTLevel): Promise<boolean> {
  try {
    const stats = await loadStatistics();

    // Check if already unlocked
    if (stats.unlockedLevels.includes(level)) {
      return false;  // Already unlocked
    }

    // Unlock the level
    stats.unlockedLevels.push(level);
    stats.levelUnlockDates[level] = new Date().toISOString();

    // Persist changes
    await saveStatistics(stats);

    // Invalidate cache to reflect new unlock
    invalidateUnlockedLevelsCache();

    return true;  // Newly unlocked
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to unlock level:', error);
    }
    return false;
  }
}

/**
 * Get all unlocked JLPT levels
 * Returns a copy to prevent external mutation
 *
 * @returns Array of unlocked levels (chronological order)
 */
export async function getUnlockedLevels(): Promise<JLPTLevel[]> {
  try {
    const stats = await loadStatistics();
    return [...stats.unlockedLevels];  // Return clone for immutability
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to get unlocked levels:', error);
    }
    return ['Kana'];  // Return default on error
  }
}

/**
 * Get the previous level in the sequential unlock order
 * Pure function - no side effects, deterministic
 *
 * @param level - The current level
 * @returns Previous level in sequence, or null if level is first (Kana)
 *
 * @example
 * getPreviousLevel('N5') // Returns 'Kana'
 * getPreviousLevel('Kana') // Returns null
 */
export function getPreviousLevel(level: JLPTLevel): JLPTLevel | null {
  const currentIndex = JLPT_LEVEL_ORDER.indexOf(level);
  if (currentIndex <= 0) {
    return null;  // Kana is first, no previous level
  }
  return JLPT_LEVEL_ORDER[currentIndex - 1];
}

/**
 * Determine the next level to unlock based on currently unlocked levels
 * Pure function - no side effects, deterministic
 *
 * @param unlockedLevels - Array of currently unlocked levels
 * @returns Next level to unlock, or null if all levels are unlocked
 *
 * @example
 * getNextLevelToUnlock(['Kana']) // Returns 'N5'
 * getNextLevelToUnlock(['Kana', 'N5']) // Returns 'N4'
 * getNextLevelToUnlock(['Kana', 'N5', 'N4', 'N3', 'N2', 'N1']) // Returns null
 */
export function getNextLevelToUnlock(unlockedLevels: JLPTLevel[]): JLPTLevel | null {
  // Find first level in sequence that is not unlocked
  for (const level of JLPT_LEVEL_ORDER) {
    if (!unlockedLevels.includes(level)) {
      return level;
    }
  }
  return null;  // All levels unlocked
}

/**
 * Register a callback to be notified when a level is automatically unlocked
 * Callback will be invoked with LevelUnlockEvent after successful unlock
 *
 * @param callback - Function to call when unlock occurs
 * @returns Unregister function to remove the callback
 *
 * @example
 * const unregister = registerUnlockCallback((event) => {
 *   console.log(`Level ${event.level} unlocked!`);
 * });
 * // Later: unregister();
 */
export function registerUnlockCallback(callback: UnlockCallback): () => void {
  unlockCallbacks.push(callback);

  // Return unregister function
  return () => {
    unlockCallbacks = unlockCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Emit level unlock event to all registered callbacks
 * Internal helper - called after successful unlock
 *
 * @param event - Level unlock event to emit
 */
function emitLevelUnlocked(event: LevelUnlockEvent): void {
  unlockCallbacks.forEach(callback => {
    try {
      callback(event);
    } catch (error) {
      if (__DEV__) {
        console.error('Error in unlock callback:', error);
      }
    }
  });
}

/**
 * Check if the next level should be unlocked and unlock it if criteria are met
 * Criteria: Previous level must be 100% mastered (all words >= 5 points)
 *
 * This function is called automatically after each recordAttempt() in a fire-and-forget manner.
 * It will not block the UI or affect the return value of recordAttempt().
 *
 * @returns LevelUnlockEvent if a level was unlocked, null otherwise
 *
 * @example
 * // After user completes a word in Kana level:
 * await recordAttempt({ ... }); // Returns points immediately
 * // checkAndUnlockNextLevel() runs in background
 * // If Kana reaches 100%, N5 is unlocked and event is emitted
 */
export async function checkAndUnlockNextLevel(): Promise<LevelUnlockEvent | null> {
  try {
    // Get current unlock state
    const unlockedLevels = await getUnlockedLevels();

    // Find next level to potentially unlock
    const nextLevel = getNextLevelToUnlock(unlockedLevels);
    if (nextLevel === null) {
      return null;  // All levels already unlocked
    }

    // Get previous level (the one that must be 100% mastered)
    const previousLevel = getPreviousLevel(nextLevel);
    if (previousLevel === null) {
      // Should never happen (Kana is unlocked by default)
      return null;
    }

    // Check if previous level is 100% mastered
    const progress = await calculateLevelProgress(previousLevel);
    const isMastered = progress.masteredWords === progress.totalWords && progress.totalWords > 0;

    if (!isMastered) {
      return null;  // Criteria not met, don't unlock
    }

    // Unlock the next level
    const wasUnlocked = await unlockLevel(nextLevel);
    if (!wasUnlocked) {
      return null;  // Level was already unlocked (race condition?)
    }

    // Get progress of the newly unlocked level (will be 0% at unlock time)
    const newLevelProgress = await calculateLevelProgress(nextLevel);

    // Create unlock event
    const event: LevelUnlockEvent = {
      level: nextLevel,
      timestamp: new Date().toISOString(),
      previousLevel,
      progress: newLevelProgress,
    };

    // Emit event to registered callbacks
    emitLevelUnlocked(event);

    return event;
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to check and unlock next level:', error);
    }
    return null;
  }
}

/**
 * Get aggregated progress data for all words in a specific JLPT level
 * Combines statistics across all 4 difficulties (Facile, Normal, Difficile, Extrême)
 * 
 * @param level - JLPT level to get progress for
 * @returns Array of WordProgress objects, one per word in the level
 * 
 * @example
 * const progress = await getWordProgressForLevel('N5');
 * // Returns array with totalPoints, isMastered, successRate for each word
 */
export async function getWordProgressForLevel(level: JLPTLevel): Promise<WordProgress[]> {
  try {
    // Kana uses N5 word list (same vocabulary)
    const dataLevel: DataLevel = level === 'Kana' ? 'N5' : (level as DataLevel);

    // Load all words for this level
    const wordList = getWordsByLevel(dataLevel);
    const allWords = wordList.words;

    // Load user statistics
    const stats = await loadStatistics();

    // Create a map to aggregate stats by wordId
    const wordProgressMap = new Map<number, WordProgress>();

    // Initialize all words with zero stats
    for (const word of allWords) {
      wordProgressMap.set(word.id, {
        wordId: word.id,
        kanji: word.kanji,
        kana: word.kana,
        romaji: word.romaji,
        totalPoints: 0,
        totalAttempts: 0,
        successCount: 0,
        perfectAttempts: 0,
        isMastered: false,
        successRate: 0,
        lastAttemptDate: undefined,
      });
    }
    
    // Aggregate stats across all 4 difficulties
    const difficulties = ['Facile', 'Normal', 'Difficile', 'Extrême'] as const;
    
    for (const word of allWords) {
      const wordProgress = wordProgressMap.get(word.id)!;
      
      for (const difficulty of difficulties) {
        const key = `${word.id}-${level}-${difficulty}`;
        const wordStat = stats.words[key];
        
        if (wordStat) {
          // Aggregate stats
          wordProgress.totalPoints += wordStat.points;
          wordProgress.totalAttempts += wordStat.totalAttempts;
          wordProgress.successCount += wordStat.successCount;
          wordProgress.perfectAttempts += wordStat.perfectAttempts;
          
          // Track most recent attempt
          if (!wordProgress.lastAttemptDate || wordStat.lastAttemptDate > wordProgress.lastAttemptDate) {
            wordProgress.lastAttemptDate = wordStat.lastAttemptDate;
          }
        }
      }
      
      // Calculate derived fields
      wordProgress.isMastered = wordProgress.totalPoints >= 5;
      wordProgress.successRate = wordProgress.totalAttempts > 0
        ? Math.round((wordProgress.successCount / wordProgress.totalAttempts) * 100)
        : 0;
    }
    
    // Return as array
    return Array.from(wordProgressMap.values());
  } catch (error) {
    if (__DEV__) {
      console.error(`Failed to get word progress for level ${level}:`, error);
    }
    return [];
  }
}

/**
 * Get summary statistics for a specific JLPT level
 * Returns counts of mastered/in-progress/not-started words
 * 
 * @param level - JLPT level to get summary for
 * @returns LevelStatsSummary with counts and percentages
 * 
 * @example
 * const summary = await getLevelStatsSummary('N5');
 * // Returns { totalWords: 120, masteredWords: 45, inProgressWords: 30, ... }
 */
export async function getLevelStatsSummary(level: JLPTLevel): Promise<LevelStatsSummary> {
  try {
    // Get progress for all words
    const wordProgress = await getWordProgressForLevel(level);
    
    // Count words in each category
    const totalWords = wordProgress.length;
    const masteredWords = wordProgress.filter(w => w.isMastered).length;
    const inProgressWords = wordProgress.filter(w => w.totalPoints > 0 && w.totalPoints < 5).length;
    const notStartedWords = wordProgress.filter(w => w.totalAttempts === 0).length;
    
    // Calculate mastery percentage
    const masteryPercentage = totalWords > 0
      ? Math.round((masteredWords / totalWords) * 100 * 100) / 100  // Round to 2 decimals
      : 0;
    
    return {
      level,
      totalWords,
      masteredWords,
      inProgressWords,
      notStartedWords,
      masteryPercentage,
    };
  } catch (error) {
    if (__DEV__) {
      console.error(`Failed to get level stats summary for ${level}:`, error);
    }
    
    // Return empty summary on error
    return {
      level,
      totalWords: 0,
      masteredWords: 0,
      inProgressWords: 0,
      notStartedWords: 0,
      masteryPercentage: 0,
    };
  }
}
