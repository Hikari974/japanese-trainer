# Plan d'Implementation: US-006.5 - Affichage Progression Detaillee par Mot

**Epic:** Epic-006 - Systeme de Progression et Deblocage Sequentiel
**User Story:** US-006.5
**Effort Estime:** M (4-6h)
**Date Creation:** 2025-11-15

---

## 1. SUMMARY & OBJECTIVES

### User Story
> **En tant qu'** utilisateur suivant ma progression
> **Je veux** voir le detail de maitrise de chaque mot d'un niveau
> **Afin de** identifier quels mots necessitent encore de l'entrainement

### Scope
Create a **detailed word progress screen** accessible from the home screen level selection, showing:
- Complete list of all words in a selected level
- Individual word statistics (points, attempts, success rate)
- Visual mastery indicators (mastered/in-progress/not-started)
- Filtering and sorting capabilities
- Performance-optimized for large datasets (N1 ~2000 words)

### Key Features
1. New screen route: `/level-progress/[level]`
2. Word list with stats per word
3. Filters: All / Mastered (>=5 points) / In Progress (<5 points)
4. Sorting: By points (asc/desc), alphabetically
5. Progress bar per word showing points/5 threshold
6. Virtualized list (FlashList) for performance

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 Data Flow

```
Home Screen (index.tsx)
       |
       | (User taps level button)
       v
LevelProgressScreen (/level-progress/[level].tsx)
       |
       | Load level data
       v
   +----------------------------+
   | getWordsByLevel(level)     |  → Load all words for level
   +----------------------------+
       |
       v
   +----------------------------+
   | loadStatistics()           |  → Load user stats from AsyncStorage
   +----------------------------+
       |
       | Combine data
       v
   +----------------------------+
   | Map words to WordProgress  |  → Enrich words with stats
   +----------------------------+
       |
       | Apply filters & sorting
       v
   +----------------------------+
   | Render WordProgressList    |  → FlashList with items
   +----------------------------+
```

### 2.2 Component Hierarchy

```
LevelProgressScreen.tsx (Route wrapper)
    |
    +-- LevelProgressView.tsx (Main component)
            |
            +-- Header Section
            |       |
            |       +-- Level title
            |       +-- Overall progress (X/Y words, %)
            |       +-- ProgressBar (reused from US-006.4)
            |
            +-- Filter/Sort Controls
            |       |
            |       +-- Filter buttons (All/Mastered/In Progress)
            |       +-- Sort dropdown (Points asc/desc, Alphabetical)
            |
            +-- WordProgressList (FlashList)
                    |
                    +-- WordProgressItem (per word, memoized)
                            |
                            +-- Word display (kanji, kana, romaji)
                            +-- Statistics (points, attempts, success rate)
                            +-- Mini progress bar
                            +-- Mastery icon (✅ / 🔄 / ⚪)
```

---

## 3. DATA STRUCTURES

### 3.1 Types (New)

```typescript
// app/types/progress.ts (NEW FILE)

import type { JLPTLevel } from './word';

/**
 * Extended word data with statistics for progress display
 */
export interface WordProgress {
  // Word identity
  wordId: number;
  kanji: string;
  kana: string;
  romaji: string;

  // Statistics (aggregated across all difficulties)
  totalPoints: number;          // Sum of points from all difficulties
  totalAttempts: number;        // Sum of attempts from all difficulties
  successCount: number;         // Sum of successes from all difficulties
  perfectAttempts: number;      // Sum of perfect attempts from all difficulties

  // Computed fields
  isMastered: boolean;          // totalPoints >= 5
  successRate: number;          // (successCount / totalAttempts) * 100, or 0 if no attempts
  lastAttemptDate: string | null;  // Most recent attempt across all difficulties
}

/**
 * Filter modes for word list
 */
export type WordFilterMode = 'all' | 'mastered' | 'in-progress' | 'not-started';

/**
 * Sort modes for word list
 */
export type WordSortMode = 'points-asc' | 'points-desc' | 'alphabetical' | 'recent';
```

### 3.2 Helper Functions (New)

```typescript
// app/services/statistics.ts (ADD TO EXISTING FILE)

import type { WordProgress } from '../types/progress';
import { getWordsByLevel } from './wordLoader';

/**
 * Get detailed progress for all words in a level
 * Aggregates statistics across all difficulties for each word
 *
 * @param level - JLPT level to analyze
 * @returns Array of WordProgress objects with complete stats
 */
export async function getWordProgressForLevel(level: JLPTLevel): Promise<WordProgress[]> {
  try {
    // Load current statistics
    const stats = await loadStatistics();

    // Get all words for this level
    const levelData = getWordsByLevel(level);
    const words = levelData.words;

    // Map each word to WordProgress
    const wordProgressList: WordProgress[] = words.map(word => {
      // Aggregate stats across all difficulties
      let totalPoints = 0;
      let totalAttempts = 0;
      let successCount = 0;
      let perfectAttempts = 0;
      let lastAttemptDate: string | null = null;

      // Check all 4 difficulties
      const difficulties: Difficulty[] = ['Facile', 'Normal', 'Difficile', 'Extrême'];

      for (const difficulty of difficulties) {
        const key = getWordStatKey(word.id, level, difficulty);
        const wordStat = stats.words[key];

        if (wordStat) {
          totalPoints += wordStat.points;
          totalAttempts += wordStat.totalAttempts;
          successCount += wordStat.successCount;
          perfectAttempts += wordStat.perfectAttempts;

          // Track most recent attempt
          if (!lastAttemptDate || wordStat.lastAttemptDate > lastAttemptDate) {
            lastAttemptDate = wordStat.lastAttemptDate;
          }
        }
      }

      // Calculate success rate
      const successRate = totalAttempts > 0
        ? Math.round((successCount / totalAttempts) * 100)
        : 0;

      return {
        wordId: word.id,
        kanji: word.kanji,
        kana: word.kana,
        romaji: word.romaji,
        totalPoints,
        totalAttempts,
        successCount,
        perfectAttempts,
        isMastered: totalPoints >= 5,
        successRate,
        lastAttemptDate,
      };
    });

    return wordProgressList;
  } catch (error) {
    if (__DEV__) {
      console.error(`Failed to get word progress for level ${level}:`, error);
    }
    return [];
  }
}

/**
 * Get statistics summary for a level
 * Used for header display
 */
export interface LevelStatsSummary {
  totalWords: number;
  masteredWords: number;
  inProgressWords: number;
  notStartedWords: number;
  averageSuccessRate: number;
  totalPointsEarned: number;
}

export async function getLevelStatsSummary(level: JLPTLevel): Promise<LevelStatsSummary> {
  const wordProgressList = await getWordProgressForLevel(level);

  const totalWords = wordProgressList.length;
  const masteredWords = wordProgressList.filter(w => w.isMastered).length;
  const inProgressWords = wordProgressList.filter(w => !w.isMastered && w.totalAttempts > 0).length;
  const notStartedWords = wordProgressList.filter(w => w.totalAttempts === 0).length;

  const totalPointsEarned = wordProgressList.reduce((sum, w) => sum + w.totalPoints, 0);

  // Calculate average success rate (only for words with attempts)
  const wordsWithAttempts = wordProgressList.filter(w => w.totalAttempts > 0);
  const averageSuccessRate = wordsWithAttempts.length > 0
    ? Math.round(
        wordsWithAttempts.reduce((sum, w) => sum + w.successRate, 0) / wordsWithAttempts.length
      )
    : 0;

  return {
    totalWords,
    masteredWords,
    inProgressWords,
    notStartedWords,
    averageSuccessRate,
    totalPointsEarned,
  };
}
```

---

## 4. IMPLEMENTATION DETAILS

### 4.1 Route Setup (Expo Router)

**File:** `app/(tabs)/level-progress/[level].tsx` (NEW)

```typescript
import { useLocalSearchParams } from 'expo-router';
import { LevelProgressView } from '@/components/LevelProgressView';
import type { JLPTLevel } from '@/types/word';

/**
 * Route for detailed word progress view
 * URL: /level-progress/kana, /level-progress/n5, etc.
 */
export default function LevelProgressScreen() {
  const params = useLocalSearchParams<{ level: string }>();
  const level = params.level?.toLowerCase() as JLPTLevel;

  if (!level) {
    return null; // Or error screen
  }

  return <LevelProgressView level={level} />;
}
```

**Navigation Integration (index.tsx modification):**

```typescript
// In app/index.tsx, modify LevelButton onPress handler

import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  // ... existing code ...

  const handleLevelPress = (level: JLPTLevel) => {
    setSelectedLevel(level);

    // Navigate to detailed progress view
    router.push(`/level-progress/${level.toLowerCase()}`);
  };

  return (
    // ... existing JSX ...
    <LevelButton
      level={level}
      selected={selectedLevel === level}
      onPress={() => handleLevelPress(level)}
      isLocked={!unlockedLevels.has(level)}
      progress={levelProgress.get(level) || null}
    />
  );
}
```

### 4.2 Main Component Implementation

**File:** `app/components/LevelProgressView.tsx` (NEW - ~250 lines)

```typescript
import React, { useState, useEffect, useMemo } from 'react';
import { YStack, XStack, Text, Button, ScrollView, Spinner } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';

import type { JLPTLevel } from '@/types/word';
import type { WordProgress, WordFilterMode, WordSortMode } from '@/types/progress';
import { getWordProgressForLevel, getLevelStatsSummary } from '@/services/statistics';
import { ProgressBar } from './ProgressBar';
import { WordProgressItem } from './WordProgressItem';

interface LevelProgressViewProps {
  level: JLPTLevel;
}

export function LevelProgressView({ level }: LevelProgressViewProps) {
  const router = useRouter();

  // State
  const [wordProgress, setWordProgress] = useState<WordProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<WordFilterMode>('all');
  const [sortMode, setSortMode] = useState<WordSortMode>('points-desc');
  const [refreshing, setRefreshing] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [level]);

  async function loadData() {
    setIsLoading(true);
    try {
      const data = await getWordProgressForLevel(level);
      setWordProgress(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  // Calculate summary stats
  const summary = useMemo(() => {
    const totalWords = wordProgress.length;
    const masteredWords = wordProgress.filter(w => w.isMastered).length;
    const percentage = totalWords > 0
      ? Math.round((masteredWords / totalWords) * 100)
      : 0;

    return { totalWords, masteredWords, percentage };
  }, [wordProgress]);

  // Apply filters and sorting
  const filteredAndSortedWords = useMemo(() => {
    let result = [...wordProgress];

    // Apply filter
    switch (filterMode) {
      case 'mastered':
        result = result.filter(w => w.isMastered);
        break;
      case 'in-progress':
        result = result.filter(w => !w.isMastered && w.totalAttempts > 0);
        break;
      case 'not-started':
        result = result.filter(w => w.totalAttempts === 0);
        break;
      // 'all' - no filter
    }

    // Apply sort
    switch (sortMode) {
      case 'points-asc':
        result.sort((a, b) => a.totalPoints - b.totalPoints);
        break;
      case 'points-desc':
        result.sort((a, b) => b.totalPoints - a.totalPoints);
        break;
      case 'alphabetical':
        result.sort((a, b) => a.kana.localeCompare(b.kana));
        break;
      case 'recent':
        result.sort((a, b) => {
          if (!a.lastAttemptDate) return 1;
          if (!b.lastAttemptDate) return -1;
          return b.lastAttemptDate.localeCompare(a.lastAttemptDate);
        });
        break;
    }

    return result;
  }, [wordProgress, filterMode, sortMode]);

  // Loading state
  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
        <Text marginTop="$4">Chargement des mots...</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack backgroundColor="$blue3" padding="$4" gap="$3">
        {/* Back button */}
        <XStack alignItems="center" gap="$2">
          <Button
            size="$3"
            chromeless
            icon={ChevronLeft}
            onPress={() => router.back()}
          />
          <Text fontSize="$7" fontWeight="bold">
            Niveau {level.toUpperCase()}
          </Text>
        </XStack>

        {/* Progress summary */}
        <YStack gap="$2">
          <Text fontSize="$5" color="$gray12">
            {summary.masteredWords} / {summary.totalWords} mots maîtrisés ({summary.percentage}%)
          </Text>

          <ProgressBar
            value={summary.percentage}
            height={8}
            color="$green10"
          />
        </YStack>
      </YStack>

      {/* Filters and Sort */}
      <YStack padding="$3" gap="$3" borderBottomWidth={1} borderColor="$gray5">
        {/* Filter buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2">
            <Button
              size="$3"
              variant={filterMode === 'all' ? 'outlined' : undefined}
              backgroundColor={filterMode === 'all' ? '$blue4' : undefined}
              onPress={() => setFilterMode('all')}
            >
              Tous ({wordProgress.length})
            </Button>

            <Button
              size="$3"
              variant={filterMode === 'mastered' ? 'outlined' : undefined}
              backgroundColor={filterMode === 'mastered' ? '$green4' : undefined}
              onPress={() => setFilterMode('mastered')}
            >
              ✅ Maîtrisés ({wordProgress.filter(w => w.isMastered).length})
            </Button>

            <Button
              size="$3"
              variant={filterMode === 'in-progress' ? 'outlined' : undefined}
              backgroundColor={filterMode === 'in-progress' ? '$orange4' : undefined}
              onPress={() => setFilterMode('in-progress')}
            >
              🔄 En cours ({wordProgress.filter(w => !w.isMastered && w.totalAttempts > 0).length})
            </Button>

            <Button
              size="$3"
              variant={filterMode === 'not-started' ? 'outlined' : undefined}
              backgroundColor={filterMode === 'not-started' ? '$gray4' : undefined}
              onPress={() => setFilterMode('not-started')}
            >
              ⚪ Non démarrés ({wordProgress.filter(w => w.totalAttempts === 0).length})
            </Button>
          </XStack>
        </ScrollView>

        {/* Sort buttons */}
        <XStack gap="$2">
          <Text fontSize="$3" color="$gray11" alignSelf="center">
            Tri:
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$2">
              <Button
                size="$2"
                variant={sortMode === 'points-desc' ? 'outlined' : undefined}
                onPress={() => setSortMode('points-desc')}
              >
                Points ↓
              </Button>

              <Button
                size="$2"
                variant={sortMode === 'points-asc' ? 'outlined' : undefined}
                onPress={() => setSortMode('points-asc')}
              >
                Points ↑
              </Button>

              <Button
                size="$2"
                variant={sortMode === 'alphabetical' ? 'outlined' : undefined}
                onPress={() => setSortMode('alphabetical')}
              >
                A-Z
              </Button>

              <Button
                size="$2"
                variant={sortMode === 'recent' ? 'outlined' : undefined}
                onPress={() => setSortMode('recent')}
              >
                Récents
              </Button>
            </XStack>
          </ScrollView>
        </XStack>
      </YStack>

      {/* Word list */}
      <FlashList
        data={filteredAndSortedWords}
        renderItem={({ item }) => <WordProgressItem word={item} />}
        estimatedItemSize={90}
        keyExtractor={item => `${item.wordId}`}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <YStack padding="$6" alignItems="center" gap="$3">
            <Text fontSize="$6" color="$gray11">
              Aucun mot trouvé
            </Text>
            <Text fontSize="$3" color="$gray10" textAlign="center">
              {filterMode === 'all'
                ? 'Ce niveau ne contient aucun mot'
                : `Aucun mot dans la catégorie "${filterMode}"`}
            </Text>
          </YStack>
        }
      />
    </YStack>
  );
}
```

### 4.3 Word Item Component (Memoized)

**File:** `app/components/WordProgressItem.tsx` (NEW - ~100 lines)

```typescript
import React from 'react';
import { XStack, YStack, Text } from 'tamagui';
import type { WordProgress } from '@/types/progress';
import { ProgressBar } from './ProgressBar';

interface WordProgressItemProps {
  word: WordProgress;
}

export const WordProgressItem = React.memo(({ word }: WordProgressItemProps) => {
  // Determine icon based on status
  const icon = word.isMastered
    ? '✅'
    : word.totalAttempts > 0
    ? '🔄'
    : '⚪';

  // Progress bar color
  const progressColor = word.isMastered ? '$green10' : '$blue10';

  // Points progress (out of 5 needed for mastery)
  const pointsProgress = Math.min((word.totalPoints / 5) * 100, 100);

  return (
    <XStack
      padding="$4"
      borderBottomWidth={1}
      borderColor="$gray3"
      gap="$3"
      alignItems="center"
      backgroundColor="$background"
    >
      {/* Status icon */}
      <Text fontSize="$7">{icon}</Text>

      {/* Word info */}
      <YStack flex={1} gap="$2">
        {/* Word display */}
        <XStack gap="$2" alignItems="baseline">
          <Text fontSize="$6" fontWeight="600">
            {word.kanji}
          </Text>
          <Text fontSize="$4" color="$gray11">
            {word.kana}
          </Text>
        </XStack>

        <Text fontSize="$3" color="$gray10">
          {word.romaji}
        </Text>

        {/* Statistics */}
        <XStack gap="$4" flexWrap="wrap">
          <Text fontSize="$2" color="$gray11">
            {word.totalPoints} / 5 pts
          </Text>

          {word.totalAttempts > 0 && (
            <>
              <Text fontSize="$2" color="$gray11">
                {word.totalAttempts} essais
              </Text>

              <Text fontSize="$2" color="$gray11">
                {word.successRate}% réussite
              </Text>
            </>
          )}
        </XStack>

        {/* Progress bar */}
        <ProgressBar
          value={pointsProgress}
          height={6}
          color={progressColor}
        />
      </YStack>
    </XStack>
  );
});

WordProgressItem.displayName = 'WordProgressItem';
```

---

## 5. PERFORMANCE OPTIMIZATION

### 5.1 FlashList Optimization

**Why FlashList over FlatList:**
- Better performance on large lists (N1 has ~2000 words)
- Uses recycling pool for item components
- Lower memory footprint
- 60fps scroll on mid-range devices

**Configuration:**
```typescript
<FlashList
  data={filteredAndSortedWords}
  renderItem={({ item }) => <WordProgressItem word={item} />}
  estimatedItemSize={90}  // Height of each item for recycling calculations
  keyExtractor={item => `${item.wordId}`}  // Stable key
  // ... other props
/>
```

### 5.2 Memoization Strategy

**Component Level:**
```typescript
// WordProgressItem is memoized to prevent unnecessary re-renders
export const WordProgressItem = React.memo(({ word }: WordProgressItemProps) => {
  // Component implementation
});
```

**Computed Data:**
```typescript
// Filter and sort results memoized
const filteredAndSortedWords = useMemo(() => {
  // Heavy computation only runs when dependencies change
}, [wordProgress, filterMode, sortMode]);
```

### 5.3 Data Loading Strategy

**Initial Load:**
- Single AsyncStorage read (`loadStatistics()`)
- Single word data load (`getWordsByLevel()`)
- Combine in service layer (not in component)

**Refresh:**
- Pull-to-refresh reloads statistics
- Uses same optimized path

---

## 6. TESTING STRATEGY

### 6.1 Unit Tests

**File:** `app/services/__tests__/statistics.word-progress.test.ts` (NEW)

```typescript
describe('getWordProgressForLevel', () => {
  it('returns empty array for level with no words', async () => {
    // Mock getWordsByLevel to return empty
    const result = await getWordProgressForLevel('N5');
    expect(result).toEqual([]);
  });

  it('calculates total points across all difficulties', async () => {
    // Mock: word ID 1 has 2 points in Normal, 3 in Difficile
    // Expected: totalPoints = 5, isMastered = true
  });

  it('aggregates attempts across difficulties', async () => {
    // Mock: word has 5 attempts in Facile, 10 in Normal
    // Expected: totalAttempts = 15
  });

  it('calculates success rate correctly', async () => {
    // Mock: 7 success out of 10 attempts
    // Expected: successRate = 70
  });

  it('handles words with no attempts', async () => {
    // Expected: totalPoints=0, totalAttempts=0, successRate=0, isMastered=false
  });

  it('identifies mastered words (>= 5 points)', async () => {
    // Mock: word with 5 points
    // Expected: isMastered = true
  });

  it('finds most recent attempt date', async () => {
    // Mock: attempts on different dates across difficulties
    // Expected: lastAttemptDate = most recent
  });
});

describe('getLevelStatsSummary', () => {
  it('calculates correct summary stats', async () => {
    // Mock: 100 words, 30 mastered, 50 in progress, 20 not started
    // Expected: correct counts and percentages
  });

  it('calculates average success rate excluding not-started words', async () => {
    // Expected: only words with attempts included in average
  });
});
```

**Total:** ~10 unit tests

### 6.2 Component Tests

**File:** `app/components/__tests__/LevelProgressView.test.tsx` (NEW)

```typescript
describe('LevelProgressView', () => {
  it('renders loading state initially', () => {
    // Expect: Spinner visible
  });

  it('displays level title and progress summary', async () => {
    // Expect: "Niveau N5", "45/120 mots maîtrisés (37%)"
  });

  it('renders word list with correct items', async () => {
    // Mock: 3 words
    // Expect: 3 WordProgressItem rendered
  });

  it('filters mastered words correctly', async () => {
    // Mock: 100 words, 30 mastered
    // User taps "Maîtrisés" button
    // Expect: 30 items visible
  });

  it('filters in-progress words correctly', async () => {
    // Mock: 100 words, 50 in-progress
    // User taps "En cours" button
    // Expect: 50 items visible
  });

  it('sorts by points descending', async () => {
    // Mock: words with points 8, 3, 0
    // Expect: order [8, 3, 0]
  });

  it('sorts alphabetically by kana', async () => {
    // Mock: words "こんにちは", "ありがとう", "さようなら"
    // Expect: order ["ありがとう", "こんにちは", "さようなら"]
  });

  it('shows empty state when filter has no results', async () => {
    // Filter: mastered, but no mastered words
    // Expect: "Aucun mot dans la catégorie mastered"
  });

  it('pull-to-refresh reloads data', async () => {
    // Trigger refresh gesture
    // Expect: loadStatistics called again
  });
});

describe('WordProgressItem', () => {
  it('shows ✅ icon for mastered word', () => {
    // Mock: word with 5+ points
    // Expect: "✅" rendered
  });

  it('shows 🔄 icon for in-progress word', () => {
    // Mock: word with 1-4 points
    // Expect: "🔄" rendered
  });

  it('shows ⚪ icon for not-started word', () => {
    // Mock: word with 0 attempts
    // Expect: "⚪" rendered
  });

  it('displays word kanji, kana, romaji', () => {
    // Mock: word "毎月", "まいげつ", "maigetsu"
    // Expect: all three rendered
  });

  it('displays statistics correctly', () => {
    // Mock: word with 3 points, 10 attempts, 70% success
    // Expect: "3 / 5 pts", "10 essais", "70% réussite"
  });

  it('shows progress bar at correct percentage', () => {
    // Mock: word with 2 points (40% of 5)
    // Expect: ProgressBar value = 40
  });
});
```

**Total:** ~16 component tests

### 6.3 Integration Tests

**File:** `app/__tests__/level-progress.integration.test.tsx` (NEW)

```typescript
describe('Level Progress Integration', () => {
  it('navigates from home screen to level progress', async () => {
    // Render home screen
    // Tap on N5 level button
    // Expect: navigation to /level-progress/n5
    // Expect: LevelProgressView rendered with level="n5"
  });

  it('back button returns to home screen', async () => {
    // Render LevelProgressView
    // Tap back button
    // Expect: router.back() called
  });

  it('displays real vocabulary data', async () => {
    // Load actual N5 words
    // Expect: count matches N5.json word count
  });

  it('reflects statistics changes after training', async () => {
    // Initial: word with 0 points
    // Simulate: recordAttempt for that word (3 points earned)
    // Refresh: pull-to-refresh
    // Expect: word now shows 3 points
  });
});
```

**Total:** 4 integration tests

### 6.4 Performance Tests

**File:** `app/__tests__/level-progress.performance.test.tsx` (NEW)

```typescript
describe('Performance Benchmarks', () => {
  it('loads N5 level (120 words) in < 500ms', async () => {
    const start = Date.now();
    await getWordProgressForLevel('N5');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(500);
  });

  it('loads N1 level (2000 words) in < 1000ms', async () => {
    const start = Date.now();
    await getWordProgressForLevel('N1');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });

  it('filtering and sorting complete in < 100ms', () => {
    // Mock: 2000 words
    // Apply filter + sort
    // Expect: < 100ms
  });
});
```

**Total:** 3 performance tests

### 6.5 Test Coverage Summary

| Category | Tests | Target Coverage |
|----------|-------|-----------------|
| Service functions | 10 | 100% |
| LevelProgressView | 9 | 90%+ |
| WordProgressItem | 7 | 100% |
| Integration | 4 | N/A (E2E style) |
| Performance | 3 | N/A (benchmarks) |
| **TOTAL** | **33 tests** | **95%+** |

---

## 7. INTEGRATION POINTS

### 7.1 Dependencies (Completed User Stories)

**US-006.1 (Level Progress Calculation):**
- ✅ Uses `calculateLevelProgress()` for summary stats
- ✅ Reuses mastery threshold logic (>= 5 points)

**US-006.2 (Unlock State Management):**
- ✅ Only accessible for unlocked levels (navigation guard)
- ✅ Statistics structure already compatible

**US-006.4 (Visual Level Selection UI):**
- ✅ Reuses `ProgressBar` component for consistency
- ✅ Navigation triggered from LevelButton onPress

### 7.2 Home Screen Modification

**File:** `app/index.tsx` (MODIFY)

**Change 1: Add navigation on level tap**

```typescript
// BEFORE
const handleLevelPress = (level: JLPTLevel) => {
  setSelectedLevel(level);
  // Start training directly
};

// AFTER
const handleLevelPress = (level: JLPTLevel) => {
  setSelectedLevel(level);

  // Navigate to detailed progress view instead
  router.push(`/level-progress/${level.toLowerCase()}`);
};
```

**Alternative (Two-Step Flow):**
User might want to see progress before starting training. Consider:
1. Tap level → Navigate to progress view
2. "Start Training" button in progress view → Start training session

**Decision:** Use direct navigation (simpler UX). Training can be started from progress view later (US-006.8 or future).

---

## 8. UI/UX DESIGN

### 8.1 Color Scheme

**Status Icons:**
- ✅ Mastered: Green theme (`$green10`)
- 🔄 In Progress: Blue theme (`$blue10`)
- ⚪ Not Started: Gray theme (`$gray6`)

**Progress Bars:**
- Mastered: `$green10` (consistent with icon)
- In Progress: `$blue10`

**Filter Buttons:**
- Active: Background tint matching status color
- Inactive: Default gray

### 8.2 Typography

**Level Title:** `$7` (large), bold
**Word Kanji:** `$6` (medium-large), bold
**Word Kana:** `$4` (small-medium), gray
**Word Romaji:** `$3` (small), lighter gray
**Statistics:** `$2` (tiny), gray

### 8.3 Spacing & Layout

**Header Padding:** `$4` (16px)
**List Item Padding:** `$4` (16px)
**Gap Between Elements:** `$2` to `$3` (8-12px)

**Touch Targets:**
- Filter buttons: Height `$3` (44px minimum)
- Sort buttons: Height `$2` (36px, secondary action)

---

## 9. ACCESSIBILITY

### 9.1 ARIA Labels

**Progress Bars:**
```typescript
<ProgressBar
  value={percentage}
  // ARIA attributes inherited from ProgressBar component
  role="progressbar"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={percentage}
/>
```

**Filter Buttons:**
```typescript
<Button
  accessibilityLabel={`Filtrer: Tous les mots (${wordProgress.length})`}
  accessibilityRole="button"
  accessibilityState={{ selected: filterMode === 'all' }}
>
  Tous ({wordProgress.length})
</Button>
```

### 9.2 Screen Reader Support

**Word Items:**
- Announce: "Mot: [kanji] [kana] [romaji], [status], [points] sur 5 points, [attempts] essais, [successRate] pourcent de réussite"
- Example: "Mot: 毎月 まいげつ maigetsu, maîtrisé, 8 sur 5 points, 20 essais, 85 pourcent de réussite"

### 9.3 Color Contrast

- Verify all text meets WCAG AA standards (4.5:1 contrast ratio)
- Status icons provide semantic meaning beyond color (✅🔄⚪)

---

## 10. IMPLEMENTATION CHECKLIST

### Phase 1: Data Layer (1.5h)
- [ ] Create `app/types/progress.ts` with WordProgress types
- [ ] Implement `getWordProgressForLevel()` in statistics.ts
- [ ] Implement `getLevelStatsSummary()` in statistics.ts
- [ ] Write 10 unit tests for service functions
- [ ] Verify 100% test coverage for new functions

### Phase 2: Components (2h)
- [ ] Create `app/components/WordProgressItem.tsx`
- [ ] Create `app/components/LevelProgressView.tsx`
- [ ] Implement filter logic (all/mastered/in-progress/not-started)
- [ ] Implement sort logic (points asc/desc, alphabetical, recent)
- [ ] Add pull-to-refresh
- [ ] Write 16 component tests

### Phase 3: Routing & Navigation (0.5h)
- [ ] Create route `app/(tabs)/level-progress/[level].tsx`
- [ ] Modify `app/index.tsx` to navigate on level tap
- [ ] Test navigation flow (home → progress → back)
- [ ] Write 4 integration tests

### Phase 4: Polish & Performance (1h)
- [ ] Verify FlashList performance on N1 (2000 words)
- [ ] Add loading states and empty states
- [ ] Optimize re-renders with React.memo
- [ ] Write 3 performance benchmarks
- [ ] Test on physical Android + iOS devices

### Phase 5: Testing & Documentation (1h)
- [ ] Run full test suite (33 tests)
- [ ] Verify 95%+ coverage
- [ ] Add JSDoc comments to all exported functions
- [ ] Update TypeScript strict mode (no errors)
- [ ] Manual QA on real device

---

## 11. DEFINITION OF DONE

### Functional
- [ ] Route `/level-progress/[level]` accessible for all levels
- [ ] Word list displays all words for selected level
- [ ] Statistics accurate (points, attempts, success rate)
- [ ] Filter "Tous" shows all words
- [ ] Filter "Maîtrisés" shows only words with >= 5 points
- [ ] Filter "En cours" shows words with 1-4 points
- [ ] Filter "Non démarrés" shows words with 0 attempts
- [ ] Sort by points (ascending/descending) works correctly
- [ ] Sort alphabetically by kana works correctly
- [ ] Sort by recent attempts works correctly
- [ ] Pull-to-refresh reloads statistics
- [ ] Empty state displayed when filter has no results
- [ ] Back button returns to home screen

### Technical
- [ ] `getWordProgressForLevel()` implemented and tested
- [ ] `getLevelStatsSummary()` implemented and tested
- [ ] WordProgressItem component memoized
- [ ] FlashList used for virtualization
- [ ] 33 tests written and passing
- [ ] Test coverage >= 95% on new code
- [ ] TypeScript strict mode without errors
- [ ] No console warnings or errors
- [ ] Performance benchmarks met (< 1s for N1)

### UI/UX
- [ ] Consistent with existing design (Tamagui theme)
- [ ] Status icons clearly distinguishable (✅🔄⚪)
- [ ] Progress bars match color scheme
- [ ] Touch targets >= 44px (WCAG guidelines)
- [ ] Smooth 60fps scrolling on large lists
- [ ] Loading state prevents layout shift
- [ ] Accessibility labels present
- [ ] Screen reader compatible

### Integration
- [ ] Navigation from home screen works
- [ ] ProgressBar component reused
- [ ] Statistics service extended without breaking changes
- [ ] No regressions in US-006.1 tests (23 tests pass)
- [ ] No regressions in US-006.2 tests (15 tests pass)
- [ ] No regressions in US-006.4 tests (20 tests pass)

---

## 12. RISKS & MITIGATIONS

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Performance issues on N1 (2000 words) | High | Medium | FlashList virtualization, memoization, performance tests |
| Filter/sort logic bugs (edge cases) | Medium | Low | Comprehensive unit tests, manual QA |
| Navigation state issues (back button) | Low | Low | Use Expo Router best practices, integration tests |
| AsyncStorage read delays | Medium | Low | Loading state, single read per mount, refresh only |
| Memory leaks with large lists | Medium | Low | React.memo on items, FlashList recycling, profiling |
| Accessibility gaps | Medium | Low | ARIA labels, manual screen reader testing |

---

## 13. SUCCESS CRITERIA

### User Experience
- ✅ User can view detailed progress for any unlocked level
- ✅ User can identify which specific words need more training
- ✅ User can filter/sort to focus on weakest words
- ✅ User can track improvement over time (via statistics)
- ✅ UI feels responsive even on large levels (N1)

### Technical
- ✅ Service layer provides aggregated word statistics
- ✅ Component architecture is reusable and maintainable
- ✅ Performance meets benchmarks (< 1s load, 60fps scroll)
- ✅ Tests cover all user flows and edge cases
- ✅ Code follows project conventions (TypeScript strict, Tamagui)

### Integration
- ✅ Seamlessly integrates with completed user stories
- ✅ Reuses existing components (ProgressBar)
- ✅ No breaking changes to statistics service
- ✅ Accessible from home screen level selection

---

## 14. FUTURE ENHANCEMENTS (OUT OF SCOPE)

These features are NOT part of US-006.5 but could be added later:

1. **Tap word to see difficulty breakdown**
   - Modal showing points per difficulty (Facile/Normal/Difficile/Extrême)
   - Attempt history timeline

2. **Start training from word list**
   - "Practice this word" button on each item
   - Quick training session for weak words

3. **Export progress report**
   - PDF or CSV export of word statistics
   - Share with teacher/study group

4. **Search/filter by translation**
   - Text input to search for specific words
   - Filter by translation language

5. **Visual charts**
   - Pie chart: mastered vs in-progress vs not-started
   - Line graph: progress over time

**Decision:** Keep US-006.5 focused on core word list view. Enhancements can be separate user stories.

---

## 15. NOTES FOR IMPLEMENTER

### Key Integration Points
1. **Statistics Service:** Extend `app/services/statistics.ts` with two new functions
2. **ProgressBar Component:** Already exists from US-006.4, reuse directly
3. **FlashList:** Already installed as dependency, import from `@shopify/flash-list`
4. **Expo Router:** Use `useRouter()` and `useLocalSearchParams()` for navigation

### Code Style
- Follow existing patterns in `app/services/statistics.ts`
- Use Tamagui components consistently with `app/index.tsx`
- Memoize expensive computations with `useMemo()`
- Memoize list items with `React.memo()`

### Testing Approach
- Write service tests FIRST (TDD for data layer)
- Component tests use `@testing-library/react-native`
- Mock `getWordsByLevel()` and `loadStatistics()` in tests
- Performance tests run on real device (not emulator)

### Performance Tips
- FlashList `estimatedItemSize` should match actual item height (~90px)
- Use stable keys (`wordId`) for list items
- Avoid inline functions in renderItem (extract WordProgressItem)
- Profile with React DevTools Profiler if issues

---

**Plan Status:** DRAFT - Awaiting User Validation
**Created By:** Epic Manager Agent
**Date:** 2025-11-15
**Epic:** Epic-006
**User Story:** US-006.5

**Next Steps:**
1. User validates this plan
2. Implementation by Mobile UI Expert Agent
3. Code review by Code Review Agent
4. Testing by Test Engineer Agent
5. Documentation by Documentation Maintainer Agent
