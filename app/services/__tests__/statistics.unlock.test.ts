import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadStatistics,
  unlockLevel,
  isLevelUnlocked,
  getUnlockedLevels,
  saveStatistics,
} from '../statistics';
import type { UserStatistics } from '../../types/statistics';
import type { JLPTLevel } from '../../types/word';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock wordLoader (required for calculateLevelProgress)
jest.mock('../wordLoader', () => ({
  getWordsByLevel: jest.fn(() => ({ words: [] })),
}));

const STORAGE_KEY = '@japanese_trainer:user_statistics';

describe('Statistics Unlock System - US-006.2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================================
  // GROUP 1: NEW USERS - Default unlock state
  // ===================================================================

  describe('New Users', () => {
    test('T01 - New user has Kana unlocked by default', async () => {
      // Arrange: Empty storage (first use)
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      // Act
      const stats = await loadStatistics();

      // Assert
      expect(stats.unlockedLevels).toEqual(['Kana']);
      expect(stats.levelUnlockDates).toHaveProperty('Kana');
      expect(stats.levelUnlockDates.Kana).toBeTruthy();
    });

    test('T02 - New user has no other levels unlocked', async () => {
      // Arrange: Empty storage
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      // Act
      const stats = await loadStatistics();
      const otherLevels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

      // Assert
      for (const level of otherLevels) {
        expect(stats.unlockedLevels).not.toContain(level);
        expect(stats.levelUnlockDates).not.toHaveProperty(level);
      }
    });

    test('T03 - isLevelUnlocked returns true for Kana, false for others (new user)', async () => {
      // Arrange: Empty storage
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      expect(await isLevelUnlocked('Kana')).toBe(true);
      expect(await isLevelUnlocked('N5')).toBe(false);
      expect(await isLevelUnlocked('N4')).toBe(false);
      expect(await isLevelUnlocked('N3')).toBe(false);
      expect(await isLevelUnlocked('N2')).toBe(false);
      expect(await isLevelUnlocked('N1')).toBe(false);
    });
  });

  // ===================================================================
  // GROUP 2: UNLOCK LEVEL - unlockLevel() function behavior
  // ===================================================================

  describe('unlockLevel() Function', () => {
    test('T04 - unlockLevel adds level to unlockedLevels array', async () => {
      // Arrange: User with only Kana unlocked
      const initialStats: UserStatistics = {
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: '2025-01-01T00:00:00.000Z',
        },
        unlockedLevels: ['Kana'],
        levelUnlockDates: {
          Kana: '2025-01-01T00:00:00.000Z',
        },
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(initialStats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Act
      const wasUnlocked = await unlockLevel('N5');

      // Assert
      expect(wasUnlocked).toBe(true);
      const saveCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      expect(saveCall[0]).toBe(STORAGE_KEY);
      const savedStats = JSON.parse(saveCall[1]);
      expect(savedStats.unlockedLevels).toContain('N5');
      expect(savedStats.unlockedLevels).toHaveLength(2);
    });

    test('T05 - unlockLevel records unlock timestamp', async () => {
      // Arrange
      const initialStats: UserStatistics = {
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: '2025-01-01T00:00:00.000Z',
        },
        unlockedLevels: ['Kana'],
        levelUnlockDates: {
          Kana: '2025-01-01T00:00:00.000Z',
        },
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(initialStats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const beforeUnlock = Date.now();

      // Act
      await unlockLevel('N4');

      const afterUnlock = Date.now();

      // Assert
      const saveCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedStats = JSON.parse(saveCall[1]);
      expect(savedStats.levelUnlockDates).toHaveProperty('N4');
      const unlockDate = new Date(savedStats.levelUnlockDates.N4).getTime();
      expect(unlockDate).toBeGreaterThanOrEqual(beforeUnlock);
      expect(unlockDate).toBeLessThanOrEqual(afterUnlock);
    });

    test('T06 - unlockLevel is idempotent (already unlocked)', async () => {
      // Arrange: N3 already unlocked
      const initialStats: UserStatistics = {
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: '2025-01-01T00:00:00.000Z',
        },
        unlockedLevels: ['Kana', 'N5', 'N4', 'N3'],
        levelUnlockDates: {
          Kana: '2025-01-01T00:00:00.000Z',
          N5: '2025-01-02T00:00:00.000Z',
          N4: '2025-01-03T00:00:00.000Z',
          N3: '2025-01-04T00:00:00.000Z',
        },
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(initialStats));

      // Act
      const wasUnlocked = await unlockLevel('N3');

      // Assert
      expect(wasUnlocked).toBe(false);
      expect(AsyncStorage.setItem as jest.Mock).not.toHaveBeenCalled();
    });

    test('T07 - unlockLevel returns true for newly unlocked level', async () => {
      // Arrange
      const initialStats: UserStatistics = {
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: '2025-01-01T00:00:00.000Z',
        },
        unlockedLevels: ['Kana'],
        levelUnlockDates: {
          Kana: '2025-01-01T00:00:00.000Z',
        },
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(initialStats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await unlockLevel('N2');

      // Assert
      expect(result).toBe(true);
    });

    test('T08 - unlockLevel can unlock all levels sequentially', async () => {
      // Arrange: Start with only Kana
      let currentStats: UserStatistics = {
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: '2025-01-01T00:00:00.000Z',
        },
        unlockedLevels: ['Kana'],
        levelUnlockDates: {
          Kana: '2025-01-01T00:00:00.000Z',
        },
      };

      const levelsToUnlock: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

      // Simulate sequential unlocks
      for (const level of levelsToUnlock) {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(currentStats));
        (AsyncStorage.setItem as jest.Mock).mockImplementation((key, value) => {
          currentStats = JSON.parse(value);
          return Promise.resolve();
        });

        // Act
        const wasUnlocked = await unlockLevel(level);

        // Assert
        expect(wasUnlocked).toBe(true);
        expect(currentStats.unlockedLevels).toContain(level);
        expect(currentStats.levelUnlockDates).toHaveProperty(level);
      }

      // Final verification
      expect(currentStats.unlockedLevels).toHaveLength(6);
      expect(currentStats.unlockedLevels).toEqual(['Kana', 'N5', 'N4', 'N3', 'N2', 'N1']);
    });
  });

  // ===================================================================
  // GROUP 3: MIGRATION - Old statistics without unlock fields
  // ===================================================================

  describe('Migration', () => {
    test('T09 - Old stats without unlockedLevels get Kana by default', async () => {
      // Arrange: Old stats structure (pre-unlock feature)
      const oldStats = {
        words: {
          '1-N5-Normal': {
            wordId: 1,
            romaji: 'test',
            level: 'N5',
            difficulty: 'Normal',
            totalAttempts: 5,
            successCount: 3,
            failureCount: 2,
            perfectAttempts: 1,
            points: 1,
            lastAttemptDate: '2025-01-01T00:00:00.000Z',
          },
        },
        globalStats: {
          totalPoints: 10,
          totalAttempts: 20,
          totalWords: 5,
          perfectCount: 8,
          lastSessionDate: '2025-01-10T12:00:00.000Z',
        },
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(oldStats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Act
      const stats = await loadStatistics();

      // Assert
      expect(stats.unlockedLevels).toEqual(['Kana']);
      expect(stats.levelUnlockDates).toHaveProperty('Kana');
    });

    test('T10 - Migration preserves existing words data', async () => {
      // Arrange: Old stats with word data
      const oldStats = {
        words: {
          '1-N5-Normal': {
            wordId: 1,
            romaji: 'test1',
            level: 'N5',
            difficulty: 'Normal',
            totalAttempts: 5,
            successCount: 3,
            failureCount: 2,
            perfectAttempts: 1,
            points: 1,
            lastAttemptDate: '2025-01-01T00:00:00.000Z',
          },
          '2-N4-Facile': {
            wordId: 2,
            romaji: 'test2',
            level: 'N4',
            difficulty: 'Facile',
            totalAttempts: 10,
            successCount: 8,
            failureCount: 2,
            perfectAttempts: 5,
            points: 5,
            lastAttemptDate: '2025-01-02T00:00:00.000Z',
          },
        },
        globalStats: {
          totalPoints: 15,
          totalAttempts: 25,
          totalWords: 8,
          perfectCount: 12,
          lastSessionDate: '2025-01-10T12:00:00.000Z',
        },
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(oldStats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Act
      const stats = await loadStatistics();

      // Assert
      expect(stats.words).toEqual(oldStats.words);
      expect(Object.keys(stats.words)).toHaveLength(2);
    });

    test('T11 - Migration preserves existing globalStats', async () => {
      // Arrange: Old stats with global stats
      const oldStats = {
        words: {},
        globalStats: {
          totalPoints: 42,
          totalAttempts: 100,
          totalWords: 25,
          perfectCount: 30,
          lastSessionDate: '2025-01-15T18:30:00.000Z',
        },
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(oldStats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Act
      const stats = await loadStatistics();

      // Assert
      expect(stats.globalStats).toEqual(oldStats.globalStats);
    });

    test('T12 - Migration uses lastSessionDate as Kana unlock date if available', async () => {
      // Arrange: Old stats with lastSessionDate
      const lastSessionDate = '2025-01-20T10:15:30.000Z';
      const oldStats = {
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate,
        },
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(oldStats));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Act
      const stats = await loadStatistics();

      // Assert
      expect(stats.levelUnlockDates.Kana).toBe(lastSessionDate);
    });
  });

  // ===================================================================
  // GROUP 4: IMMUTABILITY - getUnlockedLevels returns clone
  // ===================================================================

  describe('Immutability', () => {
    test('T13 - getUnlockedLevels returns a clone (not original array)', async () => {
      // Arrange
      const initialStats: UserStatistics = {
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: '2025-01-01T00:00:00.000Z',
        },
        unlockedLevels: ['Kana', 'N5', 'N4'],
        levelUnlockDates: {
          Kana: '2025-01-01T00:00:00.000Z',
          N5: '2025-01-02T00:00:00.000Z',
          N4: '2025-01-03T00:00:00.000Z',
        },
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(initialStats));

      // Act
      const levels1 = await getUnlockedLevels();
      const levels2 = await getUnlockedLevels();

      // Assert: Different array instances
      expect(levels1).not.toBe(levels2);
      expect(levels1).toEqual(levels2);
    });

    test('T14 - Mutating returned array from getUnlockedLevels does not affect internal state', async () => {
      // Arrange
      const initialStats: UserStatistics = {
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: '2025-01-01T00:00:00.000Z',
        },
        unlockedLevels: ['Kana', 'N5'],
        levelUnlockDates: {
          Kana: '2025-01-01T00:00:00.000Z',
          N5: '2025-01-02T00:00:00.000Z',
        },
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(initialStats));

      // Act
      const levels = await getUnlockedLevels();
      levels.push('N4'); // Mutate returned array
      const levelsAfterMutation = await getUnlockedLevels();

      // Assert: Internal state unchanged
      expect(levelsAfterMutation).toEqual(['Kana', 'N5']);
      expect(levelsAfterMutation).not.toContain('N4');
    });
  });

  // ===================================================================
  // GROUP 5: ERROR HANDLING
  // ===================================================================

  describe('Error Handling', () => {
    test('T15 - AsyncStorage error returns default state with Kana unlocked', async () => {
      // Arrange: Simulate AsyncStorage error
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      // Act
      const stats = await loadStatistics();

      // Assert: Should return default stats
      expect(stats.unlockedLevels).toEqual(['Kana']);
      expect(stats.levelUnlockDates).toHaveProperty('Kana');
      expect(stats.globalStats.totalPoints).toBe(0);
    });
  });
});
