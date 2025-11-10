import { YStack, H2, Paragraph, XStack } from 'tamagui';
import { ScrollingText } from './components/ScrollingText';

export default function PocScrollScreen() {
  return (
    <YStack flex={1} padding="$4" backgroundColor="$background" gap="$4">
      <H2>POC - Défilement Hiragana</H2>
      <Paragraph theme="alt2">
        Test de にほんご (nihongo) avec différentes vitesses et tailles
      </Paragraph>

      {/* Test 1: Lente & Large */}
      <YStack gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <Paragraph fontWeight="bold">1. Lente & Large</Paragraph>
          <Paragraph fontSize={12} color="$gray10">
            50px/s • 300px • 32pt
          </Paragraph>
        </XStack>
        <ScrollingText text="にほんご" speed={50} windowWidth={300} fontSize={32} />
      </YStack>

      {/* Test 2: Moyenne & Medium */}
      <YStack gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <Paragraph fontWeight="bold">2. Moyenne & Medium</Paragraph>
          <Paragraph fontSize={12} color="$gray10">
            150px/s • 200px • 24pt
          </Paragraph>
        </XStack>
        <ScrollingText text="にほんご" speed={150} windowWidth={200} fontSize={24} />
      </YStack>

      {/* Test 3: Rapide & Petite */}
      <YStack gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <Paragraph fontWeight="bold">3. Rapide & Petite</Paragraph>
          <Paragraph fontSize={12} color="$gray10">
            300px/s • 150px • 18pt
          </Paragraph>
        </XStack>
        <ScrollingText text="にほんご" speed={300} windowWidth={150} fontSize={18} />
      </YStack>

      {/* Test 4: Très rapide */}
      <YStack gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <Paragraph fontWeight="bold">4. Très Rapide (limite)</Paragraph>
          <Paragraph fontSize={12} color="$gray10">
            500px/s • 250px • 28pt
          </Paragraph>
        </XStack>
        <ScrollingText text="にほんご" speed={500} windowWidth={250} fontSize={28} />
      </YStack>

      <Paragraph fontSize={12} color="$gray10" marginTop="$4">
        Testez la fluidité et la lisibilité à différentes vitesses
      </Paragraph>
    </YStack>
  );
}
