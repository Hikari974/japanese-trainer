import { useState, useEffect } from 'react';
import { YStack, XStack, Text, Slider, ScrollView, Button, Sheet } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from './components/AppHeader';
import { usePreferences } from './hooks/usePreferences';
import { useStatistics } from './hooks/useStatistics';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { preferences, isLoading, updatePreferences } = usePreferences();
  const { resetStats } = useStatistics();

  // Local state for slider (5-30, step 5)
  const [wordsPerSession, setWordsPerSession] = useState(10);

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  // Handle reset statistics confirmation
  const handleResetConfirm = async () => {
    await resetStats();
    setIsConfirmOpen(false);
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

          {/* Section: Data Management */}
          <YStack gap="$3">
            <Text fontSize={18} fontWeight="600" color="$color">
              {preferences?.translationLanguage === 'fr' ? 'Gestion des données' : 'Data management'}
            </Text>

            {/* Reset statistics button */}
            <YStack
              backgroundColor="$backgroundHover"
              padding="$3"
              borderRadius="$3"
              gap="$2"
            >
              <Text fontSize={15} color="$color" marginBottom="$1">
                {preferences?.translationLanguage === 'fr'
                  ? 'Réinitialiser les statistiques'
                  : 'Reset statistics'}
              </Text>

              <Text fontSize={13} color="$gray11" marginBottom="$2">
                {preferences?.translationLanguage === 'fr'
                  ? 'Efface tous vos points et historique d\'entraînement. Cette action est irréversible.'
                  : 'Delete all your points and training history. This action cannot be undone.'}
              </Text>

              <Button
                backgroundColor="$red10"
                color="white"
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                animation="quick"
                onPress={() => setIsConfirmOpen(true)}
              >
                <Text fontSize={14} fontWeight="600" color="white">
                  {preferences?.translationLanguage === 'fr' ? 'Réinitialiser' : 'Reset'}
                </Text>
              </Button>
            </YStack>

            {/* DEBUG: Unlock all levels button (DEV only) */}
            {__DEV__ && (
              <YStack
                backgroundColor="$backgroundHover"
                padding="$3"
                borderRadius="$3"
                gap="$2"
              >
                <Text fontSize={15} color="$color" marginBottom="$1">
                  {preferences?.translationLanguage === 'fr'
                    ? '🔓 Débloquer tous les niveaux'
                    : '🔓 Unlock all levels'}
                </Text>

                <Text fontSize={13} color="$gray11" marginBottom="$2">
                  {preferences?.translationLanguage === 'fr'
                    ? 'Déverrouille Kana, N5, N4, N3, N2 et N1 pour tester l\'application. (DEV uniquement)'
                    : 'Unlocks Kana, N5, N4, N3, N2 and N1 for testing purposes. (DEV only)'}
                </Text>

                <Button
                  backgroundColor="$blue10"
                  color="white"
                  pressStyle={{ opacity: 0.8, scale: 0.98 }}
                  animation="quick"
                  onPress={async () => {
                    const levels: JLPTLevel[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];
                    for (const level of levels) {
                      await unlockLevel(level);
                    }
                    if (__DEV__) {
                      console.log('✅ All levels unlocked for testing');
                    }
                  }}
                >
                  <Text fontSize={14} fontWeight="600" color="white">
                    {preferences?.translationLanguage === 'fr' ? 'Débloquer tout' : 'Unlock all'}
                  </Text>
                </Button>
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>

      {/* Confirmation Dialog */}
      <Sheet
        modal
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        snapPoints={[40]}
        dismissOnSnapToBottom
        animation="quick"
      >
        <Sheet.Overlay
          backgroundColor="rgba(0, 0, 0, 0.6)"
          animation="quick"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Sheet.Frame
          backgroundColor="$background"
          borderTopLeftRadius="$6"
          borderTopRightRadius="$6"
          padding="$6"
        >
          <YStack gap="$4">
            <Text fontSize={20} fontWeight="700" textAlign="center">
              {preferences?.translationLanguage === 'fr'
                ? 'Confirmer la réinitialisation'
                : 'Confirm reset'}
            </Text>

            <Text fontSize={16} color="$gray11" textAlign="center">
              {preferences?.translationLanguage === 'fr'
                ? 'Êtes-vous sûr de vouloir effacer toutes vos statistiques ? Cette action est irréversible.'
                : 'Are you sure you want to delete all your statistics? This action cannot be undone.'}
            </Text>

            <XStack gap="$3" marginTop="$2">
              <Button
                flex={1}
                backgroundColor="$gray5"
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                animation="quick"
                onPress={() => setIsConfirmOpen(false)}
              >
                <Text fontSize={16} fontWeight="600" color="$gray12">
                  {preferences?.translationLanguage === 'fr' ? 'Annuler' : 'Cancel'}
                </Text>
              </Button>

              <Button
                flex={1}
                backgroundColor="$red10"
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                animation="quick"
                onPress={handleResetConfirm}
              >
                <Text fontSize={16} fontWeight="600" color="white">
                  {preferences?.translationLanguage === 'fr' ? 'Confirmer' : 'Confirm'}
                </Text>
              </Button>
            </XStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
