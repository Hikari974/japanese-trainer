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
│   ├── _layout.tsx      # Root layout avec TamaguiProvider
│   ├── index.tsx        # Home screen
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
- [x] Écran d'accueil créé avec composants Tamagui
- [x] Dependencies installées (node_modules présent)

### Ce qui reste à faire
- [ ] Tester l'application sur Android (`npm run android`)
- [ ] Vérifier que l'application démarre sans erreurs
- [ ] Définir les Epic et User Stories pour l'apprentissage du japonais
- [ ] Implémenter les premières fonctionnalités

---

## 🚀 Prochaines Étapes

### Immédiat (Prochaine tâche)
1. **Tester sur Android** : Lancer `npm run android` pour vérifier l'application

### Court Terme
2. Définir les Epic et User Stories avec Epic Manager Agent
3. Créer l'architecture de navigation de l'app
4. Concevoir le système de thème (light/dark)

### Moyen Terme
5. Implémenter les premières fonctionnalités d'apprentissage
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

**Prochaine action :** Tester l'application sur Android avec `npm run android`

## 📲 Instructions de Test

Pour tester l'application sur Android :

```bash
# Option 1: Lancer sur émulateur/device Android
npm run android

# Option 2: Démarrer le dev server
npm start
# Puis scanner le QR code avec Expo Go
```

**Note :** Au premier lancement, Expo générera automatiquement :
- Le dossier `android/` avec les fichiers natifs
- Le fichier `.expo-env.d.ts` pour TypeScript