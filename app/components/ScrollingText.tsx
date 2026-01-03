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
import { Furigana } from './Furigana';

interface ScrollingTextProps {
  kanji: string;              // Kanji text (empty for kana-only words)
  kana: string;               // Kana reading (always present)
  speed: number;              // pixels per second (0 = stopped)
  windowWidth: number;
  fontSize: number;
  showFurigana: boolean;      // Whether to show furigana above kanji
  onScrollComplete?: () => void; // Callback when scroll animation completes
}

export const ScrollingText = memo(function ScrollingText({
  kanji,
  kana,
  speed,
  windowWidth,
  fontSize,
  showFurigana,
  onScrollComplete
}: ScrollingTextProps) {
  const translateX = useSharedValue(windowWidth);
  const opacity = useSharedValue(1);

  // Text to display: kanji if available, otherwise kana
  const displayText = kanji || kana;
  // Height adjustment: taller when showing furigana
  const containerHeight = showFurigana && kanji ? fontSize * 2 : fontSize * 1.5;

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
    const estimatedTextWidth = fontSize * displayText.length * 0.9;
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
  }, [kanji, kana, speed, windowWidth, fontSize]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <YStack
      width={windowWidth}
      height={containerHeight}
      overflow="hidden"
      backgroundColor="$background"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$2"
      justifyContent="center"
    >
      <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
        {showFurigana && kanji ? (
          <Furigana
            kanji={kanji}
            kana={kana}
            showFurigana={true}
            fontSize={fontSize}
          />
        ) : (
          <Text fontSize={fontSize} fontWeight="bold" color="$color">
            {displayText}
          </Text>
        )}
      </Animated.View>
    </YStack>
  );
});
