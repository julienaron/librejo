/* Librejo – prototype nº 1
   But : vérifier que l'application s'installe, écrit un réglage dans un dossier choisi,
   et retrouve ce dossier à l'ouverture suivante. Aucune donnée n'est envoyée. */
'use strict';
const $ = s => document.querySelector(s);
const FICHIER = 'librejo-test.json';
const FSA = 'showDirectoryPicker' in window;
const INSTALLEE = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
let dossier = null;          // FileSystemDirectoryHandle
let donnees = null;          // contenu de librejo-test.json
let etatOuverture = 'aucun dossier';
let ouvertureNotee = false;
let swEtat = 'non vérifié';

/* ---------- petite base locale : on n'y garde que la poignée du dossier ---------- */
function base() {
  return new Promise((ok, ko) => {
    const r = indexedDB.open('librejo-proto', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
}
async function lire(cle) {
  const db = await base();
  return new Promise((ok, ko) => {
    const r = db.transaction('kv').objectStore('kv').get(cle);
    r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error);
  });
}
async function ecrire(cle, v) {
  const db = await base();
  return new Promise((ok, ko) => {
    const t = db.transaction('kv', 'readwrite');
    v === undefined ? t.objectStore('kv').delete(cle) : t.objectStore('kv').put(v, cle);
    t.oncomplete = () => ok(); t.onerror = () => ko(t.error);
  });
}

/* ---------- identité du poste (pour distinguer les postes dans le journal) ---------- */
function poste() {
  let p = null;
  try { p = localStorage.getItem('librejo-poste'); } catch (e) {}
  if (!p) {
    p = 'poste-' + Math.random().toString(36).slice(2, 6);
    try { localStorage.setItem('librejo-poste', p); } catch (e) {}
  }
  return p;
}
function navigateur() {
  const u = navigator.userAgent;
  const m = u.match(/Edg\/(\d+)/) || u.match(/OPR\/(\d+)/) || u.match(/Firefox\/(\d+)/) || u.match(/Chrome\/(\d+)/) || u.match(/Version\/(\d+).*Safari/);
  const nom = /Edg\//.test(u) ? 'Edge' : /OPR\//.test(u) ? 'Opera' : /Firefox\//.test(u) ? 'Firefox' : /Chrome\//.test(u) ? 'Chrome' : /Safari\//.test(u) ? 'Safari' : 'Navigateur inconnu';
  return nom + (m ? ' ' + m[1] : '');
}
const maintenant = () => new Date().toLocaleString('fr-FR', {dateStyle: 'short', timeStyle: 'short'});

/* ---------- 1. diagnostic ---------- */
function diagnostic() {
  const lignes = [
    [true, 'Navigateur : ' + navigateur()],
    [FSA, FSA ? 'Accès aux dossiers : disponible' : 'Accès aux dossiers : indisponible sur ce navigateur (utilisez Edge ou Chrome sur ordinateur)'],
    [INSTALLEE, INSTALLEE ? 'Mode : application installée' : 'Mode : onglet du navigateur'],
    [location.protocol === 'https:' || location.hostname === 'localhost', 'Adresse : ' + location.origin + location.pathname],
    [swEtat === 'prêt', 'Fonctionnement hors ligne : ' + swEtat],
    [navigator.onLine, navigator.onLine ? 'Connexion : en ligne' : 'Connexion : hors ligne (l\'application s\'est ouverte quand même)'],
    [true, 'Identifiant de ce poste : ' + poste()]
  ];
  $('#diag').innerHTML = lignes.map(([ok, t]) =>
    `<li><span class="etat" aria-hidden="true">${ok ? '✅' : '⚠️'}</span><span>${t}</span></li>`).join('');
}

/* ---------- 2. installation ---------- */
let invite = null;
function installation() {
  const t = $('#installTexte'), b = $('#btnInstaller');
  if (INSTALLEE) { t.textContent = 'L\'application est installée et ouverte dans sa propre fenêtre.'; b.hidden = true; return; }
  if (invite) { t.textContent = 'Ce navigateur propose l\'installation.'; b.hidden = false; return; }
  b.hidden = true;
  t.textContent = 'Si aucun bouton n\'apparaît : dans Edge, menu « … » puis Applications puis « Installer ce site en tant qu\'application ». Dans Chrome, menu « ⋮ » puis « Caster, enregistrer et partager » puis « Installer la page en tant qu\'application ». L\'application est peut-être déjà installée.';
}
addEventListener('beforeinstallprompt', e => { e.preventDefault(); invite = e; installation(); });
addEventListener('appinstalled', () => { invite = null; $('#installTexte').textContent = 'Installation réussie. Ouvrez Librejo depuis le bureau ou le menu Démarrer, puis refaites le test du dossier.'; $('#btnInstaller').hidden = true; });
$('#btnInstaller').addEventListener('click', async () => { if (!invite) return; invite.prompt(); await invite.userChoice; invite = null; installation(); });

/* ---------- 3. dossier ---------- */
function message(sel, classe, texte) {
  $(sel).innerHTML = texte ? `<div class="resultat ${classe}">${texte}</div>` : '';
}
async function lireFichier() {
  try {
    const f = await (await dossier.getFileHandle(FICHIER)).getFile();
    const d = JSON.parse(await f.text());
    if (!Array.isArray(d.ouvertures)) d.ouvertures = [];
    return d;
  } catch (e) {
    if (e.name === 'NotFoundError' || e instanceof SyntaxError) return {outil: 'Librejo prototype 1', structure: '', ouvertures: []};
    throw e;
  }
}
async function ecrireFichier() {
  const h = await dossier.getFileHandle(FICHIER, {create: true});
  const w = await h.createWritable();
  await w.write(JSON.stringify(donnees, null, 1));
  await w.close();
}
async function ouvrirDossier() {
  donnees = await lireFichier();
  if (!ouvertureNotee) {
    donnees.ouvertures.push({date: new Date().toISOString(), poste: poste(), navigateur: navigateur(),
      mode: INSTALLEE ? 'installée' : 'onglet', autorisation: etatOuverture});
    if (donnees.ouvertures.length > 200) donnees.ouvertures = donnees.ouvertures.slice(-200);
    ouvertureNotee = true;
    await ecrireFichier();
  }
  $('#nom').value = donnees.structure || '';
  $('#blocReglage').hidden = false; $('#blocJournal').hidden = false;
  $('#btnReautoriser').hidden = true; $('#btnOublier').hidden = false;
  message('#reglageEtat', donnees.structure ? 'ok' : '', donnees.structure ? 'Réglage relu dans le dossier : « ' + echap(donnees.structure) + ' »' : '');
  journal();
}
const echap = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
function erreurDossier(e) {
  if (e.name === 'AbortError') return;
  const aide = e.name === 'NotAllowedError' ? ' Le navigateur ou le service informatique refuse l\'accès à ce dossier.'
    : e.name === 'NotFoundError' ? ' Le dossier est introuvable (lecteur réseau déconnecté ?).' : '';
  message('#dossierEtat', 'erreur', 'Échec : ' + echap(e.name) + '.' + aide);
}
$('#btnChoisir').addEventListener('click', async () => {
  try {
    dossier = await showDirectoryPicker({id: 'librejo', mode: 'readwrite'});
    await ecrire('dossier', dossier);
    etatOuverture = 'choisi à la main';
    ouvertureNotee = false;
    await ouvrirDossier();
    message('#dossierEtat', 'ok', 'Dossier « ' + echap(dossier.name) + ' » ouvert. Fermez puis rouvrez l\'application pour voir s\'il est retrouvé.');
  } catch (e) { erreurDossier(e); }
});
$('#btnReautoriser').addEventListener('click', async () => {
  try {
    const p = await dossier.requestPermission({mode: 'readwrite'});
    if (p !== 'granted') { message('#dossierEtat', 'erreur', 'Autorisation refusée.'); return; }
    etatOuverture = 'redemandée (un clic)';
    await ouvrirDossier();
    message('#dossierEtat', 'attention', 'Dossier « ' + echap(dossier.name) + ' » rouvert après un clic. Si le navigateur a proposé « Autoriser à chaque visite », choisissez-le : la prochaine ouverture devrait être automatique.');
  } catch (e) { erreurDossier(e); }
});
$('#btnOublier').addEventListener('click', async () => {
  await ecrire('dossier', undefined);
  dossier = null; donnees = null; ouvertureNotee = false;
  $('#blocReglage').hidden = true; $('#blocJournal').hidden = true; $('#btnOublier').hidden = true; $('#btnReautoriser').hidden = true;
  message('#dossierEtat', '', '');
});
async function retrouverDossier() {
  if (!FSA) {
    $('#btnChoisir').disabled = true;
    message('#dossierEtat', 'attention', 'Ce navigateur ne permet pas d\'ouvrir un dossier. Dans la vraie application, Librejo passerait en mode « formulaires seulement ».');
    return;
  }
  try { dossier = await lire('dossier'); } catch (e) { dossier = null; }
  if (!dossier) return;
  let p;
  try { p = await dossier.queryPermission({mode: 'readwrite'}); } catch (e) { p = 'erreur'; }
  if (p === 'granted') {
    etatOuverture = 'conservée';
    try {
      await ouvrirDossier();
      message('#dossierEtat', 'ok', 'Dossier « ' + echap(dossier.name) + ' » retrouvé tout seul : l\'autorisation a été conservée.');
    } catch (e) { erreurDossier(e); $('#btnReautoriser').hidden = false; $('#btnOublier').hidden = false; }
  } else {
    $('#btnReautoriser').hidden = false; $('#btnOublier').hidden = false;
    message('#dossierEtat', 'attention', 'Dossier « ' + echap(dossier.name) + ' » mémorisé, mais le navigateur redemande l\'autorisation. Cliquez sur « Réautoriser le dossier ».');
  }
}

/* ---------- 4. réglage ---------- */
$('#btnEnregistrer').addEventListener('click', async () => {
  try {
    donnees.structure = $('#nom').value.trim();
    donnees.modifie = new Date().toISOString();
    await ecrireFichier();
    const relu = await lireFichier();
    message('#reglageEtat', relu.structure === donnees.structure ? 'ok' : 'erreur',
      relu.structure === donnees.structure ? 'Enregistré puis relu dans le dossier à ' + maintenant() + '.' : 'Le fichier relu ne correspond pas à ce qui a été écrit.');
  } catch (e) { message('#reglageEtat', 'erreur', 'Écriture impossible : ' + echap(e.name) + '.'); }
});

/* ---------- 5. journal ---------- */
function journal() {
  const l = (donnees.ouvertures || []).slice().reverse();
  $('#journal').innerHTML = l.map(o => `<tr><td>${echap(new Date(o.date).toLocaleString('fr-FR', {dateStyle: 'short', timeStyle: 'short'}))}</td><td>${echap(o.poste)}<br><span class="aide">${echap(o.navigateur)}</span></td><td>${echap(o.mode)}</td><td>${echap(o.autorisation)}</td></tr>`).join('');
}
$('#btnCopier').addEventListener('click', async () => {
  const lignes = ['Librejo prototype 1 – rapport du ' + maintenant(), navigateur() + ' – ' + (INSTALLEE ? 'installée' : 'onglet') + ' – ' + poste(),
    'Accès aux dossiers : ' + (FSA ? 'oui' : 'non') + ' – hors ligne : ' + swEtat, '',
    ...(donnees.ouvertures || []).map(o => [new Date(o.date).toLocaleString('fr-FR'), o.poste, o.navigateur, o.mode, o.autorisation].join(' | '))];
  try { await navigator.clipboard.writeText(lignes.join('\n')); $('#copieEtat').textContent = 'Rapport copié.'; }
  catch (e) { $('#copieEtat').textContent = 'Copie impossible : sélectionnez le tableau à la main.'; }
});

/* ---------- démarrage ---------- */
async function demarrer() {
  diagnostic(); installation();
  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('sw.js'); await navigator.serviceWorker.ready; swEtat = 'prêt'; }
    catch (e) { swEtat = 'indisponible'; }
  } else swEtat = 'indisponible sur ce navigateur';
  diagnostic();
  await retrouverDossier();
}
addEventListener('online', diagnostic); addEventListener('offline', diagnostic);
demarrer();
