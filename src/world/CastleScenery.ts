import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {castleDecks,deckHeight,Deck} from './CastleFloors';
import {toySheet} from './ToyIllustration';
import {glow} from './Art';
function sign(text:string){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d')!;c.fillStyle='#163958';c.fillRect(0,0,512,128);c.strokeStyle='#ffe29c';c.lineWidth=10;c.strokeRect(6,6,500,116);c.fillStyle='#fff3cb';c.font='bold 40px sans-serif';c.textAlign='center';c.fillText(text,256,80);const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;return new T.Mesh(new T.PlaneGeometry(5,1.25),new T.MeshBasicMaterial({map:t,side:T.DoubleSide}));}
export function buildCastleFloors(group:T.Group){const map=toySheet('tile'),mat=new T.MeshStandardMaterial({map,color:0xb5d7df,metalness:.35,roughness:.42});const accent=new T.MeshStandardMaterial({color:0xe8c27f,metalness:.55,roughness:.3});
 for(const [n,d]of castleDecks.entries()){const dy=(d.endY??d.y)-d.y,length=d.axis==='x'?d.w:d.d,mid=d.y+dy/2;const slab=new T.Mesh(new RoundedBoxGeometry(d.axis==='x'?Math.hypot(d.w,dy):d.w,.35,d.axis==='z'?Math.hypot(d.d,dy):d.d,2,.07),mat);slab.position.set(d.x,mid-.2,d.z);if(d.axis==='x')slab.rotation.z=Math.atan2(dy,length);if(d.axis==='z')slab.rotation.x=-Math.atan2(dy,length);slab.receiveShadow=true;slab.castShadow=true;group.add(slab);
  // The narrow galleries remain open: falling returns to the first-floor courtyard.
  if(d.endY!==undefined){const along=d.axis==='x'?d.w:d.d;for(let s=0;s<=along;s++){for(const side of [-1,1]){const x=d.axis==='x'?d.x-d.w/2+s:d.x+side*(d.w/2-.12),z=d.axis==='z'?d.z-d.d/2+s:d.z+side*(d.d/2-.12),y=deckHeight(d,x,z);const bead=new T.Mesh(new T.SphereGeometry(.08,8,6),glow(0x8beddc));bead.position.set(x,y+.07,z);group.add(bead);}}}
  else if(n<7){const along=d.w>d.d?'x':'z',len=along==='x'?d.w:d.d;for(let s=2;s<len;s+=4){const x=along==='x'?d.x-d.w/2+s:d.x,z=along==='z'?d.z-d.d/2+s:d.z;const pillar=new T.Mesh(new T.CylinderGeometry(.26,.42,Math.max(.1,d.y-.3),10),accent);pillar.position.set(x,(d.y-.3)/2,z);group.add(pillar);}}
 }
 for(const [text,x,y,z]of [['2かいへ',30,2.5,57],['ほそい みち · ゆっくり',40,8.2,38],['3かいへ',65,8.5,32],['ボスの へや',90,16,30]]as const){const s=sign(text);s.position.set(x,y,z);group.add(s);}
 // Third-floor walls are taller than the gallery and leave a single boss/reward entrance.
 const wallMat=new T.MeshStandardMaterial({map:toySheet('armor'),color:0xc7bde8,roughness:.45,metalness:.25});const parts:[number,number,number,number][]=[[80,18.5,.5,21],[112,18,.5,20],[96,8,32,.5],[90,36,20,.5],[106,28,12,.5],[98,12,.5,8],[98,24,.5,8]];
 for(const [x,z,w,d]of parts){const m=new T.Mesh(new RoundedBoxGeometry(w,5,d,2,.1),wallMat);m.position.set(x,14.5,z);m.castShadow=true;m.receiveShadow=true;group.add(m);const strip=new T.Mesh(new T.BoxGeometry(w,.12,d),glow(0x86dedf));strip.position.set(x,16.8,z);group.add(strip);}
 for(const [x,z]of [[82,10],[96,10],[82,34],[96,34]]){const p=new T.Mesh(new T.CylinderGeometry(.45,.6,7,16),accent);p.position.set(x,15.5,z);group.add(p);const star=new T.Mesh(new T.OctahedronGeometry(.65),glow(0xffd886));star.position.set(x,19.3,z);group.add(star);}
 const moon=new T.Mesh(new T.SphereGeometry(1.4,24,16),glow(0xaee6ff));moon.position.set(90,19,9);group.add(moon);
}
