# Epic-009: Option Furigana dans Settings

**Statut:** BACKLOG
**Priorite:** P2 (Quality of Life Feature)
**Effort Total Estime:** 1-2 jours
**Date Creation:** 2026-01-03
**Derniere MAJ:** 2026-01-03

---

## Objectif

Ajouter un toggle dans les parametres permettant a l'utilisateur de choisir si les furigana sont affiches par defaut pendant les sessions d'entrainement.

**Comportement :**
- L'utilisateur peut activer/desactiver l'affichage des furigana par defaut
- Ce reglage est applique automatiquement au debut de chaque session d'entrainement
- L'utilisateur peut toujours changer l'affichage pendant la session (si cette fonctionnalite existe)

---

## Contexte Technique

### Etat Actuel
- Composant `Furigana.tsx` existe deja et supporte la prop `showFurigana`
- Systeme de preferences existant avec AsyncStorage (`app/services/preferences.ts`)
- Hook `usePreferences` pour acceder aux preferences
- Settings screen avec pattern de toggle/slider deja etabli
- Interface bilingue FR/EN

### Architecture Existante
```typescript
// app/services/preferences.ts
interface UserPreferences {
  lastLevel: Level | null;
  lastDifficulty: Difficulty;
  wordsPerSession: number;
  translationLanguage: 'fr' | 'en';
}

// app/components/Furigana.tsx
interface FuriganaProps {
  kanji: string;
  kana: string;
  showFurigana?: boolean;  // <- Prop existante
  fontSize?: number;
}
```

### Changement Simple
- Ajout d'un champ `showFuriganaByDefault: boolean` dans `UserPreferences`
- Ajout d'un toggle dans Settings
- Lecture de la preference dans l'ecran d'entrainement

---

## User Stories

### US-009.1: Extension UserPreferences avec showFuriganaByDefault (S)
**Estimation:** 0.5 jour

**Description:**
Etendre l'interface `UserPreferences` pour inclure le nouveau champ de preference furigana.

**Taches:**
- Ajouter `showFuriganaByDefault: boolean` (default: `true`)
- Mettre a jour `DEFAULT_PREFERENCES` dans `preferences.ts`
- Assurer migration transparente (users existants gardent `true` par defaut)
- Mettre a jour la logique de validation dans `loadPreferences()`

**Fichiers a modifier:**
- `app/services/preferences.ts`

**Criteres d'acceptation:**
- [ ] Interface `UserPreferences` inclut `showFuriganaByDefault`
- [ ] Valeur par defaut = `true`
- [ ] Migration transparente pour users existants
- [ ] Aucune regression sur autres preferences

---

### US-009.2: UI Settings - Toggle furigana avec labels bilingues (S)
**Estimation:** 0.5 jour

**Description:**
Ajouter une section dans Settings pour permettre a l'utilisateur de configurer l'affichage des furigana.

**Taches:**
- Creer section "Affichage / Display" dans Settings (si n'existe pas)
- Ajouter toggle pour furigana avec labels bilingues
- Style coherent avec autres toggles/options existantes
- Sauvegarder preference via `updatePreferences()`

**Labels bilingues:**
- FR: "Afficher les furigana par defaut"
- EN: "Show furigana by default"
- Description FR: "Affiche la lecture kana au-dessus des kanji pendant l'entrainement"
- Description EN: "Displays kana reading above kanji during training"

**Fichiers a modifier:**
- `app/settings.tsx`

**Criteres d'acceptation:**
- [ ] Toggle visible dans Settings
- [ ] Labels bilingues (FR/EN)
- [ ] Etat toggle reflete preference actuelle
- [ ] Changement sauvegarde immediatement
- [ ] Style coherent avec UI existante

---

### US-009.3: Integration training.tsx - Appliquer preference furigana (M)
**Estimation:** 0.5-1 jour

**Description:**
Lire la preference furigana au lancement de l'entrainement et l'appliquer au composant Furigana.

**Taches:**
- Identifier ou le composant `Furigana` est utilise dans le flow training
- Lire `showFuriganaByDefault` depuis les preferences au demarrage session
- Passer la valeur comme prop `showFurigana` au composant
- (Optionnel) Permettre toggle runtime pendant session

**Fichiers a modifier:**
- `app/training.tsx` (ou equivalent)
- Tout composant utilisant `Furigana.tsx`

**Criteres d'acceptation:**
- [ ] Preference lue au debut de session
- [ ] Furigana affiche/masque selon preference
- [ ] Comportement coherent pendant toute la session
- [ ] Aucune regression sur flow training existant

---

### US-009.4: Tests unitaires (S)
**Estimation:** 0.25 jour

**Description:**
Ecrire tests pour valider le comportement de la nouvelle preference.

**Taches:**
- Test unitaire `preferences.ts`: valeur par defaut
- Test unitaire `preferences.ts`: migration transparente
- Test unitaire `preferences.ts`: save/load preference
- (Optionnel) Test integration Settings UI

**Criteres d'acceptation:**
- [ ] Tests couvrent cas nominal
- [ ] Tests couvrent migration users existants
- [ ] Tests passent

---

## Dependances Techniques

### Aucun Nouveau Package
Cette feature utilise uniquement les technologies deja presentes dans le projet.

### Fichiers a Modifier
```
app/services/preferences.ts      # Ajouter showFuriganaByDefault
app/settings.tsx                 # Ajouter toggle UI
app/training.tsx                 # Appliquer preference (ou fichier equivalent)
```

### Fichiers Existants Utilises
```
app/components/Furigana.tsx      # Composant existant (pas de modif)
app/hooks/usePreferences.ts      # Hook existant (pas de modif)
```

---

## Architecture Technique

### Nouvelles Preferences
```typescript
interface UserPreferences {
  // Existant
  lastLevel: Level | null;
  lastDifficulty: Difficulty;
  wordsPerSession: number;
  translationLanguage: 'fr' | 'en';

  // Nouveau
  showFuriganaByDefault: boolean;  // default: true
}
```

### Modification preferences.ts
```typescript
const DEFAULT_PREFERENCES: UserPreferences = {
  lastLevel: null,
  lastDifficulty: 'Normal',
  wordsPerSession: 10,
  translationLanguage: 'fr',
  showFuriganaByDefault: true,  // <- Nouveau
};

// Dans loadPreferences():
return {
  lastLevel: parsed.lastLevel ?? DEFAULT_PREFERENCES.lastLevel,
  lastDifficulty: parsed.lastDifficulty ?? DEFAULT_PREFERENCES.lastDifficulty,
  wordsPerSession: parsed.wordsPerSession ?? DEFAULT_PREFERENCES.wordsPerSession,
  translationLanguage: parsed.translationLanguage ?? DEFAULT_PREFERENCES.translationLanguage,
  showFuriganaByDefault: parsed.showFuriganaByDefault ?? DEFAULT_PREFERENCES.showFuriganaByDefault,
};
```

### Usage dans Training
```typescript
// Dans training.tsx ou composant parent
const { preferences } = usePreferences();

// Passer au composant Furigana
<Furigana
  kanji={word.kanji}
  kana={word.kana}
  showFurigana={preferences?.showFuriganaByDefault ?? true}
  fontSize={32}
/>
```

---

## Contraintes & Risques

### Contraintes
1. **Retro-compatibilite** - Users existants doivent garder furigana actifs
2. **UX coherente** - Toggle doit suivre pattern existant Settings

### Risques
| Risque | Impact | Mitigation |
|--------|--------|------------|
| Migration preferences echoue | Faible | Fallback sur `true` par defaut |
| Toggle non visible | Faible | Tests visuels avant merge |
| Preference non appliquee training | Moyen | Tests integration |

---

## Criteres d'Acceptation Epic

### Fonctionnel
- [ ] Toggle furigana dans Settings
- [ ] Labels bilingues (FR/EN)
- [ ] Preference sauvegardee et persistee
- [ ] Preference appliquee en entrainement
- [ ] Valeur par defaut = ON (furigana affiches)

### Technique
- [ ] Interface `UserPreferences` etendue
- [ ] Migration transparente users existants
- [ ] Tests unitaires passes
- [ ] Aucune regression features existantes

### UX
- [ ] UI coherente avec Settings existant
- [ ] Toggle intuitif et clair
- [ ] Feedback visuel immediat

---

## 🔧 Actions Hors Code (Aide Externe)

Cette feature est entierement implementable en code, sans actions externes requises.

### Checklist Pre-Implementation

#### Verification Composant Furigana
- [ ] **Confirmer que `Furigana.tsx` existe** dans `app/components/`
- [ ] **Verifier la prop `showFurigana`** est bien supportee
- [ ] **Identifier les usages** de Furigana dans le code:
  ```bash
  # Chercher tous les usages de Furigana
  grep -r "Furigana" app/ --include="*.tsx"
  ```

#### Verification Settings.tsx
- [ ] **Confirmer structure sections** dans Settings
- [ ] **Identifier pattern toggle** utilise (Button, Switch, etc.)
- [ ] **Verifier hook `usePreferences`** est importe

#### Verification Training Flow
- [ ] **Identifier fichier training** (training.tsx, (tabs)/training.tsx, etc.)
- [ ] **Trouver ou Furigana est rendu** dans le flow
- [ ] **Confirmer acces aux preferences** dans ce composant

### Checklist Tests Manuels

#### Test 1: Toggle Settings
1. Ouvrir Settings
2. Trouver section Affichage/Display
3. Toggle ON -> Verifier sauvegarde
4. Toggle OFF -> Verifier sauvegarde
5. Fermer/rouvrir Settings -> Verifier persistence

#### Test 2: Application Training
1. Settings: Toggle OFF
2. Lancer entrainement
3. Verifier furigana NON affiches
4. Settings: Toggle ON
5. Lancer nouvelle session
6. Verifier furigana affiches

#### Test 3: Migration User Existant
1. Clear AsyncStorage (simuler nouvel user)
2. Ouvrir app
3. Verifier furigana ON par defaut
4. Ouvrir Settings
5. Verifier toggle est ON

### Notes Implementation

1. **Pattern a suivre**: Copier le pattern du toggle langue dans Settings
2. **Placement UI suggere**: Dans section "Entrainement" ou nouvelle section "Affichage"
3. **Couleur toggle**: Utiliser `$difficultyEasy` (vert) comme les autres options
4. **Pas de confirmation**: Changement immediat comme les autres toggles

---

## Ordre d'Implementation Recommande

1. **US-009.1** - Extension preferences (prerequis)
2. **US-009.2** - UI Settings toggle
3. **US-009.3** - Integration training
4. **US-009.4** - Tests unitaires

---

## Commandes Utiles

```bash
# Chercher usages Furigana
grep -r "Furigana" app/ --include="*.tsx"

# Chercher structure preferences
cat app/services/preferences.ts

# Lancer app pour tester
npx expo start
```

---

## References

- Fichiers existants:
  - `app/components/Furigana.tsx` - Composant existant
  - `app/services/preferences.ts` - Pattern service preferences
  - `app/settings.tsx` - Pattern UI settings
  - `app/hooks/usePreferences.ts` - Pattern hook

---

**Epic Owner:** A definir
**Reviewers:** Code Review Agent + Test Engineer Agent