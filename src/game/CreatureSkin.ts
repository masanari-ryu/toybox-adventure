import * as T from 'three';
import {finishTexture} from '../world/ObjectTextures';
import {setCreatureSurface, type CreatureSurface} from './CreatureSurface';
const cache=new Map<string,T.CanvasTexture>();
export function creatureSkin(kind:string){
 const existing=cache.get(kind);if(existing)return existing;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d')!;
 c.fillStyle=kind==='KING PUNI'?'#7644b1':'#dd69a5';c.fillRect(0,0,512,512);
 for(let n=0;n<6500;n++){c.fillStyle=n%3?'#ffffff28':'#454c6924';c.fillRect(n*137%512,n*53%512,1+n%3,2);}
 if(kind==='INFANTRY'){
  c.fillStyle='#4f9978';c.fillRect(0,0,512,512);c.fillStyle='#34715c';c.fillRect(0,335,512,55);c.fillRect(244,0,24,512);c.strokeStyle='#82c6a0';c.lineWidth=5;c.strokeRect(35,80,165,145);c.strokeRect(312,80,165,145);c.fillStyle='#ffd780';for(let n=0;n<5;n++){c.beginPath();c.arc(256,40+n*60,7,0,7);c.fill();}
 }else if(kind==='SAMURAI'){
  c.fillStyle='#20677d';c.fillRect(0,0,512,512);
  for(let y=0;y<512;y+=64){const shine=c.createLinearGradient(0,y,0,y+64);shine.addColorStop(0,'#59bac3');shine.addColorStop(.2,'#287b93');shine.addColorStop(1,'#174056');c.fillStyle=shine;c.fillRect(0,y,512,61);c.strokeStyle='#122e43';c.lineWidth=5;c.beginPath();c.moveTo(0,y+62);c.lineTo(512,y+62);c.stroke();for(let x=28;x<512;x+=64){c.fillStyle='#f6d18b';c.beginPath();c.arc(x,y+17,5,0,7);c.fill();c.strokeStyle='#e5ab64';c.lineWidth=3;c.beginPath();c.moveTo(x,y+28);c.lineTo(x,y+49);c.stroke();}}
  c.strokeStyle='#ffe5a0';c.lineWidth=3;for(let x=0;x<512;x+=128){c.beginPath();c.moveTo(x+64,190);c.lineTo(x+92,225);c.lineTo(x+64,260);c.lineTo(x+36,225);c.closePath();c.stroke();}
 }else if(kind==='BOTTY'){
  for(let y=0;y<512;y+=128)for(let x=0;x<512;x+=128){c.fillStyle=(x+y)%256?'#55bac2':'#2792a7';c.fillRect(x+5,y+5,118,118);c.strokeStyle='#184257';c.lineWidth=5;c.strokeRect(x+6,y+6,116,116);c.strokeStyle='#ffffff';c.lineWidth=3;c.strokeRect(x+11,y+11,106,106);
   for(const dx of [20,108])for(const dy of [20,108]){c.fillStyle='#607587';c.beginPath();c.arc(x+dx,y+dy,5,0,7);c.fill();c.fillStyle='#f3fbf9';c.fillRect(x+dx-2,y+dy-3,3,2);}c.fillStyle='#fce5a0';c.fillRect(x+32,y+51,64,17);c.fillStyle='#52707f';for(let n=0;n<4;n++)c.fillRect(x+38+n*14,y+84,7,18);}
 }else if(kind==='TOX MUNCHER'){
  for(let y=-32;y<550;y+=48)for(let x=-32;x<550;x+=64){const xx=x+(y%96?32:0),g=c.createRadialGradient(xx,y,3,xx,y,34);g.addColorStop(0,'#b6de86');g.addColorStop(.7,'#699c63');g.addColorStop(1,'#356851');c.fillStyle=g;c.beginPath();c.ellipse(xx,y,32,24,0,0,7);c.fill();c.strokeStyle='#f7ffc050';c.lineWidth=2;c.stroke();}
  c.fillStyle='#e0bded';for(let n=0;n<25;n++){c.beginPath();c.arc(n*157%512,n*239%512,7+n%3,0,7);c.fill();}
 }else if(kind==='LAVA HOPPER'){
  c.fillStyle='#503648';c.fillRect(0,0,512,512);for(let y=-64;y<576;y+=96)for(let x=-64;x<576;x+=112){const xx=x+(y%192?56:0);c.beginPath();for(let n=0;n<6;n++){const a=n*Math.PI/3,px=xx+Math.cos(a)*55,py=y+Math.sin(a)*47;n?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.fillStyle=(x+y)%3?'#744b64':'#443951';c.fill();c.strokeStyle='#ffdb8e';c.lineWidth=7;c.stroke();c.strokeStyle='#fff7c9';c.lineWidth=2;c.stroke();}
 }else if(kind==='BALLOONER'){
  for(let x=0;x<512;x+=64){c.fillStyle=x%128?'#b890de':'#806cb6';c.fillRect(x,0,64,512);c.strokeStyle='#765d9860';c.lineWidth=3;c.beginPath();c.moveTo(x,0);c.lineTo(x,512);c.stroke();c.strokeStyle='#fff2ce';c.setLineDash([7,8]);c.lineWidth=2;c.beginPath();c.moveTo(x+7,0);c.lineTo(x+7,512);c.stroke();c.setLineDash([]);}
  c.fillStyle='#fff0b4';for(let n=0;n<24;n++){const x=n*157%512,y=n*239%512;c.beginPath();c.moveTo(x,y-15);c.lineTo(x+9,y);c.lineTo(x,y+15);c.lineTo(x-9,y);c.closePath();c.fill();}
 }else{
  for(let y=0;y<512;y+=64){c.strokeStyle=kind==='KING PUNI'?'#4a277c':'#a9377b';c.lineWidth=10;c.beginPath();for(let x=0;x<=512;x+=8){const yy=y+Math.sin(x*Math.PI/128)*14;x?c.lineTo(x,yy):c.moveTo(x,yy);}c.stroke();c.strokeStyle=kind==='KING PUNI'?'#c9a1e3':'#ffb6d1';c.lineWidth=3;c.stroke();}
  for(let n=0;n<40;n++){const x=n*157%512,y=n*239%512;c.fillStyle=kind==='KING PUNI'?'#ffe2a6':'#fce4aa';c.beginPath();c.arc(x,y,kind==='KING PUNI'?12:9,0,7);c.fill();c.fillStyle='#ffffffa0';c.beginPath();c.arc(x-3,y-3,3,0,7);c.fill();}
  if(kind==='KING PUNI'){c.strokeStyle='#d5b379';c.lineWidth=4;for(let y=0;y<512;y+=128)for(let x=0;x<512;x+=128){c.beginPath();c.moveTo(x+64,y+14);c.lineTo(x+100,y+64);c.lineTo(x+64,y+114);c.lineTo(x+28,y+64);c.closePath();c.stroke();}}
 }
 const t=new T.CanvasTexture(canvas);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;cache.set(kind,t);return t;
}
export function applyCreatureTextures(body:T.Group){
 body.traverse(o=>{if(!(o instanceof T.Mesh)||!(o.material instanceof T.MeshStandardMaterial))return;const m=o.material;
  if(m.emissive.getHex()!==0&&m.emissiveIntensity>=1)return;
  if(m.userData.creatureSurface){setCreatureSurface(m,m.userData.creatureSurface as CreatureSurface);return;}
  if(m.map){m.color.setHex(0xffffff);const skin=[...cache].find(([,t])=>m.map===t)?.[0];const kind:CreatureSurface=skin==='BALLOONER'?'cloth':skin==='TOX MUNCHER'?'rubber':skin==='PUNI'||skin==='KING PUNI'?'gel':skin==='BOTTY'||skin==='SAMURAI'?'enamel':'metal';setCreatureSurface(m,kind);return;}
  const hsl=m.color.getHSL({h:0,s:0,l:0});if(hsl.l<.15){setCreatureSurface(m,'rubber');return;}
  const finish=hsl.s<.2&&hsl.l>.7?'ivory':hsl.h>.07&&hsl.h<.19?'metal':'rubber';m.map=finishTexture(finish);setCreatureSurface(m,finish==='metal'?'metal':finish==='ivory'?'enamel':'rubber');
 });
}
