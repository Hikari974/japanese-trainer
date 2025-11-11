import type { JLPTLevel } from './word';
import type { Difficulty } from '../components/DifficultySelector';

/**
 * Statistics for a specific word at a specific level/difficulty combination
 * Each word can have different stats for different level/difficulty pairs
 * Example: Word ID 42 can have separate stats for N5-Normal and N5-Difficile
 */
export interface WordStatistic {
  wordId: number;              // Unique word ID from WordEntry
  romaji: string;              // Romaji for display/debugging
  level: JLPTLevel;            // 'Kana' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  difficulty: Difficulty;      // 'Facile' | 'Normal' | 'Difficile' | 'Extrême'
  totalAttempts: number;       // Total validation attempts
  successCount: number;        // Times validated as correct
  failureCount: number;        // Times validated as incorrect
  perfectAttempts: number;     // Correct + startCount===1 + !showTranslation
  points: number;              // Total points earned (= perfectAttempts)
  lastAttemptDate: string;     // ISO timestamp of last attempt
}

/**
 * Global statistics across all words
 */
export interface GlobalStatistics {
  totalPoints: number;         // Total points across all words
  totalAttempts: number;       // All validation attempts
  totalWords: number;          // Unique words attempted (distinct word IDs)
  perfectCount: number;        // Total perfect attempts across all words
  lastSessionDate: string;     // ISO timestamp of last training session
}

/**
 * User statistics structure stored in AsyncStorage
 */
export interface UserStatistics {
  words: Record<string, WordStatistic>;  // Key: "${wordId}-${level}-${difficulty}"
  globalStats: GlobalStatistics;
}

/**
 * Data passed to recordAttempt() to update statistics
 */
export interface AttemptData {
  wordId: number;
  romaji: string;
  level: JLPTLevel;
  difficulty: Difficulty;
  isCorrect: boolean;
  startCount: number;           // Number of times "Start" button was clicked
  translationViewed: boolean;   // Whether translation toggle was clicked
}
