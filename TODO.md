# TODO - japanese-trainer

**Version:** 0.1.0
**Dernière mise à jour:** 2025-11-15 (Session 11)

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

- [ ] **Jest mock contamination dans statistics tests**
  - 4/49 tests fail ensemble, passent individuellement
  - Problème: AsyncStorage mock state leaking entre tests
  - Code fonctionne correctement (non-blocking)
  - Risque: Low (infrastructure issue, pas de bug code)
  - Estimation: 1-2h (améliorer isolation mocks)

## 🔴 P1 - Data Quality Issues (CRITICAL)

- [ ] **Corriger 142 mots avec romaji invalides** (hiragana/katakana dans champ romaji)
  - Fichiers affectés: principalement n4.json, n5.json
  - Exemples: "kaijiょu" → "kaijou", "ガソリン" → "gasorin", "keっshite" → "kesshite"
  - Impact: HIGH (11% du vocabulaire non utilisable)
  - Décision à prendre: Correction manuelle vs script automatisé
  - Estimation: 2-3h (manuel) ou 1-2h (script + validation)
  - Référence: RAPPORT_PROBLEMES_DONNEES.md

- [ ] **Décider stratégie variantes romaji** (~70 mots avec jy/chy)
  - Exemples: "jyoubu" vs "joubu", "chyawan" vs "chawan"
  - Options: A) Normaliser dans code (actuel), B) Standardiser données, C) Les deux valides
  - Impact: MEDIUM (normalisé actuellement, fonctionnel)
  - Estimation: 1h (décision) + 1-2h (correction si standardisation choisie)

- [ ] **Décider pattern っち** (cchi vs tchi)
  - Question: User tape "t"+"chi" OU accepter "cchi" comme valide ?
  - Options: A) tchi uniquement (actuel), B) cchi uniquement, C) Les deux
  - Impact: MEDIUM (affecte ~10 mots)
  - Estimation: 30min (décision) + 30min (implementation si changement)

## Phase: Epic-006 - Système de Progression et Déblocage Séquentiel des Niveaux JLPT (7/8 COMPLETE)

- [x] US-006.1 - Calcul Automatique de Progression par Niveau (P0, M) - Session 6
- [x] US-006.2 - Gestion de l'État de Déblocage des Niveaux (P0, S) - Session 7
- [x] US-006.3 - Logique de Déblocage Séquentiel (P0, M) - Session 8
- [x] US-006.4 - UI Sélection Niveau avec États Locked/Unlocked (P1, L) - Session 9
- [x] US-006.5 - Affichage Progression Détaillée par Mot (P1, M) - Session 10 + Hotfix Session 11
- [x] US-006.6 - Feedback Visuel Déblocage Niveau (P2, S) - Session 11
- [x] US-006.7 - Page Statistiques Enrichie avec Vue Progression Globale (P2, M) - Session 11
- [ ] ~~US-006.8 - Migration État Initial pour Utilisateurs Existants (P1, S)~~ **SKIPPED** (YAGNI: no real users exist, solo testing only)

## Prochaine tâche immédiate

- [ ] Définir les Epic et User Stories pour l'apprentissage du japonais (via Epic Manager Agent)

## Court terme

- [ ] Ajouter tests pour pages placeholder (poc-scroll.tsx)
- [ ] Ajouter tests pour pages placeholder (poc-scroll.tsx)
- [ ] Furigana activer ou non (de base a true)
- [ ] notificaiton de session
- [ ] 1 pub en debut de session
- [ ] abonnemetn premiuim 1.5€
- [ ] Preparation a mise en place sur le store android

## Moyen terme

- [ ] Améliorer système statistiques (difficulty breakdown, trends, export/import)
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
- [x] Système statistiques complet avec AsyncStorage (2025-11-11, Session 4)
  - Service statistics.ts + hook useStatistics.ts (231 lignes)
  - Types TypeScript complets (WordStatistic, GlobalStatistics, AttemptData)
  - Tracking par mot-level-difficulté avec composite keys
  - Scoring simplifié: 1 point par tentative parfaite
  - AsyncStorage persistence 100% local (offline-first)
  - 49 tests (35 service + 14 hook), 94-100% coverage
- [x] Page stats.tsx MVP complète (2025-11-11, Session 4)
  - Statistiques globales (points, tentatives, taux réussite, perfect count, mots uniques)
  - Breakdown par niveau (6 cards avec barres colorées)
  - Loading spinner + empty state
  - 187 lignes (était 26 lignes placeholder)
- [x] Reset statistiques dans settings.tsx (2025-11-11, Session 4)
  - Section "Gestion des données / Data management"
  - Modal confirmation (Cancel / Confirm) bilingue FR/EN
  - Warning "irréversible / cannot be undone"
  - 114 lignes ajoutées
- [x] Intégration statistiques dans training.tsx (2025-11-11, Session 4)
  - Enregistrement automatique chaque validation
  - Modal affiche "+1" si point gagné
  - Traduction toujours visible dans modal
  - Capture état AVANT recordAttempt (évite race condition)
- [x] Fix bug couleur bouton "Commencer" (2025-11-11, Session 4)
  - Bouton utilisait $levelN3 hardcodé
  - Ajout constant levelColors + backgroundColor dynamique
  - Couleur maintenant reflète niveau sélectionné
- [x] Extension RomajiKeyboard avec double consonants et syllabes foreign (2025-11-11, Session 5)
  - Fusion modes Dakuten + Handakuten → mode "゛゜" unique (30 syllabes)
  - Double consonants ajoutés: k,s,t,m (Base), g,z,d,b,p (゛゜) - 9 boutons pour っ
  - Nouveau mode Foreign "外": 22 syllabes katakana modernes (fa,fi,va,vi,vu,etc)
  - Total: 130 syllabes (Base: 50, ゛゜: 30, Yōon: 33, Foreign: 22)
  - RomajiKeyboard.tsx: 120 lignes modifiées (+55/-29 = 26 net)
- [x] Extension normalisation romaji dans training.tsx (2025-11-11, Session 5)
  - Normalisation jy→j (jyoubu → joubu)
  - Normalisation chy→ch (chyawan → chawan)
  - Pattern cchi→tchi (kocchi → kotchi pour っち)
  - Protection "chu" dans normalisation hu→fu
  - Support double consonants validation
  - training.tsx: 30 lignes modifiées (+31/-2 = 29 net)
- [x] Test couverture clavier complet (2025-11-11, Session 5)
  - RomajiKeyboard.coverage.test.ts créé (292 lignes)
  - Test data-driven: vérifie 1309 mots des données JSON
  - Résultat: 100% couverture (1167/1167 mots valides)
  - Détecté: 142 mots avec romaji invalides (filtrés)
  - Helper extractKeyboardSyllables(): extrait 130 syllabes
  - Helper decomposeRomaji(): algorithme greedy matching
- [x] Rapport qualité données créé (2025-11-11, Session 5)
  - RAPPORT_PROBLEMES_DONNEES.md (255 lignes)
  - Documentation exhaustive: 142 erreurs critiques + ~70 variantes
  - Catégorisation: TYPE A-F avec exemples
  - Décisions à prendre documentées
  - Stratégies correction proposées

---

**Notes:**
- Utiliser Epic Manager Agent pour découper les fonctionnalités en Epic/US
- Invoquer Test Engineer Agent pour features > 50 lignes
- Invoquer Code Review Agent pour features > 100 lignes
