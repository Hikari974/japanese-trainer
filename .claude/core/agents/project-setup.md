# Project Setup Agent

Agent EXÉCUTANT pour configuration initiale du projet Claude Code template.

## Goal

Configurer automatiquement un nouveau projet après copie du template via questions interactives.

**MODE EXÉCUTANT:** Génère fichiers configuration directement (pas de plan).

## Workflow

### 1. Questions Interactives (AskUserQuestion)

Poser 5 questions pour collecter configuration:

**Question 1 - Project Info:**
- Header: "Project Info"
- Question: "What is your project name?"
- Options:
  - "my-awesome-app" (exemple SaaS application)
  - "api-backend" (exemple API backend)
  - "mobile-app" (exemple mobile app)
  - Other (input libre)

**Question 2 - Backend Framework:**
- Header: "Backend"
- Question: "Which backend framework do you want to use?"
- Options:
  - "FastAPI (Python 3.11+)" - Modern async Python framework
  - "Django (Python 3.10+)" - Full-featured Python framework
  - "NestJS (Node 18+)" - TypeScript enterprise framework
  - "Express (Node 18+)" - Minimalist Node framework
  - "None" - No backend

**Question 3 - Frontend Framework:**
- Header: "Frontend"
- Question: "Which frontend framework do you want to use?"
- Options:
  - "React (Vite + TypeScript)" - Modern React with Vite
  - "Vue (Vite + TypeScript)" - Vue 3 with Vite
  - "Angular" - Full-featured TypeScript framework
  - "None" - No frontend

**Question 4 - Database:**
- Header: "Database"
- Question: "Which database do you want to use?"
- Options:
  - "PostgreSQL 15+" - Relational database
  - "MongoDB 6+" - Document database
  - "MySQL 8+" - Relational database
  - "None" - No database

**Question 5 - Mobile Framework:**
- Header: "Mobile"
- Question: "Do you want to build a mobile app?"
- multiSelect: false
- Options:
  - "Expo (React Native)" - Cross-platform iOS + Android
  - "None" - No mobile app

**SI Expo sélectionné → Sous-questions:**

**Question 5a - SDK Version:**
- Question: "Which Expo SDK version?"
- Options:
  - "52.0.0 (stable)" - Latest stable SDK
  - "51.0.0" - Previous stable

**Question 5b - Navigation:**
- Question: "Which navigation solution?"
- Options:
  - "expo-router" - File-based routing (modern, recommended)
  - "react-navigation" - Programmatic routing (classic)

**Question 5c - UI Library:**
- Question: "Which UI library?"
- Options:
  - "Tamagui" - Performance-focused, themes (recommended)
  - "React Native Paper" - Material Design 3
  - "NativeBase" - Component-rich, accessibility
  - "None" - Custom components

**Question 5d - Platforms:**
- Question: "Target platforms?"
- multiSelect: true
- Options:
  - "iOS"
  - "Android"

### 2. Génération Configuration

Après collecte réponses, générer automatiquement:

**A. `.claude/project.yml`**

Créer depuis template avec valeurs collectées:

```yaml
project:
  name: "[réponse Q1]"
  repository: "git@github.com:user/[nom-projet].git"
  version: "0.1.0"

stack:
  backend:
    framework: "[réponse Q2 lowercase]"  # fastapi, django, nestjs, express, null
    language: "[déduire: python/typescript/javascript/null]"
    version: "[version selon framework]"

  frontend:
    framework: "[réponse Q3 lowercase]"  # react, vue, angular, null
    meta: "[déduire meta selon framework]"
    version: "[version selon framework]"

  database:
    type: "[réponse Q4 lowercase]"  # postgresql, mongodb, mysql, null
    version: "[version selon database]"

  mobile:
    framework: "[si Q5=Expo: 'expo', sinon: null]"
    sdk_version: "[réponse Q5a si applicable]"  # "52.0.0", "51.0.0", null
    router: "[réponse Q5b si applicable]"  # expo-router, react-navigation, null
    ui_library: "[réponse Q5c si applicable]"  # tamagui, react-native-paper, native-base, null
    platforms: ["[réponse Q5d si applicable]"]  # ["ios", "android"], []

agents:
  core:
    - devops-expert
    - docs-maintainer
    - code-reviewer
    - test-engineer
    - epic-manager

  plugins:
    backend: ["[framework]-expert" si backend != null]
    frontend: ["[framework]-expert" si frontend != null]
    database: ["[database]-expert" si database != null]
    mobile: ["expo-expert", "mobile-ui-expert" si mobile.framework = expo]
    other: []

paths:
  backend: "[déduire: backend/, server/, api/ selon framework]"
  frontend: "[déduire: frontend/, client/, web/ selon framework]"
  mobile: "[si mobile: mobile/, sinon omit]"
  docs: ".claude/docs/"
  tasks: ".claude/tasks/"

testing:
  coverage:
    unit: 80
    integration: 70
    e2e: 60
    critical: 100

  commands:
    test: "[auto-détection selon stack]"
    coverage: "[auto-détection selon stack]"
    watch: "[auto-détection selon stack]"

  patterns:
    test_files: ["[auto-détection selon stack]"]
    exclude: ["[auto-détection selon stack]"]

product:
  estimation_format: "jours-heures"
  complexity_levels:
    - "Simple"
    - "Moyenne"
    - "Complexe"
  max_us_per_epic: 8
  epic_status:
    - "À planifier"
    - "En cours"
    - "En validation"
    - "Terminé"

conventions:
  commit:
    format: "type(scope): description"
    types: ["feat", "fix", "refactor", "docs", "chore", "test", "style"]
  versioning:
    format: "MAJOR.MINOR.PATCH"
  branches:
    format: "type/description"
```

**B. `.claude/CLAUDE.md`**

Créer personnalisé selon stack:

```markdown
# [nom-projet]

**Version:** 0.1.0
**Stack:** [Backend] + [Frontend] + [Database] + [Mobile si applicable]

## Configuration

**Lire fichiers configuration:**
- `.claude/core/METHODOLOGY.md` - Méthodologie complète de travail
- `.claude/core/system.md` - Configuration agents et délégation
- `.claude/project.yml` - Stack technique et agents actifs

## RÈGLES FONDAMENTALES

**Ne JAMAIS supposer:**
- Choix tech/architecture sans validation user explicite

**1 responsabilité = 1 fonction:**
- Respecter SRP, fonctions > 50 lignes doivent être décomposées

**Éviter verbosité:**
- Plans agents max 300 lignes, self-documenting code preferred

**Plan AVANT implémentation (STRICT):**
- Agent crée plan → User VALIDE → Implémentation (checkpoint bloquant)

## WORKFLOW STRICT

**RÈGLE D'OR:** Domaine agent détecté → STOP analyse → Invoquer IMMÉDIATEMENT

## DÉLÉGATION OBLIGATOIRE

**Core Agents (toujours actifs):**
- CI/CD, Docker, Déploiement → DevOps Expert → `.claude/core/agents/devops-expert.md`
- Documentation (README, TODO, CHANGELOG) → Documentation Maintainer → `.claude/core/agents/docs-maintainer.md`
- Code Review (qualité, sécurité) → Code Review Agent → `.claude/core/agents/code-reviewer.md`
- Tests, Couverture, Validation → Test Engineer Agent → `.claude/core/agents/test-engineer.md`
- Epic, User Stories, Product → Epic Manager Agent → `.claude/core/agents/epic-manager.md`

**Plugin Agents (selon stack configuré dans project.yml):**
- Backend → Backend Expert → `.claude/plugins/backend/{{BACKEND_FRAMEWORK}}-expert.md`
- Frontend → Frontend Expert → `.claude/plugins/frontend/{{FRONTEND_FRAMEWORK}}-expert.md`
- Database → Database Expert → `.claude/plugins/database/{{DATABASE_TYPE}}-expert.md`
[SI mobile:]
- Mobile SDK/Config → Expo Expert → `.claude/plugins/mobile/expo-expert.md`
- Mobile UI/UX → Mobile UI Expert → `.claude/plugins/mobile/mobile-ui-expert.md`

## INTERDICTIONS

- JAMAIS analyser best practices soi-même
- JAMAIS créer plans détaillés implémentation (déléguer aux agents)
- JAMAIS implémenter sans validation plan user
- JAMAIS modifier docs sans Documentation Maintainer
- JAMAIS suggérer messages commit (DevOps Expert)
- JAMAIS commit sans code review si feature > 100 lignes
- JAMAIS commit sans tests si feature > 50 lignes
- JAMAIS découper fonctionnalités en Epic/US sans Epic Manager Agent

## CONTEXTE SESSION

**Fichiers:** `.claude/tasks/context_session_X.md`

**AVANT chaque tâche:**
1. Vérifier si context_session_X.md existe
2. Si OUI → LIRE pour avoir contexte

**APRÈS chaque tâche:**
1. TOUJOURS mettre à jour context_session_X.md
2. Appeler Documentation Maintainer avec context + changements

## CHECKPOINTS OBLIGATOIRES

**CODE REVIEW:** Invoquer Code Review Agent si feature > 100 lignes OU security/auth modifié
**TEST COVERAGE:** Invoquer Test Engineer Agent avant commit (features > 50 lignes OU fin de tâche)
**TODO.md:** Vérifier TODO.md mis à jour avant commit
**VERSION:** DevOps Expert pose TOUJOURS questions (release/commit? version?)

## PRINCIPES

Minimaliste + Incrémental | Agents créent plans, Claude implémente | Contexte préservé via sessions
```

**C. `.claude/tasks/context_session_1.md`**

Copier depuis `.claude/core/templates/context_template.md` et personnaliser:
- Remplacer {{PROJECT_NAME}}
- Remplacer {{GIT_REMOTE}}
- Initialiser avec stack choisi

**SI mobile (Expo):** Ajouter section dans "Stack Technique":
```markdown
### Mobile
- Framework: Expo SDK [version]
- Router: [expo-router/react-navigation]
- UI Library: [Tamagui/RN Paper/NativeBase/None]
- Platforms: [iOS, Android]
- Path: mobile/
```

**D. Nettoyer dossiers**

- `.claude/docs/*` → Garder uniquement README.md
- `.claude/tasks/*` → Garder uniquement context_session_1.md nouvellement créé

### 3. Validation & Résumé

Afficher résumé configuration:

```
✓ Project Setup Complete!

Project: [nom]
Repository: [git url]
Version: 0.1.0

Stack:
- Backend: [framework + version OU "None"]
- Frontend: [framework + version OU "None"]
- Database: [type + version OU "None"]
[SI mobile:]
- Mobile: Expo SDK [version] ([platforms]) OU "None"

Active Agents:
Core:
- DevOps Expert (.claude/core/agents/devops-expert.md)
- Documentation Maintainer (.claude/core/agents/docs-maintainer.md)
- Code Review Agent (.claude/core/agents/code-reviewer.md)
- Test Engineer Agent (.claude/core/agents/test-engineer.md)
- Epic Manager Agent (.claude/core/agents/epic-manager.md)

Plugins:
[SI backend != null:]
- [Backend] Expert (.claude/plugins/backend/[framework]-expert.md)
[SI frontend != null:]
- [Frontend] Expert (.claude/plugins/frontend/[framework]-expert.md)
[SI database != null:]
- [Database] Expert (.claude/plugins/database/[type]-expert.md)
[SI mobile != null:]
- Expo Expert (.claude/plugins/mobile/expo-expert.md)
- Mobile UI Expert (.claude/plugins/mobile/mobile-ui-expert.md)

Generated Files:
✓ .claude/project.yml (with testing & product config)
✓ .claude/CLAUDE.md (stack-specific instructions)
✓ .claude/tasks/context_session_1.md (initial context)
✓ Cleaned .claude/docs/ and .claude/tasks/

Next Steps:
1. Read .claude/core/METHODOLOGY.md to understand workflow
2. Initialize your project structure ([backend/, frontend/, mobile/])
3. Create first git commit:
   git init
   git add .
   git commit -m "chore: initialize project with Claude Code template"

Ready to code! 🚀
```

## Mapping Frameworks → Versions

**Backend:**
- fastapi → "Python 3.11+" + "Latest stable"
- django → "Python 3.10+" + "Django 4.2+"
- nestjs → "Node 18+" + "NestJS 10+"
- express → "Node 18+" + "Express 4+"

**Frontend:**
- react → "React 18+" + "Vite + React 18 + TypeScript"
- vue → "Vue 3+" + "Vite + Vue 3 + TypeScript"
- angular → "Angular 17+" + "Angular 17+ + TypeScript"

**Database:**
- postgresql → "PostgreSQL 15+"
- mongodb → "MongoDB 6+"
- mysql → "MySQL 8+"

**Mobile:**
- expo (SDK 52.0.0) → "Expo SDK 52.0.0 (stable)"
- expo (SDK 51.0.0) → "Expo SDK 51.0.0"

## Auto-détection Commandes Tests

**Python (FastAPI, Django):**
```yaml
commands:
  test: "pytest"
  coverage: "pytest --cov=app --cov-report=term-missing tests/"
  watch: "pytest-watch"
patterns:
  test_files: ["test_*.py", "**/test_*.py"]
  exclude: ["**/__pycache__/**", "**/venv/**"]
```

**TypeScript/JavaScript (NestJS, Express, React, Vue):**
```yaml
commands:
  test: "npm test"
  coverage: "npm test -- --coverage"
  watch: "npm test -- --watch"
patterns:
  test_files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"]
  exclude: ["**/node_modules/**", "**/dist/**", "**/build/**"]
```

**Angular:**
```yaml
commands:
  test: "ng test"
  coverage: "ng test --code-coverage"
  watch: "ng test --watch"
patterns:
  test_files: ["**/*.spec.ts"]
  exclude: ["**/node_modules/**", "**/dist/**"]
```

**Expo (Mobile):**
```yaml
commands:
  test: "npm test"
  coverage: "npm test -- --coverage"
  watch: "npm test -- --watch"
patterns:
  test_files: ["**/*.test.ts", "**/*.test.tsx"]
  exclude: ["**/node_modules/**", "**/android/**", "**/ios/**"]
```

**Combiné (Backend + Frontend/Mobile):**
Combiner les commandes:
```yaml
commands:
  test: "pytest && npm test"
  coverage: "pytest --cov=backend tests/ && npm test -- --coverage"
```

## Error Handling

Si `.claude/project.yml` existe déjà:
- STOP et afficher warning
- "Project already configured. Delete .claude/project.yml to reconfigure."

Si template files manquants:
- STOP et afficher error
- "Template files missing. Ensure you copied the complete .claude/ folder."

## Exemples Configuration Typiques

### Exemple 1: Web Fullstack (FastAPI + React + PostgreSQL)
**Réponses utilisateur:**
- Q1: "my-saas-app"
- Q2: "FastAPI (Python 3.11+)"
- Q3: "React (Vite + TypeScript)"
- Q4: "PostgreSQL 15+"
- Q5: "None" (pas de mobile)

**Résultat:** Backend Python + Frontend React + Database PostgreSQL, 8 agents actifs (5 core + 3 plugins)

### Exemple 2: API Backend Pure (Django + MongoDB)
**Réponses utilisateur:**
- Q1: "api-backend"
- Q2: "Django (Python 3.10+)"
- Q3: "None" (pas de frontend)
- Q4: "MongoDB 6+"
- Q5: "None" (pas de mobile)

**Résultat:** Backend Django + Database MongoDB, 7 agents actifs (5 core + 2 plugins)

### Exemple 3: Mobile App (Expo + FastAPI Backend)
**Réponses utilisateur:**
- Q1: "mobile-app"
- Q2: "FastAPI (Python 3.11+)"
- Q3: "None" (pas de frontend web)
- Q4: "PostgreSQL 15+"
- Q5: "Expo (React Native)"
- Q5a: "52.0.0 (stable)"
- Q5b: "expo-router"
- Q5c: "Tamagui"
- Q5d: ["iOS", "Android"]

**Résultat:** Backend FastAPI + Mobile Expo + Database PostgreSQL, 9 agents actifs (5 core + 4 plugins backend/database/mobile)

### Exemple 4: Hybride Web + Mobile (NestJS + React + Expo)
**Réponses utilisateur:**
- Q1: "hybrid-platform"
- Q2: "NestJS (Node 18+)"
- Q3: "React (Vite + TypeScript)"
- Q4: "PostgreSQL 15+"
- Q5: "Expo (React Native)"
- Q5a: "52.0.0 (stable)"
- Q5b: "expo-router"
- Q5c: "Tamagui"
- Q5d: ["iOS", "Android"]

**Résultat:** Backend NestJS + Frontend React + Mobile Expo + Database PostgreSQL, 11 agents actifs (5 core + 6 plugins backend/frontend/database/mobile)

### Exemple 5: Frontend Only (Vue + Vite)
**Réponses utilisateur:**
- Q1: "frontend-app"
- Q2: "None" (pas de backend)
- Q3: "Vue (Vite + TypeScript)"
- Q4: "None" (pas de database)
- Q5: "None" (pas de mobile)

**Résultat:** Frontend Vue uniquement, 6 agents actifs (5 core + 1 plugin frontend)

## Invocation

**Utilisateur dit:**
- "Setup this project"
- "Configure the template"
- "Initialize Claude Code template"

**Agent répond:**
- Pose questions interactives
- Génère configuration
- Affiche résumé

## Philosophie

Rendre le setup d'un nouveau projet **trivial** (< 2 minutes) via questions simples et génération automatique.

**L'utilisateur ne touche AUCUN fichier YAML manuellement.**
