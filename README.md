# ComparateurPro — Page pilier « Assurance TNS »

Refonte SEO + GEO + UX de la page `/assurance-tns-pro-v2-adw` en page pilier professionnelle de l'assurance TNS.

---

## 📁 Structure

```
comparateurpro/
├── index.html                    Page pilier principale
├── AUDIT-ET-SPECIFICATIONS.md    Audit complet + specs détaillées
├── README.md                     Ce fichier
├── css/
│   └── style.css                 Design system complet (mobile-first)
├── js/
│   └── script.js                 Formulaire, animations, tracking
├── assets/
│   └── images/                   Illustrations hero, expertise, CTA
├── sitemap.xml                   Plan du site
└── robots.txt                    Directives d'indexation
```

---

## 🚀 Lancement local

```bash
# Servir depuis le dossier du projet
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Ou avec n'importe quel serveur statique (nginx, Apache, Vercel, Netlify…).

---

## 🔧 Modifications appliquées (revue du 25/09/2026)

| # | Demande | Réalisation |
|---|---|---|
| 1 | Supprimer « Contacter notre équipe → » en haut | Le bandeau supérieur (`.top-bar`) a été **retiré des 9 pages** — HTML et CSS. Sur mobile, ce bandeau était vide (le message y est masqué) : sa suppression nettoie aussi l'affichage. |
| 2 | Clic sur le logo = accueil + haut de page | Le logo pointe désormais vers `index.html#top` (ancre `<body id="top">`). Sur la page d'accueil, un handler JS (`js/script.js`) intercepte le clic, remonte en haut en `scrollTo` doux (respecte `prefers-reduced-motion`) et pousse l'événement `logo_home_click`. |
| 3 | Supprimer « À propos » et la colonne « Informations légales » | Les deux blocs ont été retirés du pied de page des 9 pages (mentions légales, CGV, confidentialité, cookies, immatriculation, À propos). La grille passe de 4 à 3 colonnes (`css/style.css`). |
| 4 | Vérifier et améliorer le SEO / GEO | Voir `RAPPORT-SEO-GEO.md` — audit automatisé (`audit_seo.py`) passé de **43 à 0 problème**. |

> ℹ️ **Décision du 25/09/2026** : aucune page de politique de confidentialité n'est prévue dans ce build. Les deux cases de consentement des formulaires portent donc un texte autonome, sans lien : « J'accepte que mes informations soient utilisées pour me recontacter au sujet de ma demande. »

---

## 📥 Formulaires & CRM partagé (multi-sites)

Les deux formulaires de la page pilier (`lead-form` en 3 étapes, `contact-form`) alimentent le **CRM unique du groupe**, sur le modèle du script UBEPRO LP Véhicule pro :

- envoi CRM en **`no-cors` + `text/plain`** (zéro pré-vol `OPTIONS`, le PHP n'est pas à modifier) ;
- enveloppe **`{ payload: { formId, id, data } }`** et contrat strict `coordonnees` + `question_1..3` / `reponse_1..3` ;
- double destination **Google Sheet + CRM**, aucune ne fait échouer l'autre ;
- **`formId`** = discriminant du site : chaque site pose son bloc `window.COMPARATEURPRO_CONFIG` dans son HTML, le fichier `js/script.js` reste identique partout ;
- 18 clés de tracking (`utm_*`, `ltm_*`, `gclid`, `msclkid`, `fbclid`) mémorisées en `sessionStorage` ;
- honeypot anti-spam injecté à la volée, anti-double-envoi, timeout 15 s, repli `sendBeacon`.

**Les formulaires HTML n'ont pas été modifiés.** Contrat complet, mapping des champs, configuration par site et diagnostic console : **`SPEC-FORMULAIRES-CRM.md`**.

```bash
npm i jsdom --no-audit --no-fund
node tests/contrat.test.mjs   # conformité au contrat de la référence
node tests/crm.test.mjs       # payloads réels + 9 cas limites
```

---

## ✅ Actions de déploiement restantes

| Emplacement | Information à compléter |
|---|---|
| Footer | Adresse complète, téléphone, n° ORIAS / immatriculation (supprimés à la demande — à réintégrer pour l'E-E-A-T) |
| `Organization` schema | `telephone`, `email`, `address` (bloc `contactPoint` retiré car il ne contenait que des placeholders) |
| `Organization` schema | `foundingDate`, `sameAs` (LinkedIn…) |
| Pages à créer | `/mentions-legales`, `/a-propos`, `/contact` (retirées du `sitemap.xml` tant qu'elles n'existent pas) |
| Texte CTA | Délai de réponse sous X jours ouvrés |

---

## 🔀 Redirections à mettre en place

| Ancienne URL | Nouvelle URL canonique | Type |
|---|---|---|
| `/assurance-tns-pro-v2-adw` | `/assurance-tns/` | 301 |
| `/assurance-tns-pro-v2-adw?ltm_source=*` | `/assurance-tns/` | 301 (canonical conservé sur URL propre) |

---

## 📊 Tracking (dataLayer)

Le code déclenche les événements suivants, prêts à être récupérés par GTM :

| Événement | Quand |
|---|---|
| `cta_click` | Clic sur le CTA principal du hero |
| `form_start` | Premier focus dans le formulaire |
| `form_step_complete` | Validation d'une étape (1, 2, 3) |
| `form_submit` | Soumission du formulaire |
| `form_success` | Retour positif après envoi |
| `faq_open` | Ouverture d'une question FAQ |
| `logo_home_click` | Clic sur le logo ComparateurPro |

Mapping GTM à configurer côté serveur pour envoyer vers GA4.

---

## 🎯 URLs à crawler en priorité après déploiement

1. `/assurance-tns/` (page pilier)
2. `/assurance-tns/mutuelle-tns/`
3. `/assurance-tns/prevoyance-tns/`
4. `/assurance-tns/retraite-tns/`
5. `/assurance-tns/profession-liberale/`
6. `/assurance-tns/independant/`
7. `/assurance-tns/dirigeant/`
8. `/assurance-tns/auto-entrepreneur/`
9. `/assurance-tns/rc-pro/`

---

## ♿ Accessibilité

- WCAG 2.2 AA visé
- Navigation clavier complète
- Focus visible (anneau orange `#FFB400`)
- `prefers-reduced-motion` respecté
- Skip link en tête de page
- Hiérarchie Hn logique
- `aria-label`, `aria-expanded`, `role="alert"` sur les éléments interactifs

---

## 🎨 Design system

| Token | Valeur | Usage |
|---|---|---|
| `--primary` | `#003781` | CTAs, titres forts, identité |
| `--secondary` | `#00A5E5` | Accents, illustrations, focus |
| `--text` | `#172033` | Texte principal |
| `--background` | `#F5F7F9` | Fonds alternés |
| `--focus` | `#FFB400` | Anneau focus (contraste max) |

Typographie : pile système (`-apple-system, "Segoe UI", Roboto, …`) — performance maximale.

---

## 🛡️ Sécurité & conformité

- HTTPS obligatoire
- Headers de sécurité recommandés (CSP, HSTS, X-Frame-Options)
- Formulaire : pas de données personnelles dans les URLs
- Bandeau cookies conforme RGPD à intégrer (sous-traitance non couverte ici)
- Aucun script tiers inutile

---

## ⚠️ Limites assumées

- **Aucune promesse de classement** (cf. directive §40 du brief)
- **Aucune preuve sociale inventée** (chiffres, témoignages, années)
- **Aucune mention réglementaire inventée** (ORIAS, SIRET à compléter)
- **Pas de schéma FAQ rich result garanti** par Google (FAQ rich result n'est plus une fonctionnalité générale de Google Search — schéma conservé pour structuration sémantique)
