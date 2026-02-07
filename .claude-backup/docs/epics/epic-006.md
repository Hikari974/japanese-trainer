# Epic-006: Système de Progression et Déblocage Séquentiel des Niveaux JLPT

**Statut:** DRAFT
**Priorité:** P0 (Core Feature)
**Effort Total Estimé:** 6-8 jours
**Date Création:** 2025-11-15
**Dernière MAJ:** 2025-11-15

---

## Objectif

Implémenter un système de progression guidée qui débloque les niveaux JLPT de manière séquentielle (Kana → N5 → N4 → N3 → N2 → N1) basé sur la maîtrise complète de chaque niveau.

**Critère de Maîtrise:** Un niveau est considéré comme maîtrisé lorsque l'utilisateur a obtenu au minimum 5 points sur **chaque mot** de ce niveau, toutes difficultés confondues.

---

## Contexte Technique

### État Actuel
- ✅ Système de statistiques avec AsyncStorage (`StatsManager.ts`)
- ✅ Tracking des scores par mot (`wordScores: { [key: string]: number }`)
- ✅ Sélection libre de niveau/difficulté via `LevelSelect.tsx`
- ✅ Affichage progression globale dans `StatsScreen.tsx`
- ❌ Aucun système de déblocage séquentiel
- ❌ Tous les niveaux accessibles dès le départ

### Architecture Données
```typescript
// Actuel: app/core/training/StatsManager.ts
interface TrainingStats {
  totalQuestions: number;
  correctAnswers: number;
  streakCurrent: number;
  streakBest: number;
  wordScores: { [key: string]: number }; // "word_hiragana" -> score
  lastTrainingDate: string;
  trainingDates: string[];
}
```

### Points d'Intégration
1. **Fichier vocabulaire:** `app/data/vocabulary.json` (6242 mots avec `jlptLevel`)
2. **StatsManager:** Calcul progression + déblocage
3. **LevelSelect:** UI locked/unlocked states
4. **StatsScreen:** Affichage progression détaillée

---

## User Stories

### Phase 1: Core Logic (P0) - 2-3 jours
- [US-006.1](./us-006-1.md): Calcul Automatique de Progression par Niveau (M)
- [US-006.2](./us-006-2.md): Gestion de l'État de Déblocage des Niveaux (S)
- [US-006.3](./us-006-3.md): Logique de Déblocage Séquentiel (M)

### Phase 2: UI/UX Principale (P1) - 2-3 jours
- [US-006.4](./us-006-4.md): UI Sélection Niveau avec États Locked/Unlocked (L)
- [US-006.5](./us-006-5.md): Affichage Progression Détaillée par Mot (M)
- [US-006.8](./us-006-8.md): Migration État Initial pour Utilisateurs Existants (S)

### Phase 3: Polish & Feedback (P2) - 1-2 jours
- [US-006.6](./us-006-6.md): Feedback Visuel Déblocage Niveau (S)
- [US-006.7](./us-006-7.md): Page Statistiques Enrichie avec Vue Progression Globale (M)

---

## Dépendances Techniques

### Modules Existants
- `app/core/training/StatsManager.ts` (à étendre)
- `app/data/vocabulary.json` (lecture seule)
- `app/components/LevelSelect.tsx` (modification majeure)
- `app/screens/StatsScreen.tsx` (enrichissement)

### Nouvelles Dépendances
- Aucune librairie externe requise
- Utilisation AsyncStorage (déjà présent)
- Animations Tamagui (déjà disponible)

---

## Contraintes & Risques

### Contraintes
1. **Performance:** Calcul progression doit être < 100ms même avec 6242 mots
2. **Data Migration:** Utilisateurs existants doivent conserver leurs scores
3. **UX Mobile:** Touch targets >= 44px, feedback tactile clair
4. **Accessibilité:** États locked/unlocked visuellement distincts

### Risques
| Risque | Impact | Mitigation |
|--------|--------|------------|
| Calcul progression lent sur gros datasets | Moyen | Memoization + calcul async |
| Migration données rate | Critique | Tests exhaustifs + rollback strategy |
| Frustration utilisateurs bloqués | Moyen | Progression claire + feedback encourageant |
| Régression stats existantes | Critique | Tests non-régression complets |

---

## Critères d'Acceptation Epic

### Fonctionnel
- [ ] Kana débloqué par défaut pour nouveaux utilisateurs
- [ ] N5 débloqué après maîtrise complète de Kana (tous les mots >= 5 points)
- [ ] Déblocage séquentiel N4→N3→N2→N1 fonctionnel
- [ ] Niveaux locked non sélectionnables dans UI
- [ ] Affichage progression précise par niveau (X/Y mots maîtrisés)
- [ ] Migration automatique utilisateurs existants (unlock selon scores actuels)

### Technique
- [ ] Aucune régression stats existantes
- [ ] Calcul progression < 100ms (benchmark)
- [ ] Code coverage >= 80% (nouvelles fonctions)
- [ ] TypeScript strict sans erreurs
- [ ] Documentation inline complète

### UX
- [ ] Distinction visuelle claire locked/unlocked/current
- [ ] Feedback immédiat lors déblocage niveau
- [ ] Animation fluide (60fps) sur transitions
- [ ] Texte explicatif pour états locked
- [ ] Progression visible en temps réel durant entraînement

---

## Plan de Tests

### Tests Unitaires (TDD)
```typescript
// StatsManager.spec.ts
describe('getLevelProgress', () => {
  it('calcule progression correcte pour niveau vide')
  it('calcule progression correcte pour niveau partiellement maîtrisé')
  it('retourne 100% si tous mots >= 5 points')
  it('ignore mots d\'autres niveaux')
})

describe('getUnlockedLevels', () => {
  it('retourne [kana] pour nouvel utilisateur')
  it('débloque N5 après maîtrise Kana')
  it('conserve ordre séquentiel strict')
  it('gère migration utilisateurs avancés')
})
```

### Tests d'Intégration
- Scénario complet: nouveau user → maîtrise Kana → unlock N5
- Migration: user avec scores N3 existants → unlock correct Kana+N5+N4+N3
- Régression: aucun impact sur stats existantes après migration

### Tests E2E (manuels)
- [ ] Parcours complet Kana → N1 sur device Android
- [ ] Parcours complet Kana → N1 sur device iOS
- [ ] Migration compte existant (backup data réelles)
- [ ] Performance calcul progression (6242 mots)

---

## Livrables Attendus

### Code
- [ ] `StatsManager.ts` étendu avec méthodes progression/unlock
- [ ] `LevelSelect.tsx` refactorisé avec états locked
- [ ] `StatsScreen.tsx` enrichi avec détails progression
- [ ] Migration script `unlockLevelsMigration.ts` (exécution auto au launch)
- [ ] Tests unitaires + intégration (>=80% coverage)

### Documentation
- [ ] README section "Système de Progression" (user-facing)
- [ ] Doc technique progression algorithm (`docs/progression-system.md`)
- [ ] Changelog Epic-006
- [ ] Rapport delivery Epic-006

---

## Notes Implémentation

### Ordre Recommandé
1. **US-006.1** (Calcul progression) → Base technique
2. **US-006.2** (État déblocage) → Extension stockage
3. **US-006.3** (Logique déblocage) → Core logic
4. **US-006.8** (Migration) → Sécurisation users existants
5. **US-006.4** (UI locked/unlocked) → Expérience principale
6. **US-006.5** (Détails progression) → Feedback utilisateur
7. **US-006.6** (Animation déblocage) → Polish
8. **US-006.7** (Stats enrichies) → Vue d'ensemble

### Points d'Attention
- **Performance:** Utiliser `useMemo` pour calculs progression dans composants
- **Testing:** Créer fixtures avec états progression variés (0%, 50%, 100%)
- **Migration:** Exécuter une seule fois (flag `migrationCompleted` dans AsyncStorage)
- **Rollback:** Conserver backup stats avant migration (7 jours)

---

**Lien GitHub Issue:** (À créer après validation)
**Epic Owner:** Epic Manager Agent
**Reviewers:** Code Review Agent + Test Engineer Agent