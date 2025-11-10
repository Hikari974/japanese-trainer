# CHECKPOINTS OBLIGATOIRES

Version: 1.0.0
Lecture obligatoire AVANT chaque commit.

## AVANT CHAQUE COMMIT - CHECKLIST STRICTE

### 1. CONTEXTE SESSION
- [ ] context_session_X.md existe?
- [ ] context_session_X.md mis a jour avec etat actuel?
- [ ] Decisions techniques documentees?

### 2. DOCUMENTATION
- [ ] Documentation Maintainer appele?
- [ ] Rapport de livraison cree (delivery_YYYY-MM-DD_NNN.md)?
- [ ] TODO.md mis a jour (taches completees/ajoutees)?
- [ ] CHANGELOG.md [Unreleased] mis a jour?

### 3. QUALITE CODE
- [ ] Feature > 100 lignes OU security/auth modifie?
  - [ ] Code Review Agent appele?
  - [ ] Rapport review_YYYY-MM-DD_NNN.md cree?
  - [ ] Issues critiques resolues?

### 4. TESTS
- [ ] Feature > 50 lignes OU fin de tache?
  - [ ] Test Engineer Agent appele?
  - [ ] Tests crees/executes?
  - [ ] Couverture >= 80%?
  - [ ] Tous tests passent?

### 5. ORCHESTRATION
- [ ] Orchestrator Agent appele pour validation finale?
- [ ] last-action.json verifie?
- [ ] Tous checkpoints "true"?

### 6. VERSIONING
- [ ] DevOps Expert consulte si release?
- [ ] Version incrementee si necessaire?
- [ ] Tags git crees si release?

## PENDANT L'IMPLEMENTATION - REGLES DELEGATION

### DETECTION AUTOMATIQUE → INVOCATION IMMEDIATE

Domaine detecte → STOP analyse → Invoquer agent correspondant

### Core Agents (toujours actifs)

| Domaine | Agent | Fichier | Quand |
|---------|-------|---------|-------|
| CI/CD, Docker, Deploy | DevOps Expert | devops-expert.md | Config deploy, Dockerfile, pipeline CI/CD |
| Documentation | Documentation Maintainer | docs-maintainer.md | README, TODO, CHANGELOG, fin de tache |
| Code Review | Code Review Agent | code-reviewer.md | > 100 lignes OU security/auth |
| Tests | Test Engineer | test-engineer.md | > 50 lignes OU fin de tache |
| Epic/US | Epic Manager | epic-manager.md | Features complexes, planning |
| Commits | Orchestrator | orchestrator.md | AVANT chaque commit (obligatoire) |
| Setup | Project Setup | project-setup.md | Nouveau projet uniquement |
| Sync | Template Sync | template-sync.md | Mise a jour template |

### Plugin Agents (selon stack project.yml)

| Stack | Agent | Fichier | Quand |
|-------|-------|---------|-------|
| Mobile Expo | Expo Expert | expo-expert.md | SDK config, native modules, EAS build |
| Mobile UI | Mobile UI Expert | mobile-ui-expert.md | Components mobile, navigation, UX |

### Seuils Declenchement Automatique

| Condition | Action Obligatoire |
|-----------|-------------------|
| Ligne modifiee > 100 | Appeler Code Review Agent |
| Ligne modifiee > 50 | Appeler Test Engineer Agent |
| Security/Auth modifie | Appeler Code Review Agent (CRITIQUE) |
| Fin de tache | Appeler Documentation Maintainer |
| Demande commit | Appeler Orchestrator Agent (BLOQUANT) |
| Feature complexe | Appeler Epic Manager Agent |
| Config deploy | Appeler DevOps Expert |

## INTERDICTIONS STRICTES

### JAMAIS faire soi-meme:
- Analyser best practices (deleguer aux agents)
- Creer plans implementation detailles (deleguer aux agents)
- Implementer sans validation plan user (checkpoint bloquant)
- Modifier docs sans Documentation Maintainer
- Suggerer messages commit sans DevOps Expert
- Commit sans code review si feature > 100 lignes
- Commit sans tests si feature > 50 lignes
- Decouper Epic/US sans Epic Manager Agent

### JAMAIS supposer:
- Choix tech/architecture sans validation user explicite
- Implementation sans plan valide
- Commit sans checkpoints valides

### TOUJOURS respecter:
- 1 responsabilite = 1 fonction (SRP)
- Fonctions > 50 lignes doivent etre decomposees
- Plans max 300 lignes (dense, pas emojis)
- Self-documenting code preferred

## WORKFLOW COMMIT STANDARD

```
1. Feature terminee
   ↓
2. Mettre a jour context_session_X.md
   ↓
3. Verifier seuils (> 100 lignes? > 50 lignes? Security?)
   ↓
4. Appeler agents necessaires (Code Review, Test Engineer)
   ↓
5. Resoudre issues detectees
   ↓
6. Appeler Documentation Maintainer
   ↓
7. Verifier TODO.md et CHANGELOG.md mis a jour
   ↓
8. Appeler Orchestrator Agent
   ↓
9. Orchestrator verifie last-action.json
   ↓
10. Si tous checkpoints "true" → Autoriser commit
    Si un checkpoint "false" → BLOQUER et lister manquants
   ↓
11. Commit autorise
   ↓
12. Orchestrator met a jour last-action.json
```

## DETECTION POST-COMMIT (SYSTEM REMINDERS)

### Configuration Recommandee

Si commit git detecte SANS passage par Orchestrator:

```
COMMIT DETECTE SANS ORCHESTRATOR

PROCEDURE OBLIGATOIRE:
1. context_session_X.md mis a jour? (OUI/NON)
2. Documentation Maintainer appele? (OUI/NON)
3. Feature > 100 lignes → Code Review fait? (OUI/NON/N/A)
4. Feature > 50 lignes → Tests valides? (OUI/NON/N/A)

SI UN SEUL "NON": EXECUTER IMMEDIATEMENT les agents manquants
```

### Integration Claude Code

Configurer hooks utilisateur dans settings pour:
- Detection pre-commit: Rappel lecture CHECKPOINTS.md
- Detection post-commit: Verification agents appeles
- Lecture auto last-action.json si present

## FORMAT AGENTS - RAPPEL

### Mode Consultant
- Creation plans implementation
- Fichier: plan_XXX.md (200-500 lignes)
- Validation user obligatoire avant implementation
- Agents: Expo Expert, Mobile UI Expert, Epic Manager

### Mode Executor
- Modifications directes fichiers
- Creation automatique tests/docs
- Fichier: delivery_YYYY-MM-DD_NNN.md (rapport livraison)
- Agents: Documentation Maintainer, Test Engineer

### Mode DUAL (Consultant + Executor)
- Plans OU execution selon contexte
- Validation user si plan, auto si execution
- Fichiers: plan_XXX.md OU delivery_XXX.md OU review_XXX.md
- Agents: DevOps Expert, Code Review Agent, Orchestrator

## RAPPORTS LIVRAISON - FORMAT STANDARD

Tous les agents (Core + Plugin) doivent creer rapports apres tache completee.

### Localisation
`.claude/docs/[agent-name]/delivery_YYYY-MM-DD_NNN.md`

Exemples:
- `.claude/docs/devops-expert/delivery_2025-11-10_001.md`
- `.claude/docs/expo-expert/delivery_2025-11-10_001.md`
- `.claude/docs/docs-maintainer/delivery_2025-11-10_002.md`

### Structure Minimale

```markdown
# Rapport Livraison [Agent Name]

Date: YYYY-MM-DD
Numero: NNN
Tache: [Description courte]

## Modifications

- Fichier 1: [Changement resume]
- Fichier 2: [Changement resume]

## Decisions Techniques

- [Decision 1 + rationale]
- [Decision 2 + rationale]

## Points Attention

- [Point 1]
- [Point 2]

## Checkpoints Valides

- [x] Tests passes
- [x] Documentation mise a jour
- [x] Aucune regression
```

### Auto-increment Numerotation

Format: 001, 002, 003... (par jour et par agent)

## STATE PERSISTANT - last-action.json

### Localisation
`.claude/state/last-action.json`

### Structure

```json
{
  "last_commit": "a21debf",
  "timestamp": "2025-11-10T14:23:45Z",
  "lines_changed": 196,
  "checkpoints_completed": {
    "context_updated": true,
    "doc_maintainer_called": true,
    "code_review_done": false,
    "tests_validated": true,
    "orchestrator_validated": true
  },
  "agents_invoked": [
    "Documentation Maintainer",
    "Test Engineer",
    "Orchestrator"
  ],
  "files_modified": [
    ".claude/core/CHECKPOINTS.md",
    ".claude/core/agents/orchestrator.md"
  ]
}
```

### Mise a Jour

- Responsable: Orchestrator Agent
- Quand: Apres validation checkpoints (avant commit autorise)
- Lecture: Avant chaque nouveau commit

### Detection

Si Orchestrator lit last-action.json et detecte "false":
→ BLOQUER commit
→ Lister checkpoints manquants
→ Forcer execution agents necessaires

## PRINCIPES FONDAMENTAUX

### Minimaliste + Incremental
- Creer uniquement necessaire
- Developper incrementalement
- Documentation light (just-in-time)
- Agents specialises pour economie contexte

### Plan AVANT Implementation (STRICT)
- Agent cree plan
- User VALIDE
- Implementation (checkpoint bloquant)

### Contexte Preserve
- Sessions context_session_X.md
- Rapports livraison timestampes
- State persistant last-action.json

### Delegation Systematique
- Domaine detecte → STOP → Invoquer immediatement
- Jamais analyser soi-meme
- Agents experts responsables

## TROUBLESHOOTING

### Probleme: Commit bloque par Orchestrator

**Cause:** Un ou plusieurs checkpoints "false"

**Solution:**
1. Lire message Orchestrator (liste checkpoints manquants)
2. Executer agents necessaires dans ordre
3. Re-appeler Orchestrator
4. Commit autorise si tous "true"

### Probleme: Oubli appel agent

**Cause:** Detection automatique non respectee

**Solution:**
1. Lire CHECKPOINTS.md section "DETECTION AUTOMATIQUE"
2. Verifier seuils (> 100 lignes? > 50 lignes?)
3. Appeler agents manquants
4. Mettre a jour context_session_X.md

### Probleme: Documentation non mise a jour

**Cause:** Documentation Maintainer non appele

**Solution:**
1. Appeler Documentation Maintainer avec context + changements
2. Verifier rapport delivery_XXX.md cree
3. Verifier TODO.md et CHANGELOG.md mis a jour
4. Re-appeler Orchestrator

## RESUME EXECUTION

**REGLE D'OR:**
Domaine agent detecte → STOP analyse → Invoquer IMMEDIATEMENT

**CHECKPOINT BLOQUANT:**
Demande commit → Appeler Orchestrator → Bloquer si "false" → Autoriser si "true"

**TRACABILITE:**
Chaque action → Rapport livraison + State update + Context session

**QUALITE:**
> 100 lignes = Code Review | > 50 lignes = Tests | Security = Code Review CRITIQUE

**AUCUNE EXCEPTION.**
