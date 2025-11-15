/**
 * Tests for Sequential Unlock Logic - US-006.3
 * Tests auto-unlock system, event callbacks, and integration with recordAttempt
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getPreviousLevel,
  getNextLevelToUnlock,
  registerUnlockCallback,
  checkAndUnlockNextLevel,
  recordAttempt,
  unlockLevel,
  getUnlockedLevels,
  calculateLevelProgress,
} from '../statistics';
import type { UserStatistics, LevelUnlockEvent } from '../../types/statistics';
import type { JLPTLevel } from '../../types/word';
import { JLPT_LEVEL_ORDER } from '../../types/statistics';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock wordLoader (required for calculateLevelProgress)
jest.mock('../wordLoader', () => ({
  getWordsByLevel: jest.fn((level: string) => {
    // Mock word counts matching actual data structure
    const mockWords: Record<string, any[]> = {
      N5: Array.from({ length: 100 }, (_, i) => ({ id: i + 1, romaji: `word${i + 1}` })),
      N4: Array.from({ length: 80 }, (_, i) => ({ id: i + 101, romaji: `word${i + 101}` })),
      N3: Array.from({ length: 60 }, (_, i) => ({ id: i + 181, romaji: `word${i + 181}` })),
      N2: Array.from({ length: 40 }, (_, i) => ({ id: i + 241, romaji: `word${i + 241}` })),
      N1: Array.from({ length: 20 }, (_, i) => ({ id: i + 281, romaji: `word${i + 281}` })),
    };
    return { words: mockWords[level] || [] };
  }),
}));

// Mock __DEV__ global
global.__DEV__ = true;

const STORAGE_KEY = '@japanese_trainer:user_statistics';

describe('Sequential Unlock Logic - US-006.3', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // GROUP 1: PURE FUNCTIONS - getPreviousLevel()
  // ===================================================================

  describe('Pure Functions - getPreviousLevel()', () => {
    test('T01 - getPreviousLevel("N5") returns "Kana"', () => {
      const result = getPreviousLevel('N5');
      expect(result).toBe('Kana');
    });

    test('T02 - getPreviousLevel("Kana") returns null', () => {
      const result = getPreviousLevel('Kana');
      expect(result).toBeNull();
    });

    test('T03 - getPreviousLevel("N1") returns "N2"', () => {
      const result = getPreviousLevel('N1');
      expect(result).toBe('N2');
    });

    test('T04 - Verify sequential order for all levels', () => {
      expect(getPreviousLevel('Kana')).toBe(null);
      expect(getPreviousLevel('N5')).toBe('Kana');
      expect(getPreviousLevel('N4')).toBe('N5');
      expect(getPreviousLevel('N3')).toBe('N4');
      expect(getPreviousLevel('N2')).toBe('N3');
      expect(getPreviousLevel('N1')).toBe('N2');
    });
  });

  // ===================================================================
  // GROUP 2: PURE FUNCTIONS - getNextLevelToUnlock()
  // ===================================================================

  describe('Pure Functions - getNextLevelToUnlock()', () => {
    test('T05 - getNextLevelToUnlock(["Kana"]) returns "N5"', () => {
      const result = getNextLevelToUnlock(['Kana']);
      expect(result).toBe('N5');
    });

    test('T06 - getNextLevelToUnlock(["Kana", "N5", "N4"]) returns "N3"', () => {
      const result = getNextLevelToUnlock(['Kana', 'N5', 'N4']);
      expect(result).toBe('N3');
    });

    test('T07 - getNextLevelToUnlock(all levels) returns null', () => {
      const allLevels: JLPTLevel[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];
      const result = getNextLevelToUnlock(allLevels);
      expect(result).toBeNull();
    });

    test('T08 - Verify sequential detection for all levels', () => {
      expect(getNextLevelToUnlock(['Kana'])).toBe('N5');
      expect(getNextLevelToUnlock(['Kana', 'N5'])).toBe('N4');
      expect(getNextLevelToUnlock(['Kana', 'N5', 'N4'])).toBe('N3');
      expect(getNextLevelToUnlock(['Kana', 'N5', 'N4', 'N3'])).toBe('N2');
      expect(getNextLevelToUnlock(['Kana', 'N5', 'N4', 'N3', 'N2'])).toBe('N1');
      expect(getNextLevelToUnlock(['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'])).toBeNull();
    });
  });

  // ===================================================================
  // GROUP 3: EVENT SYSTEM - registerUnlockCallback()
  // ===================================================================

  describe('Event System - registerUnlockCallback()', () => {
    test('T09 - registerUnlockCallback registers callback successfully', () => {
      const callback = jest.fn();

      const unregister = registerUnlockCallback(callback);

      expect(typeof unregister).toBe('function');
    });

    test('T10 - Callback is invoked when unlock occurs', async () => {
      // Arrange: Kana 100% mastered, N5 not unlocked
      const stats = createStatsWithMasteredLevel('Kana', ['Kana']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const callback = jest.fn();
      registerUnlockCallback(callback);

      // Act
      const event = await checkAndUnlockNextLevel();

      // Assert
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(event);
      expect(event).not.toBeNull();
      expect(event?.level).toBe('N5');
    });

    test('T11 - Multiple callbacks can be registered', async () => {
      // Arrange: Kana 100% mastered
      const stats = createStatsWithMasteredLevel('Kana', ['Kana']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      registerUnlockCallback(callback1);
      registerUnlockCallback(callback2);
      registerUnlockCallback(callback3);

      // Act
      await checkAndUnlockNextLevel();

      // Assert
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);
    });

    test('T12 - Unregister function removes callback', async () => {
      // Arrange
      const stats = createStatsWithMasteredLevel('Kana', ['Kana']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const callback = jest.fn();
      const unregister = registerUnlockCallback(callback);

      // Act: Unregister before unlock
      unregister();
      await checkAndUnlockNextLevel();

      // Assert: Callback not invoked
      expect(callback).not.toHaveBeenCalled();
    });

    test('T13 - Callback errors don\'t crash system (try-catch)', async () => {
      // Arrange
      const stats = createStatsWithMasteredLevel('Kana', ['Kana']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const normalCallback = jest.fn();

      registerUnlockCallback(errorCallback);
      registerUnlockCallback(normalCallback);

      // Act
      const event = await checkAndUnlockNextLevel();

      // Assert: System continues despite error
      expect(event).not.toBeNull();
      expect(event?.level).toBe('N5');
      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(normalCallback).toHaveBeenCalledTimes(1); // Still invoked
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in unlock callback:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  // ===================================================================
  // GROUP 4: ORCHESTRATION - checkAndUnlockNextLevel()
  // ===================================================================

  describe('checkAndUnlockNextLevel() - Core Logic', () => {
    test('T14 - Returns null if all levels unlocked', async () => {
      // Arrange: All levels unlocked
      const stats: UserStatistics = {
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: '2025-11-15T00:00:00.000Z',
        },
        unlockedLevels: ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'],
        levelUnlockDates: {
          Kana: '2025-11-15T00:00:00.000Z',
          N5: '2025-11-15T00:01:00.000Z',
          N4: '2025-11-15T00:02:00.000Z',
          N3: '2025-11-15T00:03:00.000Z',
          N2: '2025-11-15T00:04:00.000Z',
          N1: '2025-11-15T00:05:00.000Z',
        },
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stats));

      // Act
      const event = await checkAndUnlockNextLevel();

      // Assert
      expect(event).toBeNull();
      expect(AsyncStorage.setItem as jest.Mock).not.toHaveBeenCalled();
    });

    test('T15 - Returns null if previous level not 100% mastered', async () => {
      // Arrange: Kana only 50% mastered
      const stats = createStatsWithPartialMastery('Kana', 50, ['Kana']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stats));

      // Act
      const event = await checkAndUnlockNextLevel();

      // Assert
      expect(event).toBeNull();
      expect(AsyncStorage.setItem as jest.Mock).not.toHaveBeenCalled();
    });

    test('T16 - Unlocks N5 when Kana is 100% mastered', async () => {
      // Arrange: Kana 100% mastered, N5 not unlocked
      const stats = createStatsWithMasteredLevel('Kana', ['Kana']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const beforeUnlock = Date.now();

      // Act
      const event = await checkAndUnlockNextLevel();

      const afterUnlock = Date.now();

      // Assert
      expect(event).not.toBeNull();
      expect(event?.level).toBe('N5');
      expect(event?.previousLevel).toBe('Kana');
      expect(event?.progress.level).toBe('N5');
      expect(event?.progress.masteredWords).toBe(0); // 0% at unlock time

      const timestamp = new Date(event!.timestamp).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(beforeUnlock);
      expect(timestamp).toBeLessThanOrEqual(afterUnlock);

      // Verify AsyncStorage was called to persist unlock
      expect(AsyncStorage.setItem as jest.Mock).toHaveBeenCalled();
      const saveCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedStats = JSON.parse(saveCall[1]);
      expect(savedStats.unlockedLevels).toContain('N5');
      expect(savedStats.levelUnlockDates).toHaveProperty('N5');
    });

    test('T17 - Unlocks N4 when N5 is 100% mastered (sequential)', async () => {
      // Arrange: Kana and N5 both 100% mastered, N4 not unlocked
      const stats = createStatsWithMasteredLevel('N5', ['Kana', 'N5']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Act
      const event = await checkAndUnlockNextLevel();

      // Assert
      expect(event).not.toBeNull();
      expect(event?.level).toBe('N4');
      expect(event?.previousLevel).toBe('N5');
    });

    test('T18 - Returns null if next level already unlocked (idempotent)', async () => {
      // Arrange: Kana 100% mastered, N5 already unlocked
      const stats = createStatsWithMasteredLevel('Kana', ['Kana', 'N5']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stats));

      // Act
      const event = await checkAndUnlockNextLevel();

      // Assert
      expect(event).toBeNull(); // No unlock occurred (idempotent)
      expect(AsyncStorage.setItem as jest.Mock).not.toHaveBeenCalled();
    });

    test('T19 - Event contains correct data structure', async () => {
      // Arrange
      const stats = createStatsWithMasteredLevel('Kana', ['Kana']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Act
      const event = await checkAndUnlockNextLevel();

      // Assert: Verify event structure
      expect(event).toMatchObject({
        level: 'N5',
        timestamp: expect.any(String),
        previousLevel: 'Kana',
        progress: {
          level: 'N5',
          totalWords: 180, // N5 + N4 words
          masteredWords: 0,
          percentage: 0,
        },
      });

      // Verify timestamp is valid ISO 8601
      expect(new Date(event!.timestamp).toISOString()).toBe(event!.timestamp);
    });

    test('T20 - Emits event to registered callbacks', async () => {
      // Arrange
      const stats = createStatsWithMasteredLevel('Kana', ['Kana']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const callback = jest.fn();
      registerUnlockCallback(callback);

      // Act
      const event = await checkAndUnlockNextLevel();

      // Assert
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(event);
    });

    test('T21 - Handles AsyncStorage errors gracefully', async () => {
      // Arrange: Simulate AsyncStorage error
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const event = await checkAndUnlockNextLevel();

      // Assert: Returns null on error (loadStatistics returns default stats)
      // When AsyncStorage fails, loadStatistics returns DEFAULT_STATISTICS with only Kana unlocked
      // Since Kana is not 100% mastered (0 words), checkAndUnlockNextLevel returns null
      expect(event).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to load statistics:',
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });
  });

  // ===================================================================
  // GROUP 5: INTEGRATION - recordAttempt() triggers auto-unlock
  // ===================================================================

  describe('Integration with recordAttempt()', () => {
    test('T22 - recordAttempt triggers auto-unlock when Kana reaches 100%', async () => {
      // Arrange: Kana at 99/100 mastered (one word away from unlock)
      const stats = createStatsWithPartialMastery('Kana', 99, ['Kana']);

      // Mock sequence: first load for recordAttempt, then for checkAndUnlockNextLevel
      let callCount = 0;
      (AsyncStorage.getItem as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(JSON.stringify(stats));
        } else {
          // After recordAttempt, Kana is 100% mastered
          const updatedStats = createStatsWithMasteredLevel('Kana', ['Kana']);
          return Promise.resolve(JSON.stringify(updatedStats));
        }
      });

      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const callback = jest.fn();
      registerUnlockCallback(callback);

      // Act: Complete the 100th word
      await recordAttempt({
        wordId: 100,
        romaji: 'word100',
        level: 'Kana',
        difficulty: 'Facile',
        isCorrect: true,
        startCount: 1,
        translationViewed: false,
      });

      // Wait for fire-and-forget unlock check
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert: Callback was invoked with N5 unlock event
      expect(callback).toHaveBeenCalled();
      const event = callback.mock.calls[0][0] as LevelUnlockEvent;
      expect(event.level).toBe('N5');
      expect(event.previousLevel).toBe('Kana');
    });

    test('T23 - Sequential unlocks (Kana→N5→N4) as levels are mastered', async () => {
      // Arrange: Track unlock events
      const unlockEvents: LevelUnlockEvent[] = [];
      registerUnlockCallback(event => unlockEvents.push(event));

      // Step 1: Kana 100% mastered → unlocks N5
      const statsKana = createStatsWithMasteredLevel('Kana', ['Kana']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(statsKana));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const event1 = await checkAndUnlockNextLevel();
      expect(event1?.level).toBe('N5');
      expect(unlockEvents).toHaveLength(1);

      // Step 2: N5 100% mastered → unlocks N4
      const statsN5 = createStatsWithMasteredLevel('N5', ['Kana', 'N5']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(statsN5));

      const event2 = await checkAndUnlockNextLevel();
      expect(event2?.level).toBe('N4');
      expect(unlockEvents).toHaveLength(2);

      // Verify sequence
      expect(unlockEvents[0].level).toBe('N5');
      expect(unlockEvents[0].previousLevel).toBe('Kana');
      expect(unlockEvents[1].level).toBe('N4');
      expect(unlockEvents[1].previousLevel).toBe('N5');
    });

    test('T24 - No unlock if previous level < 100%', async () => {
      // Arrange: Kana only 75% mastered
      const stats = createStatsWithPartialMastery('Kana', 75, ['Kana']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stats));

      const callback = jest.fn();
      registerUnlockCallback(callback);

      // Act
      const event = await checkAndUnlockNextLevel();

      // Assert: No unlock occurred
      expect(event).toBeNull();
      expect(callback).not.toHaveBeenCalled();
      expect(AsyncStorage.setItem as jest.Mock).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // GROUP 6: PERFORMANCE - Execution time benchmarks
  // ===================================================================

  describe('Performance', () => {
    test('T25 - checkAndUnlockNextLevel executes < 100ms', async () => {
      // Arrange: Kana 100% mastered
      const stats = createStatsWithMasteredLevel('Kana', ['Kana']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Act
      const startTime = Date.now();
      await checkAndUnlockNextLevel();
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(100);
    });

    test('T26 - recordAttempt with auto-unlock < 200ms', async () => {
      // Arrange: Kana at 99/100 mastered
      const stats = createStatsWithPartialMastery('Kana', 99, ['Kana']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Act
      const startTime = Date.now();
      await recordAttempt({
        wordId: 100,
        romaji: 'word100',
        level: 'Kana',
        difficulty: 'Facile',
        isCorrect: true,
        startCount: 1,
        translationViewed: false,
      });
      const duration = Date.now() - startTime;

      // Assert: recordAttempt returns quickly (fire-and-forget)
      expect(duration).toBeLessThan(200);
    });
  });
});

// ===================================================================
// TEST HELPERS
// ===================================================================

/**
 * Create UserStatistics with a level 100% mastered
 * All words in the level have >= 5 points
 */
function createStatsWithMasteredLevel(
  level: JLPTLevel,
  unlockedLevels: JLPTLevel[]
): UserStatistics {
  const words: Record<string, any> = {};

  // Determine word count for the level
  const wordCount = level === 'Kana' ? 100 : level === 'N5' ? 180 : level === 'N4' ? 240 : 280;

  // Create mastered words (5 points each)
  for (let i = 1; i <= wordCount; i++) {
    words[`${i}-${level}-Facile`] = {
      wordId: i,
      romaji: `word${i}`,
      level,
      difficulty: 'Facile',
      totalAttempts: 5,
      successCount: 5,
      failureCount: 0,
      perfectAttempts: 5,
      points: 5,
      lastAttemptDate: '2025-11-15T00:00:00.000Z',
    };
  }

  const levelUnlockDates: Partial<Record<JLPTLevel, string>> = {};
  unlockedLevels.forEach((lvl, index) => {
    levelUnlockDates[lvl] = `2025-11-15T00:0${index}:00.000Z`;
  });

  return {
    words,
    globalStats: {
      totalPoints: wordCount * 5,
      totalAttempts: wordCount * 5,
      totalWords: wordCount,
      perfectCount: wordCount * 5,
      lastSessionDate: '2025-11-15T00:00:00.000Z',
    },
    unlockedLevels,
    levelUnlockDates,
  };
}

/**
 * Create UserStatistics with partial mastery (X% of words mastered)
 */
function createStatsWithPartialMastery(
  level: JLPTLevel,
  masteredCount: number,
  unlockedLevels: JLPTLevel[]
): UserStatistics {
  const words: Record<string, any> = {};

  // Create mastered words
  for (let i = 1; i <= masteredCount; i++) {
    words[`${i}-${level}-Facile`] = {
      wordId: i,
      romaji: `word${i}`,
      level,
      difficulty: 'Facile',
      totalAttempts: 5,
      successCount: 5,
      failureCount: 0,
      perfectAttempts: 5,
      points: 5,
      lastAttemptDate: '2025-11-15T00:00:00.000Z',
    };
  }

  const levelUnlockDates: Partial<Record<JLPTLevel, string>> = {};
  unlockedLevels.forEach((lvl, index) => {
    levelUnlockDates[lvl] = `2025-11-15T00:0${index}:00.000Z`;
  });

  return {
    words,
    globalStats: {
      totalPoints: masteredCount * 5,
      totalAttempts: masteredCount * 5,
      totalWords: masteredCount,
      perfectCount: masteredCount * 5,
      lastSessionDate: '2025-11-15T00:00:00.000Z',
    },
    unlockedLevels,
    levelUnlockDates,
  };
}
