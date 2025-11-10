# AUTO CHECKS - Verifications Automatiques Obligatoires

**Version:** 1.0.0
**Type:** CHECKS SYSTEMATIQUES
**Frequence:** AVANT chaque reponse Claude

---

## PRINCIPE

**Claude Code DOIT executer ces checks AVANT chaque reponse.**
**Echec check = STOP + correction obligatoire.**

---

## CHECK 1 : DETECTION DOMAINE AGENT

**Avant repondre : Detecter si domaine agent dans demande user**

###Decision Tree

```
Demande user contient mots-cles Mobile/Expo/React Native/navigation ?
  → OUI : Domaine Mobile detecte
  → CHECK : Agents Mobile invoques ?
    → NON : VIOLATION - STOP - Invoquer Expo/Mobile UI Expert
    → OUI : OK continuer

Demande user contient "commit" / "commiter" / "git commit" ?
  → OUI : Commit detecte
  → CHECK : Orchestrator invoque ?
    → NON : VIOLATION - STOP - Invoquer Orchestrator
    → OUI : OK continuer

Demande user concerne README/TODO/CHANGELOG ?
  → OUI : Documentation detectee
  → CHECK : Documentation Maintainer invoque ?
    → NON : VIOLATION - STOP - Invoquer Doc Maintainer
    → OUI : OK continuer
```

### Mots-Cles Detection

**Mobile :**
- implement*, create*, add* + mobile/UI/component
- Expo, React Native, mobile
- iOS, Android, app mobile
- navigation, screen, gesture
- SDK, module natif, EAS Build
- Tamagui, UI components

**Commit :**
- commit, commiter, creer commit
- git commit, push
- "j'ai fini", "c'est pret"

**Documentation :**
- README, TODO, CHANGELOG
- mettre a jour doc*
- documentation

### Action si Detection

```
SI domaine agent detecte ET agent PAS invoque :
  1. STOP analyse immediatement
  2. Message : "⚠️ DELEGATION OBLIGATOIRE

     Domaine detecte : [Nom domaine]
     Agent requis : [Nom agent]

     Je dois invoquer cet agent AVANT de continuer.

     Invocation de [Agent] maintenant..."

  3. Invoquer agent (Task tool)
  4. NE PAS repondre directement
```

---

## CHECK 2 : COMMIT IMMINENCE

**Avant repondre : Detecter si commit imminent**

### Scenarios Commit Imminent

**Scenario 1 : User demande commit explicitement**
```
User : "commit les changements"
User : "creer un commit"
User : "git commit"

→ Commit IMMINENT
→ Action : Invoquer Orchestrator IMMEDIATEMENT
```

**Scenario 2 : Implementation terminee + user demande action finale**
```
Implementation finie
User : "c'est bon ?"
User : "on peut continuer ?"
User : "qu'est-ce qu'on fait maintenant ?"

→ Commit potentiel IMMINENT
→ Action : Rappeler checkpoints + Orchestrator obligatoire
```

**Scenario 3 : Fin de tache evidente**
```
Feature implementee completement
Tous fichiers modifies
Tests passes (si executes)

→ Commit PROBABLE
→ Action : Proactivement rappeler workflow commit
```

### Action si Commit Imminent

```
SI commit imminent detecte :
  1. STOP toute autre action
  2. Lire .claude/core/CHECKPOINTS.md
  3. Calculer git diff --shortstat HEAD
  4. Verifier seuils :
     - Lines > 100 ? Code Review necessaire ?
     - Lines > 50 ? Tests necessaires ?
     - Security modifie ? Code Review CRITIQUE ?
  5. Message : "🚫 COMMIT PROCEDURE OBLIGATOIRE

     Lines changees : [X]
     Seuils detectes : [Liste seuils]

     Agents requis avant commit :
     - [Agent 1] (si > 100 lignes)
     - [Agent 2] (si > 50 lignes)
     - Documentation Maintainer (obligatoire)
     - Orchestrator (obligatoire)

     Orchestrator obligatoire avant commit.

     Invocation de Orchestrator maintenant..."

  6. Invoquer Orchestrator (Task tool)
```

---

## CHECK 3 : CONTEXT SESSION

**Avant repondre : Verifier context session**

### Check Context Existe

```
Verifier : .claude/tasks/context_session_X.md existe ?

SI OUI :
  - LIRE completement
  - Extraire etat actuel
  - Comprendre contexte
  - Utiliser pour reponse

SI NON ET tache complexe :
  - Creer context_session_X.md
  - Initialiser avec info projet
  - Documenter etat initial
```

### Check Context A Jour

```
Apres CHAQUE tache completee :

  Verifier : context_session_X.md mis a jour ?

  SI NON :
    → VIOLATION
    → Message : "⚠️ CONTEXT SESSION NON MIS A JOUR

       Tache terminee mais context pas update.

       OBLIGATOIRE :
       1. Mettre a jour context_session_X.md
       2. Invoquer Documentation Maintainer

       Je corrige maintenant..."

    → Mettre a jour context
    → Invoquer Documentation Maintainer
```

---

## CHECK 4 : PLAN VALIDATION

**Avant implementer : Verifier validation plan**

### Check Plan Valide

```
SI agent a cree plan :

  CHECK : User a valide plan ?

  SI NON :
    → VIOLATION
    → Message : "⚠️ PLAN NON VALIDE

       Agent a cree plan mais pas encore valide par user.

       CHECKPOINT BLOQUANT :
       Je dois attendre validation user AVANT implementation.

       Valider plan maintenant ?"

    → Attendre reponse user
    → SI user dit OUI : Implementation
    → SI user dit NON : STOP
```

### Detection Implementation Sans Plan

```
SI implementation demandee :

  CHECK : Plan agent existe ?

  SI NON :
    → VIOLATION
    → Message : "⚠️ IMPLEMENTATION SANS PLAN

       Implementation demandee mais aucun plan agent.

       REGLE ABSOLUE : Plan AVANT implementation.

       Je dois invoquer [Agent] pour creer plan d'abord..."

    → Invoquer agent correspondant
    → Attendre plan
    → Demander validation
    → PUIS implementation
```

---

## CHECK 5 : SEUILS AGENTS

**Avant commit : Verifier seuils agents respectes**

### Calcul Lines Changees

```
Executer : git diff --shortstat HEAD

Extraire : X files changed, Y insertions(+), Z deletions(-)

Calculer total lines : Y + Z
```

### Verification Seuils

```
SI total lines > 100 :
  CHECK : Code Review Agent appele ?
  SI NON :
    → VIOLATION
    → BLOQUER commit
    → Message : "🚫 CODE REVIEW REQUIS

       Lines changees : [X] (> 100)
       Agent manquant : Code Review Agent

       OBLIGATOIRE avant commit.

       Invocation de Code Review Agent maintenant..."

    → Invoquer Code Review Agent

SI total lines > 50 :
  CHECK : Test Engineer Agent appele ?
  SI NON :
    → VIOLATION
    → BLOQUER commit
    → Message : "🚫 TESTS REQUIS

       Lines changees : [X] (> 50)
       Agent manquant : Test Engineer Agent

       OBLIGATOIRE avant commit.

       Invocation de Test Engineer Agent maintenant..."

    → Invoquer Test Engineer Agent
```

### Verification Security

```
Verifier files modifies contiennent mots-cles :
- auth*, login*, signin*, password*, token*
- security*, encrypt*, decrypt*, hash*
- permission*, role*, access*

SI OUI :
  CHECK : Code Review Agent appele avec flag SECURITY ?
  SI NON :
    → VIOLATION CRITIQUE
    → BLOQUER commit
    → Message : "🚨 CODE REVIEW CRITIQUE REQUIS

       Security/Auth modifie detecte
       Agent manquant : Code Review Agent

       OBLIGATOIRE CRITIQUE avant commit.

       Invocation de Code Review Agent maintenant..."

    → Invoquer Code Review Agent (mode CRITIQUE)
```

---

## CHECK 6 : DOCUMENTATION MAINTAINER

**Apres tache : Verifier Documentation Maintainer appele**

### Check Post-Tache

```
SI tache completee :

  CHECK : Documentation Maintainer appele ?

  SI NON :
    → VIOLATION
    → Message : "⚠️ DOCUMENTATION MAINTAINER REQUIS

       Tache terminee mais Documentation Maintainer pas appele.

       OBLIGATOIRE apres chaque tache :
       - Rapport delivery_XXX.md
       - TODO.md mis a jour
       - CHANGELOG.md mis a jour

       Invocation de Documentation Maintainer maintenant..."

    → Invoquer Documentation Maintainer

### Check Rapports Crees

```
Apres invocation Documentation Maintainer :

  CHECK : Rapport delivery_XXX.md cree ?

  SI NON :
    → Warning
    → Message : "⚠️ Verifier rapport delivery cree par Documentation Maintainer"
```

---

## CHECK 7 : ORCHESTRATOR PRE-COMMIT

**Avant commit : Verifier Orchestrator invoque**

### Check Orchestrator Obligatoire

```
SI commit demande :

  CHECK : Orchestrator invoque ?

  SI NON :
    → VIOLATION CRITIQUE
    → BLOQUER commit ABSOLUMENT
    → Message : "🚫 ORCHESTRATOR OBLIGATOIRE

       AUCUN commit sans Orchestrator.

       Orchestrator verifie checkpoints et autorise/bloque commit.

       Lecture CHECKPOINTS.md...

       Invocation de Orchestrator maintenant..."

    → Lire CHECKPOINTS.md
    → Invoquer Orchestrator
    → Attendre decision Orchestrator
    → SI autorise : Commit OK
    → SI bloque : STOP commit + lister manquants
```

### Check Orchestrator Decision

```
Apres invocation Orchestrator :

  Lire decision Orchestrator depuis rapport

  SI decision = "BLOQUER" :
    → COMMIT REFUSE
    → Message : "🚫 COMMIT BLOQUE PAR ORCHESTRATOR

       Checkpoints manquants :
       [Liste from Orchestrator]

       Actions requises :
       [Liste from Orchestrator]

       Commit refuse jusqu'a resolution."

    → NE PAS commiter

  SI decision = "AUTORISER" :
    → COMMIT AUTORISE
    → Message : "✅ COMMIT AUTORISE

       Orchestrator a valide tous checkpoints.

       Vous pouvez maintenant commiter."

    → Permettre commit
```

---

## CHECK 8 : INTERDICTIONS FILES

**Avant modifier fichiers : Verifier interdictions**

### Files Interdits Modification Directe

```
Files interdits :
- README.md
- TODO.md
- CHANGELOG.md

SI tentative modifier ces fichiers :

  CHECK : Documentation Maintainer invoque ?

  SI NON :
    → VIOLATION
    → BLOQUER modification
    → Message : "🚫 MODIFICATION INTERDITE

       Fichier : [nom fichier]
       Responsable : Documentation Maintainer

       INTERDICTION modifier README/TODO/CHANGELOG directement.

       Invocation de Documentation Maintainer maintenant..."

    → Invoquer Documentation Maintainer
    → Agent met a jour fichiers
```

---

## CHECKLIST PRE-REPONSE RAPIDE

**Avant CHAQUE reponse, verifier rapidement :**

```
[ ] Domaine agent detecte ? → Invoquer agent
[ ] Commit demande ? → Invoquer Orchestrator
[ ] Implementation sans plan ? → Creer plan d'abord
[ ] Tache finie ? → Context + Doc Maintainer
[ ] Modification docs ? → Doc Maintainer uniquement
[ ] > 100/50 lignes avant commit ? → Code Review / Tests
```

**Si UN SEUL echec : STOP + correction**

---

## AUTO-CORRECTION WORKFLOW

### Detection Violation

```
1. Check echoue
   ↓
2. Identifier violation type
   ↓
3. Afficher message violation clair
   ↓
4. Expliquer regle violee
   ↓
5. Executer action corrective IMMEDIATEMENT
   ↓
6. Verifier correction appliquee
   ↓
7. Continuer workflow normal
```

### Messages Standard

**Template Violation Detectee :**
```markdown
⚠️ VIOLATION DETECTEE - CHECK [N] ECHOUE

Type : [Nom violation]
Regle : [Regle violee]

CORRECTION OBLIGATOIRE :
[Action corrective]

J'execute correction maintenant...

[Tool call / action]
```

---

## FREQUENCE CHECKS

**Declencheurs checks obligatoires :**

- AVANT chaque reponse Claude
- AVANT chaque tool call
- APRES completion tache
- QUAND commit demande
- QUAND implementation suggeree
- QUAND plan agent cree
- QUAND fichiers modifies

**Aucune reponse sans checks**

---

## INTEGRATION WORKFLOW

### Workflow Standard avec Checks

```
1. User envoie message
   ↓
2. ✅ CHECK 1 : Domaine agent ?
   ↓
3. ✅ CHECK 2 : Commit imminent ?
   ↓
4. ✅ CHECK 3 : Context existe/a jour ?
   ↓
5. SI tous checks OK : Repondre normalement
   SI echec check : Correction immediate
   ↓
6. Apres reponse/action :
   ↓
7. ✅ CHECK 4 : Plan valide (si applicable) ?
   ↓
8. ✅ CHECK 5 : Seuils agents (si commit) ?
   ↓
9. ✅ CHECK 6 : Doc Maintainer (si tache finie) ?
   ↓
10. ✅ CHECK 7 : Orchestrator (si commit) ?
    ↓
11. ✅ CHECK 8 : Interdictions files ?
```

---

## EXEMPLES CHECKS EN ACTION

### Exemple 1 : Detection Domaine Mobile

```
User : "Ajoute un screen pour afficher la liste des mots"

AUTO CHECK 1 :
- Mots-cles detectes : "screen", "afficher" → Mobile
- Agent invoque ? NON
- ACTION : VIOLATION detectee

Message Claude :
"⚠️ DELEGATION OBLIGATOIRE

Domaine detecte : Mobile
Agent requis : Mobile UI Expert

Je dois invoquer Mobile UI Expert AVANT implementation.

Invocation de Mobile UI Expert maintenant..."

[Task tool → Mobile UI Expert]
```

### Exemple 2 : Detection Commit Imminent

```
User : "Commit les changements"

AUTO CHECK 2 :
- Mots-cles detectes : "commit"
- Orchestrator invoque ? NON
- ACTION : VIOLATION detectee

Message Claude :
"🚫 ORCHESTRATOR OBLIGATOIRE

Lecture CHECKPOINTS.md...

AVANT COMMIT :
1. Calculer lines changees : [calcul git diff]
2. Verifier seuils agents
3. Invoquer Orchestrator
4. Autorisation required

Invocation de Orchestrator maintenant..."

[Task tool → Orchestrator]
```

### Exemple 3 : Detection Modification Docs

```
User : "Mets a jour README avec les nouvelles features"

AUTO CHECK 8 :
- Fichier : README.md (interdit modification directe)
- Doc Maintainer invoque ? NON
- ACTION : VIOLATION detectee

Message Claude :
"🚫 MODIFICATION INTERDITE

Fichier : README.md
Responsable : Documentation Maintainer

Je dois invoquer Documentation Maintainer pour modifier docs.

Invocation de Documentation Maintainer maintenant..."

[Task tool → Documentation Maintainer]
```

---

## SUMMARY

**8 Checks Automatiques Obligatoires :**

1. **Domaine Agent** - Detection + delegation immediate
2. **Commit Imminent** - Orchestrator obligatoire
3. **Context Session** - Existe + a jour
4. **Plan Validation** - Valide avant implementation
5. **Seuils Agents** - Code Review (>100) + Tests (>50)
6. **Doc Maintainer** - Apres chaque tache
7. **Orchestrator** - Avant chaque commit
8. **Interdictions Files** - README/TODO/CHANGELOG

**Application :** AVANT chaque reponse Claude

**Echec check :** STOP immediat + correction obligatoire

**Objectif :** Garantir conformite 100% procedures

---

**Derniere mise a jour :** 2025-11-10
**Statut :** PRODUCTION READY - CHECKS ACTIFS
