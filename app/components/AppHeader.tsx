import { XStack, H1, Button, Text } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export function AppHeader({ title, showBackButton = false, onBackPress }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <XStack
      paddingTop={insets.top + 16}
      paddingHorizontal="$4"
      paddingBottom="$4"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      alignItems="center"
      justifyContent="center"
      position="relative"
      backgroundColor="$background"
    >
      {showBackButton && (
        <Button
          size="$3"
          chromeless
          position="absolute"
          left="$4"
          onPress={handleBackPress}
          accessibilityLabel="Retour"
        >
          <Text fontSize={24}>←</Text>
        </Button>
      )}
      <H1 fontSize={24} color="$color" fontWeight="bold">
        {title}
      </H1>
    </XStack>
  );
}
