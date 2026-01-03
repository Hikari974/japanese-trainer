# Guide Monetisation App Android - Japanese Trainer

## Resume Executif

**Projet :** App avec pub en debut de session + abonnement premium 1EUR/mois

**Configuration choisie :**
- Pub : **Interstitial** (plein ecran, skip apres 5s)
- Premium : **Suppression des pubs uniquement**
- Compte Google Play : **Deja existant**

**Verdict : FAISABLE** - Configuration simple et claire.

---

## 1. Couts et Frais Google Play

### Frais initiaux
| Element | Cout |
|---------|------|
| Compte developpeur Google Play | **25$ une seule fois** (deja fait) |
| Hebergement app | Gratuit |

### Commissions sur les revenus

| Type de revenu | Commission Google |
|----------------|-------------------|
| Abonnements (1ere annee) | **15%** |
| Abonnements (apres 1 an avec meme utilisateur) | **10%** |
| In-app purchases | **15%** (jusqu'a 1M$/an) |
| Revenus publicitaires AdMob | **0%** (tu gardes 100%) |

**Calcul pour ton abonnement 1EUR/mois :**
- Tu recois : **0,85EUR/mois** par abonne (apres 15% Google)
- Apres 1 an de fidelite : **0,90EUR/mois** par abonne

---

## 2. Solutions Techniques pour Expo

### A. Pour les Abonnements (In-App Purchases)

**Solution recommandee : RevenueCat**
- Site : https://www.revenuecat.com/docs/getting-started/installation/expo

| Aspect | Detail |
|--------|--------|
| Package | `react-native-purchases` |
| Cout RevenueCat | **Gratuit** jusqu'a 2,500$/mois de revenus |
| Compatibilite Expo | Oui (avec Development Build) |
| Avantages | Gere iOS + Android + Web, analytics inclus |

**Limitations importantes :**
- Ne fonctionne PAS avec Expo Go
- Necessite un **Development Build** (`npx expo prebuild`)
- Tests reels uniquement sur device physique

**Alternative :** expo-iap (https://github.com/hyochan/expo-iap) - plus manuel, moins de features

### B. Pour les Publicites (Ads)

**Solution recommandee : react-native-google-mobile-ads**

| Aspect | Detail |
|--------|--------|
| Package | `react-native-google-mobile-ads` |
| Note | `expo-ads-admob` est **DEPRECIE** |
| Compatibilite | Expo Development Build uniquement |
| Types de pubs | Banner, Interstitial, Rewarded |

**Pour ton cas "pub en debut de session" :**
- Type choisi : **Interstitial** (plein ecran, skip apres 5s)

---

## 3. Exigences Legales Obligatoires

### A. Privacy Policy (Politique de Confidentialite)

**OBLIGATOIRE pour Google Play**

Tu dois avoir une privacy policy qui explique :
- Quelles donnees tu collectes (stats locales, preferences)
- Comment tu les utilises
- Avec qui tu les partages (Google AdMob, RevenueCat)

**Ou l'afficher :**
1. Sur ta page Google Play Store
2. Dans l'app (ecran Settings)
3. Sur un site web accessible

**Solutions gratuites :**
- Termly (https://termly.io/) - Generateur gratuit
- Iubenda (https://www.iubenda.com/) - Plan gratuit disponible

### B. Data Safety Form

Formulaire Google Play obligatoire declarant :
- Types de donnees collectees
- But de la collecte
- Si les donnees sont partagees

### C. RGPD (si utilisateurs EU)

- Consentement cookies/tracking AdMob
- Droit de suppression des donnees
- Transparence sur l'utilisation

---

## 4. Impact Technique sur l'App

### Changements Workflow Developpement

| Avant | Apres |
|-------|-------|
| Expo Go pour tester | Development Build obligatoire |
| `npx expo start` | `npx expo run:android` |
| Build rapide | Build plus long (~5-10 min) |

### Fichiers a Creer/Modifier

```
app.json / app.config.js
  - Ajouter plugin AdMob
  - Ajouter IDs AdMob (Android/iOS)
  - Configurer RevenueCat

Nouveaux fichiers
  src/services/ads.ts          (gestion pubs)
  src/services/subscription.ts (gestion premium)
  src/hooks/usePremium.ts      (etat premium)
  src/components/Paywall.tsx   (ecran achat)
```

### Architecture Premium

```
User lance session d'entrainement
    |
    +-- Est Premium ? -- OUI -- Session directe (pas de pub)
    |
    +-- NON -- Afficher pub Interstitial plein ecran
                    |
                    +-- User ferme/skip pub (apres 5s)
                            |
                            +-- Session normale
```

**Logique simple :**
- 1 seule verification : `isPremium` (boolean dans AsyncStorage)
- Si premium = pas de pub
- Si pas premium = pub interstitial avant chaque session

---

## 5. Estimation Revenus

### Scenario Publicites (AdMob Interstitial)

| Metrique | Valeur typique |
|----------|---------------|
| eCPM Europe | 2-5EUR pour 1000 impressions |
| Si 1000 users/jour | ~2-5EUR/jour = 60-150EUR/mois |

### Scenario Abonnements

| Utilisateurs actifs | Taux conversion | Abonnes | Revenu net/mois |
|---------------------|-----------------|---------|-----------------|
| 1,000 | 2% | 20 | 17EUR |
| 5,000 | 2% | 100 | 85EUR |
| 10,000 | 2% | 200 | 170EUR |

**Note :** Taux de conversion typique freemium = 1-5%

---

## 6. Checklist Avant Publication

### Compte Google Play (deja fait)
- [x] Creer compte developpeur (25$)
- [ ] Verifier que les infos bancaires sont configurees

### Legal
- [ ] Creer Privacy Policy
- [ ] Heberger Privacy Policy sur URL accessible
- [ ] Remplir Data Safety Form Google Play

### Technique
- [ ] Passer a Development Build
- [ ] Integrer RevenueCat
- [ ] Creer produit abonnement dans Google Play Console
- [ ] Integrer AdMob
- [ ] Creer compte AdMob et ad units
- [ ] Tester sur devices reels

### App Store Listing
- [ ] Screenshots (min 2)
- [ ] Description
- [ ] Icone 512x512
- [ ] Feature graphic 1024x500

---

## 7. Timeline Realiste

| Phase | Duree estimee |
|-------|---------------|
| Setup comptes (AdMob, RevenueCat) | 1-2 jours |
| Integration technique ads + subscriptions | 3-5 jours |
| Tests et debug | 2-3 jours |
| Creation assets store + legal | 1-2 jours |
| Review Google Play | 1-7 jours |
| **Total** | **~2-3 semaines** |

---

## 8. Verdict Final

### Points Positifs
- **Faisable** avec Expo SDK 54
- **RevenueCat gratuit** pour demarrer
- **Commission Google raisonnable** (15%)
- App avec bonne base technique
- **Compte Google Play deja pret** = 0EUR de frais initial
- **Logique simple** : premium = pas de pub (facile a implementer)

### Points d'Attention
- Passage oblige au **Development Build** (plus de Expo Go)
- Privacy Policy **obligatoire** (mais generateurs gratuits existent)
- Tests plus complexes (devices reels ou emulateur)
- Premier setup AdMob + RevenueCat peut prendre 1-2 jours

### Recommandation

**GO !** Configuration ideale pour debuter :
- Logique simple (premium = no ads)
- Compte Google Play deja pret
- Outils matures et gratuits
- Faible risque financier (0EUR de cout initial)

---

## Sources

- RevenueCat Expo Integration : https://www.revenuecat.com/docs/getting-started/installation/expo
- Expo In-App Purchases Guide : https://docs.expo.dev/guides/in-app-purchases/
- Google Play Service Fees : https://support.google.com/googleplay/android-developer/answer/112622
- AdMob React Native Guide : https://dev.to/oghenetega_adiri/integrating-admob-in-react-native-expo-a-comprehensive-developers-guide-35ij
- Google Play Privacy Policy Requirements : https://support.google.com/googleplay/android-developer/answer/10144311
- SplitMetrics App Store Fees 2025 : https://splitmetrics.com/blog/google-play-apple-app-store-fees/

---

**Document cree le :** 2025-11-30
**Statut :** En attente d'implementation (Epic-007)