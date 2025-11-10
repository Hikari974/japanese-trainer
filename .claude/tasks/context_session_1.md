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
│   ├── CLAUDE.md
│   └── project.yml
├── app/                  # expo-router structure
│   ├── components/
│   │   ├── DifficultySelector.tsx  # Sélecteur compact de difficulté
│   │   ├── LevelButton.tsx         # Bouton de niveau moderne
│   │   └── ScrollingText.tsx       # POC scrolling text
│   ├── _layout.tsx      # Root layout avec TamaguiProvider
│   ├── index.tsx        # Home screen avec UI moderne
│   ├── poc-scroll.tsx   # POC scrolling text
│   ├── settings.tsx     # Page paramètres (placeholder)
│   ├── stats.tsx        # Page statistiques (placeholder)
│   └── +not-found.tsx   # 404 screen
├── assets/              # Icons & splash screens
├── node_modules/
├── .gitignore
├── app.json             # Expo configuration
├── babel.config.js
├── package.json
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

### Ce qui reste à faire
- [ ] Définir les Epic et User Stories pour l'apprentissage du japonais
- [ ] Implémenter les premières fonctionnalités d'apprentissage
- [ ] Créer les pages settings et stats (actuellement placeholders)

---

## 🚀 Prochaines Étapes

### Immédiat (Prochaine tâche)
1. **Définir les fonctionnalités** : Planifier les features d'apprentissage du japonais

### Court Terme
2. Implémenter la logique d'entraînement (scrolling text avec input)
3. Créer les pages settings et stats
4. Ajouter persistance des données (AsyncStorage)

### Moyen Terme
5. Implémenter le système de statistiques
6. Configurer CI/CD avec DevOps Expert
7. Setup Expo EAS pour déploiement

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

**Dernière mise à jour :** 2025-11-10

**Commits :**
- 724a0aa : Infrastructure Claude Code
- 58c5199 : Initialisation Expo + Tamagui + expo-router
- e82d398 : Update context après initialisation
- 7c8392c : Fix dépendances manquantes (Tamagui, worklets)
- da8b4cc : POC scrolling text avec Hiragana にほんご
- 21c5cba : Redesign home screen avec UI moderne dark mode
- 49ad4f5 : Documentation (README.md, TODO.md)
- f65e1c3 : Migration tokens Tamagui + accessibilité
- 6cd8db4 : Fix dark theme (defaultTheme="dark")

**Prochaine action :** Définir les fonctionnalités d'apprentissage

## 📲 Application Testée et Fonctionnelle

L'application tourne sur Android via Expo Go (port 8081).

**Fonctionnalités actuelles :**
- Home screen avec sélection niveau/difficulté
- POC scrolling text (accessible via icône 🧪)
- Navigation vers stats et settings (pages placeholder)
- Design dark mode élégant et moderne

**Tests effectués :**
- ✅ Build réussi
- ✅ Affichage correct sur Android
- ✅ Navigation fonctionnelle
- ✅ Animations fluides
- ✅ POC scrolling validé