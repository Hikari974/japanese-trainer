import { useState } from 'react';
import { YStack, XStack, H1, Button, Text } from 'tamagui';
import { Link } from 'expo-router';
import { DifficultySelector, type Difficulty } from './components/DifficultySelector';
import { LevelButton, type Level } from './components/LevelButton';

const levels: Level[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];

export default function HomeScreen() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const handleLevelPress = (level: Level) => {
    setSelectedLevel(level);
    if (__DEV__) {
      console.log(`Selected: ${level} - ${difficulty}`);
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="$4"
        paddingVertical="$4"
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
      <DifficultySelector value={difficulty} onChange={setDifficulty} />

      {/* Level List */}
      <YStack flex={1} paddingHorizontal="$4" paddingTop="$4" paddingBottom="$4" gap="$2.5">
        {levels.map((level) => (
          <LevelButton
            key={level}
            level={level}
            isSelected={selectedLevel === level}
            onPress={() => handleLevelPress(level)}
          />
        ))}
      </YStack>
    </YStack>
  );
}
