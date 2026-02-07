---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md']
---

# japanese_trainer - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for japanese_trainer, decomposing the requirements from the PRD into implementable stories. Projet brownfield — l'app est fonctionnelle, les epics couvrent les corrections pré-publication (Phase 1) puis les évolutions (Phases 2-3).

## Requirements Inventory

### Functional Requirements

- FR1: L'utilisateur peut lancer une session sur un niveau JLPT débloqué avec une difficulté choisie
- FR2: L'utilisateur peut voir un mot japonais qui défile à l'écran avec un temps d'exposition lié à la difficulté
- FR3: L'utilisateur peut saisir la prononciation romaji et recevoir un feedback immédiat (correct/incorrect)
- FR4: Le système normalise la saisie romaji pour accepter les variantes courantes (shi/si, chi/ti, fu/hu, etc.)
- FR5: L'utilisateur peut consulter la traduction d'un mot pendant la session (avec pénalité sur le score)
- FR6: Le système affiche les mots selon 3 modes : kana seul, kanji avec furigana, kanji sans furigana
- FR7: Le système construit des word pools multi-niveaux respectant le scaffolding i+1
- FR8: L'utilisateur peut accéder à 7 niveaux (Kana, N5, N4, N3, N2, N1)
- FR9: Le système débloque automatiquement le niveau suivant quand 100% des mots sont maîtrisés (≥5 points)
- FR10: L'utilisateur peut choisir parmi 4 difficultés (Facile, Normal, Difficile, Extrême)
- FR11: Le système score chaque mot : +1 si correct + premier essai + traduction non consultée, 0 sinon
- FR12: L'utilisateur peut voir sa progression par niveau sur l'écran d'accueil
- FR13: L'utilisateur peut consulter ses statistiques globales (points, tentatives, taux de réussite, mots maîtrisés)
- FR14: L'utilisateur peut consulter sa progression détaillée par niveau
- FR15: L'utilisateur peut naviguer vers le détail de progression d'un niveau spécifique
- FR16: L'utilisateur peut choisir sa langue de traduction (français ou anglais)
- FR17: L'utilisateur peut activer/désactiver l'affichage des furigana
- FR18: L'utilisateur peut configurer le nombre de mots par session (5 à 30, par pas de 5)
- FR19: Le système persiste les préférences localement entre les sessions
- FR20: L'utilisateur peut parcourir un tutoriel interactif (méthode, niveaux, difficultés, scoring)
- FR21: Le tutoriel s'affiche dans la langue de l'utilisateur (français ou anglais)
- FR22: L'utilisateur peut recevoir des rappels quotidiens configurables
- FR23: Les notifications sont locales uniquement (pas de serveur push)
- FR24: L'utilisateur voit des publicités interstitielles entre les sessions (AdMob)
- FR25: L'utilisateur peut acheter un accès premium pour supprimer les publicités (RevenueCat)
- FR26: L'utilisateur premium peut restaurer ses achats sur un nouveau device
- FR27: Le système fonctionne en mode gratuit complet si les services de monétisation sont indisponibles
- FR28: Le système charge les données JLPT depuis 5 fichiers JSON embarqués (N5 à N1)
- FR29: Le système persiste statistiques, progression et préférences localement sans connexion réseau
- FR30: Le système affiche l'interface et les traductions en français et en anglais

### NonFunctional Requirements

- NFR1: Animation de défilement des mots fluide à 60fps sur devices Android milieu de gamme
- NFR2: Chargement d'une session (word pools + premier mot) en moins de 1 seconde
- NFR3: Validation romaji (saisie → feedback modal) instantanée (<100ms)
- NFR4: Chargement des données JSON transparent (cache permanent après premier chargement)
- NFR5: Écran d'accueil affiché en moins de 2 secondes au lancement
- NFR6: Tous les boutons et éléments interactifs ont un accessibilityLabel descriptif
- NFR7: Les éléments pressables déclarent accessibilityRole="button"
- NFR8: Les états selected/disabled sont déclarés via accessibilityState
- NFR9: Contrastes de couleur suffisants en dark theme pour la lisibilité des caractères japonais
- NFR10: L'app fonctionne sans dégradation du gameplay si AdMob ou RevenueCat sont indisponibles
- NFR11: Les notifications locales fonctionnent sans connexion réseau
- NFR12: Timeout d'initialisation RevenueCat ≤5 secondes avant fallback en mode gratuit

### Additional Requirements

- Framework : Expo SDK 54, React Native 0.81.5, TypeScript strict
- UI : Tamagui exclusif (dark theme), portrait uniquement — pas de composants RN natifs
- Navigation : expo-router (file-based, Stack)
- Build : EAS Build (managed workflow, pas de code natif direct)
- Pattern service + hook : services = fonctions pures async, hooks = wrappers React
- Paradigme fonctionnel : pas de classes, pas de `this`
- Architecture 100% offline, AsyncStorage pour persistance
- Tests : Jest + Testing Library, coverage minimum 70%
- Accessibilité : accessibilityLabel obligatoire sur tous les éléments interactifs
- Privacy policy HTML conforme Google Play
- EAS Submit configuré (track=internal)
- Monétisation déclarée : ads (AdMob) + in-app purchase (RevenueCat)
- Corrections pré-publication : alignement versions, service account Google Play, test E2E device

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Lancer session niveau + difficulté |
| FR2 | Epic 1 | Mot japonais qui défile |
| FR3 | Epic 1 | Saisie romaji + feedback |
| FR4 | Epic 1 | Normalisation romaji |
| FR5 | Epic 1 | Consultation traduction |
| FR6 | Epic 1 | 3 modes affichage |
| FR7 | Epic 1 | Word pools scaffolding i+1 |
| FR8 | Epic 2 | 7 niveaux JLPT |
| FR9 | Epic 2 | Déblocage automatique |
| FR10 | Epic 2 | 4 difficultés |
| FR11 | Epic 2 | Scoring |
| FR12 | Epic 2 | Progression home |
| FR13 | Epic 3 | Stats globales |
| FR14 | Epic 3 | Stats par niveau |
| FR15 | Epic 3 | Navigation détail niveau |
| FR16 | Epic 4 | Langue traduction |
| FR17 | Epic 4 | Toggle furigana |
| FR18 | Epic 4 | Mots par session |
| FR19 | Epic 4 | Persistance préférences |
| FR20 | Epic 5 | Tutoriel interactif |
| FR21 | Epic 5 | Tutoriel bilingue |
| FR22 | Epic 6 | Rappels quotidiens |
| FR23 | Epic 6 | Notifications locales |
| FR24 | Epic 7 | Publicités AdMob |
| FR25 | Epic 7 | Premium RevenueCat |
| FR26 | Epic 7 | Restore achats |
| FR27 | Epic 7 | Graceful degradation |
| FR28 | Epic 1 | Données JLPT JSON |
| FR29 | Epic 4 | Persistance locale |
| FR30 | Epic 4 | Interface bilingue |

## Epic List

### Epic 1 : Entraînement à la Lecture Japonaise
L'utilisateur peut s'entraîner à lire des mots japonais avec un scaffolding progressif (kana → kanji+furigana → kanji seul) et recevoir un feedback immédiat sur sa prononciation romaji.
**FRs couverts :** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR28

### Epic 2 : Progression & Niveaux JLPT
L'utilisateur peut progresser à travers 7 niveaux JLPT, voir sa progression sur l'écran d'accueil, et débloquer automatiquement les niveaux suivants grâce à sa maîtrise.
**FRs couverts :** FR8, FR9, FR10, FR11, FR12

### Epic 3 : Statistiques & Suivi de Performance
L'utilisateur peut consulter ses statistiques globales et par niveau pour suivre sa progression et identifier ses points forts/faibles.
**FRs couverts :** FR13, FR14, FR15

### Epic 4 : Personnalisation & Réglages
L'utilisateur peut personnaliser son expérience (langue, furigana, mots par session) avec des préférences persistées localement. L'interface s'affiche en français et en anglais.
**FRs couverts :** FR16, FR17, FR18, FR19, FR29, FR30

### Epic 5 : Onboarding & Tutoriel
L'utilisateur peut découvrir la méthode d'apprentissage et comprendre l'app grâce à un tutoriel interactif bilingue.
**FRs couverts :** FR20, FR21

### Epic 6 : Notifications & Engagement
L'utilisateur reçoit des rappels quotidiens configurables pour maintenir une pratique régulière.
**FRs couverts :** FR22, FR23

### Epic 7 : Monétisation & Premium
L'utilisateur peut utiliser l'app gratuitement avec publicités, ou acheter un accès premium pour les supprimer. Le système fonctionne en mode gratuit si les services sont indisponibles.
**FRs couverts :** FR24, FR25, FR26, FR27

## Epic 1 : Entraînement à la Lecture Japonaise

L'utilisateur peut s'entraîner à lire des mots japonais avec un scaffolding progressif (kana → kanji+furigana → kanji seul) et recevoir un feedback immédiat sur sa prononciation romaji.

### Story 1.1 : Chargement et cache des données JLPT

As a utilisateur,
I want que l'app charge les données vocabulaire JLPT au démarrage,
So that je puisse m'entraîner immédiatement sans attente.

**Acceptance Criteria:**

**Given** l'app démarre pour la première fois
**When** le système charge les 5 fichiers JSON (N1-N5)
**Then** les données sont disponibles en mémoire en moins de 1 seconde
**And** les données sont cachées pour les lancements suivants (NFR4)
**And** chaque entrée contient : mot japonais, lecture kana, romaji, traductions FR/EN

### Story 1.2 : Construction des word pools avec scaffolding i+1

As a utilisateur,
I want que les mots proposés respectent le scaffolding progressif,
So that je rencontre d'abord les mots en kana avant de les voir en kanji.

**Acceptance Criteria:**

**Given** un niveau JLPT sélectionné (ex: N5)
**When** le système construit le word pool
**Then** le pool inclut des mots du niveau actuel et des niveaux maîtrisés
**And** les mots déjà maîtrisés en kana apparaissent en kanji+furigana puis kanji seul
**And** les mots non maîtrisés restent en kana

### Story 1.3 : Lancement d'une session d'entraînement

As a utilisateur,
I want lancer une session sur un niveau JLPT débloqué avec la difficulté de mon choix,
So that je puisse m'entraîner selon mes capacités.

**Acceptance Criteria:**

**Given** je suis sur l'écran d'accueil avec au moins un niveau débloqué
**When** je sélectionne un niveau et une difficulté puis lance la session
**Then** une session démarre avec le word pool correspondant
**And** le nombre de mots correspond à ma configuration (5-30)
**And** les niveaux verrouillés ne sont pas sélectionnables

### Story 1.4 : Défilement et affichage progressif des mots

As a utilisateur,
I want voir un mot japonais défiler à l'écran avec un temps d'exposition lié à la difficulté,
So that je puisse m'entraîner à la reconnaissance rapide.

**Acceptance Criteria:**

**Given** une session est en cours
**When** un mot s'affiche
**Then** le mot défile avec une animation fluide à 60fps (NFR1)
**And** le temps d'exposition varie selon la difficulté choisie
**And** le mot s'affiche dans l'un des 3 modes : kana seul, kanji+furigana, kanji seul
**And** le mode d'affichage respecte le scaffolding i+1 du mot

### Story 1.5 : Saisie romaji avec normalisation et feedback

As a utilisateur,
I want saisir la prononciation romaji d'un mot et recevoir un feedback immédiat,
So that je sache si j'ai correctement lu le mot.

**Acceptance Criteria:**

**Given** un mot a été affiché et le temps d'exposition est écoulé
**When** je saisis la prononciation en romaji et valide
**Then** le système compare ma saisie avec la lecture correcte en moins de 100ms (NFR3)
**And** le système normalise les variantes romaji (shi/si, chi/ti, fu/hu, tsu/tu, etc.)
**And** un feedback visuel immédiat indique correct (vert) ou incorrect (rouge)
**And** en cas d'erreur, la bonne réponse est affichée

### Story 1.6 : Consultation de traduction en session

As a utilisateur,
I want pouvoir consulter la traduction d'un mot pendant la session,
So that je puisse comprendre les mots que je ne connais pas.

**Acceptance Criteria:**

**Given** un mot est affiché pendant la session
**When** je demande à voir la traduction
**Then** la traduction s'affiche dans ma langue choisie (FR ou EN)
**And** le mot est marqué comme "traduction consultée" pour le scoring
**And** le point pour ce mot n'est pas attribué même si la réponse est correcte

## Epic 2 : Progression & Niveaux JLPT

L'utilisateur peut progresser à travers 7 niveaux JLPT, voir sa progression sur l'écran d'accueil, et débloquer automatiquement les niveaux suivants grâce à sa maîtrise.

### Story 2.1 : Structure des niveaux JLPT

As a utilisateur,
I want accéder à 7 niveaux d'apprentissage (Kana, N5, N4, N3, N2, N1),
So that je puisse progresser de manière structurée dans le vocabulaire JLPT.

**Acceptance Criteria:**

**Given** j'ouvre l'app pour la première fois
**When** je consulte les niveaux disponibles
**Then** le niveau Kana est débloqué par défaut
**And** les niveaux N5 à N1 sont verrouillés
**And** chaque niveau affiche son nombre total de mots

### Story 2.2 : Sélection de difficulté

As a utilisateur,
I want choisir parmi 4 niveaux de difficulté (Facile, Normal, Difficile, Extrême),
So that je puisse adapter le challenge à mon niveau.

**Acceptance Criteria:**

**Given** je lance une session sur un niveau débloqué
**When** je sélectionne une difficulté
**Then** le temps d'exposition des mots est ajusté en conséquence
**And** les 4 options sont clairement identifiées avec leurs caractéristiques
**And** la difficulté sélectionnée est appliquée à toute la session

### Story 2.3 : Scoring des mots

As a utilisateur,
I want que chaque mot soit scoré selon ma performance,
So that le système suive ma maîtrise de chaque mot.

**Acceptance Criteria:**

**Given** je réponds à un mot pendant une session
**When** ma réponse est évaluée
**Then** le mot reçoit +1 point si : réponse correcte ET premier essai ET traduction non consultée
**And** le mot reçoit 0 point sinon
**And** le score cumulé du mot est persisté localement

### Story 2.4 : Déblocage automatique des niveaux

As a utilisateur,
I want que le niveau suivant se débloque automatiquement quand j'ai maîtrisé le niveau actuel,
So that ma progression soit fluide et motivante.

**Acceptance Criteria:**

**Given** je termine une session sur un niveau
**When** 100% des mots du niveau ont un score ≥ 5 points (mastery)
**Then** le niveau suivant est automatiquement débloqué
**And** une notification visuelle confirme le déblocage
**And** le nouveau niveau est accessible depuis l'écran d'accueil

### Story 2.5 : Affichage de la progression sur l'écran d'accueil

As a utilisateur,
I want voir ma progression par niveau sur l'écran d'accueil,
So that je sache où j'en suis d'un coup d'oeil.

**Acceptance Criteria:**

**Given** j'ouvre l'app
**When** l'écran d'accueil s'affiche en moins de 2 secondes (NFR5)
**Then** chaque niveau affiche son pourcentage de mots maîtrisés
**And** les niveaux débloqués sont visuellement distincts des verrouillés
**And** la progression est à jour avec les dernières sessions

## Epic 3 : Statistiques & Suivi de Performance

L'utilisateur peut consulter ses statistiques globales et par niveau pour suivre sa progression et identifier ses points forts/faibles.

### Story 3.1 : Statistiques globales

As a utilisateur,
I want consulter mes statistiques globales d'apprentissage,
So that je puisse mesurer ma progression générale.

**Acceptance Criteria:**

**Given** j'accède à l'écran des statistiques
**When** les données sont chargées
**Then** je vois : total de points, nombre de tentatives, taux de réussite global, nombre de mots maîtrisés
**And** les statistiques reflètent l'ensemble de mes sessions tous niveaux confondus

### Story 3.2 : Progression détaillée par niveau

As a utilisateur,
I want consulter ma progression détaillée pour chaque niveau JLPT,
So that j'identifie mes points forts et faibles par niveau.

**Acceptance Criteria:**

**Given** j'accède à l'écran des statistiques
**When** je consulte la vue par niveau
**Then** chaque niveau affiche : mots maîtrisés/total, taux de réussite, points cumulés
**And** les niveaux non débloqués sont visibles mais marqués comme verrouillés

### Story 3.3 : Navigation vers le détail d'un niveau

As a utilisateur,
I want naviguer vers le détail de progression d'un niveau spécifique,
So that je puisse voir les mots individuels et leur statut de maîtrise.

**Acceptance Criteria:**

**Given** je suis sur l'écran des statistiques par niveau
**When** je sélectionne un niveau spécifique
**Then** je vois la liste des mots de ce niveau avec leur score individuel
**And** les mots maîtrisés (≥5) sont visuellement distingués des non-maîtrisés
**And** je peux revenir à la vue d'ensemble

## Epic 4 : Personnalisation & Réglages

L'utilisateur peut personnaliser son expérience (langue, furigana, mots par session) avec des préférences persistées localement. L'interface s'affiche en français et en anglais.

### Story 4.1 : Choix de langue et interface bilingue

As a utilisateur,
I want choisir ma langue de traduction (français ou anglais),
So that je voie les traductions et l'interface dans la langue qui me convient.

**Acceptance Criteria:**

**Given** j'accède aux réglages
**When** je sélectionne français ou anglais
**Then** les traductions des mots s'affichent dans la langue choisie
**And** l'interface de l'app s'adapte à la langue sélectionnée
**And** le changement est immédiat sans redémarrage

### Story 4.2 : Toggle furigana

As a utilisateur,
I want activer ou désactiver l'affichage des furigana,
So that je puisse choisir mon niveau de support visuel.

**Acceptance Criteria:**

**Given** j'accède aux réglages
**When** je toggle l'option furigana
**Then** les sessions suivantes respectent ce réglage
**And** si désactivé, les mots passent directement de kana à kanji sans furigana intermédiaire

### Story 4.3 : Configuration du nombre de mots par session

As a utilisateur,
I want configurer le nombre de mots par session (5 à 30),
So that j'adapte la durée de mes sessions à mon temps disponible.

**Acceptance Criteria:**

**Given** j'accède aux réglages
**When** je sélectionne le nombre de mots (par pas de 5 : 5, 10, 15, 20, 25, 30)
**Then** les sessions suivantes utilisent ce nombre de mots
**And** la valeur par défaut est raisonnable (ex: 10)

### Story 4.4 : Persistance des préférences et données

As a utilisateur,
I want que mes préférences et mes données soient sauvegardées localement,
So that je retrouve mon état d'avancement à chaque ouverture.

**Acceptance Criteria:**

**Given** je modifie un réglage ou termine une session
**When** l'app se ferme puis se rouvre
**Then** tous mes réglages sont restaurés (langue, furigana, mots/session)
**And** mes statistiques et scores par mot sont intacts
**And** ma progression de déblocage est conservée
**And** aucune connexion réseau n'est requise pour la persistance

## Epic 5 : Onboarding & Tutoriel

L'utilisateur peut découvrir la méthode d'apprentissage et comprendre l'app grâce à un tutoriel interactif bilingue.

### Story 5.1 : Tutoriel interactif bilingue

As a utilisateur,
I want parcourir un tutoriel qui m'explique la méthode progressive,
So that je comprenne comment l'app m'aide à lire le japonais.

**Acceptance Criteria:**

**Given** j'ouvre l'app pour la première fois ou j'accède au tutoriel depuis les réglages
**When** je lance le tutoriel
**Then** 6 étapes m'expliquent : la méthode de scaffolding, les niveaux JLPT, les difficultés, le scoring, les modes d'affichage
**And** le tutoriel s'affiche dans ma langue (FR ou EN selon le réglage)
**And** je peux naviguer entre les étapes (suivant/précédent)
**And** je peux quitter le tutoriel à tout moment

## Epic 6 : Notifications & Engagement

L'utilisateur reçoit des rappels quotidiens configurables pour maintenir une pratique régulière.

### Story 6.1 : Rappels quotidiens configurables

As a utilisateur,
I want recevoir un rappel quotidien pour m'entraîner,
So that je maintienne une pratique régulière.

**Acceptance Criteria:**

**Given** j'accède aux réglages de notifications
**When** j'active les rappels et configure l'heure
**Then** je reçois une notification locale quotidienne à l'heure choisie
**And** les notifications fonctionnent sans connexion réseau (NFR11)
**And** je peux désactiver les rappels à tout moment
**And** le système demande la permission de notification au premier usage

## Epic 7 : Monétisation & Premium

L'utilisateur peut utiliser l'app gratuitement avec publicités, ou acheter un accès premium pour les supprimer. Le système fonctionne en mode gratuit si les services sont indisponibles. Phase 2 — désactivé pour test interne.

### Story 7.1 : Publicités interstitielles AdMob

As a utilisateur gratuit,
I want que les publicités ne perturbent pas mon entraînement,
So that l'expérience reste fluide malgré les pubs.

**Acceptance Criteria:**

**Given** je termine une session d'entraînement
**When** je reviens à l'écran d'accueil
**Then** une publicité interstitielle peut s'afficher entre les sessions
**And** les publicités n'apparaissent jamais pendant une session
**And** si AdMob est indisponible, aucune erreur n'est affichée (NFR10)

### Story 7.2 : Achat premium sans publicités

As a utilisateur,
I want acheter un accès premium pour supprimer les publicités,
So that j'aie une expérience sans interruption.

**Acceptance Criteria:**

**Given** j'accède à l'option premium (paywall)
**When** je procède à l'achat via RevenueCat
**Then** les publicités sont supprimées immédiatement
**And** mon statut premium est persisté localement
**And** l'achat est lié à mon compte Google Play

### Story 7.3 : Restauration des achats

As a utilisateur premium,
I want restaurer mon achat sur un nouveau device,
So that je ne paie pas deux fois.

**Acceptance Criteria:**

**Given** j'ai déjà acheté l'accès premium sur un autre appareil
**When** je clique sur "Restaurer les achats"
**Then** mon statut premium est restauré via RevenueCat
**And** les publicités sont supprimées
**And** si la restauration échoue, un message d'erreur clair s'affiche

### Story 7.4 : Mode gratuit graceful degradation

As a utilisateur,
I want que l'app fonctionne parfaitement même si les services de monétisation sont indisponibles,
So that mon expérience d'apprentissage ne soit jamais bloquée.

**Acceptance Criteria:**

**Given** l'app démarre sans connexion réseau ou les services AdMob/RevenueCat sont indisponibles
**When** le timeout d'initialisation RevenueCat est atteint (≤5s, NFR12)
**Then** l'app passe en mode gratuit complet sans publicités
**And** toutes les fonctionnalités d'entraînement restent accessibles
**And** aucune erreur n'est affichée à l'utilisateur
