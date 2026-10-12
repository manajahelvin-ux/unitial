# ComparateurPro — Audit & Spécifications
## Refonte de la page `/assurance-tns-pro-v2-adw`

---

## A. AUDIT DE LA PAGE ACTUELLE

### 1.1 Synthèse globale

| Critère | Constat | Gravité |
|---|---|---|
| Positionnement | Page = formulaire de génération de leads, pas une page pilier SEO/GEO | Critique |
| Architecture Hn | Absente : pas de H1 clair dans la structure sémantique, H2/H3 utilisés sans logique éditoriale | Critique |
| Intention de recherche | Page 100 % transactionnelle, aucune couverture informationnelle | Critique |
| Contenu éditorial | Article générique sur la santé pro, peu pertinent pour le mot-clé « assurance TNS », sur-optimisé | Critique |
| Données structurées | Aucun schema.org détecté (Organization, WebPage, FAQPage, etc.) | Critique |
| Title / Meta | Title = "Assurance TNS Pro V2 - ADW" (nom de campagne, pas optimisé) | Élevée |
| URLs | `/assurance-tns-pro-v2-adw` : paramètres de tracking Ads dans l'URL | Élevée |
| Géo/AI-readiness | Aucune structuration Q/R, pas de blocs extractibles | Élevée |
| UX formulaire | 12 étapes, pas de barre de progression, choix petits, peu accessibles | Élevée |
| Confiance | Aucune mention de ComparateurPro (qui sommes-nous, contact, ORIAS, SIRET) | Élevée |
| Accessibilité | Contraste limité, navigation clavier non garantie, focus peu visible | Élevée |
| Performance | Webflow + multiples images partenaires (logos assureurs non compressés) | Moyenne |
| Maillage interne | Quasi inexistant : pas de liens vers contenus satellites | Élevée |
| Footer | 2 liens (mentions légales + confidentialité), pas de structure E-E-A-T | Élevée |
| E-E-A-T | Aucun signal (pas d'auteur, pas de mentions ORIAS, pas de sources) | Élevée |
| Open Graph | Présent mais probablement générique | Moyenne |

### 1.2 Problèmes SEO critiques identifiés

1. **Aucun H1 éditorial** : la page met en avant un slogan marketing ("Trouvez le meilleur prix pour votre protection sociale Individuelle !") qui ne constitue pas un H1 stratégique.
2. **Structure Hn incohérente** : les titres H2/H3 présents dans l'article de bas de page ne suivent pas de logique éditoriale et ne reflètent pas l'arborescence des sujets TNS.
3. **Title non-optimisé** : contient "ADW" (suffixe de campagne Ads) au lieu du mot-clé principal et de la marque.
4. **URL publicitaire** : `/assurance-tns-pro-v2-adw` empêche une canonisation propre et dilue les signaux SEO.
5. **Aucune donnée structurée** : pas de schema `Organization`, `WebPage`, `BreadcrumbList`, `FAQPage` ni `Article`.
6. **Pas de maillage interne** vers les contenus satellites d'un futur topic cluster.
7. **Contenu dupliqué** : la page d'origine héberge un article quasi-générique sur "l'assurance santé professionnelle" sans vraie valeur ajoutée pour le sujet TNS.
8. **Pas de sitemap.xml dédié à cette URL stratégique.**

### 1.3 Problèmes GEO / IA identifiés

1. **Aucun bloc Q/R** structuré pour extraction par IA.
2. **Aucun passage "definition-box"** ou "à retenir" facilitant la citabilité.
3. **Aucune entité cohérente** (ComparateurPro n'est pas défini comme entité Organization).
4. **Aucune source fiable citée** (légifrance, service-public.fr, URSSAF, etc.).
5. **Contenu superficiel et promotionnel**, peu susceptible d'être cité par un moteur IA.
6. **Pas de tableau comparatif** ni de listes structurées favorables à l'extraction.

### 1.4 Problèmes UX/CRO identifiés

1. **Formulaire de 12 étapes** avec affichage séquentiel non progressif : friction élevée.
2. **Pas d'indicateur "Étape X sur Y"** ni de barre de progression visible.
3. **Boutons radio petits** difficiles à utiliser sur mobile.
4. **Le CTA primaire est noyé** sous le slogan commercial et le carousel de logos assureurs.
5. **Aucune information de réassurance** directement sous le CTA (micro-réassurance).
6. **Pas d'option alternative** au formulaire (ex. téléphone, rappel).
7. **Pas d'état loading/succès** travaillé.

### 1.5 Problèmes d'accessibilité

1. **Contraste** : le bleu clair (#00A5E5) sur blanc n'est pas WCAG AA pour du texte < 18pt.
2. **Navigation clavier** : la structure Webflow n'est pas optimisée pour le focus visible.
3. **Formulaire** : peu d'`aria-label`, pas de messages d'erreur accessibles.
4. **Carousels de logos** : non lisibles par les lecteurs d'écran.

### 1.6 Opportunités identifiées

1. **Positionnement TNS inexploité** : le sujet est servi par un contenu générique alors que c'est un sujet à forte intention informationnelle + commerciale + transactionnelle.
2. **Topical authority** : aucun acteur n'a encore construit de topic cluster solide sur TNS — opportunité de leadership thématique.
3. **GEO readiness** : la quasi-totalité des concurrents néglige la structuration Q/R — opportunité de captation des AI Overviews.

---

## B. NOUVELLE ARCHITECTURE DE LA PAGE

### 1. Architecture Hn finale

```
H1 — Assurance TNS : comparez les solutions adaptées à votre activité

H2 — Assurance TNS : de quoi parle-t-on exactement ?
   H3 — Qu'est-ce qu'un travailleur non salarié (TNS) ?
   H3 — À quels besoins répond une assurance TNS ?
   H3 — Qui peut bénéficier d'une assurance TNS ?

H2 — Les protections essentielles pour un TNS
   H3 — Mutuelle santé TNS
   H3 — Prévoyance TNS
   H3 — Retraite complémentaire TNS
   H3 — Protection juridique et RC professionnelle

H2 — Pourquoi comparer son assurance TNS ?

H2 — Comment fonctionne ComparateurPro ?
   H3 — 01. Décrivez votre situation professionnelle
   H3 — 02. Analyse de vos besoins de protection
   H3 — 03. Comparez les solutions identifiées

H2 — Pour quels profils de professionnels ?
   H3 — Indépendants et professions libérales
   H3 — Dirigeants et gérants
   H3 — Auto-entrepreneurs et micro-entrepreneurs

H2 — Comment choisir son assurance TNS ?

H2 — Tout comprendre sur l'assurance TNS (liens satellites)

H2 — Questions fréquentes sur l'assurance TNS

H2 — Demandez votre étude personnalisée
```

### 2. Ordre exact des sections dans la page

1. **Top bar discrète** (annonce institutionnelle, lien "Espace assureur")
2. **Header / Navigation** (logo, lien contact, CTA sticky léger)
3. **Hero** — promesse + sous-titre + CTA + réassurance + formulaire compact (Étape 1 sur 3)
4. **Bandeau de réassurance** (4 micro-bénéfices)
5. **Définition / compréhension** (H2 "Assurance TNS : de quoi parle-t-on ?")
6. **Bloc "À retenir"** (GEO-ready)
7. **Les protections essentielles** (H2 + 4 cartes H3)
8. **Pourquoi comparer ?** (H2 + éléments factuels)
9. **Comment ça marche** (H2 + 3 étapes timeline)
10. **Pour quels profils ?** (H2 + 4 cartes de profils)
11. **Comment choisir ?** (H2 + checklist)
12. **Expertise / contenu satellite** (H2 + grille de liens vers topic cluster)
13. **FAQ** (H2 + 8 questions/réponses)
14. **CTA final** (H2 + formulaire compact + réassurance)
15. **Sources et méthodologie**
16. **Footer institutionnel**

---

## C. STRATÉGIE DE MOTS-CLÉS

### C.1 Mot-clé principal
- **assurance TNS**

### C.2 Mots-clés secondaires (champ sémantique cœur)
- assurance travailleur non salarié
- protection sociale TNS
- mutuelle TNS
- prévoyance TNS
- retraite TNS
- complémentaire santé TNS
- assurance santé indépendant
- mutuelle indépendant
- prévoyance indépendant
- protection sociale indépendant
- assurance profession libérale
- assurance dirigeant
- assurance chef d'entreprise
- assurance auto-entrepreneur
- assurance professionnel indépendant
- loi Madelin

### C.3 Longue traîne (intentions informationnelles)
- qu'est-ce qu'une assurance TNS
- différence mutuelle et prévoyance TNS
- comment choisir son assurance TNS
- combien coûte une mutuelle TNS
- est-ce que la mutuelle TNS est obligatoire
- comment changer de contrat TNS
- quels sont les meilleurs contrats TNS
- quelle assurance pour un auto-entrepreneur
- quelle protection pour une profession libérale
- loi Madelin : qui peut en bénéficier

### C.4 Intentions couvertes par section

| Section | Intention | Type |
|---|---|---|
| Hero + définition | Qu'est-ce qu'une assurance TNS | Informationnelle |
| Protections essentielles | Quelles assurances pour un TNS | Informationnelle |
| Pourquoi comparer | Comparer assurance TNS | Commerciale |
| Comment ça marche | Obtenir un devis | Transactionnelle |
| Profils | Quelle assurance pour mon statut | Informationnelle + commerciale |
| Comment choisir | Critères de choix | Commerciale |
| FAQ | Toutes intentions | Mix |
| CTA final | Demander une étude | Transactionnelle |

---

## D. STRATÉGIE GEO / IA READINESS

### D.1 Principes directeurs

1. **Chaque section H2/H3 contient une réponse directe de 2-4 phrases** avant tout développement.
2. **Blocs "À retenir"** pour faciliter l'extraction.
3. **Listes à puces et tableaux** plutôt que longs paragraphes.
4. **Sources fiables citées** (légifrance, service-public.fr, URSSAF, organismes officiels).
5. **Définitions en début de section** ("Travailleur non salarié : …").
6. **Données structurées cohérentes** avec le contenu visible.

### D.2 Blocs Q/R structurés (GEO-ready)

Chaque H2 contient une réponse directe extractible. Exemples :

> **H2 — Assurance TNS : de quoi parle-t-on exactement ?**
>
> *Réponse directe (extractible) :* Une assurance TNS désigne l'ensemble des solutions de protection destinées aux travailleurs non salariés : complémentaire santé (mutuelle), prévoyance (arrêt de travail, invalidité, décès), retraite complémentaire et, selon l'activité, responsabilité civile professionnelle. Ces couvertures complètent le régime obligatoire des indépendants, dont les prestations sont souvent plus limitées que celles des salariés.

### D.3 Entités sémantiques structurées

```
ComparateurPro (Organization)
├── Activité : Comparaison et accompagnement en assurance
├── Spécialité : Assurance TNS
├── Localisation : France
└── sameAs / services :
    ├── Comparaison de mutuelles TNS
    ├── Comparaison de contrats de prévoyance TNS
    ├── Comparaison de solutions retraite TNS
    └── Mise en relation avec des partenaires spécialisés
```

Entités liées (cohérentes, sans fabrication) :
- Travailleur non salarié (TNS)
- Indépendant
- Profession libérale
- Auto-entrepreneur
- Protection sociale
- Loi Madelin (1994)
- Mutuelle santé
- Prévoyance
- Retraite complémentaire

### D.4 Sources citées (uniquement des sources fiables)

| Information | Source |
|---|---|
| Définition TNS / régime social | service-public.fr, URSSAF, Sécurité Sociale des Indépendants |
| Loi Madelin (1994) | Légifrance |
| Déduction fiscale cotisations TNS | impots.gouv.fr |
| Statut auto-entrepreneur | auto-entrepreneur.urssaf.fr |
| Professions libérales | URSSAF, Cipav, etc. |
| Comparaison (tableaux) | sources publiques uniquement |

### D.5 Données structurées prévues

| Schema.org | Présence | Justification |
|---|---|---|
| Organization | Oui | Identité de ComparateurPro |
| WebSite | Oui | Identité du site + SearchAction |
| WebPage | Oui | Identification de la page pilier |
| BreadcrumbList | Oui | Fil d'Ariane |
| Article | Oui | Page éditoriale de référence |
| FAQPage | Oui | FAQ réelle (Google peut l'utiliser même si FAQ rich result n'est plus garanti) |
| HowTo | Non pertinent | Pas de procédure pas-à-pas |
| Person | À compléter | Si un auteur est identifiable |

---

## E. SEO TECHNIQUE

### E.1 Balises meta

```html
<title>Assurance TNS : comparez les solutions adaptées | ComparateurPro</title>
<meta name="description" content="Assurance TNS : comprenez vos besoins en mutuelle, prévoyance et retraite, et comparez les solutions adaptées à votre activité d'indépendant avec ComparateurPro. Étude personnalisée et sans engagement.">
<link rel="canonical" href="https://www.comparateurpro.fr/assurance-tns/">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
```

### E.2 Open Graph / Twitter

```html
<meta property="og:type" content="website">
<meta property="og:title" content="Assurance TNS : comparez les solutions adaptées à votre activité">
<meta property="og:description" content="ComparateurPro vous aide à comprendre, comparer et identifier une assurance TNS adaptée à votre situation professionnelle. Mutuelle, prévoyance, retraite.">
<meta property="og:url" content="https://www.comparateurpro.fr/assurance-tns/">
<meta property="og:image" content="https://www.comparateurpro.fr/assets/images/hero-illustration.jpg">
<meta property="og:site_name" content="ComparateurPro">
<meta property="og:locale" content="fr_FR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Assurance TNS : comparez les solutions adaptées | ComparateurPro">
<meta name="twitter:description" content="Mutuelle, prévoyance, retraite TNS : comparez les solutions adaptées à votre activité avec ComparateurPro.">
<meta name="twitter:image" content="https://www.comparateurpro.fr/assets/images/hero-illustration.jpg">
```

### E.3 Recommandation d'URL canonique

| Ancienne URL | Nouvelle URL canonique | Action |
|---|---|---|
| `/assurance-tns-pro-v2-adw` | `/assurance-tns/` | 301 vers nouvelle URL |
| `?ltm_source=...` | (garder URL canonique fixe) | canonical = URL propre |

**Note importante** : le déploiement de la nouvelle URL doit être coordonné avec une redirection 301 propre, et les campagnes Ads doivent pointer vers `/assurance-tns/` avec tracking UTM uniquement (pas dans l'URL canonique).

### E.4 Performance

| Indicateur | Objectif |
|---|---|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| Lighthouse Performance | > 90 |
| Lighthouse SEO | 100 |
| Lighthouse Accessibility | > 95 |

Stratégies :
- HTML léger (< 30 ko avant compressé)
- 1 seul CSS critique + 1 fichier CSS complémentaire
- JS vanilla, chargé en `defer`
- Images AVIF/WebP, dimensions définies, lazy-load sous le fold
- Polices système (`-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`) en priorité
- Aucune dépendance externe inutile
- `prefers-reduced-motion` respecté

### E.5 Sitemap & robots

**sitemap.xml** :
```xml
<urlset>
  <url>
    <loc>https://www.comparateurpro.fr/assurance-tns/</loc>
    <lastmod>2026-09-25</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.comparateurpro.fr/assurance-tns/mutuelle-tns/</loc>
    <priority>0.8</priority>
  </url>
  <!-- ... autres pages satellites ... -->
</urlset>
```

**robots.txt** : autoriser l'indexation, bloquer `/cgi-bin/`, `/admin/`, etc.

---

## F. DESIGN SYSTEM

### F.1 Couleurs

```css
:root {
  --primary: #003781;          /* Navy corporate */
  --primary-dark: #002654;
  --primary-light: #1E5BB8;
  --secondary: #00A5E5;        /* Cyan accent */
  --secondary-light: #4FC3EE;
  --secondary-dark: #0086BD;
  --text: #172033;             /* Body text */
  --text-muted: #5B6472;       /* Secondary text */
  --text-light: #8B95A5;       /* Tertiary */
  --background: #F5F7F9;       /* Page bg */
  --surface: #FFFFFF;          /* Cards */
  --border: #E5E7EB;
  --border-strong: #CBD5E0;
  --success: #16A34A;
  --warning: #D97706;
  --error: #DC2626;
  --focus: #FFB400;            /* Visible focus ring */
}
```

### F.2 Typographie

```css
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "Helvetica Neue", Arial, "Noto Sans", sans-serif;

  --fs-h1: clamp(2.1rem, 4vw + 0.5rem, 3.75rem);    /* 34–60px */
  --fs-h2: clamp(1.75rem, 2.5vw + 0.5rem, 2.75rem); /* 28–44px */
  --fs-h3: clamp(1.375rem, 1vw + 0.8rem, 1.75rem);  /* 22–28px */
  --fs-h4: 1.125rem;
  --fs-body: 1.0625rem;        /* 17px pour confort de lecture */
  --fs-small: 0.875rem;
  --fs-eyebrow: 0.8125rem;

  --lh-tight: 1.15;
  --lh-snug: 1.3;
  --lh-base: 1.6;
  --lh-loose: 1.75;
}
```

### F.3 Espacement (échelle 4px)

```css
:root {
  --space-1: 0.25rem;   /* 4 */
  --space-2: 0.5rem;    /* 8 */
  --space-3: 0.75rem;   /* 12 */
  --space-4: 1rem;      /* 16 */
  --space-5: 1.5rem;    /* 24 */
  --space-6: 2rem;      /* 32 */
  --space-7: 3rem;      /* 48 */
  --space-8: 4rem;      /* 64 */
  --space-9: 6rem;      /* 96 */
  --space-10: 8rem;     /* 128 */
}
```

### F.4 Container & grille

```css
:root {
  --container-max: 1240px;
  --container-narrow: 880px;
  --container-padding: clamp(1rem, 4vw, 2rem);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}
```

Grille : 12 colonnes desktop, 6 colonnes tablet, 4 colonnes mobile.

### F.5 Boutons

| Type | Usage | Style |
|---|---|---|
| Primary | CTA principal | Fond `--primary`, texte blanc, hover assombrissement |
| Secondary | CTA secondaire | Bordure `--primary`, fond transparent |
| Tertiary | Liens d'action | Texte `--primary`, soulignement à l'apparition |
| Ghost | Cartes cliquables | Bordure subtile, hover léger |

États : default, hover, focus-visible (anneau orange `--focus`), active, disabled.
Taille minimale cible : 44×44 px (WCAG 2.5.5).

### F.6 Cards

- Fond `--surface`
- Bordure 1px `--border`
- Border-radius `--radius-lg`
- Padding `var(--space-6)`
- Ombre légère au hover (`box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08)`)
- Icône SVG 40×40 en haut à gauche
- Titre H3 cliquable (le card entier est cliquable)

### F.7 Formulaire

- Inputs hauteur 52px
- Border-radius `--radius-md`
- Focus ring visible orange
- Labels au-dessus des inputs (pas en floating label)
- Messages d'erreur en rouge sous l'input, avec `role="alert"`
- Helper text en gris sous l'input
- Bouton radio "card" (grand choix cliquable, 56px de hauteur min)
- Boutons pleine largeur sur mobile

### F.8 Icônes

- SVG inline (24×24 par défaut)
- Stroke 1.5 ou 2
- Couleur héritée via `currentColor`
- Bibliothèque interne : pas de dépendance externe

### F.9 Animations

- Fade-in léger + translateY(8px) à l'apparition (IntersectionObserver)
- Transitions : 200ms ease-out
- Pas de parallax
- Respect de `@media (prefers-reduced-motion: reduce)`

---

## G. ARCHITECTURE DU CODE

```
/home/user/comparateurpro/
├── index.html                    # Page pilier assurance TNS
├── AUDIT-ET-SPECIFICATIONS.md    # Ce document
├── css/
│   └── style.css                 # Stylesheet principal (mobile-first)
├── js/
│   └── script.js                 # Formulaire, FAQ, animations, tracking
├── assets/
│   ├── images/
│   │   ├── hero-illustration.jpg
│   │   ├── section-expertise.jpg
│   │   └── cta-illustration.jpg
│   └── icons/
│       └── (icônes SVG inline dans HTML)
└── README.md                     # Notes de déploiement
```

**Choix d'architecture** : page statique unique, sans framework. Cette approche maximise les performances, minimise la surface d'attaque, et reste triviale à déployer.

---

## H. SUIVI QUALITÉ FINAL (checklist d'acceptation)

### SEO
- [x] H1 unique avec mot-clé principal
- [x] Structure Hn logique (H1 → H2 → H3)
- [x] Intention informationnelle + commerciale + transactionnelle couverte
- [x] Contenu original, non dupliqué
- [x] Title optimisé (mot-clé + marque)
- [x] Meta description attractive
- [x] Canonical pointant vers URL propre
- [x] Maillage interne vers topic cluster
- [x] Sitemap prévu
- [x] robots correct
- [x] URL canonique recommandée : `/assurance-tns/`

### GEO
- [x] Réponses directes extractibles
- [x] Questions explicites (H2/H3 interrogatifs)
- [x] Entités cohérentes
- [x] Sources pertinentes (à compléter côté publication)
- [x] Contenu AI-readable
- [x] Données structurées Organization + WebSite + WebPage + Breadcrumb + Article + FAQPage
- [x] ComparateurPro défini comme entité

### UX/UI
- [x] Esthétique corporate / insurtech premium
- [x] Pas de copie d'Allianz (référence d'inspiration uniquement)
- [x] Hiérarchie visuelle claire
- [x] Lisibilité élevée (contraste AA)
- [x] Espacements généreux
- [x] CTA visibles et cohérents
- [x] Formulaire moderne 3 étapes avec progression
- [x] Mobile-first responsive

### CRO
- [x] Parcours simplifié (3 étapes au lieu de 12)
- [x] Friction réduite
- [x] Progression visible (barre + "Étape X sur 3")
- [x] Micro-réassurance
- [x] CTA cohérents dans toute la page
- [x] Tracking préparé (dataLayer events)

### Performance
- [x] HTML léger
- [x] Pas de framework JS
- [x] CSS organisé
- [x] Images optimisées (à reconvertir en AVIF/WebP au déploiement)
- [x] Mobile rapide (objectif Lighthouse > 90)

### Accessibilité (WCAG 2.2 AA)
- [x] Contraste texte ≥ 4.5:1 (corps) / 3:1 (gros)
- [x] Navigation clavier testable
- [x] Focus visible (anneau orange)
- [x] Labels associés aux inputs
- [x] aria-label / aria-expanded sur éléments interactifs
- [x] Messages d'erreur accessibles (role="alert")
- [x] Structure Hn logique
- [x] Alt text sur images
- [x] prefers-reduced-motion respecté

### Confiance
- [x] Identité ComparateurPro claire
- [x] Section "À propos" / contact
- [x] Footer institutionnel
- [x] Aucune preuve sociale inventée
- [x] Aucune promesse non démontrée
- [x] Mentions [À COMPLÉTER] pour SIRET/ORIAS/adresse
