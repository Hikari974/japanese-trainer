# japanese-trainer

Application mobile pour l'apprentissage du japonais.

## Stack Technique

- **Framework:** Expo SDK 54.0.23 (React Native 0.81.5)
- **Navigation:** expo-router v6.0.14 (file-based routing)
- **UI Library:** Tamagui v1.136.9 (performance-focused, themes)
- **Langage:** TypeScript
- **Plateformes:** iOS + Android

## Installation

```bash
npm install
```

## Lancer l'application

```bash
npx expo start
```

Puis scanner le QR code avec Expo Go (Android) ou la caméra (iOS).

## Structure

```
app/
├── components/          # Composants réutilisables
│   ├── DifficultySelector.tsx
│   ├── LevelButton.tsx
│   └── ScrollingText.tsx
├── _layout.tsx         # Root layout avec TamaguiProvider
├── index.tsx           # Home screen
├── training.tsx        # Page de session d'entraînement
├── poc-scroll.tsx      # POC scrolling text
├── settings.tsx        # Paramètres (placeholder)
└── stats.tsx           # Statistiques (placeholder)
```

## Fonctionnalités actuelles

- Home screen avec sélection de niveau (Kana, N5, N4, N3, N2, N1)
- Sélecteur de difficulté (Facile, Moyen, Difficile)
- Session d'entraînement avec navigation vers page dédiée (niveau + difficulté)
- Bouton "Commencer la session" avec validation de sélection
- POC scrolling text avec Hiragana にほんご
- Design dark mode moderne avec animations

## Tests

Infrastructure de tests configurée avec Jest et React Testing Library.

### Lancer les tests

```bash
# Tests unitaires
npm test

# Mode watch (développement)
npm run test:watch

# Couverture de code
npm run test:coverage
```

### Couverture actuelle

- **Global:** 62.5% (composants principaux à 100%)
- **DifficultySelector.tsx:** 100% (4 tests)
- **LevelButton.tsx:** 100% (3 tests)
- **index.tsx (HomeScreen):** 100% (8 tests - inclut tests session)

**Total:** 15 tests passants

## Développement

Ce projet suit la méthodologie Claude Code avec agents spécialisés.

Configuration et contexte: `.claude/`

**Version:** 0.1.0
