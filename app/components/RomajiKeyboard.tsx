import { memo, useState, useCallback, useMemo } from 'react';
import { YStack, XStack, Button, Text } from 'tamagui';

interface RomajiKeyboardProps {
  onSyllablePress: (syllable: string) => void;
  disabled: boolean;
}

// Types
type KeyboardMode = 'base' | 'dakuten-handakuten' | 'yoon' | 'foreign';

// Data: Base syllables with double consonants in first column (50 total)
const baseSyllables = [
  ['', 'a', 'i', 'u', 'e', 'o'],
  ['k', 'ka', 'ki', 'ku', 'ke', 'ko'],
  ['s', 'sa', 'shi', 'su', 'se', 'so'],
  ['t', 'ta', 'chi', 'tsu', 'te', 'to'],
  ['c', 'na', 'ni', 'nu', 'ne', 'no'],
  ['', 'ha', 'hi', 'fu', 'he', 'ho'],
  ['m', 'ma', 'mi', 'mu', 'me', 'mo'],
  ['', 'ya', 'yu', 'yo', '', ''],
  ['', 'ra', 'ri', 'ru', 're', 'ro'],
  ['', 'wa', 'wo', 'n', ',', ''],
];

// Data: Dakuten + Handakuten combined with double consonants (30 total) - voiced consonants + p-sound
const dakutenHandakutenSyllables = [
  ['g', 'ga', 'gi', 'gu', 'ge', 'go'],
  ['z', 'za', 'ji', 'zu', 'ze', 'zo'],
  ['d', 'da', 'di', 'du', 'de', 'do'],
  ['b', 'ba', 'bi', 'bu', 'be', 'bo'],
  ['p', 'pa', 'pi', 'pu', 'pe', 'po'],
];

// Data: Yōon syllables (33 total) - palatalized sounds
const yoonSyllables = [
  ['kya', 'kyu', 'kyo'],
  ['sha', 'shu', 'sho'],
  ['cha', 'chu', 'cho'],
  ['nya', 'nyu', 'nyo'],
  ['hya', 'hyu', 'hyo'],
  ['mya', 'myu', 'myo'],
  ['rya', 'ryu', 'ryo'],
  ['gya', 'gyu', 'gyo'],
  ['ja', 'ju', 'jo'],
  ['bya', 'byu', 'byo'],
  ['pya', 'pyu', 'pyo'],
];

// Data: Foreign katakana syllables (23 total) - modern loanword sounds
const foreignSyllables = [
  ['fa', 'fi', 'fe', 'fo'],      // F-sounds
  ['wi', 'we', 'wo'],            // W-sounds
  ['va', 'vi', 'vu', 've', 'vo'], // V-sounds
  ['ti', 'di', 'tu', 'du'],      // T/D-sounds
  ['che', 'she', 'tsa', 'dyu', 'je'],   // Other foreign sounds
];

// Mode configuration
const modeConfig = {
  base: { data: baseSyllables, columns: 6, buttonWidth: 42 },
  'dakuten-handakuten': { data: dakutenHandakutenSyllables, columns: 6, buttonWidth: 42 },
  yoon: { data: yoonSyllables, columns: 3, buttonWidth: 64 },
  foreign: { data: foreignSyllables, columns: 5, buttonWidth: 48 },
};

// Mode labels for selector buttons
const modeLabels: Record<KeyboardMode, string> = {
  base: 'Base',
  'dakuten-handakuten': '゛゜',
  yoon: 'ゃ',
  foreign: '外',
};

export const RomajiKeyboard = memo(function RomajiKeyboard({
  onSyllablePress,
  disabled,
}: RomajiKeyboardProps) {
  const [currentMode, setCurrentMode] = useState<KeyboardMode>('base');

  const handleModeChange = useCallback((mode: KeyboardMode) => {
    setCurrentMode(mode);
  }, []);

  // Get current mode configuration
  const config = useMemo(() => modeConfig[currentMode], [currentMode]);

  // Render mode selector
  const modeSelector = useMemo(
    () => (
      <XStack gap="$2" justifyContent="center" marginBottom="$2">
        {(Object.keys(modeLabels) as KeyboardMode[]).map((mode) => {
          const isActive = currentMode === mode;
          return (
            <Button
              key={mode}
              size="$2.5"
              minWidth={56}
              minHeight={44}
              onPress={() => handleModeChange(mode)}
              backgroundColor={isActive ? '$blue9' : '$backgroundHover'}
              borderWidth={2}
              borderColor={isActive ? '$borderColorFocus' : 'transparent'}
              pressStyle={{ opacity: 0.8, scale: 0.97 }}
              animation="quick"
              accessibilityLabel={`Mode ${modeLabels[mode]}`}
              accessibilityRole="button"
            >
              <Text
                fontSize={mode === 'base' ? 12 : 18}
                fontWeight={isActive ? '700' : '400'}
                color={isActive ? '$color' : '$colorSubtle'}
              >
                {modeLabels[mode]}
              </Text>
            </Button>
          );
        })}
      </XStack>
    ),
    [currentMode, handleModeChange]
  );

  return (
    <YStack gap="$1">
      {/* Mode Selector */}
      {modeSelector}

      {/* Syllable Grid */}
      <YStack gap="$1">
        {config.data.map((row, rowIndex) => (
          <XStack key={rowIndex} gap="$1.5" justifyContent="center">
            {row.map((syllable, colIndex) =>
              syllable ? (
                <Button
                  key={colIndex}
                  size="$2"
                  minWidth={config.buttonWidth}
                  minHeight={36}
                  onPress={() => onSyllablePress(syllable)}
                  backgroundColor="$backgroundHover"
                  borderRadius="$2"
                  pressStyle={{ scale: 0.95, backgroundColor: '$backgroundPress' }}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={syllable}
                >
                  <Text fontSize={14} color="$color">
                    {syllable}
                  </Text>
                </Button>
              ) : (
                <XStack key={colIndex} width={config.buttonWidth} />
              )
            )}
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
});
