import { useState, useEffect } from 'react';
import { YStack, XStack, Button, Text, Input, ScrollView } from 'tamagui';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from './components/AppHeader';
import { ScrollingText } from './components/ScrollingText';
import type { Level } from './components/LevelButton';
import type { Difficulty } from './components/DifficultySelector';

// Types
type ScrollingState = 'idle' | 'running';
type ValidationFeedback = 'correct' | 'incorrect' | null;

interface Word {
  japanese: string;
  romaji: string;
}

interface DifficultyParams {
  speed: number;
  windowWidth: number;
  fontSize: number;
}

// Configuration difficultés
const difficultyConfig: Record<Difficulty, DifficultyParams> = {
  Facile: { speed: 70, windowWidth: 200, fontSize: 32 },
  Normal: { speed: 140, windowWidth: 200, fontSize: 32 },
  Difficile: { speed: 220, windowWidth: 150, fontSize: 32 },
  Extrême: { speed: 300, windowWidth: 150, fontSize: 32 },
};

// Mock words temporaires (à remplacer par les 5 listes)
const mockWords: Word[] = [
  { japanese: 'にほんご', romaji: 'nihongo' },
  { japanese: 'こんにちは', romaji: 'konnichiha' },
  { japanese: 'ありがとう', romaji: 'arigatou' },
];

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

// Couleurs niveaux
const levelColors: Record<Level, string> = {
  Kana: '$levelKana',
  N5: '$levelN5',
  N4: '$levelN4',
  N3: '$levelN3',
  N2: '$levelN2',
  N1: '$levelN1',
};

// Couleurs difficultés
const difficultyColors: Record<Difficulty, string> = {
  Facile: '$difficultyEasy',
  Normal: '$difficultyNormal',
  Difficile: '$difficultyHard',
  Extrême: '$difficultyExtreme',
};

// Normalisation romaji pour validation flexible
const normalizeRomaji = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/si/g, 'shi')
    .replace(/ti/g, 'chi')
    .replace(/tu/g, 'tsu')
    .replace(/hu/g, 'fu');
};

export default function TrainingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ level: string; difficulty: string }>();

  const level = (params.level || 'Kana') as Level;
  const difficulty = (params.difficulty || 'Normal') as Difficulty;
  const config = difficultyConfig[difficulty];

  // États
  const [inputText, setInputText] = useState<string>('');
  const [scrollingState, setScrollingState] = useState<ScrollingState>('idle');
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [validationFeedback, setValidationFeedback] = useState<ValidationFeedback>(null);
  const [pendingTimeout, setPendingTimeout] = useState<NodeJS.Timeout | null>(null);

  const currentWord = mockWords[currentWordIndex];

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pendingTimeout) clearTimeout(pendingTimeout);
    };
  }, [pendingTimeout]);

  // Handlers
  const handleSyllablePress = (syllable: string) => {
    setInputText(prev => prev + syllable);
  };

  const handleClear = () => {
    setInputText('');
    setValidationFeedback(null);
  };

  const handleValidate = () => {
    // Clear any pending timeout
    if (pendingTimeout) clearTimeout(pendingTimeout);

    const normalized = normalizeRomaji(inputText);
    const expected = normalizeRomaji(currentWord.romaji);

    if (normalized === expected) {
      setValidationFeedback('correct');
      const timeout = setTimeout(() => {
        // Passer au mot suivant
        setCurrentWordIndex(prev => (prev + 1) % mockWords.length);
        setInputText('');
        setValidationFeedback(null);
      }, 1000);
      setPendingTimeout(timeout);
    } else {
      setValidationFeedback('incorrect');
      const timeout = setTimeout(() => {
        setValidationFeedback(null);
      }, 1000);
      setPendingTimeout(timeout);
    }
  };

  const handleStartStop = () => {
    setScrollingState(prev => prev === 'idle' ? 'running' : 'idle');
  };

  const getBorderColor = () => {
    if (validationFeedback === 'correct') return '$difficultyEasy';
    if (validationFeedback === 'incorrect') return '$difficultyExtreme';
    return '$borderColor';
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <AppHeader title="Session d'entraînement" showBackButton />

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$2" gap="$1.5" paddingBottom={insets.bottom + 8}>

          {/* Zone 1: SessionInfo */}
          <XStack gap="$2" justifyContent="center" marginTop="$1">
            <Text fontSize={11} fontWeight="600" color={levelColors[level]}>
              {level}
            </Text>
            <Text fontSize={11} color="$darkTextTertiary">•</Text>
            <Text fontSize={11} fontWeight="600" color={difficultyColors[difficulty]}>
              {difficulty}
            </Text>
          </XStack>

          {/* Zone 2: ScrollingText */}
          <YStack alignItems="center" paddingVertical="$1">
            <ScrollingText
              text={currentWord.japanese}
              speed={scrollingState === 'running' ? config.speed : 0}
              windowWidth={config.windowWidth}
              fontSize={config.fontSize}
            />
          </YStack>

          {/* Zone 3: RomajiKeyboard Grid */}
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
                      onPress={() => handleSyllablePress(syllable)}
                      backgroundColor="$backgroundHover"
                      borderRadius="$2"
                      pressStyle={{ scale: 0.95, backgroundColor: '$backgroundPress' }}
                      animation="quick"
                      disabled={scrollingState !== 'running'}
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

          {/* Zone 4: Input + Actions */}
          <YStack gap="$2">
            {/* Input field */}
            <XStack
              padding="$2.5"
              paddingHorizontal="$3"
              backgroundColor="$backgroundHover"
              borderRadius="$3"
              borderWidth={2}
              borderColor={getBorderColor()}
              minHeight={48}
              alignItems="center"
            >
              {inputText ? (
                <Text fontSize={18} color="$color" flex={1}>
                  {inputText}
                </Text>
              ) : (
                <Text fontSize={16} color="$darkTextTertiary" flex={1}>
                  Tapez avec le clavier ci-dessus
                </Text>
              )}
            </XStack>

            {/* Actions */}
            <XStack gap="$2">
              <Button
                flex={1}
                size="$3"
                onPress={handleClear}
                backgroundColor="$backgroundHover"
                disabled={inputText.length === 0 || scrollingState !== 'running'}
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
              >
                <Text color="$difficultyExtreme" fontWeight="600">
                  Effacer
                </Text>
              </Button>
              <Button
                flex={1}
                size="$3"
                onPress={handleValidate}
                backgroundColor="$difficultyEasy"
                disabled={inputText.length === 0 || scrollingState !== 'running'}
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
              >
                <Text color="$darkBackground" fontWeight="600">
                  Valider
                </Text>
              </Button>
            </XStack>
          </YStack>

          {/* Zone 5: Controls */}
          <Button
            size="$4"
            backgroundColor={scrollingState === 'running' ? '$difficultyExtreme' : '$difficultyEasy'}
            onPress={handleStartStop}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
          >
            <Text fontSize={16} fontWeight="bold" color="$darkBackground">
              {scrollingState === 'running' ? 'Stop' : 'Start'}
            </Text>
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
