import { useState, useEffect } from 'react';
import { YStack, XStack, Text, Slider, ScrollView, Button, Sheet, Switch } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from './components/AppHeader';
import { usePreferences } from './hooks/usePreferences';
import { useStatistics } from './hooks/useStatistics';
import { requestPermissions, scheduleDailyReminder, cancelAllReminders } from './services/notifications';
import type { JLPTLevel } from './types/word';

const JLPT_LEVELS: JLPTLevel[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { preferences, isLoading, updatePreferences } = usePreferences();
  const { resetStats, unlockLevel, lockLevel, getUnlockedLevels } = useStatistics();

  // State for unlocked levels
  const [unlockedLevels, setUnlockedLevels] = useState<JLPTLevel[]>([]);

  // Load unlocked levels on mount
  useEffect(() => {
    getUnlockedLevels().then(setUnlockedLevels);
  }, [getUnlockedLevels]);

  // Local state for slider (5-30, step 5)
  const [wordsPerSession, setWordsPerSession] = useState(10);

  // Confirmation dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Slider save feedback
  const [sliderSaved, setSliderSaved] = useState(false);

  // Notification permission denied message
  const [permissionDenied, setPermissionDenied] = useState(false);

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

  // Handle slider release (save to preferences)
  const handleWordsPerSessionCommit = async (value: number[]) => {
    const snapped = Math.round(value[0] / 5) * 5;
    setWordsPerSession(snapped);
    await updatePreferences({ wordsPerSession: snapped });
  };

  // Handle reset statistics confirmation
  const handleResetConfirm = async () => {
    await resetStats();
    setIsConfirmOpen(false);
  };

  // Handle notification toggle
  const handleNotificationToggle = async (enabled: boolean) => {
    setPermissionDenied(false);

    if (enabled) {
      // Request permission first
      const granted = await requestPermissions();

      if (!granted) {
        setPermissionDenied(true);
        return;
      }

      // Schedule the reminder with current time preference
      const time = preferences?.reminderTime ?? '19:00';
      const language = preferences?.translationLanguage ?? 'fr';
      await scheduleDailyReminder(time, language);
      await updatePreferences({ notificationsEnabled: true });
    } else {
      // Cancel all reminders
      await cancelAllReminders();
      await updatePreferences({ notificationsEnabled: false });
    }
  };

  // Handle reminder time change
  const handleReminderTimeChange = async (time: string) => {
    await updatePreferences({ reminderTime: time });

    // Reschedule if notifications are enabled
    if (preferences?.notificationsEnabled) {
      const language = preferences?.translationLanguage ?? 'fr';
      await scheduleDailyReminder(time, language);
    }
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

          {/* Section: Reminders */}
          <YStack gap="$3">
            <Text fontSize={18} fontWeight="600" color="$color">
              {preferences?.translationLanguage === 'fr' ? 'Rappels' : 'Reminders'}
            </Text>

            {/* Notification toggle */}
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
                      ? 'Rappels quotidiens'
                      : 'Daily reminders'}
                  </Text>
                  <Text fontSize={13} color="$gray11" marginTop="$1">
                    {preferences?.translationLanguage === 'fr'
                      ? 'Recevez une notification pour vous rappeler de pratiquer'
                      : 'Get a notification to remind you to practice'}
                  </Text>
                </YStack>
                <Switch
                  size="$4"
                  checked={preferences?.notificationsEnabled ?? false}
                  onCheckedChange={handleNotificationToggle}
                  backgroundColor={preferences?.notificationsEnabled ? '$difficultyEasy' : '$gray8'}
                >
                  <Switch.Thumb
                    animation="quick"
                    backgroundColor="white"
                  />
                </Switch>
              </XStack>

              {/* Permission denied message */}
              {permissionDenied && (
                <Text fontSize={13} color="$red10" marginTop="$2">
                  {preferences?.translationLanguage === 'fr'
                    ? 'Permission refusee. Activez les notifications dans les parametres de votre appareil.'
                    : 'Permission denied. Enable notifications in your device settings.'}
                </Text>
              )}

              {/* Time picker - visible only when notifications enabled */}
              {preferences?.notificationsEnabled && (
                <YStack marginTop="$3" gap="$2">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={14} color="$color">
                      {preferences?.translationLanguage === 'fr'
                        ? 'Heure du rappel'
                        : 'Reminder time'}
                    </Text>
                    <Text fontSize={18} fontWeight="600" color="$blue10">
                      {preferences?.reminderTime ?? '19:00'}
                    </Text>
                  </XStack>
                  <Slider
                    value={[parseInt(preferences?.reminderTime?.split(':')[0] ?? '19', 10)]}
                    min={6}
                    max={22}
                    step={1}
                    onValueChange={(value) => {
                      const hour = value[0].toString().padStart(2, '0');
                      handleReminderTimeChange(`${hour}:00`);
                    }}
                  >
                    <Slider.Track backgroundColor="$gray6">
                      <Slider.TrackActive backgroundColor="$blue10" />
                    </Slider.Track>
                    <Slider.Thumb
                      index={0}
                      circular
                      size="$1.5"
                      backgroundColor="$blue10"
                      borderWidth={2}
                      borderColor="white"
                    />
                  </Slider>
                  <XStack justifyContent="space-between">
                    <Text fontSize={12} color="$gray10">06:00</Text>
                    <Text fontSize={12} color="$gray10">22:00</Text>
                  </XStack>
                </YStack>
              )}
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

            {/* Toggle lock/unlock levels */}
            <YStack
              backgroundColor="$backgroundHover"
              padding="$3"
              borderRadius="$3"
              gap="$2"
            >
              <Text fontSize={15} color="$color" marginBottom="$1">
                {preferences?.translationLanguage === 'fr'
                  ? '🔐 Gérer niveaux'
                  : '🔐 Manage levels'}
              </Text>

              <Text fontSize={13} color="$gray11" marginBottom="$2">
                {preferences?.translationLanguage === 'fr'
                  ? 'Cliquez pour débloquer/verrouiller les niveaux.'
                  : 'Click to unlock/lock levels.'}
              </Text>

              <XStack flexWrap="wrap" gap="$2">
                {JLPT_LEVELS.map((level) => {
                  const isUnlocked = unlockedLevels.includes(level);
                  return (
                    <Button
                      key={level}
                      size="$3"
                      backgroundColor={isUnlocked ? '$green10' : '$gray8'}
                      pressStyle={{ opacity: 0.8, scale: 0.98 }}
                      animation="quick"
                      onPress={async () => {
                        if (isUnlocked) {
                          await lockLevel(level);
                        } else {
                          await unlockLevel(level);
                        }
                        const updated = await getUnlockedLevels();
                        setUnlockedLevels(updated);
                      }}
                    >
                      <Text fontSize={12} fontWeight="600" color="white">
                        {isUnlocked ? '🔓' : '🔒'} {level}
                      </Text>
                    </Button>
                  );
                })}
              </XStack>
            </YStack>
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
