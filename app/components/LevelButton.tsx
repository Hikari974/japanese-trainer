import { Button, YStack, Text } from 'tamagui';

export type Level = 'Kana' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

interface LevelButtonProps {
  level: Level;
  isSelected: boolean;
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

export function LevelButton({ level, isSelected, onPress }: LevelButtonProps) {
  const color = levelColors[level];

  return (
    <Button
      onPress={onPress}
      height={58}
      backgroundColor={isSelected ? '$backgroundHover' : '$backgroundHover'}
      borderWidth={isSelected ? 2 : 0}
      borderColor={isSelected ? color : 'transparent'}
      borderRadius="$6"
      pressStyle={{
        scale: 0.98,
        backgroundColor: '$backgroundPress',
      }}
      animation="quick"
      accessibilityLabel={`Niveau ${level}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <YStack justifyContent="center" alignItems="center">
        <Text
          fontSize={22}
          fontWeight={isSelected ? '700' : '600'}
          color={isSelected ? color : '$darkTextSecondary'}
          letterSpacing={0.5}
        >
          {level}
        </Text>
      </YStack>
    </Button>
  );
}
