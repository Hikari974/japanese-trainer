import React, { useEffect } from 'react';
import { Text, YStack } from 'tamagui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ScrollingTextProps {
  text: string;
  speed: number; // pixels per second
  windowWidth: number;
  fontSize: number;
}

export function ScrollingText({ text, speed, windowWidth, fontSize }: ScrollingTextProps) {
  const translateX = useSharedValue(windowWidth);

  useEffect(() => {
    // Estimate text width (rough approximation for Japanese characters)
    const estimatedTextWidth = fontSize * text.length * 0.9;
    const totalDistance = windowWidth + estimatedTextWidth;
    const duration = (totalDistance / speed) * 1000; // convert to milliseconds

    translateX.value = withRepeat(
      withTiming(-estimatedTextWidth, {
        duration,
        easing: Easing.linear,
      }),
      -1, // infinite loop
      false
    );
  }, [text, speed, windowWidth, fontSize]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
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
}
