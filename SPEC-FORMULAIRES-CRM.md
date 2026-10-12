# ComparateurPro — Alimentation du CRM partagé (multi-sites)

**Date :** 25/09/2026 · **Fichiers :** `js/script.js` (logique), `index.html` (2 formulaires, **non modifiés**)
**Modèle de référence :** `script.js` UBEPRO LP Véhicule professionnel, VERSION 2026-09-24.2

---

## 1. Ce que dit la référence, et ce que j'en ai repris

Le script UBEPRO résout exactement votre problème : **plusieurs landing pages différentes qui alimentent un CRM unique**. Voici les mécanismes repris à l'identique, et pourquoi.

| Mécanisme de la référence | Repris | Pourquoi c'est important |
|---|---|---|
| **Envoi CRM en `no-cors` + `Content-Type: text/plain`** | ✅ | C'est le correctif central du script. Un POST JSON déclenche un pré-vol `OPTIONS` ; le PHP `get_information.php` ne renvoie aucun en-tête CORS → le navigateur bloque et le lead n'est **jamais** envoyé. En `text/plain`, la requête est « simple » : zéro pré-vol. Le PHP lit `php://input` + `json_decode`, il reçoit le même JSON. **Le PHP n'est pas à modifier.** |
| **Enveloppe `{ payload: { formId, id, data } }`** | ✅ | Contrat exact attendu par le CRM. |
| **`formId` par formulaire** (`ADW_LP_VEHICULE_PRO`) | ✅ | **C'est la clé qui distingue les sites** dans un CRM unique (voir §2). |
| **Deux payloads distincts** : `sheetData` (Google Sheet) / `crmData` (contrat CRM strict) | ✅ | Le Sheet et le CRM n'attendent pas le même shape. |
| **Bloc `coordonnees` à 8 champs** : `nom, prenom, mail, telephone, societe, code_postal, civilite, ville` | ✅ | Même contrat, mêmes colonnes, quel que soit le site. Note : `mail`, pas `email`. |
| **`question_1..3` / `reponse_1..3`** avec libellés lus dans le DOM | ✅ | 3 questions / 3 réponses, libellés réels lus dans `<legend>` (lead) et `<label>` (contact). |
| **18 clés de tracking avec alias** (`utm_*`, `ltm_*`, `gclid`, `msclkid`, `fbclid`, `source`, `categorie`, `user`) | ✅ | Vos campagnes Ads utilisent `ltm_*` ; tout arrive dans les mêmes colonnes sur tous les sites. |
| **Mémoire `sessionStorage` du tracking** | ✅ | Le visiteur arrive sur une pub, navigue entre les guides, soumet plus tard : les paramètres sont conservés. |
| **Capture avant `DOMContentLoaded`** | ✅ | Ne pas perdre les paramètres d'entrée si le script est en `defer`. |
| **Repli `navigator.sendBeacon()`** | ✅ | Le lead part même si `fetch` échoue. |
| **`keepalive: true`** | ✅ | La requête survit à un changement de page. |
| **Aucune destination ne fait échouer l'autre** | ✅ | Sheet KO + CRM OK → succès quand même (1 canal suffit). |
| **Honeypot injecté à la volée** | ✅ | Anti-spam **sans toucher au HTML** du formulaire. |
| **Anti-double-envoi + timeout 15 s** | ✅ | Un clic rageur ne crée pas 4 leads. |
| **`generate_lead` dans le dataLayer** | ✅ | Conversion GA4/GTM standard. |
| **Diagnostic console** (`preview()`, `last()`, `tracking()`) | ✅ | `window.comparateurproLead` — vous copiez le payload dans Postman sans soumettre. |
| **Champs cachés de tracking injectés dans le form** | ❌ **volontairement écarté** | La référence documente le bug : un `<input hidden name="categorie">` injecté faisait que `form.querySelector('[name=categorie]')` tombait sur le radio « Citadine » et écrasait sa valeur. J'avais ajouté de tels champs au tour précédent — **ils ont été retirés**, les formulaires sont revenus à l'état d'origine. Le tracking vient uniquement de l'URL, jamais du DOM. |

---

## 2. Plusieurs sites → même CRM : comment ça marche

Le discriminateur est **`formId`**. Chaque site pose sa propre configuration **dans son `index.html`, avant `script.js`** — le fichier `js/script.js` est le même partout et n'est jamais modifié.

```html
<!-- Site A : comparateurpro.fr -->
<script>
  window.COMPARATEURPRO_CONFIG = {
    formIds: { lead: 'ADW_LP_ASSURANCE_TNS_ETUDE',
               contact: 'ADW_LP_ASSURANCE_TNS_CONTACT' }
  };
</script>
<script src="js/script.js" defer></script>
```

```html
<!-- Site B : autre-marque.fr — même CRM, même Sheet, formId différent -->
<script>
  window.COMPARATEURPRO_CONFIG = {
    leadApiUrl: 'https://mc.helloleadpreprod.fr/mon_compte/api/webflow/get_information.php',
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycb…/exec',
    formIds: { lead: 'ADW_LP_AUTREMARQUE_ETUDE',
               contact: 'ADW_LP_AUTREMARQUE_CONTACT' },
    debug: true
  };
</script>
<script src="js/script.js" defer></script>
```

`window.UBEPRO_CONFIG` est aussi accepté comme alias, pour que le même bloc de config serve sur vos sites existants.

**Vérifié en test** : deux sites différents, même endpoint CRM, `formId` distincts, `source` distinct → les leads sont séparables côté CRM par `form_id`.

| Clé de config | Défaut | Rôle |
|---|---|---|
| `leadApiUrl` | `https://mc.helloleadpreprod.fr/mon_compte/api/webflow/get_information.php` | Endpoint CRM |
| `leadApiMode` | `'nocors'` | `'nocors'` (défaut, zéro pré-vol) · `'cors'` (réponse vérifiable, exige les en-têtes CORS côté PHP) · `'off'` (diagnostic) |
| `leadApiCredentials` | `'omit'` | `'include'` si le PHP exige une session same-site |
| `googleScriptUrl` | le GAS du groupe | Google Sheet partagé |
| `formIds.lead` / `formIds.contact` | `ADW_LP_ASSURANCE_TNS_ETUDE` / `…_CONTACT` | **Identifiant du site + du formulaire** |
| `debug` | `false` | Log des payloads en console |

---

## 3. Les deux payloads

### 3.1 CRM — `POST` vers `get_information.php`

```
mode: no-cors · Content-Type: text/plain;charset=UTF-8 · keepalive: true · credentials: omit
```

```json
{
  "payload": {
    "formId": "ADW_LP_ASSURANCE_TNS_ETUDE",
    "id": "2586b664-c031-478d-9f9e-a2459cc21802",
    "data": {
      "nom": "Manaja", "prenom": "Elvin",
      "mail": "elvin@exemple.fr", "telephone": "06 12 34 56 78",
      "societe": "", "code_postal": "", "civilite": "", "ville": "",

      "source": "google", "categorie": "tns", "user": "42",
      "gclid": "CLI-99", "msclkid": "",

      "question_1": "Quel est votre statut",              "reponse_1": "dirigeant",
      "question_2": "Quels types de couverture vous intéressent", "reponse_2": "mutuelle, retraite, rcpro",
      "question_3": "Consentement à être recontacté",     "reponse_3": "oui"
    }
  }
}
```

⚠️ En mode `nocors` la réponse est **opaque** : le navigateur ne peut ni lire le code HTTP ni le corps. `state: 'sent'` signifie « la requête est partie », pas « le CRM a accepté ». C'est le prix du zéro-pré-vol sans toucher au PHP. Si un jour le PHP renvoie les en-têtes CORS, passez `leadApiMode: 'cors'` et l'envoi devient vérifiable (`{"status":"ok"}` exigé).

### 3.2 Google Sheet — `POST` urlencoded

Mêmes champs + les colonnes `site` / `solution` / `enjeu` + les 18 clés de tracking, puis ajoutés à l'envoi : `form_id`, `id_lead`, `page_url`, `page_referrer`, `user_agent`, `langue`. **35 colonnes au total**, jeu identique à la référence → le même Sheet accepte les leads de tous les sites.

La réponse du Sheet **est** vérifiée : HTTP 200 ne suffit pas, il faut `{"status":"ok"}` dans le JSON.

---

## 4. Conformité au contrat — vérifiée par test

`node tests/contrat.test.mjs` compare le payload réellement produit aux définitions lues **dans le script de référence** :

```
✔ coordonnees (8 champs, même ordre)
   référence : nom, prenom, mail, telephone, societe, code_postal, civilite, ville
   notre JS  : nom, prenom, mail, telephone, societe, code_postal, civilite, ville
✔ crmData : champs tracking métier
   référence : source, categorie, user, gclid, msclkid
   notre JS  : source, categorie, user, gclid, msclkid
✔ questionnaires (question_1..3 / reponse_1..3)
✔ Enveloppe CRM : { payload: { formId, id, data } }
✔ Google Sheet : toutes les colonnes de la référence présentes (35)
✔ Aucune colonne inventée en plus
```

---

## 5. Mapping des deux formulaires (HTML inchangé)

### `lead-form` → `formIds.lead`

| Champ du formulaire | Colonne CRM / Sheet | Note |
|---|---|---|
| radio `statut` | `reponse_1`, `site` | `independant` · `dirigeant` · `auto-entrepreneur` |
| checkboxes `besoins` | `reponse_2`, `solution` | Tableau **aplati en chaîne** : `"mutuelle, retraite, rcpro"` |
| `#prenom` / `#nom` | `prenom` / `nom` | trimmés, `<` `>` retirés |
| `#email` | **`mail`** | trimmé + **minuscules** |
| `#telephone` | `telephone` | tel quel (espaces conservés, comme la référence) |
| `#consent` | `reponse_3` (`oui`/`non`) | `question_3` = « Consentement à être recontacté » |
| — | `societe`, `code_postal`, `civilite`, `ville` | `''` (absents du formulaire) |

`question_1` / `question_2` sont les `<legend>` réels des étapes 1 et 2, lus dans le DOM.

### `contact-form` → `formIds.contact`

| Champ du formulaire | Colonne CRM / Sheet | Note |
|---|---|---|
| `#contact-nom` | `nom` | **Nom complet** → `prenom` reste `''` (comme la référence) |
| `#contact-email` | `mail` | minuscules |
| `#contact-telephone` | `telephone` | |
| `#contact-sujet` | `reponse_1`, `site` | `comparer` · `mutuelle` · `prevoyance` · `retraite` · `rcpro` · `partenariat` · `autre` |
| `#contact-message` | `reponse_2` | tronqué à 2 000 car. |
| `#contact-consent` | `reponse_3` | |
| — | `solution`, `enjeu` | `''` |

`question_1` = « Sujet de votre message », `question_2` = « Votre message » — lus dans les `<label for>`.

### Les 8 pages guides
Aucun formulaire. Leurs CTA pointent vers `index.html#study`, donc tout remonte par ces deux formulaires — avec le tracking de la page d'entrée conservé en `sessionStorage`.

---

## 6. Clés de tracking capturées

| Clé | Alias acceptés dans l'URL |
|---|---|
| `source` | `source`, `utm_source`, `ltm_source` |
| `categorie` | `categorie`, `utm_category`, `ltm_category`, `category` |
| `user` | `user`, `utm_user`, `ltm_user` |
| `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` / `utm_term` / `utm_id` | formes courtes (`medium`, `campaign`…) et `ltm_*` |
| `utm_category` / `utm_user` | `ltm_category`, `ltm_user` |
| `ltm_source` / `ltm_category` / `ltm_typ` / `ltm_user` | + leurs équivalents `utm_*` |
| `gclid` / `msclkid` / `fbclid` | — |

Règles (identiques à la référence) : **la dernière valeur non vide gagne**, la query string est prioritaire sur le hash, les paramètres sont persistés en `sessionStorage` (`comparateurpro_tracking_v1`) et **`page_url` reste l'URL de capture** (celle qui portait les paramètres), pas l'URL de soumission.

⚠️ Piège hérité de la référence et **évité** : `categorie` existe à la fois comme **réponse de formulaire** et comme **paramètre de tracking**. Ici les formulaires n'ont aucun champ `categorie`, et le tracking ne lit jamais le DOM → pas de collision possible.

---

## 7. Événements dataLayer

| `event` | Déclencheur | Paramètres |
|---|---|---|
| **`generate_lead`** | une destination au moins a accepté le lead | `form_id`, `lead_site`, `lead_solution` |
| `form_start` / `contact_form_start` | 1er focus | `page` / — |
| `form_step_complete` | étape validée | `step` |
| `form_submit` / `contact_form_submit` | clic envoyer | `statut`, `besoins_count` / `sujet` |
| `form_success` / `contact_form_success` | succès | `statut` / `sujet`, **`simulated`** |
| `crm_error` | les deux destinations ont échoué | `form_id`, `message` |
| `cta_click` | tout `[data-track]` | `cta` |
| `faq_open` | ouverture FAQ | `question` |
| `logo_home_click` | clic logo | `from` |

Déclenchez la conversion GA4 sur `generate_lead` (ou `*_success` avec `simulated === false`).

---

## 8. Diagnostic en console

```js
window.comparateurproLead.config      // endpoints + formIds en cours
window.comparateurproLead.tracking()  // les 18 clés capturées
window.comparateurproLead.preview()   // payloads lead + contact prêts à copier dans Postman
window.comparateurproLead.last()      // résultat du dernier envoi ([{target:'sheet',state:'ok'},…])
window.comparateurproLead.lastPayload // corps exact des deux dernières requêtes
```

Avec `debug: true`, chaque soumission loggue les deux payloads et les résultats.

---

## 9. Ajouter un nouveau site

1. Copier `js/script.js` tel quel.
2. Dans le `<head>` de la page, **avant** le script, poser le bloc `window.COMPARATEURPRO_CONFIG` avec les `formIds` du site (§2).
3. Si le site a des formulaires différents : garder le contrat `coordonnees` + `question_1..3`/`reponse_1..3` et ne changer que le mapping.
4. Vérifier : `window.comparateurproLead.preview()` dans la console.

---

## 10. Tests livrés

```bash
npm i jsdom --no-audit --no-fund
node tests/contrat.test.mjs   # conformité au contrat de la référence
node tests/crm.test.mjs       # payloads réels + 9 cas limites
```

`tests/crm.test.mjs` charge le **vrai** `index.html` et le **vrai** `js/script.js` dans un DOM réel (jsdom), avec `fetch` instrumenté. Cas couverts et **tous passés** :

| Cas | Résultat |
|---|---|
| Lead 3 étapes, UTM + `ltm_*` + `gclid` dans l'URL | payload CRM conforme, `mode: no-cors`, `text/plain`, `keepalive: true`, UUID v4 |
| Contact complet | `formId` contact, `mail` en minuscules, `prenom: ''` |
| Honeypot rempli | **0 appel réseau**, succès affiché quand même |
| Triple clic sur envoyer | **1 seul** envoi CRM |
| CRM + Sheet en panne | message d'erreur, bouton réactivé, `crm_error` poussé, succès **non** affiché |
| Sheet KO / CRM OK | succès affiché + warning console |
| Aucune destination configurée | succès simulé (`simulated: true`), 0 appel réseau |
| Config par site (`window.COMPARATEURPRO_CONFIG`) | `formIds` du site B pris en compte |
| 2e site → même CRM | même endpoint, `formId` distinct |
| Tracking d'une page à l'autre | `ltm_source=bing` retrouvé sur la page 2 sans paramètre |

---

## 11. Ce que je n'ai pas pu vérifier

- **L'envoi réel vers `mc.helloleadpreprod.fr` et vers le Google Apps Script** : pas d'accès réseau sortant vers ces hôtes depuis cet environnement, et pas de credentials. Les tests instrumentent `fetch` : la forme des requêtes est prouvée, leur acceptation par vos serveurs ne l'est pas. À valider en préprod avec `debug: true`.
- **Le mapping côté `get_information.php`** (comment il répartit `categorie_fj`, `id_societe_fj`, SMS PEC, branche TRA) : je me suis calé sur le contrat du payload, pas sur le code PHP que je n'ai pas.
- **Les colonnes exactes du Google Sheet** : le jeu de clés est identique à celui de la référence, mais si votre Apps Script ajoute les lignes **par position** plutôt que par nom de header, vérifiez l'ordre une fois en préprod.
