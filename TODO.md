# TODO - japanese-trainer

**Version:** 0.1.0
**Dernière mise à jour:** 2025-11-11

## 🔴 P0 - Technical Debt (AVANT toute nouvelle feature)

- [ ] **Tests RomajiKeyboard.tsx** (157 lignes)
  - Mode switching (4 modes: base, dakuten, handakuten, yōon)
  - Syllable press callbacks (104 buttons total)
  - Disabled state propagation
  - Grid rendering with empty cells
  - Risque: Medium (UI component, parent callback dependency)
  - Estimation: 1.5-2h

- [ ] **Tests training.tsx** (410 lignes, +81 Session 3)
  - Session 3: Modal state machine (open/close/color persistence)
  - Session 3: Validation logic (normalizeRomaji + handleValidate)
  - Session 3: State reset on handleNext, keyboard disable during feedback
  - Session 2: ScrollingText state machine, timer management, cleanup on unmount
  - Risque: Medium-High (complex state machine, animation timing, async timers)
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
- [x] Clavier romaji multi-mode (2025-11-11, Session 3)
  - 4 modes à bascule: Base (46), Dakuten ゛ (20), Handakuten ゜ (5), Yōon ゃ (33)
  - Couverture totale: 104 syllabes romaji
  - Sélecteur de mode avec feedback visuel (boutons mode actifs/inactifs)
  - Grille adaptative (3 ou 5 colonnes selon le mode)
  - Composant RomajiKeyboard.tsx: 57 → 157 lignes
- [x] Flux validation manuelle avec modal (2025-11-11, Session 3)
  - Modal Sheet (Tamagui) pour feedback immédiat
  - Modal vert si correct + icône ✓
  - Modal rouge si incorrect + icône ✗ + affichage réponse correcte
  - Bouton "Suivant →" pour progression manuelle
  - Modal instantané (animations désactivées) pour réactivité maximale
  - Page training.tsx: 329 → 410 lignes
- [x] Corrections bugs validation (2025-11-11, Session 3)
  - Flash rouge lors fermeture modal (persistence modalColor corrigée)
  - Délai/double-clic bouton (animations désactivées, reset état immédiat)
  - Régression modalColor null (setTimeout supprimé)

---

**Notes:**
- Utiliser Epic Manager Agent pour découper les fonctionnalités en Epic/US
- Invoquer Test Engineer Agent pour features > 50 lignes
- Invoquer Code Review Agent pour features > 100 lignes
