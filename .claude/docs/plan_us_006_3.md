# Plan d'Implémentation: US-006.3 - Logique de Déblocage Séquentiel

**Epic:** Epic-006 - Système de Progression et Déblocage Séquentiel
**User Story:** US-006.3
**Effort Estimé:** M (4-6h)
**Date Création:** 2025-11-15

---

## 1. REQUIREMENTS SUMMARY

### Objectif
Implémenter un système de déblocage automatique des niveaux JLPT selon la progression utilisateur.

### Règle de Déblocage
- **Ordre strict:** Kana → N5 → N4 → N3 → N2 → N1
- **Critère:** Niveau débloqué quand niveau précédent maîtrisé à 100%
- **Maîtrise:** TOUS les mots du niveau ont score total >= 5 points (toutes difficultés)
- **Automatique:** Vérification déclenchée après chaque `recordAttempt()`

### Critères d'Acceptation Techniques
- [ ] Fonction `checkAndUnlockNextLevel()` implémentée
- [ ] Fonctions utilitaires pures testables (`getNextLevelToUnlock`, `getPreviousLevel`)
- [ ] Event émis lors déblocage (pour feedback UI futur)
- [ ] Performance < 100ms pour vérification complète
- [ ] Intégration dans `recordAttempt()` sans impact UX
- [ ] Tests couvrant scénarios edge (100% coverage)

---

## 2. ARCHITECTURE DESIGN

### 2.1 Constantes et Types

**Fichier:** `app/types/statistics.ts`

```typescript
// JLPT level order constant (shared across codebase)
export const JLPT_LEVEL_ORDER: JLPTLevel[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];

// Event emitted when level is unlocked
export interface LevelUnlockEvent {
  level: JLPTLevel;
  unlockedAt: string;        // ISO 8601 timestamp
  previousLevel: JLPTLevel;  // Level that was mastered
  progress: LevelProgress;   // Progress data of unlocked level
}
```

**Rationale:**
- Constant `JLPT_LEVEL_ORDER` garantit ordre consistant partout
- `LevelUnlockEvent` structure complète pour UI feedback riche
- Types exportés pour usage dans hooks et composants

### 2.2 Service Layer Architecture

**Fichier:** `app/services/statistics.ts`

**Nouvelles fonctions (4 total):**

1. **`getNextLevelToUnlock(unlockedLevels: JLPTLevel[]): JLPTLevel | null`**
   - **Type:** Pure function (testable unitairement)
   - **Input:** Array niveaux déjà débloqués
   - **Output:** Prochain niveau à débloquer, `null` si tous débloqués
   - **Logic:** Itère `JLPT_LEVEL_ORDER`, retourne premier niveau non débloqué

2. **`getPreviousLevel(level: JLPTLevel): JLPTLevel`**
   - **Type:** Pure function (testable unitairement)
   - **Input:** Niveau actuel
   - **Output:** Niveau précédent dans ordre JLPT
   - **Logic:** Index dans `JLPT_LEVEL_ORDER` - 1
   - **Error:** Throw si `level === 'Kana'` (pas de précédent)

3. **`checkAndUnlockNextLevel(): Promise<LevelUnlockEvent | null>`**
   - **Type:** Async orchestration function
   - **Input:** None (lit AsyncStorage via helpers)
   - **Output:** `LevelUnlockEvent` si déblocage effectué, `null` sinon
   - **Logic:**
     1. Récupérer `unlockedLevels` via `getUnlockedLevels()`
     2. Déterminer `nextLevel` via `getNextLevelToUnlock()`
     3. Si `nextLevel === null` → return null (tous débloqués)
     4. Récupérer `previousLevel` via `getPreviousLevel(nextLevel)`
     5. Calculer progression via `calculateLevelProgress(previousLevel)`
     6. Si `progress.percentage < 100` → return null (pas maîtrisé)
     7. Si `progress.percentage === 100` → `unlockLevel(nextLevel)`
     8. Return `LevelUnlockEvent` avec données complètes

4. **`recordAttempt()` (MODIFICATION)**
   - **Change:** Appel `checkAndUnlockNextLevel()` après sauvegarde stats
   - **Async:** Pas de blocage UX (unlock check en background)
   - **Event:** Si unlock, émettre event (système simple)

**Système Event (Simple Implementation):**

```typescript
// Callback storage (in-memory, app session only)
let unlockCallbacks: Array<(event: LevelUnlockEvent) => void> = [];

/**
 * Register callback for level unlock events
 * Used by UI components to show feedback
 */
export function onLevelUnlocked(callback: (event: LevelUnlockEvent) => void): void {
  unlockCallbacks.push(callback);
}

/**
 * Internal: emit unlock event to all registered callbacks
 */
function emitLevelUnlocked(event: LevelUnlockEvent): void {
  unlockCallbacks.forEach(cb => {
    try {
      cb(event);
    } catch (error) {
      if (__DEV__) console.error('Error in unlock callback:', error);
    }
  });
}
```

**Rationale:**
- Système callback simple (pas besoin EventEmitter library)
- Callbacks in-memory seulement (session lifetime OK pour UI feedback)
- Try-catch dans emit pour éviter crash si callback bugué

---

## 3. IMPLEMENTATION STRATEGY

### 3.1 Fonction `getNextLevelToUnlock` (Pure)

**Signature:**
```typescript
function getNextLevelToUnlock(unlockedLevels: JLPTLevel[]): JLPTLevel | null
```

**Algorithm:**
```typescript
export function getNextLevelToUnlock(unlockedLevels: JLPTLevel[]): JLPTLevel | null {
  for (const level of JLPT_LEVEL_ORDER) {
    if (!unlockedLevels.includes(level)) {
      return level;
    }
  }
  return null; // All levels unlocked
}
```

**Edge Cases:**
- Empty array → return `'Kana'` (premier niveau)
- All levels unlocked → return `null`
- Ordre non séquentiel (ex: `['Kana', 'N4']`) → return `'N5'` (comble gap)

**Tests (4 tests):**
1. `['Kana']` → `'N5'`
2. `['Kana', 'N5']` → `'N4'`
3. `JLPT_LEVEL_ORDER` (tous) → `null`
4. `[]` → `'Kana'`

### 3.2 Fonction `getPreviousLevel` (Pure)

**Signature:**
```typescript
function getPreviousLevel(level: JLPTLevel): JLPTLevel
```

**Algorithm:**
```typescript
export function getPreviousLevel(level: JLPTLevel): JLPTLevel {
  const index = JLPT_LEVEL_ORDER.indexOf(level);

  if (index <= 0) {
    throw new Error(`No previous level for ${level}`);
  }

  return JLPT_LEVEL_ORDER[index - 1];
}
```

**Edge Cases:**
- `'Kana'` → throw Error (documented behavior)
- `'N5'` → `'Kana'`
- `'N1'` → `'N2'`

**Tests (4 tests):**
1. `'N5'` → `'Kana'`
2. `'N4'` → `'N5'`
3. `'N1'` → `'N2'`
4. `'Kana'` → throw Error

### 3.3 Fonction `checkAndUnlockNextLevel` (Orchestration)

**Signature:**
```typescript
async function checkAndUnlockNextLevel(): Promise<LevelUnlockEvent | null>
```

**Algorithm (Step-by-step):**

```typescript
export async function checkAndUnlockNextLevel(): Promise<LevelUnlockEvent | null> {
  try {
    // Step 1: Get currently unlocked levels
    const unlockedLevels = await getUnlockedLevels();

    // Step 2: Determine next level to unlock
    const nextLevel = getNextLevelToUnlock(unlockedLevels);
    if (nextLevel === null) {
      return null; // All levels already unlocked
    }

    // Step 3: Get previous level (what needs to be mastered)
    const previousLevel = getPreviousLevel(nextLevel);

    // Step 4: Calculate progress of previous level
    const progress = await calculateLevelProgress(previousLevel);

    // Step 5: Check if previous level is 100% mastered
    if (progress.percentage < 100) {
      return null; // Not ready to unlock yet
    }

    // Step 6: Unlock next level
    const wasUnlocked = await unlockLevel(nextLevel);
    if (!wasUnlocked) {
      return null; // Already unlocked (race condition)
    }

    // Step 7: Calculate progress of newly unlocked level
    const nextLevelProgress = await calculateLevelProgress(nextLevel);

    // Step 8: Create and return unlock event
    const event: LevelUnlockEvent = {
      level: nextLevel,
      unlockedAt: new Date().toISOString(),
      previousLevel: previousLevel,
      progress: nextLevelProgress,
    };

    return event;
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to check and unlock next level:', error);
    }
    return null;
  }
}
```

**Performance Considerations:**
- 3 AsyncStorage reads worst case: `getUnlockedLevels()`, `calculateLevelProgress()` x2
- Cache in `isLevelUnlocked()` déjà implémenté (TTL 5s) → réduit reads
- Estimation: ~50-80ms sur device moyen (bien < 100ms threshold)

**Edge Cases:**
1. **Tous niveaux débloqués:** Step 2 return null immediately
2. **Niveau précédent pas maîtrisé:** Step 5 return null (normal flow)
3. **Race condition (double unlock):** Step 6 return false → function return null
4. **AsyncStorage error:** Try-catch return null (graceful degradation)

**Tests (8 tests):**
1. Kana 50% maîtrisé → return null
2. Kana 100% maîtrisé → unlock N5, return event
3. N5 100% maîtrisé → unlock N4, return event
4. Tous débloqués → return null
5. Race condition (niveau déjà débloqué) → return null
6. AsyncStorage error → return null
7. Event structure validation (correct fields)
8. Progress calculation appelée 2x (previous + next)

### 3.4 Modification `recordAttempt` (Integration)

**Current Implementation:**
```typescript
export async function recordAttempt(attemptData: AttemptData): Promise<number> {
  // ... existing logic ...

  // Save updated statistics
  await saveStatistics(stats);

  return pointsEarned;
}
```

**New Implementation:**
```typescript
export async function recordAttempt(attemptData: AttemptData): Promise<number> {
  // ... existing logic (unchanged) ...

  // Save updated statistics
  await saveStatistics(stats);

  // NEW: Check if next level should be unlocked
  // Run async (don't block return - fire and forget)
  checkAndUnlockNextLevel()
    .then(event => {
      if (event) {
        emitLevelUnlocked(event);
      }
    })
    .catch(error => {
      if (__DEV__) {
        console.error('Unlock check failed:', error);
      }
    });

  return pointsEarned;
}
```

**Rationale:**
- **Non-blocking:** `.then()/.catch()` chain ne bloque pas return
- **Background:** Unlock check execute en background pendant affichage feedback
- **Event emit:** Si unlock, event émis automatiquement pour UI
- **Error safe:** Catch errors pour éviter crash silencieux

**Alternative (Await Version):**
```typescript
// If we want to wait for unlock check (blocking)
await checkAndUnlockNextLevel()
  .then(event => { if (event) emitLevelUnlocked(event); })
  .catch(() => {});

return pointsEarned;
```

**Decision:** Use **fire-and-forget** (non-blocking) pour éviter ralentir UX.

**Tests (3 tests):**
1. `recordAttempt()` déclenche `checkAndUnlockNextLevel()` (spy)
2. Unlock event émis quand niveau débloqué (callback mock)
3. Performance `recordAttempt()` < 200ms (pas dégradée par unlock check)

---

## 4. INTEGRATION POINTS

### 4.1 Hook React Extension

**Fichier:** `app/hooks/useStatistics.ts`

**Nouvelle fonction:**
```typescript
/**
 * Register callback for level unlock events
 * Example: Show toast notification when level unlocked
 */
const registerUnlockCallback = useCallback(
  (callback: (event: LevelUnlockEvent) => void) => {
    onLevelUnlocked(callback);
  },
  []
);
```

**Return:**
```typescript
return {
  statistics,
  isLoading,
  recordAttempt,
  resetStats,
  calculateProgress,
  checkLevelUnlocked,
  unlockLevel: unlockLevelWrapper,
  getUnlockedLevels: getUnlockedLevelsWrapper,
  registerUnlockCallback, // NEW
};
```

**Usage Example (Future US-006.6):**
```typescript
const { registerUnlockCallback } = useStatistics();

useEffect(() => {
  registerUnlockCallback((event) => {
    // Show toast notification
    alert(`Niveau ${event.level} débloqué !`);
  });
}, []);
```

### 4.2 UI Integration (Future)

**US-006.4 (UI Locked/Unlocked):**
- LevelSelect.tsx utilisera `checkLevelUnlocked()` pour disable boutons
- Graying out + lock icon sur niveaux lockés

**US-006.6 (Feedback Déblocage):**
- Modal/Toast affichant event quand `registerUnlockCallback()` triggered
- Animation célébration déblocage niveau

**Pas implémenté dans US-006.3** (hors scope).

---

## 5. TESTING STRATEGY

### 5.1 Tests Unitaires (Pure Functions)

**Fichier:** `app/services/__tests__/statistics.unlock-logic.test.ts`

**Groupes de tests:**

1. **`getNextLevelToUnlock` (4 tests)**
   - Kana seul débloqué → N5
   - Kana + N5 → N4
   - Tous débloqués → null
   - Aucun débloqué → Kana

2. **`getPreviousLevel` (4 tests)**
   - N5 → Kana
   - N4 → N5
   - N1 → N2
   - Kana → throw Error

3. **`checkAndUnlockNextLevel` (8 tests)**
   - Kana 50% → null
   - Kana 100% → unlock N5 + event
   - N5 100% → unlock N4 + event
   - Tous débloqués → null
   - Race condition → null
   - AsyncStorage error → null
   - Event structure valide
   - Progress calculation x2

4. **`recordAttempt` integration (3 tests)**
   - Trigger `checkAndUnlockNextLevel()` appelé
   - Event émis si unlock
   - Performance pas dégradée

**Total:** ~19 tests

**Coverage Target:** 100% statements, 100% branches, 100% functions

### 5.2 Tests Intégration (Scénarios Complets)

**Fichier:** `app/services/__tests__/statistics.unlock-scenarios.test.ts`

**Scénarios:**

1. **Parcours complet Kana → N5 (Full Flow)**
   ```typescript
   it('unlocks N5 after mastering all Kana words', async () => {
     // 1. Maîtriser tous mots Kana (5 points chacun)
     const kanaWords = getWordsByLevel('N5').words; // Kana = N5 romaji
     for (const word of kanaWords) {
       for (let i = 0; i < 5; i++) {
         await recordAttempt({
           wordId: word.id,
           level: 'Kana',
           difficulty: 'Normal',
           isCorrect: true,
           startCount: 1,
           translationViewed: false,
           romaji: word.romaji,
         });
       }
     }

     // 2. Vérifier N5 débloqué
     const unlockedLevels = await getUnlockedLevels();
     expect(unlockedLevels).toContain('N5');

     // 3. Vérifier unlock date enregistré
     const stats = await loadStatistics();
     expect(stats.levelUnlockDates['N5']).toBeDefined();
   });
   ```

2. **Parcours séquentiel Kana → N5 → N4**
   - Maîtriser Kana → vérifier N5 débloqué
   - Maîtriser N5 (N5 kanji + N4 romaji) → vérifier N4 débloqué
   - Vérifier ordre `['Kana', 'N5', 'N4']`

3. **Impossibilité skip niveau**
   - Maîtriser N4 sans débloquer N5 → N4 reste locked
   - Vérifier N5 pas dans `unlockedLevels`

**Total:** 3 scénarios complets

### 5.3 Tests Performance (Benchmarks)

**Fichier:** `app/services/__tests__/statistics.unlock-performance.test.ts`

```typescript
describe('Performance Benchmarks', () => {
  it('checkAndUnlockNextLevel completes in < 100ms', async () => {
    const start = Date.now();
    await checkAndUnlockNextLevel();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });

  it('recordAttempt with unlock check < 200ms', async () => {
    const start = Date.now();
    await recordAttempt({ /* ... */ });
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(200);
  });
});
```

**Total:** 2 tests performance

### 5.4 Coverage Summary

| Component | Tests | Coverage Target |
|-----------|-------|-----------------|
| Pure functions | 8 | 100% |
| Orchestration | 8 | 100% |
| Integration | 3 | 100% |
| Scenarios | 3 | N/A (E2E style) |
| Performance | 2 | N/A (benchmarks) |
| **TOTAL** | **24 tests** | **100%** |

---

## 6. CODE STRUCTURE

### 6.1 Fichiers Modifiés

**1. `app/types/statistics.ts` (+10 lignes)**
```typescript
// NEW: JLPT level order constant
export const JLPT_LEVEL_ORDER: JLPTLevel[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];

// NEW: Event emitted on level unlock
export interface LevelUnlockEvent {
  level: JLPTLevel;
  unlockedAt: string;
  previousLevel: JLPTLevel;
  progress: LevelProgress;
}
```

**2. `app/services/statistics.ts` (+120 lignes)**
```typescript
// Imports
import { JLPT_LEVEL_ORDER, LevelUnlockEvent } from '../types/statistics';

// Callback storage (in-memory)
let unlockCallbacks: Array<(event: LevelUnlockEvent) => void> = [];

// NEW: Public API
export function onLevelUnlocked(callback: (event: LevelUnlockEvent) => void): void
export function getNextLevelToUnlock(unlockedLevels: JLPTLevel[]): JLPTLevel | null
export function getPreviousLevel(level: JLPTLevel): JLPTLevel
export async function checkAndUnlockNextLevel(): Promise<LevelUnlockEvent | null>

// NEW: Internal helper
function emitLevelUnlocked(event: LevelUnlockEvent): void

// MODIFIED: recordAttempt (add unlock check at end)
export async function recordAttempt(attemptData: AttemptData): Promise<number> {
  // ... existing logic ...
  await saveStatistics(stats);

  // NEW: Fire-and-forget unlock check
  checkAndUnlockNextLevel().then(/*...*/).catch(/*...*/);

  return pointsEarned;
}
```

**3. `app/hooks/useStatistics.ts` (+15 lignes)**
```typescript
import { onLevelUnlocked, LevelUnlockEvent } from '../services/statistics';

// NEW: Hook wrapper for unlock callback registration
const registerUnlockCallback = useCallback(
  (callback: (event: LevelUnlockEvent) => void) => {
    onLevelUnlocked(callback);
  },
  []
);

// Return extended
return {
  // ... existing ...
  registerUnlockCallback, // NEW
};
```

**4. `app/services/__tests__/statistics.unlock-logic.test.ts` (NEW - 600 lignes)**
- 19 tests unitaires
- Coverage 100%

**5. `app/services/__tests__/statistics.unlock-scenarios.test.ts` (NEW - 400 lignes)**
- 3 scénarios intégration
- 2 tests performance

### 6.2 Estimation Lignes Code

| Fichier | Type | Lignes |
|---------|------|--------|
| types/statistics.ts | Modif | +10 |
| services/statistics.ts | Modif | +120 |
| hooks/useStatistics.ts | Modif | +15 |
| __tests__/unlock-logic.test.ts | New | 600 |
| __tests__/unlock-scenarios.test.ts | New | 400 |
| **TOTAL** | | **~1,145 lignes** |

**Code production:** 145 lignes
**Tests:** 1,000 lignes
**Ratio tests/code:** 6.9:1 (très bon)

---

## 7. LOGIC FLOW DIAGRAM

```
User finit validation
       ↓
recordAttempt() appelé
       ↓
Save statistics
       ↓
checkAndUnlockNextLevel() (async, non-blocking)
       ↓
   ┌──────────────────────┐
   │ Get unlockedLevels   │
   └──────────────────────┘
       ↓
   ┌──────────────────────┐
   │ Get nextLevel        │ ──→ null? → STOP (tous débloqués)
   └──────────────────────┘
       ↓
   ┌──────────────────────┐
   │ Get previousLevel    │
   └──────────────────────┘
       ↓
   ┌──────────────────────┐
   │ Calculate progress   │
   │ (previousLevel)      │
   └──────────────────────┘
       ↓
   percentage < 100? → STOP (pas maîtrisé)
       ↓ No
   ┌──────────────────────┐
   │ unlockLevel(next)    │
   └──────────────────────┘
       ↓
   wasUnlocked = false? → STOP (race condition)
       ↓ No
   ┌──────────────────────┐
   │ Calculate progress   │
   │ (nextLevel)          │
   └──────────────────────┘
       ↓
   ┌──────────────────────┐
   │ Create event         │
   └──────────────────────┘
       ↓
   ┌──────────────────────┐
   │ emitLevelUnlocked()  │
   └──────────────────────┘
       ↓
   Callbacks triggered (UI feedback)
```

---

## 8. INTEGRATION CHECKLIST

### Pre-Implementation
- [ ] Read US-006.1 code (calculateLevelProgress implementation)
- [ ] Read US-006.2 code (unlock state management)
- [ ] Understand cumulative word pool pattern (Kana=N5 romaji, etc.)
- [ ] Verify vocabulary data structure (getWordsByLevel API)

### Implementation Phase 1: Pure Functions (1h)
- [ ] Add `JLPT_LEVEL_ORDER` constant to types/statistics.ts
- [ ] Add `LevelUnlockEvent` interface to types/statistics.ts
- [ ] Implement `getNextLevelToUnlock()` in services/statistics.ts
- [ ] Implement `getPreviousLevel()` in services/statistics.ts
- [ ] Write 8 unit tests (pure functions)
- [ ] Verify 100% coverage for pure functions

### Implementation Phase 2: Orchestration (1.5h)
- [ ] Implement callback storage (in-memory array)
- [ ] Implement `onLevelUnlocked()` public API
- [ ] Implement `emitLevelUnlocked()` internal helper
- [ ] Implement `checkAndUnlockNextLevel()` orchestration
- [ ] Write 8 unit tests (orchestration)
- [ ] Verify 100% coverage for orchestration

### Implementation Phase 3: Integration (1h)
- [ ] Modify `recordAttempt()` to call unlock check
- [ ] Test fire-and-forget pattern (non-blocking)
- [ ] Add `registerUnlockCallback` to useStatistics hook
- [ ] Write 3 integration tests
- [ ] Performance benchmark < 100ms

### Implementation Phase 4: Scenarios (1h)
- [ ] Write scenario Kana → N5 (full flow)
- [ ] Write scenario Kana → N5 → N4 (sequential)
- [ ] Write scenario skip impossible (edge case)
- [ ] Verify scenarios pass with real vocabulary data

### Implementation Phase 5: Tests & Polish (0.5h)
- [ ] Run full test suite (24 tests)
- [ ] Verify 100% coverage (statements, branches, functions)
- [ ] Add inline documentation (JSDoc comments)
- [ ] TypeScript strict mode (no errors)

---

## 9. POINTS D'ATTENTION

### 9.1 Performance

**Concern:** `checkAndUnlockNextLevel()` appelé après CHAQUE validation.

**Mitigations:**
1. **Cache unlock status:** `isLevelUnlocked()` déjà a cache 5s TTL (US-006.2)
2. **Fire-and-forget:** Unlock check ne bloque pas UI (async background)
3. **Early returns:** Si tous débloqués, function return immédiatement (1 AsyncStorage read)
4. **Benchmark:** Tests performance garantissent < 100ms

**Alternative (si performance problématique):**
- Throttle unlock checks (vérifier tous les 5 attempts au lieu de chaque)
- Debounce avec timeout 1s (attendre inactivité user)
- **Decision:** Garder simple d'abord, optimiser si nécessaire

### 9.2 Edge Cases

**1. Race Condition (Double Unlock)**
- **Scenario:** Deux validations simultanées (très rare sur mobile)
- **Handling:** `unlockLevel()` est idempotent, retourne `false` si déjà débloqué
- **Result:** `checkAndUnlockNextLevel()` return null, pas d'event émis deux fois

**2. AsyncStorage Error**
- **Scenario:** Device storage full, corrupted data
- **Handling:** Try-catch dans `checkAndUnlockNextLevel()`, return null
- **Result:** Déblocage skip silencieusement, user peut retry session suivante

**3. Tous Niveaux Déjà Débloqués**
- **Scenario:** User avancé a tout débloqué
- **Handling:** `getNextLevelToUnlock()` return null, function exit early
- **Result:** 1 AsyncStorage read seulement, performance OK

**4. Niveau Précédent pas Maîtrisé**
- **Scenario:** User progress 99% sur niveau
- **Handling:** `progress.percentage < 100` check, return null
- **Result:** Pas de déblocage, normal flow

### 9.3 UX Considerations

**Feedback Immédiat Requis (US-006.6):**
- US-006.3 émet event, mais n'implémente PAS UI feedback
- Modal/Toast sera implémenté dans US-006.6
- `registerUnlockCallback()` API ready pour US-006.6

**Progression Visible (US-006.5):**
- User doit voir combien mots restent (X/Y mots maîtrisés)
- US-006.5 implémentera affichage détaillé
- `calculateLevelProgress()` déjà disponible (US-006.1)

**Pas de Frustration:**
- Critère 100% très strict (TOUS les mots)
- Consider feedback user après tests beta
- Possible ajustement threshold 80% → 100% si trop dur

---

## 10. DEFINITION OF DONE

### Code
- [ ] Constant `JLPT_LEVEL_ORDER` définie et exportée
- [ ] Interface `LevelUnlockEvent` définie et exportée
- [ ] 3 fonctions publiques implémentées (getNext, getPrevious, checkAndUnlock)
- [ ] 2 fonctions internes implémentées (emit, callbacks)
- [ ] `recordAttempt()` modifiée avec unlock check
- [ ] Hook `useStatistics` étendu avec `registerUnlockCallback`
- [ ] TypeScript strict mode sans erreurs
- [ ] Inline documentation (JSDoc) complète

### Tests
- [ ] 24 tests écrits (unit + integration + scenarios)
- [ ] Tous tests passent (24/24)
- [ ] Coverage >= 100% statements
- [ ] Coverage >= 100% branches
- [ ] Coverage >= 100% functions
- [ ] Performance benchmarks < 100ms validés

### Documentation
- [ ] Plan implémentation validé user (CE FICHIER)
- [ ] Inline comments pour logic complexe
- [ ] Types exportés documentés (JSDoc)

### Integration
- [ ] Aucune régression US-006.1 (23 tests progression passent)
- [ ] Aucune régression US-006.2 (15 tests unlock passent)
- [ ] Backward compatible avec statistics existantes
- [ ] Performance `recordAttempt()` pas dégradée (< 200ms)

---

## 11. DEPENDENCIES & BLOCKERS

### Dependencies (MUST be completed first)
- ✅ **US-006.1** (Calcul Progression) - DONE (commit 26f7d66)
- ✅ **US-006.2** (État Déblocage) - DONE (commit 7d447f8)

### Blocks (Cannot start until US-006.3 done)
- ⏳ **US-006.4** (UI Locked/Unlocked) - Needs unlock status checks
- ⏳ **US-006.6** (Feedback Déblocage) - Needs unlock events
- ⏳ **US-006.8** (Migration Users Existants) - Needs unlock logic

### No Conflicts
- US-006.5 (Détails Progression) - Independent
- US-006.7 (Stats Page Enrichie) - Independent

---

## 12. RISKS & MITIGATIONS

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Performance dégradée (unlock check chaque attempt) | Medium | Low | Fire-and-forget async, benchmark tests, cache |
| Race condition double unlock | Low | Very Low | Idempotent unlockLevel(), tests coverage |
| AsyncStorage errors bloquent unlock | Medium | Low | Try-catch graceful degradation, retry next session |
| Critère 100% trop strict pour users | High | Medium | Monitor user feedback, préparer fallback 80% threshold |
| Callback memory leaks (listeners pas cleaned) | Low | Low | Document cleanup best practice, session lifetime OK |

---

## 13. IMPLEMENTATION ORDER (RECOMMENDED)

1. **Phase 1:** Types et constantes (15 min)
   - `JLPT_LEVEL_ORDER`, `LevelUnlockEvent`

2. **Phase 2:** Pure functions (1h)
   - `getNextLevelToUnlock()`, `getPreviousLevel()`
   - Unit tests (8 tests)

3. **Phase 3:** Event system (30 min)
   - Callback storage, `onLevelUnlocked()`, `emitLevelUnlocked()`

4. **Phase 4:** Orchestration (1h)
   - `checkAndUnlockNextLevel()`
   - Unit tests (8 tests)

5. **Phase 5:** Integration recordAttempt (30 min)
   - Modify `recordAttempt()` with fire-and-forget
   - Integration tests (3 tests)

6. **Phase 6:** Hook extension (15 min)
   - Add `registerUnlockCallback` to `useStatistics`

7. **Phase 7:** Scenarios & Performance (1h)
   - Full flow scenarios (3 tests)
   - Performance benchmarks (2 tests)

8. **Phase 8:** Polish & Documentation (30 min)
   - JSDoc comments
   - TypeScript strict validation
   - Final test run

**Total Estimated Time:** 5-6 hours

---

## 14. SUCCESS CRITERIA

### Functional
- ✅ Kana débloqué par défaut (vérifié US-006.2)
- ✅ N5 débloqué automatiquement après maîtrise Kana (100%)
- ✅ Déblocage suit ordre strict Kana → N5 → N4 → N3 → N2 → N1
- ✅ Impossible débloquer niveau sans avoir débloqué précédent
- ✅ Vérification automatique après chaque `recordAttempt()`

### Technical
- ✅ Function `checkAndUnlockNextLevel()` implemented
- ✅ Pure functions `getNextLevelToUnlock()`, `getPreviousLevel()` testable
- ✅ Event system simple (callbacks) fonctionnel
- ✅ Performance < 100ms vérification complète
- ✅ Tests coverage 100% (24 tests passing)

### Integration
- ✅ Aucune régression US-006.1 (progression)
- ✅ Aucune régression US-006.2 (unlock state)
- ✅ Hook `useStatistics` ready pour UI integration
- ✅ Event API ready pour US-006.6 (feedback UI)

---

**Plan Created By:** Epic Manager Agent
**Reviewed By:** (Pending user validation)
**Status:** DRAFT - Awaiting User Approval
**Next Step:** User validation → Implementation (Expo Expert Agent)
