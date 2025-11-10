import { config } from '@tamagui/config/v3';
import { createTamagui, createTokens } from 'tamagui';

// Custom dark theme colors
const customColors = {
  // Dark mode palette
  darkBackground: '#0a0a0a',
  darkSurface: '#1a1a1a',
  darkSurfaceHover: '#252525',
  darkBorder: '#2a2a2a',
  darkTextPrimary: '#ffffff',
  darkTextSecondary: '#aaa',
  darkTextTertiary: '#888',

  // Level colors
  levelKana: '#10b981',
  levelN5: '#3b82f6',
  levelN4: '#8b5cf6',
  levelN3: '#a855f7',
  levelN2: '#ec4899',
  levelN1: '#ef4444',

  // Difficulty colors
  difficultyEasy: '#4ade80',
  difficultyNormal: '#60a5fa',
  difficultyHard: '#f59e0b',
  difficultyExtreme: '#ef4444',
};

const tokens = createTokens({
  ...config.tokens,
  color: {
    ...config.tokens.color,
    ...customColors,
  },
});

const tamaguiConfig = createTamagui({
  ...config,
  tokens,
  themes: {
    ...config.themes,
    dark: {
      ...config.themes.dark,
      background: customColors.darkBackground,
      backgroundHover: customColors.darkSurface,
      backgroundPress: customColors.darkSurfaceHover,
      borderColor: customColors.darkBorder,
      color: customColors.darkTextPrimary,
    },
  },
});

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
