# Epic-008: Notifications de Rappel Quotidien

**Statut:** BACKLOG
**Priorite:** P2 (Quality of Life Feature)
**Effort Total Estime:** 3-4 jours
**Date Creation:** 2025-11-30
**Derniere MAJ:** 2025-11-30

---

## Objectif

Implementer un systeme de notification de rappel quotidien permettant a l'utilisateur de definir une heure pour etre rappele de faire sa session d'entrainement japonais.

**Comportement :**
- L'utilisateur peut activer/desactiver les rappels dans Settings
- L'utilisateur choisit l'heure du rappel (ex: 19:00)
- Notification envoyee tous les jours a l'heure choisie
- Clic sur notification = ouvre l'app sur l'accueil

---

## Contexte Technique

### Etat Actuel
- Aucune notification dans l'app
- Systeme de preferences existant avec AsyncStorage
- Settings screen avec toggles, sliders, time patterns etablis
- Expo SDK 54.0.23 (supporte expo-notifications)
- Pattern service/hook bien etabli dans le projet

### Architecture Existante
```typescript
// app/services/preferences.ts
interface UserPreferences {
  lastLevel: Level | null;
  lastDifficulty: Difficulty;
  wordsPerSession: number;
  translationLanguage: 'fr' | 'en';
}
```

### Package Requis
```bash
npx expo install expo-notifications
```

**Note :** `expo-notifications` fonctionne avec Expo Go (pas besoin de Development Build).

---

## User Stories

### Phase 1: Infrastructure (P0) - 1 jour

**US-008.1: Installation et Configuration expo-notifications (S)**
- Installation du package
- Configuration app.json si necessaire
- Verification compatibilite Expo Go

**US-008.2: Service de Notification avec Scheduling (M)**
- Creer `app/services/notifications.ts`
- Fonction `scheduleDaily(time: string)` - planifie notification recurrente
- Fonction `cancelAll()` - annule toutes les notifications
- Fonction `requestPermissions()` - demande permissions
- Gestion des erreurs et fallbacks

### Phase 2: Integration (P1) - 1-2 jours

**US-008.3: Extension Preferences (S)**
- Ajouter `notificationsEnabled: boolean` (default: false)
- Ajouter `reminderTime: string` (default: "19:00")
- Migration transparente pour users existants

**US-008.4: UI Settings - Toggle et Time Picker (M)**
- Section "Rappels" dans Settings
- Toggle activer/desactiver notifications
- Time picker pour choisir l'heure
- Labels bilingues (FR/EN)
- Gestion etat permissions refusees

**US-008.5: Gestion des Permissions (S)**
- Demande permission au premier toggle ON
- Message explicatif si permission refusee
- Lien vers Settings systeme si besoin

### Phase 3: Polish (P2) - 0.5-1 jour

**US-008.6: Tests sur Device Reel (S)**
- Test notification sur Android
- Test notification sur iOS (si applicable)
- Test comportement app en background
- Test apres reboot device

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
  notificationsEnabled: boolean;  // default: false
  reminderTime: string;           // format "HH:mm", default: "19:00"
}
```

### Service Notifications
```typescript
// app/services/notifications.ts
export async function requestPermissions(): Promise<boolean>;
export async function scheduleDailyReminder(time: string): Promise<void>;
export async function cancelAllReminders(): Promise<void>;
export function getPermissionStatus(): Promise<PermissionStatus>;
```

### Hook (optionnel)
```typescript
// app/hooks/useNotifications.ts
export function useNotifications() {
  return {
    hasPermission: boolean;
    requestPermission: () => Promise<boolean>;
    scheduleReminder: (time: string) => Promise<void>;
    cancelReminder: () => Promise<void>;
  };
}
```

### Flow UI Settings

```
[Toggle Rappels] OFF
    |
    v (user active)
    |
[Demande Permission] --> Refuse --> [Message + lien Settings]
    |
    v (Accepte)
    |
[Toggle ON] + [Time Picker visible]
    |
    v (user change heure)
    |
[Replanifie notification]
```

---

## Dependances Techniques

### Nouveau Package
```json
{
  "expo-notifications": "~0.29.x"  // Version compatible SDK 54
}
```

### Fichiers a Creer
```
app/services/notifications.ts    # Service principal
app/hooks/useNotifications.ts    # Hook (optionnel)
```

### Fichiers a Modifier
```
app/services/preferences.ts      # Ajouter champs notification
app/settings.tsx                 # UI toggle + time picker
app/_layout.tsx                  # Init listener au demarrage (optionnel)
package.json                     # Nouvelle dependance
```

---

## Contraintes & Risques

### Contraintes
1. **Permissions obligatoires** - iOS/Android requierent permission explicite
2. **Background limitations** - Notifications locales schedulees, pas de serveur
3. **Precision horaire** - Peut varier de quelques minutes selon OS
4. **Reboot device** - Notifications doivent persister apres redemarrage

### Risques
| Risque | Impact | Mitigation |
|--------|--------|------------|
| Permission refusee | Moyen | UI claire expliquant le benefice + lien settings |
| Notification pas delivree | Faible | Utiliser trigger "daily" d'expo-notifications |
| Time picker complexe | Faible | Utiliser composant natif ou simple input HH:mm |
| Conflit avec DND | Faible | Documenter comportement (normal - OS gere) |

---

## Criteres d'Acceptation Epic

### Fonctionnel
- [ ] Toggle notifications dans Settings
- [ ] Time picker pour choisir l'heure
- [ ] Notification recue tous les jours a l'heure choisie
- [ ] Clic notification ouvre l'app
- [ ] Desactiver = plus de notifications
- [ ] Changer l'heure = nouvelle heure appliquee
- [ ] Labels bilingues (FR/EN)

### Technique
- [ ] Service notifications avec functions claires
- [ ] Preferences etendues avec migration transparente
- [ ] Gestion permissions propre
- [ ] Aucune regression features existantes
- [ ] Fonctionne avec Expo Go

### UX
- [ ] UI coherente avec Settings existant
- [ ] Feedback clair si permission refusee
- [ ] Time picker intuitif
- [ ] Etat toggle reflete realite (permission)

---

## Contenu Notification

### Texte (bilingue)

**Francais :**
- Titre: "Japanese Trainer"
- Body: "C'est l'heure de ton entrainement quotidien !"

**English :**
- Titre: "Japanese Trainer"
- Body: "Time for your daily training session!"

---

## Ordre d'Implementation Recommande

1. **US-008.1** - Installation expo-notifications
2. **US-008.2** - Service notifications (schedule/cancel)
3. **US-008.3** - Extension preferences
4. **US-008.4** - UI Settings (toggle + time picker)
5. **US-008.5** - Gestion permissions
6. **US-008.6** - Tests device reel

---

## Commandes Utiles

```bash
# Installation
npx expo install expo-notifications

# Test sur device
npx expo start
# Puis scanner QR avec Expo Go
```

---

## References

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Notifications Scheduling](https://docs.expo.dev/versions/latest/sdk/notifications/#scheduling-notifications)
- Fichiers existants:
  - `app/services/preferences.ts` - Pattern service
  - `app/settings.tsx` - Pattern UI settings
  - `app/hooks/usePreferences.ts` - Pattern hook

---

---

## 🔧 Actions Hors Code (Aide Externe)

Cette section decrit les actions qui necessitent une intervention manuelle, des tests sur device reel, ou une verification des configurations systeme.

### Checklist Pre-Implementation

#### 1. Configuration app.json (si necessaire)
- [ ] **Verifier que expo-notifications est compatible** avec Expo SDK 54
- [ ] **Ajouter configuration notification dans app.json** si necessaire:
  ```json
  {
    "expo": {
      "notification": {
        "icon": "./assets/notification-icon.png",
        "color": "#4A90A4",
        "androidMode": "default",
        "androidCollapsedTitle": "Japanese Trainer"
      }
    }
  }
  ```
- [ ] **Creer icone notification** (optionnel):
  - Format: PNG 96x96 pixels
  - Fond transparent
  - Blanc sur transparent recommande pour Android

#### 2. Permissions Android
- [ ] **Verifier permissions automatiques** d'expo-notifications:
  - `android.permission.RECEIVE_BOOT_COMPLETED` (pour notifications apres reboot)
  - `android.permission.VIBRATE`
  - `android.permission.SCHEDULE_EXACT_ALARM` (Android 12+)
- [ ] **Aucune action manuelle requise** - expo-notifications gere automatiquement

#### 3. Permissions iOS (si support futur)
- [ ] **APN (Apple Push Notifications)**: Non requis pour notifications locales
- [ ] **Info.plist**: expo-notifications configure automatiquement
- [ ] **Capability**: Pas de configuration App Store Connect necessaire pour local

### Checklist Tests Device Reel

#### Tests Essentiels
- [ ] **Test 1: Activation notifications**
  1. Ouvrir Settings
  2. Activer toggle "Rappels"
  3. Verifier demande permission systeme
  4. Accepter permission
  5. Verifier toggle reste ON

- [ ] **Test 2: Changement heure**
  1. Toggle ON
  2. Changer heure a H+1 (dans 1 minute)
  3. Attendre notification
  4. Verifier reception notification

- [ ] **Test 3: Contenu notification**
  1. Recevoir notification
  2. Verifier titre "Japanese Trainer"
  3. Verifier message correct (selon langue)
  4. Clic = ouvre app

- [ ] **Test 4: Desactivation**
  1. Toggle OFF
  2. Verifier aucune notification planifiee
  3. Attendre heure prevue
  4. Confirmer aucune notification recue

- [ ] **Test 5: Persistence apres reboot**
  1. Configurer notification pour dans 5 minutes
  2. Reboot device
  3. Verifier notification arrive quand meme

- [ ] **Test 6: Permission refusee**
  1. Toggle ON
  2. Refuser permission systeme
  3. Verifier message d'erreur affiche
  4. Verifier toggle revient OFF
  5. Verifier lien vers Settings systeme

#### Tests Edge Cases
- [ ] **Test changement timezone**: Voyager virtuellement, verifier heure correcte
- [ ] **Test mode "Ne pas deranger"**: Notification en file d'attente (normal)
- [ ] **Test batterie faible**: Notification peut etre retardee (normal)
- [ ] **Test app tuee**: Notification doit arriver (notification locale)

### Configuration Android Specifique

#### Channels de Notification (Android 8+)
expo-notifications cree automatiquement un channel par defaut. Configuration optionnelle:

```typescript
// Optionnel: personnaliser le channel
await Notifications.setNotificationChannelAsync('daily-reminder', {
  name: 'Rappels quotidiens',
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#4A90A4',
});
```

#### Comportement Attendu par Version Android
| Version Android | Comportement |
|-----------------|--------------|
| Android 8-11 | Notifications normales |
| Android 12+ | Demande permission explicite |
| Android 13+ | Permission obligatoire au runtime |

### Debugging

#### Commandes Utiles
```bash
# Voir notifications planifiees (debug)
adb shell dumpsys notification

# Voir permissions app
adb shell pm list permissions com.japanesetrainer.app

# Forcer arret app pour tester persistence
adb shell am force-stop com.japanesetrainer.app
```

#### Logs a Verifier
```typescript
// En mode DEV, les logs sont affiches dans la console
// Chercher:
// - "Notification scheduled for..."
// - "Notification cancelled"
// - "Permission status: ..."
```

### Notes Importantes

1. **expo-notifications fonctionne avec Expo Go** - pas besoin de Development Build
2. **Notifications locales uniquement** - pas de serveur push necessaire
3. **Precision horaire**: peut varier de +/- quelques minutes selon l'OS
4. **Mode economie batterie**: peut affecter la livraison (comportement normal)

---

**Epic Owner:** A definir
**Reviewers:** Code Review Agent + Test Engineer Agent