# japanese-trainer

**Version:** 0.1.0
**Stack:** Expo SDK 52.0.0 (React Native) + Tamagui + expo-router

---

## ⚠️ ENFORCEMENT - APPLICATION FORCEE DES PROCEDURES

**LIRE OBLIGATOIRE AVANT TOUTE ACTION :**

1. **`.claude/core/ENFORCEMENT.md`** - Regles de force + detection violations
2. **`.claude/core/CHECKPOINTS.md`** - Checklist obligatoire commits
3. **`.claude/core/METHODOLOGY.md`** - Methodologie complete
4. **`.claude/core/system.md`** - Configuration agents

**APPLICATION AUTOMATIQUE :**
- Violations detectees = STOP immediat + correction
- Aucune exception autorisee
- Workflow force strict

---

## 🚨 REGLES ABSOLUES (AUCUNE EXCEPTION)

### REGLE 1 : DELEGATION IMMEDIATE OBLIGATOIRE

**Domaine agent detecte → STOP analyse → Invoquer IMMEDIATEMENT**

```
SI User demande Mobile → STOP → Invoquer Expo Expert / Mobile UI Expert
SI User demande Docs → STOP → Invoquer Documentation Maintainer
SI User demande Tests → STOP → Invoquer Test Engineer
SI User demande Commit → STOP → Invoquer Orchestrator
```

**INTERDICTION STRICTE :**
- JAMAIS repondre directement sur domaines agents
- JAMAIS implementer sans agent
- JAMAIS analyser best practices soi-meme
- JAMAIS creer plans sans agent

**VIOLATION = STOP IMMEDIAT**

### REGLE 2 : ORCHESTRATOR BLOQUANT COMMITS

**User demande commit → Orchestrator OBLIGATOIRE → Checkpoints valides → Commit**

```
AVANT CHAQUE COMMIT (ZERO EXCEPTION) :
1. Lire .claude/core/CHECKPOINTS.md
2. Calculer lines changees (git diff --shortstat)
3. Verifier seuils (>100 lignes? >50 lignes? security?)
4. Invoquer agents manquants (Code Review, Tests)
5. Invoquer Orchestrator Agent
6. Orchestrator lit .claude/state/last-action.json
7. SI checkpoints "false" : BLOQUER commit + lister manquants
8. SI checkpoints "true" : AUTORISER commit
```

**INTERDICTION STRICTE :**
- JAMAIS git commit sans Orchestrator
- JAMAIS bypass checkpoints
- JAMAIS commit sans validation

**VIOLATION = COMMIT BLOQUE**

### REGLE 3 : PLAN AVANT CODE (CHECKPOINT BLOQUANT)

**Agent cree plan → User VALIDE → Implementation**

```
WORKFLOW STRICT :
1. Agent invoque
2. Agent cree plan (plan_xxx.md)
3. Claude demande : "Valider plan ?"
4. User repond OUI
5. PUIS implementation

JAMAIS implementation sans validation explicite user
```

**INTERDICTION STRICTE :**
- JAMAIS implementer sans plan valide
- JAMAIS supposer validation
- JAMAIS "je pense que c'est OK"

**VIOLATION = STOP IMPLEMENTATION**

### REGLE 4 : CONTEXT + DOCUMENTATION OBLIGATOIRES

**Tache finie → Context update → Doc Maintainer → Rapports**

```
APRES CHAQUE TACHE (OBLIGATOIRE) :
1. Mettre a jour .claude/tasks/context_session_X.md
2. Invoquer Documentation Maintainer
3. Doc Maintainer cree rapport delivery_YYYY-MM-DD_NNN.md
4. Doc Maintainer met a jour TODO.md et CHANGELOG.md
5. Verifier rapports crees

JAMAIS oublier context update
JAMAIS commit sans docs mises a jour
```

**VIOLATION = COMMIT BLOQUE**

### REGLE 5 : TESTS NON OPTIONNELS

**> 50 lignes → Test Engineer OBLIGATOIRE**

```
SI lines changees > 50 :
1. Invoquer Test Engineer Agent
2. Agent cree/execute tests
3. Verifier couverture >= 80%
4. Verifier tous tests passent
5. PUIS Orchestrator

JAMAIS commit sans tests si > 50 lignes
JAMAIS "suggerer" tests (les faire)
```

**VIOLATION = COMMIT BLOQUE**

---

## 📋 WORKFLOW STRICT FORCE

### Workflow Implementation

```
1. User demande implementation Mobile
   ↓
2. DETECTION : Domaine agent ?
   ↓
3. OUI → STOP analyse IMMEDIATEMENT
   ↓
4. Message : "Delegation obligatoire a [Agent]"
   ↓
5. Invoquer agent correspondant (Task tool)
   ↓
6. Agent cree plan (plan_xxx.md)
   ↓
7. Demander validation user : "Valider plan ?"
   ↓
8. Attendre reponse user (BLOQUER ici)
   ↓
9. SI user valide : Implementation
   SI user refuse : STOP
```

**CHECKPOINTS BLOQUANTS :**
- Etape 3 : STOP si domaine agent detecte
- Etape 8 : BLOQUER jusqu'a validation user

### Workflow Commit

```
1. User demande "commit" / "commiter" / "creer commit"
   ↓
2. STOP IMMEDIAT
   ↓
3. Lire .claude/core/CHECKPOINTS.md
   ↓
4. Calculer git diff --shortstat HEAD
   ↓
5. Verifier seuils :
   - > 100 lignes ? Code Review fait ?
   - > 50 lignes ? Tests faits ?
   - Security modifie ? Code Review fait ?
   ↓
6. Lister agents manquants si non appeles
   ↓
7. Message : "Orchestrator obligatoire avant commit"
   ↓
8. Invoquer Orchestrator Agent (Task tool)
   ↓
9. Orchestrator lit .claude/state/last-action.json
   ↓
10. Orchestrator verifie checkpoints
    ↓
11. SI "false" : BLOQUER commit + message manquants
    SI "true" : AUTORISER commit + update state
```

**CHECKPOINT BLOQUANT :**
- Etape 2 : STOP immediat sur demande commit
- Etape 11 : BLOQUER si checkpoints "false"

### Workflow Documentation

```
1. Tache completee (implementation finie)
   ↓
2. OBLIGATOIRE : Mettre a jour context_session_X.md
   ↓
3. Documenter :
   - Changements faits
   - Decisions techniques
   - Etat actuel projet
   - Prochaines etapes
   ↓
4. Message : "Documentation Maintainer obligatoire"
   ↓
5. Invoquer Documentation Maintainer (Task tool)
   ↓
6. Fournir : context + changements + fichiers modifies
   ↓
7. Doc Maintainer cree rapport delivery_YYYY-MM-DD_NNN.md
   ↓
8. Doc Maintainer met a jour TODO.md et CHANGELOG.md
   ↓
9. Verifier rapports crees dans .claude/docs/docs-maintainer/
```

**CHECKPOINT BLOQUANT :**
- Etape 2 : OBLIGATOIRE avant continuer

---

## 🔴 INTERDICTIONS STRICTES

**JAMAIS faire ces actions :**

### Interdiction 1 : Implementation Directe
```
❌ INTERDIT :
- "Je vais implementer X"
- "Voici le code pour Y"
- "Ajoutons la fonction Z"

✅ OBLIGATOIRE :
- "Delegation obligatoire a [Agent]"
- Invoquer agent
- Agent cree plan
- User valide
- PUIS implementation
```

### Interdiction 2 : Commit Direct
```
❌ INTERDIT :
- git commit directement
- "Je commite les changements"
- Bypass Orchestrator

✅ OBLIGATOIRE :
- Lire CHECKPOINTS.md
- Invoquer Orchestrator
- Orchestrator valide checkpoints
- PUIS commit si autorise
```

### Interdiction 3 : Modification Docs Directe
```
❌ INTERDIT :
- Edit README.md directement
- Edit TODO.md directement
- Edit CHANGELOG.md directement

✅ OBLIGATOIRE :
- Invoquer Documentation Maintainer
- Agent met a jour docs
- Agent cree rapport delivery
```

### Interdiction 4 : Oubli Agents
```
❌ INTERDIT :
- Feature > 100 lignes sans Code Review
- Feature > 50 lignes sans Tests
- Commit sans Orchestrator
- Docs sans Documentation Maintainer

✅ OBLIGATOIRE :
- Verifier seuils AVANT commit
- Appeler agents manquants
- PUIS Orchestrator
- PUIS commit si autorise
```

---

## 🎯 DELEGATION OBLIGATOIRE

### Core Agents (toujours actifs)

**APPEL SYSTEMATIQUE (pas optionnel) :**

| Domaine | Agent | Fichier | Quand Invoquer |
|---------|-------|---------|----------------|
| CI/CD, Docker, Deploy | DevOps Expert | `.claude/core/agents/devops-expert.md` | Config deploy, Dockerfile, CI/CD |
| Docs (README, TODO, CHANGELOG) | Documentation Maintainer | `.claude/core/agents/docs-maintainer.md` | **APRES CHAQUE TACHE** |
| Code Review | Code Review Agent | `.claude/core/agents/code-reviewer.md` | > 100 lignes OU security/auth |
| Tests, Couverture | Test Engineer | `.claude/core/agents/test-engineer.md` | > 50 lignes OU fin tache |
| Epic, User Stories | Epic Manager | `.claude/core/agents/epic-manager.md` | Features complexes, planning |
| **Commits, Checkpoints** | **Orchestrator** | **`.claude/core/agents/orchestrator.md`** | **AVANT CHAQUE COMMIT** |

### Plugin Agents (selon stack project.yml)

**APPEL SYSTEMATIQUE (pas optionnel) :**

| Stack | Agent | Fichier | Quand Invoquer |
|-------|-------|---------|----------------|
| Mobile Expo | Expo Expert | `.claude/plugins/mobile/expo-expert.md` | SDK, modules natifs, navigation, build |
| Mobile UI | Mobile UI Expert | `.claude/plugins/mobile/mobile-ui-expert.md` | Components mobile, animations, theming |

---

## 📍 CONTEXTE SESSION

**Fichiers :** `.claude/tasks/context_session_X.md`

### AVANT chaque tache (OBLIGATOIRE)

```
1. Verifier si context_session_X.md existe
2. SI OUI :
   - LIRE completement
   - Comprendre etat actuel
   - Identifier contexte
3. SI NON :
   - Creer depuis template
   - Initialiser contexte
```

### APRES chaque tache (OBLIGATOIRE)

```
1. Mettre a jour context_session_X.md
2. Documenter :
   - Changements implementes
   - Decisions techniques prises
   - Etat actuel projet
   - Fichiers modifies
   - Prochaines etapes
3. Appeler Documentation Maintainer
4. Verifier TODO.md et CHANGELOG.md mis a jour
```

**VIOLATION = COMMIT BLOQUE**

---

## ✅ CHECKPOINTS OBLIGATOIRES

**LIRE AVANT COMMIT :** `.claude/core/CHECKPOINTS.md`

### Checklist Pre-Commit (TOUS OBLIGATOIRES)

```
[ ] 1. Context session mis a jour ?
[ ] 2. Documentation Maintainer appele ?
[ ] 3. Rapport delivery_XXX.md cree ?
[ ] 4. TODO.md mis a jour ?
[ ] 5. CHANGELOG.md [Unreleased] mis a jour ?
[ ] 6. > 100 lignes OU security ? Code Review fait ?
[ ] 7. > 50 lignes ? Tests faits ? Couverture >= 80% ?
[ ] 8. Orchestrator invoque ?
[ ] 9. Orchestrator a autorise (checkpoints "true") ?
```

**SI UN SEUL "NON" : COMMIT BLOQUE**

### Seuils Detection Automatique

| Condition | Action Obligatoire | Fichier Agent |
|-----------|-------------------|---------------|
| Lines > 100 | Code Review Agent | `.claude/core/agents/code-reviewer.md` |
| Lines > 50 | Test Engineer Agent | `.claude/core/agents/test-engineer.md` |
| Security/Auth modifie | Code Review Agent (CRITIQUE) | `.claude/core/agents/code-reviewer.md` |
| Fin tache | Documentation Maintainer | `.claude/core/agents/docs-maintainer.md` |
| **Demande commit** | **Orchestrator Agent** | **`.claude/core/agents/orchestrator.md`** |

---

## 🔄 DETECTION VIOLATIONS AUTOMATIQUE

**Lire :** `.claude/core/ENFORCEMENT.md`

### Violations Communes

**Violation 1 : Implementation sans agent**
- Detection : Claude repond directement sans invoquer agent
- Action : STOP immediat + invoquer agent

**Violation 2 : Commit sans Orchestrator**
- Detection : git commit sans appel Orchestrator
- Action : BLOQUER commit + invoquer Orchestrator

**Violation 3 : Docs sans Documentation Maintainer**
- Detection : Edit README/TODO/CHANGELOG direct
- Action : STOP + invoquer Documentation Maintainer

**Violation 4 : Code Review oublie**
- Detection : > 100 lignes sans Code Review
- Action : BLOQUER commit + invoquer Code Review

**Violation 5 : Tests oublies**
- Detection : > 50 lignes sans tests
- Action : BLOQUER commit + invoquer Test Engineer

**Violation 6 : Context non mis a jour**
- Detection : Tache finie, context pas update
- Action : BLOQUER commit + update context

**Violation 7 : Plan non valide**
- Detection : Implementation sans validation user
- Action : STOP implementation + demander validation

### Actions Correctives Immediates

**Si violation detectee :**
1. STOP ce que je fais IMMEDIATEMENT
2. Afficher message violation clair
3. Expliquer regle violee
4. Executer procedure correcte MAINTENANT
5. Ne PAS continuer sans correction

**Pas de "desolé" - Action directe**

---

## 📊 STATE PERSISTANT

**Fichier :** `.claude/state/last-action.json`

**Structure :**
```json
{
  "last_commit": "commit_sha",
  "timestamp": "2025-11-10T14:23:45Z",
  "lines_changed": 196,
  "checkpoints_completed": {
    "context_updated": true/false,
    "doc_maintainer_called": true/false,
    "code_review_done": true/false,
    "tests_validated": true/false,
    "orchestrator_validated": true/false
  },
  "agents_invoked": ["Agent1", "Agent2"],
  "files_modified": ["file1.py", "file2.ts"]
}
```

**Usage :**
- Mis a jour par Orchestrator apres validation
- Lu par Orchestrator avant commit
- Detection "false" = commit bloque

---

## 📚 PRINCIPES METHODOLOGIE

**Minimaliste + Incremental**
- Creer uniquement necessaire
- Developper incrementalement
- Documentation light (just-in-time)
- Agents specialises (economie contexte)

**Plan AVANT Implementation**
- Agent cree plan
- User VALIDE
- Implementation (checkpoint bloquant)

**Delegation Systematique**
- Domaine detecte → STOP → Invoquer
- Jamais analyser soi-meme
- Agents experts responsables

**Contexte Preserve**
- Sessions context_session_X.md
- Rapports livraison timestampes
- State persistant last-action.json

---

## 🚦 SUMMARY EXECUTION

### AVANT CHAQUE REPONSE

```
1. Lire demande user
2. Detecter domaine (Mobile/Docs/Tests/Commit)
3. SI domaine agent :
   - STOP analyse
   - Message delegation
   - Invoquer agent
4. SI commit demande :
   - STOP immediat
   - Lire CHECKPOINTS.md
   - Invoquer Orchestrator
5. SINON :
   - Repondre normalement
```

### APRES CHAQUE TACHE

```
1. Mettre a jour context_session_X.md
2. Invoquer Documentation Maintainer
3. Verifier rapports crees
4. Verifier TODO.md et CHANGELOG.md a jour
```

### AVANT CHAQUE COMMIT

```
1. Lire CHECKPOINTS.md
2. Calculer lines changees
3. Verifier seuils agents
4. Appeler agents manquants
5. Invoquer Orchestrator
6. Attendre autorisation
7. PUIS commit si autorise
```

---

## ⚡ REGLES D'OR

**REGLE 1 :** Domaine agent detecte → STOP → Invoquer IMMEDIATEMENT

**REGLE 2 :** Commit demande → Orchestrator OBLIGATOIRE

**REGLE 3 :** Plan cree → User VALIDE → Implementation

**REGLE 4 :** Tache finie → Context + Doc Maintainer

**REGLE 5 :** > 50 lignes → Tests OBLIGATOIRES

**AUCUNE EXCEPTION. AUCUN BYPASS. AUCUNE TOLERANCE.**

---

**Derniere mise a jour :** 2025-11-10
**Statut :** ENFORCEMENT ACTIF - PROCEDURES FORCEES
