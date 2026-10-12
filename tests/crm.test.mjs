import fs from 'fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(new URL('../index.html', import.meta.url).pathname, 'utf8');
const js = fs.readFileSync(new URL('../js/script.js', import.meta.url).pathname, 'utf8');

function boot(url, opts = {}) {
  const dom = new JSDOM(html, { url, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {};
  const calls = [];
  w.fetch = (u, o) => {
    calls.push({ url: u, mode: o.mode, ct: o.headers['Content-Type'], body: o.body, keepalive: o.keepalive, credentials: o.credentials });
    if (opts.sheetFail && String(u).includes('script.google.com')) return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('{"status":"error","message":"boom"}') });
    if (opts.sheetOk !== false && String(u).includes('script.google.com')) return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('{"status":"ok"}') });
    if (opts.crmFail) return Promise.reject(new Error('network down'));
    return Promise.resolve({ ok: true, status: 200, type: 'opaque', text: () => Promise.resolve('') });
  };
  if (opts.config) w.COMPARATEURPRO_CONFIG = opts.config;
  w.eval(opts.js || js);
  return { w, doc: w.document, calls };
}
const wait = (ms = 80) => new Promise(r => setTimeout(r, ms));

/* ============ 1. LEAD FORM (nocors) ============ */
{
  const { w, doc, calls } = boot('https://www.comparateurpro.fr/assurance-tns/?ltm_source=google&ltm_category=tns&ltm_user=42&utm_medium=cpc&gclid=CLI-99');
  const $ = s => doc.querySelector(s);
  console.log('--- 1. LEAD-FORM ---');
  console.log('config          :', JSON.stringify(w.comparateurproLead.config));
  $('input[name="statut"][value="dirigeant"]').checked = true;
  $('input[name="besoins"][value="mutuelle"]').checked = true;
  $('input[name="besoins"][value="retraite"]').checked = true;
  $('input[name="besoins"][value="rcpro"]').checked = true;
  $('#prenom').value = '  Elvin '; $('#nom').value = ' Manaja ';
  $('#email').value = ' Elvin@Exemple.FR '; $('#telephone').value = '06 12 34 56 78';
  $('#consent').checked = true;
  $('#btn-next').dispatchEvent(new w.Event('click', { bubbles: true }));
  $('#btn-next').dispatchEvent(new w.Event('click', { bubbles: true }));
  $('#lead-form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await wait();

  const crm = calls.find(c => c.url.includes('get_information.php'));
  const sheet = calls.find(c => c.url.includes('script.google.com'));
  console.log('destinations    :', calls.map(c => c.url.includes('get_information') ? 'CRM' : 'Sheet').join(' + '));
  console.log('CRM mode        :', crm.mode, '| Content-Type:', crm.ct, '| keepalive:', crm.keepalive, '| credentials:', crm.credentials);
  const env = JSON.parse(crm.body);
  console.log('enveloppe       :', Object.keys(env), '→ payload:', Object.keys(env.payload));
  console.log('formId          :', env.payload.formId, '| id:', /^[0-9a-f-]{36}$/.test(env.payload.id) ? 'UUID v4 ok' : env.payload.id);
  console.log('crmData         :', JSON.stringify(env.payload.data, null, 1));
  console.log('Sheet body      :', JSON.stringify(Object.fromEntries(new URLSearchParams(sheet.body)), null, 1));
  console.log('succès affiché  :', $('#form-success').hidden === false);
  console.log('generate_lead   :', JSON.stringify(w.dataLayer.filter(e => e.event === 'generate_lead')));
}

/* ============ 2. CONTACT FORM ============ */
{
  const { w, doc, calls } = boot('https://www.comparateurpro.fr/assurance-tns/mutuelle-tns/?utm_source=fb&utm_campaign=mut2026&msclkid=MS-1');
  const $ = s => doc.querySelector(s);
  console.log('\n--- 2. CONTACT-FORM ---');
  $('#contact-nom').value = 'Elvin Manaja'; $('#contact-email').value = 'CONTACT@Exemple.fr';
  $('#contact-telephone').value = '+261 34 00 000 00'; $('#contact-sujet').value = 'partenariat';
  $('#contact-message').value = 'Bonjour,   je souhaite un partenariat.'; $('#contact-consent').checked = true;
  $('#contact-form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  await wait();
  const crm = calls.find(c => c.url.includes('get_information.php'));
  const env = JSON.parse(crm.body);
  console.log('formId          :', env.payload.formId);
  console.log('crmData         :', JSON.stringify(env.payload.data, null, 1));
  console.log('succès affiché  :', $('#contact-form-success').hidden === false);
}

/* ============ 3. CAS LIMITES ============ */
function fillLead(doc, w) {
  const $ = s => doc.querySelector(s);
  $('input[name="statut"][value="independant"]').checked = true;
  $('input[name="besoins"][value="mutuelle"]').checked = true;
  $('#prenom').value = 'A'; $('#nom').value = 'B'; $('#email').value = 'a@b.fr';
  $('#telephone').value = '0612345678'; $('#consent').checked = true;
  $('#btn-next').dispatchEvent(new w.Event('click', { bubbles: true }));
  $('#btn-next').dispatchEvent(new w.Event('click', { bubbles: true }));
}
const submitLead = (doc, w) => doc.querySelector('#lead-form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));

/* 3a. Honeypot */
{
  const { w, doc, calls } = boot('https://www.comparateurpro.fr/assurance-tns/');
  console.log('\n--- 3a. HONEYPOT ---');
  console.log('honeypot injecté (HTML intact) :', !!doc.querySelector('#lead-form input[name="website"]'));
  fillLead(doc, w);
  doc.querySelector('#lead-form input[name="website"]').value = 'http://spam.example';
  submitLead(doc, w);
  await wait();
  console.log('appels réseau                  :', calls.length, '(0 attendu)');
  console.log('succès affiché (leurre)        :', doc.querySelector('#form-success').hidden === false);
}

/* 3b. Double soumission */
{
  const { w, doc, calls } = boot('https://www.comparateurpro.fr/assurance-tns/');
  console.log('\n--- 3b. ANTI-DOUBLE-ENVOI ---');
  fillLead(doc, w);
  submitLead(doc, w); submitLead(doc, w); submitLead(doc, w);
  await wait();
  console.log('soumissions CRM                :', calls.filter(c => c.url.includes('get_information')).length, '(1 attendu)');
}

/* 3c. Les deux destinations tombent */
{
  const { w, doc, calls } = boot('https://www.comparateurpro.fr/assurance-tns/', { crmFail: true, sheetOk: false, sheetFail: true });
  console.log('\n--- 3c. PANNE TOTALE (CRM + Sheet) ---');
  fillLead(doc, w);
  submitLead(doc, w);
  await wait(200);
  console.log('message erreur                 :', JSON.stringify(doc.querySelector('#form-error').textContent));
  console.log('succès masqué                  :', doc.querySelector('#form-success').hidden === true);
  console.log('bouton réactivé                :', doc.querySelector('#btn-submit').disabled === false, '| libellé:', JSON.stringify(doc.querySelector('#btn-submit').textContent));
  console.log('crm_error                      :', JSON.stringify(w.dataLayer.filter(e => e.event === 'crm_error')));
}

/* 3d. Sheet KO mais CRM OK → succès quand même (1 canal suffit) */
{
  const { w, doc, calls } = boot('https://www.comparateurpro.fr/assurance-tns/', { sheetFail: true });
  console.log('\n--- 3d. SHEET KO / CRM OK ---');
  fillLead(doc, w);
  submitLead(doc, w);
  await wait(200);
  console.log('succès affiché                 :', doc.querySelector('#form-success').hidden === false);
  console.log('résultats                      :', JSON.stringify(w.comparateurproLead.last().map(r => r.target + ':' + r.state)));
}

/* 3e. Surcharge par site (window.COMPARATEURPRO_CONFIG) + destinations éteintes */
{
  const { w, doc, calls } = boot('https://www.comparateurpro.fr/assurance-tns/', {
    config: { leadApiMode: 'off', googleScriptUrl: '',
              formIds: { lead: 'SITE_B_ETUDE', contact: 'SITE_B_CONTACT' } }
  });
  console.log('\n--- 3e. CONFIG PAR SITE (window.COMPARATEURPRO_CONFIG) ---');
  console.log('mode CRM                       :', w.comparateurproLead.config.leadApiMode);
  console.log('Sheet désactivé                :', w.comparateurproLead.config.googleScriptUrl === '');
  console.log('formIds du site B              :', JSON.stringify(w.comparateurproLead.config.formIds));
  fillLead(doc, w);
  submitLead(doc, w);
  await wait(200);
  console.log('appels réseau                  :', calls.length, '(0 attendu)');
  console.log('succès affiché (simulé)        :', doc.querySelector('#form-success').hidden === false);
  console.log('résultats                      :', JSON.stringify(w.comparateurproLead.last().map(r => r.target + ':' + r.state)));
  console.log('form_success                   :', JSON.stringify(w.dataLayer.filter(e => e.event === 'form_success')));
}

/* 3e2. Un 2e site, mêmes endpoints, formId différent → même CRM, leads distingués */
{
  const { w, doc, calls } = boot('https://www.autre-site.fr/tns/?ltm_source=site_b', {
    config: { formIds: { lead: 'ADW_LP_AUTRESITE_ETUDE', contact: 'ADW_LP_AUTRESITE_CONTACT' } }
  });
  console.log('\n--- 3e2. 2e SITE → MÊME CRM ---');
  fillLead(doc, w);
  submitLead(doc, w);
  await wait();
  const env = JSON.parse(calls.find(c => c.url.includes('get_information.php')).body);
  console.log('endpoint CRM identique         :', calls.find(c => c.url.includes('get_information.php')).url === w.comparateurproLead.config.leadApiUrl);
  console.log('formId du site B               :', env.payload.formId);
  console.log('source du site B               :', env.payload.data.source);
}

/* 3f. Mémoire du tracking d'une page à l'autre (sessionStorage) */
{
  console.log('\n--- 3f. TRACKING PERSISTANT ENTRE PAGES ---');
  const a = boot('https://www.comparateurpro.fr/assurance-tns/rc-pro/?ltm_source=bing&ltm_category=rcpro&ltm_user=7');
  const storage = a.w.sessionStorage;
  const b = new JSDOM(html, { url: 'https://www.comparateurpro.fr/assurance-tns/', runScripts: 'outside-only', pretendToBeVisual: true });
  b.window.scrollTo = () => {}; b.window.Element.prototype.scrollIntoView = () => {};
  Object.keys({ comparateurpro_tracking_v1: 1, comparateurpro_tracking_page_url_v1: 1 }).forEach(k => b.window.sessionStorage.setItem(k, storage.getItem(k)));
  const calls = [];
  b.window.fetch = (u, o) => { calls.push({ url: u, body: o.body }); return String(u).includes('script.google.com') ? Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('{"status":"ok"}') }) : Promise.resolve({ ok: true, status: 200, type: 'opaque', text: () => Promise.resolve('') }); };
  b.window.eval(js);
  console.log('page 2 sans paramètre, tracking:', JSON.stringify(b.window.comparateurproLead.tracking().ltm_source), JSON.stringify(b.window.comparateurproLead.tracking().categorie));
  console.log('page_url mémorisée             :', b.window.comparateurproLead.preview().lead.sheet.site !== undefined ? '(ok, preview dispo)' : 'ko');
}

/* 3g. preview() */
{
  const { w, doc } = boot('https://www.comparateurpro.fr/assurance-tns/?utm_source=preview');
  console.log('\n--- 3g. DIAGNOSTIC preview() ---');
  const pv = w.comparateurproLead.preview();
  console.log('clés                           :', Object.keys(pv).join(', '));
  console.log('lead.formId                    :', pv.lead.formId, '| contact.formId:', pv.contact.formId);
  console.log('colonnes Sheet (lead)          :', Object.keys(pv.lead.sheet).length, '| champs CRM (lead):', Object.keys(pv.lead.crm).length);
}
