const fs=require('fs');const {optimize}=require('svgo');const {Resvg}=require('@resvg/resvg-js');
const C=require('world-countries');
const out={};let total=0;
function hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0,l=(mx+mn)/2;const d=mx-mn;
 if(d){s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?((g-b)/d+(g<b?6:0)):mx===g?((b-r)/d+2):((r-g)/d+4);h*=60}return[h,s,l]}
function fam(r,g,b){const[h,s,l]=hsl(r,g,b);
 if(l>.88&&s<.6||(s<.12&&l>.75))return'white';if(l<.1||(l<.2&&s<.35))return'black';
 if(s<.15)return l>.5?'white':'black';
 if(h<14||h>=340)return l<.32?'maroon':'red'; // maroon->red group later
 if(h<40)return l<.35?'brown':'orange';if(h<68)return'yellow';if(h<170)return'green';if(h<255)return'blue';if(h<300)return'purple';return'red';}
for(const c of C){const k=c.cca2.toLowerCase();let svg=fs.readFileSync(`vendor/country-flags/svg/${k}.svg`,'utf8');
 const o=optimize(svg,{multipass:true,floatPrecision:2,plugins:['preset-default']}).data;
 // ratio
 let vb=o.match(/viewBox="([^"]+)"/);let w,h;if(vb){const p=vb[1].split(/[ ,]+/).map(Number);w=p[2];h=p[3]}else{w=+o.match(/width="([\d.]+)/)[1];h=+o.match(/height="([\d.]+)/)[1]}
 const img=new Resvg(o,{fitTo:{mode:'height',value:80},shapeRendering:0}).render();const px=img.pixels;const iw=img.width,ih=img.height;
 const cnt={};let n=0;const sums={};
 for(let i=0;i<iw*ih;i++){const a=px[i*4+3];if(a<200)continue;const r=px[i*4],g=px[i*4+1],b=px[i*4+2];let f=fam(r,g,b);if(f==='maroon')f='red';if(f==='brown')f='orange';cnt[f]=(cnt[f]||0)+1;n++;
  const m=sums[f]||(sums[f]={});const key=(r<<16)|(g<<8)|b;m[key]=(m[key]||0)+1}
 const colors=Object.entries(cnt).map(([f,v])=>[f,v/n]).filter(x=>x[1]>=(x[0]==='black'?0.025:0.01)).sort((a,b)=>b[1]-a[1]).map(([f,v])=>{const m=sums[f];const top=+Object.entries(m).sort((a,b)=>b[1]-a[1])[0][0];return{f,p:Math.round(v*1000)/10,hex:'#'+top.toString(16).padStart(6,'0')}});
 total+=o.length;
 out[k]={svg:o,ratio:Math.round(w/h*1000)/1000,colors};
 
}
fs.mkdirSync('build',{recursive:true});fs.writeFileSync('build/flags.json',JSON.stringify(out));console.log('svg bytes',total);
