// Robot Librejo : liste des Cerfa en vigueur, tirée des données ouvertes de Service-Public (DILA, licence ouverte 2.0).
// Produit cerfa.json : { maj, source, n, cerfa: { "16029": { numero:"16029*02", titre, page, url } } }
// Usage : node maj-cerfa.mjs            (télécharge la source officielle)
//         node maj-cerfa.mjs fichier.xml (lit un fichier local, pour tester)
import fs from 'node:fs';
const SOURCE='https://www.data.gouv.fr/api/1/datasets/r/0ed10f28-d197-4324-97b3-037f625095ac'; // XML « Particuliers », mis à jour chaque jour
const MIN=50; // en dessous, on considère que la lecture a échoué : on ne publie rien
const local=process.argv[2];
let xml;
if(local) xml=fs.readFileSync(local,'utf8');
else{ const r=await fetch(SOURCE); const buf=Buffer.from(await r.arrayBuffer());
  console.log('Source :',r.status,r.url,'|',r.headers.get('content-type'),'|',buf.length,'octets | début (hex) :',buf.subarray(0,8).toString('hex'));
  xml=buf.toString('utf8'); }
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
  const sel=[...xml.matchAll(/<ServiceEnLigne\b[^>]*>/gi)].slice(0,3).map(m=>m[0]); console.log('Exemples de ServiceEnLigne :',sel.join(' || ')); }
if(keys.length<MIN){ console.error(`Seulement ${keys.length} Cerfa trouvés : lecture suspecte, cerfa.json n'est pas modifié.`); process.exit(1); }
const cerfa=Object.fromEntries(keys.map(k=>{ const {v,...r}=out[k]; return [k,r]; }));
const json={maj:new Date().toISOString().slice(0,10),source:'Service-Public.gouv.fr / DILA, données ouvertes (licence ouverte 2.0) : '+SOURCE,n:keys.length,cerfa};
const old=fs.existsSync('cerfa.json')?JSON.parse(fs.readFileSync('cerfa.json','utf8')):null;
if(old&&JSON.stringify(old.cerfa)===JSON.stringify(cerfa)){ console.log(`Aucun changement (${keys.length} Cerfa).`); process.exit(0); }
fs.writeFileSync('cerfa.json',JSON.stringify(json,null,1)+'\n');
console.log(`cerfa.json : ${keys.length} Cerfa.`);
