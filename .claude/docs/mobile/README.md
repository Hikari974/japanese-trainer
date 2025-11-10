# Plans Agents Mobile

Ce dossier contient les plans créés par les **agents spécialisés mobile**.

---

## Agents Mobile

### Expo Expert
**Fichier :** `.claude/plugins/mobile/expo-expert.md`
**Responsabilités :** Configuration Expo SDK, modules natifs, build & déploiement

### Mobile UI Expert
**Fichier :** `.claude/plugins/mobile/mobile-ui-expert.md`
**Responsabilités :** Bibliothèques UI mobile, design patterns, gestures, animations

---

## Structure Plans

### Plans Expo Expert
**Format :** `plan_expo_[feature].md`

**Exemples :**
- `plan_expo_notifications_push.md`
- `plan_expo_camera_integration.md`
- `plan_expo_eas_build_setup.md`

### Plans Mobile UI Expert
**Format :** `plan_ui_mobile_[feature].md`

**Exemples :**
- `plan_ui_mobile_bottom_sheet.md`
- `plan_ui_mobile_theme_system.md`
- `plan_ui_mobile_navigation_tabs.md`

---

## Workflow

### 1. Détection Domaine Mobile

**Expo Expert invoqué si :**
- Configuration Expo SDK
- Modules natifs (camera, location, notifications, etc.)
- Navigation setup (Expo Router / React Navigation)
- Build & déploiement (EAS Build, OTA)
- Performance native

**Mobile UI Expert invoqué si :**
- Sélection bibliothèque UI
- Architecture composants mobile
- Patterns UI (tabs, drawer, modal, bottom sheet)
- Gestures & animations
- Theming & responsive
- Accessibilité mobile

### 2. Création Plans

```
User demande feature mobile
    ↓
Claude détecte domaine
    ↓
Invoque Expo Expert ET/OU Mobile UI Expert
    ↓
Agents créent plans dans .claude/docs/mobile/
    ↓
User lit plans
    ↓
Implémentation selon plans
```

### 3. Coordination Agents

**Feature simple (UI only) :**
```
Mobile UI Expert seul → plan_ui_mobile_XXX.md
```

**Feature SDK (infrastructure + UI) :**
```
Expo Expert → plan_expo_XXX.md
Mobile UI Expert → plan_ui_mobile_XXX.md
```

**Feature fullstack (mobile + backend) :**
```
Expo Expert → plan_expo_XXX.md
Mobile UI Expert → plan_ui_mobile_XXX.md
Backend Expert → plan_backend_XXX.md
```

---

## Configuration

Configuration mobile dans `.claude/core/rules/mobile-config.yml` :
- Expo SDK versions
- UI libraries comparaison
- Navigation patterns
- Animation libraries
- Platform guidelines
- Performance thresholds

---

## Exemples

### Exemple 1 : Notifications Push

**Agents invoqués :**
- Expo Expert (Expo Notifications SDK, permissions, configuration)
- Mobile UI Expert (UI notifications, badges, interactions)

**Plans créés :**
- `plan_expo_notifications_push.md` (setup SDK, permissions, handlers)
- `plan_ui_mobile_notifications_ui.md` (composants, badges, interactions)

### Exemple 2 : Bottom Sheet Filtres

**Agent invoqué :**
- Mobile UI Expert uniquement

**Plan créé :**
- `plan_ui_mobile_bottom_sheet_filters.md` (composant, gestures, animations)

### Exemple 3 : Authentification Biométrique

**Agents invoqués :**
- Expo Expert (Expo LocalAuthentication)
- Mobile UI Expert (UI flow biométrique)
- Backend Expert (validation token)

**Plans créés :**
- `plan_expo_biometric_auth.md` (SDK setup, security)
- `plan_ui_mobile_biometric_flow.md` (UI login biométrique)
- `plan_backend_biometric_validation.md` (API validation)

---

## Notes

- Plans agents mobile = **consultants uniquement** (pas d'implémentation)
- Agents suivent méthodologie Claude Code (plan avant code)
- Coordination automatique si plusieurs domaines détectés
- Format plans cohérent avec autres agents (Backend, Frontend)
