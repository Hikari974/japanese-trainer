# RAPPORT : Problèmes trouvés dans les données vs Clavier Romaji

**Date**: 2025-11-11
**Test**: RomajiKeyboard.coverage.test.ts
**Résultat**: 100% de couverture APRÈS normalisations dans le test, mais normalisations masquent des erreurs de données

---

## 1. SYLLABES DISPONIBLES DANS LE CLAVIER ACTUEL (130 syllabes)

### Base Mode (50 syllabes)
```
Voyelles: a, i, u, e, o
K-row: k, ka, ki, ku, ke, ko
S-row: s, sa, shi, su, se, so
T-row: t, ta, chi, tsu, te, to
N-row: na, ni, nu, ne, no
H-row: ha, hi, fu, he, ho
M-row: m, ma, mi, mu, me, mo
Y-row: ya, yu, yo
R-row: ra, ri, ru, re, ro
W-row: wa, wo, n
```

### Dakuten-Handakuten Mode (30 syllabes)
```
G-row: g, ga, gi, gu, ge, go
Z-row: z, za, ji, zu, ze, zo
D-row: d, da, di, du, de, do
B-row: b, ba, bi, bu, be, bo
P-row: p, pa, pi, pu, pe, po
```

### Yōon Mode (33 syllabes)
```
kya, kyu, kyo
sha, shu, sho
cha, chu, cho
nya, nyu, nyo
hya, hyu, hyo
mya, myu, myo
rya, ryu, ryo
gya, gyu, gyo
ja, ju, jo
bya, byu, byo
pya, pyu, pyo
```

### Foreign Mode (22 syllabes)
```
fa, fi, fe, fo
wi, we, wo
va, vi, vu, ve, vo
ti, di, tu, du
she, tsa, dyu, je
```

---

## 2. PROBLÈMES TROUVÉS DANS LES DONNÉES

### TYPE A : Variantes romaji "jy" au lieu de "j"

**Clavier a**: ja, ju, jo
**Données contiennent**: jya, jyu, jyo, jyoubu, etc.

**Exemples de mots affectés:**
- 丈夫 (じょうぶ) - romaji: "jyoubu" → devrait être "joubu"
- じゃ - romaji: "jya" → devrait être "ja"
- 授業 (じゅぎょう) - romaji: "jyugyou" → devrait être "jugyou"
- 誕生日 (たんじょうび) - romaji: "tanjyoubi" → devrait être "tanjoubi"
- 大丈夫 (だいじょうぶ) - romaji: "daijyoubu" → devrait être "daijoubu"

**Solution possible**: Corriger "jy" → "j" dans les données JSON

---

### TYPE B : Variantes romaji "chy" au lieu de "ch"

**Clavier a**: cha, chu, cho
**Données contiennent**: chya, chyu, chyo

**Exemples de mots affectés:**
-  (ちゃわん) - romaji: "chyawan" → devrait être "chawan"
-  (ちょうど) - romaji: "chyoudo" → devrait être "choudo"
-  (ちょっと) - romaji: "chyotto" → devrait être "chotto"
- お茶 (おちゃ) - romaji: "ochya" → devrait être "ocha"
- 紅茶 (こうちゃ) - romaji: "kouchya" → devrait être "koucha"

**Solution possible**: Corriger "chy" → "ch" dans les données JSON

---

### TYPE C : Pattern "cchi" (petit tsu っ + chi)

**Clavier a**: t (double consonant) + chi = っち
**Données contiennent**: "cchi" comme syllabe unique

**Exemples de mots affectés:**
-  (こっち) - romaji: "kocchi" → devrait être "kocchi" OU "kotchi"
-  (あっち) - romaji: "acchi" → devrait être "acchi" OU "atchi"
-  (そっち) - romaji: "socchi" → devrait être "socchi" OU "sotchi"
-  (どっち) - romaji: "docchi" → devrait être "docchi" OU "dotchi"
-  (マッチ) - romaji: "macchi" → devrait être "macchi" OU "matchi"

**Question importante**: Comment veux-tu que l'utilisateur tape っち ?
- Option 1: Bouton "t" + bouton "chi" = "tchi"
- Option 2: Accepter "cchi" comme valide (romaji Hepburn standard)
- Option 3: Les deux

---

### TYPE D : Erreur normalisation "chu" → "cfu"

**Clavier a**: chu
**Problème**: Si on normalise "hu"→"fu", ça casse "chu" → "cfu"

**Exemple:**
- 抽象 (ちゅうしょう) - romaji: "chuushou"
  - Avec normalisation "hu"→"fu": devient "cfuushou" ❌
  - Devrait rester: "chuushou" ✅

**Solution**: Normalisation doit protéger "chu" avant de remplacer "hu"→"fu"

---

### TYPE E : Espaces et virgules dans romaji

**Exemples:**
-  (より、ほう) - romaji: "yori,hou" (contient virgule)
- 十 (じゅう とお) - romaji: "jyuu too" (contient espace)

**Solution**: Supprimer espaces et virgules dans la normalisation

---

### TYPE F : ERREURS GRAVES - Romaji contient hiragana/katakana (142 mots)

**Ces mots ont été IGNORÉS par le test car romaji invalide:**

**Premiers exemples (5 mots):**
1. [N4] 会場 (かいじょう) - romaji: **"kaijiょu"** ← contient ょ (hiragana)
2. [N4] ガソリン - romaji: **"ガソリン"** ← 100% katakana (pas de romaji)
3. [N4] 決して (けっして) - romaji: **"keっshite"** ← contient っ (hiragana)
4. [N4] きっと - romaji: **"kiっto"** ← contient っ (hiragana)
5. [N4] コンピュータ - romaji: **"コンピュ-タ"** ← contient katakana

**Total**: 142 mots ignorés avec romaji invalides

**Solution**: Nettoyer les fichiers JSON - ces 142 mots ont des erreurs de saisie graves

---

## 3. STATISTIQUES DU TEST

**Sans normalisations:**
- Couverture: ~87% (1147/1309 mots)
- Échecs: 162 mots

**Avec normalisations dans le test (état actuel):**
- Couverture: 100% (1167/1167 mots VALIDES)
- Mots ignorés: 142 (romaji invalides)
- Échecs: 0

**Par niveau JLPT (mots valides uniquement):**
- N5: 100% (669/669)
- N4: 100% (492/492)
- N3: 100% (2/2)
- N2: 100% (2/2)
- N1: 100% (2/2)

---

## 4. FICHIERS DE CODE MODIFIÉS (À REVOIR)

### ✅ RomajiKeyboard.tsx
- Clavier étendu avec double consonants + foreign katakana
- Pas de modifications nécessaires

### ⚠️ training.tsx
- **MODIFIÉ** avec normalisations complexes (jy→j, chy→ch, cchi→tchi, chu protection)
- **À REVOIR** selon décision sur correction des données

### ✅ RomajiKeyboard.coverage.test.ts
- Test créé avec normalisations pour atteindre 100%
- Filtre les 142 mots avec romaji invalides
- **À GARDER** comme test de validation

---

## 5. DÉCISIONS À PRENDRE

### Question 1: Corriger les données OU normaliser dans le code ?

**Option A : Corriger les fichiers JSON (recommandé)**
- ✅ Données propres et correctes
- ✅ Code simple
- ❌ ~150+ corrections manuelles nécessaires

**Option B : Normaliser dans le code**
- ✅ Marche immédiatement
- ✅ Flexible
- ❌ Masque les erreurs de données
- ❌ Code complexe

**Option C : Hybride (recommandé)**
- Normaliser les variantes standard (jy→j, chy→ch, espaces)
- Corriger les 142 erreurs GRAVES dans les données (hiragana/katakana dans romaji)

### Question 2: Comment gérer っち (petit tsu + chi) ?

**Option A**: L'utilisateur tape "t" + "chi" sur le clavier
- Données devraient contenir: "kotchi" (pas "kocchi")

**Option B**: Accepter "cchi" comme valide (standard Hepburn)
- Données OK comme elles sont
- Normalisation: "cchi" → "tchi" dans la validation

**Option C**: Accepter les deux (flexible)

---

## 6. FICHIERS À CORRIGER

### Priorité HAUTE : 142 mots avec romaji invalides
- Fichiers: n4.json, n5.json (principalement)
- Action: Remplacer hiragana/katakana par vrai romaji
- Exemples: "kaijiょu" → "kaijou", "ガソリン" → "gasorin"

### Priorité MOYENNE : Variantes jy/chy
- Fichiers: tous les JSON
- Action: Remplacer "jy" → "j", "chy" → "ch"
- Impact: ~50+ mots

### Priorité BASSE : Espaces/virgules
- Fichiers: tous les JSON
- Action: Supprimer espaces et virgules des champs romaji
- Impact: ~2 mots

---

## 7. PROCHAINES ÉTAPES PROPOSÉES

1. **Décider** : Corriger données vs normaliser code vs hybride
2. **Si correction données** : Créer script de nettoyage des 142 mots invalides
3. **Si normalisation code** : Garder training.tsx tel quel
4. **Si hybride** : Normaliser jy/chy dans code + corriger 142 erreurs graves
5. **Décider** : Comment gérer っち (cchi vs tchi)
6. **Tester** : Relancer le test après modifications
7. **Commit** : Une fois la stratégie validée

---

**FIN DU RAPPORT**
