# Context Session 1 - japanese-trainer

**Date de début :** 2025-11-10
**Version actuelle :** 0.1.0

---

## 📊 Résumé du Projet

**japanese-trainer** est une application mobile pour l'apprentissage du japonais construite avec Expo :
- **Mobile :** Expo SDK 52.0.0 (React Native)
- **Navigation :** expo-router (file-based routing)
- **UI Library :** Tamagui (performance-focused, themes)
- **Platforms :** iOS + Android
- **Hébergement :** GitHub (`git@github.com:user/japanese-trainer.git`)

---

## 🎯 Décisions Prises Cette Session

### Configuration Initiale
- [x] Configuration du template Claude Code
- [x] Choix stack: Expo SDK 52.0.0 + Tamagui + expo-router
- [x] Plateformes cibles: iOS et Android
- [x] Pas de backend pour l'instant (application standalone)

---

## 📁 Structure Projet Actuelle

```
japanese-trainer/
├── .claude/
│   ├── core/
│   │   ├── agents/
│   │   ├── rules/
│   │   └── templates/
│   ├── plugins/
│   │   └── mobile/
│   ├── docs/
│   ├── tasks/
│   ├── CLAUDE.md
│   └── project.yml
├── .gitignore
└── (projet Expo à initialiser)
```

---

## 🔄 État Actuel du Développement

### Ce qui est fait
- [x] Repository Git initialisé
- [x] Commit initial avec infrastructure Claude Code
- [x] Configuration projet (project.yml, CLAUDE.md)
- [x] .gitignore configuré pour Expo

### Ce qui reste à faire
- [ ] Initialiser projet Expo
- [ ] Configurer Tamagui
- [ ] Mettre en place expo-router
- [ ] Créer structure de l'application
- [ ] Définir les fonctionnalités de base

---

## 🚀 Prochaines Étapes

### Immédiat (Prochaine tâche)
1. Initialiser le projet Expo avec SDK 52.0.0

### Court Terme
2. Installer et configurer Tamagui
3. Configurer expo-router
4. Créer architecture de base de l'app

### Moyen Terme
4. Définir les Epic et User Stories pour l'app d'apprentissage du japonais
5. Implémenter les premières fonctionnalités

---

## 📝 Notes Importantes pour les Agents

### Contexte Technique

**Mobile :**
- Framework : Expo SDK 52.0.0 (React Native)
- Router : expo-router (file-based routing, moderne)
- UI Library : Tamagui (performance, themes)
- Platforms : iOS, Android
- État actuel : Projet non initialisé, infrastructure Claude Code en place

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
**Prochaine action :** Initialiser le projet Expo avec SDK 52.0.0