# TODO - japanese-trainer

**Version:** 0.1.0
**Dernière mise à jour:** 2025-11-11

## 🔴 P0 - Technical Debt (AVANT toute nouvelle feature)

- [ ] **Tests training.tsx** (239 lignes)
  - State machine (scrolling state, validation feedback)
  - Timer management (cleanup on unmount)
  - Validation logic (normalizeRomaji + handleValidate)
  - Risque: High (complex state, async timers)
  - Estimation: 2-3h

## Prochaine tâche immédiate

- [ ] Définir les Epic et User Stories pour l'apprentissage du japonais (via Epic Manager Agent)

## Court terme

- [ ] Développer la page statistiques (app/stats.tsx actuellement placeholder)
- [ ] Développer la page paramètres (app/settings.tsx actuellement placeholder)
- [ ] Étendre système préférences avec statistiques persistantes (sessions complétées, scores, progression)
- [ ] Ajouter tests pour pages placeholder (stats.tsx, settings.tsx, poc-scroll.tsx)

## Moyen terme

- [ ] Implémenter le système de statistiques complet
- [ ] Configurer CI/CD avec DevOps Expert
- [ ] Setup Expo EAS pour déploiement iOS/Android
- [ ] Augmenter couverture de tests à 80%+

## Complété

- [x] Infrastructure de tests Jest + React Testing Library configurée (2025-11-10)
- [x] Tests pour composants principaux: DifficultySelector, LevelButton, HomeScreen (12 tests, 100% coverage)
- [x] Session d'entraînement: navigation + bouton + validation de sélection (2025-11-10, commit d1370b4)
- [x] Tests session d'entraînement: 3 tests ajoutés pour le bouton session (total: 15 tests)
- [x] Gestion préférences utilisateur avec AsyncStorage (2025-11-10, delivery_002)
  - Service preferences.ts + hook usePreferences.ts
  - Sauvegarde/chargement automatique niveau + difficulté
  - 21 tests préférences (100% couverture service + hook)
  - 36 tests total (tous passants)
  - Architecture extensible pour stats persistantes
- [x] Training page complète (2025-11-11, Session 2 continuation)
  - 239 lignes: 5 zones UI, validation romaji, state machine
  - Code Review: APPROVED (corrections memory leak + closure bug)
  - Tests: PENDING (dette technique P0)
  - Mock words system (にほんご, こんにちは, ありがとう)
  - Flexible romaji validation (shi/si, tsu/tu, chi/ti, fu/hu)

---

**Notes:**
- Utiliser Epic Manager Agent pour découper les fonctionnalités en Epic/US
- Invoquer Test Engineer Agent pour features > 50 lignes
- Invoquer Code Review Agent pour features > 100 lignes
