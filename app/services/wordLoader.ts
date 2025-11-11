/**
 * Word Loader Service
 * Loads and caches JLPT word lists from JSON files
 */

import type { WordList, DataLevel } from '../types/word';

// Static imports of JSON files for optimal performance
import n5Data from '../data/words/n5.json';
import n4Data from '../data/words/n4.json';
import n3Data from '../data/words/n3.json';
import n2Data from '../data/words/n2.json';
import n1Data from '../data/words/n1.json';

/**
 * In-memory cache of all word lists
 * Loaded once at app startup for instant access
 */
const wordCache: Record<DataLevel, WordList> = {
  N5: n5Data as WordList,
  N4: n4Data as WordList,
  N3: n3Data as WordList,
  N2: n2Data as WordList,
  N1: n1Data as WordList,
};

/**
 * Get words for a specific JLPT level
 * Returns cached data (synchronous, no async needed)
 *
 * @param level - JLPT level (N5, N4, N3, N2, N1)
 * @returns WordList with all words for the level
 */
export function getWordsByLevel(level: DataLevel): WordList {
  const wordList = wordCache[level];

  if (!wordList) {
    throw new Error(`Word list not found for level: ${level}`);
  }

  return wordList;
}

/**
 * Get total word count across all levels
 * @returns Total number of words available
 */
export function getTotalWordCount(): number {
  return Object.values(wordCache).reduce(
    (total, list) => total + list.words.length,
    0
  );
}

/**
 * Get word count for a specific level
 * @param level - JLPT level
 * @returns Number of words in the level
 */
export function getWordCountForLevel(level: DataLevel): number {
  return getWordsByLevel(level).words.length;
}
