---
project_name: 'japanese_trainer'
user_name: 'Laurent'
date: '2026-02-07'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 143
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Technologie | Version | Role |
|-------------|---------|------|
| Expo SDK | ~54.0.23 | Runtime (New Arch, managed workflow) |
| React + React Native | 19.1.0 + 0.81.5 | Framework |
| TypeScript | ~5.9.2 | Langage (strict mode) |
| Tamagui | ^1.136.9 | UI framework (config v3, dark theme only) |
| expo-router | ~6.0.14 | Navigation (file-based, Stack, typed routes) |
| AsyncStorage | ^2.2.0 | Persistance (prefix `@japanese_trainer:`) |
| react-native-reanimated | ~4.1.1 | Animations |
| @shopify/flash-list | ^2.2.0 | Listes performantes |
| expo-notifications | ^0.32.15 | Rappels quotidiens |
| expo-localization | ^17.0.7 | Detection langue FR/EN |
| RevenueCat + AdMob | ^9.6.13 + ^16.0.1 | Monetisation (DESACTIVE) |
| Jest + Testing Library | ^30.2.0 + ^13.3.3 | Tests (coverage 70%) |

## Critical Implementation Rules

### 🔴 BLOQUANT — Violation = build/app cassee

- **Tamagui exclusif** : `YStack`/`XStack`/`Text`/`Button` — JAMAIS `View`/`TouchableOpacity`/`StyleSheet.create()`
- Imports `react-native` autorises UNIQUEMENT pour utilitaires : `Platform`, `Dimensions`
- `react-native-reanimated/plugin` TOUJOURS en derniere position dans `babel.config.js`
- Verifier compatibilite Expo SDK 54 + New Arch AVANT d'ajouter une dependance
- Un seul `package.json` a la racine
- Expo managed workflow — pas de code natif direct, uniquement config plugins dans `app.json`
- Build via EAS Build, pas `react-native run-android/ios`

### 🟠 OBLIGATOIRE — Violation = bugs fonctionnels

- **Pattern service + hook** : service = fonctions async pures exportees individuellement (pas de React, pas de classes) / hook = wrapper React (pas de logique metier)
- **Paradigme fonctionnel** : fonctions pures exportees — PAS de classes, PAS d'objets service, PAS de `this`
- Couleurs via tokens Tamagui (`$levelN5`, `$difficultyEasy`...) — jamais hardcodees
- `useSafeAreaInsets()` sur chaque ecran (edgeToEdge Android actif)
- `headerShown: false` sur chaque nouveau `Stack.Screen` dans `_layout.tsx`
- Prefix `@japanese_trainer:` pour toute cle AsyncStorage — une constante `STORAGE_KEY` par service
- AsyncStorage appele directement par chaque service (pas de wrapper) — c'est delibere
- Nouveau champ `UserStatistics`/`UserPreferences` → fallback `?? defaultValue` dans les fonctions load
- Cle composite stats via `getWordStatKey()` uniquement — jamais de fabrication manuelle
- `if (__DEV__) { ... }` autour de tout console.log/warn/error — `__DEV__` est une globale RN, ne PAS l'importer
- Texte utilisateur : pattern ternaire `translationLanguage === 'fr' ? ... : ...` (pas de lib i18n)
- Les 5 JSON (`n1-n5.json`) doivent correspondre a l'interface `WordEntry`
- Kana = donnees N5 en mode `kana-only` (pas de fichier kana.json)
- ID des mots : entier unique par fichier, commence a 1 (pas de UUID)
- Structure fichier JSON : `{ level: DataLevel, version: string, words: WordEntry[] }`
- Orientation portrait uniquement — pas de responsive landscape
- Dark theme exclusif — pas de light mode

### 🟡 CONVENTION — Violation = dette technique

- Fichiers pages : lowercase (`training.tsx`) / composants : PascalCase (`LevelButton.tsx`) / hooks : `use*` / services : camelCase
- Tests : `__tests__/` dans le module, suffix `.test.tsx`/`.test.ts`
- Nouveau code dans `app/` (sauf monetisation → `src/` car SDK natifs crashent sans config)
- Pas de barrel exports `index.ts` — imports directs
- Pas de Context API custom — hooks locaux + AsyncStorage uniquement (Providers framework OK : `TamaguiProvider`, `SafeAreaProvider`)
- Pas de `Alert.alert()` — utiliser `Sheet` Tamagui
- `pressStyle={{ opacity: 0.8, scale: 0.98 }}` + `animation="quick"` sur les elements interactifs
- Types importes depuis leur source (`Difficulty` depuis `DifficultySelector.tsx`, `Level` depuis `LevelButton.tsx`)
- `useCallback`/`useMemo` strategiques, pas systematiques — handlers inline simples non wrappees
- `getWordsByLevel()` est synchrone (imports statiques) — pas de `await`
- Difficultes en francais (`Facile`/`Normal`/`Difficile`/`Extrême`), niveaux en anglais (`Kana`/`N5`-`N1`)
- Groupe `(tabs)` reserve a `level-progress/[level]` uniquement
- Ne pas modifier `tamagui.config.ts` sauf si explicitement demande

### Structure Projet

```
app/                    # Code principal
├── (tabs)/             # Groupe routes level-progress uniquement
├── components/         # Composants reutilisables (PascalCase)
│   └── __tests__/      # Tests composants
├── hooks/              # Custom hooks (use*.ts)
│   └── __tests__/      # Tests hooks
├── services/           # Logique metier async (camelCase)
│   └── __tests__/      # Tests services
├── types/              # Interfaces TypeScript
├── data/words/         # JSON statiques JLPT (n1-n5.json)
├── utils/              # Utilitaires purs
├── index.tsx           # Home screen
├── training.tsx        # Session d'entrainement
├── stats.tsx           # Statistiques
├── settings.tsx        # Parametres
├── tutorial.tsx        # Tutoriel
├── paywall.tsx         # Premium (desactive)
└── _layout.tsx         # Root layout (Stack, providers)
src/                    # Monetisation uniquement (isole car SDK natifs)
├── services/           # purchases.ts, admob.ts
└── hooks/              # usePurchases.ts, useAds.ts
```

## Language-Specific Rules (TypeScript)

### Imports
- `import type { ... }` pour tous les imports de types (tree-shaking)
- Imports nommes uniquement — pas de `import * as`
- `export default` reserve aux composants de page (expo-router)
- Services/hooks : `export function` nomme uniquement

### Types
- Types unions pour les enums : `'Kana' | 'N5' | 'N4'` — pas de `enum` TypeScript
- `as const` pour les tableaux de constantes
- `interface` pour les objets, `type` pour les unions/aliases
- `Record<string, T>` pour les maps, `Partial<T>` pour les updates

### Gestion d'Erreurs
- Services : `try/catch` avec fallback vers valeurs par defaut — jamais de throw vers l'UI
- Les fonctions async retournent TOUJOURS une valeur (pas de `void` implicite sur erreur)

## Framework-Specific Rules (React / Tamagui)

### Deux Patterns de Hooks
- **Donnees sync** (JSON statiques) : `useEffect → fonctionSync() → setState` (loading = 1 tick)
- **Donnees async** (AsyncStorage) : `useEffect → fonctionAsync().then(setState).finally(setLoading)` (loading = multi-frames)
- Fonctions stables : `useCallback(async () => { ... }, [])` dans les hooks
- Rechargement au focus : `useFocusEffect(useCallback(() => { ... }, [deps]))`
- Flags one-shot : `useRef(false)` (ex: ad pre-session)

### Acces aux Preferences
- Toujours `preferences?.champ ?? defaultValue` (preferences peut etre `null` pendant le chargement)
- Jamais d'acces direct `preferences.champ`

### Parametres de Navigation
- `useLocalSearchParams<{ level: string; difficulty: string }>()` — params toujours `string`
- Pattern : `const level = (params.level || 'defaultValue') as TypeMetier` — fallback + cast

### Composants
- Fonctionnels uniquement — pas de class components
- Props : `interface NomProps { ... }`
- Pages : `export default function NomScreen()` (convention expo-router)
- Composants reutilisables : `export function NomComponent()`
- `memo()` avec comparateur custom uniquement sur composants couteux

### Loading State (Pattern Obligatoire)
- Chaque ecran avec chargement async : `AppHeader` en haut + `Spinner` Tamagui centre + texte bilingue
- Pas de `ActivityIndicator` de React Native — `Spinner` de Tamagui uniquement
- `<AppHeader title="..." showBackButton />` est le SEUL header autorise (pas de header natif Stack)

### State
- `useState` local — pas de state global, pas de stores
- Donnees persistees : load au mount via useEffect, save via service async
- Communication inter-composants : pattern observer (registerCallback/emit)
- Chaque hook charge ses propres donnees — pas de prop drilling

### Tests de Hooks
- Mocker le **service** (`jest.mock('../services/xxx')`) pas AsyncStorage directement
- AsyncStorage est mocke globalement dans `jest.setup.js` pour les tests de services

### Animations
- **Priorite 1** : props Tamagui (`animation="quick"`, `enterStyle`, `exitStyle`, `pressStyle`)
- **Priorite 2** : `react-native-reanimated` uniquement pour animations custom imperatives (dernier recours)

## Testing Rules

### Configuration
- Preset : `react-native` — PAS `jest-expo`
- Mocks globaux dans `jest.setup.js` : AsyncStorage, safe-area, expo-router, localization, reanimated, Tamagui
- Coverage minimum : 70% (statements, branches, functions, lines)
- Exclus du coverage : `_layout.tsx`, `+not-found.tsx`, `*.d.ts`

### Organisation
- Tests a cote du code : `__tests__/` dans chaque dossier module
- Nommage : `NomFichier.test.tsx` ou `NomFichier.test.ts`
- Tests de pages : `app/__tests__/`

### Patterns par Couche
- **Services** : mock AsyncStorage, tester logique pure (calculs, transformations, persistence)
- **Hooks** : mock le service (`jest.mock('../services/xxx')`), tester state + side effects
- **Composants** : tester interactions (press, callbacks), PAS le rendu visuel (Tamagui mocke)
- **Pages** : tester le flow utilisateur (navigation, state transitions)

### Anti-Patterns
- PAS de tests snapshot (Tamagui mocke → snapshots generiques inutiles)
- PAS de tests du root layout `_layout.tsx`
- PAS de mock d'AsyncStorage dans les tests de hooks (mocker le service)
- PAS de tests E2E dans Jest — uniquement des tests unitaires et d'integration legers

## Code Quality & Style

### Linting
- ESLint ^9.0.0 + eslint-config-expo
- Pas de Prettier au projet — formatage via ESLint uniquement

### Destructuring & Fonctions
- Props toujours destructurees dans la signature : `({ value, onChange }: Props)`
- `function` declaration pour exports et composants
- Arrow functions pour callbacks inline et helpers locaux
- Pas de ternaires imbriques — early returns pour conditions complexes

### Hierarchie de Documentation
- **Types/interfaces** : JSDoc sur chaque champ (`/** description */`)
- **Services** : JSDoc complet (`@param`, `@returns`, `@example`)
- **Hooks** : JSDoc leger (description principale uniquement)
- **Composants** : pas de JSDoc (nom + props suffisent)
- Commentaires inline en francais pour les explications contextuelles

### Accessibilite (Obligatoire)
- `accessibilityLabel` sur tous les boutons et elements interactifs
- `accessibilityRole="button"` sur les `YStack`/`XStack` pressables
- `accessibilityState` pour les etats selected/disabled

### Organisation dans un Fichier
- Constantes et config en haut (avant le composant)
- Types/interfaces : soit en haut du fichier, soit dans `app/types/`
- Helpers prives avant les fonctions exportees
- Le composant/export principal en dernier

### Configuration Statique
- Mapping type → valeurs via `Record<Type, Config>` (pas de switch/case)
- Constantes module-level en haut du fichier

### Tests — Nommage par Feature
- Tests generaux : `service.test.ts`
- Tests par feature : `service.feature.test.ts` (ex: `statistics.unlock.test.ts`)
- Splitter quand un fichier de test depasse ~200 lignes

## Development Workflow

### Git
- Branche principale : `main`
- Format commit : `type(scope): description` — optionnel : `(Epic-XXX)` si associe
- Types : `feat`, `fix`, `docs`, `refactor`, `chore`
- Scopes existants : `monetization`, `ui`, `deps`, `notifications`
- Messages en anglais — NE PAS inventer d'Epic si aucune n'est associee

### Fichiers a Ne Pas Modifier
- `app.json` — config critique, ne modifier que si explicitement demande
- `package.json` version — bump de version = decision produit
- `babel.config.js` — ordre des plugins critique (reanimated en dernier)
- `tamagui.config.ts` — theme global, ne modifier que si explicitement demande
- `jest.setup.js` — mocks globaux partages, modifier uniquement pour ajouter un nouveau mock global

### Scripts NPM
- `npm test` — tous les tests en serie (`--runInBand` obligatoire, ne pas changer)
- `npm run test:watch` — mode watch pour le dev
- `npm run test:coverage` — rapport de couverture
- Pas de script `lint` configure

### Build & Deploy
- EAS Build pour Android/iOS
- Google Play Store (privacy policy dans `docs/`)
- `app.json` est la source de verite pour la config Expo (version, plugins, identifiers)
- `private: true` — app mobile, pas une lib npm. JAMAIS de `publishConfig`

## Critical Don't-Miss Rules

### Logique Metier JLPT
- Niveaux JLPT en ordre sequentiel : Kana → N5 → N4 → N3 → N2 → N1
- Deblocage automatique : 100% mots maitrises (>= 5 points total) → niveau suivant debloque
- Un point = reponse correcte + premier demarrage + traduction non consultee
- Nombre de mots par session : respecter `wordsPerSession` des preferences (5-30, pas de 5)

### Word Pools — Systeme Progressif (NE PAS SIMPLIFIER)
- Chaque niveau melange 2-3 data levels avec des display modes differents
- Pattern : niveau N-1 en kanji sans furigana + niveau N en kanji avec furigana + niveau N+1 en kana
- `buildWordPools()` dans `wordSelection.ts` est le coeur — ne pas refactorer sans comprendre le design
- Kana : uniquement N5 en mode kana-only
- N1 : N2 sans furigana + N1 avec furigana (pas de preview N+1)

### Normalisation Romaji
- `normalizeRomaji()` dans `training.tsx` gere les variantes (`si`→`shi`, `ti`→`chi`, `hu`→`fu`, etc.)
- Toute modification affecte TOUTE la validation — tester exhaustivement

### Types Exportes depuis les Composants
- `Difficulty` depuis `DifficultySelector.tsx` et `Level` depuis `LevelButton.tsx` sont utilises partout
- Modifier ces types cascade sur tout le projet (services, hooks, pages)

### Layout Minimaliste
- `_layout.tsx` contient UNIQUEMENT providers + routes
- PAS d'error boundary, splash screen, font loading, deep linking
- Ne PAS ajouter ces features sans demande explicite

### Modal Feedback — Pattern de Separation d'Etat
- `isModalOpen` et `modalColor` sont des states separes — delibere
- Ne PAS reset `modalColor` a la fermeture (bug visuel d'animation)
- `modalColor` mis a jour uniquement au prochain `handleValidate`

### Navigation de Session
- Fin de session : `router.replace('/')` (pas `push`) — empeche le retour arriere

### Cache et Performance
- `unlockedLevelsCache` dans `statistics.ts` : cache memoire avec TTL 5s
- `wordCache` dans `wordLoader.ts` : cache permanent (imports statiques)
- `ScrollingTextContainer` : `memo()` avec comparateur custom

### Fichiers JSON de Donnees
- Fichiers volumineux (1000-5000+ lignes) — ne JAMAIS regenerer completement
- Ajout de mots : IDs sequentiels a partir du dernier ID existant
- 4 fichiers de tests pour `statistics.ts` — TOUS doivent passer apres modification

### Securite
- Cles publiques (RevenueCat, AdMob) dans le code : OK
- Secrets / cles privees : JAMAIS dans le code — variables d'environnement EAS
- Pas de donnees utilisateur sensibles — uniquement stats et preferences en local

---

## Usage Guidelines

**Pour les agents IA :**
- Lire ce fichier AVANT d'implementer du code
- Suivre TOUTES les regles exactement comme documentees
- En cas de doute, preferer l'option la plus restrictive
- Mettre a jour ce fichier si de nouveaux patterns emergent

**Pour les humains :**
- Garder ce fichier lean et concentre sur les besoins des agents
- Mettre a jour quand la stack technologique change
- Revoir trimestriellement pour supprimer les regles devenues evidentes
- Ajouter les nouvelles conventions au fur et a mesure

Derniere mise a jour : 2026-02-07

