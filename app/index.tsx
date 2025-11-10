import { useState, useEffect } from 'react';
import { YStack, XStack, H1, Button, Text } from 'tamagui';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DifficultySelector, type Difficulty } from './components/DifficultySelector';
import { LevelButton, type Level } from './components/LevelButton';
import { usePreferences } from './hooks/usePreferences';

const levels: Level[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { preferences, isLoading, updatePreferences } = usePreferences();
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

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
        {levels.map((level) => (
          <LevelButton
            key={level}
            level={level}
            isSelected={selectedLevel === level}
            onPress={() => handleLevelPress(level)}
          />
        ))}
      </YStack>

      {/* Start Session Button */}
      <YStack paddingHorizontal="$4" paddingBottom={insets.bottom + 16}>
        <Button
          size="$5"
          backgroundColor={selectedLevel ? '$levelN3' : '$backgroundHover'}
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
