import { renderHook, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePreferences } from '../usePreferences';
import type { UserPreferences } from '../../services/preferences';

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('usePreferences hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state and null preferences', () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => usePreferences());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.preferences).toBe(null);
  });

  it('should load preferences on mount and update state', async () => {
    const storedPrefs: UserPreferences = {
      lastLevel: 'N3',
      lastDifficulty: 'Difficile',
      wordsPerSession: 10,
      translationLanguage: 'en',
    };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedPrefs));

    const { result } = renderHook(() => usePreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.preferences).toEqual(storedPrefs);
  });

  it('should load default preferences on first use', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => usePreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.preferences).toEqual({
      lastLevel: null,
      lastDifficulty: 'Normal',
      wordsPerSession: 10,
      translationLanguage: 'en',
    });
  });

  it('should update preferences optimistically and save to storage', async () => {
    const initialPrefs: UserPreferences = {
      lastLevel: 'N5',
      lastDifficulty: 'Normal',
      wordsPerSession: 10,
      translationLanguage: 'en',
    };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(initialPrefs));
    mockAsyncStorage.setItem.mockResolvedValue();

    const { result } = renderHook(() => usePreferences());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Update preferences
    await act(async () => {
      await result.current.updatePreferences({ lastLevel: 'N4' });
    });

    // Check optimistic update
    expect(result.current.preferences).toEqual({
      lastLevel: 'N4',
      lastDifficulty: 'Normal',
      wordsPerSession: 10,
      translationLanguage: 'en',
    });

    // Check storage was called
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      '@japanese_trainer:user_preferences',
      JSON.stringify({
        lastLevel: 'N4',
        lastDifficulty: 'Normal',
        wordsPerSession: 10,
        translationLanguage: 'en',
      })
    );
  });

  it('should update only difficulty when provided', async () => {
    const initialPrefs: UserPreferences = {
      lastLevel: 'N3',
      lastDifficulty: 'Normal',
      wordsPerSession: 10,
      translationLanguage: 'en',
    };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(initialPrefs));
    mockAsyncStorage.setItem.mockResolvedValue();

    const { result } = renderHook(() => usePreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updatePreferences({ lastDifficulty: 'Extrême' });
    });

    expect(result.current.preferences).toEqual({
      lastLevel: 'N3',
      lastDifficulty: 'Extrême',
      wordsPerSession: 10,
      translationLanguage: 'en',
    });
  });

  it('should not call updatePreferences if preferences is null', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => usePreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Manually set preferences to null to test edge case
    const { result: result2 } = renderHook(() => {
      const hook = usePreferences();
      return { ...hook, preferences: null };
    });

    // Attempt update with null preferences - should not throw
    await act(async () => {
      await result2.current.updatePreferences({ lastLevel: 'N1' });
    });

    // setItem should not have been called for updatePreferences since preferences was null
    expect(mockAsyncStorage.setItem).not.toHaveBeenCalledWith(
      '@japanese_trainer:user_preferences',
      expect.stringContaining('N1')
    );
  });

  it('should handle storage errors gracefully during load', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => usePreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should fallback to defaults
    expect(result.current.preferences).toEqual({
      lastLevel: null,
      lastDifficulty: 'Normal',
      wordsPerSession: 10,
      translationLanguage: 'en',
    });

    consoleWarnSpy.mockRestore();
  });

  it('should handle storage errors gracefully during save', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const initialPrefs: UserPreferences = {
      lastLevel: 'N5',
      lastDifficulty: 'Normal',
      wordsPerSession: 10,
      translationLanguage: 'en',
    };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(initialPrefs));
    mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => usePreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should not throw on save error
    await act(async () => {
      await expect(
        result.current.updatePreferences({ lastLevel: 'N4' })
      ).resolves.not.toThrow();
    });

    // Optimistic update should still have happened
    expect(result.current.preferences).toEqual({
      lastLevel: 'N4',
      lastDifficulty: 'Normal',
      wordsPerSession: 10,
      translationLanguage: 'en',
    });

    consoleErrorSpy.mockRestore();
  });

  it('should update both level and difficulty at once', async () => {
    const initialPrefs: UserPreferences = {
      lastLevel: 'Kana',
      lastDifficulty: 'Facile',
      wordsPerSession: 10,
      translationLanguage: 'en',
    };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(initialPrefs));
    mockAsyncStorage.setItem.mockResolvedValue();

    const { result } = renderHook(() => usePreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updatePreferences({
        lastLevel: 'N1',
        lastDifficulty: 'Extrême',
      });
    });

    expect(result.current.preferences).toEqual({
      lastLevel: 'N1',
      lastDifficulty: 'Extrême',
      wordsPerSession: 10,
      translationLanguage: 'en',
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      '@japanese_trainer:user_preferences',
      JSON.stringify({
        lastLevel: 'N1',
        lastDifficulty: 'Extrême',
        wordsPerSession: 10,
        translationLanguage: 'en',
      })
    );
  });
});
