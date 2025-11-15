# Changelog - japanese-trainer

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Epic-006: Système de progression et déblocage séquentiel des niveaux JLPT
  - 8 User Stories créées (US-006.1 à US-006.8)
  - Epic document avec contexte technique, architecture et plan de tests
  - Ordre séquentiel: Kana → N5 → N4 → N3 → N2 → N1
  - Critère de maîtrise: minimum 5 points sur chaque mot du niveau
  - Effort total estimé: 6-8 jours
- US-006.1: Calcul automatique progression par niveau (Epic-006)
  - Interface LevelProgress pour tracking progression
  - Fonction calculateLevelProgress() avec règles pioche cumulative
  - Hook useStatistics.calculateProgress() pour UI
  - 23 tests unitaires (coverage 97%)
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
- Complete JLPT words database (726 words: Kana 137, N5 134, N4 121, N3 113, N2 118, N1 103)
  - Format: kanji, kana, romaji, French and English translations
  - Service `app/services/wordSelection.ts` for random word selection (10 words per session)
- Bilingual support (French/English) with auto-detection
  - `expo-localization` for device language detection
  - Language selector in settings page (FR/EN toggle)
  - Preferences extended with `language` field ('fr' | 'en')
  - Bilingual labels in training page (counters, translations)
- Restructured training UI for better usability
  - Counter bar: "Words: 1/10" + "Starts: 3" (bilingual)
  - Translation toggle with eye icon
  - Horizontal layout: Start button + ScrollingText window
  - AppHeader reduced to 60px for better screen usage
  - RomajiKeyboard extracted as separate component (56 lines)
- ScrollingText performance optimizations
  - ScrollView removed (eliminated JS/UI thread conflict)
  - Removed animation="quick" from 50 buttons (50 AnimatedViews → 0)
  - ScrollingTextContainer with custom memoization
  - Single-pass animation (infinite loop → once then hide)
  - Result: Smooth ScrollingText, zero stuttering
- **Multi-mode Romaji Keyboard** (Session 3)
  - 4 toggle modes: Base (46 syllables), Dakuten ゛ (20), Handakuten ゜ (5), Yōon ゃ (33)
  - Total coverage: 104 romaji syllables
  - Mode selector with visual feedback (active/inactive button states)
  - Adaptive grid layout (3 or 5 columns depending on mode)
  - Component size: 57 → 157 lines
- **Manual Validation Flow with Modal Feedback** (Session 3)
  - Tamagui Sheet modal for instant user feedback
  - Green modal on correct answer with ✓ icon
  - Red modal on incorrect answer with ✗ icon + correct answer display
  - "Next →" button for manual progression control
  - Instant modal appearance (animations disabled for maximum responsiveness)
  - Training page: 329 → 410 lines
- **Complete Statistics System with AsyncStorage** (Session 4)
  - Service layer `app/services/statistics.ts` for statistics tracking (178 lines)
  - React hook `app/hooks/useStatistics.ts` for UI integration (53 lines)
  - TypeScript interfaces in `app/types/statistics.ts` (52 lines)
  - Composite keys `"${wordId}-${level}-${difficulty}"` for per-word-level-difficulty tracking
  - Simplified scoring: 1 point per perfect attempt (correct + 1 reading + translation not viewed)
  - Global statistics aggregated from word stats (single source of truth)
  - Statistics by level (Kana, N5, N4, N3, N2, N1)
  - Offline-first: 100% AsyncStorage local persistence
  - Comprehensive tests: 49 tests (35 service + 14 hook), 94-100% coverage
- **MVP Statistics Page** (Session 4)
  - Complete rewrite of `app/stats.tsx` (26 → 187 lines)
  - Global statistics section: total points, attempts, success rate, perfect count, unique words
  - Level breakdown section: 6 cards with colored indicators, points and attempts per level
  - Success rate color-coded: green (≥70%) or orange
  - Loading spinner and empty state handling
  - Clean MVP design without charts (per user preference)
- **Reset Statistics with Confirmation** (Session 4)
  - Settings page extended with "Data Management" section (114 lines added)
  - Red reset button with warning icon
  - Tamagui Sheet confirmation modal with Cancel/Confirm buttons
  - Warning text: "irréversible / cannot be undone"
  - Bilingual support (FR/EN) based on user preferences
  - Safety: backdrop does not dismiss, explicit choice required
- **Statistics Integration in Training Flow** (Session 4)
  - Training page extended to record statistics (48 lines added)
  - Automatic recording after each validation
  - Modal feedback shows "+1" when point earned
  - Translation always visible in modal (success and failure)
  - State capture timing fixed to prevent race conditions
- **Extended RomajiKeyboard with Double Consonants and Foreign Syllables** (Session 5)
  - Mode reorganization: Dakuten (゛) + Handakuten (゜) merged into single "゛゜" mode (30 syllables)
  - Double consonants added: k,s,t,m in Base mode, g,z,d,b,p in ゛゜ mode (9 buttons for small tsu っ support)
  - New Foreign mode "外": 22 modern katakana syllables (fa, fi, fe, fo, wi, we, wo, va, vi, vu, ve, vo, ti, di, tu, du, she, tsa, dyu, je)
  - Total syllable coverage: 130 (Base: 50, ゛゜: 30, Yōon: 33, Foreign: 22)
  - Component size: 120 lines modified (+55/-29 = 26 net)
- **Extended Romaji Normalization** (Session 5)
  - Normalization jy→j (e.g., "jyoubu" → "joubu")
  - Normalization chy→ch (e.g., "chyawan" → "chawan")
  - Pattern cchi→tchi (e.g., "kocchi" → "kotchi" for っち)
  - Protection for "chu" in hu→fu normalization (prevents "chu" → "cfu")
  - Double consonant validation support (k,s,t,m,g,z,d,b,p before vowels)
  - Training.tsx: 30 lines modified (+31/-2 = 29 net)
- **Comprehensive Keyboard Coverage Test** (Session 5)
  - Data-driven test: RomajiKeyboard.coverage.test.ts (292 lines)
  - Tests all 1309 words from JLPT database
  - Result: 100% coverage on valid data (1167/1167 words)
  - Filters 142 words with invalid romaji (hiragana/katakana in romaji field)
  - Helper extractKeyboardSyllables(): extracts 130 syllables from keyboard
  - Helper decomposeRomaji(): greedy matching algorithm with normalization
- **Data Quality Report** (Session 5)
  - RAPPORT_PROBLEMES_DONNEES.md created (255 lines)
  - Comprehensive documentation: 142 critical errors + ~70 variant issues
  - Categorization: TYPE A-F with examples and proposed solutions
  - Pending decisions documented (data correction strategy, variant handling, っち pattern)
  - Statistics: 1309 total words, 1167 valid (89%), 142 invalid (11%)

### Fixed
- Memory leak: setTimeout cleanup on component unmount (training.tsx)
- Closure bug: setState functional form for currentWordIndex (training.tsx)
- Broken tests after expo-localization addition (jest.setup.js mocks updated)
- **Red flash on modal close** (Session 3): Fixed modalColor state persistence
- **Button delay/double-click issue** (Session 3): Disabled animations, immediate state resets
- **modalColor null regression** (Session 3): Removed problematic setTimeout
- **Start button color bug** (Session 4): Fixed hardcoded `$levelN3`, now uses dynamic `levelColors[selectedLevel]`

### Changed
- Home screen (`app/index.tsx`) now loads and saves user preferences automatically
- "Start Session" button now saves preferences before navigation (async operation)
- Test suite expanded from 15 to 36 tests (all passing)
- Training page validation changed from auto-progression to manual modal-based flow
- Training modal feedback now shows points earned ("+1" or "Correct!")
- Translation display always visible in modal (both success and failure states)
- DisplayWord interface extended with `id: number` field for statistics tracking

### ⚠️ Technical Debt

**P0 - MUST complete before new features:**
- training.tsx: Tests pending (manual validation only, 410 lines)
  - Validation: Code Review approved, manual testing passed
  - Estimation: 2-3h (modal state machine, validation logic, state resets)
- RomajiKeyboard.tsx: Tests pending (157 lines)
  - Validation: Code Review approved
  - Estimation: 1.5-2h (mode switching, button callbacks, disabled state, grid rendering)
- Jest memory leak in preferences tests (2/5 test suites crash with heap out of memory)
  - Estimation: 1-2h (investigate AsyncStorage mocks or refactor tests)

**P1 - Data Quality Issues (CRITICAL):**
- 142 words with invalid romaji (hiragana/katakana in romaji field) - Session 5 discovery
  - Files affected: Primarily n4.json, n5.json
  - Examples: "kaijiょu" → "kaijou", "ガソリン" → "gasorin", "keっshite" → "kesshite"
  - Impact: HIGH (11% of vocabulary unusable)
  - Decision pending: Manual correction vs automated script
  - Estimation: 2-3h (manual) or 1-2h (script + validation)
  - Reference: RAPPORT_PROBLEMES_DONNEES.md
- ~70 words with variant romanization (jy/chy patterns) - Session 5 discovery
  - Examples: "jyoubu" vs "joubu", "chyawan" vs "chawan"
  - Impact: MEDIUM (currently normalized in code, functional)
  - Decision pending: A) Keep normalization, B) Standardize data, C) Accept both
  - Estimation: 1h (decision) + 1-2h (correction if standardization chosen)
- っち pattern handling strategy - Session 5 discovery
  - Question: User types "t"+"chi" OR accept "cchi" as valid?
  - Options: A) tchi only (current), B) cchi only, C) Both
  - Impact: MEDIUM (affects ~10 words)
  - Estimation: 30min (decision) + 30min (implementation if change)

**Low Priority:**
- Jest mock contamination in statistics tests (4/49 tests fail together, pass individually)
  - Issue: AsyncStorage mock state leaking between tests
  - Impact: Non-blocking (code functions correctly)
  - Estimation: 1-2h (improve mock isolation)

### Technical Details
- Added dependency: `@react-native-async-storage/async-storage` v2.1.0
- Added dependency: `expo-localization` v16.0.0
- AsyncStorage mock added to `jest.setup.js` for testing
- expo-localization mock added to `jest.setup.js` for testing
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
