/**
 * Word Selection Service
 * Handles complex logic for selecting words based on JLPT level and difficulty
 */

import type { JLPTLevel, DataLevel, DisplayWord, WordEntry, DisplayMode } from '../types/word';
import type { Difficulty } from '../components/DifficultySelector';
import { getWordsByLevel } from './wordLoader';

interface WordPool {
  level: DataLevel;
  words: WordEntry[];
  displayMode: DisplayMode;
}

/**
 * Build word pools based on user's selected level
 *
 * Selection rules:
 * - Kana: N5 words in kana only
 * - N5: N5 kanji+furigana + N4 kana
 * - N4: N5 kanji (no furigana) + N4 kanji+furigana + N3 kana
 * - N3: N4 kanji (no furigana) + N3 kanji+furigana + N2 kana
 * - N2: N3 kanji (no furigana) + N2 kanji+furigana + N1 kana
 * - N1: N2 kanji (no furigana) + N1 kanji+furigana
 */
function buildWordPools(level: JLPTLevel): WordPool[] {
  const pools: WordPool[] = [];

  switch (level) {
    case 'Kana':
      // Kana mode: N5 words in kana only
      pools.push({
        level: 'N5',
        words: getWordsByLevel('N5').words,
        displayMode: 'kana-only',
      });
      break;

    case 'N5':
      // N5 kanji with furigana + N4 kana
      pools.push(
        {
          level: 'N5',
          words: getWordsByLevel('N5').words,
          displayMode: 'kanji-with-furigana',
        },
        {
          level: 'N4',
          words: getWordsByLevel('N4').words,
          displayMode: 'kana-only',
        }
      );
      break;

    case 'N4':
      // N5 kanji without furigana + N4 kanji with furigana + N3 kana
      pools.push(
        {
          level: 'N5',
          words: getWordsByLevel('N5').words,
          displayMode: 'kanji-without-furigana',
        },
        {
          level: 'N4',
          words: getWordsByLevel('N4').words,
          displayMode: 'kanji-with-furigana',
        },
        {
          level: 'N3',
          words: getWordsByLevel('N3').words,
          displayMode: 'kana-only',
        }
      );
      break;

    case 'N3':
      // N4 kanji without furigana + N3 kanji with furigana + N2 kana
      pools.push(
        {
          level: 'N4',
          words: getWordsByLevel('N4').words,
          displayMode: 'kanji-without-furigana',
        },
        {
          level: 'N3',
          words: getWordsByLevel('N3').words,
          displayMode: 'kanji-with-furigana',
        },
        {
          level: 'N2',
          words: getWordsByLevel('N2').words,
          displayMode: 'kana-only',
        }
      );
      break;

    case 'N2':
      // N3 kanji without furigana + N2 kanji with furigana + N1 kana
      pools.push(
        {
          level: 'N3',
          words: getWordsByLevel('N3').words,
          displayMode: 'kanji-without-furigana',
        },
        {
          level: 'N2',
          words: getWordsByLevel('N2').words,
          displayMode: 'kanji-with-furigana',
        },
        {
          level: 'N1',
          words: getWordsByLevel('N1').words,
          displayMode: 'kana-only',
        }
      );
      break;

    case 'N1':
      // N2 kanji without furigana + N1 kanji with furigana
      pools.push(
        {
          level: 'N2',
          words: getWordsByLevel('N2').words,
          displayMode: 'kanji-without-furigana',
        },
        {
          level: 'N1',
          words: getWordsByLevel('N1').words,
          displayMode: 'kanji-with-furigana',
        }
      );
      break;
  }

  return pools;
}

/**
 * Transform WordEntry to DisplayWord based on display mode
 */
function toDisplayWord(
  word: WordEntry,
  displayMode: DisplayMode
): DisplayWord {
  switch (displayMode) {
    case 'kana-only':
      return {
        kanji: '',
        kana: word.kana,
        romaji: word.romaji,
        showFurigana: false,
        sourceLevel: word.level || 'N5',
      };

    case 'kanji-with-furigana':
      return {
        kanji: word.kanji || word.kana,
        kana: word.kana,
        romaji: word.romaji,
        showFurigana: true,
        sourceLevel: word.level || 'N5',
      };

    case 'kanji-without-furigana':
      return {
        kanji: word.kanji || word.kana,
        kana: word.kana,
        romaji: word.romaji,
        showFurigana: false,
        sourceLevel: word.level || 'N5',
      };
  }
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * O(n) time complexity, unbiased shuffle
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Main function: Get words for training session
 *
 * @param level - User's selected JLPT level
 * @param difficulty - Affects speed/window in ScrollingText, not word selection
 * @param count - Number of words to return (from user preferences)
 * @returns Array of DisplayWord ready for training
 */
export function getWordsForTraining(
  level: JLPTLevel,
  difficulty: Difficulty,
  count: number
): DisplayWord[] {
  // Build word pools based on level
  const pools = buildWordPools(level);

  // Flatten all pools into one array
  const allWords: DisplayWord[] = pools.flatMap(pool =>
    pool.words.map(word => toDisplayWord(word, pool.displayMode))
  );

  // Shuffle and take requested count
  const shuffled = shuffle(allWords);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get available word count for a level
 * Useful for displaying stats or validating count parameter
 */
export function getAvailableWordCount(level: JLPTLevel): number {
  const pools = buildWordPools(level);
  return pools.reduce((total, pool) => total + pool.words.length, 0);
}
