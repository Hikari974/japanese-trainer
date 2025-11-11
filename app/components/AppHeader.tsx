import { XStack, H1, Button } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
      paddingTop={insets.top + 8}
      paddingHorizontal="$4"
      paddingBottom="$2"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      alignItems="center"
      justifyContent="space-between"
      backgroundColor="$background"
    >
      {showBackButton ? (
        <Button
          size="$4"
          chromeless
          onPress={handleBackPress}
          accessibilityLabel="Retour"
          pressStyle={{ opacity: 0.6, scale: 0.95 }}
          animation="quick"
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </Button>
      ) : (
        <XStack width={48} />
      )}
      <H1 fontSize={24} color="$color" fontWeight="bold">
        {title}
      </H1>
      <XStack width={48} />
    </XStack>
  );
}
