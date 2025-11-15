# Contexte Epic Manager - US-006.2

**Date:** 2025-11-15
**Epic:** Epic-006 - Système de Progression et Déblocage Séquentiel
**US:** US-006.2 - Gestion de l'État de Déblocage des Niveaux

---

## Mission Expo Expert

Tu dois créer un plan technique détaillé pour implémenter l'US-006.2.

**CONTEXTE PROJET:**

### Architecture Actuelle

**Fichier:** `E:\PROJECT\japanese_trainer\app\services\statistics.ts`

Interface actuelle:
```typescript
export interface UserStatistics {
  words: Record<string, WordStatistic>;  // Key: "${wordId}-${level}-${difficulty}"
  globalStats: GlobalStatistics;
}

export interface GlobalStatistics {
  totalPoints: number;
  totalAttempts: number;
  totalWords: number;
  perfectCount: number;
  lastSessionDate: string;
}
```

Stockage: `AsyncStorage` avec clé `@japanese_trainer:user_statistics`

### Fonction US-006.1 Disponible

**Déjà implémentée (commit 26f7d66):**
```typescript
export async function calculateLevelProgress(level: JLPTLevel): Promise<LevelProgress> {
  // Calcule: totalWords, masteredWords, percentage pour un niveau
  // Mastered = sum(points all difficulties) >= 5
}
```

---

## Spécifications US-006.2

**Lire le fichier US complet:** `E:\PROJECT\japanese_trainer\.claude\docs\epics\us-006-2.md`

**Résumé Technique:**

### Extension Interface UserStatistics

Ajouter:
```typescript
export interface UserStatistics {
  // ... champs existants (words, globalStats) ...

  // NOUVEAU:
  unlockedLevels: JLPTLevel[];  // ["kana", "n5"] signifie N5 débloqué
  levelUnlockDates: {           // Historique déblocages
    kana?: string;    // ISO 8601 format
    n5?: string;
    n4?: string;
    n3?: string;
    n2?: string;
    n1?: string;
  };
}
```

### Méthodes à Implémenter

Dans `statistics.ts`:

1. **isLevelUnlocked(level: JLPTLevel): Promise<boolean>**
   - Vérifie si niveau dans `unlockedLevels`
   - Rapide (lecture seule)

2. **unlockLevel(level: JLPTLevel): Promise<boolean>**
   - Débloque niveau si pas déjà fait
   - Ajoute timestamp dans `levelUnlockDates`
   - Persiste dans AsyncStorage
   - Retourne `true` si nouveau déblocage, `false` si déjà débloqué

3. **getUnlockedLevels(): Promise<JLPTLevel[]>**
   - Retourne clone (pas référence directe)
   - Protection mutation

### Migration Automatique

**CRITIQUE:** Préserver données existantes 100%

- Détecter ancienne structure (champs `unlockedLevels` manquants)
- Ajouter champs avec defaults:
  - `unlockedLevels: ["kana"]` (Kana débloqué par défaut)
  - `levelUnlockDates.kana: lastSessionDate || now()`
- Intégrer dans fonction `loadStatistics()` existante
- Sauvegarder immédiatement après migration (persistence)

### Nouveaux Utilisateurs

`DEFAULT_STATISTICS` doit inclure:
```typescript
const DEFAULT_STATISTICS: UserStatistics = {
  words: {},
  globalStats: { /* ... */ },
  unlockedLevels: ["kana"],
  levelUnlockDates: {
    kana: new Date().toISOString()
  }
};
```

---

## Contraintes Techniques

1. **AsyncStorage uniquement** (offline-first)
2. **TypeScript strict** (no `any`)
3. **Pas de perte de données** lors migration
4. **Idempotence migration** (safe si appelée plusieurs fois)
5. **Performance:** `isLevelUnlocked` appelée fréquemment

---

## Livrables Attendus

Crée le fichier: `E:\PROJECT\japanese_trainer\.claude\docs\plan_us_006_2.md`

**Contenu:**

1. **Extension Interface**
   - TypeScript définitions complètes
   - Types stricts (Partial<Record<JLPTLevel, string>> pour levelUnlockDates)

2. **Implémentation Méthodes**
   - `isLevelUnlocked()` - Pattern async/await
   - `unlockLevel()` - Logic détaillée (check + add + save)
   - `getUnlockedLevels()` - Clone array

3. **Stratégie Migration**
   - Détection ancienne structure
   - Ajout champs defaults
   - Intégration dans `loadStatistics()`
   - Rollback strategy (optionnel: backup dans `@japanese_trainer:user_statistics_backup`)

4. **Implementation Steps**
   - Étape 1: Étendre types (15min)
   - Étape 2: Méthodes unlock (1h)
   - Étape 3: Migration logic (45min)
   - Étape 4: Tests (voir Test Engineer)

5. **Points d'Attention**
   - Performance (cache in-memory si nécessaire?)
   - Validation intégrité post-migration
   - Platform-specific considerations (aucune normalement)

---

## Coordination Autres Agents

**Test Engineer Agent:** Sera invoqué après validation de ton plan pour:
- Tests nouveaux users (Kana par défaut)
- Tests unlock (persistence, idempotence)
- Tests migration (ancienne structure → nouvelle)
- Tests immutabilité (getUnlockedLevels clone)
- Couverture >= 90%

---

## Fichiers à Analyser

1. **OBLIGATOIRE:**
   - `E:\PROJECT\japanese_trainer\.claude\docs\epics\us-006-2.md` (spécifications complètes)
   - `E:\PROJECT\japanese_trainer\app\services\statistics.ts` (service actuel)
   - `E:\PROJECT\japanese_trainer\app\types\statistics.ts` (types actuels)

2. **Référence:**
   - `E:\PROJECT\japanese_trainer\app\types\word.ts` (type JLPTLevel)

---

## Format Plan

Utilise template "Plan Expo" de `expo-expert.md` adapté pour feature AsyncStorage/Logic.

**Sections minimales:**
- Contexte
- Extension Interface (TypeScript complet)
- Implémentation Méthodes (pseudo-code détaillé)
- Migration Strategy (flowchart textuel)
- Implementation Steps (timeline)
- Points d'Attention
- Testing (noter "Voir Test Engineer Agent")

---

**À TOI EXPO EXPERT:**

Crée `plan_us_006_2.md` avec plan technique complet pour validation user.
