import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import type { JLPTLevel } from '../types/word';
import type { LevelUnlockEvent } from '../types/statistics';

// Level order for navigation
const LEVEL_ORDER: JLPTLevel[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];

/**
 * Hook to listen for level unlock events and manage unlock modal state
 * Integrates with US-006.3 registerUnlockCallback
 */
export function useLevelUnlockListener(registerUnlockCallback: (callback: (event: LevelUnlockEvent) => void) => () => void) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState<JLPTLevel | null>(null);
  const [previousLevel, setPreviousLevel] = useState<JLPTLevel | null>(null);

  // Listen to unlock events
  useEffect(() => {
    const unregister = registerUnlockCallback((event) => {
      if (__DEV__) {
        console.log(`🎉 Level unlock event received: ${event.level}`);
      }

      // Calculate previous level
      const levelIndex = LEVEL_ORDER.indexOf(event.level);
      const prevLevel = levelIndex > 0 ? LEVEL_ORDER[levelIndex - 1] : null;

      setUnlockedLevel(event.level);
      setPreviousLevel(prevLevel);
      setIsModalOpen(true);
    });

    return unregister; // Cleanup on unmount
  }, [registerUnlockCallback]);

  // Handle "Start Training" button
  const handleStartTraining = useCallback(() => {
    if (unlockedLevel) {
      setIsModalOpen(false);

      // Navigate to training page with unlocked level
      setTimeout(() => {
        router.push({
          pathname: '/training',
          params: { level: unlockedLevel, difficulty: 'Normal' },
        });
      }, 300); // Small delay for smooth modal close animation
    }
  }, [unlockedLevel, router]);

  // Handle modal dismiss
  const handleDismiss = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    isModalOpen,
    unlockedLevel,
    previousLevel,
    handleStartTraining,
    handleDismiss,
  };
}
