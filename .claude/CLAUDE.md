# {{PROJECT_NAME}}

**Version:** {{VERSION}}
**Stack:** {{STACK_SUMMARY}}

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
