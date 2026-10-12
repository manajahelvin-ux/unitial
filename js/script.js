/* =========================================================
   ComparateurPro — Script principal v2
   - Formulaire multi-étapes
   - Sticky header au scroll
   - FAQ accessible (native)
   - Animations d'apparition
   - Tracking dataLayer GTM-ready
   ========================================================= */

(function () {
    'use strict';

    /* Année dynamique */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Tracking (GTM dataLayer) ---------- */
    window.dataLayer = window.dataLayer || [];
    function track(eventName, params) {
        window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
    }

    /* ---------- Sticky header ---------- */
    const header = document.getElementById('site-header');
    if (header) {
        let ticking = false;
        function updateHeader() {
            if (window.scrollY > 12) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
            ticking = false;
        }
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
        updateHeader();
    }

    /* ---------- Menu mobile ---------- */
    const navToggle = document.querySelector('.nav-toggle');
    const siteNav = document.getElementById('site-nav');
    if (navToggle && siteNav) {
        const closeNav = () => {
            siteNav.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Ouvrir le menu');
        };
        navToggle.addEventListener('click', () => {
            const open = siteNav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
        });
        siteNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeNav();
        });
    }

    /* ---------- Logo : retour accueil + haut de page ---------- */
    document.querySelectorAll('a.brand').forEach(link => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href') || '';
            const onCurrentPage = href === 'index.html#top' || href === '#top' || href === '/#top';
            if (onCurrentPage) {
                event.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
                });
                history.replaceState(null, '', window.location.pathname);
            }
            track('logo_home_click', { from: window.location.pathname });
        });
    });


    /* =========================================================
       INTÉGRATION CRM — même contrat que les autres sites du groupe
       Modèle de référence : UBEPRO LP Véhicule pro (VERSION 2026-09-24.2)

       PLUSIEURS SITES → MÊME CRM.
       Ce qui distingue un site / un formulaire côté CRM, c'est `formId`
       (colonne `form_id` du Google Sheet + `payload.formId` du CRM).
       Chaque site pose donc sa propre config, sans toucher à ce fichier.

       Configuration — dans index.html, AVANT <script src="js/script.js"> :

         <script>
           window.COMPARATEURPRO_CONFIG = {
             leadApiUrl: 'https://mc.helloleadpreprod.fr/mon_compte/api/webflow/get_information.php',
             leadApiMode: 'nocors',      // 'nocors' | 'cors' | 'off'
             googleScriptUrl: 'https://script.google.com/macros/s/.../exec',
             formIds: { lead: 'ADW_LP_ASSURANCE_TNS_ETUDE',
                        contact: 'ADW_LP_ASSURANCE_TNS_CONTACT' },
             debug: true
           };
         </script>

       Diagnostic console : window.comparateurproLead.preview() / .last() / .tracking()
       ========================================================= */
    const APP_CONFIG = Object.assign({
        /* Google Sheet partagé par tous les sites du groupe. */
        googleScriptUrl: 'https://script.google.com/macros/s/AKfycbwrbyCb9-cAmIRPGNvnb-aM-CkhQAerrkfP3_HSw-ewmThxsn4vbZt5daaq2aOnL01a1w/exec',
        /* get_information.php du CRM : lit php://input + json_decode. */
        leadApiUrl: 'https://mc.helloleadpreprod.fr/mon_compte/api/webflow/get_information.php',
        /* 'nocors' : POST simple en text/plain → ZÉRO pré-vol OPTIONS, le PHP
                      n'a pas à renvoyer d'en-tête CORS. Réponse opaque (défaut).
           'cors'   : POST JSON vérifiable — exige les en-têtes CORS côté PHP.
           'off'    : désactive l'envoi CRM (diagnostic). */
        leadApiMode: 'nocors',
        /* 'omit' : pas de cookie (endpoint public). 'include' si le PHP exige
           une session same-site — autorisé même en no-cors. */
        leadApiCredentials: 'omit',
        /* Identifiant de formulaire : c'est LA clé qui distingue les sites
           et les formulaires dans un CRM unique. */
        formIds: {
            lead: 'ADW_LP_ASSURANCE_TNS_ETUDE',
            contact: 'ADW_LP_ASSURANCE_TNS_CONTACT'
        },
        debug: false
    }, window.COMPARATEURPRO_CONFIG || window.UBEPRO_CONFIG || {});

    const GOOGLE_SCRIPT_URL = APP_CONFIG.googleScriptUrl;
    const LEAD_API_URL = APP_CONFIG.leadApiUrl;
    const LEAD_API_MODE = APP_CONFIG.leadApiMode;
    const LEAD_API_CREDENTIALS = APP_CONFIG.leadApiCredentials === 'include' ? 'include' : 'omit';
    const DEBUG = !!APP_CONFIG.debug;

    const TRACKING_STORAGE_KEY = 'comparateurpro_tracking_v1';
    const TRACKING_PAGE_STORAGE_KEY = 'comparateurpro_tracking_page_url_v1';
    const TRACKING_VERSION = '2026-09-25.1';
    const REQUEST_TIMEOUT_MS = 15000;

    /* Clés de tracking et leurs alias — identiques à la référence, pour que
       les campagnes de tous les sites arrivent dans les mêmes colonnes. */
    const TRACKING_KEYS = [
        { key: 'source', aliases: ['source', 'utm_source', 'ltm_source'] },
        { key: 'categorie', aliases: ['categorie', 'utm_category', 'ltm_category', 'category'] },
        { key: 'user', aliases: ['user', 'utm_user', 'ltm_user'] },
        { key: 'utm_source', aliases: ['utm_source', 'ltm_source', 'source'] },
        { key: 'utm_medium', aliases: ['utm_medium', 'medium'] },
        { key: 'utm_campaign', aliases: ['utm_campaign', 'campaign'] },
        { key: 'utm_content', aliases: ['utm_content', 'content'] },
        { key: 'utm_term', aliases: ['utm_term', 'term'] },
        { key: 'utm_id', aliases: ['utm_id', 'campaign_id'] },
        { key: 'utm_category', aliases: ['utm_category', 'ltm_category', 'categorie', 'category'] },
        { key: 'utm_user', aliases: ['utm_user', 'ltm_user', 'user'] },
        { key: 'ltm_source', aliases: ['ltm_source', 'utm_source', 'source'] },
        { key: 'ltm_category', aliases: ['ltm_category', 'utm_category', 'categorie', 'category'] },
        { key: 'ltm_typ', aliases: ['ltm_typ', 'utm_typ', 'typ'] },
        { key: 'ltm_user', aliases: ['ltm_user', 'utm_user', 'user'] },
        { key: 'gclid', aliases: ['gclid'] },
        { key: 'msclkid', aliases: ['msclkid'] },
        { key: 'fbclid', aliases: ['fbclid'] }
    ];

    const CONSENT_QUESTION = 'Consentement à être recontacté';

    /* --- Normalisation --- */
    const safeText = (value, maxLength = 500) => {
        const text = String(value === undefined || value === null ? '' : value).replace(/\s+/g, ' ').trim();
        return text.slice(0, maxLength);
    };
    const normalizePayloadValue = (value) => safeText(value, 500).replace(/[<>]/g, '');
    const debugLog = function () {
        if (!DEBUG) return;
        console.log.apply(console, ['[comparateurpro]'].concat([].slice.call(arguments)));
    };

    /** UUID v4, avec repli hors contexte sécurisé (crypto.randomUUID absent). */
    const generateId = () => {
        try {
            if (window.crypto && typeof window.crypto.randomUUID === 'function') {
                return window.crypto.randomUUID();
            }
        } catch (err) { /* contexte non sécurisé */ }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            const random = (Math.random() * 16) | 0;
            const value = char === 'x' ? random : (random & 0x3) | 0x8;
            return value.toString(16);
        });
    };

    /* --- Capture du tracking (avant tout deferred) --- */
    const ENTRY_PAGE_URL = typeof window.__COMPARATEURPRO_ENTRY_URL__ === 'string'
        ? window.__COMPARATEURPRO_ENTRY_URL__
        : window.location.href;

    const parseParamsFromString = (searchString) => {
        const params = Object.create(null);
        new URLSearchParams(searchString || '').forEach((value, key) => {
            const cleanKey = String(key).trim().toLowerCase();
            const cleanValue = normalizePayloadValue(value);
            if (cleanKey && cleanValue) params[cleanKey] = cleanValue;
        });
        return params;
    };

    /** Query classique, #/page?source=... et #source=... ; la query est prioritaire. */
    const getUrlParams = (href) => {
        try {
            const url = new URL(href || window.location.href, window.location.href);
            const hash = url.hash.slice(1);
            const queryIndex = hash.indexOf('?');
            const hashQuery = queryIndex !== -1
                ? hash.slice(queryIndex + 1)
                : (hash.includes('=') && !hash.startsWith('/') ? hash : '');
            return Object.assign({}, parseParamsFromString(hashQuery), parseParamsFromString(url.search));
        } catch (err) {
            return {};
        }
    };

    /** Ne relire que les clés connues, jamais un objet de stockage arbitraire. */
    const readStoredParams = () => {
        try {
            const parsed = JSON.parse(window.sessionStorage.getItem(TRACKING_STORAGE_KEY) || '{}');
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
            const stored = {};
            TRACKING_KEYS.forEach(({ key }) => {
                if (Object.prototype.hasOwnProperty.call(parsed, key) && typeof parsed[key] === 'string') {
                    const value = normalizePayloadValue(parsed[key]);
                    if (value) stored[key] = value;
                }
            });
            return stored;
        } catch (err) {
            return {};
        }
    };

    let trackingMemory = readStoredParams();
    let trackingPageUrl = ENTRY_PAGE_URL;
    try {
        const storedUrl = window.sessionStorage.getItem(TRACKING_PAGE_STORAGE_KEY);
        if (storedUrl && Object.keys(trackingMemory).length > 0) trackingPageUrl = storedUrl;
    } catch (err) { /* Mémoire seule, pour cette page. */ }

    const storeParams = (params) => {
        trackingMemory = Object.assign({}, trackingMemory, params);
        try {
            window.sessionStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(trackingMemory));
        } catch (err) { /* Les valeurs restent disponibles en mémoire. */ }
        return Object.assign({}, trackingMemory);
    };

    /** Dernière valeur non vide de chaque clé gagne ; visite directe peut rester vide. */
    const captureTrackingParams = (href) => {
        const urlParams = getUrlParams(href);
        const relevant = {};
        TRACKING_KEYS.forEach(({ key, aliases }) => {
            const foundAlias = aliases.find((alias) => urlParams[alias]);
            if (foundAlias) relevant[key] = urlParams[foundAlias];
        });
        if (Object.keys(relevant).length > 0) {
            storeParams(relevant);
            trackingPageUrl = safeText(href || window.location.href, 1000);
            try {
                window.sessionStorage.setItem(TRACKING_PAGE_STORAGE_KEY, trackingPageUrl);
            } catch (err) { /* L'URL de capture reste en mémoire. */ }
        }
        return Object.assign({}, trackingMemory);
    };

    /** URL courante > valeurs capturées/mémorisées ; aucune dépendance au DOM. */
    const getTrackingValues = () => {
        captureTrackingParams();
        const out = {};
        TRACKING_KEYS.forEach(({ key }) => { out[key] = normalizePayloadValue(trackingMemory[key]); });
        return out;
    };

    /* Ne pas attendre DOMContentLoaded pour conserver les paramètres d'entrée. */
    captureTrackingParams(ENTRY_PAGE_URL);
    captureTrackingParams();

    /* =========================================================
       ENVOI : Google Sheet (réponse vérifiée) + CRM (opaque en nocors)
       ========================================================= */

    /** Réponse GAS : HTTP 200 même en erreur métier → il FAUT lire le JSON. */
    function sendToGoogleSheet(googleFormData) {
        if (!GOOGLE_SCRIPT_URL) return Promise.resolve({ target: 'sheet', state: 'off' });
        const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
        return fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: googleFormData,
            signal: controller ? controller.signal : undefined
        }).then((response) => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.text();
        }).then((text) => {
            let parsed = null;
            try { parsed = JSON.parse(text); } catch (err) { parsed = null; }
            if (!parsed || parsed.status !== 'ok') {
                throw new Error((parsed && parsed.message) || 'Réponse inattendue du script Google.');
            }
            return { target: 'sheet', state: 'ok', response: parsed };
        }).catch((err) => {
            console.error('[comparateurpro] Google Sheet en échec :', err);
            return { target: 'sheet', state: 'error', error: err };
        }).then((result) => {
            if (timeoutId) clearTimeout(timeoutId);
            return result;
        });
    }

    /**
     * Envoi vers get_information.php.
     * Le PHP lit le corps brut (php://input + json_decode) : envoyer le JSON en
     * text/plain rend la requête « simple » → AUCUN pré-vol OPTIONS → pas de
     * blocage CORS, sans modifier le PHP. Repli navigator.sendBeacon().
     */
    function sendToCrm(crmPayload, formId, leadId) {
        if (LEAD_API_MODE === 'off' || !LEAD_API_URL) {
            return Promise.resolve({ target: 'crm', state: 'off' });
        }

        const body = JSON.stringify({ payload: { formId: formId, id: leadId, data: crmPayload } });

        /* Mode vérifiable : exige les en-têtes CORS côté PHP. */
        if (LEAD_API_MODE === 'cors') {
            const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
            const timeoutId = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
            return fetch(LEAD_API_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: body,
                signal: controller ? controller.signal : undefined
            }).then((response) => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.text();
            }).then((text) => {
                let parsed = null;
                try { parsed = JSON.parse(text); } catch (err) { parsed = null; }
                if (!parsed || parsed.status !== 'ok') {
                    throw new Error((parsed && parsed.message) || 'Réponse inattendue du CRM.');
                }
                return { target: 'crm', state: 'ok', response: parsed };
            }).catch((err) => {
                console.error('[comparateurpro] CRM en échec (mode cors) :', err);
                return { target: 'crm', state: 'error', error: err };
            }).then((result) => {
                if (timeoutId) clearTimeout(timeoutId);
                return result;
            });
        }

        /* Mode par défaut : requête simple, pas de pré-vol, réponse opaque.
           response.type === 'opaque' et response.ok === false :
           NE PAS en déduire un échec. */
        const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
        return fetch(LEAD_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: body,
            keepalive: true,          // la requête survit à un changement de page
            credentials: LEAD_API_CREDENTIALS,
            signal: controller ? controller.signal : undefined
        }).then((response) => {
            return { target: 'crm', state: 'sent', opaque: response.type === 'opaque' };
        }).catch((err) => {
            console.error('[comparateurpro] CRM : fetch no-cors en échec, repli sendBeacon :', err);
            try {
                const queued = typeof navigator.sendBeacon === 'function'
                    ? navigator.sendBeacon(LEAD_API_URL, new Blob([body], { type: 'text/plain;charset=UTF-8' }))
                    : false;
                if (queued) return { target: 'crm', state: 'unverified' };
            } catch (beaconErr) { /* ignoré */ }
            return { target: 'crm', state: 'error', error: err };
        }).then((result) => {
            if (timeoutId) clearTimeout(timeoutId);
            return result;
        });
    }

    /* --- Honeypot anti-spam injecté à la volée (HTML du formulaire intact) --- */
    function addHoneypot(targetForm) {
        let honeypot = targetForm.querySelector('input[name="website"]');
        if (honeypot) return honeypot;
        honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';
        honeypot.setAttribute('aria-hidden', 'true');
        honeypot.setAttribute('aria-label', 'Ne pas remplir');
        honeypot.style.position = 'absolute';
        honeypot.style.left = '-9999px';
        honeypot.style.width = '1px';
        honeypot.style.height = '1px';
        honeypot.style.opacity = '0';
        honeypot.style.pointerEvents = 'none';
        targetForm.appendChild(honeypot);
        return honeypot;
    }

    /** Libellé réel d'un champ, lu dans son <label for="…">. */
    function labelOf(inputId) {
        const label = document.querySelector('label[for="' + inputId + '"]');
        return safeText(label ? label.textContent : '', 200).replace(/\s*\?$/, '');
    }

    /** Envoi parallèle : aucune destination ne fait échouer l'autre. */
    function dispatchLead(options) {
        const formId = normalizePayloadValue(options.formId);
        const leadId = generateId();

        const googleFormData = new URLSearchParams();
        Object.keys(options.sheetData).forEach((key) => {
            googleFormData.set(key, options.sheetData[key]);
        });
        googleFormData.set('form_id', formId);
        googleFormData.set('id_lead', leadId);
        googleFormData.set('page_url', safeText(trackingPageUrl, 1000));
        googleFormData.set('page_referrer', safeText(document.referrer, 1000));
        googleFormData.set('user_agent', safeText(navigator.userAgent, 300));
        googleFormData.set('langue', safeText(navigator.language || '', 20));

        debugLog('Google Sheet payload :', Object.fromEntries(googleFormData.entries()));
        debugLog('CRM payload :', { payload: { formId: formId, id: leadId, data: options.crmData } });

        const envelope = { payload: { formId: formId, id: leadId, data: options.crmData } };
        window.comparateurproLead.lastPayload = { sheet: Object.fromEntries(googleFormData.entries()), crm: envelope };

        return Promise.all([
            sendToGoogleSheet(googleFormData),
            sendToCrm(options.crmData, formId, leadId)
        ]).then((results) => {
            window.comparateurproLead.lastResults = results;
            debugLog('Résultats des envois :', results);
            const sheetOk = results.some((r) => r.target === 'sheet' && r.state === 'ok');
            const crmSent = results.some((r) => r.target === 'crm' &&
                (r.state === 'sent' || r.state === 'ok' || r.state === 'unverified'));
            const nothingConfigured = results.every((r) => r.state === 'off');
            return {
                results: results,
                formId: formId,
                leadId: leadId,
                ok: sheetOk || crmSent || nothingConfigured,
                simulated: nothingConfigured,
                sheetOk: sheetOk,
                crmSent: crmSent
            };
        });
    }

    /** Conversion GA4 / GTM — le tracking ne doit jamais casser le succès. */
    function pushLeadConversion(formId, sheetData) {
        try {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'generate_lead',
                form_id: formId,
                lead_site: sheetData.site,
                lead_solution: sheetData.solution
            });
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'generate_lead', { form_id: formId });
            }
        } catch (err) { /* ignoré */ }
    }

    /* --- Outil de diagnostic en console --- */
    let contactPayloadBuilder = null;
    window.comparateurproLead = {
        version: TRACKING_VERSION,
        config: {
            leadApiUrl: LEAD_API_URL,
            leadApiMode: LEAD_API_MODE,
            googleScriptUrl: GOOGLE_SCRIPT_URL,
            formIds: APP_CONFIG.formIds
        },
        /** Payloads qui seront postés (à copier dans curl / Postman). */
        preview: () => {
            const out = { tracking: getTrackingValues() };
            try {
                const lead = buildLeadPayloads();
                out.lead = { formId: APP_CONFIG.formIds.lead, sheet: lead.sheetData, crm: lead.crmData };
            } catch (err) { out.lead = 'indisponible : ' + err.message; }
            try {
                if (contactPayloadBuilder) {
                    const contact = contactPayloadBuilder();
                    out.contact = { formId: APP_CONFIG.formIds.contact, sheet: contact.sheetData, crm: contact.crmData };
                }
            } catch (err) { out.contact = 'indisponible : ' + err.message; }
            return out;
        },
        lastResults: null,
        lastPayload: null,
        last: () => window.comparateurproLead.lastResults,
        tracking: getTrackingValues
    };

    /* ---------- CTA Hero tracking ---------- */
    document.querySelectorAll('[data-track]').forEach(el => {
        el.addEventListener('click', () => {
            const name = el.getAttribute('data-track');
            track('cta_click', { cta: name });
        });
    });

    /* ---------- Animations d'apparition ---------- */
    const revealTargets = document.querySelectorAll(
        '.section-title, .solution, .profile, .method__step, .criteria__item, ' +
        '.guide, .faq__item, .editorial__body > p, .editorial__body > h3, ' +
        '.callout, .hero__intro > *, .solutions-intro > *, .editorial__intro > *'
    );
    revealTargets.forEach(el => el.classList.add('reveal'));

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    } else {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    }

    /* ---------- Formulaire multi-étapes ---------- */
    const form = document.getElementById('lead-form');
    if (!form) return;

    const steps = form.querySelectorAll('.form__step');
    const progressBar = document.getElementById('progress-bar');
    const currentStepEl = document.getElementById('current-step');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnSubmit = document.getElementById('btn-submit');
    const formError = document.getElementById('form-error');
    const formSuccess = document.getElementById('form-success');
    const actionsContainer = document.querySelector('.form__actions');
    const formHeader = document.querySelector('.form__header');

    let currentStep = 1;
    const totalSteps = steps.length;

    function updateUI() {
        steps.forEach((step, idx) => {
            step.classList.toggle('is-active', idx + 1 === currentStep);
        });
        if (currentStepEl) currentStepEl.textContent = currentStep;
        if (progressBar) progressBar.style.width = ((currentStep / totalSteps) * 100) + '%';
        if (btnPrev) btnPrev.hidden = (currentStep === 1);
        if (btnNext) btnNext.hidden = (currentStep === totalSteps);
        if (btnSubmit) btnSubmit.hidden = (currentStep !== totalSteps);

        if (currentStep > 1) {
            const rect = form.getBoundingClientRect();
            if (rect.top < 80 || rect.top > window.innerHeight * 0.4) {
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    function validateStep(stepNumber) {
        formError.textContent = '';
        const step = form.querySelector('.form__step[data-step="' + stepNumber + '"]');
        if (!step) return true;

        if (stepNumber === 1) {
            const checked = step.querySelector('input[name="statut"]:checked');
            if (!checked) {
                formError.textContent = 'Veuillez sélectionner votre statut pour continuer.';
                return false;
            }
        }
        if (stepNumber === 2) {
            const checked = step.querySelectorAll('input[name="besoins"]:checked');
            if (checked.length === 0) {
                formError.textContent = 'Sélectionnez au moins un type de couverture.';
                return false;
            }
        }
        if (stepNumber === 3) {
            const requiredFields = step.querySelectorAll('input[required]');
            let valid = true;
            let firstInvalid = null;
            requiredFields.forEach(field => {
                field.removeAttribute('aria-invalid');
                if (!field.checkValidity()) {
                    valid = false;
                    field.setAttribute('aria-invalid', 'true');
                    if (!firstInvalid) firstInvalid = field;
                }
            });
            if (!valid) {
                formError.textContent = 'Merci de compléter les champs obligatoires.';
                if (firstInvalid) firstInvalid.focus();
            }
            return valid;
        }
        return true;
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (!validateStep(currentStep)) return;
            track('form_step_complete', { step: currentStep });
            if (currentStep < totalSteps) {
                currentStep++;
                updateUI();
            }
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateUI();
            }
        });
    }

    let leadSubmitting = false;
    const leadHoneypot = addHoneypot(form);

    /** Libellé réel de l'étape, lu dans le <legend> affiché. */
    function stepLabel(n) {
        const legend = form.querySelector('.form__step[data-step="' + n + '"] legend');
        return safeText(legend ? legend.textContent : '', 200).replace(/\s*\?$/, '');
    }

    /* Payloads construits hors soumission pour être testables via preview(). */
    function buildLeadPayloads() {
        const statutEl = form.querySelector('input[name="statut"]:checked');
        const statut = statutEl ? statutEl.value : '';
        const besoins = Array.from(form.querySelectorAll('input[name="besoins"]:checked')).map(i => i.value);
        const consentEl = form.querySelector('#consent');
        const tracking = getTrackingValues();

        /* Contrat « coordonnées » du CRM — identique sur tous les sites. */
        const coordonnees = {
            nom: normalizePayloadValue(form.querySelector('#nom').value),
            prenom: normalizePayloadValue(form.querySelector('#prenom').value),
            mail: normalizePayloadValue(form.querySelector('#email').value).toLowerCase(),
            telephone: normalizePayloadValue(form.querySelector('#telephone').value),
            societe: '',
            code_postal: '',
            civilite: '',
            ville: ''
        };

        /* 3 questions / 3 réponses, comme le contrat get_information.php. */
        const questionnaires = {
            question_1: stepLabel(1),
            reponse_1: normalizePayloadValue(statut),
            question_2: stepLabel(2),
            reponse_2: besoins.map(v => normalizePayloadValue(v)).join(', '),
            question_3: CONSENT_QUESTION,
            reponse_3: (consentEl && consentEl.checked) ? 'oui' : 'non'
        };

        /* Colonnes site / solution / enjeu du Google Sheet partagé. */
        const sheetData = Object.assign({}, coordonnees, {
            site: normalizePayloadValue(statut),
            solution: questionnaires.reponse_2,
            enjeu: ''
        }, questionnaires, tracking);

        /* Contrat strict du CRM : coordonnées + tracking métier + questionnaires. */
        const crmData = Object.assign({}, coordonnees, {
            source: tracking.source,
            categorie: tracking.categorie,
            user: tracking.user,
            gclid: tracking.gclid,
            msclkid: tracking.msclkid
        }, questionnaires);

        return { tracking: tracking, sheetData: sheetData, crmData: crmData, statut: statut, besoins: besoins };
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (leadSubmitting) return;
        if (!validateStep(currentStep)) return;

        formError.textContent = '';
        leadSubmitting = true;

        const submitBtn = form.querySelector('#btn-submit');
        if (submitBtn) {
            submitBtn.setAttribute('aria-busy', 'true');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi en cours…';
        }

        /* Honeypot rempli = robot : succès affiché, aucun envoi. */
        if (leadHoneypot && leadHoneypot.value.trim() !== '') {
            debugLog('Honeypot rempli, envoi ignoré.');
            steps.forEach(st => st.style.display = 'none');
            if (actionsContainer) actionsContainer.style.display = 'none';
            if (formHeader) formHeader.style.display = 'none';
            if (formSuccess) formSuccess.hidden = false;
            leadSubmitting = false;
            return;
        }

        const built = buildLeadPayloads();
        track('form_submit', { statut: built.statut, besoins_count: built.besoins.length });

        dispatchLead({
            formId: APP_CONFIG.formIds.lead,
            sheetData: built.sheetData,
            crmData: built.crmData
        }).then((outcome) => {
            if (!outcome.ok) {
                formError.textContent = "L'envoi a échoué. Merci de réessayer.";
                track('crm_error', { form_id: outcome.formId });
                return;
            }
            steps.forEach(st => st.style.display = 'none');
            if (actionsContainer) actionsContainer.style.display = 'none';
            if (formHeader) formHeader.style.display = 'none';
            formError.textContent = '';
            if (formSuccess) formSuccess.hidden = false;
            pushLeadConversion(outcome.formId, built.sheetData);
            track('form_success', { statut: built.statut, simulated: outcome.simulated });
            if (!outcome.sheetOk && outcome.crmSent) console.warn('[comparateurpro] Lead livré au CRM mais Google Sheet en échec.');
            if (!outcome.crmSent && outcome.sheetOk) console.warn('[comparateurpro] Lead livré au Google Sheet mais non envoyé au CRM.');
        }).catch((err) => {
            console.error("[comparateurpro] Échec de l'envoi du lead :", err);
            formError.textContent = "L'envoi a échoué. Merci de réessayer.";
            track('crm_error', { form_id: APP_CONFIG.formIds.lead, message: String(err && err.message || err) });
        }).then(() => {
            leadSubmitting = false;
            if (submitBtn) {
                submitBtn.removeAttribute('aria-busy');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Envoyer ma demande';
            }
        });
    });

    /* Track démarrage du formulaire */
    let formStarted = false;
    form.addEventListener('focusin', () => {
        if (!formStarted) {
            formStarted = true;
            track('form_start', { page: 'assurance-tns' });
        }
    });

    updateUI();

    /* ---------- FAQ tracking ---------- */
    document.querySelectorAll('.faq__item').forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                const q = item.querySelector('.faq__q span').textContent.trim();
                track('faq_open', { question: q });
            }
        });
    });

    /* ---------- Formulaire de contact ---------- */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const errorEl = document.getElementById('contact-form-error');
        const successEl = document.getElementById('contact-form-success');

        let contactStarted = false;
        contactForm.addEventListener('focusin', () => {
            if (!contactStarted) {
                contactStarted = true;
                track('contact_form_start');
            }
        });

        const contactHoneypot = addHoneypot(contactForm);
        let contactSubmitting = false;

        /* Même contrat que le lead-form → un seul CRM, un seul Google Sheet. */
        function buildContactPayloads() {
            const sujetEl = contactForm.querySelector('#contact-sujet');
            const consentEl = contactForm.querySelector('#contact-consent');
            const tracking = getTrackingValues();

            const coordonnees = {
                /* Ce formulaire n'a qu'un « Nom complet » : pas de prénom dédié,
                   comme dans la référence (prenom: ''). */
                nom: normalizePayloadValue(contactForm.querySelector('#contact-nom').value),
                prenom: '',
                mail: normalizePayloadValue(contactForm.querySelector('#contact-email').value).toLowerCase(),
                telephone: normalizePayloadValue(contactForm.querySelector('#contact-telephone').value),
                societe: '',
                code_postal: '',
                civilite: '',
                ville: ''
            };

            const questionnaires = {
                question_1: labelOf('contact-sujet'),
                reponse_1: normalizePayloadValue(sujetEl ? sujetEl.value : ''),
                question_2: labelOf('contact-message'),
                reponse_2: safeText(contactForm.querySelector('#contact-message').value, 2000),
                question_3: CONSENT_QUESTION,
                reponse_3: (consentEl && consentEl.checked) ? 'oui' : 'non'
            };

            const sheetData = Object.assign({}, coordonnees, {
                site: questionnaires.reponse_1,
                solution: '',
                enjeu: ''
            }, questionnaires, tracking);

            const crmData = Object.assign({}, coordonnees, {
                source: tracking.source,
                categorie: tracking.categorie,
                user: tracking.user,
                gclid: tracking.gclid,
                msclkid: tracking.msclkid
            }, questionnaires);

            return { tracking: tracking, sheetData: sheetData, crmData: crmData, sujet: questionnaires.reponse_1 };
        }
        contactPayloadBuilder = buildContactPayloads;

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (contactSubmitting) return;
            if (errorEl) errorEl.textContent = '';

            const requiredFields = contactForm.querySelectorAll('input[required], select[required], textarea[required]');
            let valid = true;
            let firstInvalid = null;

            requiredFields.forEach(field => {
                if (field === contactHoneypot) return;      // jamais bloquant
                field.removeAttribute('aria-invalid');
                if (!field.checkValidity()) {
                    valid = false;
                    field.setAttribute('aria-invalid', 'true');
                    if (!firstInvalid) firstInvalid = field;
                }
            });

            if (!valid) {
                if (errorEl) errorEl.textContent = 'Merci de compléter tous les champs obligatoires.';
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            contactSubmitting = true;
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.setAttribute('aria-busy', 'true');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Envoi en cours…';
            }

            /* Honeypot rempli = robot : succès affiché, aucun envoi. */
            if (contactHoneypot && contactHoneypot.value.trim() !== '') {
                debugLog('Honeypot rempli, envoi ignoré.');
                if (successEl) successEl.hidden = false;
                contactSubmitting = false;
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Envoyer mon message'; }
                return;
            }

            const built = buildContactPayloads();
            track('contact_form_submit', { sujet: built.sujet });

            dispatchLead({
                formId: APP_CONFIG.formIds.contact,
                sheetData: built.sheetData,
                crmData: built.crmData
            }).then((outcome) => {
                if (!outcome.ok) {
                    if (errorEl) errorEl.textContent = "L'envoi a échoué. Merci de réessayer.";
                    track('crm_error', { form_id: outcome.formId });
                    return;
                }
                contactForm.querySelectorAll('.contact-form__row, .contact-form__field, .contact-form__actions, .contact-form__intro')
                    .forEach(el => el.style.display = 'none');
                if (errorEl) errorEl.textContent = '';
                if (successEl) successEl.hidden = false;
                pushLeadConversion(outcome.formId, built.sheetData);
                track('contact_form_success', { sujet: built.sujet, simulated: outcome.simulated });
            }).catch((err) => {
                console.error("[comparateurpro] Échec de l'envoi du contact :", err);
                if (errorEl) errorEl.textContent = "L'envoi a échoué. Merci de réessayer.";
                track('crm_error', { form_id: APP_CONFIG.formIds.contact, message: String(err && err.message || err) });
            }).then(() => {
                contactSubmitting = false;
                if (submitBtn) {
                    submitBtn.removeAttribute('aria-busy');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Envoyer mon message';
                }
            });
        });
    }

})();

/* ============================================================
   v1.1 — Barre CTA collante (mobile)
   Apparaît dès que le bloc cible a quitté l'écran :
     • page pilier : la carte contenant le formulaire (#study)
     • pages guides : le hero (le formulaire est sur la page pilier)
   ============================================================ */
(function () {
    'use strict';
    var bar = document.getElementById('sticky-cta');
    if (!bar) return;

    var cible = document.getElementById('study') || document.querySelector('main .hero');
    if (!cible) return;

    var enAttente = false;

    function maj() {
        enAttente = false;
        var rect = cible.getBoundingClientRect();
        // Le bloc est passé au-dessus de l'écran (marge du header) → CTA utile
        if (rect.bottom < 120) { bar.removeAttribute('hidden'); }
        else { bar.setAttribute('hidden', ''); }
    }

    function surScroll() {
        if (enAttente) return;
        enAttente = true;
        window.requestAnimationFrame(maj);
    }

    window.addEventListener('scroll', surScroll, { passive: true });
    window.addEventListener('resize', surScroll);
    maj();

    /* Une fois la demande envoyée ou l'ancre suivie, la barre n'a plus d'utilité. */
    Array.prototype.forEach.call(bar.querySelectorAll('a'), function (a) {
        a.addEventListener('click', function () { bar.setAttribute('hidden', ''); });
    });
})();
