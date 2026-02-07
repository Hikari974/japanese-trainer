---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['_bmad-output/planning-artifacts/product-brief-japanese_trainer-2026-02-07.md', '_bmad-output/project-context.md']
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 0
  projectDocs: 1
  projectContext: 1
classification:
  projectType: 'mobile_app'
  domain: 'edtech'
  complexity: 'medium'
  projectContext: 'brownfield'
---

# Product Requirements Document - japanese_trainer

**Author:** Laurent
**Date:** 2026-02-07

## Executive Summary

japanese_trainer entraîne la **fluidité de lecture japonaise** via un scaffolding progressif kana → kanji avec furigana → kanji seul. L'utilisateur voit un mot qui défile et écrit sa prononciation en romaji (active recall). Le vocabulaire JLPT (N5→N1) structure la progression.

**Différenciateur :** Aucune app ne propose cette transition progressive kana → kanji à travers des mots déjà connus, avec entraînement à la reconnaissance rapide. Les kanji s'apprennent dans des mots complets, pas isolément.

**Projet brownfield** — l'app est fonctionnelle. Ce PRD couvre la validation pour test interne Google Play, puis les phases d'évolution.

**Cibles :** Autodidactes du japonais (kana acquis) — voyageurs voulant lire au Japon, passionnés de manga/anime voulant lire en VO.

## User Journeys

### Journey 1 — Le Voyageur Autonome (Parcours principal)

**Persona :** Adulte (25-45 ans), maîtrise les kana, bloqué aux kanji. A essayé 2-3 apps. Veut lire menus et panneaux au Japon.

**Opening Scene :** Frustré après des mois sur WaniKani — connaît des kanji isolés mais ne lit pas un menu japonais. Découvre japanese_trainer sur le Play Store.

**Rising Action :** Lance le tutoriel, comprend la méthode progressive. Premières sessions Kana — lit たべる, écrit "taberu". Facile, confiance. Débloque N5, voit 食べる avec furigana. Fait le lien : "ah, c'est たべる en kanji !"

**Climax :** Voit 食べる sans furigana pour la première fois. Le reconnaît directement sans réfléchir.

**Resolution :** Au Japon, lit 居酒屋 sur une enseigne et comprend instantanément "izakaya". Commande au restaurant sans aide.

---

### Journey 2 — Le Lecteur de Contenu (Parcours alternatif)

**Persona :** Jeune adulte (18-35 ans), fan de manga/anime. Vocabulaire passif oral, mais ne fait pas le lien à l'écrit en kanji.

**Opening Scene :** Reconnaît des mots à l'oral grâce aux anime, mais devant un manga en VO, bloque sur les kanji. Les apps de flashcards l'ennuient.

**Rising Action :** Sessions courtes (5-10 min) entre deux activités. La progression rapide via le scaffolding maintient l'intérêt. Progresse à travers N5, N4.

**Climax :** Ouvre un manga en VO et lit une bulle entière sans dictionnaire.

**Resolution :** Lit du contenu japonais original avec fluidité croissante. Le kanji n'est plus un obstacle.

### Journey Requirements Summary

| Journey | Capabilities révélées |
|---------|----------------------|
| Voyageur — happy path | Onboarding clair, sessions configurables, scaffolding progressif, déblocage niveaux, feedback immédiat |
| Lecteur — parcours alternatif | Sessions courtes, progression rapide, maintien de l'engagement, variété suffisante |
| Commun | Tutoriel bilingue, statistiques motivantes, notifications de rappel, réglages personnalisables |

## Success Criteria

### User Success

- Sessions complétées sans crash ni bug bloquant
- Les testeurs débloquent au moins N5 en utilisation régulière
- Taux de réussite en kanji seul augmente vs baseline session 1
- Utilisation régulière maintenue après 2+ semaines

### Business Success

- **Court terme :** App stable, méthode produit des résultats mesurables
- **Moyen terme :** 100€/mois de revenus Android (AdMob + premium sans pubs), acquisition organique
- **Long terme :** Financer iOS avec revenus Android, modèle économique adapté Apple

### Technical Success

- Build EAS réussi, installation sur device test sans erreur
- Statistiques cohérentes avec le gameplay
- Notifications fonctionnelles sur Android
- Tutoriel bilingue complet (6 étapes FR + EN)

### Measurable Outcomes

| KPI | Cible | Mesure |
|-----|-------|--------|
| Revenus mensuels Android | 100€ | AdMob + RevenueCat |
| Sessions par utilisateur/semaine | ≥ 3 | Analytics |
| Rétention J+7 | ≥ 30% | Play Store / Analytics |
| Note Play Store | ≥ 4.0 | Play Console |
| Taux kanji seul après 30 sessions | > 30% | Données app |

### Critères d'Échec

- Taux kanji seul < 30% après 30 sessions → Plan B : exercices de renforcement ciblés
- Lassitude testeurs avant N4 → monotonie = problème prioritaire

## Product Scope & Phased Development

### MVP Strategy

**Approche :** Problem-Solving MVP — valider l'hypothèse pédagogique (scaffolding i+1 développe la fluidité de lecture) avec des testeurs réels.

**Ressources :** Solo dev. Build EAS, distribution Google Play test interne. Pas de budget marketing.

### Phase 1 — MVP (Test Interne)

**Projet brownfield — features déjà implémentées :**
1. Boucle d'entraînement complète (sessions, romaji, validation, scoring)
2. 6 niveaux JLPT + Kana avec scaffolding i+1
3. Système de progression et déblocage automatique (mastery ≥5 points)
4. Statistiques détaillées par niveau et globales
5. Tutoriel bilingue FR/EN, réglages, notifications quotidiennes
6. Infrastructure monétisation (désactivée pour test interne)
7. Privacy policy conforme Google Play

**Corrections pré-publication :**
- Alignement versions (app.json / package.json / settings.tsx)
- Service account Google Play pour EAS Submit
- Test end-to-end complet sur device Android

### Phase 2 — Growth (Post-validation)

- Activation monétisation (AdMob + RevenueCat)
- Enrichissement données N1 (actuellement sparse)
- Variété gameplay : défis chronométrés, révisions ciblées, modes alternatifs
- Crash reporting / analytics
- Phrases complètes & contexte de lecture (évolution architecturale significative)

### Phase 3 — Expansion

- Test de placement initial pour apprenants intermédiaires
- Modes de validation alternatifs (sélection du sens, audio)
- Version iOS (financée par revenus Android)

### Risk Mitigation

| Risque | Mitigation |
|--------|------------|
| Normalisation romaji incomplète → faux négatifs | Tests exhaustifs de `normalizeRomaji()` avant publication |
| Données N1 sparse (26 lignes) | Enrichir avant que des testeurs atteignent ce niveau |
| Scaffolding insuffisant pour lecture kanji | Critère d'échec (<30% après 30 sessions) + Plan B (exercices de renforcement) |
| Monotonie des sessions | Variété gameplay en Phase 2 |
| Solo dev = pas de backup | App simple, scope minimal, pas de backend |
| Coûts Apple Store | Financer iOS avec revenus Android validés |

## Mobile App Specific Requirements

### Platform Requirements

- **Framework :** Expo SDK 54, React Native 0.81.5, TypeScript strict
- **UI :** Tamagui (dark theme exclusif), portrait uniquement
- **Navigation :** expo-router (file-based, Stack)
- **Build :** EAS Build (managed workflow, pas de code natif direct)
- **Cible initiale :** Android (Google Play Store, test interne)
- **Cible future :** iOS (Apple Store, financé par revenus Android)

### Offline & Persistance

- Architecture 100% offline — aucune connexion réseau requise pour le gameplay
- Données statiques : 5 fichiers JSON JLPT embarqués (n1-n5.json)
- Persistance locale : AsyncStorage pour statistiques, préférences, progression
- Monétisation : AdMob + RevenueCat nécessitent une connexion (graceful degradation si offline)

### Notifications

- Rappels quotidiens configurables via expo-notifications (notifications locales uniquement)

### Store Compliance

- Privacy policy HTML conforme Google Play
- EAS Submit configuré (track=internal)
- Content rating : app éducative, pas de contenu sensible
- Monétisation déclarée : ads (AdMob) + in-app purchase (RevenueCat)

### Implementation Constraints

- Tamagui exclusif — pas de composants React Native natifs (View, TouchableOpacity, StyleSheet)
- Pattern service + hook — services = fonctions pures async, hooks = wrappers React
- Paradigme fonctionnel — pas de classes, pas de `this`
- Tests : Jest + Testing Library, coverage minimum 70%
- Accessibilité : accessibilityLabel obligatoire sur tous les éléments interactifs

## Functional Requirements

### Entraînement à la Lecture

- FR1: L'utilisateur peut lancer une session sur un niveau JLPT débloqué avec une difficulté choisie
- FR2: L'utilisateur peut voir un mot japonais qui défile à l'écran avec un temps d'exposition lié à la difficulté
- FR3: L'utilisateur peut saisir la prononciation romaji et recevoir un feedback immédiat (correct/incorrect)
- FR4: Le système normalise la saisie romaji pour accepter les variantes courantes (shi/si, chi/ti, fu/hu, etc.)
- FR5: L'utilisateur peut consulter la traduction d'un mot pendant la session (avec pénalité sur le score)
- FR6: Le système affiche les mots selon 3 modes : kana seul, kanji avec furigana, kanji sans furigana
- FR7: Le système construit des word pools multi-niveaux respectant le scaffolding i+1

### Progression & Niveaux

- FR8: L'utilisateur peut accéder à 7 niveaux (Kana, N5, N4, N3, N2, N1)
- FR9: Le système débloque automatiquement le niveau suivant quand 100% des mots sont maîtrisés (≥5 points)
- FR10: L'utilisateur peut choisir parmi 4 difficultés (Facile, Normal, Difficile, Extrême)
- FR11: Le système score chaque mot : +1 si correct + premier essai + traduction non consultée, 0 sinon
- FR12: L'utilisateur peut voir sa progression par niveau sur l'écran d'accueil

### Statistiques

- FR13: L'utilisateur peut consulter ses statistiques globales (points, tentatives, taux de réussite, mots maîtrisés)
- FR14: L'utilisateur peut consulter sa progression détaillée par niveau
- FR15: L'utilisateur peut naviguer vers le détail de progression d'un niveau spécifique

### Réglages & Personnalisation

- FR16: L'utilisateur peut choisir sa langue de traduction (français ou anglais)
- FR17: L'utilisateur peut activer/désactiver l'affichage des furigana
- FR18: L'utilisateur peut configurer le nombre de mots par session (5 à 30, par pas de 5)
- FR19: Le système persiste les préférences localement entre les sessions

### Onboarding & Tutoriel

- FR20: L'utilisateur peut parcourir un tutoriel interactif (méthode, niveaux, difficultés, scoring)
- FR21: Le tutoriel s'affiche dans la langue de l'utilisateur (français ou anglais)

### Notifications

- FR22: L'utilisateur peut recevoir des rappels quotidiens configurables
- FR23: Les notifications sont locales uniquement (pas de serveur push)

### Monétisation (Phase 2)

- FR24: L'utilisateur voit des publicités interstitielles entre les sessions (AdMob)
- FR25: L'utilisateur peut acheter un accès premium pour supprimer les publicités (RevenueCat)
- FR26: L'utilisateur premium peut restaurer ses achats sur un nouveau device
- FR27: Le système fonctionne en mode gratuit complet si les services de monétisation sont indisponibles

### Données & Persistance

- FR28: Le système charge les données JLPT depuis 5 fichiers JSON embarqués (N5 à N1)
- FR29: Le système persiste statistiques, progression et préférences localement sans connexion réseau
- FR30: Le système affiche l'interface et les traductions en français et en anglais

## Non-Functional Requirements

### Performance

- NFR1: Animation de défilement des mots fluide à 60fps sur devices Android milieu de gamme
- NFR2: Chargement d'une session (word pools + premier mot) en moins de 1 seconde
- NFR3: Validation romaji (saisie → feedback modal) instantanée (<100ms)
- NFR4: Chargement des données JSON transparent (cache permanent après premier chargement)
- NFR5: Écran d'accueil affiché en moins de 2 secondes au lancement

### Accessibilité

- NFR6: Tous les boutons et éléments interactifs ont un accessibilityLabel descriptif
- NFR7: Les éléments pressables déclarent accessibilityRole="button"
- NFR8: Les états selected/disabled sont déclarés via accessibilityState
- NFR9: Contrastes de couleur suffisants en dark theme pour la lisibilité des caractères japonais

### Intégration

- NFR10: L'app fonctionne sans dégradation du gameplay si AdMob ou RevenueCat sont indisponibles
- NFR11: Les notifications locales fonctionnent sans connexion réseau
- NFR12: Timeout d'initialisation RevenueCat ≤5 secondes avant fallback en mode gratuit
