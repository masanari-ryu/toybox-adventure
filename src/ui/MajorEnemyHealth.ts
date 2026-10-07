import type {Game} from '../game/Game';
import {stages,makeLayout,type Stage} from '../stages/Stages';
import {doors} from '../world/Threats';
import {inBossArena} from '../game/CombatRules';
type MajorKind='KING PUNI'|'SAMURAI';
const rooms=new WeakMap<Stage,Map<MajorKind,Set<string>>>();
/** A room ends at its doors, regardless of whether those doors are currently open. */
function room(stage:Stage,kind:MajorKind){
 let cached=rooms.get(stage);if(!cached){cached=new Map();rooms.set(stage,cached);}const found=cached.get(kind);if(found)return found;
 const map=makeLayout(stage),closed=new Set(stage.doors.flatMap(d=>d.cells.map(([x,z])=>`${x},${z}`)));
 const spawn=kind==='SAMURAI'?stage.enemies.find(([k])=>k===kind):[kind,stage.boss.x,stage.boss.z];
 const cells=new Set<string>();cached.set(kind,cells);if(!spawn)return cells;
 const queue:[number,number][]=[[Math.floor(Number(spawn[1])/4),Math.floor(Number(spawn[2])/4)]];
 for(let n=0;n<queue.length;n++){const [x,z]=queue[n],key=`${x},${z}`;if(cells.has(key)||closed.has(key)||map[z]?.[x]!=='.')continue;cells.add(key);for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]])queue.push([x+dx,z+dz]);}
 return cells;
}
export function enteredMajorRoom(stageIndex:number,kind:MajorKind,x:number,z:number,feet:number){
 if(stageIndex===2&&kind==='KING PUNI')return inBossArena(x,z,feet);
 if(kind==='SAMURAI'&&stageIndex!==1||Math.abs(feet)>2)return false;
 return room(stages[stageIndex],kind).has(`${Math.floor(x/4)},${Math.floor(z/4)}`);
}
export function majorHealthTarget(g:Game){
 if(g.practice||g.ride)return undefined;
 for(const kind of ['SAMURAI','KING PUNI']as const){
  const e=g.enemies.find(e=>e.kind===kind&&e.alive);if(!e)continue;
  const unlocked=kind==='SAMURAI'?!!doors[5]?.open:g.gate;
  if(!unlocked)continue;
  if(enteredMajorRoom(g.stageIndex,kind,g.position.x,g.position.z,g.position.y-1.65))e.encountered=true;
  if(e.encountered&&Math.abs(g.position.y-1.65-e.floorY)<3&&Math.hypot(e.group.position.x-g.position.x,e.group.position.z-g.position.z)<34)return e;
 }
 return undefined;
}
