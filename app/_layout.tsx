import { Stack } from 'expo-router';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
      </Stack>
    </TamaguiProvider>
  );
}
