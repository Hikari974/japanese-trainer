# ENFORCEMENT - Regles de Force Obligatoire

**Version:** 1.0.0
**Type:** COMPLIANCE STRICTE
**Application:** AUTOMATIQUE a chaque message Claude

---

## PRINCIPE FONDAMENTAL

**Claude Code DOIT suivre ces regles SANS EXCEPTION.**
**Chaque violation = STOP immediat + correction obligatoire.**

---

## DETECTION AUTOMATIQUE VIOLATIONS

### VIOLATION 1 : Implementation sans Agent

**Detection:**
- User demande implementation Backend/Frontend/Database/Mobile
- Claude repond directement SANS invoquer agent correspondant

**Signes:**
- "Je vais implementer..."
- "Voici le code pour..."
- "Ajoutons..." (sans mention agent)

**CORRECTION OBLIGATOIRE:**
```
STOP IMMEDIAT.

VIOLATION DETECTEE : Implementation sans delegation agent.

Domaine detecte : [Backend/Frontend/Database/Mobile]
Agent requis : [Nom Agent]

Je dois TOUJOURS invoquer l'agent AVANT toute implementation.

PROCEDURE CORRECTE :
1. STOP analyse
2. Invoquer [Agent] immediatement
3. Agent cree plan
4. User valide plan
5. Implementation

Voulez-vous que j'invoque [Agent] maintenant ?
```

### VIOLATION 2 : Commit sans Orchestrator

**Detection:**
- User demande "commit"
- Claude execute git commit SANS appeler Orchestrator

**Signes:**
- git commit directement
- "Je commite..."
- Aucune mention Orchestrator

**CORRECTION OBLIGATOIRE:**
```
STOP IMMEDIAT.

VIOLATION DETECTEE : Commit sans validation Orchestrator.

REGLE ABSOLUE : AUCUN commit sans Orchestrator.

Lire : .claude/core/CHECKPOINTS.md
Lire : .claude/state/last-action.json

PROCEDURE CORRECTE :
1. Invoquer Orchestrator Agent
2. Orchestrator verifie checkpoints
3. SI "false" : BLOQUER commit + lister manquants
4. SI "true" : Autoriser commit

Voulez-vous que j'invoque Orchestrator maintenant ?
```

### VIOLATION 3 : Modification Documentation sans Agent

**Detection:**
- Claude modifie README.md, TODO.md, CHANGELOG.md
- SANS appeler Documentation Maintainer

**Signes:**
- Edit/Write sur README/TODO/CHANGELOG
- "Je mets a jour la doc..."
- Pas de rapport delivery cree

**CORRECTION OBLIGATOIRE:**
```
STOP IMMEDIAT.

VIOLATION DETECTEE : Modification documentation sans Documentation Maintainer.

Fichiers interdits modification directe :
- README.md
- TODO.md
- CHANGELOG.md

Agent responsable : Documentation Maintainer

PROCEDURE CORRECTE :
1. Invoquer Documentation Maintainer
2. Fournir context + changements
3. Agent cree rapport delivery_XXX.md
4. Agent met a jour docs

Voulez-vous que j'invoque Documentation Maintainer maintenant ?
```

### VIOLATION 4 : Code Review oublie

**Detection:**
- Feature > 100 lignes implementee
- OU security/auth modifie
- SANS appel Code Review Agent

**Signes:**
- Commit imminent
- Aucune mention Code Review
- Pas de rapport review_XXX.md

**CORRECTION OBLIGATOIRE:**
```
STOP IMMEDIAT.

VIOLATION DETECTEE : Code Review requis mais non fait.

Seuil depasse : [> 100 lignes / security modifie]
Lines changees : [X]

REGLE : > 100 lignes OU security = Code Review OBLIGATOIRE

PROCEDURE CORRECTE :
1. Invoquer Code Review Agent
2. Agent analyse code
3. Agent cree rapport review_XXX.md
4. Resoudre issues critiques
5. PUIS appeler Orchestrator

Voulez-vous que j'invoque Code Review Agent maintenant ?
```

### VIOLATION 5 : Tests oublies

**Detection:**
- Feature > 50 lignes implementee
- SANS appel Test Engineer Agent
- OU tests non executes

**Signes:**
- Commit imminent
- Aucune mention tests
- Couverture non verifiee

**CORRECTION OBLIGATOIRE:**
```
STOP IMMEDIAT.

VIOLATION DETECTEE : Tests requis mais non faits.

Seuil depasse : > 50 lignes
Lines changees : [X]

REGLE : > 50 lignes = Tests OBLIGATOIRES

PROCEDURE CORRECTE :
1. Invoquer Test Engineer Agent
2. Agent cree/execute tests
3. Verifier couverture >= 80%
4. Verifier tous tests passent
5. PUIS appeler Orchestrator

Voulez-vous que j'invoque Test Engineer Agent maintenant ?
```

### VIOLATION 6 : Context Session non mis a jour

**Detection:**
- Tache completee
- context_session_X.md pas mis a jour

**Signes:**
- Fin implementation
- Pas de mention context update
- Documentation Maintainer non appele

**CORRECTION OBLIGATOIRE:**
```
STOP IMMEDIAT.

VIOLATION DETECTEE : Context session non mis a jour.

Fichier : .claude/tasks/context_session_X.md

REGLE : APRES chaque tache, mettre a jour context.

PROCEDURE CORRECTE :
1. Mettre a jour context_session_X.md
2. Documenter changements, decisions, etat
3. Appeler Documentation Maintainer
4. Verifier TODO.md et CHANGELOG.md mis a jour

Voulez-vous que je mette a jour le context maintenant ?
```

### VIOLATION 7 : Plan non valide par User

**Detection:**
- Agent cree plan
- Claude implemente SANS attendre validation user

**Signes:**
- Plan propose
- Implementation immediate
- Pas de "Valider plan ?" demande

**CORRECTION OBLIGATOIRE:**
```
STOP IMMEDIAT.

VIOLATION DETECTEE : Implementation sans validation plan user.

REGLE ABSOLUE : Plan AVANT implementation (checkpoint bloquant)

PROCEDURE CORRECTE :
1. Agent cree plan
2. Claude lit plan
3. Claude demande : "Valider plan ?"
4. User repond OUI
5. PUIS implementation

Je dois TOUJOURS attendre validation user.

Voulez-vous valider le plan maintenant ?
```

---

## CHECKS AUTOMATIQUES PRE-ACTION

### AVANT TOUTE REPONSE

**Check 1 : Domaine Agent Detecte ?**
```
SI domaine Backend/Frontend/Database/Mobile detecte :
  SI agent PAS ENCORE invoque :
    → STOP
    → Invoquer agent correspondant
    → NE PAS repondre directement
```

**Check 2 : Commit Demande ?**
```
SI user demande "commit" :
  SI Orchestrator PAS invoque :
    → STOP
    → Lire CHECKPOINTS.md
    → Invoquer Orchestrator
    → NE PAS commiter directement
```

**Check 3 : Modification Docs ?**
```
SI modification README/TODO/CHANGELOG :
  SI Documentation Maintainer PAS invoque :
    → STOP
    → Invoquer Documentation Maintainer
    → NE PAS modifier directement
```

### AVANT COMMIT

**Pre-Commit Checklist FORCEE :**
```
[ ] context_session_X.md mis a jour ?
[ ] Lines changees calculees (git diff --shortstat) ?
[ ] > 100 lignes ? → Code Review fait ?
[ ] > 50 lignes ? → Tests faits ?
[ ] Documentation Maintainer appele ?
[ ] Orchestrator invoque ?
[ ] Orchestrator a autorise (checkpoints "true") ?

SI UN SEUL "NON" : BLOQUER commit
```

---

## MESSAGES ENFORCEMENT STANDARD

### Template Violation Generique

```markdown
⛔ VIOLATION PROCEDURE DETECTEE

Type: [Nom violation]
Regle: [Regle violee]

PROCEDURE CORRECTE :
1. [Etape 1]
2. [Etape 2]
3. [Etape 3]

Je corrige maintenant.

[Action corrective immediate]
```

### Template Rappel Agent

```markdown
🔄 DELEGATION OBLIGATOIRE

Domaine detecte: [Backend/Frontend/Database/Mobile]
Agent requis: [Nom Agent]

Je dois invoquer cet agent AVANT de continuer.

Invocation de [Agent]...

[Tool call vers agent]
```

### Template Blocage Commit

```markdown
🚫 COMMIT BLOQUE

Raison: [Checkpoints manquants]

Checkpoints requis:
- [ ] [Checkpoint 1]
- [ ] [Checkpoint 2]

Actions requises:
1. [Action 1]
2. [Action 2]

Commit refuse jusqu'a resolution.
```

---

## WORKFLOW FORCE STRICT

### Workflow Implementation

```
User demande implementation
  ↓
DETECTION : Domaine agent ?
  ↓
SI OUI :
  → STOP analyse
  → Message : "Delegation obligatoire a [Agent]"
  → Invoquer agent
  → Agent cree plan
  → Demander validation user
  → Attendre reponse user
  → SI valide : Implementation
  → SI refuse : STOP
```

### Workflow Commit

```
User demande commit
  ↓
DETECTION : Commit demande ?
  ↓
OBLIGATOIRE :
  → Lire .claude/core/CHECKPOINTS.md
  → Calculer lines changees
  → Verifier seuils (> 100? > 50?)
  → Lister agents manquants si non appeles
  → Message : "Orchestrator obligatoire"
  → Invoquer Orchestrator
  → Orchestrator valide checkpoints
  → SI "false" : BLOQUER + lister manquants
  → SI "true" : AUTORISER commit
```

### Workflow Documentation

```
Tache terminee
  ↓
OBLIGATOIRE :
  → Mettre a jour context_session_X.md
  → Message : "Documentation Maintainer obligatoire"
  → Invoquer Documentation Maintainer
  → Agent cree rapport delivery_XXX.md
  → Agent met a jour TODO.md, CHANGELOG.md
  → Verifier rapport cree
```

---

## REGLES ABSOLUES (JAMAIS EXCEPTIONS)

### REGLE 1 : Delegation Immediate
```
Domaine agent detecte → STOP analyse → Invoquer IMMEDIATEMENT

Aucune tentative implementation directe.
Aucune suggestion code sans plan agent.
Aucune analyse best practices sans agent.
```

### REGLE 2 : Orchestrator Bloquant
```
Commit demande → Orchestrator OBLIGATOIRE

Aucun commit sans Orchestrator.
Aucune exception (meme petits commits).
Aucun bypass possible.
```

### REGLE 3 : Plan Avant Code
```
Agent cree plan → User VALIDE → Implementation

Jamais implementation sans validation.
Jamais "je suppose que c'est OK".
Toujours attendre confirmation explicite.
```

### REGLE 4 : Context Preserve
```
Tache terminee → Context mis a jour → Doc Maintainer

Jamais oublier context update.
Jamais commit sans context a jour.
Toujours documenter changements.
```

### REGLE 5 : Tests Non Optionnels
```
> 50 lignes → Tests OBLIGATOIRES

Pas de "tests suggeres".
Pas de "pensez a tester".
Appel Test Engineer Agent direct.
```

---

## AUTO-CORRECTION IMMEDIATE

### Si Violation Detectee

**Action immediate :**
1. STOP ce que je fais
2. Afficher message violation
3. Expliquer regle violee
4. Proposer procedure correcte
5. Executer correction MAINTENANT

**Pas de :**
- "Je vais faire attention la prochaine fois"
- "Desolé j'ai oublie"
- Continuer comme si de rien etait

**Oui a :**
- Correction immediate
- Message clair violation
- Execution procedure correcte

---

## DETECTION PATTERNS

### Patterns Violations Communes

**Pattern 1 : "Je vais..."**
```
"Je vais implementer X"
"Je vais creer Y"
"Je vais modifier Z"

→ RED FLAG : Implementation directe probable
→ CHECK : Agent invoque avant ?
→ SI NON : VIOLATION 1
```

**Pattern 2 : "Voici le code..."**
```
"Voici le code pour X"
"Voici l'implementation de Y"

→ RED FLAG : Code fourni sans plan agent
→ CHECK : Plan agent valide avant ?
→ SI NON : VIOLATION 7
```

**Pattern 3 : "Je commite..."**
```
"Je commite les changements"
"Je cree le commit"
"git commit -m"

→ RED FLAG : Commit sans checkpoints
→ CHECK : Orchestrator invoque ?
→ SI NON : VIOLATION 2
```

**Pattern 4 : "Je mets a jour README..."**
```
"Je mets a jour README"
"Je modifie TODO.md"
"J'ajoute dans CHANGELOG"

→ RED FLAG : Docs modifies directement
→ CHECK : Doc Maintainer invoque ?
→ SI NON : VIOLATION 3
```

---

## COMPLIANCE VERIFICATION

### Checklist Post-Action

Apres CHAQUE action Claude, verifier :

```
[ ] Si implementation : Agent invoque ?
[ ] Si commit : Orchestrator invoque ?
[ ] Si docs : Doc Maintainer invoque ?
[ ] Si plan : User validation attendue ?
[ ] Si tache finie : Context mis a jour ?
```

### Frequence Verification

**Declencheurs verification :**
- Avant chaque reponse Claude
- Avant chaque tool call
- Apres completion tache
- Quand commit demande
- Quand implementation suggeree

---

## EXEMPLES ENFORCEMENT

### Exemple 1 : Catch Implementation Directe

```
User: "Ajoute une fonction pour calculer la moyenne"

❌ MAUVAIS (violation) :
Claude: "Voici la fonction :
def calculate_average(numbers):
    return sum(numbers) / len(numbers)
"

✅ BON (enforcement) :
Claude: "Delegation obligatoire detectee.

Domaine : Backend (Python)
Agent requis : Backend Expert

Je dois invoquer Backend Expert pour creer plan AVANT implementation.

Invocation de Backend Expert maintenant...

[Tool call Task avec Backend Expert]
"
```

### Exemple 2 : Catch Commit Direct

```
User: "Commit les changements"

❌ MAUVAIS (violation) :
Claude: "Je commite maintenant :
git add .
git commit -m 'Add feature'
"

✅ BON (enforcement) :
Claude: "STOP - Orchestrator obligatoire avant commit.

Lire : .claude/core/CHECKPOINTS.md

PROCEDURE :
1. Verifier checkpoints
2. Invoquer Orchestrator
3. Orchestrator valide
4. Commit autorise si "true"

Invocation de Orchestrator maintenant...

[Tool call Task avec Orchestrator]
"
```

### Exemple 3 : Catch Docs Modification

```
User: "Mets a jour README avec les nouvelles features"

❌ MAUVAIS (violation) :
Claude: "Je mets a jour README.md :
[Edit tool sur README.md]
"

✅ BON (enforcement) :
Claude: "Delegation obligatoire detectee.

Fichier : README.md (documentation)
Agent requis : Documentation Maintainer

Je dois invoquer Documentation Maintainer AVANT modifier docs.

Invocation de Documentation Maintainer maintenant...

[Tool call Task avec Documentation Maintainer]
"
```

---

## INTEGRATION CLAUDE.md

**CLAUDE.md DOIT referencer ce fichier :**

```markdown
## ENFORCEMENT

**LIRE OBLIGATOIRE :** `.claude/core/ENFORCEMENT.md`

Regles de force appliquees automatiquement.
Violations detectees = correction immediate.
Aucune exception autorisee.
```

---

## SUMMARY

**3 Principes Enforcement :**

1. **DETECTION** : Violations detectees automatiquement
2. **STOP** : Action immediate si violation
3. **CORRECTION** : Procedure correcte executee maintenant

**Objectif :** Forcer Claude Code a suivre procedures SANS EXCEPTION.

**Methode :** Checks automatiques + messages enforcement + workflow force.

**Resultat :** Conformite 100% aux procedures definies.

---

**Derniere mise a jour :** 2025-11-10
**Statut :** PRODUCTION READY - FORCE APPLICATION
