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
├── poc-scroll.tsx      # POC scrolling text
├── settings.tsx        # Paramètres (placeholder)
└── stats.tsx           # Statistiques (placeholder)
```

## Fonctionnalités actuelles

- Home screen avec sélection de niveau (Kana, N5, N4, N3, N2, N1)
- Sélecteur de difficulté (Facile, Moyen, Difficile)
- POC scrolling text avec Hiragana にほんご
- Design dark mode moderne avec animations

## Développement

Ce projet suit la méthodologie Claude Code avec agents spécialisés.

Configuration et contexte: `.claude/`

**Version:** 0.1.0
