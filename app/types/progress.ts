import type { JLPTLevel } from './word';

/**
 * Filter modes for word progress list
 */
export type FilterMode = 'all' | 'mastered' | 'in-progress' | 'not-started';

/**
 * Sort modes for word progress list
 */
export type SortMode = 'points-desc' | 'points-asc' | 'alphabetical' | 'recent';

/**
 * Aggregated progress data for a single word across all difficulties
 * Combines statistics from Facile, Normal, Difficile, and Extrême
 */
export interface WordProgress {
  /**
   * Unique word identifier
   */
  wordId: number;

  /**
   * Japanese kanji representation
   */
  kanji: string;

  /**
   * Japanese kana representation
   */
  kana: string;

  /**
   * Romanized representation
   */
  romaji: string;

  /**
   * Total points earned across all difficulties
   * Sum of points from Facile + Normal + Difficile + Extrême
   */
  totalPoints: number;

  /**
   * Total validation attempts across all difficulties
   */
  totalAttempts: number;

  /**
   * Total successful validations across all difficulties
   */
  successCount: number;

  /**
   * Total perfect attempts (correct + startCount===1 + !showTranslation)
   * across all difficulties
   */
  perfectAttempts: number;

  /**
   * Whether this word is mastered (>= 5 total points)
   */
  isMastered: boolean;

  /**
   * Success rate as percentage (0-100)
   * Calculated as: (successCount / totalAttempts) * 100
   */
  successRate: number;

  /**
   * ISO 8601 timestamp of most recent attempt across all difficulties
   * Undefined if word has never been attempted
   */
  lastAttemptDate?: string;
}

/**
 * Summary statistics for a JLPT level
 */
export interface LevelStatsSummary {
  /**
   * JLPT level identifier
   */
  level: JLPTLevel;

  /**
   * Total words available in this level
   */
  totalWords: number;

  /**
   * Words with >= 5 total points (mastered)
   */
  masteredWords: number;

  /**
   * Words with 1-4 total points (in progress)
   */
  inProgressWords: number;

  /**
   * Words with 0 attempts (not started)
   */
  notStartedWords: number;

  /**
   * Mastery percentage (masteredWords / totalWords * 100)
   */
  masteryPercentage: number;
}
