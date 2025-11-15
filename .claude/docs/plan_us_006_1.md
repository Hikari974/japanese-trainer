# Plan Technique US-006.1 : Calcul Progression par Niveau

**Epic:** US-006 - Statistiques progressives par niveau
**User Story:** US-006.1 - Calcul progression par niveau (mots maitrise)
**Date:** 2025-11-15
**Agent:** Expo Expert

---

## CONTEXTE

### Reponses Questions Critiques

**Q1 - Seuil maitrise:**
- Critere: `totalPoints >= 5` par mot
- Point = 1 si correct + 1 seul start + pas traduction vue (systeme actuel conserve)

**Q2 - Granularite:**
- Maitrise quelque soit la difficulte (somme des points de chaque difficulte)
- Pour un mot dans un niveau: sommer points de TOUTES les difficultes
- Exemple: mot #42 en N5 → `points(N5-Facile) + points(N5-Normal) + points(N5-Difficile) + points(N5-Extreme) >= 5`

**Q3 - Regles de pioche par niveau:**
- Prendre en compte tous les mots disponibles dans le niveau
- Pattern cumulatif: chaque niveau cumule TOUS les kanji precedents + romaji niveau suivant
  - **Kana**: N5 romaji
  - **N5**: N5 kanji + N4 romaji
  - **N4**: N5 kanji + N4 kanji + N3 romaji
  - **N3**: N5 kanji + N4 kanji + N3 kanji + N2 romaji
  - **N2**: N5 kanji + N4 kanji + N3 kanji + N2 kanji + N1 romaji
  - **N1**: N5 kanji + N4 kanji + N3 kanji + N2 kanji + N1 kanji

### Architecture Actuelle

**Fichiers cles:**
- `app/services/statistics.ts` - Service statistiques avec AsyncStorage
- `app/services/wordSelection.ts` - Regles pioche mots par niveau
- `app/types/statistics.ts` - Types statistiques
- `app/types/word.ts` - Types mots (JLPTLevel, DataLevel)
- `app/data/words/*.json` - Donnees mots (N1-N5)

**Structure stats existante:**
```typescript
interface UserStatistics {
  words: Record<string, WordStatistic>; // Key: "${wordId}-${level}-${difficulty}"
  globalStats: GlobalStatistics;
}

interface WordStatistic {
  wordId: number;
  romaji: string;
  level: JLPTLevel;
  difficulty: Difficulty;
  points: number; // Points accumules
  // ...
}
```

**Regles pioche CORRIGEES (pattern cumulatif):**

Chaque niveau cumule TOUS les kanji des niveaux precedents + romaji du niveau suivant.

- **Kana**: N5 romaji (kana-only)
- **N5**: N5 kanji + N4 romaji
- **N4**: N5 kanji + N4 kanji + N3 romaji
- **N3**: N5 kanji + N4 kanji + N3 kanji + N2 romaji
- **N2**: N5 kanji + N4 kanji + N3 kanji + N2 kanji + N1 romaji
- **N1**: N5 kanji + N4 kanji + N3 kanji + N2 kanji + N1 kanji

**IMPORTANT:** Le code actuel dans `wordSelection.ts` ne respecte PAS ce pattern cumulatif.
- N4 actuel: manque N5 kanji (devrait avoir N5 + N4 + N3)
- N3 actuel: manque N5 kanji (devrait avoir N5 + N4 + N3 + N2)
- N2 actuel: manque N5 + N4 kanji (devrait avoir N5 + N4 + N3 + N2 + N1)
- N1 actuel: manque N5 + N4 + N3 kanji (devrait avoir tous les niveaux)

**Mapping displayMode:**
- "kanji" = kanji-with-furigana (si niveau courant) OU kanji-without-furigana (si niveau precedent)
- "romaji" = kana-only

---

## OBJECTIF US-006.1

Creer fonction `calculateLevelProgress(level: JLPTLevel)` qui:
1. Recupere tous mots disponibles du niveau (selon regles pioche Q3)
2. Pour chaque mot, somme points toutes difficultes
3. Compte combien ont totalPoints >= 5
4. Retourne `{ totalWords, masteredWords, percentage }`

---

## ARCHITECTURE TECHNIQUE

### 1. Types TypeScript

**Fichier:** `app/types/statistics.ts`

**Ajouter interface:**
```typescript
/**
 * Progress statistics for a JLPT level
 */
export interface LevelProgress {
  level: JLPTLevel;
  totalWords: number;        // Total words available in this level
  masteredWords: number;     // Words with totalPoints >= 5
  percentage: number;        // (masteredWords / totalWords) * 100
}
```

**Rationale:**
- Interface separee pour clarte (vs ajouter props a WordStatistic)
- `percentage` pre-calcule pour eviter division par zero dans UI
- `level` inclus pour debugging et affichage

---

### 2. Service Statistics - Extension

**Fichier:** `app/services/statistics.ts`

**Nouvelle fonction principale:**
```typescript
/**
 * Calculate progression for a JLPT level
 *
 * Rules:
 * - totalWords = all words available in level (based on word selection rules)
 * - masteredWords = words with sum(points across all difficulties) >= 5
 * - percentage = (masteredWords / totalWords) * 100
 *
 * @param level - JLPT level (Kana, N5, N4, N3, N2, N1)
 * @returns LevelProgress with totalWords, masteredWords, percentage
 */
export async function calculateLevelProgress(level: JLPTLevel): Promise<LevelProgress> {
  // 1. Get all available words for this level
  const availableWords = getAvailableWordsForLevel(level);
  const totalWords = availableWords.length;

  // 2. Load current user statistics
  const stats = await loadStatistics();

  // 3. Calculate mastered words
  const masteredWords = countMasteredWords(availableWords, stats, level);

  // 4. Calculate percentage
  const percentage = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;

  return {
    level,
    totalWords,
    masteredWords,
    percentage,
  };
}
```

**Fonction helper 1: getAvailableWordsForLevel**
```typescript
/**
 * Get all words available for a level (follows word selection rules)
 *
 * @param level - JLPT level
 * @returns Array of unique word IDs available in this level
 */
function getAvailableWordsForLevel(level: JLPTLevel): number[] {
  // Import word data using wordLoader service
  const pools = buildWordPoolsForLevel(level);

  // Extract unique word IDs (avoid duplicates if same word in multiple pools)
  const wordIds = new Set<number>();
  pools.forEach(pool => {
    pool.words.forEach(word => wordIds.add(word.id));
  });

  return Array.from(wordIds);
}
```

**Fonction helper 2: buildWordPoolsForLevel**
```typescript
/**
 * Build word pools for a level (CORRECTED RULES - cumulative pattern)
 *
 * Rules:
 * - Kana: N5 romaji
 * - N5: N5 kanji + N4 romaji
 * - N4: N5 kanji + N4 kanji + N3 romaji
 * - N3: N5 kanji + N4 kanji + N3 kanji + N2 romaji
 * - N2: N5 kanji + N4 kanji + N3 kanji + N2 kanji + N1 romaji
 * - N1: N5 kanji + N4 kanji + N3 kanji + N2 kanji + N1 kanji
 *
 * @param level - JLPT level
 * @returns Array of word pools with their words
 */
function buildWordPoolsForLevel(level: JLPTLevel): Array<{ level: DataLevel; words: WordEntry[] }> {
  // NOTE: We only need word IDs, not displayMode
  // Each level CUMULATES all kanji from previous levels + romaji from next level

  switch (level) {
    case 'Kana':
      // Kana: N5 romaji only
      return [{ level: 'N5', words: getWordsByLevel('N5').words }];

    case 'N5':
      // N5: N5 kanji + N4 romaji
      return [
        { level: 'N5', words: getWordsByLevel('N5').words },
        { level: 'N4', words: getWordsByLevel('N4').words },
      ];

    case 'N4':
      // N4: N5 kanji + N4 kanji + N3 romaji
      return [
        { level: 'N5', words: getWordsByLevel('N5').words },
        { level: 'N4', words: getWordsByLevel('N4').words },
        { level: 'N3', words: getWordsByLevel('N3').words },
      ];

    case 'N3':
      // N3: N5 kanji + N4 kanji + N3 kanji + N2 romaji
      return [
        { level: 'N5', words: getWordsByLevel('N5').words },
        { level: 'N4', words: getWordsByLevel('N4').words },
        { level: 'N3', words: getWordsByLevel('N3').words },
        { level: 'N2', words: getWordsByLevel('N2').words },
      ];

    case 'N2':
      // N2: N5 kanji + N4 kanji + N3 kanji + N2 kanji + N1 romaji
      return [
        { level: 'N5', words: getWordsByLevel('N5').words },
        { level: 'N4', words: getWordsByLevel('N4').words },
        { level: 'N3', words: getWordsByLevel('N3').words },
        { level: 'N2', words: getWordsByLevel('N2').words },
        { level: 'N1', words: getWordsByLevel('N1').words },
      ];

    case 'N1':
      // N1: N5 kanji + N4 kanji + N3 kanji + N2 kanji + N1 kanji
      return [
        { level: 'N5', words: getWordsByLevel('N5').words },
        { level: 'N4', words: getWordsByLevel('N4').words },
        { level: 'N3', words: getWordsByLevel('N3').words },
        { level: 'N2', words: getWordsByLevel('N2').words },
        { level: 'N1', words: getWordsByLevel('N1').words },
      ];
  }
}
```

**Fonction helper 3: countMasteredWords**
```typescript
/**
 * Count words with totalPoints >= 5 across all difficulties
 *
 * @param wordIds - Array of word IDs to check
 * @param stats - User statistics
 * @param level - JLPT level
 * @returns Number of mastered words
 */
function countMasteredWords(
  wordIds: number[],
  stats: UserStatistics,
  level: JLPTLevel
): number {
  const difficulties: Difficulty[] = ['Facile', 'Normal', 'Difficile', 'Extrême'];

  return wordIds.filter(wordId => {
    // Sum points across all difficulties for this word in this level
    const totalPoints = difficulties.reduce((sum, difficulty) => {
      const key = getWordStatKey(wordId, level, difficulty);
      const wordStat = stats.words[key];
      return sum + (wordStat?.points || 0);
    }, 0);

    // Word is mastered if totalPoints >= 5
    return totalPoints >= 5;
  }).length;
}
```

**Imports necessaires:**
```typescript
import { getWordsByLevel } from './wordLoader';
import type { JLPTLevel, DataLevel, WordEntry } from '../types/word';
import type { Difficulty } from '../components/DifficultySelector';
import type { LevelProgress } from '../types/statistics';
```

**Exports:**
```typescript
export { calculateLevelProgress };
```

---

### 3. Hook React (optionnel mais recommande)

**Fichier:** `app/hooks/useStatistics.ts` (modifier existant)

**Ajouter methode:**
```typescript
/**
 * Calculate level progress
 */
const calculateProgress = useCallback(async (level: JLPTLevel): Promise<LevelProgress> => {
  return await calculateLevelProgress(level);
}, []);

// Add to return object
return {
  statistics,
  isLoading,
  recordAttempt,
  resetStats,
  calculateProgress, // NEW
};
```

**Rationale:**
- Hook expose la fonction pour usage facile dans components
- Pas de state necessaire (calcul on-demand)
- useCallback pour stabilite reference

---

### 4. Tests Unitaires

**Fichier:** `app/services/__tests__/statistics.test.ts` (etendre existant)

**Test suite: calculateLevelProgress**
```typescript
describe('calculateLevelProgress', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should return 0% when no statistics exist', async () => {
    const progress = await calculateLevelProgress('N5');

    expect(progress.level).toBe('N5');
    expect(progress.totalWords).toBeGreaterThan(0); // N5 has words
    expect(progress.masteredWords).toBe(0);
    expect(progress.percentage).toBe(0);
  });

  it('should calculate percentage correctly with mixed mastery', async () => {
    // Setup: Create stats with some mastered words
    const stats: UserStatistics = {
      words: {
        // Word 1: mastered (5 points in Facile)
        '1-N5-Facile': { wordId: 1, romaji: 'test1', level: 'N5', difficulty: 'Facile', points: 5, /* ... */ },

        // Word 2: not mastered (4 points total across difficulties)
        '2-N5-Facile': { wordId: 2, romaji: 'test2', level: 'N5', difficulty: 'Facile', points: 2, /* ... */ },
        '2-N5-Normal': { wordId: 2, romaji: 'test2', level: 'N5', difficulty: 'Normal', points: 2, /* ... */ },

        // Word 3: mastered (6 points across difficulties)
        '3-N5-Normal': { wordId: 3, romaji: 'test3', level: 'N5', difficulty: 'Normal', points: 3, /* ... */ },
        '3-N5-Difficile': { wordId: 3, romaji: 'test3', level: 'N5', difficulty: 'Difficile', points: 3, /* ... */ },
      },
      globalStats: DEFAULT_STATISTICS.globalStats,
    };
    await saveStatistics(stats);

    const progress = await calculateLevelProgress('N5');

    expect(progress.masteredWords).toBe(2); // Words 1 and 3
    expect(progress.percentage).toBeCloseTo((2 / progress.totalWords) * 100);
  });

  it('should sum points across all 4 difficulties correctly', async () => {
    // Setup: Word with 1 point in each difficulty (4 total, not mastered)
    const stats: UserStatistics = {
      words: {
        '1-N5-Facile': { wordId: 1, romaji: 'test', level: 'N5', difficulty: 'Facile', points: 1, /* ... */ },
        '1-N5-Normal': { wordId: 1, romaji: 'test', level: 'N5', difficulty: 'Normal', points: 1, /* ... */ },
        '1-N5-Difficile': { wordId: 1, romaji: 'test', level: 'N5', difficulty: 'Difficile', points: 1, /* ... */ },
        '1-N5-Extrême': { wordId: 1, romaji: 'test', level: 'N5', difficulty: 'Extrême', points: 1, /* ... */ },
      },
      globalStats: DEFAULT_STATISTICS.globalStats,
    };
    await saveStatistics(stats);

    const progress = await calculateLevelProgress('N5');

    expect(progress.masteredWords).toBe(0); // 4 points < 5
  });

  it('should consider word mastered when sum >= 5 across difficulties', async () => {
    // Setup: Word with 5 points total (2+2+1+0)
    const stats: UserStatistics = {
      words: {
        '1-N5-Facile': { wordId: 1, romaji: 'test', level: 'N5', difficulty: 'Facile', points: 2, /* ... */ },
        '1-N5-Normal': { wordId: 1, romaji: 'test', level: 'N5', difficulty: 'Normal', points: 2, /* ... */ },
        '1-N5-Difficile': { wordId: 1, romaji: 'test', level: 'N5', difficulty: 'Difficile', points: 1, /* ... */ },
      },
      globalStats: DEFAULT_STATISTICS.globalStats,
    };
    await saveStatistics(stats);

    const progress = await calculateLevelProgress('N5');

    expect(progress.masteredWords).toBe(1); // 5 points >= threshold
  });

  it('should use correct word pools for Kana level', async () => {
    const progress = await calculateLevelProgress('Kana');

    // Kana uses N5 words only
    const n5Count = getWordsByLevel('N5').words.length;
    expect(progress.totalWords).toBe(n5Count);
  });

  it('should use correct word pools for N5 level', async () => {
    const progress = await calculateLevelProgress('N5');

    // N5 uses N5 + N4 words
    const n5Count = getWordsByLevel('N5').words.length;
    const n4Count = getWordsByLevel('N4').words.length;
    expect(progress.totalWords).toBe(n5Count + n4Count);
  });

  it('should handle 100% mastery correctly', async () => {
    // Setup: All available words mastered (simplified with 1 word)
    const availableWords = getAvailableWordsForLevel('Kana');
    const stats: UserStatistics = {
      words: {},
      globalStats: DEFAULT_STATISTICS.globalStats,
    };

    // Master all words
    availableWords.forEach(wordId => {
      stats.words[`${wordId}-Kana-Facile`] = {
        wordId,
        romaji: `test${wordId}`,
        level: 'Kana',
        difficulty: 'Facile',
        points: 5,
        /* ... */
      };
    });
    await saveStatistics(stats);

    const progress = await calculateLevelProgress('Kana');

    expect(progress.masteredWords).toBe(progress.totalWords);
    expect(progress.percentage).toBe(100);
  });

  it('should handle edge case: level with 0 total words', async () => {
    // Mock getWordsByLevel to return empty array
    jest.spyOn(require('./wordLoader'), 'getWordsByLevel').mockReturnValue({ words: [] });

    const progress = await calculateLevelProgress('N5');

    expect(progress.totalWords).toBe(0);
    expect(progress.masteredWords).toBe(0);
    expect(progress.percentage).toBe(0); // Avoid division by zero
  });
});
```

**Test suite: getAvailableWordsForLevel (helper)**
```typescript
describe('getAvailableWordsForLevel', () => {
  it('should return N5 words for Kana level', () => {
    const wordIds = getAvailableWordsForLevel('Kana');
    const n5Words = getWordsByLevel('N5').words;

    expect(wordIds.length).toBe(n5Words.length);
    expect(wordIds).toEqual(expect.arrayContaining(n5Words.map(w => w.id)));
  });

  it('should return N5+N4 words for N5 level', () => {
    const wordIds = getAvailableWordsForLevel('N5');
    const n5Count = getWordsByLevel('N5').words.length;
    const n4Count = getWordsByLevel('N4').words.length;

    expect(wordIds.length).toBe(n5Count + n4Count);
  });

  it('should not duplicate word IDs if same word in multiple pools', () => {
    const wordIds = getAvailableWordsForLevel('N4');
    const uniqueIds = new Set(wordIds);

    expect(wordIds.length).toBe(uniqueIds.size); // No duplicates
  });
});
```

**Test suite: countMasteredWords (helper)**
```typescript
describe('countMasteredWords', () => {
  it('should count 0 when no stats exist', () => {
    const stats: UserStatistics = {
      words: {},
      globalStats: DEFAULT_STATISTICS.globalStats,
    };

    const count = countMasteredWords([1, 2, 3], stats, 'N5');
    expect(count).toBe(0);
  });

  it('should count words with totalPoints >= 5', () => {
    const stats: UserStatistics = {
      words: {
        '1-N5-Facile': { wordId: 1, points: 5, /* ... */ },
        '2-N5-Facile': { wordId: 2, points: 3, /* ... */ },
        '2-N5-Normal': { wordId: 2, points: 2, /* ... */ }, // Total 5
        '3-N5-Facile': { wordId: 3, points: 4, /* ... */ }, // Total 4, not mastered
      },
      globalStats: DEFAULT_STATISTICS.globalStats,
    };

    const count = countMasteredWords([1, 2, 3], stats, 'N5');
    expect(count).toBe(2); // Words 1 and 2
  });
});
```

**Coverage attendue:** >= 95% pour nouvelles fonctions

---

## INTEGRATION UI (hors scope US-006.1)

**Note:** Implementation UI sera faite dans US-006.2

**Exemple usage futur:**
```typescript
// Dans stats.tsx
const { calculateProgress } = useStatistics();
const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null);

useEffect(() => {
  async function loadProgress() {
    const progress = await calculateProgress(selectedLevel);
    setLevelProgress(progress);
  }
  loadProgress();
}, [selectedLevel, calculateProgress]);

// Affichage:
// "Progression N5: 42/150 mots maitrise (28%)"
```

---

## DECISIONS TECHNIQUES

### Pourquoi mirrorer buildWordPools() au lieu de refactoriser ?

**Option 1 (choisie):** Dupliquer logique dans statistics.ts
- Pro: Separation of concerns (statistics vs word selection)
- Pro: Pas de breaking change dans wordSelection.ts
- Con: Code duplication

**Option 2 (rejetee):** Extraire buildWordPools() en fonction partagee
- Pro: Zero duplication
- Con: Refactoring wordSelection.ts (hors scope US-006.1)
- Con: Coupling entre services

**Decision:** Option 1 pour minimiser impact et respecter scope US-006.1

### Pourquoi pre-calculer percentage ?

- Evite division par zero dans UI
- Simplifie tests (une seule valeur a verifier)
- Performance negligeable (calcul simple)

### Pourquoi Set pour deduplication word IDs ?

- Cas edge: meme mot dans plusieurs pools (theoriquement impossible, mais defensive coding)
- Performance O(1) lookup vs O(n) array.includes()

---

## VALIDATION PLAN

### Checklist Pre-Implementation

- [ ] Types LevelProgress ajoutes dans statistics.ts types
- [ ] Fonction calculateLevelProgress() implementee
- [ ] Helpers getAvailableWordsForLevel(), buildWordPoolsForLevel(), countMasteredWords() implementes
- [ ] Hook useStatistics etendu avec calculateProgress()
- [ ] Tests calculateLevelProgress() ecrits (8 tests minimum)
- [ ] Tests helpers ecrits (5 tests minimum)
- [ ] Coverage >= 95% sur nouvelles fonctions
- [ ] Tous tests passent (npm test)
- [ ] Pas de breaking changes dans code existant

### Acceptance Criteria

**AC1:** Calcul correct totalWords selon regles pioche
- Kana: N5 words
- N5: N5 + N4 words
- N4: N5 + N4 + N3 words
- etc.

**AC2:** Calcul correct masteredWords (sum points >= 5)
- Somme points TOUTES difficultes
- Seuil >= 5 points

**AC3:** Calcul correct percentage
- (masteredWords / totalWords) * 100
- Handle division by zero (0 total words)

**AC4:** Tests passent avec >= 95% coverage

**AC5:** Pas de regression tests existants

---

## RISQUES ET MITIGATIONS

### Risque 1: Performance (1309 words x 4 difficulties)

**Impact:** Calcul peut etre lent sur devices faibles

**Mitigation:**
- Calcul synchrone apres load stats (pas de boucle async)
- Utiliser filter() natif (optimise V8)
- Pas de calcul en temps reel (on-demand seulement)

**Fallback futur:** Caching results si performance insuffisante

### Risque 2: Duplication logique buildWordPools()

**Impact:** Maintenance complexe si regles pioche changent

**Mitigation:**
- Documenter clairement lien entre wordSelection.ts et statistics.ts
- Tests coverage garantit coherence
- Refactoring futur possible (US-006.3 ?)

### Risque 3: Stats corrompu (clefs manquantes, etc.)

**Impact:** Calcul incorrect masteredWords

**Mitigation:**
- Defensive coding: `wordStat?.points || 0`
- Validation structure dans loadStatistics() (deja existant)
- Tests edge cases (stats vide, partiels)

---

## ESTIMATION

**Complexite:** Moyenne (extension service existant)

**Temps estime:**
- Implementation: 2-3h
- Tests: 2h
- Review + fixes: 1h
- **Total: 5-6h**

**Lignes code attendues:**
- statistics.ts: +120 lignes
- statistics.test.ts: +300 lignes
- useStatistics.ts: +10 lignes
- types/statistics.ts: +10 lignes
- **Total: ~440 lignes**

---

## PROCHAINES ETAPES (apres US-006.1)

**US-006.2:** Integration UI dans stats.tsx
- Afficher progression par niveau avec progress bars
- Calculer progression au load page
- Rafraichir apres reset stats

**US-006.3 (CRITIQUE - Bug Fix):** Corriger wordSelection.ts
- Le code actuel dans `wordSelection.ts` ne respecte PAS le pattern cumulatif
- DOIT etre corrige pour coherence avec regles progression
- Impact: utilisateurs N4/N3/N2/N1 voient moins de mots que prevu
- Correction:
  - N4: ajouter N5 kanji (actuellement manquant)
  - N3: ajouter N5 kanji (actuellement manquant)
  - N2: ajouter N5 + N4 kanji (actuellement manquant)
  - N1: ajouter N5 + N4 + N3 kanji (actuellement manquant)

**US-006.4 (optionnel):** Optimisations
- Caching results calculateLevelProgress()
- Refactoriser buildWordPools() en fonction partagee
- Breakdown par difficulte si demande user

---

## CONCLUSION

Plan technique complet et actionable pour US-006.1.

**Points forts:**
- Architecture claire avec separation concerns
- Tests exhaustifs (13+ tests)
- Defensive coding (edge cases)
- Zero breaking changes

**Points attention:**
- Duplication logique buildWordPools() (acceptable pour scope US)
- Performance a monitorer (mitigation: caching futur)

**Ready for implementation:** OUI

**Validation user requise:** OUI (avant implementation)