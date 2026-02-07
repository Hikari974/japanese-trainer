# Plan de Tests - Unlock Features (US-006.2)

**Date:** 2025-11-15
**Scope:** Level unlock state management (statistics.ts)
**Couverture actuelle:** 0% (nouvelles fonctionnalités)
**Couverture cible:** >= 90%

---

## Contexte

US-006.2 "Gestion de l'État de Déblocage des Niveaux" a ajouté 3 nouvelles fonctions publiques et 1 fonction de migration :
- `isLevelUnlocked(level)` - Vérifie si un niveau est débloqué
- `unlockLevel(level)` - Débloque un niveau et enregistre le timestamp
- `getUnlockedLevels()` - Retourne la liste des niveaux débloqués
- `migrateUnlockFields(oldStats)` - Migration automatique des anciennes stats (privée, testée via loadStatistics)

**Modifications apportées :**
- `app/types/statistics.ts` (+2 lignes) : Ajout champs `unlockedLevels`, `levelUnlockDates`
- `app/services/statistics.ts` (+87 lignes) : Migration + 3 méthodes publiques
- `app/hooks/useStatistics.ts` (+43 lignes) : Exposition hooks React (non testé ici - tests unitaires service uniquement)

**Fichiers existants :**
- Tests existants dans `app/services/__tests__/statistics.test.ts` (870 lignes, ~42 tests)
- Nouveau fichier : `app/services/__tests__/statistics.unlock.test.ts`

---

## Tests Unitaires

### Groupe 1 : Nouveaux utilisateurs (3 tests)

**Fonction:** `loadStatistics()` avec migration automatique

#### Test 1.1: Kana débloqué par défaut pour nouveaux utilisateurs
- **Input:** AsyncStorage vide (null)
- **Expected:** `DEFAULT_STATISTICS` avec `unlockedLevels: ['Kana']`
- **Assertions:**
  - `toContain('Kana')`
  - `toHaveLength(1)`
  - `levelUnlockDates.Kana` existe

#### Test 1.2: isLevelUnlocked('Kana') retourne true pour nouveau user
- **Input:** Nouveau utilisateur (AsyncStorage null)
- **Expected:** `true`
- **Assertions:** `toBe(true)`

#### Test 1.3: isLevelUnlocked('N5') retourne false pour nouveau user
- **Input:** Nouveau utilisateur (AsyncStorage null)
- **Expected:** `false`
- **Assertions:** `toBe(false)`

---

### Groupe 2 : unlockLevel() - Débloquage de niveaux (5 tests)

**Fonction:** `unlockLevel(level: JLPTLevel): Promise<boolean>`

#### Test 2.1: Débloque niveau et persiste dans AsyncStorage
- **Input:** User avec ['Kana'], unlock 'N5'
- **Expected:**
  - Retourne `true` (nouveau déblocage)
  - AsyncStorage contient `['Kana', 'N5']`
  - `levelUnlockDates.N5` timestamp ISO 8601
- **Assertions:**
  - `expect(result).toBe(true)`
  - `expect(mockAsyncStorage.setItem).toHaveBeenCalled()`
  - `expect(savedData.unlockedLevels).toContain('N5')`
  - `expect(savedData.levelUnlockDates.N5).toMatch(/^\d{4}-\d{2}-\d{2}T/)`

#### Test 2.2: Retourne true si niveau nouvellement débloqué
- **Input:** User avec ['Kana'], unlock 'N5'
- **Expected:** Retourne `true`
- **Assertions:** `toBe(true)`

#### Test 2.3: Retourne false si niveau déjà débloqué (idempotent)
- **Input:** User avec ['Kana', 'N5'], unlock 'N5' à nouveau
- **Expected:**
  - Retourne `false`
  - AsyncStorage **NON appelé** (pas de modification)
- **Assertions:**
  - `expect(result).toBe(false)`
  - `expect(mockAsyncStorage.setItem).not.toHaveBeenCalled()`

#### Test 2.4: Ajoute timestamp ISO 8601 dans levelUnlockDates
- **Setup:** Mock Date à `2025-11-15T12:30:00.000Z`
- **Input:** User avec ['Kana'], unlock 'N5'
- **Expected:** `levelUnlockDates.N5 === '2025-11-15T12:30:00.000Z'`
- **Assertions:**
  - `expect(savedData.levelUnlockDates.N5).toBe('2025-11-15T12:30:00.000Z')`

#### Test 2.5: Conserve ordre chronologique dans unlockedLevels
- **Input:** User avec ['Kana'], unlock 'N5' puis 'N4' puis 'N3'
- **Expected:** `unlockedLevels === ['Kana', 'N5', 'N4', 'N3']`
- **Assertions:**
  - `expect(savedData.unlockedLevels).toEqual(['Kana', 'N5', 'N4', 'N3'])`

---

### Groupe 3 : Migration des anciennes statistiques (4 tests)

**Fonction:** `loadStatistics()` avec migration automatique via `migrateUnlockFields()`

#### Test 3.1: Ajoute champs unlock à stats existantes sans ces champs
- **Input:** Stats anciennes (sans `unlockedLevels` ni `levelUnlockDates`)
  ```json
  {
    "words": {"42-N5-Normal": {...}},
    "globalStats": {"totalPoints": 10, "lastSessionDate": "2025-11-10T12:00:00.000Z"}
  }
  ```
- **Expected:**
  - `unlockedLevels: ['Kana']` ajouté
  - `levelUnlockDates: { Kana: '2025-11-10T12:00:00.000Z' }` (utilise `lastSessionDate`)
  - AsyncStorage appelé pour persister migration
- **Assertions:**
  - `expect(stats.unlockedLevels).toEqual(['Kana'])`
  - `expect(stats.levelUnlockDates.Kana).toBe('2025-11-10T12:00:00.000Z')`
  - `expect(mockAsyncStorage.setItem).toHaveBeenCalled()`

#### Test 3.2: Préserve TOUTES données existantes (words, globalStats)
- **Input:** Stats anciennes avec `words` et `globalStats` complets
- **Expected:**
  - Tous les champs `words` préservés
  - Tous les champs `globalStats` préservés
  - Aucune perte de données
- **Assertions:**
  - `expect(stats.words).toEqual(existingWords)`
  - `expect(stats.globalStats).toEqual(existingGlobalStats)`

#### Test 3.3: Migration est idempotente (ne modifie pas stats déjà migrées)
- **Input:** Stats déjà migrées (avec `unlockedLevels` et `levelUnlockDates`)
- **Expected:**
  - AsyncStorage **NON appelé** (pas de re-migration)
  - Données inchangées
- **Assertions:**
  - `expect(mockAsyncStorage.setItem).not.toHaveBeenCalled()`
  - `expect(stats.unlockedLevels).toEqual(['Kana', 'N5'])` (préservé)

#### Test 3.4: Utilise lastSessionDate si disponible, sinon Date.now()
- **Cas A:** `lastSessionDate` existe
  - **Input:** Stats anciennes avec `globalStats.lastSessionDate: '2025-11-10T12:00:00.000Z'`
  - **Expected:** `levelUnlockDates.Kana === '2025-11-10T12:00:00.000Z'`
- **Cas B:** `lastSessionDate` manquant
  - **Input:** Stats anciennes sans `globalStats.lastSessionDate`
  - **Expected:** `levelUnlockDates.Kana` utilise timestamp actuel
- **Assertions:**
  - Cas A: `expect(stats.levelUnlockDates.Kana).toBe('2025-11-10T12:00:00.000Z')`
  - Cas B: `expect(stats.levelUnlockDates.Kana).toMatch(/^\d{4}-\d{2}-\d{2}T/)`

---

### Groupe 4 : Immutabilité de getUnlockedLevels() (2 tests)

**Fonction:** `getUnlockedLevels(): Promise<JLPTLevel[]>`

#### Test 4.1: Retourne un clone de unlockedLevels (pas la référence)
- **Input:** Stats avec `unlockedLevels: ['Kana', 'N5']`
- **Expected:** Retourne nouveau array, pas référence originale
- **Test:**
  ```typescript
  const levels1 = await getUnlockedLevels();
  const levels2 = await getUnlockedLevels();
  expect(levels1).not.toBe(levels2); // Références différentes
  expect(levels1).toEqual(levels2);  // Contenu identique
  ```

#### Test 4.2: Mutation du retour ne modifie pas stats internes
- **Input:** Stats avec `unlockedLevels: ['Kana', 'N5']`
- **Test:**
  ```typescript
  const levels = await getUnlockedLevels();
  levels.push('N4'); // Mutation externe

  const statsAfter = await loadStatistics();
  expect(statsAfter.unlockedLevels).toEqual(['Kana', 'N5']); // Inchangé
  ```

---

### Groupe 5 : Error handling AsyncStorage (1 test)

#### Test 5.1: Gestion erreurs AsyncStorage dans unlock functions

**Test 5.1a: isLevelUnlocked() retourne false si AsyncStorage fail**
- **Input:** `getItem()` throws Error
- **Expected:** Retourne `false` (safe default)
- **Assertions:** `expect(result).toBe(false)`

**Test 5.1b: unlockLevel() retourne false si AsyncStorage fail**
- **Input:** `setItem()` throws Error
- **Expected:** Retourne `false` (échec déblocage)
- **Assertions:**
  - `expect(result).toBe(false)`
  - Console.error appelé

**Test 5.1c: getUnlockedLevels() retourne ['Kana'] si AsyncStorage fail**
- **Input:** `getItem()` throws Error
- **Expected:** Retourne `['Kana']` (safe default)
- **Assertions:** `expect(result).toEqual(['Kana'])`

---

## Stratégie de Mocking

### AsyncStorage
- **Mock:** `@react-native-async-storage/async-storage` (déjà mocké dans tests existants)
- **Methods:**
  - `getItem()` - Simuler lectures stats
  - `setItem()` - Capturer écritures stats

### Date/Time
- **Mock:** `jest.useFakeTimers()` + `jest.setSystemTime()`
- **Usage:** Test 2.4 (timestamp ISO 8601)
- **Cleanup:** `jest.useRealTimers()` dans `afterEach()`

### console.error / console.warn
- **Mock:** `jest.spyOn(console, 'error').mockImplementation()`
- **Usage:** Tests error handling (Groupe 5)
- **Cleanup:** `mockRestore()` après chaque test

---

## Fixtures

### Fixture 1: Stats anciennes (sans unlock fields)
```typescript
const oldStatsWithoutUnlock = {
  words: {
    '42-N5-Normal': {
      wordId: 42,
      romaji: 'konnichiwa',
      level: 'N5',
      difficulty: 'Normal',
      totalAttempts: 5,
      successCount: 3,
      failureCount: 2,
      perfectAttempts: 2,
      points: 2,
      lastAttemptDate: '2025-11-10T12:00:00.000Z',
    },
  },
  globalStats: {
    totalPoints: 10,
    totalAttempts: 20,
    totalWords: 5,
    perfectCount: 10,
    lastSessionDate: '2025-11-10T12:00:00.000Z',
  },
  // NO unlockedLevels
  // NO levelUnlockDates
};
```

### Fixture 2: Stats migrées (avec unlock fields)
```typescript
const migratedStats: UserStatistics = {
  words: {
    '42-N5-Normal': {...},
  },
  globalStats: {...},
  unlockedLevels: ['Kana', 'N5'],
  levelUnlockDates: {
    Kana: '2025-11-10T12:00:00.000Z',
    N5: '2025-11-11T14:00:00.000Z',
  },
};
```

---

## Structure de Fichier

**Fichier:** `app/services/__tests__/statistics.unlock.test.ts`

**Organisation:**
```typescript
describe('statistics.unlock - Level Unlock Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockReset();
    mockAsyncStorage.setItem.mockReset();
  });

  describe('Nouveaux utilisateurs', () => {
    // 3 tests
  });

  describe('unlockLevel()', () => {
    // 5 tests
  });

  describe('Migration anciennes stats', () => {
    // 4 tests
  });

  describe('Immutabilité getUnlockedLevels()', () => {
    // 2 tests
  });

  describe('Error handling AsyncStorage', () => {
    // 1 test (3 sous-tests)
  });
});
```

---

## Couverture Estimée

| Fonction/Ligne | Tests | Coverage |
|----------------|-------|----------|
| `isLevelUnlocked()` | 3 tests | 100% |
| `unlockLevel()` | 5 tests | 100% |
| `getUnlockedLevels()` | 2 tests | 100% |
| `migrateUnlockFields()` (privée) | 4 tests (via loadStatistics) | 100% |
| `loadStatistics()` migration path | 4 tests | 90% (edge cases) |
| Error handling | 3 tests | 85% |

**Coverage globale estimée:** 92-95%

---

## Commandes

```bash
# Lancer tests unlock uniquement
npm test -- statistics.unlock.test.ts

# Lancer tous tests statistics
npm test -- statistics

# Avec couverture
npm test -- --coverage statistics.unlock.test.ts

# Watch mode
npm test -- --watch statistics.unlock.test.ts
```

---

## Total Tests

**Nombre total:** 15 tests (3 + 5 + 4 + 2 + 1)

**Distribution:**
- ✅ Nouveaux utilisateurs: 3 tests
- ✅ unlockLevel(): 5 tests
- ✅ Migration: 4 tests
- ✅ Immutabilité: 2 tests
- ✅ Error handling: 1 test (3 sous-tests)

**Durée estimée:** < 1 seconde (mocks AsyncStorage, pas d'I/O réel)

---

## Validation Checklist

Avant implémentation, valider :

- [ ] Plan couvre toutes les fonctions publiques ajoutées
- [ ] Plan teste migration (critique pour utilisateurs existants)
- [ ] Plan teste immutabilité (prévention bugs)
- [ ] Plan teste error handling (robustesse)
- [ ] Coverage >= 90% attendue
- [ ] Fixtures réalistes (anciennes stats sans unlock fields)
- [ ] Mocks identiques aux tests existants (cohérence)
- [ ] Structure fichier cohérente avec `statistics.test.ts`

---

**Statut:** PRÊT POUR VALIDATION USER
**Prochaine étape:** Validation utilisateur → Implémentation tests
