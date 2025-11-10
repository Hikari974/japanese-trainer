// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: ({ children }) => children,
  Stack: {
    Screen: () => null,
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Tamagui to avoid config loading issues
jest.mock('tamagui', () => {
  const React = require('react');
  return {
    TamaguiProvider: ({ children }) => children,
    YStack: ({ children, ...props }) => React.createElement('View', props, children),
    XStack: ({ children, ...props }) => React.createElement('View', props, children),
    Button: ({ children, ...props }) => React.createElement('View', props, children),
    Text: ({ children, ...props }) => React.createElement('Text', props, children),
    H1: ({ children, ...props }) => React.createElement('Text', props, children),
    H2: ({ children, ...props }) => React.createElement('Text', props, children),
    Paragraph: ({ children, ...props }) => React.createElement('Text', props, children),
    Circle: ({ ...props }) => React.createElement('View', props),
    createTamagui: () => ({}),
    createTokens: (tokens) => tokens,
  };
});
