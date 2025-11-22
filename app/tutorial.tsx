import { useState, useRef } from 'react';
import { YStack, XStack, Text, Button, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';
import { AppHeader } from './components/AppHeader';
import { usePreferences } from './hooks/usePreferences';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Level colors
const levelColors: Record<string, string> = {
  Kana: '$levelKana',
  N5: '$levelN5',
  N4: '$levelN4',
  N3: '$levelN3',
  N2: '$levelN2',
  N1: '$levelN1',
};

// Difficulty colors
const difficultyColors: Record<string, string> = {
  Facile: '$difficultyEasy',
  Normal: '$difficultyNormal',
  Difficile: '$difficultyHard',
  Extrême: '$difficultyExtreme',
};

interface TutorialStep {
  titleFr: string;
  titleEn: string;
  contentFr: React.ReactNode;
  contentEn: React.ReactNode;
}

export default function TutorialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { preferences } = usePreferences();
  const lang = preferences?.translationLanguage || 'fr';

  const [currentStep, setCurrentStep] = useState(0);

  const steps: TutorialStep[] = [
    // Step 1: Welcome
    {
      titleFr: 'Bienvenue !',
      titleEn: 'Welcome!',
      contentFr: (
        <YStack gap="$4" alignItems="center">
          <Text fontSize={48}>🎌</Text>
          <Text fontSize={16} color="$color" textAlign="center" lineHeight={24}>
            Apprenez à lire le japonais en vous entraînant à reconnaître les mots qui défilent à l'écran.
          </Text>
          <Text fontSize={14} color="$gray11" textAlign="center">
            Ce tutoriel vous explique comment utiliser l'application.
          </Text>
        </YStack>
      ),
      contentEn: (
        <YStack gap="$4" alignItems="center">
          <Text fontSize={48}>🎌</Text>
          <Text fontSize={16} color="$color" textAlign="center" lineHeight={24}>
            Learn to read Japanese by practicing to recognize scrolling words on screen.
          </Text>
          <Text fontSize={14} color="$gray11" textAlign="center">
            This tutorial explains how to use the app.
          </Text>
        </YStack>
      ),
    },
    // Step 2: Level System
    {
      titleFr: 'Système de niveaux',
      titleEn: 'Level System',
      contentFr: (
        <YStack gap="$4" alignItems="center">
          <Text fontSize={14} color="$color" textAlign="center" marginBottom="$2">
            6 niveaux progressifs à débloquer :
          </Text>
          <XStack flexWrap="wrap" gap="$2" justifyContent="center">
            {['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
              <YStack
                key={level}
                backgroundColor={levelColors[level]}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$2"
              >
                <Text fontSize={14} fontWeight="600" color="white">
                  {level}
                </Text>
              </YStack>
            ))}
          </XStack>
          <Text fontSize={14} color="$gray11" textAlign="center" marginTop="$2">
            Maîtrisez un niveau pour débloquer le suivant.{'\n'}
            Chaque niveau contient des mots du JLPT correspondant.
          </Text>
        </YStack>
      ),
      contentEn: (
        <YStack gap="$4" alignItems="center">
          <Text fontSize={14} color="$color" textAlign="center" marginBottom="$2">
            6 progressive levels to unlock:
          </Text>
          <XStack flexWrap="wrap" gap="$2" justifyContent="center">
            {['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
              <YStack
                key={level}
                backgroundColor={levelColors[level]}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$2"
              >
                <Text fontSize={14} fontWeight="600" color="white">
                  {level}
                </Text>
              </YStack>
            ))}
          </XStack>
          <Text fontSize={14} color="$gray11" textAlign="center" marginTop="$2">
            Master a level to unlock the next one.{'\n'}
            Each level contains words from the corresponding JLPT.
          </Text>
        </YStack>
      ),
    },
    // Step 3: Difficulty
    {
      titleFr: 'Modes de difficulté',
      titleEn: 'Difficulty Modes',
      contentFr: (
        <YStack gap="$4" alignItems="center">
          <Text fontSize={14} color="$color" textAlign="center" marginBottom="$2">
            4 vitesses de défilement :
          </Text>
          <YStack gap="$2" width="100%">
            {[
              { name: 'Facile', speed: 'Lent', desc: '70 px/s' },
              { name: 'Normal', speed: 'Moyen', desc: '140 px/s' },
              { name: 'Difficile', speed: 'Rapide', desc: '220 px/s' },
              { name: 'Extrême', speed: 'Très rapide', desc: '300 px/s' },
            ].map((diff) => (
              <XStack
                key={diff.name}
                alignItems="center"
                gap="$3"
                paddingVertical="$2"
              >
                <YStack
                  width={12}
                  height={12}
                  borderRadius={6}
                  backgroundColor={difficultyColors[diff.name]}
                />
                <Text fontSize={14} fontWeight="600" color="$color" flex={1}>
                  {diff.name}
                </Text>
                <Text fontSize={12} color="$gray11">
                  {diff.speed}
                </Text>
              </XStack>
            ))}
          </YStack>
          <Text fontSize={13} color="$gray11" textAlign="center" marginTop="$2">
            Commencez avec Facile ou Normal pour vous habituer.
          </Text>
        </YStack>
      ),
      contentEn: (
        <YStack gap="$4" alignItems="center">
          <Text fontSize={14} color="$color" textAlign="center" marginBottom="$2">
            4 scrolling speeds:
          </Text>
          <YStack gap="$2" width="100%">
            {[
              { name: 'Facile', speed: 'Slow', desc: '70 px/s' },
              { name: 'Normal', speed: 'Medium', desc: '140 px/s' },
              { name: 'Difficile', speed: 'Fast', desc: '220 px/s' },
              { name: 'Extrême', speed: 'Very fast', desc: '300 px/s' },
            ].map((diff) => (
              <XStack
                key={diff.name}
                alignItems="center"
                gap="$3"
                paddingVertical="$2"
              >
                <YStack
                  width={12}
                  height={12}
                  borderRadius={6}
                  backgroundColor={difficultyColors[diff.name]}
                />
                <Text fontSize={14} fontWeight="600" color="$color" flex={1}>
                  {diff.name}
                </Text>
                <Text fontSize={12} color="$gray11">
                  {diff.speed}
                </Text>
              </XStack>
            ))}
          </YStack>
          <Text fontSize={13} color="$gray11" textAlign="center" marginTop="$2">
            Start with Easy or Normal to get used to it.
          </Text>
        </YStack>
      ),
    },
    // Step 4: Training Session
    {
      titleFr: 'Session d\'entraînement',
      titleEn: 'Training Session',
      contentFr: (
        <YStack gap="$4" alignItems="center">
          <YStack gap="$3" width="100%">
            <XStack alignItems="center" gap="$3">
              <Text fontSize={24}>▶</Text>
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="600" color="$color">
                  Bouton Start
                </Text>
                <Text fontSize={12} color="$gray11">
                  Lance le défilement du mot japonais
                </Text>
              </YStack>
            </XStack>

            <XStack alignItems="center" gap="$3">
              <Text fontSize={24}>⌨️</Text>
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="600" color="$color">
                  Clavier Romaji
                </Text>
                <Text fontSize={12} color="$gray11">
                  Tapez la lecture en romaji du mot
                </Text>
              </YStack>
            </XStack>

            <XStack alignItems="center" gap="$3">
              <Text fontSize={24}>👁️</Text>
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="600" color="$color">
                  Traduction
                </Text>
                <Text fontSize={12} color="$gray11">
                  Affiche la traduction (pénalise le score)
                </Text>
              </YStack>
            </XStack>

            <XStack alignItems="center" gap="$3">
              <Text fontSize={24}>✓</Text>
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="600" color="$color">
                  Valider
                </Text>
                <Text fontSize={12} color="$gray11">
                  Vérifie votre réponse
                </Text>
              </YStack>
            </XStack>
          </YStack>
        </YStack>
      ),
      contentEn: (
        <YStack gap="$4" alignItems="center">
          <YStack gap="$3" width="100%">
            <XStack alignItems="center" gap="$3">
              <Text fontSize={24}>▶</Text>
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="600" color="$color">
                  Start Button
                </Text>
                <Text fontSize={12} color="$gray11">
                  Starts the Japanese word scrolling
                </Text>
              </YStack>
            </XStack>

            <XStack alignItems="center" gap="$3">
              <Text fontSize={24}>⌨️</Text>
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="600" color="$color">
                  Romaji Keyboard
                </Text>
                <Text fontSize={12} color="$gray11">
                  Type the romaji reading of the word
                </Text>
              </YStack>
            </XStack>

            <XStack alignItems="center" gap="$3">
              <Text fontSize={24}>👁️</Text>
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="600" color="$color">
                  Translation
                </Text>
                <Text fontSize={12} color="$gray11">
                  Shows the translation (penalizes score)
                </Text>
              </YStack>
            </XStack>

            <XStack alignItems="center" gap="$3">
              <Text fontSize={24}>✓</Text>
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="600" color="$color">
                  Validate
                </Text>
                <Text fontSize={12} color="$gray11">
                  Check your answer
                </Text>
              </YStack>
            </XStack>
          </YStack>
        </YStack>
      ),
    },
    // Step 5: Scoring System
    {
      titleFr: 'Système de points',
      titleEn: 'Scoring System',
      contentFr: (
        <YStack gap="$4" alignItems="center">
          <YStack gap="$3" width="100%">
            <YStack
              backgroundColor="$difficultyEasy"
              padding="$3"
              borderRadius="$3"
            >
              <Text fontSize={14} fontWeight="600" color="white" textAlign="center">
                +1 point
              </Text>
              <Text fontSize={12} color="white" opacity={0.9} textAlign="center">
                Bonne réponse du premier coup
              </Text>
            </YStack>

            <YStack
              backgroundColor="$backgroundHover"
              padding="$3"
              borderRadius="$3"
            >
              <Text fontSize={14} fontWeight="600" color="$color" textAlign="center">
                0 point
              </Text>
              <Text fontSize={12} color="$gray11" textAlign="center">
                Si vous avez relancé le défilement{'\n'}ou vu la traduction
              </Text>
            </YStack>
          </YStack>

          <Text fontSize={13} color="$gray11" textAlign="center" marginTop="$2">
            Maîtrisez un mot en accumulant 5 points.{'\n'}
            Maîtrisez tous les mots pour compléter le niveau.
          </Text>
        </YStack>
      ),
      contentEn: (
        <YStack gap="$4" alignItems="center">
          <YStack gap="$3" width="100%">
            <YStack
              backgroundColor="$difficultyEasy"
              padding="$3"
              borderRadius="$3"
            >
              <Text fontSize={14} fontWeight="600" color="white" textAlign="center">
                +1 point
              </Text>
              <Text fontSize={12} color="white" opacity={0.9} textAlign="center">
                Correct answer on first try
              </Text>
            </YStack>

            <YStack
              backgroundColor="$backgroundHover"
              padding="$3"
              borderRadius="$3"
            >
              <Text fontSize={14} fontWeight="600" color="$color" textAlign="center">
                0 points
              </Text>
              <Text fontSize={12} color="$gray11" textAlign="center">
                If you restarted the scrolling{'\n'}or viewed the translation
              </Text>
            </YStack>
          </YStack>

          <Text fontSize={13} color="$gray11" textAlign="center" marginTop="$2">
            Master a word by accumulating 5 points.{'\n'}
            Master all words to complete the level.
          </Text>
        </YStack>
      ),
    },
    // Step 6: Ready to Start
    {
      titleFr: 'Prêt à commencer ?',
      titleEn: 'Ready to start?',
      contentFr: (
        <YStack gap="$4" alignItems="center">
          <Text fontSize={48}>🚀</Text>
          <Text fontSize={16} color="$color" textAlign="center">
            Vous êtes prêt à vous entraîner !
          </Text>
          <Text fontSize={14} color="$gray11" textAlign="center">
            Commencez avec le niveau Kana en difficulté Facile pour vous habituer.
          </Text>

          <Button
            size="$4"
            backgroundColor="$levelKana"
            marginTop="$4"
            onPress={() => {
              router.replace({
                pathname: '/training',
                params: { level: 'Kana', difficulty: 'Facile' },
              });
            }}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
          >
            <Text fontSize={16} fontWeight="600" color="white">
              Démarrer avec Kana
            </Text>
          </Button>
        </YStack>
      ),
      contentEn: (
        <YStack gap="$4" alignItems="center">
          <Text fontSize={48}>🚀</Text>
          <Text fontSize={16} color="$color" textAlign="center">
            You're ready to practice!
          </Text>
          <Text fontSize={14} color="$gray11" textAlign="center">
            Start with Kana level on Easy difficulty to get used to it.
          </Text>

          <Button
            size="$4"
            backgroundColor="$levelKana"
            marginTop="$4"
            onPress={() => {
              router.replace({
                pathname: '/training',
                params: { level: 'Kana', difficulty: 'Facile' },
              });
            }}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
          >
            <Text fontSize={16} fontWeight="600" color="white">
              Start with Kana
            </Text>
          </Button>
        </YStack>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollRef.current?.scrollTo({ x: (currentStep + 1) * SCREEN_WIDTH, animated: true });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollRef.current?.scrollTo({ x: (currentStep - 1) * SCREEN_WIDTH, animated: true });
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newStep = Math.round(offsetX / SCREEN_WIDTH);
    if (newStep !== currentStep && newStep >= 0 && newStep < steps.length) {
      setCurrentStep(newStep);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <YStack flex={1} backgroundColor="$background">
      <AppHeader
        title={lang === 'fr' ? 'Tutoriel' : 'Tutorial'}
        showBackButton
      />

      {/* Content */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {steps.map((step, index) => (
          <YStack
            key={index}
            width={SCREEN_WIDTH}
            flex={1}
            padding="$4"
            justifyContent="center"
          >
            {/* Step Title */}
            <Text
              fontSize={24}
              fontWeight="700"
              color="$color"
              textAlign="center"
              marginBottom="$6"
            >
              {lang === 'fr' ? step.titleFr : step.titleEn}
            </Text>

            {/* Step Content */}
            <YStack paddingHorizontal="$2">
              {lang === 'fr' ? step.contentFr : step.contentEn}
            </YStack>
          </YStack>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <YStack
        padding="$4"
        paddingBottom={insets.bottom + 16}
        gap="$3"
        borderTopWidth={1}
        borderTopColor="$borderColor"
      >
        {/* Pagination Dots */}
        <XStack justifyContent="center" gap="$2">
          {steps.map((_, index) => (
            <YStack
              key={index}
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor={index === currentStep ? '$color' : '$gray8'}
            />
          ))}
        </XStack>

        {/* Navigation Buttons */}
        <XStack gap="$3">
          <Button
            flex={1}
            size="$4"
            backgroundColor="$backgroundHover"
            onPress={handlePrev}
            disabled={currentStep === 0}
            disabledStyle={{ opacity: 0.3 }}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
          >
            <Text fontSize={14} fontWeight="600" color="$color">
              {lang === 'fr' ? 'Précédent' : 'Previous'}
            </Text>
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              flex={1}
              size="$4"
              backgroundColor="$difficultyEasy"
              onPress={handleNext}
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
            >
              <Text fontSize={14} fontWeight="600" color="$darkBackground">
                {lang === 'fr' ? 'Suivant' : 'Next'}
              </Text>
            </Button>
          ) : (
            <Button
              flex={1}
              size="$4"
              backgroundColor="$difficultyEasy"
              onPress={() => router.back()}
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
            >
              <Text fontSize={14} fontWeight="600" color="$darkBackground">
                {lang === 'fr' ? 'Terminer' : 'Finish'}
              </Text>
            </Button>
          )}
        </XStack>
      </YStack>
    </YStack>
  );
}
