// Robot Librejo : liste des Cerfa en vigueur, tirée des données ouvertes de Service-Public (DILA, licence ouverte 2.0).
// Source : archive zip des fiches « vos droits » (format 3.5), une fiche R….xml par ressource.
// Produit cerfa.json : { maj, source, n, cerfa: { "16029": { numero:"16029*01", titre, page, url } } }
// (url = lien direct vers le PDF quand la fiche en donne un ; sinon, la page officielle suffit)
// Usage : node maj-cerfa.mjs            (télécharge la source officielle)
//         node maj-cerfa.mjs fichier.xml (lit un fichier local, pour tester)
import fs from 'node:fs';
const SOURCE='https://www.data.gouv.fr/api/1/datasets/r/0ed10f28-d197-4324-97b3-037f625095ac'; // XML « Particuliers », mis à jour chaque jour
const MIN=50; // en dessous, on considère que la lecture a échoué : on ne publie rien
const local=process.argv[2];
import {execFileSync} from 'node:child_process';
import os from 'node:os'; import path from 'node:path';
// La source est une archive zip de fiches XML (une par ressource : R12345.xml…). On lit les fiches « R » (formulaires, services en ligne).
let files=[];
if(local&&local.endsWith('.xml')) files=[{name:path.basename(local),xml:fs.readFileSync(local,'utf8')}];
else{ let zip=local;
  if(!zip){ const r=await fetch(SOURCE); const buf=Buffer.from(await r.arrayBuffer()); console.log('Source :',r.status,r.url,'|',buf.length,'octets');
    zip=path.join(os.tmpdir(),'vosdroits.zip'); fs.writeFileSync(zip,buf); }
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vdd-')); execFileSync('unzip',['-q','-o',zip,'-d',dir]);
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
  files=walk(dir).filter(f=>/(^|\/)R\d+\.xml$/.test(f)).map(f=>({name:path.basename(f),xml:fs.readFileSync(f,'utf8')}));
  console.log('Fiches R lues :',files.length); }
const xml=files.map(f=>f.xml).join('\n');
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].map(m=>[m[1].toLowerCase(),m[2]]));
const dec=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&apos;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
const NUM=/\b(\d{5})\s*\*\s*(\d{2})\b/;
const out={};
const add=(numero,titre,page,url)=>{ const n=String(numero||'').match(NUM); if(!n) return; const base=n[1], v=+n[2], cur=out[base];
  if(!cur||v>cur.v||(v===cur.v&&!cur.titre&&titre)) out[base]={numero:`${base}*${n[2]}`,v,titre:titre||(cur&&cur.titre)||'',page:page||(cur&&cur.page)||'',url:url||(cur&&cur.url)||''}; };
// Format 3.5 : une fiche par ressource, <ServiceComplementaire ID="R…" type="Formulaire" spUrl="…"><dc:title>…</dc:title>…<NumeroCerfa>13974*02</NumeroCerfa>
for(const f of files){ const root=(f.xml.match(/<ServiceComplementaire\b([^>]*)>/)||[])[1]; if(!root) continue; const a=attrs(root);
  if(!/formulaire/i.test(a.type||'')) continue;
  const num=(f.xml.match(/<NumeroCerfa>([^<]*)<\/NumeroCerfa>/)||[])[1]; if(!num) continue;
  const titre=dec((f.xml.match(/<dc:title>([\s\S]*?)<\/dc:title>/)||[])[1]);
  const urls=[...f.xml.matchAll(/\bURL="([^"]+)"/g)].map(m=>m[1].replace(/&amp;/g,'&')), pdf=urls.find(u=>/\.pdf(\?|$)/i.test(u))||'';
  add(num,titre,a.spurl||(a.id?`https://www.service-public.gouv.fr/particuliers/vosdroits/${a.id}`:''),pdf); }
// Ancien format (fichier unique avec des <ServiceEnLigne … numerocerfa="…">), gardé pour les tests
if(!Object.keys(out).length) for(const m of xml.matchAll(/<ServiceEnLigne\b([^>]*?)(?:\/>|>([\s\S]*?)<\/ServiceEnLigne>)/g)){
  const a=attrs(m[1]), body=m[2]||''; if(a.type&&!/formulaire/i.test(a.type)) continue;
  const raw=a.numerocerfa||((a.commentairelien||'').match(NUM)||[])[0]||((body.replace(/<NoticeLiee[\s\S]*?(<\/NoticeLiee>|\/>)/g,'').match(NUM))||[])[0];
  const id=a.id||''; add(raw,dec((body.match(/<Titre>([\s\S]*?)<\/Titre>/)||[])[1]||a.titre||''),/^R\d+$/.test(id)?`https://www.service-public.gouv.fr/particuliers/vosdroits/${id}`:'',a.url||''); }
const keys=Object.keys(out).sort();
if(keys.length<MIN){ console.error(`Seulement ${keys.length} Cerfa trouvés : lecture suspecte, cerfa.json n'est pas modifié.`); process.exit(1); }
const cerfa=Object.fromEntries(keys.map(k=>{ const {v,...r}=out[k]; return [k,r]; }));
const json={maj:new Date().toISOString().slice(0,10),source:'Service-Public.gouv.fr / DILA, données ouvertes (licence ouverte 2.0) : '+SOURCE,n:keys.length,cerfa};
const old=fs.existsSync('cerfa.json')?JSON.parse(fs.readFileSync('cerfa.json','utf8')):null;
if(old&&JSON.stringify(old.cerfa)===JSON.stringify(cerfa)){ console.log(`Aucun changement (${keys.length} Cerfa).`); process.exit(0); }
fs.writeFileSync('cerfa.json',JSON.stringify(json,null,1)+'\n');
console.log(`cerfa.json : ${keys.length} Cerfa.`);
