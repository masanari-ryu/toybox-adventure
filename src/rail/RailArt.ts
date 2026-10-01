import * as T from 'three';
const railMaps=new Map<string,T.CanvasTexture>();
/** Painted, original texture sheets shared by the rail scenery. */
export function railTexture(kind:'meadow'|'planet'|'metal'|'sky',night=false){
 const key=kind+'/'+night;if(railMaps.has(key))return railMaps.get(key)!;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const c=canvas.getContext('2d')!;
 let seed=71;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const gradient=c.createLinearGradient(0,0,0,1024);gradient.addColorStop(0,kind==='sky'?(night?'#060f36':'#208cd5'):kind==='planet'?'#8065ba':kind==='meadow'?'#6ea747':'#237fb7');gradient.addColorStop(1,kind==='sky'?(night?'#7159a2':'#daf6ff'):kind==='planet'?'#e8bcca':kind==='meadow'?'#badd70':'#92dfff');c.fillStyle=gradient;c.fillRect(0,0,1024,1024);
 if(kind==='sky'){
  for(let n=0;n<(night?950:55);n++){const x=random()*1024,y=random()*850,r=night?random()*2+ .5:random()*55+20;const glow=c.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,night?'rgba(230,244,255,.95)':'rgba(255,255,255,.8)');glow.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=glow;c.fillRect(x-r,y-r,r*2,r*2);}
  if(night){for(let n=0;n<18;n++){const x=random()*1024,y=random()*700;const glow=c.createRadialGradient(x,y,0,x,y,180);glow.addColorStop(0,'rgba(154,89,222,.16)');glow.addColorStop(1,'rgba(90,150,255,0)');c.fillStyle=glow;c.fillRect(x-180,y-180,360,360);}}
 }else if(kind==='planet'){
  for(let y=0;y<1024;y+=12){c.fillStyle=`rgba(${random()>.5?'255,209,173':'74,76,150'},${.08+random()*.2})`;c.beginPath();c.moveTo(0,y);for(let x=0;x<=1024;x+=16)c.lineTo(x,y+Math.sin(x*.013+y*.018)*18);c.lineTo(1024,y+22);c.lineTo(0,y+22);c.fill();}
 }else if(kind==='meadow'){
  for(let n=0;n<6500;n++){const x=random()*1024,y=random()*1024;c.strokeStyle=random()>.5?'#598839':'#d2e899';c.lineWidth=1+random()*2;c.beginPath();c.moveTo(x,y);c.lineTo(x+random()*7-3,y-4-random()*9);c.stroke();}for(let n=0;n<160;n++){const x=random()*1024,y=random()*1024;c.fillStyle=n%2?'#fff3bc':'#f5b6d4';for(let a=0;a<5;a++){c.beginPath();c.arc(x+Math.cos(a*1.256)*3,y+Math.sin(a*1.256)*3,2.8,0,Math.PI*2);c.fill();}}
 }else{for(let y=0;y<1024;y+=128){c.fillStyle='#155584';c.fillRect(0,y,1024,5);for(let x=32;x<1024;x+=128){c.fillStyle='#d7f5ff';c.beginPath();c.arc(x,y+18,5,0,Math.PI*2);c.fill();}}}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;railMaps.set(key,texture);return texture;
}
