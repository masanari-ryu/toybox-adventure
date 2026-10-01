import * as T from 'three';
const cache=new Map<string,T.CanvasTexture>();
/** Original painted enamel, vents, seams and reflective glass sheets. */
export function trainTexture(kind:'body'|'roof'|'window'|'wheel'|'battery'){
 const existing=cache.get(kind);if(existing)return existing;
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const c=canvas.getContext('2d')!;
 const colors={body:['#247da5','#0b335f'],roof:['#2d537b','#142b49'],window:['#112b49','#57ddec'],wheel:['#203349','#07192b'],battery:['#8aefac','#267d74']}[kind];
 const gradient=c.createLinearGradient(0,0,0,512);gradient.addColorStop(0,colors[0]);gradient.addColorStop(.55,colors[1]);gradient.addColorStop(1,colors[0]);c.fillStyle=gradient;c.fillRect(0,0,1024,512);
 if(kind==='body'){
  c.fillStyle='#ffe19a';c.beginPath();c.moveTo(0,265);c.lineTo(720,265);c.lineTo(850,190);c.lineTo(1024,190);c.lineTo(1024,248);c.lineTo(870,248);c.lineTo(740,323);c.lineTo(0,323);c.fill();
  c.fillStyle='#71f4ed';c.fillRect(0,336,1024,12);
  for(let x=32;x<1024;x+=192){c.strokeStyle='#061d3b';c.lineWidth=4;c.strokeRect(x,30,160,420);c.strokeStyle='#9bc3d4';c.lineWidth=2;c.strokeRect(x+4,34,152,412);for(const y of [48,430]){c.fillStyle='#cce9e9';c.beginPath();c.arc(x+14,y,5,0,Math.PI*2);c.fill();}}
  c.fillStyle='#071e36';for(let n=0;n<12;n++)c.fillRect(40+n*16,370,8,42);
  c.fillStyle='#ffdc75';c.beginPath();for(let n=0;n<10;n++){const r=n%2?22:50,x=510+Math.cos(-Math.PI/2+n*Math.PI/5)*r,y=138+Math.sin(-Math.PI/2+n*Math.PI/5)*r;n?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.fill();
 }else if(kind==='window'){
  c.fillStyle='rgba(215,254,255,.38)';for(const x of [-250,170,610]){c.beginPath();c.moveTo(x,0);c.lineTo(x+100,0);c.lineTo(x+440,512);c.lineTo(x+340,512);c.fill();}c.strokeStyle='#83dce6';c.lineWidth=16;c.strokeRect(12,12,1000,488);c.fillStyle='#fff9d9';c.fillRect(40,460,170,9);
 }else if(kind==='wheel'){
  c.strokeStyle='#516e87';c.lineWidth=12;for(let x=0;x<1024;x+=64){c.beginPath();c.moveTo(x,0);c.lineTo(x+96,512);c.stroke();}
 }else if(kind==='roof'){
  for(let x=40;x<1024;x+=100){c.fillStyle='#081c31';c.fillRect(x,45,18,422);c.fillStyle='#6083a0';c.fillRect(x+19,45,3,422);}c.fillStyle='#ffe2a0';c.fillRect(0,20,1024,12);
 }else{c.fillStyle='#163b52';c.fillRect(80,90,864,330);c.fillStyle='#98ffd5';for(let x=115;x<920;x+=135)c.fillRect(x,124,100,262);}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;cache.set(kind,texture);return texture;
}
