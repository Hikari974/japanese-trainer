# Plan US-006.2 - Gestion de l'État de Déblocage des Niveaux

**Date:** 2025-11-15
**Epic:** Epic-006 - Système de Progression et Déblocage Séquentiel
**User Story:** US-006.2
**Priorité:** P0 (Bloquant)
**Effort Estimé:** S (2-3h)

---

## Contexte

### User Story
> **En tant que** système de progression
> **Je veux** stocker et persister l'état de déblocage de chaque niveau JLPT
> **Afin de** conserver la progression utilisateur entre sessions

### Dépendances
- ✅ **US-006.1 TERMINÉE** (commit 26f7d66)
  - Fonction `calculateLevelProgress()` disponible dans `app/services/statistics.ts`
  - Types `JLPTLevel` et `LevelProgress` existants

### Architecture Actuelle

**Fichier:** `app/services/statistics.ts` + `app/types/statistics.ts`

Interface actuelle:
```typescript
export interface UserStatistics {
  words: Record<string, WordStatistic>;
  globalStats: GlobalStatistics;
}
```

Stockage: AsyncStorage avec clé `@japanese_trainer:user_statistics`

---

## Extension Requise

### 1. Extension Interface UserStatistics

**Fichier:** `app/types/statistics.ts`

Ajouter deux nouveaux champs:

```typescript
export interface UserStatistics {
  // Champs existants
  words: Record<string, WordStatistic>;
  globalStats: GlobalStatistics;

  // NOUVEAU: Système déblocage
  unlockedLevels: JLPTLevel[];           // ["kana", "n5"] signifie N5 débloqué
  levelUnlockDates: Partial<Record<JLPTLevel, string>>;  // ISO 8601 timestamps
}
```

**Justification types:**
- `JLPTLevel[]` : Array ordonné (ordre chronologique déblocage)
- `Partial<Record<JLPTLevel, string>>` : TypeScript strict, optional keys

### 2. Méthodes à Implémenter

**Fichier:** `app/services/statistics.ts`

#### isLevelUnlocked(level: JLPTLevel): Promise<boolean>
```typescript
/**
 * Vérifie si un niveau est débloqué
 * Appelée fréquemment → Performance critique
 */
async isLevelUnlocked(level: JLPTLevel): Promise<boolean>
  → loadStatistics()
  → return stats.unlockedLevels.includes(level)
```

#### unlockLevel(level: JLPTLevel): Promise<boolean>
```typescript
/**
 * Débloque un niveau (si pas déjà débloqué)
 * Retourne true si nouveau déblocage, false si déjà unlock
 */
async unlockLevel(level: JLPTLevel): Promise<boolean>
  → loadStatistics()
  → SI level déjà dans unlockedLevels : return false
  → SINON :
     - Ajouter level à unlockedLevels
     - Ajouter timestamp dans levelUnlockDates[level]
     - saveStatistics()
     - return true
```

#### getUnlockedLevels(): Promise<JLPTLevel[]>
```typescript
/**
 * Retourne tous les niveaux débloqués (lecture seule)
 * Clone array pour éviter mutation
 */
async getUnlockedLevels(): Promise<JLPTLevel[]>
  → loadStatistics()
  → return [...stats.unlockedLevels]  // Clone protection
```

### 3. Migration Automatique

**CRITIQUE:** Préserver données existantes 100%

#### Stratégie Migration

**Intégration dans loadStatistics() existante:**

```typescript
export async function loadStatistics(): Promise<UserStatistics> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    if (stored === null) {
      // Nouveaux users → DEFAULT_STATISTICS (avec unlock fields)
      return DEFAULT_STATISTICS;
    }

    const parsed = JSON.parse(stored);

    // NOUVEAU: Migration automatique si champs manquants
    if (!parsed.unlockedLevels || !parsed.levelUnlockDates) {
      const migrated = migrateUnlockFields(parsed);
      await saveStatistics(migrated);  // Persist migration immédiatement
      return migrated;
    }

    return parsed as UserStatistics;
  } catch (error) {
    // Error handling existant
  }
}
```

#### Fonction Migration Privée

```typescript
function migrateUnlockFields(oldStats: any): UserStatistics {
  // Préserver TOUTES données existantes
  const migrated = { ...oldStats };

  // Ajouter champs unlock si manquants
  if (!migrated.unlockedLevels) {
    migrated.unlockedLevels = ["kana"];  // Kana débloqué par défaut
  }

  if (!migrated.levelUnlockDates) {
    migrated.levelUnlockDates = {
      kana: oldStats.globalStats?.lastSessionDate || new Date().toISOString()
    };
  }

  return migrated as UserStatistics;
}
```

**Points clés:**
- Spread operator `{ ...oldStats }` préserve toutes données
- Défaut intelligent: `lastSessionDate` si disponible, sinon `now()`
- Idempotent: safe si appelée plusieurs fois
- Pas de rollback nécessaire (ajout champs uniquement, pas modification)

### 4. Nouveaux Utilisateurs

**Mise à jour DEFAULT_STATISTICS:**

```typescript
const DEFAULT_STATISTICS: UserStatistics = {
  words: {},
  globalStats: {
    totalPoints: 0,
    totalAttempts: 0,
    totalWords: 0,
    perfectCount: 0,
    lastSessionDate: new Date().toISOString(),
  },

  // NOUVEAU: Kana débloqué par défaut
  unlockedLevels: ["kana"],
  levelUnlockDates: {
    kana: new Date().toISOString()
  }
};
```

---

## Implémentation Steps

### Étape 1: Extension Types (15min)
- Modifier `app/types/statistics.ts`
- Ajouter champs `unlockedLevels` et `levelUnlockDates` à interface
- Vérifier TypeScript strict (no errors)

### Étape 2: Migration Logic (45min)
- Créer fonction `migrateUnlockFields()` privée
- Intégrer dans `loadStatistics()` existante
- Mettre à jour `DEFAULT_STATISTICS`
- Tester migration sur fixture ancienne structure

### Étape 3: Méthodes Unlock (1h)
- Implémenter `isLevelUnlocked()`
- Implémenter `unlockLevel()`
- Implémenter `getUnlockedLevels()`
- Vérifier persistence AsyncStorage

### Étape 4: Tests Unitaires (1h - Test Engineer Agent)
- Voir section Tests ci-dessous

**Total Estimation:** 2-3h (cohérent avec US estimation "S")

---

## Tests Unitaires

**DELEGATION OBLIGATOIRE: Test Engineer Agent**

### Tests Requis

#### Tests Nouveaux Utilisateurs
```typescript
describe('Nouveaux Utilisateurs', () => {
  it('a Kana débloqué par défaut')
  it('isLevelUnlocked("kana") retourne true')
  it('isLevelUnlocked("n5") retourne false')
})
```

#### Tests unlockLevel
```typescript
describe('unlockLevel', () => {
  it('débloque niveau et persiste dans AsyncStorage')
  it('retourne false si niveau déjà débloqué')
  it('conserve ordre chronologique dans unlockedLevels')
  it('ajoute timestamp ISO 8601 dans levelUnlockDates')
})
```

#### Tests Migration
```typescript
describe('Migration Stats Anciennes', () => {
  it('ajoute champs unlock à stats existantes')
  it('préserve TOUTES données existantes (words, globalStats)')
  it('ne modifie pas stats déjà migrées')
  it('utilise lastSessionDate si disponible')
})
```

#### Tests Immutabilité
```typescript
describe('getUnlockedLevels', () => {
  it('retourne clone (pas référence directe)')
  it('mutation du retour ne modifie pas stats internes')
})
```

**Couverture requise:** >= 90%

**Fichier tests:** `__tests__/services/statistics.unlock.test.ts`

---

## Points d'Attention

### Performance
- **isLevelUnlocked appelée fréquemment** (UI checks)
- Solution actuelle: `loadStatistics()` + `includes()` → O(n) acceptable (6 levels max)
- Optimisation future si nécessaire: cache in-memory

### Migration Safety
- ✅ **Idempotente:** Safe si appelée plusieurs fois
- ✅ **Non-destructive:** Ajout champs uniquement, pas de modification
- ✅ **Persistence immédiate:** `saveStatistics()` après migration
- ✅ **Rollback:** Pas nécessaire (ajout champs, pas suppression)

### TypeScript Strict
- ✅ **Partial<Record<JLPTLevel, string>>** pour levelUnlockDates (optional keys)
- ✅ **No `any`** dans code migration
- ✅ **Type guards** si nécessaire pour validation

### Platform-Specific
- ✅ **Aucune particularité** iOS vs Android (AsyncStorage abstraction)

---

## Coordination Autres Agents

### Test Engineer Agent (OBLIGATOIRE)
**Input:** Cette US + spécifications tests ci-dessus
**Output:** Fichier `__tests__/services/statistics.unlock.test.ts`
**Timing:** Après étapes 1-3 implémentées

### Code Review Agent (NON REQUIS)
**Raison:** < 100 lignes changées estimées (seuil 100 lignes)

### Documentation Maintainer (OBLIGATOIRE)
**Timing:** Après implémentation + tests passants
**Actions:** Update TODO.md (cocher US-006.2) + CHANGELOG.md

---

## Critères d'Acceptation (US-006.2)

### Fonctionnel
- [x] Champ `unlockedLevels` ajouté à interface `UserStatistics`
- [x] Champ `levelUnlockDates` ajouté pour tracking historique
- [x] Nouveaux utilisateurs ont `unlockedLevels: ["kana"]` par défaut
- [x] Méthode `unlockLevel(level)` persiste changement dans AsyncStorage
- [x] Méthode `isLevelUnlocked(level)` retourne état actuel instantanément

### Technique
- [x] Migration automatique des stats existantes (ajoute champs manquants)
- [x] Aucune perte de données `wordScores` lors migration
- [x] TypeScript strict (pas de `any`)
- [x] Tests unitaires pour migration + méthodes unlock
- [x] Rollback possible (backup stats avant migration) - **NON REQUIS** (migration non-destructive)

---

## Validation Plan

**Epic Manager demande validation user:**

- [ ] Extension interface `UserStatistics` validée
- [ ] Stratégie migration automatique validée
- [ ] Méthodes unlock (API) validées
- [ ] Plan tests validé
- [ ] Timeline 2-3h validée

**SI user valide:**
- Procéder implémentation étapes 1-3
- Invoquer Test Engineer Agent pour étape 4
- Invoquer Documentation Maintainer après validation finale

---

## Plan Technique Détaillé

**NOTE EPIC MANAGER:**

Ce plan couvre l'analyse métier et les spécifications techniques. Pour un plan d'implémentation détaillé (patterns AsyncStorage, error handling, performance optimizations), **déléguer à Expo Expert Agent**.

**Expo Expert devrait couvrir:**
- AsyncStorage best practices (error handling, retry logic)
- Performance optimizations (cache strategy si nécessaire)
- Migration rollback strategy (optionnel)
- Platform-specific considerations (iOS/Android AsyncStorage quirks)
- Testing strategy AsyncStorage (mock patterns)

---

**Prêt pour validation user et délégation Expo Expert si plan technique détaillé souhaité.**
