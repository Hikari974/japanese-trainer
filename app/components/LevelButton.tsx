import { Button, YStack, Text } from 'tamagui';

export type Level = 'Kana' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

interface LevelButtonProps {
  level: Level;
  isSelected: boolean;
  onPress: () => void;
}

const levelColors = {
  Kana: '#10b981',
  N5: '#3b82f6',
  N4: '#8b5cf6',
  N3: '#a855f7',
  N2: '#ec4899',
  N1: '#ef4444',
};

export function LevelButton({ level, isSelected, onPress }: LevelButtonProps) {
  const color = levelColors[level];

  return (
    <Button
      onPress={onPress}
      height={58}
      backgroundColor={isSelected ? `${color}20` : '#1a1a1a'}
      borderWidth={isSelected ? 2 : 0}
      borderColor={isSelected ? color : 'transparent'}
      borderRadius="$6"
      pressStyle={{
        scale: 0.98,
        backgroundColor: isSelected ? `${color}30` : '#252525',
      }}
      animation="quick"
    >
      <YStack justifyContent="center" alignItems="center">
        <Text
          fontSize={22}
          fontWeight={isSelected ? '700' : '600'}
          color={isSelected ? color : '#aaa'}
          letterSpacing={0.5}
        >
          {level}
        </Text>
      </YStack>
    </Button>
  );
}
