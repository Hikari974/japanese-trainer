import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Level } from '../components/LevelButton';
import type { Difficulty } from '../components/DifficultySelector';

export interface UserPreferences {
  lastLevel: Level | null;
  lastDifficulty: Difficulty;
  wordsPerSession: number;           // Number of words per training session
  translationLanguage: 'fr' | 'en';  // Preferred translation language
}

const STORAGE_KEY = '@japanese_trainer:user_preferences';
const DEFAULT_PREFERENCES: UserPreferences = {
  lastLevel: null,
  lastDifficulty: 'Normal',
  wordsPerSession: 10,
  translationLanguage: 'fr',
};

/**
 * Load user preferences from local storage
 * Returns default preferences on first use or if data is corrupted
 */
export async function loadPreferences(): Promise<UserPreferences> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      // First use - return defaults
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(stored);

    // Validate structure and provide fallbacks
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        lastLevel: parsed.lastLevel ?? DEFAULT_PREFERENCES.lastLevel,
        lastDifficulty: parsed.lastDifficulty ?? DEFAULT_PREFERENCES.lastDifficulty,
        wordsPerSession: parsed.wordsPerSession ?? DEFAULT_PREFERENCES.wordsPerSession,
        translationLanguage: parsed.translationLanguage ?? DEFAULT_PREFERENCES.translationLanguage,
      };
    }

    return DEFAULT_PREFERENCES;
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to load preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save user preferences to local storage
 * Merges with existing preferences
 */
export async function savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
  try {
    const current = await loadPreferences();
    const updated = { ...current, ...prefs };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to save preferences:', error);
    }
  }
}
