import type {Stage} from '../stages/Stages';
import {makeLayout} from '../stages/Stages';
export const challenges=[
 {name:'やさしい',count:1,hp:1},
 {name:'ふつう',count:1.5,hp:1.3},
 {name:'むずかしい',count:2,hp:1.5},
 {name:'あくむ',count:2.5,hp:2},
]as const;
export const unlockKey='toybox-nightmare-unlocked';
export function nightmareUnlocked(){try{return localStorage.getItem(unlockKey)==='1';}catch{return false;}}
export function unlockNightmare(){try{localStorage.setItem(unlockKey,'1');return true;}catch{return false;}}
/** Keep unique bosses, and spread extra regular enemies within their original room. */
export function challengeSpawns(stage:Stage,level:number):Stage['enemies']{
 const base=stage.enemies,regular=base.filter(([kind])=>kind!=='KING PUNI'&&kind!=='SAMURAI');
 const extra=Math.ceil(regular.length*challenges[level].count)-regular.length;
 const result=base.map(p=>[...p]as Stage['enemies'][number]);const layout=makeLayout(stage);
 const safe=(x:number,z:number)=>layout[Math.floor(z/4)]?.[Math.floor(x/4)]==='.';
 for(let n=0;n<extra;n++){
  const [kind,x,z,yaw]=regular[n%regular.length];let best:[number,number]|undefined;
  // Deterministic placement, clear of walls, doors, the entrance and existing bodies.
  for(let attempt=0;attempt<120;attempt++){
   const angle=(attempt+n*17)*2.399963,r=1.8+(attempt%8)*.48;
   const nx=x+Math.cos(angle)*r,nz=z+Math.sin(angle)*r;
   if(Math.hypot(nx-stage.start[0],nz-stage.start[1])<14)continue;
   if(![[0,0],[.75,0],[-.75,0],[0,.75],[0,-.75]].every(([a,b])=>safe(nx+a,nz+b)))continue;
   if(stage.doors.some(d=>Math.hypot(d.x-nx,d.z-nz)<2))continue;
   if(result.some(([,a,b])=>Math.hypot(a-nx,b-nz)<1.7))continue;
   let clear=true;for(let t=0;t<=1;t+=.1)if(!safe(x+(nx-x)*t,z+(nz-z)*t)){clear=false;break;}
   if(clear){best=[nx,nz];break;}
  }
  if(!best)throw new Error(`No safe reinforcement position: ${stage.name} ${n}`);
  result.push([kind,...best,yaw]);
 }
 return result;
}
/** Scale supplies only; keys, batteries and weapon rewards stay unique. */
export function challengeItems(stage:Stage,level:number):Stage['items']{
 const multiplier=[1,1.5,2,2][level],supplies=new Set(['POTION','BIG POTION','ANTIDOTE','LAVA CHARM','ARMOR CELL','AMMO CELL','CANDY','RAINBOW']);
 const base=stage.items.filter(([kind])=>supplies.has(kind)),result=stage.items.map(i=>[...i] as Stage['items'][number]),layout=makeLayout(stage);
 const safe=(x:number,z:number)=>layout[Math.floor(z/4)]?.[Math.floor(x/4)]==='.';
 for(let n=0;n<Math.ceil(base.length*multiplier)-base.length;n++){
  const [kind,x,z,color]=base[n%base.length];let placed=false;
  for(let a=0;a<160;a++){const angle=(a+n*13)*2.399963,r=1.5+(a%10)*.3,nx=x+Math.cos(angle)*r,nz=z+Math.sin(angle)*r;
   if(![[0,0],[.5,0],[-.5,0],[0,.5],[0,-.5]].every(([dx,dz])=>safe(nx+dx,nz+dz)))continue;
   if(stage.doors.some(d=>Math.hypot(nx-d.x,nz-d.z)<1.6)||stage.switches.some(s=>Math.hypot(nx-s.x,nz-s.z)<1.4)||result.some(([,ix,iz])=>Math.hypot(nx-ix,nz-iz)<1.4))continue;
   if([...stage.pools,...stage.lava].some(p=>Math.abs(nx-p.x)<p.rx+.8&&Math.abs(nz-p.z)<p.rz+.8))continue;
   if(Array.from({length:11},(_,i)=>i/10).some(t=>!safe(x+(nx-x)*t,z+(nz-z)*t)))continue;
   result.push([kind,nx,nz,color]);placed=true;break;
  }
  if(!placed)throw new Error(`No safe supply position: ${stage.name} ${kind}`);
 }
 return result;
}
