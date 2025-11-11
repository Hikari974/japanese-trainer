import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadStatistics,
  saveStatistics,
  recordAttempt,
  resetStatistics,
  getGlobalStats,
  calculatePoints,
  getWordStatKey,
} from '../statistics';
import type { UserStatistics, AttemptData } from '../../types/statistics';

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Mock __DEV__ global
global.__DEV__ = true;

describe('statistics service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockReset();
    mockAsyncStorage.setItem.mockReset();
  });

  describe('getWordStatKey', () => {
    it('should generate composite key from wordId, level, and difficulty', () => {
      expect(getWordStatKey(42, 'N5', 'Normal')).toBe('42-N5-Normal');
    });

    it('should handle different levels', () => {
      expect(getWordStatKey(1, 'Kana', 'Facile')).toBe('1-Kana-Facile');
      expect(getWordStatKey(2, 'N1', 'Extrême')).toBe('2-N1-Extrême');
    });

    it('should handle different word IDs', () => {
      expect(getWordStatKey(999, 'N3', 'Difficile')).toBe('999-N3-Difficile');
      expect(getWordStatKey(0, 'N5', 'Normal')).toBe('0-N5-Normal');
    });
  });

  describe('calculatePoints', () => {
    it('should return 1 for perfect attempt (correct + single start + no translation)', () => {
      expect(calculatePoints(true, 1, false)).toBe(1);
    });

    it('should return 0 if incorrect', () => {
      expect(calculatePoints(false, 1, false)).toBe(0);
    });

    it('should return 0 if startCount > 1', () => {
      expect(calculatePoints(true, 2, false)).toBe(0);
      expect(calculatePoints(true, 3, false)).toBe(0);
    });

    it('should return 0 if translation was viewed', () => {
      expect(calculatePoints(true, 1, true)).toBe(0);
    });

    it('should return 0 if multiple conditions fail', () => {
      expect(calculatePoints(false, 2, false)).toBe(0);
      expect(calculatePoints(false, 1, true)).toBe(0);
      expect(calculatePoints(true, 2, true)).toBe(0);
      expect(calculatePoints(false, 2, true)).toBe(0);
    });

    it('should handle startCount of 0', () => {
      expect(calculatePoints(true, 0, false)).toBe(0);
    });
  });

  describe('loadStatistics', () => {
    it('should return default statistics on first use (null)', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const stats = await loadStatistics();

      expect(stats).toEqual({
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: expect.any(String),
        },
      });
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@japanese_trainer:user_statistics');
    });

    it('should load valid statistics correctly', async () => {
      const validStats: UserStatistics = {
        words: {
          '42-N5-Normal': {
            wordId: 42,
            romaji: 'test',
            level: 'N5',
            difficulty: 'Normal',
            totalAttempts: 5,
            successCount: 3,
            failureCount: 2,
            perfectAttempts: 2,
            points: 2,
            lastAttemptDate: '2025-11-11T00:00:00.000Z',
          },
        },
        globalStats: {
          totalPoints: 10,
          totalAttempts: 20,
          totalWords: 5,
          perfectCount: 10,
          lastSessionDate: '2025-11-11T00:00:00.000Z',
        },
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(validStats));

      const stats = await loadStatistics();

      expect(stats).toEqual(validStats);
    });

    it('should use defaults for missing fields in stored statistics', async () => {
      const partialStats = {
        words: {},
        globalStats: {
          totalPoints: 5,
          // Missing other fields
        },
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(partialStats));

      const stats = await loadStatistics();

      expect(stats).toEqual({
        words: {},
        globalStats: {
          totalPoints: 5,
          totalAttempts: 0, // fallback to default
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: expect.any(String),
        },
      });
    });

    it('should handle missing words field', async () => {
      const statsWithoutWords = {
        globalStats: {
          totalPoints: 5,
          totalAttempts: 10,
          totalWords: 3,
          perfectCount: 5,
          lastSessionDate: '2025-11-11T00:00:00.000Z',
        },
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(statsWithoutWords));

      const stats = await loadStatistics();

      expect(stats.words).toEqual({});
    });

    it('should handle missing globalStats field', async () => {
      const statsWithoutGlobal = {
        words: {},
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(statsWithoutGlobal));

      const stats = await loadStatistics();

      expect(stats.globalStats).toEqual({
        totalPoints: 0,
        totalAttempts: 0,
        totalWords: 0,
        perfectCount: 0,
        lastSessionDate: expect.any(String),
      });
    });

    it('should handle corrupted JSON and return defaults', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockAsyncStorage.getItem.mockResolvedValue('{ invalid json }');

      const stats = await loadStatistics();

      expect(stats).toEqual({
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: expect.any(String),
        },
      });

      consoleWarnSpy.mockRestore();
    });

    it('should handle non-object JSON and return defaults', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify('string value'));

      const stats = await loadStatistics();

      expect(stats).toEqual({
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: expect.any(String),
        },
      });
    });

    it('should handle null JSON and return defaults', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(null));

      const stats = await loadStatistics();

      expect(stats).toEqual({
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: expect.any(String),
        },
      });
    });

    it('should handle AsyncStorage error and return defaults', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const stats = await loadStatistics();

      expect(stats).toEqual({
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: expect.any(String),
        },
      });

      consoleWarnSpy.mockRestore();
    });
  });

  describe('saveStatistics', () => {
    it('should save statistics correctly', async () => {
      const stats: UserStatistics = {
        words: {
          '42-N5-Normal': {
            wordId: 42,
            romaji: 'test',
            level: 'N5',
            difficulty: 'Normal',
            totalAttempts: 5,
            successCount: 3,
            failureCount: 2,
            perfectAttempts: 2,
            points: 2,
            lastAttemptDate: '2025-11-11T00:00:00.000Z',
          },
        },
        globalStats: {
          totalPoints: 10,
          totalAttempts: 20,
          totalWords: 5,
          perfectCount: 10,
          lastSessionDate: '2025-11-11T00:00:00.000Z',
        },
      };

      await saveStatistics(stats);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@japanese_trainer:user_statistics',
        JSON.stringify(stats)
      );
    });

    it('should save empty statistics', async () => {
      const emptyStats: UserStatistics = {
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: '2025-11-11T00:00:00.000Z',
        },
      };

      await saveStatistics(emptyStats);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@japanese_trainer:user_statistics',
        JSON.stringify(emptyStats)
      );
    });

    it('should handle AsyncStorage error silently', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const stats: UserStatistics = {
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: '2025-11-11T00:00:00.000Z',
        },
      };

      await expect(saveStatistics(stats)).resolves.not.toThrow();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('recordAttempt', () => {
    beforeEach(() => {
      // Mock Date to have consistent timestamps
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-11-11T10:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
      mockAsyncStorage.getItem.mockReset();
      mockAsyncStorage.setItem.mockReset();
    });

    it('should create new word statistic for first attempt (perfect)', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null); // First use
      mockAsyncStorage.setItem.mockResolvedValue();

      const attemptData: AttemptData = {
        wordId: 42,
        romaji: 'konnichiwa',
        level: 'N5',
        difficulty: 'Normal',
        isCorrect: true,
        startCount: 1,
        translationViewed: false,
      };

      const pointsEarned = await recordAttempt(attemptData);

      expect(pointsEarned).toBe(1);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@japanese_trainer:user_statistics',
        expect.any(String)
      );

      // Verify saved data structure
      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData.words['42-N5-Normal']).toEqual({
        wordId: 42,
        romaji: 'konnichiwa',
        level: 'N5',
        difficulty: 'Normal',
        totalAttempts: 1,
        successCount: 1,
        failureCount: 0,
        perfectAttempts: 1,
        points: 1,
        lastAttemptDate: '2025-11-11T10:00:00.000Z',
      });
      expect(savedData.globalStats).toEqual({
        totalPoints: 1,
        totalAttempts: 1,
        totalWords: 1,
        perfectCount: 1,
        lastSessionDate: '2025-11-11T10:00:00.000Z',
      });
    });

    it('should create new word statistic for first attempt (incorrect)', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      let capturedData: string | null = null;
      mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
        capturedData = value;
      });

      const attemptData: AttemptData = {
        wordId: 42,
        romaji: 'konnichiwa',
        level: 'N5',
        difficulty: 'Normal',
        isCorrect: false,
        startCount: 1,
        translationViewed: false,
      };

      const pointsEarned = await recordAttempt(attemptData);

      expect(pointsEarned).toBe(0);

      // Check the captured data from this specific call
      expect(capturedData).not.toBeNull();
      const savedData = JSON.parse(capturedData!);
      expect(savedData.words['42-N5-Normal']).toEqual({
        wordId: 42,
        romaji: 'konnichiwa',
        level: 'N5',
        difficulty: 'Normal',
        totalAttempts: 1,
        successCount: 0,
        failureCount: 1,
        perfectAttempts: 0,
        points: 0,
        lastAttemptDate: '2025-11-11T10:00:00.000Z',
      });
      expect(savedData.globalStats).toEqual({
        totalPoints: 0,
        totalAttempts: 1,
        totalWords: 1, // Still counts as new word
        perfectCount: 0,
        lastSessionDate: '2025-11-11T10:00:00.000Z',
      });
    });

    it('should update existing word statistic (perfect to perfect)', async () => {
      const existingStats: UserStatistics = {
        words: {
          '42-N5-Normal': {
            wordId: 42,
            romaji: 'konnichiwa',
            level: 'N5',
            difficulty: 'Normal',
            totalAttempts: 1,
            successCount: 1,
            failureCount: 0,
            perfectAttempts: 1,
            points: 1,
            lastAttemptDate: '2025-11-10T10:00:00.000Z',
          },
        },
        globalStats: {
          totalPoints: 1,
          totalAttempts: 1,
          totalWords: 1,
          perfectCount: 1,
          lastSessionDate: '2025-11-10T10:00:00.000Z',
        },
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingStats));
      mockAsyncStorage.setItem.mockResolvedValue();

      const attemptData: AttemptData = {
        wordId: 42,
        romaji: 'konnichiwa',
        level: 'N5',
        difficulty: 'Normal',
        isCorrect: true,
        startCount: 1,
        translationViewed: false,
      };

      const pointsEarned = await recordAttempt(attemptData);

      expect(pointsEarned).toBe(1);

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData.words['42-N5-Normal']).toEqual({
        wordId: 42,
        romaji: 'konnichiwa',
        level: 'N5',
        difficulty: 'Normal',
        totalAttempts: 2,
        successCount: 2,
        failureCount: 0,
        perfectAttempts: 2,
        points: 2,
        lastAttemptDate: '2025-11-11T10:00:00.000Z',
      });
      expect(savedData.globalStats).toEqual({
        totalPoints: 2,
        totalAttempts: 2,
        totalWords: 1, // Still just 1 word
        perfectCount: 2,
        lastSessionDate: '2025-11-11T10:00:00.000Z',
      });
    });

    it('should update existing word statistic (correct but not perfect)', async () => {
      const existingStats: UserStatistics = {
        words: {
          '42-N5-Normal': {
            wordId: 42,
            romaji: 'konnichiwa',
            level: 'N5',
            difficulty: 'Normal',
            totalAttempts: 1,
            successCount: 1,
            failureCount: 0,
            perfectAttempts: 1,
            points: 1,
            lastAttemptDate: '2025-11-10T10:00:00.000Z',
          },
        },
        globalStats: {
          totalPoints: 1,
          totalAttempts: 1,
          totalWords: 1,
          perfectCount: 1,
          lastSessionDate: '2025-11-10T10:00:00.000Z',
        },
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingStats));
      mockAsyncStorage.setItem.mockResolvedValue();

      const attemptData: AttemptData = {
        wordId: 42,
        romaji: 'konnichiwa',
        level: 'N5',
        difficulty: 'Normal',
        isCorrect: true,
        startCount: 2, // Not perfect - multiple starts
        translationViewed: false,
      };

      const pointsEarned = await recordAttempt(attemptData);

      expect(pointsEarned).toBe(0);

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData.words['42-N5-Normal']).toEqual({
        wordId: 42,
        romaji: 'konnichiwa',
        level: 'N5',
        difficulty: 'Normal',
        totalAttempts: 2,
        successCount: 2,
        failureCount: 0,
        perfectAttempts: 1, // No increase
        points: 1, // No increase
        lastAttemptDate: '2025-11-11T10:00:00.000Z',
      });
      expect(savedData.globalStats).toEqual({
        totalPoints: 1, // No increase
        totalAttempts: 2,
        totalWords: 1,
        perfectCount: 1, // No increase
        lastSessionDate: '2025-11-11T10:00:00.000Z',
      });
    });

    it('should update existing word statistic (incorrect)', async () => {
      const existingStats: UserStatistics = {
        words: {
          '42-N5-Normal': {
            wordId: 42,
            romaji: 'konnichiwa',
            level: 'N5',
            difficulty: 'Normal',
            totalAttempts: 1,
            successCount: 1,
            failureCount: 0,
            perfectAttempts: 1,
            points: 1,
            lastAttemptDate: '2025-11-10T10:00:00.000Z',
          },
        },
        globalStats: {
          totalPoints: 1,
          totalAttempts: 1,
          totalWords: 1,
          perfectCount: 1,
          lastSessionDate: '2025-11-10T10:00:00.000Z',
        },
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingStats));
      mockAsyncStorage.setItem.mockResolvedValue();

      const attemptData: AttemptData = {
        wordId: 42,
        romaji: 'konnichiwa',
        level: 'N5',
        difficulty: 'Normal',
        isCorrect: false,
        startCount: 1,
        translationViewed: false,
      };

      const pointsEarned = await recordAttempt(attemptData);

      expect(pointsEarned).toBe(0);

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData.words['42-N5-Normal']).toEqual({
        wordId: 42,
        romaji: 'konnichiwa',
        level: 'N5',
        difficulty: 'Normal',
        totalAttempts: 2,
        successCount: 1,
        failureCount: 1,
        perfectAttempts: 1,
        points: 1,
        lastAttemptDate: '2025-11-11T10:00:00.000Z',
      });
    });

    it('should track multiple different words', async () => {
      const existingStats: UserStatistics = {
        words: {
          '42-N5-Normal': {
            wordId: 42,
            romaji: 'konnichiwa',
            level: 'N5',
            difficulty: 'Normal',
            totalAttempts: 1,
            successCount: 1,
            failureCount: 0,
            perfectAttempts: 1,
            points: 1,
            lastAttemptDate: '2025-11-10T10:00:00.000Z',
          },
        },
        globalStats: {
          totalPoints: 1,
          totalAttempts: 1,
          totalWords: 1,
          perfectCount: 1,
          lastSessionDate: '2025-11-10T10:00:00.000Z',
        },
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingStats));
      mockAsyncStorage.setItem.mockResolvedValue();

      const attemptData: AttemptData = {
        wordId: 99, // Different word
        romaji: 'sayonara',
        level: 'N5',
        difficulty: 'Normal',
        isCorrect: true,
        startCount: 1,
        translationViewed: false,
      };

      const pointsEarned = await recordAttempt(attemptData);

      expect(pointsEarned).toBe(1);

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(Object.keys(savedData.words)).toHaveLength(2);
      expect(savedData.words['99-N5-Normal']).toBeDefined();
      expect(savedData.globalStats.totalWords).toBe(2); // New word added
    });

    it('should track same word at different level/difficulty separately', async () => {
      const existingStats: UserStatistics = {
        words: {
          '42-N5-Normal': {
            wordId: 42,
            romaji: 'konnichiwa',
            level: 'N5',
            difficulty: 'Normal',
            totalAttempts: 1,
            successCount: 1,
            failureCount: 0,
            perfectAttempts: 1,
            points: 1,
            lastAttemptDate: '2025-11-10T10:00:00.000Z',
          },
        },
        globalStats: {
          totalPoints: 1,
          totalAttempts: 1,
          totalWords: 1,
          perfectCount: 1,
          lastSessionDate: '2025-11-10T10:00:00.000Z',
        },
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingStats));
      mockAsyncStorage.setItem.mockResolvedValue();

      const attemptData: AttemptData = {
        wordId: 42, // Same word
        romaji: 'konnichiwa',
        level: 'N5',
        difficulty: 'Difficile', // Different difficulty
        isCorrect: true,
        startCount: 1,
        translationViewed: false,
      };

      const pointsEarned = await recordAttempt(attemptData);

      expect(pointsEarned).toBe(1);

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(Object.keys(savedData.words)).toHaveLength(2);
      expect(savedData.words['42-N5-Difficile']).toBeDefined();
      expect(savedData.globalStats.totalWords).toBe(2); // Counts as "new" combination
    });

    it('should handle translation viewed (no points)', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      let capturedData: string | null = null;
      mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
        capturedData = value;
      });

      const attemptData: AttemptData = {
        wordId: 42,
        romaji: 'konnichiwa',
        level: 'N5',
        difficulty: 'Normal',
        isCorrect: true,
        startCount: 1,
        translationViewed: true, // Translation was viewed
      };

      const pointsEarned = await recordAttempt(attemptData);

      expect(pointsEarned).toBe(0);

      // Check the captured data from this specific call
      expect(capturedData).not.toBeNull();
      const savedData = JSON.parse(capturedData!);
      expect(savedData.words['42-N5-Normal'].perfectAttempts).toBe(0);
      expect(savedData.words['42-N5-Normal'].points).toBe(0);
      expect(savedData.globalStats.perfectCount).toBe(0);
    });

    it('should handle storage load failure gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      // getItem fails but loadStatistics returns defaults
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      mockAsyncStorage.setItem.mockResolvedValue(); // Save works

      const attemptData: AttemptData = {
        wordId: 42,
        romaji: 'konnichiwa',
        level: 'N5',
        difficulty: 'Normal',
        isCorrect: true,
        startCount: 1,
        translationViewed: false,
      };

      const pointsEarned = await recordAttempt(attemptData);

      // Should still calculate and return points (loadStatistics returns defaults)
      expect(pointsEarned).toBe(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to load statistics:', expect.any(Error));

      consoleWarnSpy.mockRestore();
    });

    it('should handle save error and still return calculated points', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const attemptData: AttemptData = {
        wordId: 42,
        romaji: 'konnichiwa',
        level: 'N5',
        difficulty: 'Normal',
        isCorrect: true,
        startCount: 1,
        translationViewed: false,
      };

      const pointsEarned = await recordAttempt(attemptData);

      // Should still return calculated points even if save fails
      expect(pointsEarned).toBe(1);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getGlobalStats', () => {
    it('should return global statistics from storage', async () => {
      const stats: UserStatistics = {
        words: {
          '42-N5-Normal': {
            wordId: 42,
            romaji: 'konnichiwa',
            level: 'N5',
            difficulty: 'Normal',
            totalAttempts: 5,
            successCount: 3,
            failureCount: 2,
            perfectAttempts: 2,
            points: 2,
            lastAttemptDate: '2025-11-11T00:00:00.000Z',
          },
        },
        globalStats: {
          totalPoints: 10,
          totalAttempts: 20,
          totalWords: 5,
          perfectCount: 10,
          lastSessionDate: '2025-11-11T00:00:00.000Z',
        },
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(stats));

      const globalStats = await getGlobalStats();

      expect(globalStats).toEqual(stats.globalStats);
    });

    it('should return default global stats on first use', async () => {
      // Reset mocks to ensure clean state
      mockAsyncStorage.getItem.mockReset();
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const globalStats = await getGlobalStats();

      expect(globalStats).toEqual({
        totalPoints: 0,
        totalAttempts: 0,
        totalWords: 0,
        perfectCount: 0,
        lastSessionDate: expect.any(String),
      });
    });
  });

  describe('resetStatistics', () => {
    it('should reset statistics to default empty state', async () => {
      let capturedData: string | null = null;
      mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
        capturedData = value;
      });

      await resetStatistics();

      expect(capturedData).not.toBeNull();
      expect(capturedData).toContain('"words":{}');

      const savedData = JSON.parse(capturedData!);
      expect(savedData).toEqual({
        words: {},
        globalStats: {
          totalPoints: 0,
          totalAttempts: 0,
          totalWords: 0,
          perfectCount: 0,
          lastSessionDate: expect.any(String),
        },
      });
    });

    it('should handle AsyncStorage error silently', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(resetStatistics()).resolves.not.toThrow();

      consoleErrorSpy.mockRestore();
    });
  });
});
