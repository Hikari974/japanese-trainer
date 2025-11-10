# Epic & User Stories

Ce dossier contient les Epic et User Stories créés par l'**Epic Manager Agent**.

---

## Structure

### Format Hybride
- **Epic** : Fichier principal listant objectifs, contexte, User Stories
- **User Stories** : Fichiers détaillés individuels liés à leur Epic parent

### Numérotation
- **Epic :** `epic-XXX.md` (ex: `epic-001.md`, `epic-002.md`)
- **User Story :** `us-XXX-Y.md` (ex: `us-001-A.md`, `us-001-B.md`, `us-002-A.md`)

---

## Organisation

```
.claude/docs/epics/
├── README.md (ce fichier)
├── epic-001.md
├── us-001-A.md
├── us-001-B.md
├── us-001-C.md
├── epic-002.md
├── us-002-A.md
└── us-002-B.md
```

---

## Workflow

### 1. Créer un Epic
```bash
/epic
# OU
/epic Système de notification par email
```

L'Epic Manager Agent :
- Pose des questions de qualification
- Découpe la fonctionnalité en Epic(s) et User Stories
- Crée les fichiers Epic + User Stories

### 2. Éditer un Epic existant
```bash
/epic 002
```

### 3. Valider un Epic (écrire dans TODO.md)
```bash
/validepic 002
```

Crée dans TODO.md :
- 1 phase = Epic 002
- Tâches de la phase = User Stories de l'Epic

### 4. Planifier une User Story
```bash
/plan 002
```

Lit Epic 002, trouve première US non complétée, crée plan d'action détaillé.

---

## Templates

Templates disponibles dans `.claude/core/templates/` :
- `epic-template.md` : Structure Epic vide
- `user-story-template.md` : Structure User Story vide

---

## Principes

### Epic
- **Indépendant** : Chaque Epic est autonome (peut dépendre d'un autre Epic)
- **Métier** : Pas de détails techniques, focus sur la valeur business
- **Taille** : Recommandé 5-8 User Stories max par Epic

### User Story
- **Indépendante** : Peut être développée seule (peut dépendre d'une autre US)
- **Atomique** : La plus petite unité fonctionnelle possible
- **INVEST** : Independent, Negotiable, Valuable, Estimable, Small, Testable
- **Métier** : Format "En tant que... Je veux... Afin de..."

---

## Configuration

Configuration dans `.claude/core/rules/epic-config.yml` :
- Seuils (max US par Epic)
- Format numérotation
- Critères INVEST
- Templates de questions

---

## Notes

- Les Epic/US sont des **documents métier**, pas techniques
- Les plans d'implémentation technique sont créés séparément par les agents spécialisés
- Les Epic/US restent stables même si la techno change
