const fs=require('fs');const crypto=require('crypto');
let t=fs.readFileSync('src/template.html','utf8');
const d=fs.readFileSync('build/data.json','utf8').replace(/<\//g,'<\\/');
const s=fs.readFileSync('build/svg.json','utf8').replace(/<\//g,'<\\/');
// Map shapes are served as a separate file (map.json), loaded when a map is first shown.
// The page only gets the dimensions, region boxes and the list of countries that have a shape.
const mapRaw=fs.readFileSync('build/map.json','utf8');const map=JSON.parse(mapRaw);
fs.writeFileSync('map.json',mapRaw);
const v=crypto.createHash('sha256').update(mapRaw).digest('hex').slice(0,10);
const meta=JSON.stringify({W:map.W,H:map.H,reg:map.reg,has:[...Object.keys(map.shapes),...Object.keys(map.pts)].sort(),url:'map.json?v='+v});
t=t.replace('__MAPMETA__',()=>meta).replace('__DATA__',()=>d).replace('__SVG__',()=>s);
fs.writeFileSync('index.html',t);console.log('index.html',t.length,'map.json',mapRaw.length);
// Service worker: its version covers every file it caches, so any change to the site replaces the old cache.
const h=crypto.createHash('sha256');[t,mapRaw,fs.readFileSync('manifest.webmanifest')].forEach(x=>h.update(x));
for(const f of fs.readdirSync('icons').sort())h.update(fs.readFileSync('icons/'+f));
fs.writeFileSync('sw.js',fs.readFileSync('src/sw.js','utf8').replace('__VERSION__',h.digest('hex').slice(0,10)).replace('__MAP_URL__','map.json?v='+v));
