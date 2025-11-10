import { YStack, H1, H2, Button, Text } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function TrainingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ level: string; difficulty: string }>();

  return (
    <YStack flex={1} backgroundColor="$background" padding="$4" gap="$4">
      {/* Header */}
      <YStack gap="$2" paddingTop="$4">
        <H1 fontSize={32} color="$color" textAlign="center">
          Session d'entraînement
        </H1>
      </YStack>

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

      {/* Back button */}
      <Button
        size="$5"
        backgroundColor="$backgroundHover"
        onPress={() => router.back()}
        accessibilityLabel="Retour à l'accueil"
      >
        <Text fontSize={18} color="$color">
          Retour
        </Text>
      </Button>
    </YStack>
  );
}
