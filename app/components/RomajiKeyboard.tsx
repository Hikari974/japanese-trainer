import { memo } from 'react';
import { YStack, XStack, Button, Text } from 'tamagui';

interface RomajiKeyboardProps {
  onSyllablePress: (syllable: string) => void;
  disabled: boolean;
}

// Grid romaji (5x10)
const romajiSyllables = [
  ['a', 'i', 'u', 'e', 'o'],
  ['ka', 'ki', 'ku', 'ke', 'ko'],
  ['sa', 'shi', 'su', 'se', 'so'],
  ['ta', 'chi', 'tsu', 'te', 'to'],
  ['na', 'ni', 'nu', 'ne', 'no'],
  ['ha', 'hi', 'fu', 'he', 'ho'],
  ['ma', 'mi', 'mu', 'me', 'mo'],
  ['ya', 'yu', 'yo', '', ''],
  ['ra', 'ri', 'ru', 're', 'ro'],
  ['wa', 'wo', 'n', '', ''],
];

export const RomajiKeyboard = memo(function RomajiKeyboard({
  onSyllablePress,
  disabled,
}: RomajiKeyboardProps) {
  return (
    <YStack gap="$1">
      {romajiSyllables.map((row, rowIndex) => (
        <XStack key={rowIndex} gap="$1.5" justifyContent="center">
          {row.map((syllable, colIndex) =>
            syllable ? (
              <Button
                key={colIndex}
                size="$2"
                minWidth={42}
                minHeight={36}
                onPress={() => onSyllablePress(syllable)}
                backgroundColor="$backgroundHover"
                borderRadius="$2"
                pressStyle={{ scale: 0.95, backgroundColor: '$backgroundPress' }}
                disabled={disabled}
              >
                <Text fontSize={14} color="$color">
                  {syllable}
                </Text>
              </Button>
            ) : (
              <XStack key={colIndex} width={42} />
            )
          )}
        </XStack>
      ))}
    </YStack>
  );
});
