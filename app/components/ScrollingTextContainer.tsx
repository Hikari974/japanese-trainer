import { memo } from 'react';
import { ScrollingText } from './ScrollingText';
import type { DisplayWord } from '../types/word';

interface ScrollingTextContainerProps {
  currentWord: DisplayWord | undefined;
  speed: number;
  windowWidth: number;
  fontSize: number;
  showFurigana: boolean;  // User preference for showing furigana
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
  showFurigana,
  onScrollComplete,
}: ScrollingTextContainerProps) {
  // Determine if furigana should be shown for this word
  // Show furigana only if: word supports it AND user preference is enabled
  const shouldShowFurigana = showFurigana && (currentWord?.showFurigana ?? false);

  return (
    <ScrollingText
      kanji={currentWord?.kanji || ''}
      kana={currentWord?.kana || ''}
      speed={speed}
      windowWidth={windowWidth}
      fontSize={fontSize}
      showFurigana={shouldShowFurigana}
      onScrollComplete={onScrollComplete}
    />
  );
}, (prev, next) => {
  // Custom comparison: only re-render if these specific props change
  return (
    prev.speed === next.speed &&
    prev.windowWidth === next.windowWidth &&
    prev.fontSize === next.fontSize &&
    prev.showFurigana === next.showFurigana &&
    prev.currentWord?.id === next.currentWord?.id &&
    prev.onScrollComplete === next.onScrollComplete
  );
});
