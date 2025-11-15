import React, { useEffect, useState } from 'react';
import { YStack, Text, AnimatePresence } from 'tamagui';
import { useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const EMOJIS = ['🎉', '✨', '🎊', '⭐', '💫', '🌟'];
const PARTICLE_COUNT = 25;

interface Particle {
  id: number;
  emoji: string;
  startX: number;
  delay: number;
  duration: number;
  rotation: number;
}

export interface ConfettiEffectProps {
  /**
   * Whether the confetti animation is active
   */
  active: boolean;
}

/**
 * Confetti particle component with fall animation
 */
function ConfettiParticle({ particle, height }: { particle: Particle; height: number }) {
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      particle.delay,
      withTiming(height + 50, {
        duration: particle.duration,
        easing: Easing.linear,
      })
    );

    opacity.value = withDelay(
      particle.delay + particle.duration * 0.7,
      withTiming(0, { duration: particle.duration * 0.3 })
    );
  }, [particle, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${particle.rotation}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: particle.startX,
          top: 0,
        },
        animatedStyle,
      ]}
    >
      <Text fontSize={24}>{particle.emoji}</Text>
    </Animated.View>
  );
}

/**
 * Confetti effect overlay with falling emoji particles
 * Uses Tamagui + react-native-reanimated (no external confetti library)
 */
export function ConfettiEffect({ active }: ConfettiEffectProps) {
  const { width, height } = useWindowDimensions();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      // Generate random particles
      const newParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        startX: Math.random() * width,
        delay: Math.random() * 200,
        duration: 2000 + Math.random() * 1000,
        rotation: Math.random() * 360,
      }));

      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [active, width]);

  if (!active) return null;

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      pointerEvents="none"
      zIndex={9999}
    >
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} particle={particle} height={height} />
      ))}
    </YStack>
  );
}
