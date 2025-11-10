import { XStack, YStack, Text, Circle } from 'tamagui';

const difficulties = ['Facile', 'Normal', 'Difficile', 'Extrême'] as const;
export type Difficulty = typeof difficulties[number];

const difficultyColors = {
  Facile: '#4ade80',
  Normal: '#60a5fa',
  Difficile: '#f59e0b',
  Extrême: '#ef4444',
};

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <XStack
      justifyContent="center"
      alignItems="center"
      gap="$3"
      paddingHorizontal="$4"
      paddingVertical="$2"
    >
      {difficulties.map((difficulty) => {
        const isSelected = value === difficulty;
        const color = difficultyColors[difficulty];

        return (
          <YStack
            key={difficulty}
            alignItems="center"
            gap="$1"
            onPress={() => onChange(difficulty)}
            cursor="pointer"
            opacity={isSelected ? 1 : 0.5}
            pressStyle={{ opacity: 0.7, scale: 0.95 }}
            animation="quick"
          >
            <Circle
              size={isSelected ? 14 : 10}
              backgroundColor={color}
              borderWidth={isSelected ? 2 : 0}
              borderColor="#0a0a0a"
            />
            <Text
              fontSize={11}
              color={isSelected ? color : '#888'}
              fontWeight={isSelected ? 'bold' : 'normal'}
            >
              {difficulty}
            </Text>
          </YStack>
        );
      })}
    </XStack>
  );
}
