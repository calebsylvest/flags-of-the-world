import fs from 'fs';import {feature} from 'topojson-client';import {geoNaturalEarth1,geoPath,geoArea} from 'd3-geo';
const t=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
const C=JSON.parse(fs.readFileSync('node_modules/world-countries/countries.json'));
const by3={};C.forEach(c=>{if(c.ccn3)by3[c.ccn3]=c.cca2.toLowerCase()});
const named={'Kosovo':'xk','Somaliland':'so','N. Cyprus':'cy'};
const fc=feature(t,t.objects.countries);
const W=1000,H=520;
function build(proj,keep,choose){
const path=geoPath(proj).digits(1);
const out={};
for(const f of fc.features){const k=by3[f.id]||named[f.properties.name];if(!k||!keep(k))continue;
 const d=path(f);if(!d)continue;(out[k]=out[k]||{d:[]}).d.push(d)}
// bounds/centroid from main feature set
for(const f of fc.features){const k=by3[f.id]||named[f.properties.name];if(!k||!out[k])continue;if(out[k].b&&named[f.properties.name])continue;
 // use largest polygon for centroid/bounds to avoid overseas spread
 let best=null,ba=-1;const geoms=f.geometry.type==='MultiPolygon'?f.geometry.coordinates.map(c=>({type:'Polygon',coordinates:c})):[f.geometry];
 for(const g of geoms){const a=geoArea(g);if(a>ba){ba=a;best=g}}
 if(choose&&choose[k]){let bd=1e9;for(const g of geoms){const ll=g.coordinates[0][0];const d=Math.abs(ll[0]-choose[k][0])+Math.abs(ll[1]-choose[k][1]);if(d<bd){bd=d;best=g}}}
 const b=path.bounds(best);const c=path.centroid(best);out[k].b=b.flat().map(v=>Math.round(v*10)/10);out[k].c=c.map(v=>Math.round(v*10)/10);out[k].ab=path.area(f);}
// dots for missing
const pts={};for(const c of C){const k=c.cca2.toLowerCase();if(!keep(k))continue;if(!out[k]&&c.latlng&&c.latlng.length){const p=proj([c.latlng[1],c.latlng[0]]);pts[k]=p.map(v=>Math.round(v*10)/10)}}
const shapes={};for(const[k,v]of Object.entries(out))shapes[k]={d:v.d.join(''),b:v.b,c:v.c,tiny:v.ab<6?1:0};
const sph=geoPath(proj).digits(1)({type:'Sphere'});
return {W,H,sph,shapes,pts}}
const LL={};C.forEach(c=>LL[c.cca2.toLowerCase()]=c.latlng||[0,0]);
const choose={ki:[173,1.4]};
const wp=geoNaturalEarth1().fitExtent([[4,4],[W-4,H-4]],{type:'Sphere'});
const world=build(wp,()=>true,choose);
const pp=geoNaturalEarth1().rotate([-170,0]).fitExtent([[4,4],[W-4,H-4]],{type:'Sphere'});
const pac=build(pp,k=>{const lon=LL[k][1];return lon>=85||lon<=-100},choose);
const proj=wp;
const RB={Europe:[-25,34,45,71],Africa:[-19,-36,52,38],Asia:[25,-11,150,56],Americas:[-170,-56,-30,73],Oceania:[110,-48,190,8]};
const reg={};for(const[k,[a,b,c,d]]of Object.entries(RB)){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(let i=0;i<=20;i++)for(let j=0;j<=20;j++){const p=proj([a+(c-a)*i/20,b+(d-b)*j/20]);x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}reg[k]=[x0,y0,x1,y1].map(v=>Math.round(v))}
fs.writeFileSync('build/map.json',JSON.stringify({...world,reg,pac}));
console.log(fs.statSync('build/map.json').size,Object.keys(world.shapes).length,Object.keys(pac.shapes).length,pac.shapes.ki&&pac.shapes.ki.b,pac.shapes.ws&&pac.shapes.ws.b);
