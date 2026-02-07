import { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { YStack, XStack, Text, Slider, ScrollView, Button, Sheet, Switch, Spinner } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader } from './components/AppHeader';
import { usePreferences } from './hooks/usePreferences';
import type { JLPTLevel } from './types/word';

const JLPT_LEVELS: JLPTLevel[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { preferences, isLoading, updatePreferences } = usePreferences();

  // Local state for slider (5-30, step 5)
  const [wordsPerSession, setWordsPerSession] = useState(10);

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Slider save feedback
  const [sliderSaved, setSliderSaved] = useState(false);

  // Initialize slider value from preferences
  useEffect(() => {
    if (preferences) {
      setWordsPerSession(preferences.wordsPerSession);
    }
  }, [preferences]);

  // Handle slider drag (visual update only) - snap to step
  const handleWordsPerSessionChange = (value: number[]) => {
    const snapped = Math.round(value[0] / 5) * 5;
    setWordsPerSession(snapped);
  };

  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <AppHeader title="Paramètres" showBackButton />
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$color" />
          <Text fontSize={16} color="$color" marginTop="$4">
            Chargement...
          </Text>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <AppHeader title="Paramètres" showBackButton />
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack
          padding="$4"
          paddingBottom={insets.bottom + 16}
          gap="$4"
        >
          {/* Section: Language Settings */}
          <YStack gap="$3">
            <Text fontSize={18} fontWeight="600" color="$color">
              Langue / Language
            </Text>

            {/* Language selector */}
            <YStack
              backgroundColor="$backgroundHover"
              padding="$3"
              borderRadius="$3"
              gap="$2"
            >
              <Text fontSize={15} color="$color" marginBottom="$1">
                {preferences?.translationLanguage === 'fr' ? 'Langue des traductions' : 'Translation language'}
              </Text>

              <XStack gap="$2">
                <YStack
                  flex={1}
                  padding="$3"
                  borderRadius="$2"
                  backgroundColor={
                    preferences?.translationLanguage === 'fr'
                      ? '$difficultyEasy'
                      : '$backgroundPress'
                  }
                  onPress={() => updatePreferences({ translationLanguage: 'fr' })}
                  cursor="pointer"
                  pressStyle={{ opacity: 0.8, scale: 0.98 }}
                  animation="quick"
                >
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    color={
                      preferences?.translationLanguage === 'fr'
                        ? '$darkBackground'
                        : '$color'
                    }
                    textAlign="center"
                  >
                    Français
                  </Text>
                </YStack>

                <YStack
                  flex={1}
                  padding="$3"
                  borderRadius="$2"
                  backgroundColor={
                    preferences?.translationLanguage === 'en'
                      ? '$difficultyEasy'
                      : '$backgroundPress'
                  }
                  onPress={() => updatePreferences({ translationLanguage: 'en' })}
                  cursor="pointer"
                  pressStyle={{ opacity: 0.8, scale: 0.98 }}
                  animation="quick"
                >
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    color={
                      preferences?.translationLanguage === 'en'
                        ? '$darkBackground'
                        : '$color'
                    }
                    textAlign="center"
                  >
                    English
                  </Text>
                </YStack>
              </XStack>
            </YStack>
          </YStack>

          {/* Section: Display Settings */}
          <YStack gap="$3">
            <Text fontSize={18} fontWeight="600" color="$color">
              {preferences?.translationLanguage === 'fr' ? 'Affichage' : 'Display'}
            </Text>

            {/* Furigana toggle */}
            <YStack
              backgroundColor="$backgroundHover"
              padding="$3"
              borderRadius="$3"
              gap="$2"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <YStack flex={1} marginRight="$3">
                  <Text fontSize={15} color="$color">
                    {preferences?.translationLanguage === 'fr'
                      ? 'Afficher les furigana par défaut'
                      : 'Show furigana by default'}
                  </Text>
                  <Text fontSize={13} color="$gray11" marginTop="$1">
                    {preferences?.translationLanguage === 'fr'
                      ? 'Affiche la lecture kana au-dessus des kanji'
                      : 'Displays kana reading above kanji'}
                  </Text>
                </YStack>
                <Switch
                  size="$4"
                  checked={preferences?.showFuriganaByDefault ?? true}
                  onCheckedChange={(checked) => updatePreferences({ showFuriganaByDefault: checked })}
                  backgroundColor={preferences?.showFuriganaByDefault ? '$difficultyEasy' : '$gray8'}
                >
                  <Switch.Thumb
                    animation="quick"
                    backgroundColor="white"
                  />
                </Switch>
              </XStack>
            </YStack>
          </YStack>

          {/* Section: Training Settings */}
          <YStack gap="$3">
            <Text fontSize={18} fontWeight="600" color="$color">
              {preferences?.translationLanguage === 'fr' ? 'Entraînement' : 'Training'}
            </Text>

            {/* Words per session */}
            <YStack
              backgroundColor="$backgroundHover"
              padding="$3"
              borderRadius="$3"
              gap="$2"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={15} color="$color">
                  {preferences?.translationLanguage === 'fr' ? 'Mots par session' : 'Words per session'}
                </Text>
                <Text fontSize={15} fontWeight="600" color="$difficultyEasy">
                  {wordsPerSession}
                </Text>
              </XStack>

              <Slider
                value={[wordsPerSession]}
                onValueChange={handleWordsPerSessionChange}
                min={5}
                max={30}
                step={5}
                size="$3"
              >
                <Slider.Track backgroundColor="$backgroundPress">
                  <Slider.TrackActive backgroundColor="$difficultyEasy" />
                </Slider.Track>
                <Slider.Thumb
                  index={0}
                  circular
                  size="$1.5"
                  backgroundColor="$difficultyEasy"
                  borderWidth={2}
                  borderColor="$background"
                />
              </Slider>

              <XStack justifyContent="space-between" marginTop="$1">
                <Text fontSize={12} color="$darkTextTertiary">
                  5
                </Text>
                <Text fontSize={12} color="$darkTextTertiary">
                  30
                </Text>
              </XStack>

              <Button
                marginTop="$2"
                backgroundColor={sliderSaved ? '$green10' : '$difficultyEasy'}
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                animation="quick"
                disabled={sliderSaved}
                onPress={async () => {
                  await updatePreferences({ wordsPerSession });
                  setSliderSaved(true);
                  setTimeout(() => setSliderSaved(false), 1500);
                }}
              >
                <Text fontSize={14} fontWeight="600" color={sliderSaved ? 'white' : '$darkBackground'}>
                  {sliderSaved
                    ? '✓'
                    : (preferences?.translationLanguage === 'fr' ? 'Valider' : 'Save')}
                </Text>
              </Button>
            </YStack>
          </YStack>

          {/* Info text */}
          <Text fontSize={12} color="$gray10" textAlign="center" marginTop="$4">
            Version {Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
