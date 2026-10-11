import type {Game} from './Game';
import type {Enemy} from './Enemy';
import {sightAt} from '../world/layout';
/** Only easy receives these safety margins; other difficulty and equipment values stay intact. */
export const easySettings={opening:4,speed:.75,damage:.65,hitGap:.95,meleeCadence:1.5,rangedCadence:1.4,warning:1.25,attackers:2,potion:40,bigPotion:80,healingGrace:1.2} as const;
export function beginEasyOpening(g:Game){
 if(g.challenge!==0||g.stageIndex!==0||g.practice||g.ride)return;
 for(const e of g.enemies)if(e.alive&&!['KING PUNI','SAMURAI'].includes(e.kind)){e.group.userData.easyWakeAt=g.stageTime+easySettings.opening;e.group.visible=false;}
}
export function easyDormant(e:Enemy){return e.group.userData?.easyWakeAt!==undefined;}
export function wakeEasyEnemy(g:Game,e:Enemy){
 if(!easyDormant(e))return true;
 if(g.stageTime<e.group.userData.easyWakeAt)return false;
 delete e.group.userData.easyWakeAt;e.group.visible=true;e.cooldown=Math.max(e.cooldown,1.5);return true;
}
export function easyBodySpace(e:Enemy){return Math.max(2.8,e.radius*e.baseScale+1.9);}
export function easyAttackers(g:Game){
 return new Set(g.enemies.filter(e=>e.alive&&!easyDormant(e)&&e.brain.state!=='Idle'&&(Math.abs(e.floorY-(g.position.y-1.65))<2||['BOTTY','BALLOONER','TOX MUNCHER'].includes(e.kind))&&Math.hypot(e.group.position.x-g.position.x,e.group.position.z-g.position.z)<24&&sightAt(e.group.position.x,e.group.position.z,e.group.position.y+e.baseScale,g.position.x,g.position.z,g.position.y,g.gate)).sort((a,b)=>Number(b.kind==='KING PUNI')-Number(a.kind==='KING PUNI')||a.group.position.distanceToSquared(g.position)-b.group.position.distanceToSquared(g.position)).slice(0,easySettings.attackers));
}
/** Retreat a little when crowded rather than putting a huge body inside the camera. */
export function separateEasyEnemy(g:Game,e:Enemy,dt:number,walk:(x:number,z:number)=>boolean){
 if(g.challenge!==0||['KING PUNI','SAMURAI'].includes(e.kind)||Math.abs(e.floorY-(g.position.y-1.65))>2)return;
 const p=e.group.position,dx=p.x-g.position.x,dz=p.z-g.position.z,d=Math.hypot(dx,dz),space=easyBodySpace(e);if(d>=space)return;
 const angle=d>.01?Math.atan2(dz,dx):Math.atan2(e.home.z-g.position.z,e.home.x-g.position.x),step=Math.min(space-d,dt*4);
 const x=p.x+Math.cos(angle)*step,z=p.z+Math.sin(angle)*step;if(walk(x,z)){p.x=x;p.z=z;}
}
