import { memo } from 'react';
import { ScrollingText } from './ScrollingText';
import type { DisplayWord } from '../types/word';

interface ScrollingTextContainerProps {
  currentWord: DisplayWord | undefined;
  speed: number;
  windowWidth: number;
  fontSize: number;
  onScrollComplete: () => void;
}

/**
 * Container for ScrollingText with custom memoization
 * Prevents re-renders when unrelated state changes (inputText, validationFeedback, etc.)
 */
export const ScrollingTextContainer = memo(function ScrollingTextContainer({
  currentWord,
  speed,
  windowWidth,
  fontSize,
  onScrollComplete,
}: ScrollingTextContainerProps) {
  const text = currentWord?.kanji || currentWord?.kana || '';

  return (
    <ScrollingText
      text={text}
      speed={speed}
      windowWidth={windowWidth}
      fontSize={fontSize}
      onScrollComplete={onScrollComplete}
    />
  );
}, (prev, next) => {
  // Custom comparison: only re-render if these specific props change
  return (
    prev.speed === next.speed &&
    prev.windowWidth === next.windowWidth &&
    prev.fontSize === next.fontSize &&
    prev.currentWord?.id === next.currentWord?.id &&
    prev.onScrollComplete === next.onScrollComplete
  );
});
