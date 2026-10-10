import {sightAt} from '../world/layout';
import type {Game} from './Game';
import type {Enemy} from './Enemy';
export const nightmareRoles=['rush','anchor','flank','dislodge']as const;
export function bossPhase(hp:number,maxHp:number){return hp<=maxHp*.5?1:0;}
/** Keep tells already in progress, then rotate an elite / melee / ranged attack budget. */
export function nightmareAttackers(g:Game):Set<Enemy>{
 const candidates=g.enemies.filter(e=>e.alive&&e.brain.state!=='Idle'&&sightAt(e.group.position.x,e.group.position.z,e.floorY+e.baseScale,g.position.x,g.position.z,g.position.y,g.gate)&&Math.hypot(e.group.position.x-g.position.x,e.group.position.z-g.position.z,e.floorY-(g.position.y-1.65))<36);
 const distance=(e:Enemy)=>e.group.position.distanceTo(g.position),elite=(e:Enemy)=>e.kind==='KING PUNI'&&!e.group.userData.bossClone||e.kind==='SAMURAI';
 const pending=candidates.filter(e=>e.telegraph>0||e.dashUntil>g.time).sort((a,b)=>Number(elite(b))-Number(elite(a))||distance(a)-distance(b));const selected=new Set(pending.slice(0,3));
 for(const e of candidates.filter(elite).sort((a,b)=>distance(a)-distance(b)))if(selected.size<3)selected.add(e);
 const rotation=Math.floor(g.time/1.8),waiting=candidates.filter(e=>!selected.has(e)&&e.cooldown<=0).sort((a,b)=>distance(a)-distance(b));
 for(const ranged of [false,true,false]){if(selected.size>=3)break;const group=waiting.filter(e=>!selected.has(e)&&((!!e.group.userData.bossClone||['BOTTY','BALLOONER','TOX MUNCHER'].includes(e.kind))===ranged));if(group.length)selected.add(group[rotation%Math.min(3,group.length)]);}
 return selected;
}
export function nightmarePreferredRange(e:Enemy,attacking:boolean){return e.kind==='KING PUNI'?e.radius*e.baseScale+3.2:e.kind==='BOTTY'||e.kind==='BALLOONER'?10:e.kind==='TOX MUNCHER'?8:attacking?2.6:4.5;}
