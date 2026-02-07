# Claude Code - Configuration Système

Configuration système pour Claude Code. Ce fichier lit `project.yml` pour déterminer le stack technique et activer les agents appropriés.

**Lire METHODOLOGY.md en premier** pour comprendre la méthodologie de travail.

---

## Configuration Projet

**Fichier:** `.claude/project.yml`

Ce fichier définit le stack technique et les agents actifs pour le projet actuel.

---

## AGENTS - Délégation Obligatoire

### Agents Core (Toujours Actifs)

- **CI/CD, Docker, Déploiement** → DevOps Expert → `.claude/core/agents/devops-expert.md`
- **Documentation (README, TODO, CHANGELOG)** → Documentation Maintainer → `.claude/core/agents/docs-maintainer.md`
- **Code Review (qualité, sécurité, best practices)** → Code Review Agent → `.claude/core/agents/code-reviewer.md`
- **Tests, Couverture, Validation** → Test Engineer Agent → `.claude/core/agents/test-engineer.md`
- **Epic, User Stories, Product** → Epic Manager Agent → `.claude/core/agents/epic-manager.md`

### Agents Plugins (Actifs Selon Stack)

**Backend** (selon `project.yml: stack.backend.framework`):
- FastAPI → FastAPI Expert → `.claude/plugins/backend/fastapi-expert.md`
- Django → Django Expert → `.claude/plugins/backend/django-expert.md` (si existe)
- NestJS → NestJS Expert → `.claude/plugins/backend/nestjs-expert.md` (si existe)
- Express → Express Expert → `.claude/plugins/backend/express-expert.md` (si existe)

**Frontend** (selon `project.yml: stack.frontend.framework`):
- React → React Expert → `.claude/plugins/frontend/react-expert.md`
- Vue → Vue Expert → `.claude/plugins/frontend/vue-expert.md` (si existe)
- Angular → Angular Expert → `.claude/plugins/frontend/angular-expert.md` (si existe)

**Database** (selon `project.yml: stack.database.type`):
- PostgreSQL → PostgreSQL Expert → `.claude/plugins/database/postgresql-expert.md`
- MongoDB → MongoDB Expert → `.claude/plugins/database/mongodb-expert.md` (si existe)
- MySQL → MySQL Expert → `.claude/plugins/database/mysql-expert.md` (si existe)

**Mobile** (selon `project.yml: stack.mobile.framework`):
- Expo → Expo Expert → `.claude/plugins/mobile/expo-expert.md`
- Expo → Mobile UI Expert → `.claude/plugins/mobile/mobile-ui-expert.md`

---

## Interdictions

- Modifier `.gitlab-ci.yml` / `.github/workflows/` → DevOps Expert
- Modifier README/TODO/CHANGELOG → Documentation Maintainer
- Décisions architecture Backend → Backend Expert (plugin actif)
- Décisions UI/composants → Frontend Expert (plugin actif)
- Décisions schema DB, requêtes SQL → Database Expert (plugin actif)
- Décisions Mobile SDK/config → Expo Expert (plugin mobile actif)
- Décisions Mobile UI/UX → Mobile UI Expert (plugin mobile actif)
- Suggérer messages commit → DevOps Expert analyse et crée message approprié
- Commit sans code review → Code Review Agent valide code AVANT commit
- Commit sans tests → Test Engineer Agent vérifie couverture et bloque si nécessaire

---

## Règles de Délégation

**Quand invoquer agents:**

- **Questions/tâches Backend** (architecture, setup, dependencies) → TOUJOURS Backend Expert (plugin actif)
- **Questions/tâches Frontend/UI** (composants, layout, UX) → TOUJOURS Frontend Expert (plugin actif)
- **Questions/tâches Infrastructure** (Docker, CI/CD, déploiement, env) → TOUJOURS DevOps Expert
- **Questions/tâches Database** (schema, migrations, SQL queries) → TOUJOURS Database Expert (plugin actif)
- **Questions/tâches Mobile SDK/Config** (Expo, modules natifs, build, navigation) → TOUJOURS Expo Expert (plugin mobile actif)
- **Questions/tâches Mobile UI/UX** (composants mobiles, animations, gestures, theming) → TOUJOURS Mobile UI Expert (plugin mobile actif)
- **Questions/tâches Documentation** (README, TODO, CHANGELOG) → TOUJOURS Documentation Maintainer
- **Questions/tâches Tests** (couverture, création tests, validation) → TOUJOURS Test Engineer Agent
- **Questions/tâches Product** (Epic, User Stories, fonctionnalités métier) → TOUJOURS Epic Manager Agent
- **Avant tout commit** (features > 50 lignes OU fin de tâche) → TOUJOURS Test Engineer Agent
- **Nouvelle fonctionnalité demandée** → TOUJOURS Epic Manager Agent pour qualification

**Règles critiques:**
- NE JAMAIS proposer soi-même tâches/solutions dans domaines agents
- Toujours déléguer AVANT de proposer plan/tâches
- Lire METHODOLOGY.md pour workflow complet

---

## Configuration Rules

### Code Review

**Fichier:** `.claude/core/rules/code-review.yml`

Configuration des règles de code review (qualité, sécurité, best practices, architecture).

Personnalisable par projet selon besoins.

### Test Coverage

**Fichier:** `.claude/core/rules/test-coverage.yml`

Configuration des seuils de couverture de tests, conventions par stack, patterns de fichiers tests.

Personnalisable par projet selon besoins.

---

## Activation Agents

Pour activer/désactiver agents plugins, éditer `.claude/project.yml`:

```yaml
agents:
  core:
    - devops-expert
    - docs-maintainer
    - code-reviewer
    - test-engineer
    - epic-manager
  plugins:
    backend: ["fastapi-expert"]   # Ajouter/retirer selon stack
    frontend: ["react-expert"]    # Ajouter/retirer selon stack
    database: ["postgresql-expert"] # Ajouter/retirer selon stack
    mobile: ["expo-expert", "mobile-ui-expert"]  # Si projet mobile
    other: []                     # Agents optionnels (security-expert, etc.)
```

---

## Références

- **Méthodologie complète:** `.claude/core/METHODOLOGY.md`
- **Setup instructions:** `.claude/core/README.md`
- **Configuration projet:** `.claude/project.yml`
- **Template context:** `.claude/core/templates/context_template.md`
