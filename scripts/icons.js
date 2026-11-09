// Renders the app icons in icons/. Run when the design changes: node scripts/icons.js
// The glyph (pole and pennant) sits inside the central 80% so the maskable icon survives any mask shape.
const fs=require('fs');const {Resvg}=require('@resvg/resvg-js');
const glyph='<rect x="150" y="96" width="34" height="320" rx="10" fill="#fff"/><path d="M184 110h190l-44 70 44 70H184z" fill="#fff"/>';
const rounded=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#1F3F8F"/>${glyph}</svg>`;
const square=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#1F3F8F"/>${glyph}</svg>`;
fs.mkdirSync('icons',{recursive:true});
const png=(svg,size,file)=>fs.writeFileSync('icons/'+file,new Resvg(svg,{fitTo:{mode:'width',value:size}}).render().asPng());
png(rounded,192,'icon-192.png');
png(rounded,512,'icon-512.png');
png(square,512,'icon-maskable-512.png');
png(square,180,'apple-touch-icon.png'); // iOS rounds the corners itself
fs.writeFileSync('icons/icon.svg',rounded);
console.log('icons written');
