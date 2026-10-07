import * as T from 'three';

type Mist={puffs:T.Mesh<T.PlaneGeometry,T.MeshBasicMaterial>[];offset:number;lastRecoil:number;surgeAt:number};
let texture:T.CanvasTexture|undefined;
function mistTexture(){
 if(!texture){const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d')!,gradient=c.createRadialGradient(32,32,2,32,32,30);gradient.addColorStop(0,'rgba(255,255,255,.8)');gradient.addColorStop(.4,'rgba(255,255,255,.45)');gradient.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gradient;c.fillRect(0,0,64,64);texture=new T.CanvasTexture(canvas);texture.userData.sharedSurface=true;}
 return texture;
}
/** Six small shared-texture wisps: no lights, full-screen veil, or per-frame allocation. */
export function addMurasameMist(group:T.Group,offset=0):Mist{
 const geometry=new T.PlaneGeometry(.48,.65),puffs:Mist['puffs']=[];
 for(let n=0;n<6;n++){const material=new T.MeshBasicMaterial({map:mistTexture(),color:n%2?0xb764ec:0x8a45c9,transparent:true,opacity:.1,depthWrite:false,side:T.DoubleSide,forceSinglePass:true,toneMapped:false});const puff=new T.Mesh(geometry,material);puff.name='murasame-wisp';puff.renderOrder=3;group.add(puff);puffs.push(puff);}
 const mist={puffs,offset,lastRecoil:0,surgeAt:-100};updateMurasameMist(mist,0,0);return mist;
}
export function updateMurasameMist(mist:Mist,time:number,recoil:number){
 if(recoil>mist.lastRecoil+.008)mist.surgeAt=time;mist.lastRecoil=recoil;
 const surge=Math.max(0,1-(time-mist.surgeAt)/.7);
 for(let n=0;n<mist.puffs.length;n++){const p=mist.puffs[n],phase=(time*.27+n/6)%1,angle=time*.8+n*2.4,height=.13+phase*1.65;
  p.position.set(-.025-height*height*.046+Math.sin(angle)*.16,height+mist.offset,.12+Math.cos(angle)*.05);p.rotation.set(0,Math.sin(angle)*.35,Math.sin(angle*.7)*.5);p.scale.setScalar(.75+phase*.8+surge*.3);p.material.opacity=Math.sin(phase*Math.PI)*(.5+surge*.16);
 }
}
