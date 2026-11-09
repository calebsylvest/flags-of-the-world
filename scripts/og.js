// Renders og.png, the social preview image. Run after `npm run build`: node scripts/og.js
const fs=require('fs');const {Resvg}=require('@resvg/resvg-js');
const F=require('../build/flags.json');
const W=1200,H=630;
const pick='br jp za gb ca np kr se in mx ke ch tr au bt ar'.split(' ');
const cols=4,fw=120,fh=80,gx=22,gy=26,x0=W-56-cols*fw-(cols-1)*gx,y0=(H-4*fh-3*gy)/2;
const flags=pick.map((k,i)=>{const r=Math.floor(i/cols),c=i%cols;const x=x0+c*(fw+gx),y=y0+r*(fh+gy);
  const uri='data:image/svg+xml;base64,'+Buffer.from(F[k].svg).toString('base64');
  return `<rect x="${x-1}" y="${y-1}" width="${fw+2}" height="${fh+2}" rx="3" fill="#D9DDE4"/><image x="${x}" y="${y}" width="${fw}" height="${fh}" preserveAspectRatio="xMidYMid meet" href="${uri}"/>`}).join('');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#F4F5F7"/>
<rect x="72" y="150" width="12" height="56" rx="2" fill="#171B24"/><path d="M84 150h36l-7.9 12 7.9 12H84z" fill="#1F3F8F"/>
<text x="72" y="300" font-family="Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="86" fill="#171B24">Flags of</text>
<text x="72" y="386" font-family="Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="86" fill="#171B24">the World</text>
<text x="72" y="452" font-family="Helvetica Neue, Arial, sans-serif" font-size="28" fill="#5A6373">Browse, learn and quiz yourself</text>
<text x="72" y="490" font-family="Helvetica Neue, Arial, sans-serif" font-size="28" fill="#5A6373">on every flag in the world.</text>
${flags}</svg>`;
fs.writeFileSync('og.png',new Resvg(svg,{font:{loadSystemFonts:true}}).render().asPng());console.log('og.png written');
