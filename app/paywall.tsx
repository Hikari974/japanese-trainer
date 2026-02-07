/**
 * Paywall Screen - TEMPORARILY DISABLED
 * Premium features will be enabled after Google Play setup
 */
import { YStack, Text, Button } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from './components/AppHeader';

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <YStack flex={1} backgroundColor="$background">
      <AppHeader title="Premium" showBackButton />
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
        <Text fontSize={48}>🚧</Text>
        <Text fontSize={20} fontWeight="bold" color="$color" textAlign="center">
          Premium bientôt disponible
        </Text>
        <Text fontSize={14} color="$gray11" textAlign="center">
          Cette fonctionnalité sera activée après la configuration Google Play.
        </Text>
        <Button
          marginTop="$4"
          backgroundColor="$difficultyEasy"
          onPress={() => router.back()}
        >
          <Text color="white" fontWeight="600">Retour</Text>
        </Button>
      </YStack>
    </YStack>
  );
}
