import { useState, useEffect } from 'react';
import { YStack, XStack, H1, Button, Text } from 'tamagui';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DifficultySelector, type Difficulty } from './components/DifficultySelector';
import { LevelButton, type Level } from './components/LevelButton';
import { usePreferences } from './hooks/usePreferences';
import { useStatistics } from './hooks/useStatistics';
import type { LevelProgress } from './types/statistics';

const levels: Level[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];

// Level colors matching LevelButton
const levelColors: Record<Level, string> = {
  Kana: '$levelKana',
  N5: '$levelN5',
  N4: '$levelN4',
  N3: '$levelN3',
  N2: '$levelN2',
  N1: '$levelN1',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { preferences, isLoading, updatePreferences } = usePreferences();
  const { calculateProgress, getUnlockedLevels, registerUnlockCallback } = useStatistics();
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState<Level[]>(['Kana']);
  const [levelsProgress, setLevelsProgress] = useState<Map<Level, LevelProgress>>(new Map());
  const [isLoadingLevels, setIsLoadingLevels] = useState(true);

  // Load level states (unlock status + progression) on mount
  useEffect(() => {
    async function loadLevelStates() {
      setIsLoadingLevels(true);
      try {
        // Get unlock status
        const unlocked = await getUnlockedLevels();
        setUnlockedLevels(unlocked);

        // Get progression for all levels
        const progressMap = new Map<Level, LevelProgress>();
        for (const level of levels) {
          const progress = await calculateProgress(level);
          progressMap.set(level, progress);
        }
        setLevelsProgress(progressMap);

        if (__DEV__) {
          console.log('Levels loaded:', { unlocked, progressMap });
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Failed to load level states:', error);
        }
      } finally {
        setIsLoadingLevels(false);
      }
    }

    loadLevelStates();
  }, [calculateProgress, getUnlockedLevels]);

  // Register event listener for auto-unlock events (from US-006.3)
  useEffect(() => {
    const unregister = registerUnlockCallback((event) => {
      if (__DEV__) {
        console.log(`🎉 Level ${event.level} unlocked!`);
      }

      // Refresh level states when a new level is unlocked
      async function refreshLevels() {
        const unlocked = await getUnlockedLevels();
        setUnlockedLevels(unlocked);

        // Also refresh progression for all levels
        const progressMap = new Map<Level, LevelProgress>();
        for (const level of levels) {
          const progress = await calculateProgress(level);
          progressMap.set(level, progress);
        }
        setLevelsProgress(progressMap);
      }

      refreshLevels();
    });

    return unregister; // Cleanup on unmount
  }, [registerUnlockCallback, getUnlockedLevels, calculateProgress]);

  // Load saved preferences on mount
  useEffect(() => {
    if (preferences && !isLoading) {
      setDifficulty(preferences.lastDifficulty);
      setSelectedLevel(preferences.lastLevel);
      if (__DEV__) {
        console.log('Preferences loaded:', preferences);
      }
    }
  }, [preferences, isLoading]);

  const handleLevelPress = (level: Level) => {
    // Check if level is locked
    const isLocked = !unlockedLevels.includes(level);
    if (isLocked) {
      if (__DEV__) {
        console.log(`Cannot select locked level: ${level}`);
      }
      return; // Don't allow selection of locked levels
    }

    setSelectedLevel(level);
    // Save preference immediately
    updatePreferences({ lastLevel: level });
    if (__DEV__) {
      console.log(`Level saved: ${level}`);
    }
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    // Save preference immediately
    updatePreferences({ lastDifficulty: newDifficulty });
    if (__DEV__) {
      console.log(`Difficulty saved: ${newDifficulty}`);
    }
  };

  const handleStartSession = async () => {
    if (selectedLevel) {
      // Save preferences before navigation
      await updatePreferences({
        lastLevel: selectedLevel,
        lastDifficulty: difficulty,
      });

      router.push({
        pathname: '/training',
        params: { level: selectedLevel, difficulty },
      });
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingTop={insets.top + 16}
        paddingHorizontal="$4"
        paddingBottom="$4"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        {/* Stats Link */}
        <Link href="/stats" asChild>
          <Button size="$3" chromeless accessibilityLabel="Voir les statistiques">
            <Text fontSize={18}>📊</Text>
          </Button>
        </Link>

        {/* Title */}
        <H1 fontSize={24} color="$color" fontWeight="bold">
          日本語 Trainer
        </H1>

        {/* Settings & POC */}
        <XStack gap="$2">
          <Link href="/poc-scroll" asChild>
            <Button size="$3" chromeless accessibilityLabel="Tester le POC">
              <Text fontSize={16}>🧪</Text>
            </Button>
          </Link>
          <Link href="/settings" asChild>
            <Button size="$3" chromeless accessibilityLabel="Paramètres">
              <Text fontSize={18}>⚙️</Text>
            </Button>
          </Link>
        </XStack>
      </XStack>

      {/* Difficulty Selector */}
      <DifficultySelector value={difficulty} onChange={handleDifficultyChange} />

      {/* Level List */}
      <YStack flex={1} paddingHorizontal="$4" paddingTop="$4" gap="$2.5">
        {isLoadingLevels ? (
          <Text textAlign="center" color="$gray11" paddingTop="$8">
            Chargement des niveaux...
          </Text>
        ) : (
          levels.map((level) => {
            const isLocked = !unlockedLevels.includes(level);
            const progress = levelsProgress.get(level);

            return (
              <LevelButton
                key={level}
                level={level}
                isSelected={selectedLevel === level}
                isLocked={isLocked}
                progress={progress}
                onPress={() => handleLevelPress(level)}
              />
            );
          })
        )}
      </YStack>

      {/* Start Session Button */}
      <YStack paddingHorizontal="$4" paddingBottom={insets.bottom + 16}>
        <Button
          size="$5"
          backgroundColor={selectedLevel ? levelColors[selectedLevel] : '$backgroundHover'}
          disabled={!selectedLevel}
          onPress={handleStartSession}
          pressStyle={{ opacity: 0.8, scale: 0.98 }}
          disabledStyle={{ opacity: 0.4 }}
          accessibilityLabel="Commencer la session"
          accessibilityState={{ disabled: !selectedLevel }}
        >
          <Text fontSize={18} fontWeight="bold" color={selectedLevel ? '$background' : '$colorTranslucent'}>
            Commencer la session
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
}
