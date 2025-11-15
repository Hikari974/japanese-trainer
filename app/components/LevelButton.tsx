import { Button, YStack, XStack, Text } from 'tamagui';
import { ProgressBar } from './ProgressBar';
import type { LevelProgress } from '../types/statistics';
import type { JLPTLevel } from '../types/word';

export type Level = JLPTLevel;

interface LevelButtonProps {
  level: Level;
  isSelected: boolean;
  isLocked: boolean;
  progress?: LevelProgress;
  onPress: () => void;
}

const levelColors = {
  Kana: '$levelKana',
  N5: '$levelN5',
  N4: '$levelN4',
  N3: '$levelN3',
  N2: '$levelN2',
  N1: '$levelN1',
};

const JLPT_LEVEL_ORDER: readonly JLPTLevel[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'] as const;

/**
 * Get the name of the previous level in the sequential order
 * Used to display "Complete X to unlock" message
 */
function getPreviousLevelName(level: Level): string {
  const currentIndex = JLPT_LEVEL_ORDER.indexOf(level);
  if (currentIndex <= 0) {
    return '';
  }
  return JLPT_LEVEL_ORDER[currentIndex - 1];
}

export function LevelButton({ level, isSelected, isLocked, progress, onPress }: LevelButtonProps) {
  const color = levelColors[level];
  const isCompleted = progress?.percentage === 100;

  // Determine icon based on state
  const icon = isLocked ? '🔒' : isCompleted ? '✅' : null;

  // Build accessibility label
  const accessibilityLabel = isLocked
    ? `Niveau ${level}, verrouillé, complétez ${getPreviousLevelName(level)} pour déverrouiller`
    : `Niveau ${level}, déverrouillé, ${progress?.percentage ?? 0}% complété`;

  return (
    <Button
      onPress={onPress}
      disabled={isLocked}
      height={isLocked ? 66 : 80}
      backgroundColor={isSelected ? '$backgroundHover' : '$backgroundHover'}
      borderWidth={isSelected ? 2 : 0}
      borderColor={isSelected ? color : 'transparent'}
      borderRadius="$6"
      opacity={isLocked ? 0.4 : 1.0}
      pressStyle={
        isLocked
          ? {}
          : {
              scale: 0.98,
              backgroundColor: '$backgroundPress',
            }
      }
      animation="quick"
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled: isLocked }}
    >
      <YStack justifyContent="center" alignItems="flex-start" width="100%" paddingHorizontal="$3" gap="$1">
        {/* Header: Icon + Level Name + Percentage */}
        <XStack justifyContent="space-between" alignItems="center" width="100%">
          <XStack gap="$2" alignItems="center">
            {icon && (
              <Text fontSize={18} lineHeight={18}>
                {icon}
              </Text>
            )}
            <Text
              fontSize={22}
              fontWeight={isSelected ? '700' : '600'}
              color={isSelected ? color : '$darkTextSecondary'}
              letterSpacing={0.5}
            >
              {level}
            </Text>
          </XStack>

          {!isLocked && progress && (
            <Text fontSize={14} fontWeight="600" color="$gray11">
              {Math.round(progress.percentage)}%
            </Text>
          )}
        </XStack>

        {/* Progress Text or Lock Message */}
        {isLocked ? (
          <Text fontSize={12} color="$gray10">
            Complétez {getPreviousLevelName(level)} pour déverrouiller
          </Text>
        ) : progress ? (
          <Text fontSize={12} color="$gray10">
            {progress.masteredWords}/{progress.totalWords} mots ({Math.round(progress.percentage)}%)
          </Text>
        ) : null}

        {/* Progress Bar (only for unlocked levels) */}
        {!isLocked && progress && (
          <ProgressBar
            value={progress.percentage}
            height={4}
            color={isCompleted ? '$green10' : color}
            backgroundColor="$gray5"
          />
        )}
      </YStack>
    </Button>
  );
}
