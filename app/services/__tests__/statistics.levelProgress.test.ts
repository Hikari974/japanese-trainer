/**
 * Tests for Level Progress functionality
 * Tests calculateLevelProgress, getAvailableWordIdsForLevel, and getTotalPointsForWord
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateLevelProgress } from '../statistics';
import type { UserStatistics } from '../../types/statistics';
import type { JLPTLevel } from '../../types/word';

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Mock __DEV__ global
global.__DEV__ = true;

// Mock wordLoader module
jest.mock('../wordLoader', () => ({
  getWordsByLevel: jest.fn((level: string) => {
    // Mock word counts based on actual data structure
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

describe('Level Progress Statistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockReset();
    mockAsyncStorage.setItem.mockReset();
  });

  describe('calculateLevelProgress', () => {
    describe('Empty statistics (0% completion)', () => {
      it('should return 0% for Kana level with no statistics', async () => {
        mockAsyncStorage.getItem.mockResolvedValue(null);

        const progress = await calculateLevelProgress('Kana');

        expect(progress).toEqual({
          level: 'Kana',
          totalWords: 100, // N5 romaji = 100 words
          masteredWords: 0,
          percentage: 0,
        });
      });

      it('should return 0% for N5 level with no statistics', async () => {
        mockAsyncStorage.getItem.mockResolvedValue(null);

        const progress = await calculateLevelProgress('N5');

        expect(progress).toEqual({
          level: 'N5',
          totalWords: 180, // N5 (100) + N4 (80) = 180 words
          masteredWords: 0,
          percentage: 0,
        });
      });

      it('should return 0% for N4 level with no statistics', async () => {
        mockAsyncStorage.getItem.mockResolvedValue(null);

        const progress = await calculateLevelProgress('N4');

        expect(progress).toEqual({
          level: 'N4',
          totalWords: 240, // N5 (100) + N4 (80) + N3 (60) = 240 words
          masteredWords: 0,
          percentage: 0,
        });
      });

      it('should return 0% for N3 level with no statistics', async () => {
        mockAsyncStorage.getItem.mockResolvedValue(null);

        const progress = await calculateLevelProgress('N3');

        expect(progress).toEqual({
          level: 'N3',
          totalWords: 280, // N5 (100) + N4 (80) + N3 (60) + N2 (40) = 280 words
          masteredWords: 0,
          percentage: 0,
        });
      });

      it('should return 0% for N2 level with no statistics', async () => {
        mockAsyncStorage.getItem.mockResolvedValue(null);

        const progress = await calculateLevelProgress('N2');

        expect(progress).toEqual({
          level: 'N2',
          totalWords: 300, // N5 (100) + N4 (80) + N3 (60) + N2 (40) + N1 (20) = 300 words
          masteredWords: 0,
          percentage: 0,
        });
      });

      it('should return 0% for N1 level with no statistics', async () => {
        mockAsyncStorage.getItem.mockResolvedValue(null);

        const progress = await calculateLevelProgress('N1');

        expect(progress).toEqual({
          level: 'N1',
          totalWords: 300, // N5 (100) + N4 (80) + N3 (60) + N2 (40) + N1 (20) = 300 words
          masteredWords: 0,
          percentage: 0,
        });
      });
    });

    describe('Partial completion (mixed progress)', () => {
      it('should calculate progress for Kana level with some mastered words', async () => {
        const stats: UserStatistics = {
          words: {
            // Word 1: 5 points total (mastered)
            '1-Kana-Facile': {
              wordId: 1,
              romaji: 'word1',
              level: 'Kana',
              difficulty: 'Facile',
              totalAttempts: 5,
              successCount: 5,
              failureCount: 0,
              perfectAttempts: 3,
              points: 3,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            '1-Kana-Normal': {
              wordId: 1,
              romaji: 'word1',
              level: 'Kana',
              difficulty: 'Normal',
              totalAttempts: 2,
              successCount: 2,
              failureCount: 0,
              perfectAttempts: 2,
              points: 2,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            // Word 2: 4 points total (NOT mastered - needs >= 5)
            '2-Kana-Facile': {
              wordId: 2,
              romaji: 'word2',
              level: 'Kana',
              difficulty: 'Facile',
              totalAttempts: 4,
              successCount: 4,
              failureCount: 0,
              perfectAttempts: 4,
              points: 4,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            // Word 3: 10 points total (mastered)
            '3-Kana-Difficile': {
              wordId: 3,
              romaji: 'word3',
              level: 'Kana',
              difficulty: 'Difficile',
              totalAttempts: 10,
              successCount: 10,
              failureCount: 0,
              perfectAttempts: 10,
              points: 10,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
          },
          globalStats: {
            totalPoints: 19,
            totalAttempts: 21,
            totalWords: 4,
            perfectCount: 19,
            lastSessionDate: '2025-11-11T00:00:00.000Z',
          },
        };
        mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(stats));

        const progress = await calculateLevelProgress('Kana');

        expect(progress).toEqual({
          level: 'Kana',
          totalWords: 100,
          masteredWords: 2, // Words 1 and 3 have >= 5 points
          percentage: 2.0, // (2 / 100) * 100 = 2.00
        });
      });

      it('should calculate progress for N5 level with cross-difficulty points', async () => {
        const stats: UserStatistics = {
          words: {
            // Word 1 (N5 word): 6 points across 4 difficulties (mastered)
            '1-N5-Facile': {
              wordId: 1,
              romaji: 'word1',
              level: 'N5',
              difficulty: 'Facile',
              totalAttempts: 2,
              successCount: 2,
              failureCount: 0,
              perfectAttempts: 2,
              points: 2,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            '1-N5-Normal': {
              wordId: 1,
              romaji: 'word1',
              level: 'N5',
              difficulty: 'Normal',
              totalAttempts: 1,
              successCount: 1,
              failureCount: 0,
              perfectAttempts: 1,
              points: 1,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            '1-N5-Difficile': {
              wordId: 1,
              romaji: 'word1',
              level: 'N5',
              difficulty: 'Difficile',
              totalAttempts: 2,
              successCount: 2,
              failureCount: 0,
              perfectAttempts: 2,
              points: 2,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            '1-N5-Extrême': {
              wordId: 1,
              romaji: 'word1',
              level: 'N5',
              difficulty: 'Extrême',
              totalAttempts: 1,
              successCount: 1,
              failureCount: 0,
              perfectAttempts: 1,
              points: 1,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            // Word 101 (N4 word in N5 level): 3 points (NOT mastered)
            '101-N5-Facile': {
              wordId: 101,
              romaji: 'word101',
              level: 'N5',
              difficulty: 'Facile',
              totalAttempts: 3,
              successCount: 3,
              failureCount: 0,
              perfectAttempts: 3,
              points: 3,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
          },
          globalStats: {
            totalPoints: 9,
            totalAttempts: 9,
            totalWords: 5,
            perfectCount: 9,
            lastSessionDate: '2025-11-11T00:00:00.000Z',
          },
        };
        mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(stats));

        const progress = await calculateLevelProgress('N5');

        expect(progress).toEqual({
          level: 'N5',
          totalWords: 180, // N5 (100) + N4 (80)
          masteredWords: 1, // Only word 1 has >= 5 points
          percentage: 0.56, // (1 / 180) * 100 = 0.5555... rounded to 0.56
        });
      });

      it('should round percentage to 2 decimal places correctly', async () => {
        const stats: UserStatistics = {
          words: {
            // Create exactly 7 mastered words out of 300 total
            '1-N1-Facile': {
              wordId: 1,
              romaji: 'word1',
              level: 'N1',
              difficulty: 'Facile',
              totalAttempts: 5,
              successCount: 5,
              failureCount: 0,
              perfectAttempts: 5,
              points: 5,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            '2-N1-Normal': {
              wordId: 2,
              romaji: 'word2',
              level: 'N1',
              difficulty: 'Normal',
              totalAttempts: 6,
              successCount: 6,
              failureCount: 0,
              perfectAttempts: 6,
              points: 6,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            '3-N1-Difficile': {
              wordId: 3,
              romaji: 'word3',
              level: 'N1',
              difficulty: 'Difficile',
              totalAttempts: 5,
              successCount: 5,
              failureCount: 0,
              perfectAttempts: 5,
              points: 5,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            '4-N1-Extrême': {
              wordId: 4,
              romaji: 'word4',
              level: 'N1',
              difficulty: 'Extrême',
              totalAttempts: 7,
              successCount: 7,
              failureCount: 0,
              perfectAttempts: 7,
              points: 7,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            '5-N1-Facile': {
              wordId: 5,
              romaji: 'word5',
              level: 'N1',
              difficulty: 'Facile',
              totalAttempts: 5,
              successCount: 5,
              failureCount: 0,
              perfectAttempts: 5,
              points: 5,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            '6-N1-Normal': {
              wordId: 6,
              romaji: 'word6',
              level: 'N1',
              difficulty: 'Normal',
              totalAttempts: 8,
              successCount: 8,
              failureCount: 0,
              perfectAttempts: 8,
              points: 8,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            '7-N1-Difficile': {
              wordId: 7,
              romaji: 'word7',
              level: 'N1',
              difficulty: 'Difficile',
              totalAttempts: 10,
              successCount: 10,
              failureCount: 0,
              perfectAttempts: 10,
              points: 10,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
          },
          globalStats: {
            totalPoints: 46,
            totalAttempts: 46,
            totalWords: 7,
            perfectCount: 46,
            lastSessionDate: '2025-11-11T00:00:00.000Z',
          },
        };
        mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(stats));

        const progress = await calculateLevelProgress('N1');

        // 7 / 300 * 100 = 2.333333... should round to 2.33
        expect(progress.percentage).toBe(2.33);
      });
    });

    describe('Full completion (100%)', () => {
      it('should return 100% when all Kana words are mastered', async () => {
        // Create stats where all 100 N5 words have >= 5 points in Kana level
        const words: Record<string, any> = {};
        for (let i = 1; i <= 100; i++) {
          words[`${i}-Kana-Facile`] = {
            wordId: i,
            romaji: `word${i}`,
            level: 'Kana',
            difficulty: 'Facile',
            totalAttempts: 5,
            successCount: 5,
            failureCount: 0,
            perfectAttempts: 5,
            points: 5,
            lastAttemptDate: '2025-11-11T00:00:00.000Z',
          };
        }

        const stats: UserStatistics = {
          words,
          globalStats: {
            totalPoints: 500,
            totalAttempts: 500,
            totalWords: 100,
            perfectCount: 500,
            lastSessionDate: '2025-11-11T00:00:00.000Z',
          },
        };
        mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(stats));

        const progress = await calculateLevelProgress('Kana');

        expect(progress).toEqual({
          level: 'Kana',
          totalWords: 100,
          masteredWords: 100,
          percentage: 100.0,
        });
      });
    });

    describe('Edge cases', () => {
      it('should handle word with exactly 5 points (mastered threshold)', async () => {
        const stats: UserStatistics = {
          words: {
            '1-Kana-Facile': {
              wordId: 1,
              romaji: 'word1',
              level: 'Kana',
              difficulty: 'Facile',
              totalAttempts: 3,
              successCount: 3,
              failureCount: 0,
              perfectAttempts: 3,
              points: 3,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            '1-Kana-Normal': {
              wordId: 1,
              romaji: 'word1',
              level: 'Kana',
              difficulty: 'Normal',
              totalAttempts: 2,
              successCount: 2,
              failureCount: 0,
              perfectAttempts: 2,
              points: 2,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
          },
          globalStats: {
            totalPoints: 5,
            totalAttempts: 5,
            totalWords: 2,
            perfectCount: 5,
            lastSessionDate: '2025-11-11T00:00:00.000Z',
          },
        };
        mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(stats));

        const progress = await calculateLevelProgress('Kana');

        expect(progress.masteredWords).toBe(1); // Exactly 5 points = mastered
      });

      it('should handle word with 4 points (NOT mastered)', async () => {
        const stats: UserStatistics = {
          words: {
            '1-Kana-Facile': {
              wordId: 1,
              romaji: 'word1',
              level: 'Kana',
              difficulty: 'Facile',
              totalAttempts: 4,
              successCount: 4,
              failureCount: 0,
              perfectAttempts: 4,
              points: 4,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
          },
          globalStats: {
            totalPoints: 4,
            totalAttempts: 4,
            totalWords: 1,
            perfectCount: 4,
            lastSessionDate: '2025-11-11T00:00:00.000Z',
          },
        };
        mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(stats));

        const progress = await calculateLevelProgress('Kana');

        expect(progress.masteredWords).toBe(0); // 4 points < 5 = NOT mastered
      });

      it('should handle empty statistics object (not null)', async () => {
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
        mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(emptyStats));

        const progress = await calculateLevelProgress('N5');

        expect(progress).toEqual({
          level: 'N5',
          totalWords: 180,
          masteredWords: 0,
          percentage: 0,
        });
      });

      it('should handle percentage calculation correctly when totalWords > 0', async () => {
        // This test verifies that percentage calculation is safe
        // In actual implementation, totalWords will always be > 0 for valid levels
        mockAsyncStorage.getItem.mockResolvedValue(null);

        const progress = await calculateLevelProgress('Kana');

        expect(progress.percentage).toBe(0); // Should not crash
        expect(progress.totalWords).toBe(100); // Mock returns 100 N5 words
        // The implementation has division-by-zero protection (totalWords > 0 ? ... : 0)
      });

      it('should ignore points from different levels', async () => {
        const stats: UserStatistics = {
          words: {
            // Word 1 in Kana level: 5 points (mastered for Kana)
            '1-Kana-Facile': {
              wordId: 1,
              romaji: 'word1',
              level: 'Kana',
              difficulty: 'Facile',
              totalAttempts: 5,
              successCount: 5,
              failureCount: 0,
              perfectAttempts: 5,
              points: 5,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
            // Same word in N5 level: 10 points (should NOT count for Kana)
            '1-N5-Normal': {
              wordId: 1,
              romaji: 'word1',
              level: 'N5',
              difficulty: 'Normal',
              totalAttempts: 10,
              successCount: 10,
              failureCount: 0,
              perfectAttempts: 10,
              points: 10,
              lastAttemptDate: '2025-11-11T00:00:00.000Z',
            },
          },
          globalStats: {
            totalPoints: 15,
            totalAttempts: 15,
            totalWords: 2,
            perfectCount: 15,
            lastSessionDate: '2025-11-11T00:00:00.000Z',
          },
        };
        mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(stats));

        const progressKana = await calculateLevelProgress('Kana');

        expect(progressKana.masteredWords).toBe(1); // Only Kana points count
      });
    });

    describe('Error handling', () => {
      it('should handle AsyncStorage error gracefully', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

        const progress = await calculateLevelProgress('N5');

        // On storage error, loadStatistics returns defaults, but word count is still calculated
        expect(progress).toEqual({
          level: 'N5',
          totalWords: 180, // Word count is calculated from wordLoader, not storage
          masteredWords: 0, // No stats loaded = 0 mastered
          percentage: 0,
        });

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
      });

      it('should return empty progress on corrupted data', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockAsyncStorage.getItem.mockResolvedValue('{ invalid json }');

        const progress = await calculateLevelProgress('Kana');

        // loadStatistics handles corrupted data and returns defaults
        // So we should get 0% progress with correct totalWords
        expect(progress.level).toBe('Kana');
        expect(progress.masteredWords).toBe(0);
        expect(progress.percentage).toBe(0);

        consoleErrorSpy.mockRestore();
      });
    });

    describe('Word ID availability rules (cumulative pattern)', () => {
      it('should calculate progress for Kana using only N5 words', async () => {
        // Kana = N5 romaji only (100 words)
        const progress = await calculateLevelProgress('Kana');
        expect(progress.totalWords).toBe(100);
      });

      it('should calculate progress for N5 using N5 + N4 words', async () => {
        // N5 = N5 kanji + N4 romaji (100 + 80 = 180 words)
        const progress = await calculateLevelProgress('N5');
        expect(progress.totalWords).toBe(180);
      });

      it('should calculate progress for N4 using N5 + N4 + N3 words', async () => {
        // N4 = N5 kanji + N4 kanji + N3 romaji (100 + 80 + 60 = 240 words)
        const progress = await calculateLevelProgress('N4');
        expect(progress.totalWords).toBe(240);
      });

      it('should calculate progress for N3 using N5 + N4 + N3 + N2 words', async () => {
        // N3 = N5 kanji + N4 kanji + N3 kanji + N2 romaji (100 + 80 + 60 + 40 = 280 words)
        const progress = await calculateLevelProgress('N3');
        expect(progress.totalWords).toBe(280);
      });

      it('should calculate progress for N2 using N5 + N4 + N3 + N2 + N1 words', async () => {
        // N2 = N5 kanji + N4 kanji + N3 kanji + N2 kanji + N1 romaji (100 + 80 + 60 + 40 + 20 = 300)
        const progress = await calculateLevelProgress('N2');
        expect(progress.totalWords).toBe(300);
      });

      it('should calculate progress for N1 using all words', async () => {
        // N1 = N5 kanji + N4 kanji + N3 kanji + N2 kanji + N1 kanji (100 + 80 + 60 + 40 + 20 = 300)
        const progress = await calculateLevelProgress('N1');
        expect(progress.totalWords).toBe(300);
      });
    });
  });
});
