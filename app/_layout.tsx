import { Stack } from 'expo-router';
import { TamaguiProvider, YStack } from 'tamagui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import config from '../tamagui.config';

export default function RootLayout() {
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
            <Stack.Screen name="paywall" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </YStack>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
