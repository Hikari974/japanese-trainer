import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Level } from '../components/LevelButton';
import type { Difficulty } from '../components/DifficultySelector';
import { detectLanguage } from '../utils/detectLanguage';

export interface UserPreferences {
  lastLevel: Level | null;
  lastDifficulty: Difficulty;
  wordsPerSession: number;           // Number of words per training session
  translationLanguage: 'fr' | 'en';  // Preferred translation language
  showFuriganaByDefault: boolean;    // Show furigana above kanji by default
}

const STORAGE_KEY = '@japanese_trainer:user_preferences';
const DEFAULT_PREFERENCES: UserPreferences = {
  lastLevel: null,
  lastDifficulty: 'Normal',
  wordsPerSession: 10,
  translationLanguage: 'fr',  // Will be overridden by detectLanguage() on first use
  showFuriganaByDefault: true,
};

/**
 * Load user preferences from local storage
 * Returns default preferences on first use or if data is corrupted
 * Auto-detects device language on first use
 */
export async function loadPreferences(): Promise<UserPreferences> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      // First use - detect device language and save preferences
      const detectedLanguage = detectLanguage();
      const firstTimePreferences = {
        ...DEFAULT_PREFERENCES,
        translationLanguage: detectedLanguage,
      };
      // Save detected preferences for future use
      await savePreferences(firstTimePreferences);
      return firstTimePreferences;
    }

    const parsed = JSON.parse(stored);

    // Validate structure and provide fallbacks for migration
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        lastLevel: parsed.lastLevel ?? DEFAULT_PREFERENCES.lastLevel,
        lastDifficulty: parsed.lastDifficulty ?? DEFAULT_PREFERENCES.lastDifficulty,
        wordsPerSession: parsed.wordsPerSession ?? DEFAULT_PREFERENCES.wordsPerSession,
        translationLanguage: parsed.translationLanguage ?? DEFAULT_PREFERENCES.translationLanguage,
        showFuriganaByDefault: parsed.showFuriganaByDefault ?? DEFAULT_PREFERENCES.showFuriganaByDefault,
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
