import { YStack, H2, Paragraph } from 'tamagui';

export default function SettingsScreen() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor="$background">
      <H2>Paramètres</H2>
      <Paragraph theme="alt2" marginTop="$2">
        Page en construction...
      </Paragraph>
    </YStack>
  );
}
