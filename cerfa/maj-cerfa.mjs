// Robot Librejo : liste des Cerfa en vigueur, tirée des données ouvertes de Service-Public (DILA, licence ouverte 2.0).
// Produit cerfa.json : { maj, source, n, cerfa: { "16029": { numero:"16029*02", titre, page, url } } }
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
for(const m of xml.matchAll(/<ServiceEnLigne\b([^>]*?)(?:\/>|>([\s\S]*?)<\/ServiceEnLigne>)/g)){
  const a=attrs(m[1]), body=m[2]||'';
  if(a.type&&!/formulaire/i.test(a.type)) continue;
  const raw=a.numerocerfa||((a.commentairelien||'').match(NUM)||[])[0]||((body.replace(/<NoticeLiee[\s\S]*?(<\/NoticeLiee>|\/>)/g,'').match(NUM))||[])[0];
  const n=String(raw||'').match(NUM); if(!n) continue;
  const base=n[1], v=+n[2], titre=dec((body.match(/<Titre>([\s\S]*?)<\/Titre>/)||[])[1]||a.titre||'');
  const id=a.id||a['dc:identifier']||'', page=/^R\d+$/.test(id)?`https://www.service-public.gouv.fr/particuliers/vosdroits/${id}`:'';
  const cur=out[base];
  if(!cur||v>cur.v||(v===cur.v&&!cur.titre&&titre)) out[base]={numero:`${base}*${n[2]}`,v,titre,page:page||(cur&&cur.page)||'',url:a.url||(cur&&cur.url)||''};
}
const keys=Object.keys(out).sort();
if(keys.length<MIN||process.env.DIAG){
  const tags={}; for(const m of xml.matchAll(/<([A-Za-z][\w:.-]*)/g)) tags[m[1]]=(tags[m[1]]||0)+1;
  console.log('Balises les plus fréquentes :',Object.entries(tags).sort((a,b)=>b[1]-a[1]).slice(0,40).map(([k,v])=>k+'='+v).join(' '));
  console.log('Début du fichier :',xml.slice(0,800).replace(/\s+/g,' '));
  const ex=[...xml.matchAll(/.{0,300}\d{5}\s*\*\s*\d{2}.{0,200}/g)].slice(0,4).map(m=>m[0].replace(/\s+/g,' '));
  console.log('Exemples autour d’un numéro Cerfa :\n- '+ex.join('\n- '));
  const ex2=files.filter(f=>/\d{5}\s*\*\s*\d{2}/.test(f.xml)).slice(0,2); ex2.forEach(f=>console.log('--- Fiche',f.name,':\n'+f.xml.slice(0,2500)));
  const sel=[...xml.matchAll(/<ServiceEnLigne\b[^>]*>/gi)].slice(0,3).map(m=>m[0]); console.log('Exemples de ServiceEnLigne :',sel.join(' || ')); }
if(keys.length<MIN){ console.error(`Seulement ${keys.length} Cerfa trouvés : lecture suspecte, cerfa.json n'est pas modifié.`); process.exit(1); }
const cerfa=Object.fromEntries(keys.map(k=>{ const {v,...r}=out[k]; return [k,r]; }));
const json={maj:new Date().toISOString().slice(0,10),source:'Service-Public.gouv.fr / DILA, données ouvertes (licence ouverte 2.0) : '+SOURCE,n:keys.length,cerfa};
const old=fs.existsSync('cerfa.json')?JSON.parse(fs.readFileSync('cerfa.json','utf8')):null;
if(old&&JSON.stringify(old.cerfa)===JSON.stringify(cerfa)){ console.log(`Aucun changement (${keys.length} Cerfa).`); process.exit(0); }
fs.writeFileSync('cerfa.json',JSON.stringify(json,null,1)+'\n');
console.log(`cerfa.json : ${keys.length} Cerfa.`);
