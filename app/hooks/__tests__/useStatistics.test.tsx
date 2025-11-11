import { renderHook, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStatistics } from '../useStatistics';
import type { UserStatistics, AttemptData } from '../../types/statistics';

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Mock __DEV__ global
global.__DEV__ = true;

describe('useStatistics hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state and null statistics', () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useStatistics());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.statistics).toBe(null);
  });

  it('should load statistics on mount and update state', async () => {
    const storedStats: UserStatistics = {
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
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedStats));

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.statistics).toEqual(storedStats);
  });

  it('should load default statistics on first use', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.statistics).toEqual({
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

  it('should record attempt and update statistics state', async () => {
    // Initial state: empty statistics
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();

    const { result } = renderHook(() => useStatistics());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock the response after recording attempt
    const updatedStats: UserStatistics = {
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
          lastAttemptDate: '2025-11-11T10:00:00.000Z',
        },
      },
      globalStats: {
        totalPoints: 1,
        totalAttempts: 1,
        totalWords: 1,
        perfectCount: 1,
        lastSessionDate: '2025-11-11T10:00:00.000Z',
      },
    };

    // After recordAttempt, the hook will reload statistics
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(updatedStats));

    const attemptData: AttemptData = {
      wordId: 42,
      romaji: 'konnichiwa',
      level: 'N5',
      difficulty: 'Normal',
      isCorrect: true,
      startCount: 1,
      translationViewed: false,
    };

    let pointsEarned: number = 0;
    await act(async () => {
      pointsEarned = await result.current.recordAttempt(attemptData);
    });

    // Check points earned
    expect(pointsEarned).toBe(1);

    // Check statistics were updated
    expect(result.current.statistics).toEqual(updatedStats);
  });

  it('should record incorrect attempt and update state', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const updatedStats: UserStatistics = {
      words: {
        '42-N5-Normal': {
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
        },
      },
      globalStats: {
        totalPoints: 0,
        totalAttempts: 1,
        totalWords: 1,
        perfectCount: 0,
        lastSessionDate: '2025-11-11T10:00:00.000Z',
      },
    };

    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(updatedStats));

    const attemptData: AttemptData = {
      wordId: 42,
      romaji: 'konnichiwa',
      level: 'N5',
      difficulty: 'Normal',
      isCorrect: false,
      startCount: 1,
      translationViewed: false,
    };

    let pointsEarned: number = 0;
    await act(async () => {
      pointsEarned = await result.current.recordAttempt(attemptData);
    });

    expect(pointsEarned).toBe(0);
    expect(result.current.statistics).toEqual(updatedStats);
  });

  it('should record non-perfect correct attempt (multiple starts)', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const updatedStats: UserStatistics = {
      words: {
        '42-N5-Normal': {
          wordId: 42,
          romaji: 'konnichiwa',
          level: 'N5',
          difficulty: 'Normal',
          totalAttempts: 1,
          successCount: 1,
          failureCount: 0,
          perfectAttempts: 0, // Not perfect
          points: 0,
          lastAttemptDate: '2025-11-11T10:00:00.000Z',
        },
      },
      globalStats: {
        totalPoints: 0,
        totalAttempts: 1,
        totalWords: 1,
        perfectCount: 0,
        lastSessionDate: '2025-11-11T10:00:00.000Z',
      },
    };

    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(updatedStats));

    const attemptData: AttemptData = {
      wordId: 42,
      romaji: 'konnichiwa',
      level: 'N5',
      difficulty: 'Normal',
      isCorrect: true,
      startCount: 2, // Multiple starts
      translationViewed: false,
    };

    let pointsEarned: number = 0;
    await act(async () => {
      pointsEarned = await result.current.recordAttempt(attemptData);
    });

    expect(pointsEarned).toBe(0);
    expect(result.current.statistics?.words['42-N5-Normal'].perfectAttempts).toBe(0);
  });

  it('should record non-perfect correct attempt (translation viewed)', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const updatedStats: UserStatistics = {
      words: {
        '42-N5-Normal': {
          wordId: 42,
          romaji: 'konnichiwa',
          level: 'N5',
          difficulty: 'Normal',
          totalAttempts: 1,
          successCount: 1,
          failureCount: 0,
          perfectAttempts: 0, // Not perfect
          points: 0,
          lastAttemptDate: '2025-11-11T10:00:00.000Z',
        },
      },
      globalStats: {
        totalPoints: 0,
        totalAttempts: 1,
        totalWords: 1,
        perfectCount: 0,
        lastSessionDate: '2025-11-11T10:00:00.000Z',
      },
    };

    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(updatedStats));

    const attemptData: AttemptData = {
      wordId: 42,
      romaji: 'konnichiwa',
      level: 'N5',
      difficulty: 'Normal',
      isCorrect: true,
      startCount: 1,
      translationViewed: true, // Translation viewed
    };

    let pointsEarned: number = 0;
    await act(async () => {
      pointsEarned = await result.current.recordAttempt(attemptData);
    });

    expect(pointsEarned).toBe(0);
    expect(result.current.statistics?.globalStats.totalPoints).toBe(0);
  });

  it('should reset statistics and update state', async () => {
    const initialStats: UserStatistics = {
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
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(initialStats));
    mockAsyncStorage.setItem.mockResolvedValue();

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify initial state
    expect(result.current.statistics).toEqual(initialStats);

    // Mock reset result
    const defaultStats: UserStatistics = {
      words: {},
      globalStats: {
        totalPoints: 0,
        totalAttempts: 0,
        totalWords: 0,
        perfectCount: 0,
        lastSessionDate: '2025-11-11T10:00:00.000Z',
      },
    };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(defaultStats));

    // Reset statistics
    await act(async () => {
      await result.current.resetStats();
    });

    // Verify state was reset
    expect(result.current.statistics).toEqual(defaultStats);
  });

  it('should handle storage errors gracefully during load', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should fallback to defaults
    expect(result.current.statistics).toEqual({
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

  it('should handle storage errors gracefully during recordAttempt', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const attemptData: AttemptData = {
      wordId: 42,
      romaji: 'konnichiwa',
      level: 'N5',
      difficulty: 'Normal',
      isCorrect: true,
      startCount: 1,
      translationViewed: false,
    };

    // Should not throw on save error
    await act(async () => {
      await expect(result.current.recordAttempt(attemptData)).resolves.not.toThrow();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle storage errors gracefully during resetStats', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const initialStats: UserStatistics = {
      words: {},
      globalStats: {
        totalPoints: 0,
        totalAttempts: 0,
        totalWords: 0,
        perfectCount: 0,
        lastSessionDate: '2025-11-11T00:00:00.000Z',
      },
    };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(initialStats));
    mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should not throw on save error
    await act(async () => {
      await expect(result.current.resetStats()).resolves.not.toThrow();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should track multiple attempts for same word', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const attemptData: AttemptData = {
      wordId: 42,
      romaji: 'konnichiwa',
      level: 'N5',
      difficulty: 'Normal',
      isCorrect: true,
      startCount: 1,
      translationViewed: false,
    };

    // First attempt
    const firstStats: UserStatistics = {
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
          lastAttemptDate: '2025-11-11T10:00:00.000Z',
        },
      },
      globalStats: {
        totalPoints: 1,
        totalAttempts: 1,
        totalWords: 1,
        perfectCount: 1,
        lastSessionDate: '2025-11-11T10:00:00.000Z',
      },
    };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(firstStats));

    await act(async () => {
      await result.current.recordAttempt(attemptData);
    });

    expect(result.current.statistics?.words['42-N5-Normal'].totalAttempts).toBe(1);

    // Second attempt
    const secondStats: UserStatistics = {
      words: {
        '42-N5-Normal': {
          wordId: 42,
          romaji: 'konnichiwa',
          level: 'N5',
          difficulty: 'Normal',
          totalAttempts: 2,
          successCount: 2,
          failureCount: 0,
          perfectAttempts: 2,
          points: 2,
          lastAttemptDate: '2025-11-11T10:01:00.000Z',
        },
      },
      globalStats: {
        totalPoints: 2,
        totalAttempts: 2,
        totalWords: 1, // Still 1 word
        perfectCount: 2,
        lastSessionDate: '2025-11-11T10:01:00.000Z',
      },
    };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(secondStats));

    await act(async () => {
      await result.current.recordAttempt(attemptData);
    });

    expect(result.current.statistics?.words['42-N5-Normal'].totalAttempts).toBe(2);
    expect(result.current.statistics?.globalStats.totalWords).toBe(1); // Still 1 unique word
  });

  it('should provide functions in the returned object', () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useStatistics());

    expect(typeof result.current.recordAttempt).toBe('function');
    expect(typeof result.current.resetStats).toBe('function');
  });

  it('should update statistics immediately after recordAttempt completes', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialStats = result.current.statistics;

    const updatedStats: UserStatistics = {
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
          lastAttemptDate: '2025-11-11T10:00:00.000Z',
        },
      },
      globalStats: {
        totalPoints: 1,
        totalAttempts: 1,
        totalWords: 1,
        perfectCount: 1,
        lastSessionDate: '2025-11-11T10:00:00.000Z',
      },
    };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(updatedStats));

    const attemptData: AttemptData = {
      wordId: 42,
      romaji: 'konnichiwa',
      level: 'N5',
      difficulty: 'Normal',
      isCorrect: true,
      startCount: 1,
      translationViewed: false,
    };

    await act(async () => {
      await result.current.recordAttempt(attemptData);
    });

    // Verify state changed
    expect(result.current.statistics).not.toEqual(initialStats);
    expect(result.current.statistics).toEqual(updatedStats);
  });
});
