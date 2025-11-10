import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadPreferences, savePreferences, type UserPreferences } from '../preferences';

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('preferences service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadPreferences', () => {
    it('should return default preferences on first use (null)', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const prefs = await loadPreferences();

      expect(prefs).toEqual({
        lastLevel: null,
        lastDifficulty: 'Normal',
      });
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@japanese_trainer:user_preferences');
    });

    it('should load valid preferences correctly', async () => {
      const validPrefs: UserPreferences = {
        lastLevel: 'N3',
        lastDifficulty: 'Difficile',
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(validPrefs));

      const prefs = await loadPreferences();

      expect(prefs).toEqual(validPrefs);
    });

    it('should use defaults for missing fields in stored preferences', async () => {
      const partialPrefs = { lastLevel: 'N5' };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(partialPrefs));

      const prefs = await loadPreferences();

      expect(prefs).toEqual({
        lastLevel: 'N5',
        lastDifficulty: 'Normal', // fallback to default
      });
    });

    it('should handle corrupted JSON and return defaults', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{ invalid json }');

      const prefs = await loadPreferences();

      expect(prefs).toEqual({
        lastLevel: null,
        lastDifficulty: 'Normal',
      });
    });

    it('should handle non-object JSON and return defaults', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify('string value'));

      const prefs = await loadPreferences();

      expect(prefs).toEqual({
        lastLevel: null,
        lastDifficulty: 'Normal',
      });
    });

    it('should handle null JSON and return defaults', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(null));

      const prefs = await loadPreferences();

      expect(prefs).toEqual({
        lastLevel: null,
        lastDifficulty: 'Normal',
      });
    });

    it('should handle AsyncStorage error and return defaults', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const prefs = await loadPreferences();

      expect(prefs).toEqual({
        lastLevel: null,
        lastDifficulty: 'Normal',
      });

      consoleWarnSpy.mockRestore();
    });
  });

  describe('savePreferences', () => {
    it('should save complete preferences correctly', async () => {
      const existingPrefs: UserPreferences = {
        lastLevel: 'Kana',
        lastDifficulty: 'Facile',
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingPrefs));

      const newPrefs: UserPreferences = {
        lastLevel: 'N5',
        lastDifficulty: 'Normal',
      };

      await savePreferences(newPrefs);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@japanese_trainer:user_preferences',
        JSON.stringify(newPrefs)
      );
    });

    it('should merge partial preferences with existing ones', async () => {
      const existingPrefs: UserPreferences = {
        lastLevel: 'N3',
        lastDifficulty: 'Normal',
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingPrefs));

      await savePreferences({ lastLevel: 'N2' });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@japanese_trainer:user_preferences',
        JSON.stringify({
          lastLevel: 'N2',
          lastDifficulty: 'Normal', // preserved
        })
      );
    });

    it('should merge with defaults when no existing preferences', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await savePreferences({ lastLevel: 'N4' });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@japanese_trainer:user_preferences',
        JSON.stringify({
          lastLevel: 'N4',
          lastDifficulty: 'Normal', // default
        })
      );
    });

    it('should handle AsyncStorage error silently', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(savePreferences({ lastLevel: 'N1' })).resolves.not.toThrow();

      consoleErrorSpy.mockRestore();
    });

    it('should save only lastDifficulty when provided', async () => {
      const existingPrefs: UserPreferences = {
        lastLevel: 'N3',
        lastDifficulty: 'Normal',
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingPrefs));

      await savePreferences({ lastDifficulty: 'Extrême' });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@japanese_trainer:user_preferences',
        JSON.stringify({
          lastLevel: 'N3', // preserved
          lastDifficulty: 'Extrême',
        })
      );
    });
  });
});
