import { YStack, H1, Paragraph, Button } from 'tamagui';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$3">
      <H1>Welcome to japanese-trainer</H1>
      <Paragraph theme="alt2">Built with Expo + Tamagui</Paragraph>

      <Link href="/poc-scroll" asChild>
        <Button marginTop="$4">Test POC Scroll</Button>
      </Link>

      <Button>Get Started</Button>
    </YStack>
  );
}
