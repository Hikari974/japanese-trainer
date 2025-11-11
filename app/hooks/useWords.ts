/**
 * useWords Hook
 * Custom React hook for loading words for training sessions
 */

import { useState, useEffect } from 'react';
import type { JLPTLevel, DisplayWord } from '../types/word';
import type { Difficulty } from '../components/DifficultySelector';
import { getWordsForTraining } from '../services/wordSelection';

interface UseWordsOptions {
  level: JLPTLevel;
  difficulty: Difficulty;
  count: number;
}

interface UseWordsReturn {
  words: DisplayWord[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to load and manage words for training
 *
 * @param options - Configuration for word selection
 * @returns Words array, loading state, and error
 *
 * @example
 * const { words, isLoading } = useWords({
 *   level: 'N5',
 *   difficulty: 'Normal',
 *   count: 10
 * });
 */
export function useWords({
  level,
  difficulty,
  count,
}: UseWordsOptions): UseWordsReturn {
  const [words, setWords] = useState<DisplayWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const selectedWords = getWordsForTraining(level, difficulty, count);
      setWords(selectedWords);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to load words');
      setError(errorMessage);
      setWords([]);

      if (__DEV__) {
        console.error('useWords error:', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [level, difficulty, count]);

  return { words, isLoading, error };
}
