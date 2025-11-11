import { useState, useEffect } from 'react';
import { YStack, XStack, Text, Slider, ScrollView } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from './components/AppHeader';
import { usePreferences } from './hooks/usePreferences';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { preferences, isLoading, updatePreferences } = usePreferences();

  // Local state for slider (5-30, step 5)
  const [wordsPerSession, setWordsPerSession] = useState(10);

  // Initialize slider value from preferences
  useEffect(() => {
    if (preferences) {
      setWordsPerSession(preferences.wordsPerSession);
    }
  }, [preferences]);

  // Handle slider drag (visual update only)
  const handleWordsPerSessionChange = (value: number[]) => {
    setWordsPerSession(value[0]);
  };

  // Handle slider release (save to preferences)
  const handleWordsPerSessionCommit = (value: number[]) => {
    const newValue = value[0];
    setWordsPerSession(newValue);
    updatePreferences({ wordsPerSession: newValue });
  };

  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <AppHeader title="Paramètres" showBackButton />
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text fontSize={16} color="$color">
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
          {/* Section: Training Settings */}
          <YStack gap="$3">
            <Text fontSize={18} fontWeight="600" color="$color">
              Entraînement
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
                  Mots par session
                </Text>
                <Text fontSize={15} fontWeight="600" color="$difficultyEasy">
                  {wordsPerSession}
                </Text>
              </XStack>

              <Slider
                value={[wordsPerSession]}
                onValueChange={handleWordsPerSessionChange}
                onValueCommit={handleWordsPerSessionCommit}
                min={5}
                max={30}
                step={5}
                size="$3"
              >
                <Slider.Track backgroundColor="$backgroundPress">
                  <Slider.TrackActive backgroundColor="$difficultyEasy" />
                </Slider.Track>
                <Slider.Thumb
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
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
