/**
 * Language Detection Utility
 * Detects device language and returns 'fr' or 'en' (default)
 */

import * as Localization from 'expo-localization';

/**
 * Detect device language
 * @returns 'fr' if device language is French, otherwise 'en'
 */
export function detectLanguage(): 'fr' | 'en' {
  const locale = Localization.getLocales()[0];

  // Check if language code starts with 'fr'
  if (locale?.languageCode?.startsWith('fr')) {
    return 'fr';
  }

  // Default to English
  return 'en';
}
