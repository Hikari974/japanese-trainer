import { useState, useEffect, useCallback, useMemo } from 'react';
import { YStack, XStack, Button, Text, Input, Sheet } from 'tamagui';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from './components/AppHeader';
import { ScrollingTextContainer } from './components/ScrollingTextContainer';
import { Furigana } from './components/Furigana';
import { RomajiKeyboard } from './components/RomajiKeyboard';
import { useWords } from './hooks/useWords';
import { usePreferences } from './hooks/usePreferences';
import { useStatistics } from './hooks/useStatistics';
import type { Level } from './components/LevelButton';
import type { Difficulty } from './components/DifficultySelector';
import type { JLPTLevel } from './types/word';

// Types
type ScrollingState = 'idle' | 'running';
type ValidationFeedback = 'correct' | 'incorrect' | null;
type ModalColor = 'green' | 'red' | null;

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
    // Remove spaces and punctuation that might appear
    .replace(/[\s,]/g, '')
    // Handle "jy" → "j" variants (joubu, ja, ju, jo)
    .replace(/jy([auo])/g, 'j$1')  // jya→ja, jyu→ju, jyo→jo
    .replace(/jy/g, 'j')            // jy→j (standalone)
    // Handle "chy" → "ch" variants (cha, chu, cho)
    .replace(/chy([auo])/g, 'ch$1') // chya→cha, chyu→chu, chyo→cho
    // Handle っち pattern: "cchi" → "tchi" (small tsu + chi)
    .replace(/cchi/g, 'tchi')
    .replace(/ccha/g, 'tcha')
    .replace(/ccho/g, 'tcho')
    .replace(/cchu/g, 'tchu')
    // Handle standard variants
    .replace(/si/g, 'shi')
    .replace(/ti/g, 'chi')
    .replace(/tu/g, 'tsu')
    // Handle "hu" → "fu" BUT NOT inside "chu" pattern
    // We do this by first protecting "chu" temporarily
    .replace(/chu/g, '\x00CHU\x00')   // Temporarily mark "chu"
    .replace(/hu/g, 'fu')              // Replace hu → fu
    .replace(/\x00CHU\x00/g, 'chu')   // Restore "chu"
    // Handle double consonants (single letter → double)
    // User can type 'k' for 'kk', 's' for 'ss', etc.
    .replace(/([kstm])(?=[aiueo])/g, '$1$1')  // k/s/t/m before vowel → kk/ss/tt/mm
    .replace(/([gzdbp])(?=[aiueo])/g, '$1$1'); // g/z/d/b/p before vowel → gg/zz/dd/bb/pp
};

export default function TrainingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ level: string; difficulty: string }>();

  const level = (params.level || 'Kana') as JLPTLevel;
  const difficulty = (params.difficulty || 'Normal') as Difficulty;
  const config = difficultyConfig[difficulty];

  // Load user preferences
  const { preferences } = usePreferences();
  const wordsPerSession = preferences?.wordsPerSession ?? 10;

  // Load user statistics
  const { recordAttempt } = useStatistics();

  // Load words for training
  const { words, isLoading } = useWords({
    level,
    difficulty,
    count: wordsPerSession,
  });

  // États
  const [inputText, setInputText] = useState<string>('');
  const [scrollingState, setScrollingState] = useState<ScrollingState>('idle');
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [validationFeedback, setValidationFeedback] = useState<ValidationFeedback>(null);
  const [startClickCount, setStartClickCount] = useState<number>(0);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [showNextButton, setShowNextButton] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [correctAnswer, setCorrectAnswer] = useState<string>('');

  // Separate state for modal visibility and color to prevent red flash during closing animation
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalColor, setModalColor] = useState<ModalColor>(null);

  const currentWord = words[currentWordIndex];

  // Reset counters when moving to next word
  useEffect(() => {
    setStartClickCount(0);
    setShowTranslation(false);
  }, [currentWordIndex]);

  // Handlers
  const handleSyllablePress = useCallback((syllable: string) => {
    setInputText(prev => prev + syllable);
  }, []);

  const handleClear = () => {
    setInputText('');
    setValidationFeedback(null);
  };

  const handleValidate = async () => {
    if (!currentWord) return;

    const normalized = normalizeRomaji(inputText);
    const expected = normalizeRomaji(currentWord.romaji);
    const isCorrect = normalized === expected;

    // Capture state BEFORE recording attempt (these values will be reset on next word)
    const attemptStartCount = startClickCount;
    const attemptTranslationViewed = showTranslation;

    // Record attempt and get points earned
    const pointsEarned = await recordAttempt({
      wordId: currentWord.id,
      romaji: currentWord.romaji,
      level,
      difficulty,
      isCorrect,
      startCount: attemptStartCount,
      translationViewed: attemptTranslationViewed,
    });

    if (isCorrect) {
      // CORRECT
      setValidationFeedback('correct');
      // Show +1 if points earned, otherwise just success message
      const message = pointsEarned === 1
        ? 'Correct ! Bien joué ! +1'
        : 'Correct ! Bien joué !';
      setFeedbackMessage(message);
      setCorrectAnswer('');
      setShowNextButton(true);
      // Set modal state
      setModalColor('green');
      setIsModalOpen(true);
    } else {
      // INCORRECT
      setValidationFeedback('incorrect');
      setFeedbackMessage('Incorrect. La bonne réponse était :');
      setCorrectAnswer(currentWord.romaji);
      setShowNextButton(true);
      // Set modal state
      setModalColor('red');
      setIsModalOpen(true);
    }
  };

  const handleNext = () => {
    // Close the modal immediately
    setIsModalOpen(false);

    // Move to next word IMMEDIATELY - no delay for user interaction
    setCurrentWordIndex(prev => {
      const next = prev + 1;
      if (next >= words.length) {
        return 0; // Loop to start
      }
      return next;
    });

    // Reset input immediately so user can start typing right away
    setInputText('');
    setShowNextButton(false);
    setFeedbackMessage('');
    setCorrectAnswer('');
    setValidationFeedback(null);

    // DO NOT reset modalColor here - it causes color flash during close animation
    // modalColor will be set by the next handleValidate call
  };

  const handleStart = () => {
    if (scrollingState === 'idle') {
      setStartClickCount(prev => prev + 1);
      setScrollingState('running');
    }
  };

  const handleScrollComplete = useCallback(() => {
    setScrollingState('idle');
  }, []);

  const handleToggleTranslation = () => {
    setShowTranslation(prev => !prev);
  };

  // Memoize values to prevent unnecessary re-renders of ScrollingText
  const scrollSpeed = useMemo(
    () => (scrollingState === 'running' ? config.speed : 0),
    [scrollingState, config.speed]
  );

  const windowWidth = useMemo(() => config.windowWidth, [config.windowWidth]);
  const fontSize = useMemo(() => config.fontSize, [config.fontSize]);

  const getBorderColor = () => {
    if (validationFeedback === 'correct') return '$difficultyEasy';
    if (validationFeedback === 'incorrect') return '$difficultyExtreme';
    return '$borderColor';
  };

  // Loading state
  if (isLoading || !currentWord) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <AppHeader title="Session d'entraînement" showBackButton />
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text fontSize={16} color="$color">
            Chargement des mots...
          </Text>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <AppHeader title="Session d'entraînement" showBackButton />

      <YStack flex={1} padding="$2" gap="$1.5" paddingBottom={insets.bottom + 8}>

          {/* Zone 1: Top Bar - Counters */}
          <XStack justifyContent="space-between" paddingHorizontal="$2" marginTop="$1">
            <Text fontSize={13} fontWeight="600" color="$color">
              {currentWordIndex + 1}/{words.length}
            </Text>
            <Text fontSize={13} fontWeight="600" color="$difficultyEasy">
              {preferences?.translationLanguage === 'fr' ? 'Démarrages' : 'Starts'}: {startClickCount}
            </Text>
          </XStack>

          {/* Session Info: Level + Difficulty */}
          <XStack gap="$2" justifyContent="center" marginTop="$1">
            <Text fontSize={11} fontWeight="600" color={levelColors[level]}>
              {level}
            </Text>
            <Text fontSize={11} color="$darkTextTertiary">•</Text>
            <Text fontSize={11} fontWeight="600" color={difficultyColors[difficulty]}>
              {difficulty}
            </Text>
          </XStack>

          {/* Zone 2: ScrollingText + Start Button */}
          <XStack justifyContent="center" paddingVertical="$1">
            <XStack alignItems="center" gap="$2" marginRight={-34}>
              <ScrollingTextContainer
                currentWord={currentWord}
                speed={scrollSpeed}
                windowWidth={windowWidth}
                fontSize={fontSize}
                onScrollComplete={handleScrollComplete}
              />
              <Button
                size="$2.5"
                minWidth={50}
                onPress={handleStart}
                backgroundColor="$difficultyEasy"
                disabled={scrollingState === 'running'}
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                animation="quick"
              >
                <Text fontSize={14} fontWeight="600" color="$darkBackground">▶</Text>
              </Button>
            </XStack>
          </XStack>

          {/* Zone 2.5: Translation Toggle */}
          <XStack alignItems="center" justifyContent="center" gap="$2" paddingVertical="$1">
            <Button
              size="$2"
              circular
              onPress={handleToggleTranslation}
              backgroundColor="$backgroundHover"
              pressStyle={{ opacity: 0.8, scale: 0.95 }}
              animation="quick"
            >
              <Text fontSize={18}>👁️</Text>
            </Button>
            {showTranslation && currentWord && (
              <Text fontSize={14} color="$color" maxWidth="70%">
                {currentWord.translations?.[preferences?.translationLanguage || 'fr'] || 'No translation'}
              </Text>
            )}
          </XStack>

          {/* Zone 3: RomajiKeyboard Grid */}
          <RomajiKeyboard
            onSyllablePress={handleSyllablePress}
            disabled={showNextButton}
          />

          {/* Zone 4: Input + Actions - INLINE LAYOUT */}
          <XStack gap="$2" alignItems="center">
            {/* Clear button - LEFT */}
            <Button
              size="$3"
              minWidth={44}
              minHeight={44}
              onPress={handleClear}
              backgroundColor="$backgroundHover"
              disabled={inputText.length === 0 || showNextButton}
              pressStyle={{ opacity: 0.8, scale: 0.95 }}
              animation="quick"
              accessibilityLabel="Effacer le texte"
            >
              <Text fontSize={20}>🗑️</Text>
            </Button>

            {/* Input field - CENTER */}
            <XStack
              flex={1}
              padding="$2.5"
              paddingHorizontal="$3"
              backgroundColor="$backgroundHover"
              borderRadius="$3"
              borderWidth={2}
              borderColor={getBorderColor()}
              minHeight={44}
              alignItems="center"
              justifyContent="center"
            >
              {inputText ? (
                <Text fontSize={20} fontWeight="600" color="$color" textAlign="center">
                  {inputText}
                </Text>
              ) : (
                <Text fontSize={14} color="$darkTextTertiary" textAlign="center">
                  Tapez avec le clavier
                </Text>
              )}
            </XStack>

            {/* Validate button - RIGHT */}
            <Button
              size="$3"
              minWidth={44}
              minHeight={44}
              onPress={handleValidate}
              backgroundColor="$difficultyEasy"
              disabled={inputText.length === 0}
              pressStyle={{ opacity: 0.8, scale: 0.95 }}
              animation="quick"
              accessibilityLabel="Valider la réponse"
            >
              <Text fontSize={20}>✓</Text>
            </Button>
          </XStack>
      </YStack>

      {/* Feedback Modal */}
      <Sheet
        modal
        open={isModalOpen}
        onOpenChange={() => {
          // Force user to click "Suivant" button - don't allow closing by backdrop
        }}
        snapPoints={[45]}
        dismissOnSnapToBottom={false}
        animation="quick"
        animationConfig={{
          type: 'timing',
          duration: 150,
        }}
      >
        <Sheet.Overlay
          backgroundColor="rgba(0, 0, 0, 0.6)"
          animation="quick"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Sheet.Frame
          backgroundColor={
            modalColor === 'green'
              ? 'rgba(76, 175, 80, 0.98)'
              : 'rgba(244, 67, 54, 0.98)'
          }
          borderTopLeftRadius="$6"
          borderTopRightRadius="$6"
          padding="$6"
          animation="quick"
          enterStyle={{ y: 100, opacity: 0 }}
          exitStyle={{ y: 100, opacity: 0 }}
        >
          <YStack gap="$4" alignItems="center" justifyContent="center">
            {/* Icon */}
            <Text fontSize={48} color="white">
              {validationFeedback === 'correct' ? '✓' : '✗'}
            </Text>

            {/* Feedback Message */}
            <Text
              fontSize={20}
              fontWeight="700"
              color="white"
              textAlign="center"
            >
              {feedbackMessage}
            </Text>

            {/* Correct Answer (only if incorrect) */}
            {correctAnswer && (
              <Text
                fontSize={32}
                fontWeight="800"
                color="white"
                textAlign="center"
              >
                {correctAnswer}
              </Text>
            )}

            {/* Translation (always shown) */}
            {currentWord && (
              <Text
                fontSize={18}
                color="white"
                opacity={0.9}
                textAlign="center"
              >
                {currentWord.translations[preferences?.translationLanguage || 'fr']}
              </Text>
            )}

            {/* Next Button */}
            <Button
              size="$5"
              width="100%"
              onPress={handleNext}
              backgroundColor="white"
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              animation="quick"
            >
              <Text
                fontSize={16}
                fontWeight="700"
                color={
                  validationFeedback === 'correct'
                    ? '$difficultyEasy'
                    : '$difficultyExtreme'
                }
              >
                Suivant →
              </Text>
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
