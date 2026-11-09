// Minimal static file server for the smoke tests: node tests/server.js [port]
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');const port=+process.argv[2]||4173;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(new URL(req.url,'http://x').pathname);if(p.endsWith('/'))p+='index.html';
  const f=path.join(root,p);
  if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return}
  fs.readFile(f,(err,data)=>{if(err){res.writeHead(404).end('not found');return}
    res.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'}).end(data)});
}).listen(port,()=>console.log('serving on '+port));
