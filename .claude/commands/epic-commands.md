# Commandes Epic Manager

**Agent :** Epic Manager Agent (`.claude/core/agents/epic-manager.md`)
**Description :** Gestion des Epic et User Stories métier

---

## /epic [numero] [description]

**Description :** Créer un nouvel Epic OU éditer un Epic existant.

### Utilisation

#### Créer nouvel Epic (auto-numérotation)
```
/epic
```
Lance qualification interactive, Epic Manager pose questions, découpe en US.

#### Créer nouvel Epic avec description initiale
```
/epic Système de notification par email pour les utilisateurs
```
Fournit contexte initial, Epic Manager pose questions complémentaires.

#### Éditer Epic existant
```
/epic 003
```
Charge Epic 003, permet modifications (ajouter/modifier/supprimer US).

### Workflow

1. **Détection :** Epic Manager détecte si numero fourni (édition) ou non (création)
2. **Numérotation :** Si création, auto-incrémente dernier numero Epic
3. **Qualification :** Pose 10-15 questions par blocs (contexte, scope, users, data, etc.)
4. **Découpage :** Crée Epic + User Stories (5-8 US recommandé)
5. **Validation :** Présente plan au user pour validation
6. **Création :** Si validé, crée fichiers `epic-XXX.md` + `us-XXX-A.md`, etc.

### Exemples

```bash
# Créer Epic avec description
/epic Gestion des utilisateurs avec rôles et permissions

# Créer Epic sans description (questions uniquement)
/epic

# Éditer Epic 005
/epic 005
```

---

## /validepic <numero>

**Description :** Valide un Epic et l'écrit dans TODO.md comme phase avec User Stories en tâches.

### Utilisation

```
/validepic 003
```

### Workflow

1. **Lecture :** Charge Epic XXX et vérifie qu'il est complet
2. **Validation :** Vérifie au moins 1 US, objectif défini, critères succès présents
3. **Parsing :** Extrait liste User Stories de l'Epic
4. **TODO.md :** Crée structure phase + tâches :
   ```markdown
   ## Phase: Epic 003 - Système Notification Email
   - [ ] US 003-A - Configuration SMTP Admin
   - [ ] US 003-B - Gestion Consentement User
   - [ ] US 003-C - Templates Email Personnalisables
   ```
5. **Délégation :** Invoque Documentation Maintainer pour écriture TODO.md
6. **Status :** Met à jour status Epic : "À planifier" → "En cours"

### Prérequis

- Epic XXX doit exister (fichier `epic-XXX.md`)
- Epic doit contenir au moins 1 User Story
- User Stories doivent être créées (fichiers `us-XXX-Y.md`)

### Exemples

```bash
# Valider Epic 002
/validepic 002

# Valider Epic 010
/validepic 010
```

---

## /plan <numero-epic>

**Description :** Planifie la prochaine User Story non terminée d'un Epic (crée plan technique via agents spécialisés).

### Utilisation

```
/plan 003
```

### Workflow

1. **Lecture Epic :** Charge Epic XXX
2. **Lecture TODO.md :** Identifie tâches Epic XXX
3. **Détection US :** Trouve première US non cochée `[ ]`
4. **Lecture US :** Charge fichier `us-XXX-Y.md`
5. **Analyse :** Vérifie critères acceptation, points d'attention, dépendances, questions
6. **Alertes :** Si questions critiques en suspens, alerte user
7. **Délégation technique :**
   - Backend → Backend Expert
   - Frontend → Frontend Expert
   - Database → Database Expert
   - Multiple domaines → Tous agents concernés
8. **Plan technique :** Crée `plan_us_XXX_Y.md` dans `.claude/docs/`
9. **Présentation :** Résume plan technique au user
10. **Status :** Met à jour status US : "À faire" → "En cours"

### Cas Spéciaux

**Si toutes US terminées :**
```
Toutes les User Stories de Epic 003 sont complétées ✅
Epic 003 peut être marqué comme "Terminé"
```

**Si questions critiques en suspens :**
```
⚠️ Questions critiques à résoudre avant implémentation :
1. Quel fournisseur SMTP utiliser ? (Impact: Bloquant)
2. Quelle librairie d'encryption ? (Impact: Bloquant)

Continuer quand même ? (non recommandé)
```

### Exemples

```bash
# Planifier prochaine US de Epic 002
/plan 002

# Planifier prochaine US de Epic 007
/plan 007
```

---

## Workflow Complet Recommandé

```mermaid
/epic
  ↓
Epic Manager pose questions
  ↓
User répond (accepte "Je ne sais pas")
  ↓
Epic Manager crée plan Epic + US
  ↓
User valide plan
  ↓
Epic Manager crée fichiers epic-XXX.md + us-XXX-*.md
  ↓
/validepic XXX
  ↓
Epic ajouté au TODO.md comme phase
  ↓
/plan XXX
  ↓
Plan technique US créé par agents spécialisés
  ↓
Implémentation US
  ↓
Cocher [ ] US dans TODO.md
  ↓
/plan XXX (US suivante)
  ↓
... Répéter jusqu'à Epic terminé
```

---

## Fichiers Créés

### Par /epic
- `.claude/docs/epics/epic-XXX.md`
- `.claude/docs/epics/us-XXX-A.md`
- `.claude/docs/epics/us-XXX-B.md`
- `.claude/docs/epics/us-XXX-C.md`
- etc.

### Par /plan
- `.claude/docs/plan_us_XXX_Y.md` (plan technique détaillé)

### Par /validepic
- Modification de `TODO.md` (ajout phase + tâches)

---

## Configuration

Configuration dans `.claude/core/rules/epic-config.yml` :
- Seuils max US par Epic
- Format numérotation
- Critères INVEST
- Templates questions qualification

---

## Notes

- **Epic et US sont documents MÉTIER** (pas de détails techniques)
- Plans techniques sont créés séparément par agents spécialisés
- User peut répondre "Je ne sais pas" (noté dans Epic, pas bloquant si non-critique)
- Numérotation automatique (jamais demander numéro au user)
- Format Hybride : Epic liste US + fichiers US détaillés

---

## Aide

Pour plus d'informations sur Epic Manager Agent :
```
Lire .claude/core/agents/epic-manager.md
```

Pour voir Epic existants :
```
Lire .claude/docs/epics/README.md
```
