import { YStack, H1, Paragraph, Button } from 'tamagui';

export default function HomeScreen() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
      <H1>Welcome to japanese-trainer</H1>
      <Paragraph theme="alt2">Built with Expo + Tamagui</Paragraph>
      <Button marginTop="$4">Get Started</Button>
    </YStack>
  );
}
