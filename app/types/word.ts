/**
 * JLPT levels available in the app
 * - Kana: Uses N5 words but displays only kana (no kanji)
 * - N5-N1: JLPT levels with progressive difficulty
 */
export type JLPTLevel = 'Kana' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

/**
 * Data file levels (actual JSON files)
 * No separate Kana file - Kana mode uses N5 data
 */
export type DataLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

/**
 * Word entry structure in JSON files
 */
export interface WordEntry {
  id: number;
  kanji: string;      // Kanji form (can be empty for kana-only words)
  kana: string;       // Hiragana/Katakana reading (always present)
  romaji: string;     // Romanization for validation
  translations: {
    fr: string;       // French translation
    en: string;       // English translation
    // Extensible for future languages: es, de, etc.
  };
}

/**
 * Word list structure (root of JSON files)
 */
export interface WordList {
  level: DataLevel;
  version: string;    // Version tracking (e.g., "1.0.0")
  words: WordEntry[];
}

/**
 * Display mode for a word pool
 */
export type DisplayMode =
  | 'kana-only'                // Show only kana (no kanji)
  | 'kanji-with-furigana'      // Show kanji with furigana above
  | 'kanji-without-furigana';  // Show kanji without furigana

/**
 * Word prepared for display in training session
 */
export interface DisplayWord {
  kanji: string;          // Kanji to display (empty if kana-only mode)
  kana: string;           // Kana reading
  romaji: string;         // For validation
  showFurigana: boolean;  // Whether to show furigana above kanji
  sourceLevel: DataLevel; // Original level (for stats/debugging)
}
