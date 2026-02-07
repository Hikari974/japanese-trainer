# Epic-007: Monetisation - Publicites AdMob + Abonnement Premium

**Statut:** BACKLOG
**Priorite:** P2 (Future Feature)
**Effort Total Estime:** 8-12 jours
**Date Creation:** 2025-11-30
**Derniere MAJ:** 2025-11-30

---

## Objectif

Implementer un systeme de monetisation avec :
1. **Publicites Interstitial** affichees au debut de chaque session d'entrainement
2. **Abonnement Premium** a 1EUR/mois qui supprime les publicites

**Documentation complete :** Voir [MONETIZATION_GUIDE.md](../../../MONETIZATION_GUIDE.md)

---

## Contexte Technique

### Etat Actuel
- App gratuite sans aucune monetisation
- Expo SDK 54 avec React Native 0.81.5
- AsyncStorage pour persistence locale
- Aucun systeme d'achat ou de pub existant
- Package identifier: `com.japanesetrainer.app`
- Compte Google Play deja existant

### Changements Majeurs Requis
- Passage de **Expo Go** a **Development Build** (obligatoire)
- Integration RevenueCat pour gestion abonnements
- Integration AdMob via `react-native-google-mobile-ads`
- Creation Privacy Policy
- Configuration Google Play Console pour abonnements

### Architecture Cible

```
User lance session d'entrainement
    |
    +-- isPremium? -- OUI -- Session directe (pas de pub)
    |
    +-- NON -- Afficher pub Interstitial plein ecran
                    |
                    +-- User skip/ferme (apres 5s)
                            |
                            +-- Session normale
```

---

## User Stories

### Phase 1: Infrastructure (P0) - 3-4 jours
- **US-007.1**: Configuration Development Build Expo (M)
  - `npx expo prebuild`
  - Configuration EAS Build
  - Tests sur device reel

- **US-007.2**: Integration RevenueCat SDK (L)
  - Installation `react-native-purchases`
  - Configuration RevenueCat Dashboard
  - Creation produit abonnement Google Play Console
  - Hook `usePremium()` pour verifier statut

- **US-007.3**: Integration AdMob SDK (M)
  - Installation `react-native-google-mobile-ads`
  - Creation compte AdMob + ad units
  - Configuration app.json avec IDs AdMob
  - Service `ads.ts` pour gestion pubs

### Phase 2: Implementation Core (P1) - 2-3 jours
- **US-007.4**: Logique Affichage Pub Pre-Session (M)
  - Verification statut premium
  - Affichage interstitial si non-premium
  - Gestion du skip/close
  - Navigation vers training apres pub

- **US-007.5**: Ecran Paywall / Upgrade Premium (M)
  - UI pour proposer l'abonnement
  - Integration avec RevenueCat purchase flow
  - Gestion erreurs et confirmations
  - Bouton "Restaurer achats"

- **US-007.6**: Persistence Statut Premium (S)
  - Stockage local statut premium (cache)
  - Verification periodique avec RevenueCat
  - Gestion expiration abonnement

### Phase 3: Legal & Compliance (P1) - 1-2 jours
- **US-007.7**: Privacy Policy (S)
  - Creation document privacy policy
  - Hebergement sur URL accessible
  - Lien dans Settings app
  - Integration dans Google Play listing

- **US-007.8**: Consentement RGPD pour Ads (S)
  - Dialog consentement premiere utilisation
  - Stockage preference utilisateur
  - Configuration AdMob selon consentement

### Phase 4: Polish & Testing (P2) - 2-3 jours
- **US-007.9**: Tests sur Devices Reels (M)
  - Tests Android (emulateur + device)
  - Tests achats sandbox Google Play
  - Verification comportement pub/premium
  - Tests edge cases (offline, expiration)

- **US-007.10**: UI Settings Premium (S)
  - Affichage statut abonnement dans Settings
  - Date renouvellement si premium
  - Bouton gerer abonnement (Google Play)

---

## Dependances Techniques

### Nouveaux Packages
```json
{
  "react-native-purchases": "^8.x",
  "react-native-purchases-ui": "^8.x",
  "react-native-google-mobile-ads": "^14.x"
}
```

### Services Externes
- **RevenueCat** - Gestion abonnements (gratuit < 2,500$/mois)
- **Google AdMob** - Reseau publicitaire
- **Google Play Console** - Configuration produit abonnement

### Fichiers a Creer
```
src/services/subscription.ts    # Gestion RevenueCat
src/services/ads.ts             # Gestion AdMob
src/hooks/usePremium.ts         # Hook statut premium
src/hooks/useAds.ts             # Hook affichage pubs
src/components/Paywall.tsx      # Ecran upgrade
src/components/AdConsent.tsx    # Dialog RGPD
PRIVACY_POLICY.md               # Ou URL externe
```

### Fichiers a Modifier
```
app.json                        # Plugins AdMob + RevenueCat
app/(tabs)/training.tsx         # Logique pre-session pub
app/(tabs)/settings.tsx         # UI statut premium + privacy
```

---

## Contraintes & Risques

### Contraintes
1. **Expo Go incompatible** - Development Build obligatoire
2. **Tests reels requis** - Sandbox Google Play pour achats
3. **Privacy Policy obligatoire** - Prerequis publication
4. **Compte bancaire** - Pour recevoir paiements Google

### Risques
| Risque | Impact | Mitigation |
|--------|--------|------------|
| Dev Build complexe a setup | Moyen | Documentation EAS Build |
| Rejet Google Play (policy) | Critique | Suivre guidelines strictement |
| RevenueCat SDK issues | Moyen | Utiliser version stable, tester early |
| Pubs intrusives = mauvais ratings | Moyen | 1 pub/session seulement, skip rapide |
| RGPD non-compliance | Critique | Dialog consentement + privacy policy |

---

## Criteres d'Acceptation Epic

### Fonctionnel
- [ ] Pub interstitial s'affiche avant chaque session (non-premium)
- [ ] Utilisateur peut skip pub apres 5s
- [ ] Abonnement 1EUR/mois disponible a l'achat
- [ ] Premium = aucune pub
- [ ] Statut premium persiste entre sessions
- [ ] Restauration achats fonctionnelle
- [ ] Privacy Policy accessible dans l'app

### Technique
- [ ] Development Build fonctionne Android
- [ ] RevenueCat SDK integre et fonctionnel
- [ ] AdMob SDK integre et fonctionnel
- [ ] Hook `usePremium()` retourne statut correct
- [ ] Tests sandbox Google Play passes
- [ ] Aucune regression features existantes

### Legal
- [ ] Privacy Policy complete et hebergee
- [ ] Data Safety Form Google Play rempli
- [ ] Dialog consentement RGPD fonctionnel
- [ ] Mentions legales abonnement presentes

---

## Estimation Financiere

### Couts
| Element | Cout |
|---------|------|
| Compte Google Play | 0EUR (deja fait) |
| RevenueCat | Gratuit (< 2,500$/mois) |
| AdMob | Gratuit |
| Hebergement Privacy Policy | Gratuit (GitHub Pages) |
| **Total** | **0EUR** |

### Revenus Potentiels (estimation)
| Metrique | Valeur |
|----------|--------|
| Commission Google sur abonnements | 15% |
| Revenu net par abonne | 0,85EUR/mois |
| eCPM interstitial Europe | 2-5EUR/1000 |

---

## Commandes Utiles

### Setup Development Build
```bash
# Generer projet natif
npx expo prebuild

# Build Android debug
npx expo run:android

# Build avec EAS (production)
eas build --platform android --profile preview
```

### Configuration RevenueCat
```bash
# Installation
npx expo install react-native-purchases react-native-purchases-ui
```

### Configuration AdMob
```bash
# Installation
npx expo install react-native-google-mobile-ads
```

---

## Ordre d'Implementation Recommande

1. **US-007.1** - Dev Build setup (prerequis pour tout)
2. **US-007.7** - Privacy Policy (peut etre fait en parallele)
3. **US-007.3** - AdMob SDK integration
4. **US-007.2** - RevenueCat SDK integration
5. **US-007.6** - Persistence premium status
6. **US-007.4** - Logique pub pre-session
7. **US-007.5** - Paywall UI
8. **US-007.8** - Consentement RGPD
9. **US-007.10** - UI Settings
10. **US-007.9** - Tests complets

---

## References

- [MONETIZATION_GUIDE.md](../../../MONETIZATION_GUIDE.md) - Guide complet
- [RevenueCat Expo Docs](https://www.revenuecat.com/docs/getting-started/installation/expo)
- [Expo In-App Purchases](https://docs.expo.dev/guides/in-app-purchases/)
- [Google Play Service Fees](https://support.google.com/googleplay/android-developer/answer/112622)
- [AdMob React Native](https://dev.to/oghenetega_adiri/integrating-admob-in-react-native-expo-a-comprehensive-developers-guide-35ij)

---

---

## 🔧 Actions Hors Code (Aide Externe)

Cette section decrit les actions qui necessitent une intervention manuelle ou l'aide d'une personne externe (developpeur, product owner, etc.) car elles impliquent la creation de comptes, la configuration de services externes, ou des actions legales.

### Checklist Pre-Implementation

#### 1. Compte Google AdMob
- [ ] **Creer compte AdMob** sur [admob.google.com](https://admob.google.com)
- [ ] Lier au compte Google existant (meme que Google Play Console)
- [ ] **Creer une "App" dans AdMob** pour Japanese Trainer
  - Platform: Android
  - Package name: `com.japanesetrainer.app`
- [ ] **Creer un Ad Unit "Interstitial"**
  - Type: Interstitial
  - Nom suggere: "Training Pre-Session"
  - Noter l'**Ad Unit ID** (format: `ca-app-pub-XXXXX/YYYYY`)
- [ ] **Noter l'App ID AdMob** (format: `ca-app-pub-XXXXX~YYYYY`)
- [ ] Activer mode test pendant developpement

#### 2. Compte RevenueCat
- [ ] **Creer compte RevenueCat** sur [revenuecat.com](https://www.revenuecat.com)
- [ ] **Creer un nouveau projet** "Japanese Trainer"
- [ ] **Configurer l'app Android**:
  - Package name: `com.japanesetrainer.app`
  - Uploader le fichier JSON Service Account Google Play
- [ ] **Creer un "Entitlement"**:
  - Identifier: `premium` (ou `pro`)
  - Description: "Premium - No Ads"
- [ ] **Creer un "Offering"**:
  - Identifier: `default`
  - Package: lier au produit Google Play (voir etape suivante)
- [ ] **Noter l'API Key** publique RevenueCat (pour config app)

#### 3. Google Play Console - Produit Abonnement
- [ ] Aller sur [Google Play Console](https://play.google.com/console)
- [ ] **Monetization > Products > Subscriptions**
- [ ] **Creer un nouvel abonnement**:
  - Product ID suggere: `premium_monthly`
  - Nom: "Japanese Trainer Premium"
  - Prix: 0,99 EUR/mois (ou 1,00 EUR)
  - Periode: Mensuel
  - Grace period: 7 jours recommandes
  - Account hold: 30 jours recommandes
- [ ] **Activer le produit** (statut "Active")
- [ ] **Lier dans RevenueCat**: Ajouter ce product ID dans l'Offering

#### 4. Privacy Policy
- [ ] **Rediger Privacy Policy** incluant:
  - Collecte de donnees: statistiques locales uniquement
  - Publicites: Google AdMob (lien vers politique Google)
  - Achats in-app: via Google Play
  - Aucun compte utilisateur requis
  - Contact: email support
- [ ] **Heberger Privacy Policy** sur URL publique:
  - Option 1: GitHub Pages (gratuit) - `https://username.github.io/japanese-trainer-privacy`
  - Option 2: Notion page publique
  - Option 3: Google Sites
- [ ] Noter l'URL finale pour integration

#### 5. Data Safety Form Google Play
- [ ] **Aller sur Google Play Console > App content > Data safety**
- [ ] Remplir le formulaire:
  - [ ] Location: Non collecte
  - [ ] Personal info: Non collecte
  - [ ] Financial info: Non collecte (achats geres par Google)
  - [ ] App activity: Donnees locales uniquement (statistiques)
  - [ ] Device identifiers: Via AdMob pour publicites
  - [ ] Data sharing: Avec Google (AdMob)
  - [ ] Data encryption: Oui (HTTPS)
  - [ ] Data deletion: Contact support

#### 6. Service Account Google Play (pour RevenueCat)
- [ ] **Google Cloud Console** > IAM > Service Accounts
- [ ] Creer un service account pour RevenueCat
- [ ] Accorder role "Service Account User"
- [ ] **Generer cle JSON** et telecharger
- [ ] **Lier a Google Play Console**:
  - Settings > API access > Link project
  - Accorder permissions "View financial data"
- [ ] **Uploader JSON dans RevenueCat**

### Checklist Post-Configuration

#### Verification AdMob
- [ ] Mode test actif (pas de vraies pubs en dev)
- [ ] Ad Unit ID copie dans config app
- [ ] App ID copie dans `app.json`

#### Verification RevenueCat
- [ ] API Key copiee dans config app
- [ ] Entitlement "premium" visible
- [ ] Offering "default" avec produit lie
- [ ] Sandbox testing active

#### Verification Google Play
- [ ] Abonnement statut "Active"
- [ ] Prix correct (0,99 EUR ou 1,00 EUR)
- [ ] Privacy Policy URL dans Store listing

### IDs et Cles a Configurer

Une fois toutes les etapes completees, fournir ces valeurs pour l'implementation:

```typescript
// Configuration a integrer dans l'app
const CONFIG = {
  // AdMob
  ADMOB_APP_ID: 'ca-app-pub-XXXXX~YYYYY',           // Dans app.json
  ADMOB_INTERSTITIAL_ID: 'ca-app-pub-XXXXX/YYYYY', // Dans ads.ts

  // RevenueCat
  REVENUECAT_API_KEY: 'appl_XXXXXXXXXXXX',          // API Key publique

  // Google Play
  SUBSCRIPTION_PRODUCT_ID: 'premium_monthly',        // Product ID

  // Legal
  PRIVACY_POLICY_URL: 'https://...',                 // URL hebergee
};
```

---

**Epic Owner:** A definir
**Reviewers:** Code Review Agent + Test Engineer Agent
