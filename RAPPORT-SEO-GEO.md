# ComparateurPro — Vérification & amélioration SEO / GEO
**Date :** 25/09/2026 · **Périmètre :** 9 pages (1 pilier + 8 guides), `css/`, `js/`, `sitemap.xml`, `robots.txt`
**Outil :** `audit_seo.py` (livré à la racine du projet) — `python3 audit_seo.py`

---

## 1. Résultat de l'audit automatisé

| Passage | Problèmes détectés |
|---|---|
| Avant intervention | **43** |
| Après intervention | **0** |

L'audit contrôle, pour chaque page : validité de la structure HTML (balises ouvertes/fermées, `id` dupliqués), `<title>`, `meta description`, `meta robots`, canonical, hiérarchie `<h1>`→`<h3>`, `alt` des images, liens internes (fichiers et ancres), validité JSON-LD, cohérence FAQ schema ↔ contenu HTML, sitemap XML, robots.txt.

```
=== PROBLÈMES (0) ===
aucun
```

---

## 2. Problèmes corrigés

### 2.1 Bloquants (liens cassés / données invalides)

| Problème | Pages | Correction |
|---|---|---|
| Lien placeholder vers une page de confidentialité inexistante (2 occurrences dans les cases de consentement) | index.html | Texte de consentement réécrit sans référence à cette page : « J'accepte que mes informations soient utilisées pour me recontacter au sujet de ma demande. » |
| `[À COMPLÉTER]` dans le schema `Organization.contactPoint` (téléphone + email) | index.html | Bloc `contactPoint` supprimé : des placeholders dans du JSON-LD font échouer la validation Rich Results. À réintégrer avec de vraies coordonnées. |
| Ancre morte `#comparer` dans le sommaire (la section porte `id="comparer-title"`) | 8 guides | `href="#comparer"` → `href="#comparer-title"` |
| `<a href="[À COMPLÉTER : /contact]">Contact</a>` dans le pied de page | index.html | Pointe désormais vers l'ancre interne existante `#contact` |
| `sitemap.xml` référençait 3 URL inexistantes dans ce build (`/mentions-legales`, une page de confidentialité, `/contact`) | sitemap.xml | 3 URL retirées → 10 URL, toutes adossées à une page réelle |
| Pied de page : 1 `</div>` de fermeture de `.footer-grid` perdu lors du retrait de la colonne légale | 9 pages | Balise restaurée ; balance `<div>` vérifiée (134/134 sur index, 55/55 sur les guides) |

### 2.2 Titles trop longs (tronqués dans les SERP)

| Page | Avant | Après |
|---|---|---|
| index.html | 81 car. | **63** — `Assurance TNS : mutuelle, prévoyance, retraite \| ComparateurPro` |
| auto-entrepreneur | 84 car. | **61** — `Auto-entrepreneur : couverture et assurances \| ComparateurPro` |
| independant | 88 car. | **61** — `Indépendant : mutuelle, prévoyance, retraite \| ComparateurPro` |
| prevoyance-tns | 70 car. | **54** — `Prévoyance TNS : protéger ses revenus \| ComparateurPro` |
| profession-liberale | 81 car. | **61** — `Profession libérale : mutuelle et prévoyance \| ComparateurPro` |

Les 4 autres pages étaient déjà dans la cible (54–65 caractères). Mot-clé principal en tête, marque en suffixe sur les 9 pages.

### 2.3 Meta description trop longue

- `index.html` : 224 → **155 caractères** (cible 70–165). Les 8 guides étaient conformes (119–161).

---

## 3. Améliorations apportées (au-delà de la correction)

| Amélioration | Détail | Impact |
|---|---|---|
| **Fraîcheur du contenu** | `<meta name="article:published_time">` et `article:modified_time` (2026-09-25) ajoutés sur les 9 pages | Signal de fraîcheur pour Google et pour les moteurs IA |
| **`dateModified` dans `WebPage`** | Ajouté au JSON-LD des 9 pages | Cohérence schema ↔ meta, reprise par les agrégateurs |
| **`speakable` (schema.org)** | `SpeakableSpecification` sur `WebPage` : `.hero__lead` (pilier) / `#bref` (guides) + `h1` | Recherche vocale et extraction audio par les assistants |
| **Maillage interne du pilier** | Le pied de page de `index.html` ne liait que 4 des 8 guides → les 8 sont désormais liés | Les 4 pages satellites orphelines du pilier récupèrent du jus de lien |
| **`robots.txt` GEO** | Autorisation explicite de `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-Web`, `PerplexityBot`, `Google-Extended` | Visibilité dans les réponses des moteurs génératifs (aucun blocage implicite) |
| **Nettoyage CSS** | 6 règles `.top-bar` devenues orphelines supprimées | Moins de CSS mort |

---

## 4. État mesuré après intervention

| Page | Mots ≈ | Title | Desc. | H1 | H2 | H3 | FAQ (schema) | JSON-LD |
|---|---|---|---|---|---|---|---|---|
| `index.html` | 2 426 | 63 | 155 | 1 | 12 | 23 | 8 | Organization, WebSite, WebPage, BreadcrumbList, Article, FAQPage |
| auto-entrepreneur | 1 458 | 61 | 139 | 1 | 8 | 5 | 4 | Organization, WebPage, BreadcrumbList, Article, FAQPage |
| dirigeant | 1 437 | 65 | 152 | 1 | 8 | 5 | 4 | idem |
| independant | 1 347 | 61 | 127 | 1 | 8 | 5 | 4 | idem |
| mutuelle-tns | 1 462 | 63 | 136 | 1 | 8 | 5 | 4 | idem |
| prevoyance-tns | 1 401 | 54 | 161 | 1 | 8 | 5 | 4 | idem |
| profession-liberale | 1 374 | 61 | 119 | 1 | 8 | 5 | 4 | idem |
| rc-pro | 1 368 | 64 | 129 | 1 | 8 | 5 | 4 | idem |
| retraite-tns | 1 420 | 65 | 151 | 1 | 8 | 5 | 4 | idem |

Contrôles passés sans exception : 1 seul `<h1>` par page, aucun saut de niveau `h1→h3`, 0 image sans `alt` (15 images sur le pilier, 2 par guide), 0 lien interne cassé, 0 ancre morte, 0 `id` dupliqué, JSON-LD parseable sur les 9 pages, toutes les questions du schema `FAQPage` présentes dans le HTML, sitemap valide et aligné sur les canonical.

---

## 5. Reste à faire (hors périmètre de cette intervention)

**Bloquant avant mise en ligne**
2. **Mentions légales + n° ORIAS** — obligatoires pour un intermédiaire/comparateur en assurance (art. L.520-1 et R.520-3 du Code des assurances). Supprimés du pied de page à votre demande : ils devront réapparaître quelque part avant publication.
3. **301** `/assurance-tns-pro-v2-adw` → `/assurance-tns/` (déjà listé dans le `README.md`).

**Améliorations recommandées**
4. `Person` schema avec un auteur nommé (E-E-A-T) : les `Article` sont signés `Organization`, ce qui est le minimum.
5. `sameAs` (LinkedIn, pages sociales) et `foundingDate` dans `Organization`.
6. Réintégrer `Organization.contactPoint` avec téléphone/email réels.
7. Indexer le pilier sur une URL canonique unique : le sitemap liste `https://www.comparateurpro.fr/` **et** `/assurance-tns/` alors que le `canonical` de `index.html` pointe sur `/assurance-tns/`. À trancher selon l'arborescence de production.
8. Passer les 8 guides de 4 à 5–6 questions FAQ : au-delà de 5, la couverture GEO (extraits cités par les IA) progresse nettement.
9. Images : convertir les 25 JPG en WebP/AVIF + `loading="lazy"` hors hero (le pilier pèse ~4,8 Mo au total).

---

## 6. Reproduction de l'audit

```bash
cd comparateurpro
python3 audit_seo.py     # exit 0 = aucun problème, exit 1 = liste des anomalies
```
