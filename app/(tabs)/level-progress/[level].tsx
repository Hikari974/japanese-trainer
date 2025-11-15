import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { YStack, Text } from 'tamagui';
import { LevelProgressView } from '../../components/LevelProgressView';
import type { JLPTLevel } from '../../types/word';

const VALID_LEVELS: JLPTLevel[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];

/**
 * Route wrapper for level progress screen
 * Path: /level-progress/[level]
 * Example: /level-progress/n5
 */
export default function LevelProgressScreen() {
  const { level } = useLocalSearchParams<{ level: string }>();
  const router = useRouter();

  // Validate and convert level parameter (normalize to proper case)
  const normalizedLevel = (level === 'kana' ? 'Kana' : level?.toUpperCase()) as JLPTLevel;
  const isValidLevel = normalizedLevel && VALID_LEVELS.includes(normalizedLevel);

  // Redirect to home if invalid level
  useEffect(() => {
    if (!isValidLevel) {
      if (__DEV__) {
        console.error(`Invalid level parameter: ${level}`);
      }
      router.replace('/');
    }
  }, [isValidLevel, level, router]);

  // Show error state while redirecting
  if (!isValidLevel) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text color="$gray11">Niveau invalide, redirection...</Text>
      </YStack>
    );
  }

  return <LevelProgressView level={normalizedLevel} />;
}
