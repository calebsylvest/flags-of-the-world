const fs=require('fs');const C=require('world-countries');const F=require('../build/flags.json');const {T,STYLE_LABELS,FAM,LOOK,ALT,S:S1}=require('../data/curated');const {S2,TIPS}=require('../data/curated2');const S={...S1,...S2};
const c3={};C.forEach(c=>c3[c.cca3]=c.cca2.toLowerCase());
const tags={};for(const[t,l]of Object.entries(T))l.split(' ').forEach(k=>(tags[k]=tags[k]||[]).push(t));
const fam={};for(const[key,[,, l]]of Object.entries(FAM))l.split(' ').forEach(k=>(fam[k]=fam[k]||[]).push(key));
const look={};LOOK.forEach(g=>{const a=g.split(' ');a.forEach(k=>{look[k]=[...new Set([...(look[k]||[]),...a.filter(x=>x!==k)])]})});
const enc=s=>'data:image/svg+xml,'+s.replace(/"/g,"'").replace(/%/g,'%25').replace(/#/g,'%23').replace(/</g,'%3C').replace(/>/g,'%3E').replace(/\s+/g,' ');
const out=[],svg={};
for(const c of C){const k=c.cca2.toLowerCase();const f=F[k];
 const alts=new Set([c.name.official,...c.altSpellings.filter(a=>a.length>=4)]);(ALT[k]||'').split('|').filter(Boolean).forEach(a=>alts.add(a));
 out.push({c:k,n:c.name.common,o:c.name.official,cap:c.capital||[],r:c.region,sr:c.subregion||'',lang:Object.values(c.languages||{}),cur:Object.values(c.currencies||{}).map(x=>x.name+(x.symbol?` (${x.symbol})`:'')),
 area:c.area,ll:c.landlocked,dem:(c.demonyms&&c.demonyms.eng&&c.demonyms.eng.m)||'',ind:!!c.independent,un:!!c.unMember,nb:(c.borders||[]).map(b=>c3[b]).filter(Boolean),
 ge:c.latlng||null,alts:[...alts],ratio:f.ratio,col:f.colors,tags:tags[k]||[],fam:fam[k]||[],look:look[k]||[],st:S[k]||null});
 svg[k]=enc(f.svg);}
const famOut={};for(const[k,[n,d,l]]of Object.entries(FAM))famOut[k]={n,d,m:l.split(' ')};
const {U}=require('../data/units');const units=U.map(([id,n,r,h,cmp])=>({id,n,r,m:Object.keys(h),cmp:cmp.map(([m,t])=>({m,t}))}));const hook={},unitOf={};U.forEach(([id,,,h])=>Object.entries(h).forEach(([k,v])=>{hook[k]=v;unitOf[k]=id}));out.forEach(o=>{if(hook[o.c]){o.hook=hook[o.c];o.unit=unitOf[o.c]}});
const PR=require('../data/pron');out.forEach(o=>{if(PR.P[o.c]){o.pr=PR.P[o.c];if(PR.NOTE[o.c])o.prn=PR.NOTE[o.c];if(PR.TTS[o.c])o.tts=PR.TTS[o.c]}});
const lookg=LOOK.map(g=>({m:g.split(' '),tip:TIPS[g]||''}));fs.writeFileSync('build/data.json',JSON.stringify({countries:out,styles:STYLE_LABELS,fam:famOut,lookg,units}));fs.writeFileSync('build/svg.json',JSON.stringify(svg));
console.log(out.length,fs.statSync('build/data.json').size,fs.statSync('build/svg.json').size,Object.keys(S).length);
const ind=out.filter(x=>x.ind).length;console.log('independent',ind,'untagged',out.filter(x=>!x.tags.length).map(x=>x.c));
