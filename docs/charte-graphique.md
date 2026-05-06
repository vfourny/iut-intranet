# Charte graphique — IUT du Littoral Côte d'Opale

Référence extraite de la charte officielle de l'IUT (Boulogne s/Mer, Calais, Dunkerque, St Omer). Document destiné à servir de source pour la configuration du thème PrimeVue de l'intranet.

> Source : `Charte graphique.pdf` (IUT du Littoral Côte d'Opale, inspirée de la charte ADIUT).

---

## 1. Couleurs du logotype principal

Couleurs officielles du logo. Servent de **base de la palette de marque** (à utiliser pour les éléments d'interface principaux : navigation, accents, statuts).

| Rôle      | CMYK (source charte) | HEX approx. | RGB             | Usage suggéré                                                   |
| --------- | -------------------- | ----------- | --------------- | --------------------------------------------------------------- |
| **Noir**  | C:0 M:0 J:0 N:100    | `#000000`   | `0, 0, 0`       | Texte principal, titres                                         |
| **Rouge** | C:0 M:95 J:100 N:0   | `#E3000F`   | `227, 0, 15`    | Accent fort (la courbe rouge du logo)                           |
| **Bleu**  | C:100 M:0 J:0 N:0    | `#00AEEF`   | `0, 174, 239`   | Couleur primaire de marque (recommandé pour `primary` PrimeVue) |
| **Gris**  | C:0 M:0 J:0 N:60     | `#6D6E70`   | `109, 110, 112` | Texte secondaire, bordures, surfaces                            |

> ⚠️ Les valeurs CMYK sont la **source de vérité** de la charte (impression). Les HEX listés ici sont les équivalents écran les plus proches couramment utilisés pour cette charte (le bleu C100 est rendu en `#00AEEF` plutôt que le cyan pur `#00FFFF`, plus fidèle au visuel imprimé).

---

## 2. Couleurs des départements

Codes couleurs de l'ADIUT identifiant les 5 spécialités. Utilisés pour les vignettes/cartes de département, les badges de filière, et toute UI contextuelle à un département.

| Spécialité                                      | Départements concernés                       | CMYK               | HEX approx. | RGB            |
| ----------------------------------------------- | -------------------------------------------- | ------------------ | ----------- | -------------- |
| **Administration, Gestion, Commerce**           | GACO (St-Omer), GEA (Calais), TC (Dunkerque) | C:10 M:90 J:40 N:0 | `#D7376B`   | `215, 55, 107` |
| **Électricité, Automatique, Informatique**      | INFO (Calais), GEII (Calais)                 | C:90 M:20 J:0 N:0  | `#1FA9E0`   | `31, 169, 224` |
| **Sciences Industrielles, Matériaux, Contrôle** | GIM (St-Omer)                                | C:30 M:0 J:0 N:70  | `#566872`   | `86, 104, 114` |
| **Chimie, Biologie, Procédés Industriels**      | GB (Boulogne-sur-Mer)                        | C:55 M:0 J:100 N:0 | `#7DB72F`   | `125, 183, 47` |
| **Construction, Énergie, Sécurité**             | GTE (Dunkerque)                              | C:0 M:55 J:100 N:0 | `#F08200`   | `240, 130, 0`  |

> 📐 **Règles d'usage charte :** ces couleurs peuvent être déclinées en différentes valeurs de teinte (camaïeux), mais il est **recommandé de limiter le nombre de teintes par page** pour garantir la sobriété. Éviter les multiples camaïeux mélangés.

### Mapping département → spécialité (pour le code)

```
GACO  → Administration, Gestion, Commerce  (#D7376B)
GEA   → Administration, Gestion, Commerce  (#D7376B)
TC    → Administration, Gestion, Commerce  (#D7376B)
INFO  → Électricité, Automatique, Info.    (#1FA9E0)
GEII  → Électricité, Automatique, Info.    (#1FA9E0)
GIM   → Sciences Industrielles             (#566872)
GB    → Chimie, Biologie, Procédés Ind.    (#7DB72F)
GTE   → Construction, Énergie, Sécurité    (#F08200)
```

---

## 3. Typographie

La charte impose **Arial** et **Arial Narrow** uniquement.

- **Documents print/internes** : Arial + Arial Narrow autorisées.
- **Web (sites internet)** : **uniquement Arial** (web-safe font).
- **Toute autre police est interdite** par la charte ADIUT.

### Graisses utilisées (visibles dans la charte)

- **Regular** (400) — corps de texte
- **Italic** — emphase légère
- **Bold** (700) — titres, accents (ex. « LITTORAL CÔTE D'OPALE » dans le logo)
- **Bold Italic** — combinaison disponible

### Recommandation pour PrimeVue / CSS

```css
font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
```

> Pour respecter strictement la charte web, **ne pas charger de police Google Fonts** (Inter, Roboto, etc.). La police Arial est web-safe et installée sur tous les OS, donc aucun import n'est nécessaire.

---

## 4. Règles d'usage du logo (rappel)

Bien que ces règles concernent surtout le print, certaines s'appliquent au web :

- **Aucune modification** : forme, proportions, couleurs, polices, alignements, filet vertical → tout est figé.
- **Zone de protection** autour du logo : `x/2` minimum sur tous les côtés (où `x` = largeur du « i » du logo).
- **Pas d'effets** : pas de biseautage, ombre portée, effet 3D, rotation, déformation.
- Le logo existe en **monochrome** (noir & blanc) pour les usages contraints.
- Sur **fond coloré**, conserver la zone de protection et préférer un fond clair pour le contraste.

---

## 5. Design tokens proposés (pour PrimeVue)

Synthèse prête à l'emploi pour la configuration du thème PrimeVue. Le bleu `#00AEEF` est le candidat naturel pour `primary` (couleur dominante de la marque).

### Tokens de marque

```ts
export const brandTokens = {
  primary: '#00AEEF', // Bleu IUT
  accent: '#E3000F', // Rouge IUT (courbe du logo)
  neutral: '#6D6E70', // Gris IUT
  text: '#000000', // Noir IUT
}
```

### Tokens départements

```ts
export const departmentTokens = {
  administration: '#D7376B', // GACO, GEA, TC
  informatique: '#1FA9E0', // INFO, GEII
  industriel: '#566872', // GIM
  biologie: '#7DB72F', // GB
  energie: '#F08200', // GTE
}
```

### Échelle 50–950 (à générer pour PrimeVue)

PrimeVue v4 attend une échelle de teintes (`50, 100, …, 900, 950`) pour chaque couleur sémantique (`primary`, `surface`, etc.). Les couleurs de la charte étant fournies à une seule teinte, il faudra **générer les déclinaisons** :

- via un outil type `https://www.tailwindshades.com/` ou `https://uicolors.app/create`,
- ou en utilisant les helpers PrimeVue (`@primeuix/themes` permet de définir uniquement la couleur centrale `500` et de générer le reste).

**Suggestion d'ancrage pour `primary` (bleu IUT `#00AEEF` ≈ teinte 500) :**

| Pas | HEX (à valider visuellement) |
| --- | ---------------------------- |
| 50  | `#E6F7FE`                    |
| 100 | `#CCEFFD`                    |
| 200 | `#99DFFB`                    |
| 300 | `#66CFF9`                    |
| 400 | `#33BFF7`                    |
| 500 | `#00AEEF` ← **brand**        |
| 600 | `#008BBF`                    |
| 700 | `#00688F`                    |
| 800 | `#00455F`                    |
| 900 | `#002230`                    |
| 950 | `#001118`                    |

> Les valeurs ci-dessus sont indicatives — à ajuster avec un outil de génération de palette pour assurer un contraste WCAG AA sur les niveaux 600+ (texte sur fond clair) et 100–300 (texte sombre sur fond clair).

---

## 6. Pistes pour la configuration PrimeVue

PrimeVue v4 utilise [`@primeuix/themes`](https://primevue.org/theming/) avec un système de **design tokens** (`primitive`, `semantic`, `components`).

### Étapes

1. Installer le moteur de thème :
   ```bash
   npm i @primeuix/themes
   ```
2. Créer un preset dérivé d'un thème de base (Aura, Lara, Nora) en surchargeant `primary` et `surface` avec les valeurs IUT.
3. Désactiver toute police custom dans le preset → laisser Arial via le CSS global (`apps/web/src/assets/styles/index.css`).
4. Exposer les couleurs département via un composable ou une map (utile pour les badges, les couleurs de page selon la filière de l'utilisateur connecté).

### Rappel charte → application web

| Élément UI                   | Couleur charte recommandée                 |
| ---------------------------- | ------------------------------------------ |
| Boutons primaires, liens     | `#00AEEF` (Bleu IUT)                       |
| États d'erreur / suppression | `#E3000F` (Rouge IUT) — usage parcimonieux |
| Texte principal              | `#000000`                                  |
| Texte secondaire, bordures   | `#6D6E70`                                  |
| Badge de département         | Couleur du département (cf. §2)            |
| Fond de page                 | Blanc / gris très clair                    |

---

## 7. Identité de l'établissement (à conserver dans les pieds de page)

```
IUT du Littoral Côte d'Opale
Boulogne s/Mer, Calais, Dunkerque, St Omer
Rue Louis David - BP 689 | 62228 Calais Cedex
Tél : 03 21 19 06 00
http://iut-littoral.fr | Facebook : /IUTLittoral
```
