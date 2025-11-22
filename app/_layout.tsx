import { Stack } from 'expo-router';
import { TamaguiProvider, YStack } from 'tamagui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import config from '../tamagui.config';
import { LevelUnlockModal } from './components/LevelUnlockModal';
import { ConfettiEffect } from './components/ConfettiEffect';
import { useLevelUnlockListener } from './hooks/useLevelUnlockListener';
import { useStatistics } from './hooks/useStatistics';

export default function RootLayout() {
  const { registerUnlockCallback } = useStatistics();
  const { isModalOpen, unlockedLevel, previousLevel, handleStartTraining, handleDismiss } =
    useLevelUnlockListener(registerUnlockCallback);

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config} defaultTheme="dark">
        <YStack flex={1}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="training" options={{ headerShown: false }} />
            <Stack.Screen name="stats" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="tutorial" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)/level-progress/[level]" options={{ headerShown: false }} />
          </Stack>

          {/* Global Level Unlock Modal + Confetti */}
          {isModalOpen && unlockedLevel && previousLevel && (
            <>
              <ConfettiEffect active={isModalOpen} />
              <LevelUnlockModal
                open={isModalOpen}
                unlockedLevel={unlockedLevel}
                previousLevel={previousLevel}
                onStartTraining={handleStartTraining}
                onDismiss={handleDismiss}
              />
            </>
          )}
        </YStack>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
