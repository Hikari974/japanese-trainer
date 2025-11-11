# TODO - japanese-trainer

**Version:** 0.1.0
**Dernière mise à jour:** 2025-11-11

## 🔴 P0 - Technical Debt (AVANT toute nouvelle feature)

- [ ] **Tests training.tsx** (239 lignes)
  - State machine (scrolling state, validation feedback)
  - Timer management (cleanup on unmount)
  - Validation logic (normalizeRomaji + handleValidate)
  - Risque: High (complex state, async timers)
  - Estimation: 2-3h

- [ ] **Jest memory leak dans preferences/usePreferences tests**
  - 2/5 test suites crashent avec "heap out of memory"
  - Problème: preferences.test.ts et usePreferences.test.tsx
  - 3/5 suites passent (15 tests total)
  - Risque: Medium (tests fonctionnent mais infrastructure Jest instable)
  - Estimation: 1-2h (investiguer mocks AsyncStorage ou refactor tests)

## Prochaine tâche immédiate

- [ ] Définir les Epic et User Stories pour l'apprentissage du japonais (via Epic Manager Agent)

## Court terme

- [ ] Développer la page statistiques (app/stats.tsx actuellement placeholder)
- [ ] Développer la page paramètres (app/settings.tsx actuellement placeholder)
- [ ] Étendre système préférences avec statistiques persistantes (sessions complétées, scores, progression)
- [ ] Ajouter tests pour pages placeholder (stats.tsx, settings.tsx, poc-scroll.tsx)

## Moyen terme

- [ ] Implémenter le système de statistiques complet
- [ ] Configurer CI/CD avec DevOps Expert
- [ ] Setup Expo EAS pour déploiement iOS/Android
- [ ] Augmenter couverture de tests à 80%+

## Complété

- [x] Infrastructure de tests Jest + React Testing Library configurée (2025-11-10)
- [x] Tests pour composants principaux: DifficultySelector, LevelButton, HomeScreen (12 tests, 100% coverage)
- [x] Session d'entraînement: navigation + bouton + validation de sélection (2025-11-10, commit d1370b4)
- [x] Tests session d'entraînement: 3 tests ajoutés pour le bouton session (total: 15 tests)
- [x] Gestion préférences utilisateur avec AsyncStorage (2025-11-10, commit 0c346c4)
  - Service preferences.ts + hook usePreferences.ts
  - Sauvegarde/chargement automatique niveau + difficulté
  - 21 tests préférences (100% couverture service + hook)
  - 36 tests total (tous passants)
  - Architecture extensible pour stats persistantes
- [x] Training page complète (2025-11-11, commit 37f0ae7)
  - 239 lignes: 5 zones UI, validation romaji, state machine
  - Code Review: APPROVED (corrections memory leak + closure bug)
  - Tests: PENDING (dette technique P0)
  - Flexible romaji validation (shi/si, tsu/tu, chi/ti, fu/hu)
- [x] Système mots JLPT complet (2025-11-11, commit ea5d322)
  - 726 mots totaux : Kana (137), N5 (134), N4 (121), N3 (113), N2 (118), N1 (103)
  - Format: kanji, kana, romaji, traductions FR/EN
  - Service wordSelection.ts : sélection aléatoire 10 mots par session
  - Préférences étendues : level + difficulty persistés
- [x] Système langue FR/EN avec auto-détection (2025-11-11, commit 103ee45)
  - expo-localization installé pour détection langue device
  - Sélecteur langue dans settings.tsx (FR/EN)
  - Préférences étendues : language ('fr' | 'en') avec auto-détection
  - Labels bilingues dans training.tsx (compteurs, traductions)
- [x] UI training restructurée (2025-11-11, commit 103ee45)
  - Barre compteurs : "Mots: 1/10" + "Départs: 3" (bilingue)
  - Toggle traduction avec icône œil 👁️
  - Layout horizontal : Start button + ScrollingText window
  - AppHeader réduit à 60px pour meilleur usage écran
  - RomajiKeyboard extrait en composant séparé (56 lignes)
- [x] Optimisations performance ScrollingText (2025-11-11, commit 103ee45)
  - Suppression ScrollView (conflit JS/UI thread éliminé)
  - Suppression animation="quick" de 50 boutons (50 AnimatedViews → 0)
  - ScrollingTextContainer avec memoization custom
  - Animation single-pass (loop infini → une fois puis hide)
  - Résultat : ScrollingText fluide, zéro saccades
- [x] Fix tests cassés après ajout expo-localization (2025-11-11, commit 6629c25)
  - Ajout mocks expo-localization et detectLanguage dans jest.setup.js
  - Mise à jour tous les tests avec nouveaux champs UserPreferences
  - 3/5 test suites passent (15 tests)
  - 2/5 suites avec memory leak Jest (tracké en P0)

---

**Notes:**
- Utiliser Epic Manager Agent pour découper les fonctionnalités en Epic/US
- Invoquer Test Engineer Agent pour features > 50 lignes
- Invoquer Code Review Agent pour features > 100 lignes
