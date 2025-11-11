# Context Session 1 - japanese-trainer

**Date de début :** 2025-11-10
**Version actuelle :** 0.1.0

---

## 📊 Résumé du Projet

**japanese-trainer** est une application mobile pour l'apprentissage du japonais construite avec Expo :
- **Mobile :** Expo SDK 54.0.23 (React Native 0.81.5)
- **Navigation :** expo-router v6.0.14 (file-based routing)
- **UI Library :** Tamagui v1.136.9 (performance-focused, themes)
- **Platforms :** iOS + Android
- **Hébergement :** GitHub (`git@github.com:user/japanese-trainer.git`)

---

## 🎯 Décisions Prises Cette Session

### Configuration Initiale
- [x] Configuration du template Claude Code
- [x] Choix stack: Expo SDK 54 + Tamagui v1.136.9 + expo-router v6.0.14
- [x] Plateformes cibles: iOS et Android
- [x] Pas de backend pour l'instant (application standalone)

### Initialisation Projet (2025-11-10)
- [x] Projet Expo initialisé avec SDK 54.0.23
- [x] Tamagui v1.136.9 installé et configuré
- [x] expo-router v6.0.14 configuré avec structure app/
- [x] Dépendances installées (npm install)
- [x] Assets créés (icon, splash, adaptive-icon)
- [x] Commit initial du projet mobile

---

## 📁 Structure Projet Actuelle

```
japanese-trainer/
├── .claude/
│   ├── core/              # Infrastructure Claude Code
│   ├── plugins/mobile/    # Agents Expo & Mobile UI
│   ├── tasks/            # Contexte session
│   ├── state/            # State management
│   │   └── last-action.json         # Orchestrator state tracking
│   ├── CLAUDE.md
│   └── project.yml
├── app/                  # expo-router structure
│   ├── __tests__/
│   │   └── index.test.tsx           # Tests HomeScreen (15 tests)
│   ├── components/
│   │   ├── __tests__/
│   │   │   ├── DifficultySelector.test.tsx  # Tests (4 tests)
│   │   │   └── LevelButton.test.tsx         # Tests (3 tests)
│   │   ├── AppHeader.tsx            # Header réutilisable avec safe area (60px)
│   │   ├── DifficultySelector.tsx   # Sélecteur compact de difficulté
│   │   ├── LevelButton.tsx          # Bouton de niveau moderne
│   │   ├── RomajiKeyboard.tsx       # Grid romaji 5x10 (56 lignes, mémorisé)
│   │   ├── ScrollingText.tsx        # Scrolling text optimisé (single-pass)
│   │   └── ScrollingTextContainer.tsx # Container mémorisé (custom memoization)
│   ├── data/
│   │   ├── words_kana.ts            # 137 mots Hiragana/Katakana
│   │   ├── words_n5.ts              # 134 mots JLPT N5
│   │   ├── words_n4.ts              # 121 mots JLPT N4
│   │   ├── words_n3.ts              # 113 mots JLPT N3
│   │   ├── words_n2.ts              # 118 mots JLPT N2
│   │   └── words_n1.ts              # 103 mots JLPT N1
│   ├── hooks/
│   │   ├── __tests__/
│   │   │   └── usePreferences.test.tsx      # Tests hook (9 tests)
│   │   └── usePreferences.ts        # Hook React pour préférences (level + difficulty + language)
│   ├── services/
│   │   ├── __tests__/
│   │   │   └── preferences.test.ts          # Tests service (12 tests)
│   │   ├── preferences.ts           # Service AsyncStorage pour préférences
│   │   └── wordSelection.ts         # Service sélection aléatoire 10 mots
│   ├── types/
│   │   └── word.ts                  # WordEntry + DisplayWord interfaces
│   ├── utils/
│   │   └── detectLanguage.ts        # Détection langue device (expo-localization)
│   ├── _layout.tsx      # Root layout avec SafeAreaProvider + TamaguiProvider
│   ├── index.tsx        # Home screen avec UI + sauvegarde préférences
│   ├── training.tsx     # Page session d'entraînement (239 lignes, bilingue)
│   ├── poc-scroll.tsx   # POC scrolling text
│   ├── settings.tsx     # Page paramètres (sélecteur langue FR/EN)
│   ├── stats.tsx        # Page statistiques (placeholder)
│   └── +not-found.tsx   # 404 screen
├── assets/              # Icons & splash screens
├── node_modules/
├── .gitignore
├── app.json             # Expo configuration
├── babel.config.js
├── jest.config.js       # Configuration Jest
├── jest.setup.js        # Mocks pour tests (AsyncStorage, Tamagui, expo-router)
├── package.json         # Dépendances : expo-localization ajouté
├── tamagui.config.ts
└── tsconfig.json
```

---

## 🔄 État Actuel du Développement

### Ce qui est fait
- [x] Repository Git initialisé
- [x] Commit initial avec infrastructure Claude Code (724a0aa)
- [x] Configuration projet (project.yml, CLAUDE.md)
- [x] .gitignore configuré pour Expo
- [x] Projet Expo initialisé avec SDK 54 (58c5199)
- [x] Tamagui v1.136.9 configuré et intégré
- [x] expo-router v6.0.14 configuré avec structure app/
- [x] Dépendances manquantes ajoutées (@tamagui/babel-plugin, react-native-worklets@0.5.1) (7c8392c)
- [x] Application testée avec succès sur Android via Expo Go
- [x] POC scrolling text créé avec にほんご en Hiragana (da8b4cc)
  - 4 fenêtres de test avec différentes vitesses (50, 150, 300, 500 px/s)
  - Utilise react-native-reanimated pour animations fluides
- [x] Home page redesignée avec UI moderne dark mode (21c5cba)
  - Sélecteur de difficulté compact avec cercles colorés
  - 6 boutons de niveau en liste verticale (Kana, N5, N4, N3, N2, N1)
  - Navigation vers stats, settings, et POC
  - Design élégant avec animations
- [x] Infrastructure de tests installée avec Jest et React Testing Library (8ac6acf)
  - jest.config.js configuré pour React Native et Tamagui
  - jest.setup.js avec mocks pour expo-router, react-native-reanimated, et Tamagui
  - 12 tests créés avec 100% de couverture des composants principaux
  - Tests LevelButton.test.tsx (3 tests)
  - Tests DifficultySelector.test.tsx (4 tests)
  - Tests index.test.tsx HomeScreen (5 tests)
- [x] Fonctionnalité de session d'entraînement ajoutée (d1370b4)
  - Header système caché dans _layout.tsx pour UI plus propre
  - Page training.tsx créée (affiche niveau + difficulté sélectionnés)
  - Bouton "Commencer la session" ajouté dans index.tsx (désactivé si aucun niveau)
  - 3 nouveaux tests pour le bouton session (15 tests total, tous passants)
- [x] Android Safe Area fixes (9f4aafbb)
  - react-native-safe-area-context installé et configuré
  - SafeAreaProvider ajouté dans _layout.tsx
  - AppHeader component créé (header réutilisable avec safe area + back button)
  - Toutes les pages utilisent AppHeader pour navigation cohérente
  - Content respect status bar et navigation bar Android
- [x] Enforcement framework template synchronisé (ea0b8fd)
  - CLAUDE.md mis à jour (76→538 lignes) avec règles strictes
  - ENFORCEMENT.md créé (662 lignes) - détection violations automatique
  - CHECKPOINTS.md créé (337 lignes) - checklist pre-commit obligatoire
  - AUTO_CHECKS.md créé (665 lignes) - vérifications pré-réponse
  - State management initialisé (last-action.json)
  - Procédures maintenant appliquées automatiquement
- [x] Gestion préférences utilisateur avec AsyncStorage (100% local, offline-first)
  - @react-native-async-storage/async-storage installé
  - Service preferences.ts créé (60 lignes) - loadPreferences(), savePreferences()
  - Hook usePreferences.ts créé (27 lignes) - API React: { preferences, isLoading, updatePreferences }
  - index.tsx modifié - chargement préférences au montage + sauvegarde avant navigation
  - Pré-sélection automatique dernière difficulté + dernier niveau
  - Stockage 100% local device (iOS/Android, pas de serveur)
  - Tests complets créés :
    - preferences.test.ts (12 tests unitaires service)
    - usePreferences.test.tsx (9 tests hook React)
    - Couverture: 100% statements/functions/lines, 81.25% branches
    - 21 tests préférences + 15 tests existants = 36 tests total, tous passants

- [x] Implémentation complète page training.tsx (Session 2 continuation)
  - 5 zones UI : SessionInfo compact, ScrollingText, Grid romaji (5x10), Input/Actions, Controls
  - 46 boutons syllables romaji (a-n, ka-ko, sa-so, ta-to, na-no, ha-ho, ma-mo, ya-yo, ra-ro, wa-wo-n)
  - Configuration difficultés : Facile 70px/s, Normal 140px/s, Difficile 220px/s, Extrême 300px/s
  - Validation flexible romaji (shi/si, tsu/tu, hu/fu)
  - Mock words temporaires (にほんご, こんにちは, ありがとう)
  - Interface compacte tenant sur un écran complet (optimisée pour Android safe area)

- [x] Système de mots complet avec JLPT (commit ea5d322)
  - 5 listes de mots intégrées (Kana: 137, N5: 134, N4: 121, N3: 113, N2: 118, N1: 103)
  - Format: kanji, kana, romaji, traductions FR/EN, niveau JLPT
  - Service wordSelection.ts : sélection aléatoire 10 mots par niveau/difficulté
  - DisplayWord interface étendue : translations { fr, en }
  - Système de préférences étendu : level + difficulty persistés

- [x] Système langue FR/EN avec auto-détection (commit 103ee45)
  - expo-localization installé pour détection langue device
  - Utilitaire detectLanguage.ts : détection auto FR/EN
  - Sélecteur langue dans settings.tsx (2 boutons FR/EN)
  - Préférences étendues : language ('fr' | 'en') avec auto-détection au premier lancement
  - Labels bilingues : "Mots" / "Words", "Départs" / "Starts", "Paramètres" / "Settings", etc.
  - Support traductions dans DisplayWord (translations.fr / translations.en)

- [x] UI training restructurée et optimisée (commit 103ee45)
  - Barre compteurs : "Mots: 1/10" + "Départs: 3" (bilingue selon langue)
  - Toggle traduction avec icône œil 👁️ (affiche/masque traduction selon langue)
  - Bouton "Start" déplacé à côté de la fenêtre ScrollingText (layout horizontal)
  - Badges session : niveau + difficulté affichés en haut
  - AppHeader réduit de 80px à 60px pour meilleur usage écran
  - RomajiKeyboard extrait en composant séparé (56 lignes, 46 boutons sans animations)

- [x] Optimisations performance ScrollingText (commit 103ee45)
  - **Problème résolu :** Saccades pendant défilement (conflit ScrollView + Reanimated)
  - **Solution 1 :** Suppression ScrollView (conflit JS/UI thread éliminé)
  - **Solution 2 :** Suppression animation="quick" de 50 boutons RomajiKeyboard (50 AnimatedViews → 0)
  - **Solution 3 :** ScrollingTextContainer avec memoization custom
    - Composant mémorisé empêchant re-renders inutiles
    - Comparaison custom : speed, windowWidth, fontSize, currentWord.id, onScrollComplete
    - Props ScrollingText mémorisées (useCallback pour stabilité références)
  - **Solution 4 :** Animation single-pass (loop infini → une fois puis hide)
  - **Résultat :** ScrollingText aussi fluide que POC, zéro saccades

### Ce qui reste à faire
- [ ] Définir les Epic et User Stories pour l'apprentissage du japonais
- [ ] Créer la page stats (actuellement placeholder)
- [ ] Ajouter tests pour training.tsx (dette technique P0 - 239 lignes)
- [ ] Ajouter tests pour ScrollingText, ScrollingTextContainer, RomajiKeyboard
- [ ] Ajouter statistiques persistantes (étendre système AsyncStorage)
- [ ] Améliorer page settings (actuellement sélecteur langue basique)

---

## 🚀 Prochaines Étapes

### Immédiat (Prochaine tâche)
1. **Implémenter la logique d'entraînement** : scrolling text avec input utilisateur dans training.tsx
2. **Définir les fonctionnalités** : Planifier les features d'apprentissage du japonais (Epic Manager)

### Court Terme
3. Créer le système de statistiques (page stats.tsx + stockage AsyncStorage)
4. Implémenter la page settings (préférences UI, vitesse défilement, etc.)
5. Ajouter tests pour training.tsx et ScrollingText

### Moyen Terme
6. Implémenter système de progression utilisateur (niveaux débloqués, achievements)
7. Configurer CI/CD avec DevOps Expert
8. Setup Expo EAS pour déploiement production

---

## 📝 Notes Importantes pour les Agents

### Contexte Technique

**Mobile :**
- Framework : Expo SDK 54.0.23 (React Native 0.81.5)
- Router : expo-router v6.0.14 (file-based routing, moderne)
- UI Library : Tamagui v1.136.9 (performance, themes)
- Platforms : iOS, Android
- État actuel : Projet initialisé, prêt à tester sur Android

### Stack Technique

- **Langage :** TypeScript
- **Runtime :** Node.js 18+
- **Package Manager :** npm (ou yarn/pnpm selon préférence)
- **Path mobile :** app/

### Infrastructure

- **Git :** GitHub
- **Version Control :** Git
- **CI/CD :** À configurer
- **Déploiement :** Expo EAS (à configurer)

### Conventions

**Commits :**
```
type(scope): description
```
Types: feat, fix, refactor, docs, chore, test, style

**Branches :**
```
type/description
```

**Versioning :**
- Format : MAJOR.MINOR.PATCH
- Version actuelle : 0.1.0

### Philosophie du Projet

- **Minimaliste** : Créer uniquement ce qui est nécessaire
- **Incrémental** : Développer au fur et à mesure
- **Documentation légère** : Documenter ce qui existe
- **Agents spécialisés** : Déléguer pour économiser le contexte
- **Plans avant code** : Les agents créent des plans, Claude implémente

### Règles Critiques Session

**Délégation immédiate:**
- Domaine agent détecté → STOP → Invoquer agent (pas d'analyse approfondie)
- User demande plan → Invoquer agent Mode 2 (pas créer moi-même)
- Questions techniques → Agent répond (pas moi)

**Workflow strict:**
User demande → Identifier agent → Invoquer → Lire plan → Résumer AGENT → Valider → Implémenter

**Économie contexte = PRIORITÉ**

---

## ⚠️ Points d'Attention

1. Utiliser Expo Expert pour toutes questions SDK/configuration Expo
2. Utiliser Mobile UI Expert pour architecture UI/UX et Tamagui
3. Pas de backend pour l'instant - app standalone
4. Plateformes iOS + Android à supporter dès le début

---

**Dernière mise à jour :** 2025-11-11

**Commits Session 1:**
- 724a0aa : Infrastructure Claude Code (framework méthodologie)
- 58c5199 : Initialisation Expo SDK 54 + Tamagui + expo-router
- e82d398 : Update context après initialisation
- 7c8392c : Fix dépendances manquantes (Tamagui, worklets)
- da8b4cc : POC scrolling text avec Hiragana にほんご
- 21c5cba : Redesign home screen avec UI moderne dark mode
- 49ad4f5 : Documentation (README.md, TODO.md)
- f65e1c3 : Migration tokens Tamagui + accessibilité
- 6cd8db4 : Fix dark theme (defaultTheme="dark")
- 8ac6acf : Tests infrastructure (Jest + 12 tests, 100% couverture)
- db2717d : Mise à jour documentation (README, TODO, context)
- d1370b4 : Bouton session + page training.tsx (15 tests total)

**Commits Session 2 (continuation):**
- 9f4aafbb : Android safe area fixes (SafeAreaProvider + AppHeader component)
- ea0b8fd : Template sync enforcement framework (procédures strictes)
- 0c346c4 : Préférences utilisateur AsyncStorage (36 tests total)
- 37f0ae7 : Training session UI complète (239 lignes, 5 zones)
- 96008aa : Système mots JLPT complet (726 mots, 5 listes)
- ea5d322 : Word system + préférences étendues (level + difficulty persistés)
- 103ee45 : Système langue FR/EN + optimisations performance ScrollingText

**Prochaine action :** Définir Epic/User Stories (Epic Manager Agent)

## 📲 Application Testée et Fonctionnelle

L'application tourne sur Android via Expo Go (port 8081).

**Fonctionnalités actuelles :**
- Home screen avec sélection niveau/difficulté (6 niveaux: Kana, N5, N4, N3, N2, N1)
- **Préférences persistantes** : level + difficulty + language sauvegardés (100% local AsyncStorage)
- **Système langue FR/EN** : auto-détection device + sélecteur manuel dans settings
- **Système mots complet** : 726 mots (Kana: 137, N5: 134, N4: 121, N3: 113, N2: 118, N1: 103)
- **Page training fonctionnelle :**
  - ScrollingText fluide (optimisé, zéro saccades)
  - Grid romaji 5x10 (46 boutons syllables)
  - Compteurs : mots (1/10) + départs (clicks Start)
  - Toggle traduction avec icône œil 👁️
  - Validation flexible romaji (shi/si, tsu/tu, chi/ti, fu/hu)
  - Layout horizontal : Start button + ScrollingText window
  - Traductions bilingues selon langue sélectionnée
- POC scrolling text (accessible via icône 🧪)
- Page settings : sélecteur langue FR/EN
- Navigation vers stats (page placeholder)
- Headers consistants avec safe area Android (status bar + nav bar respectées)
- Design dark mode élégant et moderne sans header système

**Tests effectués :**
- ✅ Build réussi
- ✅ Affichage correct sur Android avec safe areas
- ✅ Navigation fonctionnelle avec headers cohérents
- ✅ Animations fluides (ScrollingText optimisé)
- ✅ POC scrolling validé
- ✅ **Tests unitaires : 36/36 passent**
  - 15 tests UI (HomeScreen, LevelButton, DifficultySelector)
  - 21 tests préférences (service + hook, 100% couverture)
- ✅ Bouton session testé et fonctionnel
- ✅ Préférences sauvegardées et chargées correctement (AsyncStorage)
- ✅ **Training session testée sur device :**
  - ScrollingText fluide sans saccades (performance optimale)
  - Toggle traduction fonctionnel
  - Validation romaji flexible testée
  - Compteurs mots/départs fonctionnels
  - Système langue FR/EN validé

---

## 🔄 Session 3 - Améliorations Validation et Clavier (2025-11-11)

### Fonctionnalités Ajoutées

- [x] **Clavier Romaji modes multiples** (RomajiKeyboard.tsx: 57 → 157 lignes)
  - 4 modes à bascule : Base (46 syllabes), Dakuten ゛ (20 syllabes), Handakuten ゜ (5 syllabes), Yōon ゃ (33 syllabes)
  - Sélecteur de mode en haut du clavier (4 boutons)
  - Mode actif visuellement distinct (fond bleu + bordure)
  - Grid adaptative : mode Yōon utilise 3 colonnes (64px) au lieu de 5 (42px)
  - Total : 104 syllabes romaji couvertes
  - Performance : React.memo + useCallback + useMemo

- [x] **Flux de validation manuel avec modal** (training.tsx refactoré)
  - Suppression timeouts automatiques (1 seconde après validation)
  - Modal Sheet Tamagui pour feedback utilisateur
  - Fond vert si correct ("Correct ! Bien joué !") + ✓
  - Fond rouge si incorrect ("Incorrect. La bonne réponse était : [romaji]") + ✗
  - Bouton "Suivant →" pour progression manuelle
  - Clavier et Clear button désactivés pendant affichage feedback
  - Bouton Validate remplacé par Suivant après validation

### Décisions Techniques

**Clavier Romaji :**
- **Approche toggle** retenue (vs transformation post-frappe)
  - Cliquer [゛] → Clavier affiche ga, gi, gu, ge, go / za, ji, zu...
  - Cliquer [゜] → Clavier affiche pa, pi, pu, pe, po
  - Cliquer [ゃ] → Clavier affiche kya, kyu, kyo / sha, shu, sho...
- État `currentMode` contrôle la grille affichée
- Config par mode : data (syllabes), columns (3 ou 5), buttonWidth (42px ou 64px)

**Modal Feedback :**
- **Sheet Tamagui** choisi (vs Dialog)
  - Pattern mobile natif (bottom sheet)
  - Backdrop semi-transparent intégré
  - Animations gérées par composant
- **États séparés pour stabilité couleur :**
  - `isModalOpen: boolean` - Contrôle ouverture/fermeture
  - `modalColor: 'green' | 'red' | null` - **Persiste** pendant fermeture (évite flash rouge)
  - `validationFeedback` conservé pour compatibilité bordure input
- **Réactivité immédiate :**
  - Animations désactivées (instant pop au lieu de slide)
  - Reset états immédiat au clic Suivant (pas de setTimeout)
  - `modalColor` ne reset jamais → écrasé par prochaine validation

### Problèmes Résolus

**Bug 1 - Flash rouge pendant fermeture modal :**
- **Cause :** `modalColor` resetté à `null` → ternaire évalue `false` → couleur rouge par défaut
- **Solution :** Ne jamais resetter `modalColor`, seulement l'écraser à la prochaine validation

**Bug 2 - Délai/double-clic bouton Suivant :**
- **Tentative 1 :** Flag `isModalClosing` → ÉCHEC (bloquait tous les clics pendant 350ms)
- **Tentative 2 :** Bouton disabled state → ÉCHEC (bouton désactivé à l'ouverture)
- **Tentative 3 :** Réduction timeout 350ms → 50ms → ÉCHEC (délai encore perceptible)
- **Solution finale :** Suppression complète animations Sheet + reset états immédiat
  - `animation={false}` sur Sheet et Overlay
  - Pas de setTimeout dans `handleNext()`
  - Modal "pop" instantané (trade-off : moins poli visuellement, 100% réactif)

**Bug 3 - État `modalColor` null causait régression :**
- **Cause :** Ancien setTimeout resetait `modalColor` après 50ms
- **Solution :** Supprimé setTimeout, `modalColor` persiste entre validations

### Fichiers Modifiés

1. **app/components/RomajiKeyboard.tsx** (57 → 157 lignes, +100 lignes)
   - Ajout 4 modes clavier avec données syllabes complètes
   - Sélecteur de mode avec feedback visuel
   - Grid adaptative (3/5 colonnes selon mode)

2. **app/training.tsx** (329 → 410 lignes, +81 lignes)
   - Nouveaux états : `isModalOpen`, `modalColor`
   - Suppression `pendingTimeout` et cleanup timeout
   - `handleValidate()` refactoré : set modal states au lieu de setTimeout
   - `handleNext()` créé : fermeture modal + reset immédiat
   - Sheet modal ajouté (lignes 345-406) : overlay + frame + contenu feedback
   - Zone 3.5 feedback inline supprimée (remplacée par modal)

**Total changements :** 393 lignes (301 insertions + 92 suppressions)

### Points d'Attention

- **Debt technique :** Tests manquants pour RomajiKeyboard (modes) et training.tsx (modal)
- **UX trade-off :** Modal sans animation (pop instantané) pour réactivité maximale
- **Performance :** Memoization importante pour éviter re-renders inutiles avec 104 boutons total