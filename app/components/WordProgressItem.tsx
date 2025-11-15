import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { ProgressBar } from './ProgressBar';
import type { WordProgress } from '../types/progress';

export interface WordProgressItemProps {
  /**
   * Word progress data to display
   */
  wordProgress: WordProgress;
}

/**
 * Displays a single word's progress in a list
 * Shows word (kanji/kana/romaji), status icon, points, attempts, and mini progress bar
 * Memoized to prevent unnecessary re-renders in large lists
 */
function WordProgressItemComponent({ wordProgress }: WordProgressItemProps) {
  // Determine status icon based on mastery state
  const statusIcon = wordProgress.isMastered
    ? '✅'
    : wordProgress.totalAttempts > 0
    ? '🔄'
    : '⚪';

  // Determine status text
  const statusText = wordProgress.isMastered
    ? 'Maîtrisé'
    : wordProgress.totalAttempts > 0
    ? 'En cours'
    : 'Non démarré';

  // Clamp points to 0-5 range for progress bar
  const progressValue = Math.min(wordProgress.totalPoints, 5) * 20; // 0-100%

  return (
    <YStack
      backgroundColor="$backgroundHover"
      borderRadius="$4"
      padding="$3"
      gap="$2"
      marginBottom="$2"
      accessibilityLabel={`${wordProgress.romaji}, ${statusText}, ${wordProgress.totalPoints} points`}
      accessibilityRole="button"
    >
      {/* Header: Word + Status Icon */}
      <XStack justifyContent="space-between" alignItems="center">
        <YStack gap="$1" flex={1}>
          {/* Kanji */}
          <Text fontSize={18} fontWeight="600" color="$color">
            {wordProgress.kanji}
          </Text>

          {/* Kana + Romaji */}
          <XStack gap="$2" alignItems="center">
            <Text fontSize={14} color="$gray11">
              {wordProgress.kana}
            </Text>
            <Text fontSize={12} color="$gray10">
              · {wordProgress.romaji}
            </Text>
          </XStack>
        </YStack>

        {/* Status Icon */}
        <Text fontSize={20} lineHeight={20}>
          {statusIcon}
        </Text>
      </XStack>

      {/* Stats Row */}
      <XStack justifyContent="space-between" alignItems="center">
        {/* Points */}
        <Text fontSize={12} color="$gray11" fontWeight="600">
          {wordProgress.totalPoints}/5 points
        </Text>

        {/* Attempts + Success Rate */}
        {wordProgress.totalAttempts > 0 && (
          <Text fontSize={12} color="$gray10">
            {wordProgress.totalAttempts} tentative{wordProgress.totalAttempts > 1 ? 's' : ''} · {wordProgress.successRate}% réussite
          </Text>
        )}
      </XStack>

      {/* Mini Progress Bar (0-5 points) */}
      <ProgressBar
        value={progressValue}
        height={4}
        color={wordProgress.isMastered ? '$green10' : '$blue10'}
        backgroundColor="$gray5"
      />
    </YStack>
  );
}

/**
 * Memoized version to prevent re-renders when parent re-renders
 * Only re-renders if wordProgress changes
 */
export const WordProgressItem = React.memo(WordProgressItemComponent);
