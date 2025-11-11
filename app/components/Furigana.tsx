/**
 * Furigana Component
 * Displays Japanese text with optional furigana (kana reading) above kanji
 */

import { YStack, Text } from 'tamagui';

interface FuriganaProps {
  kanji: string;           // Kanji text to display
  kana: string;            // Kana reading (furigana)
  showFurigana?: boolean;  // Whether to show furigana above kanji
  fontSize?: number;       // Font size for kanji (default: 32)
}

export function Furigana({
  kanji,
  kana,
  showFurigana = true,
  fontSize = 32,
}: FuriganaProps) {
  // If no kanji or furigana not requested, just show kana
  if (!kanji || !showFurigana) {
    return (
      <Text fontSize={fontSize} color="$color" fontWeight="500">
        {kana}
      </Text>
    );
  }

  // Show kanji with furigana above
  return (
    <YStack alignItems="center" gap="$1">
      {/* Furigana (kana reading) - smaller, semi-transparent */}
      <Text
        fontSize={fontSize * 0.375}  // 12pt for 32pt kanji
        color="$color"
        opacity={0.7}
        fontWeight="400"
      >
        {kana}
      </Text>

      {/* Kanji - main text */}
      <Text fontSize={fontSize} color="$color" fontWeight="500">
        {kanji}
      </Text>
    </YStack>
  );
}
