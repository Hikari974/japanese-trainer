import React, { useEffect, memo } from 'react';
import { Text, YStack } from 'tamagui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';

interface ScrollingTextProps {
  text: string;
  speed: number; // pixels per second (0 = stopped)
  windowWidth: number;
  fontSize: number;
  onScrollComplete?: () => void; // Callback when scroll animation completes
}

export const ScrollingText = memo(function ScrollingText({
  text,
  speed,
  windowWidth,
  fontSize,
  onScrollComplete
}: ScrollingTextProps) {
  const translateX = useSharedValue(windowWidth);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (speed === 0) {
      // Reset position and show text when stopped
      cancelAnimation(translateX);
      translateX.value = windowWidth;
      opacity.value = 1;
      return;
    }

    // Speed > 0: start scrolling animation
    opacity.value = 1;

    // Estimate text width (rough approximation for Japanese characters)
    const estimatedTextWidth = fontSize * text.length * 0.9;
    const totalDistance = windowWidth + estimatedTextWidth;
    const duration = (totalDistance / speed) * 1000; // convert to milliseconds

    // Single scroll animation with callback
    translateX.value = withTiming(
      -estimatedTextWidth,
      {
        duration,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) {
          // Hide text after animation completes
          opacity.value = 0;
          // Notify parent
          if (onScrollComplete) {
            runOnJS(onScrollComplete)();
          }
        }
      }
    );
  }, [text, speed, windowWidth, fontSize]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <YStack
      width={windowWidth}
      height={fontSize * 1.5}
      overflow="hidden"
      backgroundColor="$background"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$2"
    >
      <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
        <Text fontSize={fontSize} fontWeight="bold">
          {text}
        </Text>
      </Animated.View>
    </YStack>
  );
});
