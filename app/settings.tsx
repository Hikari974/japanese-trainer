import { YStack, H2, Paragraph } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from './components/AppHeader';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <YStack flex={1} backgroundColor="$background">
      <AppHeader title="Paramètres" showBackButton />
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding="$4"
        paddingBottom={insets.bottom + 16}
      >
        <H2>Paramètres</H2>
        <Paragraph theme="alt2" marginTop="$2">
          Page en construction...
        </Paragraph>
      </YStack>
    </YStack>
  );
}
