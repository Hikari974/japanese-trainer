# Plan Epic-006 US-006.7 - Page Statistiques Enrichie

**Epic:** Epic-006 - Système de Progression et Déblocage Séquentiel des Niveaux JLPT
**User Story:** US-006.7 - Page Statistiques Enrichie avec Vue Progression Globale
**Session:** 12 (estimated)
**Date:** 2025-11-15
**Priority:** P2 (Nice-to-have)
**Effort:** M (4-6 heures)

---

## 📋 Executive Summary

**Objectif:** Enrichir la page statistiques (stats.tsx) avec une vue progression complète sur tous les niveaux JLPT, incluant cartes par niveau avec états (locked/unlocked/completed), barres de progression, et navigation vers détails.

**État Actuel:**
- stats.tsx existe (187 lignes, MVP Session 4)
- Affiche: points totaux, tentatives, taux réussite, perfect count, breakdown par niveau
- **Manque:** Visualisation progression par niveau, états unlock, navigation vers détails

**Livrable:**
- Section "Progression JLPT" avec vue globale (niveau actuel, total mots maîtrisés, % global)
- 6 cartes niveau (Kana → N1) avec icônes état, barres progression, stats
- Navigation tap → `/level-progress/[level]` (US-006.5)
- Réutilisation complète API progression (US-006.1)

**Dépendances Satisfaites:**
- ✅ US-006.1: `getAllLevelsProgress()` disponible
- ✅ US-006.2: `getUnlockedLevels()` disponible
- ✅ US-006.5: Route `/level-progress/[level]` opérationnelle

---

## 🎯 User Story

> **En tant qu'** utilisateur consultant mes statistiques
> **Je veux** voir une vue d'ensemble de ma progression sur tous les niveaux JLPT
> **Afin de** visualiser mon parcours d'apprentissage complet et accéder rapidement aux détails par niveau

---

## ✅ Critères d'Acceptation (Priorisés)

### Must-Have (MVP)
- [ ] **AC1:** Section "Progression JLPT" ajoutée en haut de stats.tsx
- [ ] **AC2:** Vue globale affichant:
  - Niveau actuel (plus haut débloqué)
  - Total mots maîtrisés (X/Y avec Y = somme tous niveaux)
  - Pourcentage progression global
- [ ] **AC3:** 6 cartes niveau (Kana → N1) avec:
  - Icône état: 🔒 Locked / 🔄 Unlocked / ✅ Completed
  - Label niveau (KANA, N5, N4, N3, N2, N1)
  - Stats "X/Y mots" si débloqué
  - Barre progression (0-100%) si débloqué
  - Message "Complétez [level] pour débloquer" si locked
- [ ] **AC4:** Navigation fonctionnelle: tap sur carte → `/level-progress/[level]` (si débloqué)
- [ ] **AC5:** Disabled state visuel sur cartes locked (opacity, no tap)

### Should-Have (UX Polish)
- [ ] **AC6:** Couleurs niveau cohérentes avec LevelSelect (US-006.4)
- [ ] **AC7:** Loading state skeleton pendant chargement
- [ ] **AC8:** Animation smooth tap (pressStyle scale)
- [ ] **AC9:** Responsive layout (portrait/landscape)

### Nice-to-Have (Future)
- [ ] **AC10:** Pull-to-refresh pour rafraîchir stats
- [ ] **AC11:** Date déblocage affichée sur cartes complétées
- [ ] **AC12:** Transition animée navigation vers détails

### Technique
- [ ] **AC13:** Utilise `getAllLevelsProgress()` et `getUnlockedLevels()` (US-006.1)
- [ ] **AC14:** Mémoisation calculs progression (useMemo)
- [ ] **AC15:** Aucune régression stats existantes (global stats, breakdown)
- [ ] **AC16:** Tests composant (snapshot + interactions)
- [ ] **AC17:** Accessibility labels (ARIA)

---

## 🏗️ Architecture Technique

### Approche Décision: Inline vs Component Extraction

**Options:**
1. **Inline dans stats.tsx** (tout dans un fichier)
2. **Extract `<LevelProgressSection />`** (nouveau composant)

**Décision: Inline dans stats.tsx**

**Rationale:**
- stats.tsx actuel = 187 lignes (petit)
- Ajout estimé = ~120 lignes
- Total final = ~300 lignes (acceptable pour un screen)
- Évite over-engineering (pas de composant réutilisable nécessaire)
- Simplifie testing (un seul fichier à tester)
- Cohérence: toutes stats dans un seul fichier

**Extraction Future:** Si stats.tsx dépasse 400 lignes (improbable), extraire en composant.

### Structure Cible stats.tsx

```typescript
// app/stats.tsx (structure après US-006.7)

import { useMemo, useState, useEffect } from 'react';
import { YStack, XStack, H2, H3, Text, Card, Spinner, Progress } from 'tamagui';
import { ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lock, Check, Activity } from '@tamagui/lucide-icons';
import { AppHeader } from './components/AppHeader';
import { useStatistics } from './hooks/useStatistics';
import type { JLPTLevel, LevelProgress } from './types/word';

const LEVEL_ORDER: JLPTLevel[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];

const levelColors: Record<JLPTLevel, string> = {
  Kana: '$levelKana',
  N5: '$levelN5',
  N4: '$levelN4',
  N3: '$levelN3',
  N2: '$levelN2',
  N1: '$levelN1',
};

export default function StatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    statistics,
    isLoading,
    getAllLevelsProgress,    // NOUVEAU
    getUnlockedLevels         // NOUVEAU
  } = useStatistics();

  // NOUVEAU: State progression
  const [levelsProgress, setLevelsProgress] = useState<Map<JLPTLevel, LevelProgress>>(new Map());
  const [unlockedLevels, setUnlockedLevels] = useState<JLPTLevel[]>([]);

  // NOUVEAU: Load progression data
  useEffect(() => {
    loadProgressionData();
  }, [getAllLevelsProgress, getUnlockedLevels]);

  async function loadProgressionData() {
    const progress = await getAllLevelsProgress();
    const unlocked = await getUnlockedLevels();
    setLevelsProgress(progress);
    setUnlockedLevels(unlocked);
  }

  // NOUVEAU: Calculate global progression metrics
  const globalProgress = useMemo(() => {
    if (levelsProgress.size === 0) return { totalWords: 0, masteredWords: 0, percentage: 0 };

    let totalWords = 0;
    let masteredWords = 0;

    levelsProgress.forEach(progress => {
      totalWords += progress.totalWords;
      masteredWords += progress.masteredWords;
    });

    const percentage = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;

    return { totalWords, masteredWords, percentage };
  }, [levelsProgress]);

  // NOUVEAU: Get current level (highest unlocked)
  const currentLevel = useMemo(() => {
    return unlockedLevels.length > 0
      ? unlockedLevels[unlockedLevels.length - 1]
      : 'Kana';
  }, [unlockedLevels]);

  // NOUVEAU: Handle level card tap
  function handleLevelTap(level: JLPTLevel) {
    const isLocked = !unlockedLevels.includes(level);
    if (isLocked) return; // No navigation if locked

    router.push(`/level-progress/${level}` as const);
  }

  // NOUVEAU: Get previous level for locked message
  function getPreviousLevel(level: JLPTLevel): string {
    const index = LEVEL_ORDER.indexOf(level);
    if (index <= 0) return '';
    return LEVEL_ORDER[index - 1];
  }

  // EXISTING: Calculate stats by level (unchanged)
  const statsByLevel = useMemo(() => { /* ... existing code ... */ });
  const successRate = useMemo(() => { /* ... existing code ... */ });

  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <AppHeader title="Statistiques" showBackButton />
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$blue10" />
        </YStack>
      </YStack>
    );
  }

  if (!statistics) { /* ... existing error state ... */ }

  const hasStats = statistics.globalStats.totalAttempts > 0;

  return (
    <YStack flex={1} backgroundColor="$background">
      <AppHeader title="Statistiques" showBackButton />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        <YStack padding="$4" gap="$4">

          {/* ========================== */}
          {/* SECTION 1: PROGRESSION JLPT (NOUVEAU) */}
          {/* ========================== */}

          {/* Global Progression Header */}
          <Card padding="$4" borderRadius="$4" backgroundColor="$blue2">
            <Text fontSize={20} fontWeight="bold" marginBottom="$3">
              📊 Progression JLPT
            </Text>

            <XStack gap="$4" marginBottom="$3">
              <YStack flex={1}>
                <Text fontSize={14} color="$gray11">Niveau actuel</Text>
                <Text fontSize={24} fontWeight="bold" color="$blue11">
                  {currentLevel.toUpperCase()}
                </Text>
              </YStack>

              <YStack flex={1}>
                <Text fontSize={14} color="$gray11">Mots maîtrisés</Text>
                <Text fontSize={24} fontWeight="bold">
                  {globalProgress.masteredWords}/{globalProgress.totalWords}
                </Text>
              </YStack>
            </XStack>

            <Progress value={globalProgress.percentage} size="$3">
              <Progress.Indicator animation="quick" backgroundColor="$blue10" />
            </Progress>

            <Text fontSize={12} color="$gray10" marginTop="$2">
              {globalProgress.percentage.toFixed(1)}% du parcours JLPT complété
            </Text>
          </Card>

          {/* Level Cards */}
          <YStack gap="$3">
            {LEVEL_ORDER.map(level => {
              const progress = levelsProgress.get(level);
              const isLocked = !unlockedLevels.includes(level);
              const isCompleted = progress?.isComplete || false;

              // Icon logic
              const Icon = isLocked ? Lock : isCompleted ? Check : Activity;
              const iconColor = isLocked ? '$gray10' : isCompleted ? '$green10' : '$blue10';
              const iconBgColor = isLocked ? '$gray3' : isCompleted ? '$green3' : '$blue3';

              // Card styling
              const opacity = isLocked ? 0.5 : 1;
              const borderColor = isCompleted ? '$green6' : isLocked ? '$gray5' : '$blue6';

              return (
                <Pressable
                  key={level}
                  onPress={() => handleLevelTap(level)}
                  disabled={isLocked}
                  style={{ opacity }}
                >
                  <Card
                    padding="$4"
                    borderRadius="$4"
                    borderWidth={1}
                    borderColor={borderColor}
                    pressStyle={{ scale: isLocked ? 1 : 0.98 }}
                    animation="quick"
                  >
                    <XStack gap="$3" alignItems="center">
                      {/* Icon */}
                      <YStack
                        width={40}
                        height={40}
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor={iconBgColor}
                        borderRadius="$4"
                      >
                        <Icon size={20} color={iconColor} />
                      </YStack>

                      {/* Level Info */}
                      <YStack flex={1} gap="$1">
                        <XStack justifyContent="space-between" alignItems="center">
                          <Text fontSize={18} fontWeight="bold">
                            {level.toUpperCase()}
                          </Text>

                          {progress && (
                            <Text fontSize={14} color="$gray11">
                              {progress.masteredWords}/{progress.totalWords}
                            </Text>
                          )}
                        </XStack>

                        {/* Progress Bar or Locked Message */}
                        {isLocked ? (
                          <Text fontSize={12} color="$gray10">
                            Complétez {getPreviousLevel(level)} pour débloquer
                          </Text>
                        ) : progress && (
                          <>
                            <Progress value={progress.percentage} size="$2">
                              <Progress.Indicator
                                backgroundColor={isCompleted ? '$green10' : '$blue10'}
                              />
                            </Progress>

                            <Text fontSize={12} color="$gray10">
                              {progress.percentage.toFixed(1)}% maîtrisé
                              {isCompleted && ' ✓'}
                            </Text>
                          </>
                        )}
                      </YStack>
                    </XStack>
                  </Card>
                </Pressable>
              );
            })}
          </YStack>

          {/* ========================== */}
          {/* SECTION 2: STATS GLOBALES (EXISTING, UNCHANGED) */}
          {/* ========================== */}

          {!hasStats ? (
            <Card padding="$4" borderRadius="$4" backgroundColor="$gray2">
              {/* ... existing empty state ... */}
            </Card>
          ) : (
            <>
              {/* Global Statistics (EXISTING) */}
              <Card padding="$4" borderRadius="$4" backgroundColor="$gray2">
                <H2 marginBottom="$3">Statistiques Globales</H2>
                {/* ... existing stats ... */}
              </Card>

              {/* Level Breakdown (EXISTING) */}
              <Card padding="$4" borderRadius="$4" backgroundColor="$gray2">
                <H3 marginBottom="$3">Points par Niveau</H3>
                {/* ... existing breakdown ... */}
              </Card>
            </>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
```

**Estimation Lignes:**
- Section Progression Header: ~40 lignes
- Level Cards Loop: ~80 lignes
- Helpers (getPreviousLevel, handleLevelTap): ~10 lignes
- State/Effects: ~15 lignes
- Imports: ~5 lignes
- **Total Ajout:** ~150 lignes
- **Total Final stats.tsx:** ~337 lignes

---

## 📂 Fichiers à Modifier

### 1. `app/stats.tsx` (187 → ~337 lignes, +150)

**Modifications:**
- **Imports:** Ajouter `Progress`, `Lock`, `Check`, `Activity` de tamagui/lucide-icons
- **Imports:** Ajouter `useRouter` de expo-router
- **Imports:** Ajouter types `LevelProgress`
- **State:** Ajouter `levelsProgress`, `unlockedLevels`
- **Effects:** Ajouter `useEffect` pour loadProgressionData
- **Memos:** Ajouter `globalProgress`, `currentLevel`
- **Handlers:** Ajouter `handleLevelTap`, `getPreviousLevel`
- **JSX:** Ajouter Section Progression JLPT (header + cards) AVANT sections existantes
- **Existing:** Préserver toutes sections existantes (Global Stats, Level Breakdown)

**Pas de Breaking Changes:**
- Stats globales existantes inchangées
- Breakdown par niveau inchangé
- Ajout purement additive en haut de page

---

## 🔗 Intégration Points

### useStatistics Hook (app/hooks/useStatistics.ts)

**Vérification État Actuel:**
```typescript
// EXISTING (Session 4):
export function useStatistics() {
  const [statistics, setStatistics] = useState<GlobalStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // QUESTION: getAllLevelsProgress et getUnlockedLevels exposés ?
}
```

**Action Required:**
- ✅ Vérifier si `getAllLevelsProgress()` et `getUnlockedLevels()` sont exposés dans useStatistics
- ⚠️ Si non exposés → les ajouter (wrapping statisticsService calls)

**Expected API:**
```typescript
export function useStatistics() {
  // ... existing state ...

  // AJOUTER si manquant:
  const getAllLevelsProgress = useCallback(async () => {
    return await statisticsService.getAllLevelsProgress();
  }, []);

  const getUnlockedLevels = useCallback(async () => {
    return await statisticsService.getUnlockedLevels();
  }, []);

  return {
    statistics,
    isLoading,
    recordAttempt,
    resetStatistics,
    registerUnlockCallback,    // Existing (US-006.3)
    getAllLevelsProgress,      // AJOUTER
    getUnlockedLevels          // AJOUTER
  };
}
```

### Navigation Target (Existing)

**Route:** `/level-progress/[level]` (US-006.5)
- ✅ Already implemented (Session 10)
- ✅ Validation level param (Hotfix Session 11)
- ✅ Expected behavior: affiche breakdown mots du niveau

**Test Navigation:**
```typescript
router.push('/level-progress/Kana');  // Should work
router.push('/level-progress/N5');    // Should work
router.push('/level-progress/invalid'); // Should redirect to / (hotfix)
```

---

## 🧪 Stratégie de Test

### Tests Unitaires (Jest + RTL)

**File:** `app/__tests__/stats.test.tsx` (NEW)

**Coverage Target:** 80%+ (focus logic, pas JSX exhaustif)

**Test Cases:**

1. **Rendering Tests** (3 tests)
   - ✅ Renders loading spinner while isLoading=true
   - ✅ Renders error message if statistics=null
   - ✅ Renders all sections when statistics loaded

2. **Progression Section Tests** (5 tests)
   - ✅ Displays global progress metrics (niveau actuel, X/Y mots, %)
   - ✅ Calculates global percentage correctly (mocked levelsProgress)
   - ✅ Displays current level as highest unlocked
   - ✅ Renders 6 level cards (Kana → N1)
   - ✅ Shows locked/unlocked/completed states correctly

3. **Navigation Tests** (3 tests)
   - ✅ Navigates to /level-progress/[level] on tap (unlocked level)
   - ✅ Does NOT navigate on tap (locked level)
   - ✅ Calls router.push with correct path

4. **Visual State Tests** (4 tests)
   - ✅ Locked card: Lock icon, opacity 0.5, "Complétez X pour débloquer"
   - ✅ Unlocked card: Activity icon, opacity 1, progress bar
   - ✅ Completed card: Check icon, green colors, progress 100%
   - ✅ Progress bar color matches completion state (blue/green)

5. **Regression Tests** (2 tests)
   - ✅ Existing global stats section still renders
   - ✅ Existing level breakdown section still renders

**Total Tests:** ~17 tests (estimé)

**Mock Strategy:**
```typescript
// Mock useStatistics hook
jest.mock('./hooks/useStatistics', () => ({
  useStatistics: jest.fn()
}));

// Mock useRouter
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush
  }))
}));

// Test Data
const mockLevelsProgress = new Map([
  ['Kana', { totalWords: 92, masteredWords: 92, percentage: 100, isComplete: true }],
  ['N5', { totalWords: 800, masteredWords: 120, percentage: 15, isComplete: false }],
  ['N4', { totalWords: 1000, masteredWords: 0, percentage: 0, isComplete: false }],
  ['N3', { totalWords: 1100, masteredWords: 0, percentage: 0, isComplete: false }],
  ['N2', { totalWords: 1200, masteredWords: 0, percentage: 0, isComplete: false }],
  ['N1', { totalWords: 1000, masteredWords: 0, percentage: 0, isComplete: false }]
]);

const mockUnlockedLevels = ['Kana', 'N5'];

const mockStatistics = {
  globalStats: { totalPoints: 150, totalAttempts: 200, perfectCount: 10, totalWords: 50 },
  words: { /* ... */ }
};

beforeEach(() => {
  (useStatistics as jest.Mock).mockReturnValue({
    statistics: mockStatistics,
    isLoading: false,
    getAllLevelsProgress: jest.fn().mockResolvedValue(mockLevelsProgress),
    getUnlockedLevels: jest.fn().mockResolvedValue(mockUnlockedLevels)
  });
});
```

### Tests Manuels (Device)

**Checklist Post-Implementation:**
- [ ] Scroll page stats fluide (pas de lag avec 6 cartes)
- [ ] Tap carte unlocked → navigation correcte vers détails
- [ ] Tap carte locked → aucune action
- [ ] Progress bars affichent % correct
- [ ] Couleurs niveau cohérentes avec LevelSelect
- [ ] Loading spinner visible au mount initial
- [ ] Empty state visible si aucun training
- [ ] Sections existantes (stats globales, breakdown) inchangées

---

## 🎨 Design Specs

### Couleurs Niveau (Réutilisation)

```typescript
// Source: app/components/LevelSelect.tsx (US-006.4)
const levelColors: Record<JLPTLevel, string> = {
  Kana: '$levelKana',  // Tamagui theme color
  N5: '$levelN5',
  N4: '$levelN4',
  N3: '$levelN3',
  N2: '$levelN2',
  N1: '$levelN1',
};
```

**Consistency Check:** Vérifier cohérence avec LevelButton colors

### Icônes États

| État | Icon | Color | Background | Border |
|------|------|-------|------------|--------|
| **Locked** | `Lock` (lucide-icons) | `$gray10` | `$gray3` | `$gray5` |
| **Unlocked** | `Activity` (lucide-icons) | `$blue10` | `$blue3` | `$blue6` |
| **Completed** | `Check` (lucide-icons) | `$green10` | `$green3` | `$green6` |

### Spacing & Layout

- **Card Padding:** `$4` (16px)
- **Card Gap:** `$3` (12px between cards)
- **Icon Size:** 40x40px
- **Icon Content Size:** 20px (lucide default)
- **Border Radius:** `$4` (rounded corners)
- **Progress Bar Height:** `$2` (small)

### Typography

- **Section Title:** 20px, fontWeight="bold"
- **Level Label:** 18px, fontWeight="bold"
- **Stats Text:** 14px, color="$gray11"
- **Helper Text:** 12px, color="$gray10"
- **Big Numbers:** 24px, fontWeight="bold"

---

## ⚠️ Points d'Attention

### 1. Performance

**Concern:** 6 cartes + calculs progression = rendering cost ?

**Mitigation:**
- ✅ `useMemo` sur `globalProgress` (évite recalcul à chaque render)
- ✅ `useMemo` sur `currentLevel` (simple filter)
- ✅ `useCallback` sur handlers (évite re-render children)
- ✅ Pas de virtualisation nécessaire (seulement 6 items)
- ✅ Progress bars Tamagui optimisées (native animations)

**Target:** 60fps scroll, < 100ms initial render

### 2. Data Loading

**Concern:** `getAllLevelsProgress()` peut être lent si beaucoup de mots

**Mitigation:**
- ✅ statisticsService déjà optimisé (Session 6, calculs O(n))
- ✅ AsyncStorage read = async mais rapide (< 50ms typical)
- ✅ Loading state déjà géré (isLoading spinner)
- ✅ useEffect avec dependencies appropriées (pas de loops)

**Fallback:** Si > 500ms → ajouter skeleton loading (Nice-to-have)

### 3. Navigation Edge Cases

**Concern:** Navigation vers level invalid ou pas encore créé

**Mitigation:**
- ✅ Route validation déjà implémentée (Hotfix Session 11)
- ✅ `handleLevelTap` vérifie `isLocked` AVANT router.push
- ✅ Type safety: `router.push('/level-progress/${level}' as const)`

**Edge Case Handled:**
```typescript
// Invalid level → redirect to / (handled by route validation)
// Locked level → no navigation (handleLevelTap returns early)
// Unlocked level → navigation OK
```

### 4. Empty State Handling

**Concern:** Nouvel utilisateur sans aucun score

**Current Behavior:**
- `levelsProgress` = Map avec tous niveaux (totalWords > 0, masteredWords = 0)
- `unlockedLevels` = `['Kana']` (default unlock)
- `globalProgress` = { totalWords: 6242, masteredWords: 0, percentage: 0 }

**Expected UI:**
- ✅ Section Progression visible (pas cachée)
- ✅ Niveau actuel = "KANA"
- ✅ Mots maîtrisés = "0/6242"
- ✅ Kana card unlocked, others locked
- ✅ Encourage user to start training

**No Special Case Needed:** Default values handle this gracefully

### 5. Regression Risk

**Concern:** Breaking existing stats page fonctionnalité

**Mitigation:**
- ✅ Additive changes only (no deletion of existing code)
- ✅ Existing sections (global stats, breakdown) unchanged
- ✅ Regression tests dans test suite
- ✅ Manual testing checklist

**Rollback Plan:** Git revert if issues (plan recommends commit after validation)

---

## 📊 Estimation Détaillée

### Breakdown Tâches

| Tâche | Complexité | Temps Estimé |
|-------|-----------|--------------|
| 1. Vérifier/Ajouter API hooks (getAllLevelsProgress, getUnlockedLevels) | S | 30min |
| 2. Ajouter state + effects (levelsProgress, unlockedLevels, load logic) | S | 30min |
| 3. Ajouter memos (globalProgress, currentLevel) | S | 15min |
| 4. Implémenter Section Header (niveau actuel, total, progress bar) | M | 45min |
| 5. Implémenter Level Cards loop (6 cards avec états) | M | 1h 30min |
| 6. Handlers navigation (handleLevelTap, getPreviousLevel) | S | 20min |
| 7. Styling & polish (colors, spacing, icons) | M | 45min |
| 8. Tests unitaires (17 tests) | M | 1h 30min |
| 9. Tests manuels (device testing) | S | 30min |
| 10. Corrections bugs éventuels | S | 30min |

**Total Estimé:** 6h 30min

**Seuils Checkpoints:**
- Lines changed: ~150 lignes > 50 threshold → **Tests Engineer MANDATORY** ✅
- Lines changed: ~150 lignes < 100 threshold → Code Review NOT required ❌

---

## 🚀 Plan d'Implémentation Step-by-Step

### Phase 1: Préparation (30min)

**Étape 1.1:** Vérifier useStatistics hook API
```bash
# Lire app/hooks/useStatistics.ts
# Vérifier si getAllLevelsProgress et getUnlockedLevels exposés
# Si non → ajouter wrapping functions
```

**Étape 1.2:** Vérifier types LevelProgress
```bash
# Lire app/types/word.ts
# Vérifier si LevelProgress type existe
# Si non → ajouter (devrait exister depuis US-006.1)
```

### Phase 2: State Management (45min)

**Étape 2.1:** Ajouter imports nécessaires
```typescript
// Dans stats.tsx
import { useCallback } from 'react'; // Ajouter
import { Progress } from 'tamagui'; // Ajouter
import { Pressable } from 'react-native'; // Ajouter
import { useRouter } from 'expo-router'; // Ajouter
import { Lock, Check, Activity } from '@tamagui/lucide-icons'; // Ajouter
import type { LevelProgress } from './types/word'; // Ajouter
```

**Étape 2.2:** Ajouter state + constants
```typescript
const LEVEL_ORDER: JLPTLevel[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];

export default function StatsScreen() {
  const router = useRouter();
  // ... existing hooks ...
  const { getAllLevelsProgress, getUnlockedLevels } = useStatistics();

  const [levelsProgress, setLevelsProgress] = useState<Map<JLPTLevel, LevelProgress>>(new Map());
  const [unlockedLevels, setUnlockedLevels] = useState<JLPTLevel[]>([]);
```

**Étape 2.3:** Ajouter useEffect loading
```typescript
useEffect(() => {
  loadProgressionData();
}, [getAllLevelsProgress, getUnlockedLevels]);

async function loadProgressionData() {
  const progress = await getAllLevelsProgress();
  const unlocked = await getUnlockedLevels();
  setLevelsProgress(progress);
  setUnlockedLevels(unlocked);
}
```

**Étape 2.4:** Ajouter useMemo calculations
```typescript
const globalProgress = useMemo(() => {
  // ... logic from architecture section ...
}, [levelsProgress]);

const currentLevel = useMemo(() => {
  // ... logic from architecture section ...
}, [unlockedLevels]);
```

### Phase 3: UI Implementation (2h 15min)

**Étape 3.1:** Ajouter Section Header (45min)
```typescript
{/* Insérer AVANT sections existantes dans ScrollView */}
<Card padding="$4" borderRadius="$4" backgroundColor="$blue2">
  <Text fontSize={20} fontWeight="bold" marginBottom="$3">
    📊 Progression JLPT
  </Text>
  {/* ... global progress metrics ... */}
  <Progress value={globalProgress.percentage} size="$3">
    <Progress.Indicator animation="quick" backgroundColor="$blue10" />
  </Progress>
</Card>
```

**Étape 3.2:** Implémenter Level Cards (1h 30min)
```typescript
<YStack gap="$3">
  {LEVEL_ORDER.map(level => {
    const progress = levelsProgress.get(level);
    const isLocked = !unlockedLevels.includes(level);
    const isCompleted = progress?.isComplete || false;

    return (
      <Pressable key={level} onPress={() => handleLevelTap(level)} disabled={isLocked}>
        <Card /* ... styling ... */>
          {/* Icon + Level Info + Progress Bar */}
        </Card>
      </Pressable>
    );
  })}
</YStack>
```

### Phase 4: Handlers & Logic (20min)

**Étape 4.1:** Implémenter handleLevelTap
```typescript
function handleLevelTap(level: JLPTLevel) {
  const isLocked = !unlockedLevels.includes(level);
  if (isLocked) return;
  router.push(`/level-progress/${level}` as const);
}
```

**Étape 4.2:** Implémenter getPreviousLevel
```typescript
function getPreviousLevel(level: JLPTLevel): string {
  const index = LEVEL_ORDER.indexOf(level);
  if (index <= 0) return '';
  return LEVEL_ORDER[index - 1].toUpperCase();
}
```

### Phase 5: Styling & Polish (45min)

**Étape 5.1:** Appliquer couleurs niveau
- Vérifier cohérence avec levelColors constant
- Vérifier icônes couleurs (locked/unlocked/completed)

**Étape 5.2:** Spacing & Layout
- Vérifier padding/gap consistants
- Vérifier responsive (tester portrait/landscape)

**Étape 5.3:** Animations
- Vérifier pressStyle scale fonctionne
- Vérifier Progress.Indicator animation smooth

### Phase 6: Testing (2h)

**Étape 6.1:** Créer test file (30min)
```bash
# Créer app/__tests__/stats.test.tsx
# Setup mocks (useStatistics, useRouter)
# Create test data (mockLevelsProgress, mockUnlockedLevels)
```

**Étape 6.2:** Écrire tests unitaires (1h)
```typescript
// 17 tests covering:
// - Rendering (3)
// - Progression Section (5)
// - Navigation (3)
// - Visual States (4)
// - Regression (2)
```

**Étape 6.3:** Tests manuels device (30min)
- Vérifier scroll performance
- Tester navigation tap
- Vérifier locked state
- Valider couleurs/icônes

### Phase 7: Corrections & Cleanup (30min)

**Étape 7.1:** Fixer bugs trouvés en tests
**Étape 7.2:** Code cleanup (remove console.logs, etc.)
**Étape 7.3:** Vérifier aucune régression stats existantes

---

## ✅ Definition of Done

### Code
- [ ] useStatistics hook expose getAllLevelsProgress et getUnlockedLevels
- [ ] stats.tsx contient Section Progression JLPT (header + cards)
- [ ] 6 level cards avec états visuels corrects (locked/unlocked/completed)
- [ ] Navigation fonctionnelle vers /level-progress/[level]
- [ ] Disabled state sur cartes locked
- [ ] Aucune régression sections existantes

### Tests
- [ ] Test file app/__tests__/stats.test.tsx créé
- [ ] 17+ tests unitaires passent (100%)
- [ ] Coverage >= 80% sur nouvelles lignes
- [ ] Tests manuels device validés (checklist complète)
- [ ] Aucune régression tests existants

### UX
- [ ] Scroll page fluide 60fps
- [ ] Couleurs niveau cohérentes avec LevelSelect
- [ ] Icônes états claires (Lock/Activity/Check)
- [ ] Progress bars précises (% correct)
- [ ] Loading state fonctionnel

### Documentation
- [ ] Context session updated (context_session_12.md)
- [ ] TODO.md updated (US-006.7 checked)
- [ ] CHANGELOG.md updated ([Unreleased] section)
- [ ] Documentation Maintainer appelé (delivery report créé)

### Checkpoints
- [ ] Lines changed ~150 > 50 → Test Engineer invoqué ✅
- [ ] Lines changed ~150 < 100 → Code Review NOT required ❌
- [ ] Orchestrator validé avant commit
- [ ] All tests passing

---

## 📚 Références

### User Story Source
- **File:** `.claude/docs/epics/us-006-7.md`
- **Epic:** `.claude/docs/epics/epic-006.md`

### Dependencies (Completed)
- **US-006.1:** Calcul Progression (Session 6) - API `getAllLevelsProgress()`
- **US-006.2:** État Déblocage (Session 7) - API `getUnlockedLevels()`
- **US-006.5:** Affichage Détails (Session 10) - Route `/level-progress/[level]`

### Related Files
- `app/stats.tsx` (187 lignes, MVP Session 4)
- `app/hooks/useStatistics.ts` (Session 4)
- `app/services/statistics.ts` (Session 4)
- `app/components/LevelSelect.tsx` (US-006.4, colors reference)
- `app/(tabs)/level-progress/[level].tsx` (US-006.5, navigation target)

### Design References
- **Colors:** Réutiliser `levelColors` de LevelSelect (US-006.4)
- **Icons:** Tamagui lucide-icons (Lock, Check, Activity)
- **Layout:** Cohérence avec existing stats cards

---

## 🎯 Success Metrics

### Functional
- ✅ 6 level cards rendered
- ✅ Correct locked/unlocked states
- ✅ Navigation works (unlocked only)
- ✅ Progress % accurate

### Performance
- ✅ Initial render < 100ms
- ✅ Scroll 60fps
- ✅ No regressions existing features

### Quality
- ✅ 17+ unit tests passing
- ✅ 80%+ coverage
- ✅ Zero console errors/warnings
- ✅ Manual testing checklist complete

---

## 🔄 Post-Implementation

### Next Steps After US-006.7
1. **Manual Device Testing** (recommandé)
   - Valider visual quality
   - Tester navigation flow
   - Vérifier performance scroll

2. **US-006.8 - Migration État Initial** (P1, S, 2-3h)
   - Migration script unlock retroactif
   - Important AVANT production deploy
   - Mais pas bloquant pour dev/testing

3. **Epic-006 Completion** (75% → 100%)
   - US-006.7 complète user-facing features
   - US-006.8 sécurise existing users
   - Epic ready for production

### Future Enhancements (Nice-to-have)
- Pull-to-refresh stats page
- Date déblocage sur cartes completed
- Transition animée navigation
- Charts progression temporelle (graphs)

---

**Plan Status:** READY FOR VALIDATION
**Estimated Effort:** 6h 30min (Medium)
**Dependencies:** All satisfied ✅
**Blocking Issues:** None
**Recommendation:** Proceed with implementation after user validation

---

**Created:** 2025-11-15
**Epic Manager Agent:** Autonomous Plan Generation
**Session:** 12 (estimated)
