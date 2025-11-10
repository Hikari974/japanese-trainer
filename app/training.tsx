import { YStack, H2, Button, Text } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from './components/AppHeader';

export default function TrainingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ level: string; difficulty: string }>();

  return (
    <YStack flex={1} backgroundColor="$background">
      <AppHeader title="Session d'entraînement" showBackButton />

      <YStack flex={1} padding="$4" gap="$4" paddingBottom={insets.bottom + 16}>

      {/* Session Info */}
      <YStack
        backgroundColor="$backgroundHover"
        padding="$4"
        borderRadius="$4"
        gap="$3"
        marginTop="$4"
      >
        <H2 fontSize={20} color="$color">
          Configuration
        </H2>
        <YStack gap="$2">
          <Text fontSize={16} color="$color">
            <Text fontWeight="bold">Niveau:</Text> {params.level || 'Non sélectionné'}
          </Text>
          <Text fontSize={16} color="$color">
            <Text fontWeight="bold">Difficulté:</Text> {params.difficulty || 'Non sélectionnée'}
          </Text>
        </YStack>
      </YStack>

        {/* Placeholder message */}
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
          <Text fontSize={16} color="$colorTranslucent" textAlign="center">
            Fonctionnalité d'entraînement à implémenter
          </Text>
        </YStack>
      </YStack>
    </YStack>
  );
}
