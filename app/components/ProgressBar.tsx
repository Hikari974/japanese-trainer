import React from 'react';
import { YStack, type StackProps } from 'tamagui';

export interface ProgressBarProps {
  /**
   * Progress value (0-100)
   */
  value: number;

  /**
   * Height of the progress bar in pixels
   * @default 4
   */
  height?: number;

  /**
   * Color of the filled portion
   * @default '$blue10'
   */
  color?: string;

  /**
   * Background color of the unfilled portion
   * @default '$gray5'
   */
  backgroundColor?: string;

  /**
   * Additional Stack props for the container
   */
  containerProps?: StackProps;
}

/**
 * Reusable horizontal progress bar component
 * Displays a filled bar representing progress from 0 to 100%
 *
 * @example
 * <ProgressBar value={65} />
 * <ProgressBar value={100} color="$green10" />
 */
export function ProgressBar({
  value,
  height = 4,
  color = '$blue10',
  backgroundColor = '$gray5',
  containerProps,
}: ProgressBarProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <YStack
      width="100%"
      height={height}
      backgroundColor={backgroundColor}
      borderRadius={height / 2}
      overflow="hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
      {...containerProps}
    >
      <YStack
        width={`${clampedValue}%`}
        height="100%"
        backgroundColor={color}
        animation="smooth"
        animateOnly={['width']}
      />
    </YStack>
  );
}
