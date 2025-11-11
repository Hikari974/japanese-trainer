# Changelog - japanese-trainer

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete training session page with 5 UI zones (239 lines)
  - Compact session info (level + difficulty)
  - ScrollingText integration with difficulty-based parameters
  - Romaji keyboard grid (46 buttons, 5x10 layout)
  - Input field with visual validation feedback
  - Start/Stop controls with state machine
- Flexible romaji validation (shi/si, tsu/tu, chi/ti, fu/hu)
- Mock words system (temporary: にほんご, こんにちは, ありがとう)
- Auto-progression on correct answer (1s delay)
- Compact UI optimized for single-screen fit (Android safe area)
- User preferences management with AsyncStorage for persistent level and difficulty selection
- Service layer `app/services/preferences.ts` for local storage operations (loadPreferences, savePreferences)
- React hook `app/hooks/usePreferences.ts` for UI integration with optimistic updates
- 21 comprehensive tests for preferences (12 service tests + 9 hook tests, 100% coverage)
- Automatic preferences loading on home screen mount
- Automatic preferences saving before training session start
- Pre-selection of last used level and difficulty on app launch
- Offline-first architecture (100% local storage, no server required)

### Fixed
- Memory leak: setTimeout cleanup on component unmount (training.tsx)
- Closure bug: setState functional form for currentWordIndex (training.tsx)

### Changed
- Home screen (`app/index.tsx`) now loads and saves user preferences automatically
- "Start Session" button now saves preferences before navigation (async operation)
- Test suite expanded from 15 to 36 tests (all passing)

### ⚠️ Technical Debt
- training.tsx: Tests pending (manual validation only, 239 lines)
  - Priority: P0 (MUST complete before new features)
  - Validation: Code Review approved, manual testing passed

### Technical Details
- Added dependency: `@react-native-async-storage/async-storage` v2.1.0
- AsyncStorage mock added to `jest.setup.js` for testing
- Error handling with graceful fallback to defaults on all storage errors
- Extensible architecture ready for statistics persistence

## [0.1.0] - 2025-11-10

### Added
- Initial project setup with Expo SDK 54.0.23 (React Native 0.81.5)
- Tamagui v1.136.9 UI library integration with dark theme
- expo-router v6.0.14 file-based routing configuration
- Home screen with level selection (Kana, N5-N1) and difficulty selector (Easy, Normal, Hard)
- Training session page with level and difficulty display
- POC scrolling text with Hiragana animation at multiple speeds
- Modern UI components:
  - `LevelButton.tsx` - Animated level selection buttons
  - `DifficultySelector.tsx` - Compact difficulty selector with color-coded circles
  - `AppHeader.tsx` - Reusable header with safe area support and back navigation
  - `ScrollingText.tsx` - Animated text scrolling component
- Navigation to placeholder pages (stats, settings)
- Jest and React Testing Library infrastructure
- 15 comprehensive UI tests with 100% coverage of main components:
  - `LevelButton.test.tsx` (3 tests)
  - `DifficultySelector.test.tsx` (4 tests)
  - `index.test.tsx` HomeScreen (8 tests including session button)
- Android safe area support with `react-native-safe-area-context`
- Claude Code methodology framework with enforcement procedures

### Changed
- Root layout (`app/_layout.tsx`) configured with SafeAreaProvider and system header hidden
- All pages use AppHeader for consistent navigation and safe area handling

### Technical Stack
- Platform: Expo SDK 54 (React Native 0.81.5)
- UI: Tamagui v1.136.9
- Navigation: expo-router v6.0.14
- Testing: Jest + React Testing Library
- State Management: React hooks
- Safe Areas: react-native-safe-area-context
- Animations: react-native-reanimated

### Development
- Git repository initialized on GitHub
- .gitignore configured for Expo projects
- TypeScript configuration
- Babel configuration with Tamagui plugin
- Jest configuration with Expo preset and Tamagui mocks

---

**Current Version:** 0.1.0
**Last Updated:** 2025-11-10
