# Plan d'Implémentation: US-006.6 - Feedback Visuel Déblocage Niveau

**Epic:** Epic-006 - Système de Progression et Déblocage Séquentiel
**User Story:** US-006.6
**Priorité:** P2 (Nice-to-have)
**Effort Estimé:** S (2-3 heures)
**Date:** 2025-11-15

---

## Vue d'Ensemble

### Objectif
Implémenter un feedback visuel immédiat et gratifiant lors du déblocage automatique d'un nouveau niveau JLPT, afin de célébrer la progression de l'utilisateur et maintenir sa motivation.

### User Story
> **En tant qu'** utilisateur ayant maîtrisé un niveau
> **Je veux** recevoir un feedback visuel immédiat et gratifiant lors du déblocage d'un nouveau niveau
> **Afin de** ressentir ma progression et rester motivé

---

## Analyse Technique

### État Actuel du Projet

**Système de Déblocage (US-006.3) ✅ DÉJÀ IMPLÉMENTÉ:**
```typescript
// app/services/statistics.ts (lignes 21-23)
type UnlockCallback = (event: LevelUnlockEvent) => void;
let unlockCallbacks: UnlockCallback[] = [];

// Méthode registerUnlockCallback() disponible
export function registerUnlockCallback(callback: UnlockCallback): () => void {
  unlockCallbacks.push(callback);
  return () => {
    unlockCallbacks = unlockCallbacks.filter(cb => cb !== callback);
  };
}

// Événement émit automatiquement lors unlock
function emitLevelUnlocked(event: LevelUnlockEvent): void {
  unlockCallbacks.forEach(callback => {
    try {
      callback(event);
    } catch (error) {
      console.error('Error in unlock callback:', error);
    }
  });
}
```

**Interface LevelUnlockEvent:**
```typescript
// app/types/statistics.ts
export interface LevelUnlockEvent {
  level: JLPTLevel;
  timestamp: string;
  previousLevel: JLPTLevel | null;
  progress: LevelProgress;
}
```

**Navigation Existante:**
```typescript
// app/index.tsx utilise expo-router
import { router } from 'expo-router';

// Navigation vers training
router.push('/training');  // Route existante
```

**UI Library:**
- Tamagui pour components (Dialog, Sheet, Button, etc.)
- Expo modules déjà installés

---

## Approche d'Implémentation

### Décisions de Design

#### 1. Bibliothèque d'Animation Confettis
**Options évaluées:**
- ❌ `react-native-confetti` - Dépendance externe non-native, maintenance limitée
- ❌ `react-native-confetti-cannon` - Dépendance externe, bundle size impact
- ✅ **Animation Tamagui custom avec particules** - Pas de dépendance externe, léger, maîtrise totale

**Rationale:** Suivre principe "JAMAIS ajouter dépendance sans évaluer alternatives natives" (CLAUDE.md). Tamagui supporte animations complexes via `AnimatePresence`.

#### 2. Pattern Modal
**Choix:** **Tamagui Dialog** (au lieu de Sheet)
- Sheet utilisé pour feedback training (bottom-up)
- Dialog plus adapté pour célébration centrale (overlay full screen)
- Backdrop dismissible pour UX flexible

#### 3. Son et Vibration
**Son:**
- ✅ Utiliser **expo-haptics** (déjà installé, léger)
- ❌ **NE PAS implémenter son audio** pour l'instant
  - Nécessite `expo-av` (nouvelle dépendance ~500KB)
  - Asset `success.mp3` à créer
  - Complexity > effort S (2-3h)
  - **Décision:** Reporter à user story séparée si demandé

**Vibration:**
- ✅ `expo-haptics` avec `NotificationFeedbackType.Success`
- Déjà utilisé dans projet (patterns établis)

#### 4. Navigation Post-Unlock
**Options:**
- A) Redirect automatique vers training avec nouveau niveau
- B) Bouton "Commencer [Level]" + bouton "Plus tard"

**Choix:** **Option B** (boutons explicites)
- Respect du contrôle utilisateur
- Modal peut être fermée sans action
- User peut continuer son flow actuel

---

## Spécifications Détaillées

### Composant 1: Simple Confetti Effect

**Approche Minimaliste:**
- Pas de library externe
- Utiliser Tamagui `AnimatePresence` avec Text emoji
- 20-30 particules emoji (🎉, ✨, 🎊) avec `transform` + `opacity` animations
- Animation descendante simple (top → bottom, 2 secondes)

**Fichier:** `app/components/ConfettiEffect.tsx`

```typescript
import React from 'react';
import { YStack, Text, AnimatePresence } from 'tamagui';

interface ConfettiEffectProps {
  show: boolean;
}

export function ConfettiEffect({ show }: ConfettiEffectProps) {
  const confettiItems = [
    { emoji: '🎉', delay: 0, x: -50 },
    { emoji: '✨', delay: 100, x: 0 },
    { emoji: '🎊', delay: 200, x: 50 },
    // ... 20-30 items total
  ];

  return (
    <AnimatePresence>
      {show && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="100%"
          pointerEvents="none"
        >
          {confettiItems.map((item, index) => (
            <Text
              key={index}
              position="absolute"
              top={-20}
              left={`${50 + item.x}%`}
              fontSize="$6"
              animation="quick"
              enterStyle={{
                opacity: 0,
                y: -20,
              }}
              exitStyle={{
                opacity: 0,
                y: 400,
              }}
              animateOnly={['transform', 'opacity']}
              // Animation duration 2s via custom config
            >
              {item.emoji}
            </Text>
          ))}
        </YStack>
      )}
    </AnimatePresence>
  );
}
```

**Estimation:** 30 minutes (simple, pas de library)

---

### Composant 2: LevelUnlockModal

**Fichier:** `app/components/LevelUnlockModal.tsx`

**Props Interface:**
```typescript
interface LevelUnlockModalProps {
  visible: boolean;
  level: JLPTLevel;
  previousLevel: JLPTLevel | null;
  onStartTraining: () => void;
  onDismiss: () => void;
}
```

**Layout Structure:**
```
┌─────────────────────────────────┐
│ ConfettiEffect (overlay)        │
│                                  │
│   Dialog.Content                │
│   ┌──────────────────────────┐  │
│   │  🎉 Icon                  │  │
│   │  "FÉLICITATIONS !"        │  │
│   │  "Niveau N5 Débloqué"     │  │
│   │  "Vous avez maîtrisé..."  │  │
│   │                           │  │
│   │  [Commencer N5 →]         │  │ ← Primary CTA
│   │  [Plus tard]              │  │ ← Secondary
│   │                      (✕)  │  │ ← Close button
│   └──────────────────────────┘  │
└─────────────────────────────────┘
```

**Fonctionnalités:**
1. Tamagui Dialog avec backdrop semi-transparent
2. Message personnalisé avec nom niveau débloqué
3. Référence niveau précédent maîtrisé
4. 2 CTAs: "Commencer [Level]" (primaire) + "Plus tard" (secondaire)
5. Bouton close (X) en haut à droite
6. Haptic feedback au mount (`NotificationFeedbackType.Success`)
7. Animation fade-in/fade-out (300ms)

**Estimation:** 1 heure

---

### Composant 3: useLevelUnlockListener Hook

**Fichier:** `app/hooks/useLevelUnlockListener.ts`

**Responsabilités:**
1. Écouter événements unlock via `registerUnlockCallback()`
2. Maintenir état modal (visible/hidden)
3. Stocker dernier événement unlock
4. Cleanup listener au unmount
5. Fournir handlers pour actions modal

**Interface de Retour:**
```typescript
interface UseLevelUnlockListenerReturn {
  unlockEvent: LevelUnlockEvent | null;
  modalVisible: boolean;
  handleStartTraining: () => void;
  handleDismiss: () => void;
}
```

**Logique Navigation:**
```typescript
function handleStartTraining() {
  if (!unlockEvent) return;

  // Close modal first
  setModalVisible(false);

  // Navigate to training with newly unlocked level
  router.push('/training');
  // Note: training page devra lire niveau depuis preferences ou state
}
```

**Estimation:** 30 minutes

---

### Intégration 4: Root Layout

**Fichier à Modifier:** `app/_layout.tsx`

**Changements:**
1. Importer `useLevelUnlockListener` hook
2. Importer `LevelUnlockModal` component
3. Ajouter modal en tant que sibling de `<Stack>` (global overlay)

**Code Snippet:**
```typescript
// app/_layout.tsx
import { useLevelUnlockListener } from './hooks/useLevelUnlockListener';
import { LevelUnlockModal } from './components/LevelUnlockModal';

export default function RootLayout() {
  const { unlockEvent, modalVisible, handleStartTraining, handleDismiss } =
    useLevelUnlockListener();

  return (
    <>
      {/* Existing layout */}
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme="dark">
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            {/* ... other screens ... */}
          </Stack>
        </TamaguiProvider>
      </SafeAreaProvider>

      {/* Global unlock modal */}
      {unlockEvent && (
        <LevelUnlockModal
          visible={modalVisible}
          level={unlockEvent.level}
          previousLevel={unlockEvent.previousLevel}
          onStartTraining={handleStartTraining}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}
```

**Estimation:** 15 minutes

---

## Fichiers à Créer/Modifier

### Nouveaux Fichiers (Total: ~250 lignes)

1. **`app/components/ConfettiEffect.tsx`** (NEW, ~80 lignes)
   - Simple emoji animation avec AnimatePresence
   - 20-30 particules configurables
   - Animation 2s top→bottom

2. **`app/components/LevelUnlockModal.tsx`** (NEW, ~120 lignes)
   - Tamagui Dialog component
   - Layout avec titre + message + CTAs
   - Integration ConfettiEffect
   - Haptic feedback

3. **`app/hooks/useLevelUnlockListener.ts`** (NEW, ~50 lignes)
   - Hook React pour écoute événements unlock
   - State management modal
   - Navigation handlers
   - Cleanup logic

### Fichiers Modifiés (Total: ~20 lignes)

4. **`app/_layout.tsx`** (MODIFIED, +20 lignes)
   - Import hook + component
   - Render modal global

---

## Points d'Intégration

### Dépendances (US Précédentes)

✅ **US-006.3 (Logique Déblocage Séquentiel)** - BLOQUANT
- `registerUnlockCallback()` disponible ✓
- `LevelUnlockEvent` interface définie ✓
- Événement émis automatiquement lors unlock ✓

✅ **US-006.4 (UI Sélection Niveau)** - RECOMMANDÉ (déjà complété)
- Donne contexte UX (user voit niveaux locked)
- Modal cohérente avec style LevelButton

### Utilisé Par (Futures US)

⏳ **US-006.7 (Page Stats Enrichie)** - Potentiel
- Pourrait afficher historique déblocages avec timestamps
- Modal pourrait link vers stats page

---

## Stratégie de Tests

### Tests Unitaires

**Fichier 1:** `app/components/__tests__/ConfettiEffect.test.tsx`
```typescript
describe('ConfettiEffect', () => {
  it('renders confetti when show=true', () => {
    const { queryAllByText } = render(<ConfettiEffect show={true} />);
    const confetti = queryAllByText(/🎉|✨|🎊/);
    expect(confetti.length).toBeGreaterThan(0);
  });

  it('does not render when show=false', () => {
    const { queryAllByText } = render(<ConfettiEffect show={false} />);
    const confetti = queryAllByText(/🎉|✨|🎊/);
    expect(confetti.length).toBe(0);
  });
});
```

**Fichier 2:** `app/components/__tests__/LevelUnlockModal.test.tsx`
```typescript
import * as Haptics from 'expo-haptics';

jest.mock('expo-haptics');

describe('LevelUnlockModal', () => {
  it('displays correct level name', () => {
    const { getByText } = render(
      <LevelUnlockModal
        visible={true}
        level="N5"
        previousLevel="Kana"
        onStartTraining={jest.fn()}
        onDismiss={jest.fn()}
      />
    );

    expect(getByText(/Niveau N5/i)).toBeTruthy();
    expect(getByText(/Kana/i)).toBeTruthy();
  });

  it('triggers haptic feedback when visible', () => {
    render(
      <LevelUnlockModal visible={true} level="N5" previousLevel="Kana" />
    );

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success
    );
  });

  it('calls onStartTraining when CTA pressed', () => {
    const onStartTraining = jest.fn();
    const { getByText } = render(
      <LevelUnlockModal
        visible={true}
        level="N5"
        previousLevel="Kana"
        onStartTraining={onStartTraining}
        onDismiss={jest.fn()}
      />
    );

    fireEvent.press(getByText(/Commencer N5/i));
    expect(onStartTraining).toHaveBeenCalled();
  });

  it('calls onDismiss when "Plus tard" pressed', () => {
    const onDismiss = jest.fn();
    const { getByText } = render(
      <LevelUnlockModal
        visible={true}
        level="N5"
        previousLevel="Kana"
        onStartTraining={jest.fn()}
        onDismiss={onDismiss}
      />
    );

    fireEvent.press(getByText(/Plus tard/i));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('calls onDismiss when close button pressed', () => {
    const onDismiss = jest.fn();
    const { getByLabelText } = render(
      <LevelUnlockModal
        visible={true}
        level="N5"
        previousLevel="Kana"
        onStartTraining={jest.fn()}
        onDismiss={onDismiss}
      />
    );

    const closeButton = getByLabelText('Close');
    fireEvent.press(closeButton);
    expect(onDismiss).toHaveBeenCalled();
  });
});
```

**Fichier 3:** `app/hooks/__tests__/useLevelUnlockListener.test.ts`
```typescript
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLevelUnlockListener } from '../useLevelUnlockListener';
import * as statistics from '../../services/statistics';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

describe('useLevelUnlockListener', () => {
  it('initializes with no event and modal hidden', () => {
    const { result } = renderHook(() => useLevelUnlockListener());

    expect(result.current.unlockEvent).toBeNull();
    expect(result.current.modalVisible).toBe(false);
  });

  it('shows modal when unlock event received', async () => {
    const mockCallback = jest.fn();
    jest.spyOn(statistics, 'registerUnlockCallback').mockImplementation((cb) => {
      mockCallback.mockImplementation(cb);
      return () => {};
    });

    const { result } = renderHook(() => useLevelUnlockListener());

    const mockEvent: LevelUnlockEvent = {
      level: 'N5',
      timestamp: '2025-11-15T12:00:00Z',
      previousLevel: 'Kana',
      progress: { totalWords: 100, masteredWords: 100, percentage: 100 },
    };

    act(() => {
      mockCallback(mockEvent);
    });

    await waitFor(() => {
      expect(result.current.modalVisible).toBe(true);
      expect(result.current.unlockEvent).toEqual(mockEvent);
    });
  });

  it('hides modal when handleDismiss called', async () => {
    const { result } = renderHook(() => useLevelUnlockListener());

    // Simulate unlock event
    act(() => {
      result.current.handleDismiss();
    });

    expect(result.current.modalVisible).toBe(false);
    expect(result.current.unlockEvent).toBeNull();
  });
});
```

**Total Tests:** ~15 tests
**Coverage Target:** 90%+ (composants simples)

---

## Plan d'Exécution Step-by-Step

### Phase 1: Composants UI (1.5h)

**Étape 1.1:** Créer `ConfettiEffect.tsx` (30min)
- [ ] Layout avec YStack absolute positioning
- [ ] Générer 20-30 items confetti (emoji 🎉✨🎊)
- [ ] Animation descendante avec AnimatePresence
- [ ] Props: `show: boolean`

**Étape 1.2:** Créer `LevelUnlockModal.tsx` (1h)
- [ ] Tamagui Dialog structure (Portal + Overlay + Content)
- [ ] Layout avec titre + description + CTAs
- [ ] Integration ConfettiEffect overlay
- [ ] Haptic feedback dans useEffect (when visible=true)
- [ ] Styling cohérent avec design system

### Phase 2: Hook et Intégration (45min)

**Étape 2.1:** Créer `useLevelUnlockListener.ts` (30min)
- [ ] useState pour unlockEvent et modalVisible
- [ ] useEffect pour registerUnlockCallback + cleanup
- [ ] handleStartTraining: router.push + dismiss
- [ ] handleDismiss: reset state

**Étape 2.2:** Modifier `_layout.tsx` (15min)
- [ ] Import hook + component
- [ ] Render modal conditionally (unlockEvent truthy)
- [ ] Vérifier pas de régression layout existant

### Phase 3: Tests (1h)

**Étape 3.1:** Tests ConfettiEffect (15min)
- [ ] Test show=true renders items
- [ ] Test show=false renders nothing

**Étape 3.2:** Tests LevelUnlockModal (30min)
- [ ] Test affichage message personnalisé
- [ ] Test haptic feedback triggered
- [ ] Test onStartTraining callback
- [ ] Test onDismiss callback (2 paths: button + close)

**Étape 3.3:** Tests useLevelUnlockListener (15min)
- [ ] Test initialization
- [ ] Test event received shows modal
- [ ] Test handleDismiss hides modal

### Phase 4: Testing Manuel (30min)

**Étape 4.1:** Simulation déblocage (15min)
- [ ] Lancer app sur Expo Go
- [ ] Déclencher déblocage N5 manuellement (via code temporaire)
- [ ] Vérifier modal apparaît correctement
- [ ] Vérifier haptic feedback ressenti
- [ ] Vérifier animations fluides

**Étape 4.2:** Interactions utilisateur (15min)
- [ ] Tester bouton "Commencer N5" → navigation
- [ ] Tester bouton "Plus tard" → fermeture
- [ ] Tester bouton close (X) → fermeture
- [ ] Tester tap backdrop → fermeture
- [ ] Vérifier pas de double-trigger

---

## Risques et Mitigations

### Risque 1: Animation Performance
**Impact:** Moyen
**Probabilité:** Faible

**Description:** 20-30 particules animées simultanément pourraient impacter 60fps.

**Mitigation:**
- Utiliser `animateOnly={['transform', 'opacity']}` (GPU-optimized)
- Limiter à 20 particules max
- Durée courte (2s) pour éviter accumulation
- Test sur device mid-range (pas seulement simulator)

### Risque 2: Modal Spam
**Impact:** Critique
**Probabilité:** Très Faible

**Description:** Bug pourrait causer modal à s'afficher en boucle.

**Mitigation:**
- Flag `modalVisible` contrôle affichage (single source of truth)
- Cleanup listener au unmount (pas de memory leak)
- Tests couvrent scénario double-event

### Risque 3: Navigation Conflict
**Impact:** Moyen
**Probabilité:** Faible

**Description:** Modal apparaît pendant navigation active (race condition).

**Mitigation:**
- Modal est global (root layout) donc overlay toutes screens
- `router.push` après `setModalVisible(false)` (séquence garantie)
- Backdrop dismissible donne contrôle user

### Risque 4: Regression Layout
**Impact:** Faible
**Probabilité:** Très Faible

**Description:** Ajout modal global pourrait affecter layout existant.

**Mitigation:**
- Modal rendu conditionnellement (seulement si unlockEvent)
- Position absolute avec pointerEvents géré par Dialog
- Tests visuels sur toutes routes principales

---

## Critères d'Acceptation

### Fonctionnel
- [x] **AC1:** Modal s'affiche automatiquement lors déblocage niveau
- [x] **AC2:** Message personnalisé "Niveau X débloqué !"
- [x] **AC3:** Affichage nom niveau débloqué (ex: "N5 débloqué")
- [x] **AC4:** Bouton "Commencer N5" redirige vers training
- [x] **AC5:** Bouton "Plus tard" ferme modal sans action

### UX
- [x] **AC6:** Animation confettis (particules emoji descendantes)
- [x] **AC7:** Vibration tactile success (NotificationFeedbackType.Success)
- [x] **AC8:** ~~Son "success.mp3" joué~~ **REPORTÉ** (hors scope S)
- [x] **AC9:** Modal peut être fermée via backdrop tap ou bouton close
- [x] **AC10:** Animation fade-in/fade-out fluide (300ms)

### Technique
- [x] **AC11:** Composant `LevelUnlockModal.tsx` réutilisable
- [x] **AC12:** Hook `useLevelUnlockListener()` pour écouter events
- [x] **AC13:** Animations Tamagui (pas react-native-reanimated)
- [x] **AC14:** ~~Gestion son via Expo AV~~ **REPORTÉ** (hors scope)
- [x] **AC15:** Pas de dépendance externe (sauf Expo modules officiels)

**Note:** Son audio (AC8, AC14) reporté car ajout `expo-av` (nouvelle dépendance) dépasse effort S. User peut demander US séparée si souhaité.

---

## Estimation Finale

**Total Effort:** 2-3 heures (conforme à S)

**Breakdown:**
- UI Components: 1.5h (ConfettiEffect 30min + Modal 1h)
- Hook + Integration: 45min (Hook 30min + Layout 15min)
- Tests: 1h (Unit tests 45min + Manuel 15min)

**Lignes de Code:** ~270 lignes
- Production: ~250 lignes (3 nouveaux fichiers + 1 modifié)
- Tests: ~200 lignes (15 tests)

**Dépendances Externes:** 0 nouvelles
**Régression Risk:** Très faible (modal global isolée)

---

## Définition de "Done"

### Code
- [ ] `app/components/ConfettiEffect.tsx` créé et fonctionnel
- [ ] `app/components/LevelUnlockModal.tsx` créé avec tous AC
- [ ] `app/hooks/useLevelUnlockListener.ts` créé avec cleanup
- [ ] `app/_layout.tsx` modifié avec intégration modal

### Tests
- [ ] 15+ tests unitaires passent (90%+ coverage)
- [ ] Tests manuels validés sur Expo Go (Android/iOS)
- [ ] Aucune régression détectée (home, training, stats)

### Documentation
- [ ] Context session mis à jour
- [ ] Documentation Maintainer appelé
- [ ] Rapport delivery créé
- [ ] TODO.md mis à jour (US-006.6 cochée)
- [ ] CHANGELOG.md mis à jour ([Unreleased])

### Review
- [ ] Code Review Agent invoqué (si > 100 lignes)
- [ ] Test Engineer validé (coverage + quality)
- [ ] Orchestrator autorisé commit

---

## Prochaines Étapes (Post-US-006.6)

**Immédiat:**
- US-006.7: Page Statistiques Enrichie (P2, M, 4-6h)
- US-006.8: Migration État Initial (P1, S, 1-2h)

**Optionnel (si demandé):**
- US-006.6.1: Son de Célébration (P3, XS, 30min)
  - Ajout `expo-av` dependency
  - Asset `success.mp3`
  - Permission check + playback

---

**Plan créé par:** Epic Manager Agent
**Date:** 2025-11-15
**Statut:** PRÊT POUR VALIDATION UTILISATEUR