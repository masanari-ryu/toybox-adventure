import * as T from 'three';

type Finish = 'metal' | 'rubber' | 'cork' | 'ivory';
const finishes = new Map<Finish,T.CanvasTexture>();
const items = new Map<string,T.CanvasTexture>();

function texture(canvas:HTMLCanvasElement){
 const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;
 t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t;
}
function surface(size=256){const canvas=document.createElement('canvas');canvas.width=canvas.height=size;return {canvas,c:canvas.getContext('2d')!};}
function grain(c:CanvasRenderingContext2D,amount:number){for(let n=0;n<amount;n++){c.fillStyle=n%3?'#ffffff19':'#27344820';c.fillRect(n*137%256,n*73%256,1+n%2,1);}}
export function finishTexture(kind:Finish){
 const cached=finishes.get(kind);if(cached)return cached;
 const {canvas,c}=surface();c.fillStyle=kind==='cork'?'#e2cba9':'#f5f6eb';c.fillRect(0,0,256,256);grain(c,2600);
 if(kind==='metal'){
  for(let y=0;y<256;y+=32){c.fillStyle='#56637a50';c.fillRect(0,y,256,2);c.fillStyle='#ffffff';c.fillRect(0,y+2,256,1);}
  for(let x=16;x<256;x+=64)for(let y=16;y<256;y+=64){c.fillStyle='#62748b';c.beginPath();c.arc(x,y,4,0,7);c.fill();c.fillStyle='#fcffff';c.fillRect(x-2,y-2,3,2);}
 }else if(kind==='rubber'){
  c.strokeStyle='#73879e55';c.lineWidth=2;for(let x=0;x<256;x+=16){c.beginPath();c.moveTo(x,0);c.lineTo(x,256);c.stroke();}
 }else if(kind==='cork'){
  for(let n=0;n<500;n++){c.fillStyle=n%2?'#76543555':'#fff2cf66';c.fillRect(n*37%256,n*91%256,2+n%4,2+n%3);}
 }else{c.strokeStyle='#b5b5a630';for(let n=0;n<24;n++){c.beginPath();c.moveTo(n*11,0);c.lineTo(n*11+12,256);c.stroke();}}
 const t=texture(canvas);finishes.set(kind,t);return t;
}
function heart(c:CanvasRenderingContext2D,x:number,y:number){c.beginPath();c.moveTo(x,y+20);c.bezierCurveTo(x-55,y-12,x-36,y-48,x,y-26);c.bezierCurveTo(x+36,y-48,x+55,y-12,x,y+20);c.fill();}
function star(c:CanvasRenderingContext2D,x:number,y:number,r:number){c.beginPath();for(let n=0;n<10;n++){const a=n*Math.PI/5-Math.PI/2,rad=n%2?r*.45:r;const px=x+Math.cos(a)*rad,py=y+Math.sin(a)*rad;n?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.fill();}
export function itemTexture(kind:string){
 const key=kind.includes('POTION')?'potion':kind==='ANTIDOTE'?'leaf':kind==='CANDY'?'candy':kind==='LAVA CHARM'?'flame':kind==='ARMOR CELL'||kind==='SHIELD'?'shield':kind==='RAINBOW'||kind==='MEGA STAR'?'rainbow':kind.includes('MODULE')||kind.includes('UPGRADE')||kind==='AMMO CELL'?'circuit':'star';
 const cached=items.get(key);if(cached)return cached;
 const {canvas,c}=surface();c.fillStyle='#f2faf7';c.fillRect(0,0,256,256);grain(c,1800);
 if(key==='potion'||key==='leaf'){
  c.fillStyle=key==='leaf'?'#83cda2':'#ef9fbb';c.fillRect(0,0,256,256);c.fillStyle='#fff9d9';c.fillRect(0,76,256,116);c.fillStyle='#c6a769';c.fillRect(0,76,256,5);c.fillRect(0,187,256,5);
  c.fillStyle=key==='potion'?'#db497c':'#4c9d58';
  for(const x of [64,192]){c.fillStyle=key==='potion'?'#db497c':'#4c9d58';if(key==='potion')heart(c,x,145);else{c.beginPath();c.ellipse(x,133,24,43,.5,0,7);c.fill();c.strokeStyle='#eaffcc';c.lineWidth=4;c.beginPath();c.moveTo(x-18,165);c.lineTo(x+19,103);c.stroke();}}
  c.fillStyle='#ffffffa0';c.fillRect(16,6,9,64);c.fillRect(219,6,4,64);
 }else if(key==='candy'){
  c.strokeStyle='#d389ac';c.lineWidth=20;for(let x=-256;x<512;x+=64){c.beginPath();c.moveTo(x,0);c.lineTo(x+256,256);c.stroke();}c.strokeStyle='#fff2b4';c.lineWidth=5;for(let x=-256;x<512;x+=64){c.beginPath();c.moveTo(x+16,0);c.lineTo(x+272,256);c.stroke();}
 }else if(key==='circuit'||key==='shield'){
  c.fillStyle='#e6f0ee';c.fillRect(0,0,256,256);c.strokeStyle='#4c789a';c.lineWidth=5;c.strokeRect(12,12,232,232);c.strokeStyle='#91b4be';c.lineWidth=3;for(let n=0;n<4;n++){c.beginPath();c.moveTo(0,32+n*64);c.lineTo(48,32+n*64);c.lineTo(80,64+n*32);c.stroke();c.beginPath();c.moveTo(256,32+n*64);c.lineTo(208,32+n*64);c.lineTo(176,64+n*32);c.stroke();}
  c.fillStyle='#f2cc66';if(key==='shield'){c.beginPath();c.moveTo(128,64);c.lineTo(173,88);c.lineTo(168,143);c.quadraticCurveTo(155,168,128,188);c.quadraticCurveTo(100,168,88,143);c.lineTo(83,88);c.closePath();c.fill();}else star(c,128,128,45);
  for(const x of [26,230])for(const y of [26,230]){c.fillStyle='#748a93';c.beginPath();c.arc(x,y,5,0,7);c.fill();}
 }else{
  if(key==='rainbow'){for(let n=0;n<7;n++){c.fillStyle=['#ffb2bf','#ffd2a9','#fff1a7','#b8edd0','#b1e7f4','#bbc6f5','#e7c2f5'][n];c.fillRect(n*37,0,37,256);}}
  c.fillStyle=key==='flame'?'#e89a62':'#c6a251';for(let y=32;y<256;y+=64)for(let x=32;x<256;x+=64){if(key==='flame'){c.beginPath();c.moveTo(x,y-23);c.bezierCurveTo(x+38,y+18,x+7,y+32,x,y+23);c.bezierCurveTo(x-30,y+23,x-18,y,x,y-23);c.fill();}else star(c,x,y,13);}
 }
 const t=texture(canvas);items.set(key,t);return t;
}
export function applyItemTextures(group:T.Group,kind:string){
 const body=group.children[0] as T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;
 body.material.map=itemTexture(kind);body.material.bumpMap=body.material.map;body.material.bumpScale=.012;body.material.roughness=kind.includes('POTION')||kind==='ANTIDOTE'?.23:.38;
 if(kind.includes('POTION')||kind==='ANTIDOTE')body.material.color.setHex(0xffffff);
 for(const o of group.children.slice(1)){if(o instanceof T.Mesh&&o.material instanceof T.MeshStandardMaterial&&(o.material.emissive.getHex()===0||o.material.emissiveIntensity<1)){o.material.map=finishTexture('cork');o.material.bumpMap=o.material.map;o.material.bumpScale=.015;}}
}
