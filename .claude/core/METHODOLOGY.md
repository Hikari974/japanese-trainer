# Claude Code - Méthodologie de Travail

Cette méthodologie définit la **philosophie et les pratiques** de travail avec Claude Code et les agents spécialisés. Elle doit être préservée dans tout projet utilisant ce système.

---

## Philosophie

**Minimaliste + Incrémental** | Agents créent plans, Claude implémente | Contexte préservé via sessions

**Principes:**
- Créer uniquement ce qui est nécessaire
- Développer de manière incrémentale
- Documentation légère (documenter ce qui existe)
- Agents spécialisés pour économiser le contexte
- Plans avant code (pas d'implémentation sans validation)

---

## RÈGLES FONDAMENTALES

### Ne JAMAIS supposer

- Choix tech/architecture sans validation user explicite
- Implémenter infrastructure avant validation besoin réel
- Documenter code inexistant (documentation just-in-time)

### 1 responsabilité = 1 fonction

- Respecter SRP (Single Responsibility Principle)
- Fonctions > 50 lignes doivent être décomposées
- Éviter duplication de responsabilité entre fonctions

### Éviter verbosité

- Plans agents max 300 lignes (500 si complexité justifiée)
- Code: Concision > Sur-documentation
- Self-documenting code preferred (noms explicites vs commentaires)

### Plan AVANT implémentation (STRICT)

- Agent crée plan → User VALIDE → Implémentation (checkpoint bloquant)
- JAMAIS implémenter puis demander validation (workflow inversé)
- Exception: Documentation Maintainer + DevOps Expert mode exécutant

---

## ÉCONOMIE CONTEXTE - Workflow Strict

### RÈGLE D'OR

**Domaine agent détecté → STOP analyse → Invoquer IMMÉDIATEMENT**

### Workflow Obligatoire

```
User → Identifier agent → Invoquer → Lire plan → Résumer agent → Valider → Implémenter
```

### Interdictions Absolues

- JAMAIS analyser best practices soi-même
- JAMAIS expliquer options techniques en détail
- JAMAIS créer matrices comparatives
- JAMAIS proposer recommandations personnelles
- JAMAIS créer plans détaillés implémentation

### Détection Domaine

**Backend/config** → Backend Expert
**Infra/Docker/.env** → DevOps Expert
**UI/Frontend** → Frontend Expert
**Database/SQL** → Database Expert
**Mobile SDK/Config** → Expo Expert
**Mobile UI/UX** → Mobile UI Expert
**Docs** → Documentation Maintainer
**Tests/Couverture** → Test Engineer Agent
**Product/Epic/US** → Epic Manager Agent

**Si domaine détecté → STOP → Invoquer agent**

### Exemples

**❌ MAUVAIS (gaspillage 60k tokens):**
```
User: "Configure env"
→ Analyse 8 sections + matrices + recommandations détaillées
```

**✅ CORRECT (économie 5k tokens):**
```
User: "Configure env"
→ Invoque Backend Expert + DevOps Expert
→ Résume plans agents
→ User valide
→ Implémente
```

### Invocation Agents - Context Optimization

**Modes agents consultants:**
- **Mode 1 (Task Suggestions):** Liste tâches 50 lignes → fichier `tasks_xxx.md`
- **Mode 2 (Implementation Plan):** Plan détaillé 200-500 lignes → fichier `plan_xxx.md`

**Toujours spécifier mode explicitement** pour éviter gaspillage contexte.

**Workflow Mode 1 → Mode 2:**
- Mode 1 crée fichier tasks_xxx.md (50 lignes, liste tâches)
- Mode 2 : fournir tasks_xxx.md comme context dans prompt (agent n'a plus souvenir Mode 1)
- Format : "Lis tasks_xxx.md que tu as créé, créer plan détaillé pour ces tâches"
- Si plan > 500 lignes prévu : découper par catégorie (1 plan par catégorie tâches)

---

## Workflow Agents

### Cycle Standard

```
Agent(context_session_X.md) → Plan(.claude/docs/[agent]/) → Read plan → Implémenter → Update context
```

### Règles

**Agents créent PLANS uniquement** (jamais code)

**EXCEPTIONS:**
- **Documentation Maintainer** = agent exécutant (MAJ docs directement)
- **DevOps Expert** = dual mode (consultant OU exécutant selon tâche)
  - Mode consultant : plans CI/CD, Docker, monitoring → Read plan
  - Mode exécutant : commits, tags, releases → Exécute directement
- **Test Engineer Agent** = agent exécutant (crée/lance tests, bloque commits si nécessaire)
- **Epic Manager Agent** = agent consultant (qualification → plan Epic/US → user valide → crée fichiers)

**Workflow:**
- Toujours lire plans avant implémenter
- Mentionner `.claude/tasks/context_session_X.md` lors invocation agent
- User valide plan AVANT implémentation (checkpoint bloquant)

---

## RÈGLES CRITIQUES - Contexte Session

### Fichiers

- **Context sessions:** `.claude/tasks/context_session_X.md` (X=1,2,3...)
- **Template:** `.claude/tasks/context_template.md`

### AVANT Chaque Tâche

1. Vérifier si `context_session_X.md` existe
2. Si NON → créer depuis `context_template.md`
3. Si OUI → LIRE pour avoir contexte

### APRÈS Chaque Tâche

**Obligatoire:**
1. TOUJOURS mettre à jour `context_session_X.md`
2. Ajouter dans "État Actuel du Développement"
3. Mettre à jour "Prochaines Étapes"
4. Ajouter dans "Décisions Prises" si applicable
5. Mettre à jour "Dernière mise à jour" (date)

**Délégation Documentation:**
6. Appeler Documentation Maintainer avec:
   - Input: `context_session_X.md`
   - Spécifier EXPLICITEMENT tâches TODO.md à marquer [x]
   - Spécifier fichiers modifiés et type changements (Added/Changed/Fixed)

**Checkpoints obligatoires:**
7. **CHECKPOINT CODE REVIEW:** Invoquer Code Review Agent si feature > 100 lignes OU security/auth modifié
8. **CHECKPOINT TEST COVERAGE:** Invoquer Test Engineer Agent avant commit (features > 50 lignes OU fin de tâche)
9. **CHECKPOINT TODO.md:** Vérifier TODO.md mis à jour avant commit (obligatoire)
10. **CHECKPOINT VERSION:** DevOps Expert pose TOUJOURS questions (release/commit? version?)

### JAMAIS

- Terminer tâche sans update contexte
- Oublier créer contexte si absent
- Modifier docs sans déléguer à Documentation Maintainer
- Commit code sans code review si feature importante (>100 lignes)
- Commit sans tests si feature > 50 lignes (checkpoint obligatoire)
- Commit sans vérifier TODO.md mis à jour (checkpoint obligatoire)
- DevOps Expert créer commit sans poser questions version (checkpoint obligatoire)

### Usage

Agents lisent `context_session_X.md` pour comprendre le contexte projet avant de créer leurs plans.

---

## Optimisation Fichiers

### Principes

- 0 emoji, 0 séparateur visuel superflu
- Listes bullets (pas de tableaux complexes)
- Format dense quand possible
- Exclure: arborescence verbeuse, métriques inutiles, config vide, formulations redondantes
- Inclure: décisions, état (fait/reste), étapes, contexte technique, points d'attention

### Guidelines

**Configuration (system.md, project.yml):**
- Max 60 lignes si possible
- Concision maximale

**Context sessions (context_session_X.md):**
- Max 120 lignes si possible
- Format dense (headers: A|B|C)
- Sections essentielles uniquement

**Plans agents:**
- Max 300 lignes (500 si complexité justifiée)
- Découper si > 500 lignes

---

## Application de la Méthodologie

Cette méthodologie s'applique à **tous les projets** utilisant Claude Code, indépendamment du stack technique choisi.

Les agents spécifiques au stack (Backend, Frontend, Database) suivent cette même méthodologie et l'appliquent à leur domaine technique respectif.

**La méthodologie persiste, les technologies changent.**
