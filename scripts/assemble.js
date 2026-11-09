const fs=require('fs');let t=fs.readFileSync('src/template.html','utf8');
const d=fs.readFileSync('build/data.json','utf8').replace(/<\//g,'<\\/');const s=fs.readFileSync('build/svg.json','utf8').replace(/<\//g,'<\\/');
const m=fs.readFileSync('build/map.json','utf8');t=t.replace('__MAP__',()=>m).replace('__DATA__',()=>d).replace('__SVG__',()=>s);fs.writeFileSync('index.html',t);console.log(t.length);
