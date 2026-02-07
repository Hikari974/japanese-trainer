---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['_bmad-output/project-context.md']
date: '2026-02-07'
author: 'Laurent'
---

# Product Brief: japanese_trainer

## Executive Summary

**En une phrase :** japanese_trainer entraîne votre cerveau à lire le japonais naturellement — mot par mot, niveau par niveau.

japanese_trainer est une app mobile qui entraîne la **fluidité de lecture japonaise** — pas le vocabulaire isolé, pas la traduction, mais la capacité à **lire rapidement** des mots en caractères japonais. L'utilisateur voit un mot qui défile et écrit sa prononciation en romaji (active recall).

L'approche repose sur un **scaffolding progressif** : les mêmes mots sont rencontrés d'abord en kana, puis en kanji avec furigana, puis en kanji seul — à travers les sessions et les niveaux JLPT (Kana → N5 → N1). Les kanji s'apprennent dans des mots complets, pas isolément.

**Différenciateur clé :** Aucune app ne propose cette transition progressive kana → kanji à travers des mots déjà connus, avec entraînement à la reconnaissance rapide.

**Phase actuelle :** Finalisation pour tests internes sur Google Play Store avant mise en production payante.

---

## Core Vision

### Problem Statement

Les apprenants du japonais en autodidacte maîtrisent généralement les kana (hiragana/katakana) mais bloquent au passage aux kanji. Les solutions existantes (Duolingo, WaniKani, Anki) enseignent le vocabulaire ou les kanji de manière isolée — résultat : en situation réelle (lire un menu, un panneau, un texte), la lecture ne "revient pas" naturellement. L'utilisateur déchiffre lentement au lieu de lire avec fluidité — or la lecture utile nécessite rapidité et automatisme. Un apprenant peut connaître 食 et べる séparément sur WaniKani, mais ne pas *lire* 食べる naturellement dans un texte.

De plus, le problème des **lectures multiples des kanji** (音読み/訓読み) décourage massivement : le kanji 生 possède plus de 10 lectures possibles. Les apps qui enseignent les kanji isolément forcent l'apprenant à mémoriser ces listes abstraites — alors qu'en lisant 生きる (いきる), 先生 (せんせい), 生活 (せいかつ) comme des mots complets, les lectures s'acquièrent naturellement sans liste à mémoriser.

### Problem Impact

- Les apprenants investissent du temps dans des apps sans pouvoir lire en situation réelle
- Le mur des kanji décourage et provoque l'abandon de l'apprentissage
- Les multiples lectures d'un même kanji créent une complexité perçue insurmontable quand apprises isolément
- En voyage ou au quotidien, l'incapacité à lire rapidement limite fortement l'autonomie
- Le déchiffrement lent empêche une lecture fonctionnelle même avec un vocabulaire connu
- L'absence de sentiment de progression sur les apps existantes réduit la rétention

### Why Existing Solutions Fall Short

- **Apps de vocabulaire** (Duolingo, Memrise) : traduction via reconnaissance passive (QCM), pas la lecture active
- **Apps de kanji** (WaniKani, Kanji Study) : kanji isolés avec lectures abstraites — en situation réelle, on lit des mots complets
- **Flashcards** (Anki) : pas de progression visuelle structurée, pas de respect du i+1, pas d'entraînement à la fluidité
- **Aucune app** ne propose une transition progressive kana → kanji à travers des mots déjà connus avec active recall

---

## Solution

### Approche

L'utilisateur voit un mot japonais qui **défile à l'écran** et doit écrire sa prononciation en romaji — une forme d'**active recall** bien plus efficace que la reconnaissance passive des QCM. Le romaji est un **outil de validation de la lecture**, pas un objectif en soi : il prouve que l'utilisateur a lu le mot. L'objectif à terme est la reconnaissance directe kanji → sens. La traduction du mot est consultable à la demande comme aide contextuelle.

Le temps d'exposition est **lié au niveau de difficulté sélectionné** (Facile/Normal/Difficile/Extrême), permettant d'adapter la pression temporelle au niveau de confort de l'apprenant.

La **boucle de feedback est intentionnellement courte** : lire → écrire → valider. Pas de gamification excessive, pas de distractions — friction minimale entre l'acte de lire et le feedback. Cette simplicité est un choix délibéré.

**Expérience session :** Chaque session dure **2 à 10 minutes** selon le nombre de mots configuré par l'utilisateur (5 à 30 mots par session). L'apprenant contrôle son investissement temporel et peut s'entraîner régulièrement en sessions courtes.

### Mécanisme des Word Pools

Le système de **scaffolding pédagogique** respecte le principe du **comprehensible input (i+1)**. Chaque session mélange des word pools de niveaux différents avec des modes d'affichage progressifs :
- **Mots du niveau précédent** en kanji sans furigana — consolidation de la lecture autonome
- **Mots du niveau actuel** en kanji avec furigana — apprentissage avec aide visuelle
- **Mots du niveau suivant** en kana — découverte du nouveau vocabulaire

Ainsi, un mot comme 食べる est d'abord rencontré en kana (たべる) au niveau inférieur, puis en kanji avec furigana au niveau suivant, et enfin en kanji seul quand l'apprenant progresse — cette progression se fait **à travers les sessions et les niveaux**, pas au sein d'une même session.

Les lectures multiples des kanji s'acquièrent **dans des mots complets** : 生きる, 先生, 生活 enseignent naturellement 3 lectures de 生 sans jamais présenter une liste abstraite.

Le vocabulaire JLPT (N5 à N1) fournit les mots les plus fréquemment utilisés au Japon, organisés par niveau de difficulté. Les données sont issues de sources JLPT de référence et validées manuellement. Le système de déblocage progressif (maîtriser un niveau pour accéder au suivant) nourrit le sentiment de progression.

### Prérequis & Onboarding

L'app s'adresse aux apprenants ayant une **connaissance de base des kana**. Le niveau Kana (mots N5 en kana-only) sert à renforcer la fluidité de lecture des kana et à découvrir le vocabulaire de base — pas à apprendre les caractères kana eux-mêmes. Un écran d'onboarding clarifie ce prérequis et redirige les débutants complets vers des ressources externes. Un tutoriel intégré guide l'utilisateur dans la compréhension de la méthode.

### Key Differentiators

- **Lecture d'abord, vocabulaire en secondaire** — inverse l'approche classique : on apprend à lire, le vocabulaire suit naturellement
- **Active recall, pas reconnaissance passive** — écrire le romaji vs choisir parmi des QCM
- **Entraînement à la fluidité de lecture** — le défilement des mots développe la reconnaissance instinctive par exposition répétée
- **Scaffolding i+1 multi-niveaux** — chaque session mélange consolidation (kanji seul), apprentissage (kanji+furigana) et découverte (kana) via des word pools de niveaux différents
- **Lectures multiples dans des mots complets** — les kanji s'apprennent dans des mots entiers, pas comme des listes abstraites (ex: 生 appris via 生きる, 先生, 生活)
- **Boucle feedback ultra-courte** — lire → écrire → valider, sans distraction ni gamification excessive
- **Basé sur le JLPT** — le vocabulaire le plus fréquent au Japon, structuré par niveau, données validées
- **Progression motivante** — système de déblocage par niveau qui nourrit le sentiment d'avancement
- **App bilingue FR/EN** — interface et traductions en français et anglais, différenciateur sur le marché francophone où les apps de japonais de qualité sont majoritairement en anglais
- **First mover sur l'approche lecture progressive** — itération rapide basée sur données réelles d'apprentissage

---

## Roadmap

### Phase 1 — MVP Tests Internes

Sessions de mots isolés avec scaffolding progressif. Objectif : **valider que la fluidité de lecture se développe** mesurablément chez les testeurs.

Post-validation : explorer la variété de gameplay (défis chronométrés, révisions ciblées, modes alternatifs) pour contrer la monotonie potentielle des sessions répétitives.

### Phase 2 — Phrases & Contexte (critique)

Phrases complètes pour introduire le **contexte de lecture** — chaînon essentiel entre la reconnaissance de mots isolés et la lecture en situation quotidienne.

**Note :** La phase 2 représente une **évolution architecturale significative** — nouveau format de données (phrases vs mots isolés), nouveau mode d'affichage, et adaptation du mécanisme de validation (le romaji mot-par-mot devra évoluer pour des phrases). Ce n'est pas un simple ajout de contenu.

### Phase 3+ — Extensions futures

- Test de placement initial pour apprenants intermédiaires (N3+)
- Mode découverte kana pour débutants complets
- Modes de validation alternatifs au romaji (sélection du sens, audio)

---

## Validation & Risques

### Profil Testeurs

2-3 apprenants débutants (kana acquis, cible principale du MVP) + le développeur comme testeur avancé. **Baseline obligatoire :** mesurer le taux de réussite à la session 1 par mode d'affichage pour comparer avec les sessions suivantes — sans baseline, les indicateurs de succès n'ont pas de point de référence.

### Indicateurs de Succès

- Taux de réussite croissant par mode d'affichage (kana → furigana → kanji seul) vs baseline session 1
- Nombre moyen de points par mot en augmentation au fil des sessions
- Taux de déblocage : les testeurs progressent naturellement à travers les niveaux JLPT
- Ratio mots maîtrisés (≥ 5 points) / mots totaux par niveau en croissance

### Critères d'Échec & Plan B

- Si le taux de réussite en kanji seul reste **< 30% après 30 sessions** → l'hypothèse de scaffolding pur est insuffisante → Plan B : exercices de renforcement ciblés kanji (mini-review avant session)
- Si les testeurs rapportent une **lassitude avant d'atteindre N4** → la monotonie est un problème prioritaire à résoudre

### Risques Identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Monotonie des sessions (même format répétitif) | Élevée | Élevé | Variété de gameplay post-MVP (défis, modes alternatifs) |
| Gap mots isolés → lecture réelle | Élevée | Élevé | Phase 2 (phrases) positionnée comme critique |
| Normalisation romaji incomplète → faux négatifs | Moyenne | Élevé | `normalizeRomaji()` existante, à tester exhaustivement |
| Calibrage vitesse de défilement | Moyenne | Moyen | Lié à la difficulté, ajustable par les préférences |
| Qualité/complétude des données JLPT | Moyenne | Élevé | Données validées manuellement, feedback testeurs |

---

## Business

### Monétisation

**Android :** App gratuite avec publicités (AdMob). Option premium : achat pour supprimer les publicités (RevenueCat). Tous les niveaux accessibles gratuitement. Objectif : 100€/mois.

**Apple (futur) :** Modèle économique à définir séparément — coûts de publication plus élevés et public différent justifient un pricing revu à la hausse. Financé par les revenus Android.

### Hors Scope MVP

- Phrases complètes / lecture en contexte (phase 2)
- Leaderboards / classements
- Streaks / séries quotidiennes
- Partage social
- Test de placement initial (phase 3+)

---

## Target Users

### Primary Users

**Persona 1 — Le Voyageur Autonome**

**Profil :** Adulte (25-45 ans) qui voyage ou prévoit de voyager au Japon. A commencé à apprendre le japonais par passion ou nécessité pratique. Maîtrise les kana, connaît quelques mots courants, mais ne peut pas lire un menu ou un panneau sans déchiffrer longuement.

**Contexte :** A déjà essayé 2-3 apps ou méthodes (Duolingo, Anki, cours en ligne). Progresse lentement, surtout bloqué au passage aux kanji. Cherche régulièrement de nouvelles méthodes pour avancer un peu plus.

**Motivation :** Être autonome au Japon — lire les menus, comprendre les panneaux dans le métro, déchiffrer une carte sans Google Translate. Ne vise pas la maîtrise académique, veut une compétence pratique et fonctionnelle.

**Frustration actuelle :** "Je connais des mots en romaji mais quand je les vois en kanji, je ne les reconnais pas. J'ai passé des heures sur WaniKani mais devant un vrai texte japonais, je bloque."

**Moment de succès :** Au Japon, il lit 居酒屋 sur une enseigne et comprend instantanément "izakaya" sans réfléchir. Il lit un menu et commande sans aide.

---

**Persona 2 — Le Lecteur de Contenu**

**Profil :** Jeune adulte (18-35 ans) passionné de culture japonaise — manga, anime, jeux vidéo, light novels. Lit des traductions mais veut accéder au contenu original. Maîtrise les kana, a du vocabulaire passif acquis par immersion culturelle.

**Contexte :** Apprend le japonais de manière informelle, par passion plus que par nécessité. A essayé plusieurs méthodes mais s'ennuie vite des formats répétitifs (flashcards). Cherche une méthode qui progresse et ne stagne pas.

**Motivation :** Lire du manga en VO, comprendre les sous-titres japonais, jouer à des jeux non traduits. Veut pouvoir lire du texte japonais avec fluidité, pas juste reconnaître des mots isolés.

**Frustration actuelle :** "Je reconnais plein de mots à l'oral grâce aux anime, mais à l'écrit en kanji je ne fais pas le lien. Et les apps de kanji m'ennuient — je veux lire des vrais mots, pas des kanji isolés."

**Moment de succès :** Il ouvre un manga en VO et lit une bulle entière sans dictionnaire. Il comprend le sens directement en lisant les kanji.

---

### Secondary Users

Pas d'utilisateurs secondaires identifiés pour le MVP. L'app est conçue pour un usage autodidacte individuel. À terme, des professeurs de japonais pourraient recommander l'app comme outil complémentaire, mais ce n'est pas une cible pour les tests internes.

---

### User Journey

**Parcours type (commun aux deux personas) :**

| Étape | Expérience | Émotion |
|-------|-----------|---------|
| **Découverte** | Cherche une nouvelle méthode d'apprentissage du japonais. Trouve japanese_trainer sur le Play Store ou par recommandation | Curiosité, espoir prudent |
| **Onboarding** | Écran de bienvenue explique le prérequis kana et la méthode progressive. Lance le tutoriel | Intrigué par l'approche différente |
| **Premières sessions (Kana)** | Sessions de mots N5 en kana. Lit たべる, écrit "taberu". Facile, confirme la maîtrise des kana | Confiance, satisfaction rapide |
| **Progression (N5)** | Débloque N5. Voit 食べる avec furigana. Fait le lien : "ah, c'est たべる en kanji !" | Déclic — le kanji devient concret |
| **Moment aha!** | Voit 食べる sans furigana pour la première fois. Le reconnaît directement | Excitation, motivation renouvelée |
| **Routine** | Sessions courtes (5-10 min) régulières. Progresse à travers N5, N4. Ratio de mots maîtrisés augmente | Sentiment de progression, habitude |
| **Validation réelle** | En voyage ou devant du contenu japonais, reconnaît des mots appris. Lit sans déchiffrer | Fierté, confirmation de l'investissement |

---

## Success Metrics

### Succès Utilisateur (tests internes)

| Métrique | Indicateur | Comment mesurer |
|----------|-----------|-----------------|
| L'app fonctionne | Sessions complétées sans crash ni bug bloquant | Feedback testeurs |
| La méthode progresse | Les testeurs débloquent au moins N5 en utilisation régulière | Données app (déblocage niveaux) |
| La lecture s'améliore | Taux de réussite en kanji seul augmente vs baseline session 1 | Données app (points par mot) |
| L'app ne lasse pas | Les testeurs continuent à utiliser après 2+ semaines | Feedback testeurs |

### Business Objectives

**Court terme (tests internes) :**
- Valider que l'app est stable et utilisable au quotidien
- Confirmer que la méthode produit des résultats mesurables
- Préparer la mise en production sur Google Play Store

**Moyen terme (lancement Android) :**
- Atteindre 100€/mois de revenus (AdMob + achats premium sans pubs)
- Acquisition organique via Play Store (pas de budget marketing)
- Collecter les retours utilisateurs pour itérer

**Long terme (expansion Apple) :**
- Financer la version iOS avec les revenus Android
- Modèle économique revu pour Apple (coûts plus élevés, public différent, pricing adapté)

### Key Performance Indicators

| KPI | Cible | Mesure |
|-----|-------|--------|
| Revenus mensuels Android | 100€ | AdMob dashboard + RevenueCat |
| Taux de conversion sans pubs | À observer | RevenueCat (achats / utilisateurs actifs) |
| Sessions par utilisateur par semaine | ≥ 3 | Analytics |
| Taux de rétention J+7 | ≥ 30% | Play Store / Analytics |
| Note Play Store | ≥ 4.0 | Play Console |

---

## MVP Scope

### Core Features (Test Interne)

L'app est un projet brownfield — les fonctionnalités MVP sont **déjà implémentées** :

1. **Boucle d'entraînement complète** — Sessions de mots avec saisie romaji, validation instantanée, feedback visuel (modal correcte/incorrecte), scoring automatique
2. **6 niveaux JLPT + Kana** — Données complètes (5 fichiers JSON), word pools progressifs avec scaffolding i+1 (kana → furigana → kanji seul)
3. **Système de progression** — Déblocage automatique au mastery (≥5 points par mot, 100% du niveau), 4 difficultés (Facile/Normal/Difficile/Extrême)
4. **Statistiques détaillées** — Points par mot/niveau, taux de réussite, mots maîtrisés, progression globale avec visualisation par niveau
5. **Tutoriel interactif bilingue** — 6 étapes couvrant la méthode, les niveaux, les difficultés et le scoring (FR + EN)
6. **Réglages utilisateur** — Langue de traduction, affichage furigana, nombre de mots par session (5-30)
7. **Notifications quotidiennes** — Rappels configurables pour sessions régulières
8. **Infrastructure monétisation** — RevenueCat (premium sans pubs) + AdMob (interstitial), désactivés proprement pour le test interne
9. **Privacy policy** — Document HTML conforme aux exigences Google Play

### Corrections requises avant soumission

| Correction | Effort | Priorité |
|------------|--------|----------|
| Aligner les versions (app.json / package.json / settings.tsx) | ~15 min | Haute |
| Vérifier/générer google-play-service-account.json pour EAS Submit | ~30 min | Bloquante |
| Enrichir les données N1 (actuellement très sparse) | Moyen | Moyenne |
| Test end-to-end complet sur device Android | ~1h | Haute |

### Out of Scope for MVP

- Activation de la monétisation (ads + premium) — après validation testeurs
- Phrases complètes / lecture en contexte (Phase 2)
- Crash reporting / analytics avancés (production)
- Test de placement initial (Phase 3+)
- Version iOS / Apple Store
- Leaderboards, streaks, partage social
- Mode découverte kana pour débutants complets

### MVP Success Criteria

| Critère | Validation |
|---------|-----------|
| L'app build et s'installe via EAS | Build APK réussi, installation sur device test |
| Session complète sans crash | Jouer Kana → résultat → retour home sans erreur |
| Progression fonctionne | Maîtriser Kana → N5 se débloque automatiquement |
| Statistiques cohérentes | Points et taux de réussite correspondent au gameplay |
| Tutoriel lisible et complet | Parcours des 6 étapes sans confusion |
| Notifications fonctionnelles | Rappel quotidien reçu sur device |
| 2-3 testeurs utilisent régulièrement 2+ semaines | Feedback qualitatif positif |

### Future Vision

**Court terme (post-test interne) :**
- Activation monétisation (AdMob + RevenueCat) après setup Google Play
- Enrichissement données N1 et vérification exhaustive de toutes les données JLPT
- Variété de gameplay : défis chronométrés, révisions ciblées, modes alternatifs

**Moyen terme (Phase 2 — Phrases) :**
- Phrases complètes pour introduire le contexte de lecture (évolution architecturale significative)
- Adaptation du mécanisme de validation pour les phrases
- Nouveau format de données et mode d'affichage

**Long terme (Phase 3+) :**
- Test de placement initial pour apprenants intermédiaires
- Modes de validation alternatifs (sélection du sens, audio)
- Version iOS financée par revenus Android
- Analytics et crash reporting pour la production
